/**
 * ============================================================================
 * FILE: src/types/pos.types.ts
 * PURPOSE: Clear, readable TypeScript interfaces for the Station POS Dashboard,
 *          Orders (#INV and #OR), and Sales Profit Reports.
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
  | 'PARTIAL'
  | 'UNPAID_CHARGE_SLIP';

export type TimeSlotLabel =
  | '8:00 – 10:00 AM'
  | '1:00 – 3:00 PM'
  | '4:00 – 6:00 PM';

export type WalkInContainerId = '10L' | '7L' | 'ROUND';

export interface WalkInContainerItem {
  id: WalkInContainerId;
  name: string;
  volumeLabel: string;
  unitPrice: number;
  description: string;
}

export interface CartLineItem {
  containerId: WalkInContainerId;
  name: string;
  unitPrice: number;
  quantity: number;
}

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

export interface ProfitSummaryMetrics {
  totalOrdersCount: number;
  totalContainersRefilled: number;
  totalEmptyContainersPickedUp: number;
  grossSalesRevenue: number;
  cashCollected: number;
  unpaidReceivablesAdded: number;
  trueNetProfit: number;
}
