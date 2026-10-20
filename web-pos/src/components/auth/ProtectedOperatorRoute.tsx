/**
 * ============================================================================
 * FILE: src/components/auth/ProtectedOperatorRoute.tsx
 * PURPOSE: Route Guard Component using react-router-dom.
 *          1. If the user is NOT logged in -> redirects to "/login"
 *          2. If the user IS logged in, but their role is RIDER or CUSTOMER ->
 *             redirects to "/unauthorized" (enforcing Operator-only POS access)
 *          3. If the user is an authenticated OPERATOR -> renders the route!
 * ============================================================================
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import type { UserAccount } from '../../types/auth.types';

interface ProtectedOperatorRouteProps {
  currentUser: UserAccount | null;
  children: React.ReactNode;
}

export function ProtectedOperatorRoute(props: ProtectedOperatorRouteProps) {
  // 1. Not logged in at all -> Redirect to /login
  if (props.currentUser === null) {
    return <Navigate to="/login" replace />;
  }

  // 2. Logged in as RIDER or CUSTOMER -> Redirect to /unauthorized
  if (props.currentUser.role !== 'OPERATOR') {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Authorized Station Operator -> Render the requested POS page
  return <>{props.children}</>;
}
