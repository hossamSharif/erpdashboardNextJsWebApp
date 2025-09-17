export interface Shop {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateShopInput {
  nameAr: string;
  nameEn: string;
  code: string;
  assignedUserIds?: string[];
}

export interface UpdateShopInput {
  id: string;
  nameAr?: string;
  nameEn?: string;
  code?: string;
  isActive?: boolean;
}

export interface ShopWithUsers extends Shop {
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
  }[];
}

export interface ShopListResponse {
  shops: ShopWithUsers[];
  total: number;
}

export const SHOP_CONSTANTS = {
  CODE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 10,
    PATTERN: /^[A-Z0-9_-]+$/
  },
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100
  }
} as const;

export const SHOP_ERRORS = {
  DUPLICATE_CODE: {
    code: 'SHOP_DUPLICATE_CODE',
    message: 'Shop code already exists'
  },
  DUPLICATE_NAME: {
    code: 'SHOP_DUPLICATE_NAME',
    message: 'Shop name already exists'
  },
  NOT_FOUND: {
    code: 'SHOP_NOT_FOUND',
    message: 'Shop not found'
  },
  INVALID_CODE: {
    code: 'SHOP_INVALID_CODE',
    message: 'Shop code must contain only uppercase letters, numbers, underscores and hyphens'
  },
  UNAUTHORIZED: {
    code: 'SHOP_UNAUTHORIZED',
    message: 'Not authorized to perform this action'
  }
} as const;