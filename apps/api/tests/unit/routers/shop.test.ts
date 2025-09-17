import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { TRPCError } from '@trpc/server';
import { ShopService } from '../../../src/server/services/shop.service';
import { shopRouter } from '../../../src/server/routers/shop';
import { UserRole } from '@multi-shop/shared';

// Mock the ShopService
jest.mock('../../../src/server/services/shop.service');
const mockShopService = ShopService as jest.Mocked<typeof ShopService>;

// Mock context
const createMockContext = (userRole: UserRole = UserRole.ADMIN, userId = 'user-1') => ({
  user: {
    id: userId,
    role: userRole,
    shopId: userRole === UserRole.USER ? 'shop-1' : undefined,
    isActive: true
  },
  session: { user: {} },
  req: {},
  res: {}
});

describe('Shop Router', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a shop successfully for admin', async () => {
      const mockShop = {
        id: 'shop-1',
        nameAr: 'متجر الإلكترونيات',
        nameEn: 'Electronics Store',
        code: 'ELEC',
        ownerId: 'user-1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockShopService.createShop.mockResolvedValue(mockShop);

      const ctx = createMockContext(UserRole.ADMIN);
      const input = {
        nameAr: 'متجر الإلكترونيات',
        nameEn: 'Electronics Store',
        code: 'ELEC'
      };

      const result = await shopRouter
        .createCaller(ctx)
        .create(input);

      expect(result.shop).toEqual(mockShop);
      expect(result.message).toBe('Shop created successfully');
      expect(mockShopService.createShop).toHaveBeenCalledWith(input, 'user-1');
    });

    it('should handle duplicate shop code error', async () => {
      mockShopService.createShop.mockRejectedValue(
        new TRPCError({
          code: 'CONFLICT',
          message: 'Shop code already exists'
        })
      );

      const ctx = createMockContext(UserRole.ADMIN);
      const input = {
        nameAr: 'متجر الإلكترونيات',
        nameEn: 'Electronics Store',
        code: 'ELEC'
      };

      await expect(
        shopRouter.createCaller(ctx).create(input)
      ).rejects.toThrow('Shop code already exists');
    });
  });

  describe('list', () => {
    it('should return shops for admin user', async () => {
      const mockResult = {
        shops: [
          {
            id: 'shop-1',
            nameAr: 'متجر الإلكترونيات',
            nameEn: 'Electronics Store',
            code: 'ELEC',
            ownerId: 'user-1',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            users: []
          }
        ],
        total: 1
      };

      mockShopService.listShops.mockResolvedValue(mockResult);

      const ctx = createMockContext(UserRole.ADMIN);
      const input = {
        search: '',
        includeInactive: false,
        limit: 20,
        offset: 0
      };

      const result = await shopRouter
        .createCaller(ctx)
        .list(input);

      expect(result).toEqual(mockResult);
      expect(mockShopService.listShops).toHaveBeenCalledWith(
        input,
        'user-1',
        UserRole.ADMIN
      );
    });
  });

  describe('getById', () => {
    it('should return shop for valid access', async () => {
      const mockShop = {
        id: 'shop-1',
        nameAr: 'متجر الإلكترونيات',
        nameEn: 'Electronics Store',
        code: 'ELEC',
        ownerId: 'user-1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        users: []
      };

      mockShopService.validateShopOwnership.mockResolvedValue();
      mockShopService.getShopWithUsers.mockResolvedValue(mockShop);

      const ctx = createMockContext(UserRole.ADMIN);
      const input = { id: 'shop-1' };

      const result = await shopRouter
        .createCaller(ctx)
        .getById(input);

      expect(result).toEqual(mockShop);
    });

    it('should deny access for user trying to access different shop', async () => {
      const ctx = createMockContext(UserRole.USER, 'user-1');
      ctx.user.shopId = 'shop-2'; // User belongs to different shop

      const input = { id: 'shop-1' };

      await expect(
        shopRouter.createCaller(ctx).getById(input)
      ).rejects.toThrow('Access denied to this shop');
    });
  });

  describe('update', () => {
    it('should update shop successfully', async () => {
      const mockShop = {
        id: 'shop-1',
        nameAr: 'متجر الإلكترونيات المحدث',
        nameEn: 'Updated Electronics Store',
        code: 'ELEC',
        ownerId: 'user-1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockShopService.validateShopOwnership.mockResolvedValue();
      mockShopService.updateShop.mockResolvedValue(mockShop);

      const ctx = createMockContext(UserRole.ADMIN);
      const input = {
        id: 'shop-1',
        nameAr: 'متجر الإلكترونيات المحدث',
        nameEn: 'Updated Electronics Store'
      };

      const result = await shopRouter
        .createCaller(ctx)
        .update(input);

      expect(result.shop).toEqual(mockShop);
      expect(result.message).toBe('Shop updated successfully');
    });
  });

  describe('softDelete', () => {
    it('should soft delete shop successfully', async () => {
      const mockShop = {
        id: 'shop-1',
        nameAr: 'متجر الإلكترونيات',
        nameEn: 'Electronics Store',
        code: 'ELEC',
        ownerId: 'user-1',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockShopService.validateShopOwnership.mockResolvedValue();
      mockShopService.softDeleteShop.mockResolvedValue(mockShop);

      const ctx = createMockContext(UserRole.ADMIN);
      const input = { id: 'shop-1' };

      const result = await shopRouter
        .createCaller(ctx)
        .softDelete(input);

      expect(result.shop).toEqual(mockShop);
      expect(result.message).toBe('Shop deactivated successfully');
    });
  });

  describe('toggleStatus', () => {
    it('should toggle shop status successfully', async () => {
      const mockShop = {
        id: 'shop-1',
        nameAr: 'متجر الإلكترونيات',
        nameEn: 'Electronics Store',
        code: 'ELEC',
        ownerId: 'user-1',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockShopService.validateShopOwnership.mockResolvedValue();
      mockShopService.updateShop.mockResolvedValue(mockShop);

      const ctx = createMockContext(UserRole.ADMIN);
      const input = { id: 'shop-1', isActive: false };

      const result = await shopRouter
        .createCaller(ctx)
        .toggleStatus(input);

      expect(result.shop).toEqual(mockShop);
      expect(result.message).toBe('Shop deactivated successfully');
    });
  });

  describe('checkCodeAvailability', () => {
    it('should return available true for unique code', async () => {
      mockShopService.validateUniqueCode.mockResolvedValue();

      const ctx = createMockContext(UserRole.ADMIN);
      const input = { code: 'NEWCODE' };

      const result = await shopRouter
        .createCaller(ctx)
        .checkCodeAvailability(input);

      expect(result.available).toBe(true);
    });

    it('should return available false for duplicate code', async () => {
      mockShopService.validateUniqueCode.mockRejectedValue(
        new TRPCError({ code: 'CONFLICT', message: 'Code exists' })
      );

      const ctx = createMockContext(UserRole.ADMIN);
      const input = { code: 'EXISTINGCODE' };

      const result = await shopRouter
        .createCaller(ctx)
        .checkCodeAvailability(input);

      expect(result.available).toBe(false);
    });
  });

  describe('checkNameAvailability', () => {
    it('should return available true for unique names', async () => {
      mockShopService.validateUniqueNames.mockResolvedValue();

      const ctx = createMockContext(UserRole.ADMIN);
      const input = { nameAr: 'اسم جديد', nameEn: 'New Name' };

      const result = await shopRouter
        .createCaller(ctx)
        .checkNameAvailability(input);

      expect(result.available).toBe(true);
    });

    it('should return available false for duplicate names', async () => {
      mockShopService.validateUniqueNames.mockRejectedValue(
        new TRPCError({ code: 'CONFLICT', message: 'Name exists' })
      );

      const ctx = createMockContext(UserRole.ADMIN);
      const input = { nameAr: 'اسم موجود', nameEn: 'Existing Name' };

      const result = await shopRouter
        .createCaller(ctx)
        .checkNameAvailability(input);

      expect(result.available).toBe(false);
    });
  });
});