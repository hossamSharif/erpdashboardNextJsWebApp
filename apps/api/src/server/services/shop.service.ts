import { PrismaClient, Shop, User } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import {
  CreateShopInput,
  UpdateShopInput,
  ShopListInput,
  SHOP_ERRORS
} from '@multi-shop/shared';
import { AccountGenerationService } from './account-generation.service';

const prisma = new PrismaClient();

export class ShopService {
  static async validateUniqueCode(code: string, excludeId?: string): Promise<void> {
    const existingShop = await prisma.shop.findFirst({
      where: {
        code,
        ...(excludeId && { id: { not: excludeId } })
      }
    });

    if (existingShop) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: SHOP_ERRORS.DUPLICATE_CODE.message,
        cause: SHOP_ERRORS.DUPLICATE_CODE
      });
    }
  }

  static async validateUniqueNames(nameAr: string, nameEn: string, excludeId?: string): Promise<void> {
    const existingShop = await prisma.shop.findFirst({
      where: {
        OR: [
          { nameAr },
          { nameEn }
        ],
        ...(excludeId && { id: { not: excludeId } })
      }
    });

    if (existingShop) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: SHOP_ERRORS.DUPLICATE_NAME.message,
        cause: SHOP_ERRORS.DUPLICATE_NAME
      });
    }
  }

  static async createShop(input: CreateShopInput, ownerId: string): Promise<Shop> {
    const { nameAr, nameEn, code, assignedUserIds } = input;

    // Validate unique constraints
    await this.validateUniqueCode(code);
    await this.validateUniqueNames(nameAr, nameEn);

    // Create shop in transaction
    const shop = await prisma.$transaction(async (tx) => {
      // Create the shop
      const newShop = await tx.shop.create({
        data: {
          nameAr,
          nameEn,
          code,
          ownerId
        }
      });

      // Assign users to shop if provided
      if (assignedUserIds && assignedUserIds.length > 0) {
        await tx.user.updateMany({
          where: {
            id: { in: assignedUserIds }
          },
          data: {
            shopId: newShop.id
          }
        });
      }

      return newShop;
    });

    // Create default accounts for the shop
    await AccountGenerationService.createDefaultAccountsForShop(shop.id, shop.code);

    return shop;
  }

  static async getShopById(id: string): Promise<Shop | null> {
    return prisma.shop.findUnique({
      where: { id }
    });
  }

  static async getShopWithUsers(id: string) {
    return prisma.shop.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  static async listShops(input: ShopListInput, userId: string, userRole: string) {
    const { search, includeInactive, limit, offset } = input;

    const where: any = {
      ...(userRole !== 'ADMIN' && { ownerId: userId }),
      ...(search && {
        OR: [
          { nameAr: { contains: search, mode: 'insensitive' } },
          { nameEn: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(includeInactive ? {} : { isActive: true })
    };

    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: [
          { isActive: 'desc' },
          { nameEn: 'asc' }
        ],
        take: limit,
        skip: offset
      }),
      prisma.shop.count({ where })
    ]);

    return { shops, total };
  }

  static async updateShop(input: UpdateShopInput): Promise<Shop> {
    const { id, nameAr, nameEn, code, isActive } = input;

    // Check if shop exists
    const existingShop = await prisma.shop.findUnique({
      where: { id }
    });

    if (!existingShop) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: SHOP_ERRORS.NOT_FOUND.message,
        cause: SHOP_ERRORS.NOT_FOUND
      });
    }

    // Validate unique constraints if values are being updated
    if (code && code !== existingShop.code) {
      await this.validateUniqueCode(code, id);
    }

    if ((nameAr && nameAr !== existingShop.nameAr) ||
        (nameEn && nameEn !== existingShop.nameEn)) {
      await this.validateUniqueNames(
        nameAr || existingShop.nameAr,
        nameEn || existingShop.nameEn,
        id
      );
    }

    return prisma.shop.update({
      where: { id },
      data: {
        ...(nameAr && { nameAr }),
        ...(nameEn && { nameEn }),
        ...(code && { code }),
        ...(typeof isActive === 'boolean' && { isActive })
      }
    });
  }

  static async softDeleteShop(id: string): Promise<Shop> {
    // Check if shop exists
    const existingShop = await prisma.shop.findUnique({
      where: { id }
    });

    if (!existingShop) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: SHOP_ERRORS.NOT_FOUND.message,
        cause: SHOP_ERRORS.NOT_FOUND
      });
    }

    return prisma.shop.update({
      where: { id },
      data: { isActive: false }
    });
  }

  static async validateShopOwnership(shopId: string, userId: string): Promise<void> {
    const shop = await prisma.shop.findFirst({
      where: {
        id: shopId,
        ownerId: userId
      }
    });

    if (!shop) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: SHOP_ERRORS.UNAUTHORIZED.message,
        cause: SHOP_ERRORS.UNAUTHORIZED
      });
    }
  }
}