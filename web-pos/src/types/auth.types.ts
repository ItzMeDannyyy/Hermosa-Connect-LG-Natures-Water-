/**
 * ============================================================================
 * FILE: src/types/auth.types.ts
 * PURPOSE: Clear, readable TypeScript interfaces for Users, Station Branches,
 *          Container Presets, and Authentication API responses.
 * ============================================================================
 */

export type UserRole = 'CUSTOMER' | 'RIDER' | 'OPERATOR';

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
  waterCost: string;
  electricityCost: string;
  containerWearCost: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  defaultPresetId: string | null;
  defaultOrderQty: number;
  deliveryAddress: string;
  latitude: number;
  longitude: number;
  emptyContainersHeld: number;
  runningUnpaidBalance: string;
  containersDueBackDate: string | null;
}

export interface AuthSuccessResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserAccount;
  branch: StationBranch | null;
  customerProfile: CustomerProfile | null;
  defaultPreset: ContainerPreset | null;
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
