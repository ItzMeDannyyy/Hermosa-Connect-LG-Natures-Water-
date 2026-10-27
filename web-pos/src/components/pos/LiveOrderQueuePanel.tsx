/**
 * ============================================================================
 * FILE: src/components/pos/LiveOrderQueuePanel.tsx
 * PURPOSE: Operational Orders & Dispatch Queue adhering to tasteskill v2 framed-sheet.
 *          - Clean, typography-first table / operational cards.
 *          - Fast scanning: Customer, Jugs, Status / Document, Total Due.
 *          - Direct 1-tap Pre-dispatch Invoice (#INV) to Official Receipt (#OR).
 *          - High-contrast tabular numbers (IBM Plex Mono).
 *          - Strictly Lucide vector icons, zero Unicode emojis.
 * ============================================================================
 */

import {
  Banknote,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  FileText,
  MapPin,
  Receipt,
  Route,
  Search,
  Smartphone,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { isOrderActive } from '../../data/initialPosData';
import type { PaymentState, PosOrderItem } from '../../types/pos.types';

interface LiveOrderQueuePanelProps {
  orders: PosOrderItem[];
  onConvertInvoiceToReceipt: (
    orderId: string,
    selectedPaymentState: PaymentState,
  ) => void;
  onSimulateRiderRouteOptimization: () => void;
  onOpenRegisterCustomer?: () => void;
}

const ORDERS_PER_PAGE = 10;

export function LiveOrderQueuePanel(props: LiveOrderQueuePanelProps) {
  const [queueFilterMode, setQueueFilterMode] = useState<
    'ACTIVE_ONLY' | 'ALL_TODAY'
  >('ACTIVE_ONLY');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeOrders = props.orders.filter(isOrderActive);
  const targetOrders =
    queueFilterMode === 'ACTIVE_ONLY' ? activeOrders : props.orders;

  const filteredOrders = targetOrders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.customerName.toLowerCase().includes(query) ||
      order.orderNumber.toLowerCase().includes(query) ||
      (order.receiptNumber &&
        order.receiptNumber.toLowerCase().includes(query)) ||
      order.deliveryAddress.toLowerCase().includes(query)
    );
  });

  // Expand first invoice order by default for immediate operator visibility
  let initialExpandedId: string | null = null;
  for (let i = 0; i < filteredOrders.length; i++) {
    if (filteredOrders[i].documentStage === 'INVOICE_ONLY') {
      initialExpandedId = filteredOrders[i].id;
      break;
    }
  }

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    initialExpandedId,
  );
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalOrdersCount = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalOrdersCount / ORDERS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = Math.min(startIndex + ORDERS_PER_PAGE, totalOrdersCount);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  function handleToggleCardExpand(orderId: string) {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  }

  function getReadablePaymentLabel(paymentState: PaymentState): string {
    if (paymentState === 'PAID_CASH') return 'Paid · Cash';
    if (paymentState === 'E_PAYMENT') return 'E-Payment';
    if (paymentState === 'PARTIAL') return 'Partial Deposit';
    return 'Unpaid Charge Slip';
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ====================================================================
          1. TITLE ROW & ACTIONS
          ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-[#0f172a] tracking-tight">
            Dispatch &amp; Counter Orders
          </h1>
          <p className="text-[12px] text-[#64748b] mt-0.5">
            Active water refilling queue, delivery routes, and official receipt conversion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={props.onSimulateRiderRouteOptimization}
            className="btn-secondary text-[12px] py-1.5"
            title="Sequences active stops for delivery rider"
          >
            <Route size={14} className="text-[#0284c7]" />
            <span>Optimize Delivery Route</span>
          </button>
        </div>
      </div>

      {/* ====================================================================
          2. FILTER & TOOLBAR
          ==================================================================== */}
      <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Scope Tabs */}
        <div className="inline-flex items-center bg-[#f1f5f9] p-0.5 rounded-[6px] w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              setQueueFilterMode('ACTIVE_ONLY');
              setCurrentPage(1);
            }}
            className={`flex-1 md:flex-none px-3 py-1 text-[12px] font-medium rounded-[4px] cursor-pointer transition-colors ${
              queueFilterMode === 'ACTIVE_ONLY'
                ? 'bg-white text-[#0f172a] shadow-xs font-semibold'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Active Queue ({activeOrders.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setQueueFilterMode('ALL_TODAY');
              setCurrentPage(1);
            }}
            className={`flex-1 md:flex-none px-3 py-1 text-[12px] font-medium rounded-[4px] cursor-pointer transition-colors ${
              queueFilterMode === 'ALL_TODAY'
                ? 'bg-white text-[#0f172a] shadow-xs font-semibold'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            All Today ({props.orders.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search order #, customer, address..."
            className="w-full bg-[#ffffff] border border-[#e2e8f0] focus:border-[#0284c7] rounded-[6px] pl-8 pr-3 py-1.5 text-[12px] text-[#0f172a] outline-none"
          />
        </div>
      </div>

      {/* ====================================================================
          3. ORDERS LIST / TABLE
          ==================================================================== */}
      {paginatedOrders.length === 0 ? (
        <div className="bg-white border border-[#e2e8f0] rounded-[10px] p-8 text-center text-[#64748b]">
          <p className="text-[13px] font-medium">No orders found matching this filter.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {paginatedOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const isInvoice = order.documentStage === 'INVOICE_ONLY';

            return (
              <div
                key={order.id}
                className="bg-white border border-[#e2e8f0] rounded-[8px] transition-colors overflow-hidden"
              >
                {/* Main Row */}
                <div
                  onClick={() => handleToggleCardExpand(order.id)}
                  className="p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-[#fcfdfd]"
                >
                  {/* Left: Customer & Destination */}
                  <div className="flex items-start gap-3 min-w-[260px]">
                    <div className="w-8 h-8 rounded-[6px] bg-[#f1f5f9] text-[#334155] flex items-center justify-center shrink-0 mt-0.5">
                      <User size={15} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-[#0f172a]">
                          {order.customerName}
                        </span>
                        <span className="text-[11px] font-medium text-[#64748b] num-mono">
                          {order.orderNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748b] flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-[#94a3b8] shrink-0" />
                        <span className="truncate max-w-[280px]">
                          {order.deliveryAddress}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Center: Containers & Schedule */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-[12px]">
                    <div>
                      <span className="font-medium text-[#0f172a] num-mono">
                        {order.verifiedCount}x
                      </span>{' '}
                      <span className="text-[#475569]">{order.presetName}</span>
                      {order.emptyContainersToPickup > 0 && (
                        <span className="text-[11px] text-[#0284c7] ml-2 num-mono">
                          +{order.emptyContainersToPickup} empty return
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[#64748b] text-[11px] num-mono">
                      <Clock size={11} />
                      <span>{order.scheduledTimeSlot}</span>
                    </div>
                  </div>

                  {/* Right: Document & Total */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                    {/* Status Pill */}
                    <div>
                      {isInvoice ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#fffbeb] text-[#92400e] border border-[#fde68a] text-[11px] font-medium num-mono">
                          <FileText size={11} />
                          <span>{order.invoiceNumber} Pre-dispatch</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] text-[11px] font-medium num-mono">
                          <Receipt size={11} />
                          <span>{order.receiptNumber ?? '#OR Cleared'}</span>
                        </span>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="text-right min-w-[90px]">
                      <div className="text-[14px] font-semibold text-[#0f172a] num-mono">
                        ₱{order.totalDue.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-[#64748b]">
                        {getReadablePaymentLabel(order.paymentState)}
                      </div>
                    </div>

                    {/* Expand Arrow */}
                    <button
                      type="button"
                      aria-label="Expand order details"
                      className="p-1 text-[#94a3b8] hover:text-[#0f172a]"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Action Drawer */}
                {isExpanded && (
                  <div className="border-t border-[#e2e8f0] bg-[#f8fafc] p-4 text-[12px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Breakdown */}
                      <div className="bg-white border border-[#e2e8f0] rounded-[6px] p-3 flex flex-col gap-1.5">
                        <div className="text-[11px] font-semibold uppercase text-[#94a3b8] tracking-wider mb-1">
                          Billing Breakdown
                        </div>
                        <div className="flex justify-between text-[#475569]">
                          <span>
                            Water Refill ({order.verifiedCount} × ₱
                            {(order.unitPrice).toFixed(2)})
                          </span>
                          <span className="num-mono text-[#0f172a]">
                            ₱{(order.verifiedCount * order.unitPrice).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#475569]">
                          <span>Rider Delivery &amp; Handling</span>
                          <span className="num-mono text-[#0f172a]">
                            ₱{order.deliveryFee.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-px bg-[#e2e8f0] my-1" />
                        <div className="flex justify-between font-semibold text-[#0f172a]">
                          <span>Total Collectible</span>
                          <span className="num-mono text-[13px]">
                            ₱{order.totalDue.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-[#15803d]">
                          <span>Net Station Profit</span>
                          <span className="num-mono">
                            +₱{order.netProfit.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Convert to Receipt / Payment Action */}
                      <div className="bg-white border border-[#e2e8f0] rounded-[6px] p-3 flex flex-col justify-between gap-3">
                        <div>
                          <div className="text-[11px] font-semibold uppercase text-[#94a3b8] tracking-wider mb-1">
                            {isInvoice
                              ? 'Issue Official Receipt (#OR)'
                              : 'Official Receipt Completed'}
                          </div>
                          <p className="text-[11px] text-[#64748b]">
                            {isInvoice
                              ? 'Deliveries depart under Pre-dispatch Invoice. Confirm payment below to issue the BIR-compliant Official Receipt.'
                              : `Official receipt ${order.receiptNumber ?? ''} issued and logged into daily sales ledger.`}
                          </p>
                        </div>

                        {isInvoice && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                props.onConvertInvoiceToReceipt(order.id, 'PAID_CASH')
                              }
                              className="btn-primary text-[11px] py-1.5 px-3"
                            >
                              <Banknote size={13} />
                              <span>Paid Full (Cash)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                props.onConvertInvoiceToReceipt(
                                  order.id,
                                  'E_PAYMENT',
                                )
                              }
                              className="btn-secondary text-[11px] py-1.5 px-3"
                            >
                              <Smartphone size={13} className="text-[#0284c7]" />
                              <span>GCash / Maya QR</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                props.onConvertInvoiceToReceipt(order.id, 'PARTIAL')
                              }
                              className="btn-secondary text-[11px] py-1.5 px-3"
                            >
                              <span>Partial Deposit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                props.onConvertInvoiceToReceipt(
                                  order.id,
                                  'UNPAID_CHARGE_SLIP',
                                )
                              }
                              className="btn-secondary text-[11px] py-1.5 px-3 text-[#b91c1c]"
                            >
                              <span>Unpaid Charge Slip</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ====================================================================
          4. PAGINATION FOOTER
          ==================================================================== */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-[12px] text-[#64748b] pt-2">
          <div>
            Showing <span className="num-mono font-medium">{startIndex + 1}</span>–
            <span className="num-mono font-medium">{endIndex}</span> of{' '}
            <span className="num-mono font-medium">{totalOrdersCount}</span> orders
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage(safeCurrentPage - 1)}
              className="p-1 rounded-[4px] border border-[#e2e8f0] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 num-mono">
              {safeCurrentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage(safeCurrentPage + 1)}
              className="p-1 rounded-[4px] border border-[#e2e8f0] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
