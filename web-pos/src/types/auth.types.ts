/**
 * ============================================================================
 * FILE: src/types/auth.types.ts
 * PURPOSE: Clear, readable TypeScript interfaces for Users, Station Branches,
 *          Container Presets, and Authentication API responses.
 * ============================================================================
 */

export type UserRole = 'RIDER' | 'OPERATOR';

export interface UserAccount {
  id: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  branchId: string | null;
  createdAt: string;
}

export interface StationBranch {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  deliveryFee: string;
  createdAt: string;
}

export interface ContainerPreset {
  id: string;
  branchId: string;
  name: string;
  refillPrice: string;
}

export interface AuthSuccessResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserAccount;
  branch: StationBranch | null;
  defaultPreset?: ContainerPreset | null;
}

export interface LoginCredentials {
  phoneNumber: string;
  password: string;
}

export interface RegisterStaffInput {
  fullName: string;
  phoneNumber: string;
  password: string;
  role: 'RIDER' | 'OPERATOR';
}
