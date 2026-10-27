/**
 * ============================================================================
 * FILE: src/types/pos.types.ts
 * PURPOSE: Clear, readable TypeScript interfaces for the Station POS Dashboard,
 *          Orders (#INV and #OR), Customer Accountability, and Profit Reports.
 * ============================================================================
 */

export type OrderStatus =
  | 'PENDING'
  | 'INVOICED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type DocumentStage = 'INVOICE_ONLY' | 'OFFICIAL_RECEIPT';

export type PaymentState =
  | 'PAID_CASH'
  | 'E_PAYMENT'
  | 'PARTIAL'
  | 'UNPAID_CHARGE_SLIP';

export type TimeSlotLabel =
  | '8:00 – 10:00 AM'
  | '1:00 – 3:00 PM'
  | '4:00 – 6:00 PM';

export interface PosOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  presetName: string;
  unitPrice: number;
  verifiedCount: number;
  emptyContainersToPickup: number;
  scheduledTimeSlot: TimeSlotLabel;
  status: OrderStatus;
  documentStage: DocumentStage;
  invoiceNumber: string;
  receiptNumber: string | null;
  paymentState: PaymentState;
  subtotalAmount: number;
  deliveryFee: number;
  totalDue: number;
  amountPaid: number;
  balanceDue: number;
  operationalCostTotal: number;
  netProfit: number;
  assignedRiderName: string;
  invoicedAt: string;
  deliveredAt: string | null;
  orderDate?: string;
  createdAtIso?: string;
}

export interface TransactionLogsFilter {
  dateRange: 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'ALL';
  specificDate?: string;
  searchQuery: string;
  paymentStateFilter: 'ALL' | PaymentState;
  sortOrder: 'NEWEST_FIRST' | 'OLDEST_FIRST';
}

export interface CustomerAccountabilityRecord {
  id: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  emptyContainersHeld: number;
  containersDueBackDate: string;
  isOverdue: boolean;
  runningUnpaidBalance: number;
  lastOrderNumber: string;
  pickupReminderSent?: boolean;
  lastRemindedAt?: string | null;
}

export interface ProfitSummaryMetrics {
  totalOrdersCount: number;
  totalContainersRefilled: number;
  totalEmptyContainersPickedUp: number;
  grossSalesRevenue: number;
  cashCollected: number;
  ePaymentCollected: number;
  unpaidReceivablesAdded: number;
  waterCostTotal: number;
  electricityCostTotal: number;
  containerWearCostTotal: number;
  totalCostOfRefill: number;
  trueNetProfit: number;
}
