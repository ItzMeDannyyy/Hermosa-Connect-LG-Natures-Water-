/**
 * ============================================================================
 * FILE: src/data/initialPosData.ts
 * PURPOSE: Realistic initial data for the Station Counter Web POS matching
 *          the LG Nature's Water pitch deck (Slides 7 to 12).
 * ============================================================================
 */

import type {
  PosOrderItem,
  ProfitSummaryMetrics,
  TransactionLogsFilter,
} from '../types/pos.types';

export const DEFAULT_REFILL_PRICE_PHP = 25;
export const DEFAULT_DELIVERY_FEE_PHP = 30;

export const INITIAL_POS_ORDERS: PosOrderItem[] = [
  {
    id: 'order-1042',
    orderNumber: '1042',
    customerName: 'Maria Santos',
    customerPhone: '+639170000003',
    deliveryAddress: 'Blk 4 Lot 12 Pansol St, Quezon City',
    presetName: '5-Gallon Slim Container (Refill)',
    unitPrice: 25,
    verifiedCount: 8,
    emptyContainersToPickup: 3,
    scheduledTimeSlot: '1:00 – 3:00 PM',
    status: 'DELIVERED',
    documentStage: 'OFFICIAL_RECEIPT',
    invoiceNumber: 'INV-1042',
    receiptNumber: 'OR-1042',
    paymentState: 'PARTIAL',
    subtotalAmount: 200,
    deliveryFee: 30,
    totalDue: 230,
    amountPaid: 130,
    balanceDue: 100,
    netProfit: 230,
    assignedRiderName: 'J. Cruz',
    invoicedAt: '9:42 AM',
    deliveredAt: '11:15 AM',
    orderDate: '2026-10-22',
    createdAtIso: '2026-10-22T09:42:00.000Z',
  },
  {
    id: 'order-1043',
    orderNumber: '1043',
    customerName: 'Carlo Mendoza',
    customerPhone: '+639178889900',
    deliveryAddress: '18 Xavierville Ave, Loyola Heights, QC',
    presetName: '5-Gallon Slim Container (Refill)',
    unitPrice: 25,
    verifiedCount: 6,
    emptyContainersToPickup: 6,
    scheduledTimeSlot: '1:00 – 3:00 PM',
    status: 'INVOICED',
    documentStage: 'INVOICE_ONLY',
    invoiceNumber: 'INV-1043',
    receiptNumber: null,
    paymentState: 'UNPAID_CHARGE_SLIP',
    subtotalAmount: 150,
    deliveryFee: 30,
    totalDue: 180,
    amountPaid: 0,
    balanceDue: 180,
    netProfit: 180,
    assignedRiderName: 'J. Cruz',
    invoicedAt: '10:05 AM',
    deliveredAt: null,
    orderDate: '2026-10-22',
    createdAtIso: '2026-10-22T10:05:00.000Z',
  },
  {
    id: 'order-1044',
    orderNumber: '1044',
    customerName: 'Katipunan Study Hub (Office)',
    customerPhone: '+639173334455',
    deliveryAddress: '102 Katipunan Ave, Quezon City',
    presetName: '5-Gallon Round Dispenser Jug (Refill)',
    unitPrice: 25,
    verifiedCount: 12,
    emptyContainersToPickup: 10,
    scheduledTimeSlot: '8:00 – 10:00 AM',
    status: 'DELIVERED',
    documentStage: 'OFFICIAL_RECEIPT',
    invoiceNumber: 'INV-1044',
    receiptNumber: 'OR-1044',
    paymentState: 'PAID_CASH',
    subtotalAmount: 300,
    deliveryFee: 30,
    totalDue: 330,
    amountPaid: 330,
    balanceDue: 0,
    netProfit: 330,
    assignedRiderName: 'J. Cruz',
    invoicedAt: '8:15 AM',
    deliveredAt: '9:02 AM',
  },
  {
    id: 'order-1045',
    orderNumber: '1045',
    customerName: 'Elena Bautista',
    customerPhone: '+639176667788',
    deliveryAddress: '24 Rosa Alvero St, Loyola Heights, QC',
    presetName: '5-Gallon Slim Container (Refill)',
    unitPrice: 25,
    verifiedCount: 10,
    emptyContainersToPickup: 8,
    scheduledTimeSlot: '4:00 – 6:00 PM',
    status: 'DELIVERED',
    documentStage: 'OFFICIAL_RECEIPT',
    invoiceNumber: 'INV-1045',
    receiptNumber: 'OR-1045',
    paymentState: 'PAID_CASH',
    subtotalAmount: 250,
    deliveryFee: 30,
    totalDue: 280,
    amountPaid: 280,
    balanceDue: 0,
    netProfit: 280,
    assignedRiderName: 'J. Cruz',
    invoicedAt: '10:30 AM',
    deliveredAt: '11:40 AM',
  },
  {
    id: 'order-1046',
    orderNumber: '1046',
    customerName: 'Ramon Villanueva',
    customerPhone: '+639174441122',
    deliveryAddress: '14 Fabian de la Rosa St, Loyola Heights, QC',
    presetName: '5-Gallon Slim Container (Refill)',
    unitPrice: 25,
    verifiedCount: 5,
    emptyContainersToPickup: 5,
    scheduledTimeSlot: '8:00 – 10:00 AM',
    status: 'DELIVERED',
    documentStage: 'OFFICIAL_RECEIPT',
    invoiceNumber: 'INV-1046',
    receiptNumber: 'OR-1046',
    paymentState: 'PAID_CASH',
    subtotalAmount: 125,
    deliveryFee: 30,
    totalDue: 155,
    amountPaid: 155,
    balanceDue: 0,
    netProfit: 155,
    assignedRiderName: 'J. Cruz',
    invoicedAt: '8:35 AM',
    deliveredAt: '9:18 AM',
  },
  {
    id: 'order-1047',
    orderNumber: '1047',
    customerName: 'Ateneo North Dormitory',
    customerPhone: '+639175556677',
    deliveryAddress: '88 Esteban Abada St, Quezon City',
    presetName: '5-Gallon Round Dispenser Jug (Refill)',
    unitPrice: 25,
    verifiedCount: 15,
    emptyContainersToPickup: 12,
    scheduledTimeSlot: '1:00 – 3:00 PM',
    status: 'INVOICED',
    documentStage: 'INVOICE_ONLY',
    invoiceNumber: 'INV-1047',
    receiptNumber: null,
    paymentState: 'PAID_CASH',
    subtotalAmount: 375,
    deliveryFee: 30,
    totalDue: 405,
    amountPaid: 0,
    balanceDue: 405,
    netProfit: 405,
    assignedRiderName: 'J. Cruz',
    invoicedAt: '12:50 PM',
    deliveredAt: null,
  },
  {
    id: 'order-1048',
    orderNumber: '1048',
    customerName: 'Patricia Lim',
    customerPhone: '+639172223344',
    deliveryAddress: '31 B. Gonzales St, Loyola Heights, QC',
    presetName: '5-Gallon Slim Container (Refill)',
    unitPrice: 25,
    verifiedCount: 7,
    emptyContainersToPickup: 7,
    scheduledTimeSlot: '1:00 – 3:00 PM',
    status: 'DELIVERED',
    documentStage: 'OFFICIAL_RECEIPT',
    invoiceNumber: 'INV-1048',
    receiptNumber: 'OR-1048',
    paymentState: 'PAID_CASH',
    subtotalAmount: 175,
    deliveryFee: 30,
    totalDue: 205,
    amountPaid: 205,
    balanceDue: 0,
    netProfit: 205,
    assignedRiderName: 'J. Cruz',
    invoicedAt: '1:10 PM',
    deliveredAt: '1:55 PM',
  },
  {
    id: 'order-1049',
    orderNumber: '1049',
    customerName: 'Dr. Gregory Santos Clinic',
    customerPhone: '+639173339911',
    deliveryAddress: '55 F. Dela Rosa St, Quezon City',
    presetName: '5-Gallon Round Dispenser Jug (Refill)',
    unitPrice: 25,
    verifiedCount: 8,
    emptyContainersToPickup: 8,
    scheduledTimeSlot: '1:00 – 3:00 PM',
    status: 'DELIVERED',
    documentStage: 'OFFICIAL_RECEIPT',
    invoiceNumber: 'INV-1049',
    receiptNumber: 'OR-1049',
    paymentState: 'PAID_CASH',
    subtotalAmount: 200,
    deliveryFee: 30,
    totalDue: 230,
    amountPaid: 230,
    balanceDue: 0,
    netProfit: 230,
    assignedRiderName: 'J. Cruz',
    invoicedAt: '1:40 PM',
    deliveredAt: '2:25 PM',
  },
  {
    id: 'order-1050',
    orderNumber: '1050',
    customerName: 'Katipunan Bakery & Cafe',
    customerPhone: '+639174567890',
    deliveryAddress: '112 Katipunan Ave, Quezon City',
    presetName: '5-Gallon Round Dispenser Jug (Refill)',
    unitPrice: 25,
    verifiedCount: 20,
    emptyContainersToPickup: 16,
    scheduledTimeSlot: '1:00 – 3:00 PM',
    status: 'INVOICED',
    documentStage: 'INVOICE_ONLY',
    invoiceNumber: 'INV-1050',
    receiptNumber: null,
    paymentState: 'PARTIAL',
    subtotalAmount: 500,
    deliveryFee: 30,
    totalDue: 530,
    amountPaid: 250,
    balanceDue: 280,
    netProfit: 530,
    assignedRiderName: 'J. Cruz',
    invoicedAt: '2:15 PM',
    deliveredAt: null,
  },
];

