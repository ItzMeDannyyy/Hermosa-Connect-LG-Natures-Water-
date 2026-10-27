/**
 * ============================================================================
 * FILE: src/components/pos/TransactionLogsPanel.tsx
 * PURPOSE: Historical Transaction Audit Ledger adhering to tasteskill v2 framed-sheet.
 *          - High-density chronological transaction audit ledger.
 *          - Date filters: Today, Yesterday, Last 7 Days, and All.
 *          - Tabular numbers with right alignment (IBM Plex Mono).
 *          - 58mm Digital Thermal Receipt Modal preview.
 *          - Strictly Lucide vector icons, zero Unicode emojis.
 * ============================================================================
 */

import {
  ChevronLeft,
  ChevronRight,
  FileText,
  MapPin,
  Printer,
  Receipt,
  Search,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  calculateProfitSummaryMetrics,
  filterHistoricalOrders,
} from '../../data/initialPosData';
import type {
  PaymentState,
  PosOrderItem,
  TransactionLogsFilter,
} from '../../types/pos.types';

interface TransactionLogsPanelProps {
  orders: PosOrderItem[];
  onOpenRegisterCustomer?: () => void;
}

const LOGS_PER_PAGE = 12;

export function TransactionLogsPanel(props: TransactionLogsPanelProps) {
  const [dateRange, setDateRange] = useState<
    'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'ALL'
  >('TODAY');
  const [specificDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | PaymentState>(
    'ALL',
  );
  const [sortOrder] = useState<'NEWEST_FIRST' | 'OLDEST_FIRST'>(
    'NEWEST_FIRST',
  );

  const [selectedReceiptOrder, setSelectedReceiptOrder] =
    useState<PosOrderItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filterParams: TransactionLogsFilter = useMemo(
    () => ({
      dateRange,
      specificDate: specificDate || undefined,
      searchQuery,
      paymentStateFilter: paymentFilter,
      sortOrder,
    }),
    [dateRange, specificDate, searchQuery, paymentFilter, sortOrder],
  );

  const filteredOrders = useMemo(
    () => filterHistoricalOrders(props.orders, filterParams),
    [props.orders, filterParams],
  );

  const summaryMetrics = useMemo(
    () => calculateProfitSummaryMetrics(filteredOrders),
    [filteredOrders],
  );

  const totalOrdersCount = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalOrdersCount / LOGS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * LOGS_PER_PAGE;
  const endIndex = Math.min(startIndex + LOGS_PER_PAGE, totalOrdersCount);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col gap-4">
      {/* ====================================================================
          1. TITLE ROW
          ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-[#0f172a] tracking-tight">
            Transaction &amp; Sales Audit Logs
          </h1>
          <p className="text-[12px] text-[#64748b] mt-0.5">
            Chronological audit of completed sales, official receipts (#OR), and daily reconciliation.
          </p>
        </div>
      </div>

      {/* ====================================================================
          2. SUMMARY ROW (Quiet 1px divider container)
          ==================================================================== */}
      <div className="bg-white border border-[#e2e8f0] rounded-[8px] overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#e2e8f0]">
          <div className="p-3.5">
            <div className="text-[11px] font-medium text-[#64748b]">
              Filtered gross sales
            </div>
            <div className="text-[20px] font-semibold text-[#0f172a] num-mono mt-1">
              ₱{summaryMetrics.grossSalesRevenue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-[11px] text-[#64748b] mt-0.5">
              Across <span className="num-mono font-medium">{summaryMetrics.totalOrdersCount}</span> logged orders
            </div>
          </div>

          <div className="p-3.5">
            <div className="text-[11px] font-medium text-[#64748b]">
              Volume refilled
            </div>
            <div className="text-[20px] font-semibold text-[#0f172a] num-mono mt-1">
              {summaryMetrics.totalContainersRefilled}{' '}
              <span className="text-[12px] font-normal text-[#64748b]">gallons</span>
            </div>
            <div className="text-[11px] text-[#64748b] mt-0.5">
              {summaryMetrics.totalEmptyContainersPickedUp} empty containers retrieved
            </div>
          </div>

          <div className="p-3.5">
            <div className="text-[11px] font-medium text-[#64748b]">
              Net station profit
            </div>
            <div className="text-[20px] font-semibold text-[#15803d] num-mono mt-1">
              ₱{summaryMetrics.trueNetProfit.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-[11px] text-[#64748b] mt-0.5">
              Less ₱{summaryMetrics.totalCostOfRefill.toFixed(2)} operational utility costs
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. FILTER TOOLBAR
          ==================================================================== */}
      <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Date scope buttons */}
        <div className="flex items-center gap-1 bg-[#f1f5f9] p-0.5 rounded-[6px] w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              setDateRange('TODAY');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 text-[12px] font-medium rounded-[4px] cursor-pointer transition-colors ${
              dateRange === 'TODAY'
                ? 'bg-white text-[#0f172a] shadow-xs font-semibold'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => {
              setDateRange('YESTERDAY');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 text-[12px] font-medium rounded-[4px] cursor-pointer transition-colors ${
              dateRange === 'YESTERDAY'
                ? 'bg-white text-[#0f172a] shadow-xs font-semibold'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Yesterday
          </button>
          <button
            type="button"
            onClick={() => {
              setDateRange('LAST_7_DAYS');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 text-[12px] font-medium rounded-[4px] cursor-pointer transition-colors ${
              dateRange === 'LAST_7_DAYS'
                ? 'bg-white text-[#0f172a] shadow-xs font-semibold'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => {
              setDateRange('ALL');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 text-[12px] font-medium rounded-[4px] cursor-pointer transition-colors ${
              dateRange === 'ALL'
                ? 'bg-white text-[#0f172a] shadow-xs font-semibold'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            All
          </button>
        </div>

        {/* Payment Filter dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value as 'ALL' | PaymentState);
              setCurrentPage(1);
            }}
            className="bg-white border border-[#e2e8f0] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#0f172a] outline-none"
          >
            <option value="ALL">All Payment Types</option>
            <option value="PAID_CASH">Cash Only</option>
            <option value="E_PAYMENT">GCash / Maya QR</option>
            <option value="PARTIAL">Partial Deposit</option>
            <option value="UNPAID_CHARGE_SLIP">Unpaid Charge Slip</option>
          </select>

          {/* Search */}
          <div className="relative w-full md:w-64">
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
              placeholder="Search order #, customer..."
              className="w-full bg-[#ffffff] border border-[#e2e8f0] focus:border-[#0284c7] rounded-[6px] pl-8 pr-3 py-1.5 text-[12px] text-[#0f172a] outline-none"
            />
          </div>
        </div>
      </div>

      {/* ====================================================================
          4. TRANSACTION TABLE
          ==================================================================== */}
      <div className="bg-white border border-[#e2e8f0] rounded-[8px] overflow-hidden">
        {paginatedOrders.length === 0 ? (
          <div className="p-8 text-center text-[#64748b] text-[13px]">
            No historical records found for this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] font-medium text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-4">Date &amp; Document</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Refill Items</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                  <th className="py-2.5 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {paginatedOrders.map((order) => {
                  const isOfficialReceipt = Boolean(order.receiptNumber);

                  return (
                    <tr key={order.id} className="hover:bg-[#fcfdfd] transition-colors">
                      {/* Date & Document */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {isOfficialReceipt ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] text-[11px] font-semibold num-mono">
                              <Receipt size={11} />
                              <span>{order.receiptNumber}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#fffbeb] text-[#92400e] border border-[#fde68a] text-[11px] font-semibold num-mono">
                              <FileText size={11} />
                              <span>{order.invoiceNumber}</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#64748b] num-mono mt-0.5">
                          {order.invoicedAt}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#0f172a]">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-[#64748b] flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="text-[#94a3b8]" />
                          <span className="truncate max-w-[220px]">
                            {order.deliveryAddress}
                          </span>
                        </div>
                      </td>

                      {/* Refill Items */}
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-medium text-[#0f172a] num-mono">
                            {order.verifiedCount}x
                          </span>{' '}
                          <span className="text-[#475569]">{order.presetName}</span>
                        </div>
                        {order.emptyContainersToPickup > 0 && (
                          <div className="text-[11px] text-[#64748b] num-mono">
                            Retrieved {order.emptyContainersToPickup} empty jugs
                          </div>
                        )}
                      </td>

                      {/* Amount & Method */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-semibold text-[#0f172a] num-mono text-[13px]">
                          ₱{order.totalDue.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-[#64748b]">
                          {order.paymentState === 'PAID_CASH'
                            ? 'Cash'
                            : order.paymentState === 'E_PAYMENT'
                            ? 'E-Payment'
                            : order.paymentState === 'PARTIAL'
                            ? 'Partial'
                            : 'Charge Slip'}
                        </div>
                      </td>

                      {/* Print Receipt */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedReceiptOrder(order)}
                          className="p-1.5 rounded-[4px] border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                          title="View & Print 58mm Receipt"
                        >
                          <Printer size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ====================================================================
          5. PAGINATION
          ==================================================================== */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-[12px] text-[#64748b] pt-2">
          <div>
            Showing <span className="num-mono font-medium">{startIndex + 1}</span>–
            <span className="num-mono font-medium">{endIndex}</span> of{' '}
            <span className="num-mono font-medium">{totalOrdersCount}</span> records
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

      {/* ====================================================================
          6. DIGITAL THERMAL RECEIPT MODAL (58mm Preview)
          ==================================================================== */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 bg-[#0f172a]/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#cbd5e1] rounded-[8px] max-w-sm w-full p-5 text-[12px]">
            <div className="flex items-start justify-between pb-3 border-b border-[#e2e8f0] mb-3">
              <div>
                <div className="font-semibold text-[#0f172a] text-[13px]">
                  LG Nature&apos;s Water
                </div>
                <div className="text-[11px] text-[#64748b]">
                  Station #01 · Loyola Heights Hub, QC
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="text-[#64748b] hover:text-[#0f172a]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="flex flex-col gap-2 font-mono text-[11px] text-[#334155] border-b border-dashed border-[#cbd5e1] pb-3 mb-3">
              <div className="flex justify-between">
                <span>DOC REF:</span>
                <span className="font-semibold">
                  {selectedReceiptOrder.receiptNumber ??
                    selectedReceiptOrder.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{selectedReceiptOrder.invoicedAt}</span>
              </div>
              <div className="flex justify-between">
                <span>CUSTOMER:</span>
                <span className="truncate max-w-[170px]">
                  {selectedReceiptOrder.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span>DESTINATION:</span>
                <span className="truncate max-w-[170px]">
                  {selectedReceiptOrder.deliveryAddress}
                </span>
              </div>
              <div className="h-px bg-[#e2e8f0] my-1" />
              <div className="flex justify-between font-semibold text-[#0f172a]">
                <span>
                  {selectedReceiptOrder.verifiedCount}x {selectedReceiptOrder.presetName}
                </span>
                <span>
                  ₱
                  {(
                    selectedReceiptOrder.verifiedCount *
                    selectedReceiptOrder.unitPrice
                  ).toFixed(2)}
                </span>
              </div>
              {selectedReceiptOrder.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>DELIVERY FEE:</span>
                  <span>₱{selectedReceiptOrder.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="h-px bg-[#e2e8f0] my-1" />
              <div className="flex justify-between text-[12px] font-bold text-[#0f172a]">
                <span>TOTAL DUE:</span>
                <span>₱{selectedReceiptOrder.totalDue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#15803d]">
                <span>PAYMENT STATUS:</span>
                <span>{selectedReceiptOrder.paymentState}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-[#64748b] mb-4">
              Thank you for trusting LG Nature&apos;s Water Station!
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-primary flex-1 text-[12px] py-2"
              >
                <Printer size={14} />
                <span>Print Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="btn-secondary text-[12px] py-2 px-3"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
