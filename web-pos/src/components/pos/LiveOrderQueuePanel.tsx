/**
 * ============================================================================
 * FILE: src/components/pos/LiveOrderQueuePanel.tsx
 * PURPOSE: Active Orders & Dispatch Queue paginated into 12 cards per page.
 *          - Renders up to 12 horizontal order banner cards per page.
 *          - Each card displays 4 glanceable sections:
 *              1. Customer & Delivery Address
 *              2. Jugs (Refill count & Empty pickup count)
 *              3. Status Pill (#INV / #OR + Payment State)
 *              4. Total Due & Balance + Expand/Collapse Caret
 *          - Clicking any card toggles an expandable accordion drawer inside
 *            the card with Dispatch & Schedule, Billing Breakdown, Profit &
 *            Cost Deduction, and 1-Tap Doorstep Delivery Confirmation buttons.
 *          - Styled with Tailwind CSS and Lucide icons (lucide-react) strictly.
 * ============================================================================
 */

import {
  Banknote,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Clock,
  FileText,
  Package,
  PieChart,
  Route,
  Smartphone,
  User,
} from 'lucide-react';
import React, { useState } from 'react';
import type { PaymentState, PosOrderItem } from '../../types/pos.types';

interface LiveOrderQueuePanelProps {
  orders: PosOrderItem[];
  onConvertInvoiceToReceipt: (
    orderId: string,
    selectedPaymentState: PaymentState,
  ) => void;
  onSimulateRiderRouteOptimization: () => void;
}

const ORDERS_PER_PAGE = 12;

