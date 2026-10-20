/**
 * ============================================================================
 * FILE: src/services/authApiService.ts
 * PURPOSE: Step-by-step, easy-to-read API functions that communicate with our
 *          NestJS backend (http://localhost:3000/api/auth).
 * ============================================================================
 */

import type {
  AuthSuccessResponse,
  LoginCredentials,
  RegisterStaffInput,
  UserRole,
} from '../types/auth.types';

const BASE_API_URL =
  import.meta.env.VITE_API_URL ?? 'http://10.231.84.70:3000/api';
const BACKEND_AUTH_BASE_URL = `${BASE_API_URL}/auth`;
const ACCESS_TOKEN_STORAGE_KEY = 'lg_water_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'lg_water_refresh_token';

/**
 * Saves the JWT Access Token and Refresh Token into browser localStorage
 */
export function saveTokensToStorage(
  accessToken: string,
  refreshToken: string,
): void {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
}

/**
 * Reads the saved Access Token from browser localStorage
 */
export function getSavedAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

/**
 * Reads the saved Refresh Token from browser localStorage
 */
export function getSavedRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

/**
 * Clears both tokens from browser localStorage on logout
 */
export function clearSavedTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

/**
 * 1. Log in with Phone Number and Password
 *    Calls POST http://localhost:3000/api/auth/login
 */
export async function loginWithPhoneAndPassword(
  credentials: LoginCredentials,
): Promise<AuthSuccessResponse> {
  const response = await fetch(`${BACKEND_AUTH_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      phoneNumber: credentials.phoneNumber,
      password: credentials.password,
    }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorMessage =
      responseData.message || 'Failed to log in. Please check your credentials.';
    throw new Error(errorMessage);
  }

  saveTokensToStorage(responseData.accessToken, responseData.refreshToken);
  return responseData as AuthSuccessResponse;
}

/**
 * 2. Ideathon 1-Click Demo Role Switcher
 *    Calls POST http://localhost:3000/api/auth/demo-switch
 */
export async function switchDemoRoleOnBackend(
  targetRole: UserRole,
): Promise<AuthSuccessResponse> {
  const response = await fetch(`${BACKEND_AUTH_BASE_URL}/demo-switch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      role: targetRole,
    }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorMessage =
      responseData.message || `Failed to switch to demo role: ${targetRole}`;
    throw new Error(errorMessage);
  }

  saveTokensToStorage(responseData.accessToken, responseData.refreshToken);
  return responseData as AuthSuccessResponse;
}

/**
 * 3. Fetch Current Logged-In User Profile (/api/auth/me)
 *    Calls GET http://localhost:3000/api/auth/me
 */
export async function fetchCurrentUserProfile(): Promise<AuthSuccessResponse> {
  const accessToken = getSavedAccessToken();

  if (!accessToken) {
    throw new Error('No saved access token found.');
  }

  const response = await fetch(`${BACKEND_AUTH_BASE_URL}/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Session expired.');
  }

  return responseData as AuthSuccessResponse;
}

/**
 * 4. Provision a New Staff Account (RIDER or OPERATOR)
 *    Calls POST http://localhost:3000/api/auth/register/staff
 *    Restricted to logged-in Station Operators (@Roles('OPERATOR'))
 */
export async function registerNewStaffMember(
  staffInput: RegisterStaffInput,
): Promise<{ message: string }> {
  const accessToken = getSavedAccessToken();

  if (!accessToken) {
    throw new Error('You must be logged in as an Operator to register staff.');
  }

  const response = await fetch(`${BACKEND_AUTH_BASE_URL}/register/staff`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
    body: JSON.stringify(staffInput),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorMessage = Array.isArray(responseData.message)
      ? responseData.message.join(', ')
      : responseData.message || 'Failed to create staff account.';
    throw new Error(errorMessage);
  }

  return responseData;
}

/**
 * 5. Verify Operator-Only RBAC Middleware & Guard on Backend
 *    Calls GET http://localhost:3000/api/auth/verify/operator-only
 */
export async function verifyOperatorAccessOnBackend(): Promise<{
  access: string;
  role: string;
  message: string;
}> {
  const accessToken = getSavedAccessToken();

  const response = await fetch(
    `${BACKEND_AUTH_BASE_URL}/verify/operator-only`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken ?? ''}`,
      },
      credentials: 'include',
    },
  );

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(
      responseData.message || 'Access denied by NestJS RolesGuard.',
    );
  }

  return responseData;
}

/**
 * 6. Log Out & Revoke Refresh Token in PostgreSQL
 *    Calls POST http://localhost:3000/api/auth/logout
 */
export async function logoutFromBackend(): Promise<void> {
  const accessToken = getSavedAccessToken();

  try {
    if (accessToken) {
      await fetch(`${BACKEND_AUTH_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({}),
      });
    }
  } finally {
    clearSavedTokens();
  }
}
