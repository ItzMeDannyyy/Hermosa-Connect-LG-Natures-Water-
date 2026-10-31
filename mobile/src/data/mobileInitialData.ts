/**
 * ============================================================================
 * FILE: src/data/mobileInitialData.ts
 * PURPOSE: Initial state and calculation helpers for the LG Nature's Water
 *          Rider Mobile App.
 * ============================================================================
 */

import type {
  MobileOrderItem,
  MobileUserAccount,
  MobileUserRole,
  PaymentStateType,
} from '../types/mobile.types';

export const UNIT_PRICE_PER_GALLON_PHP = 25;
export const STANDARD_DELIVERY_FEE_PHP = 30;

export const DEMO_MOBILE_USERS: Record<MobileUserRole, MobileUserAccount> = {
  RIDER: {
    id: 'usr-rider-01',
    fullName: 'J. Cruz',
    phoneNumber: '+639170000002',
    role: 'RIDER',
    address: '124 Katipunan Ave, Loyola Heights, QC',
    nearestBranchName: 'Station 1 (Main Hub)',
    nearestBranchDistanceKm: 0.0,
  },
  OPERATOR: {
    id: 'usr-operator-01',
    fullName: 'Danny (Station Operator)',
    phoneNumber: '+639170000001',
    role: 'OPERATOR',
    address: '124 Katipunan Ave, Loyola Heights, QC',
    nearestBranchName: 'Station 1 (Main Hub)',
    nearestBranchDistanceKm: 0.0,
  },
};

export const INITIAL_MOBILE_ORDERS: MobileOrderItem[] = [];

/**
 * Computes the subtotal, delivery fee, and total due for a given container count.
 */
export function calculateOrderBillBreakdown(containerCount: number): {
  subtotalAmount: number;
  deliveryFee: number;
  totalDue: number;
} {
  const subtotalAmount = containerCount * UNIT_PRICE_PER_GALLON_PHP;
  const deliveryFee = STANDARD_DELIVERY_FEE_PHP;
  const totalDue = subtotalAmount + deliveryFee;

  return {
    subtotalAmount: subtotalAmount,
    deliveryFee: deliveryFee,
    totalDue: totalDue,
  };
}

/**
 * Computes the amount paid and balance due based on the selected doorstep payment state.
 */
export function calculateDoorstepPaymentAmounts(
  totalDue: number,
  paymentState: PaymentStateType,
  customPartialPaid: number,
): {
  amountPaid: number;
  balanceDue: number;
  statusBannerText: string;
} {
  if (paymentState === 'PAID_CASH') {
    return {
      amountPaid: totalDue,
      balanceDue: 0,
      statusBannerText: 'PAID IN FULL (CASH)',
    };
  }

  if (paymentState === 'PARTIAL') {
    let validPartial = customPartialPaid;
    if (validPartial < 0) {
      validPartial = 0;
    }
    if (validPartial > totalDue) {
      validPartial = totalDue;
    }
    const remainingBalance = totalDue - validPartial;
    return {
      amountPaid: validPartial,
      balanceDue: remainingBalance,
      statusBannerText: 'PARTIALLY PAID • BALANCE CARRIED',
    };
  }

  return {
    amountPaid: 0,
    balanceDue: totalDue,
    statusBannerText: 'UNPAID CHARGE SLIP',
  };
}