/**
 * Computes daily summary metrics without refill cost deductions
 */
export function calculateProfitSummaryMetrics(
  orders: PosOrderItem[],
): ProfitSummaryMetrics {
  let totalOrdersCount = 0;
  let totalContainersRefilled = 0;
  let totalEmptyContainersPickedUp = 0;
  let grossSalesRevenue = 0;
  let cashCollected = 0;
  let unpaidReceivablesAdded = 0;

  for (const order of orders) {
    totalOrdersCount = totalOrdersCount + 1;
    totalContainersRefilled = totalContainersRefilled + order.verifiedCount;
    totalEmptyContainersPickedUp =
      totalEmptyContainersPickedUp + order.emptyContainersToPickup;

    grossSalesRevenue = grossSalesRevenue + order.totalDue;

    if (order.paymentState === 'PAID_CASH') {
      cashCollected = cashCollected + order.amountPaid;
    } else if (order.paymentState === 'PARTIAL') {
      cashCollected = cashCollected + order.amountPaid;
      unpaidReceivablesAdded = unpaidReceivablesAdded + order.balanceDue;
    } else if (order.paymentState === 'UNPAID_CHARGE_SLIP') {
      unpaidReceivablesAdded = unpaidReceivablesAdded + order.totalDue;
    }
  }

  return {
    totalOrdersCount,
    totalContainersRefilled,
    totalEmptyContainersPickedUp,
    grossSalesRevenue,
    cashCollected,
    unpaidReceivablesAdded,
    trueNetProfit: grossSalesRevenue,
  };
}