export function LiveOrderQueuePanel(props: LiveOrderQueuePanelProps) {
  // Find first awaiting-delivery order for initial expanded state
  let initialExpandedId: string | null = null;
  for (let i = 0; i < props.orders.length; i++) {
    if (props.orders[i].documentStage === 'INVOICE_ONLY') {
      initialExpandedId = props.orders[i].id;
      break;
    }
  }

  // Stores the ID of the currently expanded order card (null if none expanded)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    initialExpandedId,
  );

  // Current pagination page (1-indexed, 12 cards per page)
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalOrdersCount = props.orders.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalOrdersCount / ORDERS_PER_PAGE),
  );

  // Clamp active page if total orders shrink
  const safeCurrentPage =
    currentPage > totalPages ? totalPages : currentPage < 1 ? 1 : currentPage;

  const startIndex = (safeCurrentPage - 1) * ORDERS_PER_PAGE;
  const endIndexExclusive = Math.min(
    startIndex + ORDERS_PER_PAGE,
    totalOrdersCount,
  );

  // Build the current page slice of up to 12 order cards explicitly
  const paginatedOrders: PosOrderItem[] = [];
  for (let i = startIndex; i < endIndexExclusive; i++) {
    paginatedOrders.push(props.orders[i]);
  }

  // Build explicit page number list for pagination footer buttons
  const pageNumbers: number[] = [];
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    pageNumbers.push(pageNum);
  }

  /**
   * Toggles the expandable accordion drawer for a clicked order card
   */
  function handleToggleCardExpand(orderId: string) {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  }

  /**
   * Navigates to a specific page of 12 order cards
   */
  function handleGoToPage(targetPage: number) {
    if (targetPage < 1 || targetPage > totalPages) {
      return;
    }
    setCurrentPage(targetPage);
  }

  /**
   * Formats the payment state into a clean, readable label
   */
  function getReadablePaymentLabel(paymentState: PaymentState): string {
    if (paymentState === 'PAID_CASH') {
      return 'Paid (Cash)';
    }
    if (paymentState === 'E_PAYMENT') {
      return 'E-Payment';
    }
    if (paymentState === 'PARTIAL') {
      return 'Partial';
    }
    return 'Unpaid Slip';
  }

  /**
   * Returns a Tailwind status pill class based on document stage and payment state
   */
  function getStatusPillClass(order: PosOrderItem): string {
    const basePill =
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap border';

    if (order.documentStage === 'INVOICE_ONLY') {
      return `${basePill} bg-amber-50 text-amber-800 border-amber-200`;
    }
    if (order.paymentState === 'PARTIAL') {
      return `${basePill} bg-orange-50 text-orange-800 border-orange-200`;
    }
    if (order.paymentState === 'UNPAID_CHARGE_SLIP') {
      return `${basePill} bg-red-50 text-red-700 border-red-200`;
    }
    return `${basePill} bg-emerald-50 text-emerald-800 border-emerald-200`;
  }

  /**
   * Builds the rendered list of 12 order cards for the active page
   */
  function renderOrderCards(): React.ReactNode[] {
    const cardElements: React.ReactNode[] = [];

    for (let i = 0; i < paginatedOrders.length; i++) {
      const order = paginatedOrders[i];
      const isExpanded = expandedOrderId === order.id;
      const isAwaitingDelivery = order.documentStage === 'INVOICE_ONLY';
      const activeDocCode =
        order.receiptNumber !== null
          ? `#${order.receiptNumber}`
          : `#${order.invoiceNumber}`;

      const cardContainerClass = isExpanded
        ? 'rounded-xl border border-sky-300 bg-sky-50/40 shadow-xs transition-all overflow-hidden'
        : isAwaitingDelivery
          ? 'rounded-xl border border-amber-200/90 border-l-4 border-l-amber-400 bg-white hover:bg-slate-50/90 transition-all overflow-hidden'
          : 'rounded-xl border border-slate-200 bg-white hover:bg-slate-50/90 transition-all overflow-hidden';

      cardElements.push(
        <div key={order.id} className={cardContainerClass}>
          {/* Main Scannable Banner Card Header: 4 Glanceable Columns + Expand Caret */}
          <div
            className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3 px-4 py-3 cursor-pointer select-none"
            onClick={() => handleToggleCardExpand(order.id)}
          >
            {/* 1. Customer & Delivery Address */}
            <div className="sm:col-span-4 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {order.customerName}
              </div>
              <div
                className="text-xs text-slate-500 mt-0.5 truncate"
                title={order.deliveryAddress}
              >
                {order.deliveryAddress}
              </div>
            </div>

            {/* 2. Jugs (Refill + Empty Pickup) */}
            <div className="sm:col-span-2">
              <div className="text-sm font-bold text-slate-900">
                {order.verifiedCount}{' '}
                {order.verifiedCount === 1 ? 'refill' : 'refills'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {order.emptyContainersToPickup > 0
                  ? `${order.emptyContainersToPickup} empty pickup`
                  : 'No empty pickup'}
              </div>
            </div>

            {/* 3. Status & Document Code Pill */}
            <div className="sm:col-span-3">
              <span className={getStatusPillClass(order)}>
                {isAwaitingDelivery
                  ? `${activeDocCode} • Out for Delivery`
                  : `${activeDocCode} • ${getReadablePaymentLabel(order.paymentState)}`}
              </span>
            </div>

            {/* 4. Total Due (& Balance if any) + Caret */}
            <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-3">
              <div className="text-left sm:text-right">
                <div className="text-sm font-extrabold text-slate-900 tabular-nums">
                  PHP {order.totalDue.toFixed(2)}
                </div>
                {order.balanceDue > 0 ? (
                  <div className="text-xs font-semibold text-red-600 mt-0.5 tabular-nums">
                    Bal: PHP {order.balanceDue.toFixed(2)}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 mt-0.5">Settled</div>
                )}
              </div>

              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 bg-slate-100/80 shrink-0">
                {isExpanded ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
            </div>
          </div>

          {/* Expandable Accordion Drawer Inside Card: Cost Deduction, Slot & Actions */}
          {isExpanded && (
            <div className="px-4 py-3.5 bg-slate-50/90 border-t border-slate-200/80">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Column A: Dispatch & Schedule Info */}
                <div className="bg-white border border-slate-200 rounded-xl p-3">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    DISPATCH &amp; SCHEDULE
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 py-1">
                    <Clock size={14} className="text-slate-400" />
                    <span>Slot: {order.scheduledTimeSlot}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 py-1">
                    <User size={14} className="text-slate-400" />
                    <span>Rider: {order.assignedRiderName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 py-1">
                    <FileText size={14} className="text-slate-400" />
                    <span>
                      Preset: {order.presetName} (PHP {order.unitPrice}/jug)
                    </span>
                  </div>
                </div>

                {/* Column B: Billing & Balance Breakdown */}
                <div className="bg-white border border-slate-200 rounded-xl p-3">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    BILLING BREAKDOWN
                  </span>
                  <div className="flex justify-between gap-2 text-xs text-slate-700 py-1">
                    <span>
                      Refill Subtotal ({order.verifiedCount} × PHP{' '}
                      {order.unitPrice}):
                    </span>
                    <span className="font-semibold">
                      PHP {order.subtotalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2 text-xs text-slate-700 py-1">
                    <span>Delivery Fee:</span>
                    <span className="font-semibold">
                      PHP {order.deliveryFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2 text-xs text-slate-700 py-1">
                    <span>Amount Paid / Balance:</span>
                    <span className="font-semibold">
                      Paid PHP {order.amountPaid.toFixed(2)} • Bal PHP{' '}
                      {order.balanceDue.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Column C: Cost Deduction & Net Profit Math */}
                <div className="bg-white border border-slate-200 rounded-xl p-3">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    PROFIT &amp; COST DEDUCTION
                  </span>
                  <div className="flex justify-between gap-2 text-xs text-slate-700 py-1">
                    <span>Gross Order Revenue:</span>
                    <span className="font-semibold">
                      PHP {order.totalDue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2 text-xs text-slate-700 py-1">
                    <span>
                      Refill Cost ({order.verifiedCount} × PHP 8.00):
                    </span>
                    <span className="font-semibold text-red-600">
                      - PHP {order.operationalCostTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2 text-xs text-emerald-700 pt-1.5 mt-1 border-t border-dashed border-slate-200">
                    <strong>Order Net Profit:</strong>
                    <strong>PHP {order.netProfit.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Action Bar if Order is still awaiting doorstep confirmation (#INV -> #OR) */}
              {isAwaitingDelivery && (
                <div className="mt-3 px-3.5 py-2.5 bg-amber-50/90 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-2.5">
                  <span className="text-xs font-medium text-amber-900">
                    Confirm Doorstep Delivery &amp; Issue{' '}
                    <strong>#OR-{order.orderNumber}</strong>:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                      onClick={() =>
                        props.onConvertInvoiceToReceipt(order.id, 'PAID_CASH')
                      }
                    >
                      <Banknote size={13} />
                      <span>Paid (Cash)</span>
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                      onClick={() =>
                        props.onConvertInvoiceToReceipt(order.id, 'E_PAYMENT')
                      }
                    >
                      <Smartphone size={13} />
                      <span>E-Payment</span>
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer"
                      onClick={() =>
                        props.onConvertInvoiceToReceipt(order.id, 'PARTIAL')
                      }
                    >
                      <PieChart size={13} />
                      <span>Partial</span>
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                      onClick={() =>
                        props.onConvertInvoiceToReceipt(
                          order.id,
                          'UNPAID_CHARGE_SLIP',
                        )
                      }
                    >
                      <ClipboardList size={13} />
                      <span>Unpaid Slip</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>,
      );
    }

    return cardElements;
  }

  /**
   * Builds the numbered page buttons for the pagination footer
   */
  function renderPageButtons(): React.ReactNode[] {
    const buttonElements: React.ReactNode[] = [];

    for (let i = 0; i < pageNumbers.length; i++) {
      const pageNum = pageNumbers[i];
      const isCurrent = pageNum === safeCurrentPage;

      buttonElements.push(
        <button
          key={pageNum}
          type="button"
          onClick={() => handleGoToPage(pageNum)}
          className={`min-w-8 h-8 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            isCurrent
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          {pageNum}
        </button>,
      );
    }

    return buttonElements;
  }

  const displayStartNumber = totalOrdersCount === 0 ? 0 : startIndex + 1;
  const displayEndNumber = endIndexExclusive;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
      {/* Clean Operational Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-3 border-b border-slate-100">
        <div>
          <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
            <Package size={18} className="text-blue-600" />
            <span>Active Orders &amp; Dispatch Queue</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {totalOrdersCount} orders today • Showing {ORDERS_PER_PAGE} cards
            per page (Page {safeCurrentPage} of {totalPages})
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors cursor-pointer"
          onClick={props.onSimulateRiderRouteOptimization}
        >
          <Route size={15} />
          <span>Sequence Route ({totalOrdersCount})</span>
        </button>
      </div>

      {/* Subtle Column Guide Strip Above the 12 Order Cards */}
      <div className="hidden sm:grid sm:grid-cols-12 items-center gap-3 px-4 py-2 mb-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        <div className="sm:col-span-4">Customer</div>
        <div className="sm:col-span-2">Jugs</div>
        <div className="sm:col-span-3">Status</div>
        <div className="sm:col-span-3 text-right pr-9">Total</div>
      </div>

      {/* Paginated Stack of 12 Order Cards */}
      <div className="space-y-2.5">{renderOrderCards()}</div>

      {/* Pagination Footer (12 Cards per Page) */}
      <div className="mt-4 pt-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          Showing{' '}
          <span className="font-bold text-slate-800">{displayStartNumber}</span>
          –<span className="font-bold text-slate-800">{displayEndNumber}</span>{' '}
          of <span className="font-bold text-slate-800">{totalOrdersCount}</span>{' '}
          order cards ({ORDERS_PER_PAGE} per page)
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={safeCurrentPage <= 1}
            onClick={() => handleGoToPage(safeCurrentPage - 1)}
            className={`inline-flex items-center gap-1 px-2.5 h-8 rounded-lg text-xs font-semibold border transition-colors ${
              safeCurrentPage <= 1
                ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 cursor-pointer'
            }`}
          >
            <ChevronLeft size={14} />
            <span>Prev</span>
          </button>

          <div className="flex items-center gap-1">{renderPageButtons()}</div>

          <button
            type="button"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => handleGoToPage(safeCurrentPage + 1)}
            className={`inline-flex items-center gap-1 px-2.5 h-8 rounded-lg text-xs font-semibold border transition-colors ${
              safeCurrentPage >= totalPages
                ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 cursor-pointer'
            }`}
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
