/**
 * ============================================================================
 * FILE: src/data/mobileInitialData.ts
 * PURPOSE: Initial state and explicit, step-by-step calculation helpers
 *          for the LG Nature's Water Mobile App (Customer & Rider views).
 *          Written without complex chained syntax for maximum readability.
 * ============================================================================
 */

import type {
  CustomerAccountSummary,
  MobileOrderItem,
  MobileUserAccount,
  MobileUserRole,
  PaymentStateType,
  TimeSlotOption,
} from '../types/mobile.types';

export const UNIT_PRICE_PER_GALLON_PHP = 25;
export const STANDARD_DELIVERY_FEE_PHP = 30;

export const DEMO_MOBILE_USERS: Record<MobileUserRole, MobileUserAccount> = {
  CUSTOMER: {
    id: 'usr-customer-01',
    fullName: 'Maria Santos',
    phoneNumber: '+639170000003',
    role: 'CUSTOMER',
    address: 'Blk 4 Lot 12 Pansol St, Quezon City',
    nearestBranchName: 'Station 1 (Main Hub)',
    nearestBranchDistanceKm: 0.3,
  },
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

export const INITIAL_CUSTOMER_SUMMARY: CustomerAccountSummary = {
  customerName: 'Maria Santos',
  phoneNumber: '+639170000003',
  address: 'Blk 4 Lot 12 Pansol St, Quezon City',
  nearestStationLabel: 'Station 1 (Main Hub - 0.3km)',
  emptyContainersOut: 3,
  containersDueDateLabel: 'Oct 22',
  unpaidBalanceAmount: 100.0,
  unpaidFromReceiptCode: 'OR #1038',
  usualOrderGallons: 8,
  usualPresetName: '5-Gallon Slim Refill',
};

export const PICKUP_DAY_OPTIONS = [
  { code: 'MON_12', shortDay: 'MON', dateNum: '12', fullLabel: 'Monday, Oct 12' },
  { code: 'TUE_13', shortDay: 'TUE', dateNum: '13', fullLabel: 'Tuesday, Oct 13' },
  { code: 'WED_14', shortDay: 'WED', dateNum: '14', fullLabel: 'Wednesday, Oct 14' },
  { code: 'THU_15', shortDay: 'THU', dateNum: '15', fullLabel: 'Thursday, Oct 15' },
];

export const PICKUP_TIME_SLOT_OPTIONS: TimeSlotOption[] = [
  '8:00 – 10:00 AM',
  '1:00 – 3:00 PM',
  '4:00 – 6:00 PM',
];

export const DEMO_STATION_HUB = {
  id: 'stn-01',
  name: "LG Nature's Water - Station 1 (Main Hub)",
  shortLabel: 'Stn 1 (Hub)',
  address: '124 Katipunan Ave, Loyola Heights, QC',
  latitude: 14.6415,
  longitude: 121.0748,
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
    stopSequenceNumber: 1,
    createdAtLabel: '9:42 AM',
    latitude: 14.6455,
    longitude: 121.0762,
    etaMinutes: 4,
    distanceKm: 0.8,
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
    stopSequenceNumber: 2,
    createdAtLabel: '10:05 AM',
    latitude: 14.6401,
    longitude: 121.0729,
    etaMinutes: 7,
    distanceKm: 1.4,
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
    paymentState: 'E_PAYMENT',
    amountPaid: 330,
    balanceDue: 0,
    scheduledTimeSlot: '4:00 – 6:00 PM',
    assignedRiderName: 'J. Cruz',
    aiConfidencePercent: 97,
    stopSequenceNumber: 3,
    createdAtLabel: '10:30 AM',
    latitude: 14.638,
    longitude: 121.074,
    etaMinutes: 5,
    distanceKm: 1.1,
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

  if (paymentState === 'E_PAYMENT') {
    return {
      amountPaid: totalDue,
      balanceDue: 0,
      statusBannerText: 'PAID VIA E-PAYMENT (GCASH / MAYA)',
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
    statusBannerText: 'UNPAID CHARGE SLIP • ADDED TO LEDGER',
  };
}
