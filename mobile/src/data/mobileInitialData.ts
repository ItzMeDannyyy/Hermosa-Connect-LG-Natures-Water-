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

export const INITIAL_MOBILE_ORDERS: MobileOrderItem[] = [
  {
    id: 'ord-1042',
    orderNumber: 1042,
    invoiceNumber: 'INV-1042',
    receiptNumber: null,
    documentStage: 'INVOICE_ONLY',
    customerName: 'Maria Santos',
    deliveryAddress: 'Blk 4 Lot 12 Pansol St, Quezon City',
    presetName: '5-Gallon Slim Container (Refill)',
    verifiedCount: 8,
    emptyContainersToPickup: 3,
    unitPrice: 25,
    subtotalAmount: 200,
    deliveryFee: 30,
    totalDue: 230,
    paymentState: 'PARTIAL',
    amountPaid: 130,
    balanceDue: 100,
    scheduledTimeSlot: '1:00 – 3:00 PM',
    assignedRiderName: 'J. Cruz',
    aiConfidencePercent: 96,
    createdAtLabel: '9:42 AM',
  },
  {
    id: 'ord-1043',
    orderNumber: 1043,
    invoiceNumber: 'INV-1043',
    receiptNumber: null,
    documentStage: 'INVOICE_ONLY',
    customerName: 'Carlo Mendoza',
    deliveryAddress: '18 Xavierville Ave, Loyola Heights, QC',
    presetName: '5-Gallon Round Dispenser Jug (Refill)',
    verifiedCount: 6,
    emptyContainersToPickup: 6,
    unitPrice: 25,
    subtotalAmount: 150,
    deliveryFee: 30,
    totalDue: 180,
    paymentState: 'PAID_CASH',
    amountPaid: 180,
    balanceDue: 0,
    scheduledTimeSlot: '1:00 – 3:00 PM',
    assignedRiderName: 'J. Cruz',
    aiConfidencePercent: 98,
    createdAtLabel: '10:05 AM',
  },
  {
    id: 'ord-1044',
    orderNumber: 1044,
    invoiceNumber: 'INV-1044',
    receiptNumber: 'OR-1044',
    documentStage: 'OFFICIAL_RECEIPT',
    customerName: 'ABC Office Hub',
    deliveryAddress: '102 Katipunan Ave, Quezon City',
    presetName: '5-Gallon Slim Container (Refill)',
    verifiedCount: 12,
    emptyContainersToPickup: 10,
    unitPrice: 25,
    subtotalAmount: 300,
    deliveryFee: 30,
    totalDue: 330,
    paymentState: 'PAID_CASH',
    amountPaid: 330,
    balanceDue: 0,
    scheduledTimeSlot: '4:00 – 6:00 PM',
    assignedRiderName: 'J. Cruz',
    aiConfidencePercent: 97,
    createdAtLabel: '10:30 AM',
  },
];

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
