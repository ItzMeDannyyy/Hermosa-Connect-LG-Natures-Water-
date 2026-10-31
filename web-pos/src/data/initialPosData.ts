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
  WalkInContainerItem,
} from '../types/pos.types';

export const DEFAULT_REFILL_PRICE_PHP = 25;
export const DEFAULT_DELIVERY_FEE_PHP = 30;

export const COUNTER_CONTAINER_PRESETS: WalkInContainerItem[] = [
  {
    id: '10L',
    name: '10 Liters (10L)',
    volumeLabel: '10 Liters',
    unitPrice: 13,
    description: '10L Slim Refill',
  },
  {
    id: '7L',
    name: '7 Liters (7L)',
    volumeLabel: '7 Liters',
    unitPrice: 9,
    description: '7L Compact Refill',
  },
  {
    id: 'ROUND',
    name: '5-Gallon Round',
    volumeLabel: '5-Gallon Round',
    unitPrice: 20,
    description: 'Round Dispenser Jug',
  },
];

export const INITIAL_POS_ORDERS: PosOrderItem[] = [];

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
