/**
 * ============================================================================
 * FILE: src/types/mobile.types.ts
 * PURPOSE: Type definitions for the LG Nature's Water Rider Mobile Application.
 * ============================================================================
 */

export type MobileUserRole = 'RIDER' | 'OPERATOR';

export type RiderTabName = 'DELIVERIES' | 'AI_COUNT' | 'DOORSTEP_OR';

export type PaymentStateType =
  | 'PAID_CASH'
  | 'PARTIAL'
  | 'UNPAID_CHARGE_SLIP';

export type DocumentStageType = 'INVOICE_ONLY' | 'OFFICIAL_RECEIPT';

export type TimeSlotOption =
  | '8:00 – 10:00 AM'
  | '1:00 – 3:00 PM'
  | '4:00 – 6:00 PM';

export interface MobileUserAccount {
  id: string;
  fullName: string;
  phoneNumber: string;
  role: MobileUserRole;
  address: string;
  nearestBranchName: string;
  nearestBranchDistanceKm: number;
}

export interface MobileOrderItem {
  id: string;
  orderNumber: number;
  invoiceNumber: string;
  receiptNumber: string | null;
  documentStage: DocumentStageType;
  customerName: string;
  deliveryAddress: string;
  presetName: string;
  verifiedCount: number;
  emptyContainersToPickup: number;
  unitPrice: number;
  subtotalAmount: number;
  deliveryFee: number;
  totalDue: number;
  paymentState: PaymentStateType;
  amountPaid: number;
  balanceDue: number;
  scheduledTimeSlot: TimeSlotOption;
  assignedRiderName: string;
  aiConfidencePercent: number;
  createdAtLabel: string;
}