export function isOrderActive(order: PosOrderItem): boolean {
  if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
    return false;
  }
  return true;
}

export function filterActiveOrders(orders: PosOrderItem[]): PosOrderItem[] {
  return orders.filter(isOrderActive);
}

export function parseOrderTimestamp(order: PosOrderItem): number {
  if (order.createdAtIso) {
    const parsed = new Date(order.createdAtIso).getTime();
    if (!isNaN(parsed)) return parsed;
  }

  const dateStr = order.orderDate ?? '2026-10-22';
  const timeStr = order.deliveredAt ?? order.invoicedAt ?? '8:00 AM';

  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    const isoString = `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
    const parsed = new Date(isoString).getTime();
    if (!isNaN(parsed)) return parsed;
  }

  return new Date(`${dateStr}T12:00:00`).getTime();
}

export function filterHistoricalOrders(
  orders: PosOrderItem[],
  filter: TransactionLogsFilter,
): PosOrderItem[] {
  const todayStr = '2026-10-22';
  const yesterdayStr = '2026-10-21';

  const filtered = orders.filter((order) => {
    const orderDate = order.orderDate ?? todayStr;

    if (filter.specificDate) {
      if (orderDate !== filter.specificDate) return false;
    } else if (filter.dateRange === 'TODAY') {
      if (orderDate !== todayStr) return false;
    } else if (filter.dateRange === 'YESTERDAY') {
      if (orderDate !== yesterdayStr) return false;
    } else if (filter.dateRange === 'LAST_7_DAYS') {
      const orderMs = new Date(orderDate).getTime();
      const cutoffMs = new Date('2026-10-15').getTime();
      if (orderMs < cutoffMs) return false;
    }

    if (filter.paymentStateFilter !== 'ALL') {
      if (order.paymentState !== filter.paymentStateFilter) return false;
    }

    if (filter.searchQuery.trim().length > 0) {
      const q = filter.searchQuery.toLowerCase().trim();
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.toLowerCase().includes(q);
      const matchAddress = order.deliveryAddress.toLowerCase().includes(q);
      const matchOrderNum = order.orderNumber.toLowerCase().includes(q);
      const matchInv = order.invoiceNumber.toLowerCase().includes(q);
      const matchRcpt = order.receiptNumber?.toLowerCase().includes(q) ?? false;
      if (
        !matchName &&
        !matchPhone &&
        !matchAddress &&
        !matchOrderNum &&
        !matchInv &&
        !matchRcpt
      ) {
        return false;
      }
    }

    return true;
  });

  filtered.sort((a, b) => {
    const timeA = parseOrderTimestamp(a);
    const timeB = parseOrderTimestamp(b);
    if (filter.sortOrder === 'OLDEST_FIRST') {
      return timeA - timeB;
    }
    return timeB - timeA;
  });

  return filtered;
}
