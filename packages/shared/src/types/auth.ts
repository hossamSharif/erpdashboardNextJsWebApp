export interface User {
  id: string;
  email: string;
  nameAr: string;
  nameEn: string;
  role: UserRole;
  shopId: string | null;
  isActive: boolean;
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface Shop {
  id: string;
  nameAr: string;
  nameEn: string;
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: User;
  shop?: Shop;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  shopId?: string;
}

export interface AuthResponse {
  user: User;
  shop?: Shop;
  token: string;
}

export interface AuthError {
  code: string;
  message: string;
  messageAr: string;
}