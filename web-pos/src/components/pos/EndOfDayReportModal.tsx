/**
 * ============================================================================
 * FILE: src/components/pos/EndOfDayReportModal.tsx
 * PURPOSE: End-of-Day Z-Reading Closing Report conforming to tasteskill v2 framed-sheet.
 *          - High-contrast tabular figures (IBM Plex Mono).
 *          - Flat, engineered surface with 1px border, no backdrop blur.
 *          - True net cash & operational cost reconciliation.
 *          - Strictly Lucide vector icons, zero Unicode emojis.
 * ============================================================================
 */

import {
  Banknote,
  FileBarChart,
  Printer,
  Smartphone,
  X,
} from 'lucide-react';
import type { ProfitSummaryMetrics } from '../../types/pos.types';

interface EndOfDayReportModalProps {
  isOpen: boolean;
  branchName: string;
  operatorName: string;
  metrics: ProfitSummaryMetrics;
  onClose: () => void;
}

export function EndOfDayReportModal(props: EndOfDayReportModalProps) {
  if (!props.isOpen) {
    return null;
  }

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-[#0f172a]/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-[#cbd5e1] rounded-[10px] w-full max-w-lg p-5 text-[12px]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 mb-3 border-b border-[#e2e8f0]">
          <div>
            <div className="flex items-center gap-2">
              <FileBarChart size={16} className="text-[#0284c7]" />
              <h3 className="text-[14px] font-semibold text-[#0f172a]">
                End-of-Day Closing Report (Z-Reading)
              </h3>
            </div>
            <p className="text-[11px] text-[#64748b] mt-0.5">
              {props.branchName} · {todayFormatted} · Operator: {props.operatorName}
            </p>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="p-1 rounded-[4px] border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc] cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content Breakdown */}
        <div className="flex flex-col gap-3 font-mono text-[11px]">
          {/* Operations & Volume */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] p-3">
            <div className="text-[10px] font-semibold uppercase text-[#64748b] tracking-wider mb-2 font-sans">
              1. Volume &amp; Operations
            </div>
            <div className="flex justify-between py-0.5 text-[#334155]">
              <span>Total Orders Processed:</span>
              <span className="font-semibold text-[#0f172a]">
                {props.metrics.totalOrdersCount} orders
              </span>
            </div>
            <div className="flex justify-between py-0.5 text-[#334155]">
              <span>Refill Jugs Filled:</span>
              <span className="font-semibold text-[#0f172a]">
                {props.metrics.totalContainersRefilled} gallons
              </span>
            </div>
            <div className="flex justify-between py-0.5 text-[#334155]">
              <span>Empty Jugs Collected:</span>
              <span className="font-semibold text-[#0f172a]">
                {props.metrics.totalEmptyContainersPickedUp} gallons
              </span>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] p-3">
            <div className="text-[10px] font-semibold uppercase text-[#64748b] tracking-wider mb-2 font-sans">
              2. Revenue by Payment Tender
            </div>
            <div className="flex justify-between py-0.5 text-[#334155]">
              <span className="flex items-center gap-1">
                <Banknote size={12} className="text-[#64748b]" />
                <span>Cash Drawer Intake:</span>
              </span>
              <span className="font-semibold text-[#0f172a]">
                ₱{props.metrics.cashCollected.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-0.5 text-[#334155]">
              <span className="flex items-center gap-1">
                <Smartphone size={12} className="text-[#64748b]" />
                <span>GCash / Maya Digital:</span>
              </span>
              <span className="font-semibold text-[#0f172a]">
                ₱{props.metrics.ePaymentCollected.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-0.5 text-[#334155]">
              <span>Unpaid Charge Slips:</span>
              <span className="font-semibold text-[#b91c1c]">
                ₱{props.metrics.unpaidReceivablesAdded.toFixed(2)}
              </span>
            </div>
            <div className="h-px bg-[#e2e8f0] my-1.5" />
            <div className="flex justify-between font-bold text-[#0f172a] text-[12px]">
              <span>Gross Sales Total:</span>
              <span>₱{props.metrics.grossSalesRevenue.toFixed(2)}</span>
            </div>
          </div>

          {/* Utility Deductions & True Net Profit */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] p-3">
            <div className="text-[10px] font-semibold uppercase text-[#64748b] tracking-wider mb-2 font-sans">
              3. Operational Cost Deductions
            </div>
            <div className="flex justify-between py-0.5 text-[#334155]">
              <span>Raw Deepwell Water:</span>
              <span>−₱{props.metrics.waterCostTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-0.5 text-[#334155]">
              <span>RO/UV Purification Power:</span>
              <span>−₱{props.metrics.electricityCostTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-0.5 text-[#334155]">
              <span>Sanitization &amp; Wear:</span>
              <span>−₱{props.metrics.containerWearCostTotal.toFixed(2)}</span>
            </div>
            <div className="h-px bg-[#e2e8f0] my-1.5" />
            <div className="flex justify-between font-bold text-[#15803d] text-[12px]">
              <span>True Net Profit:</span>
              <span>₱{props.metrics.trueNetProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-[#e2e8f0]">
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-primary flex-1 py-2 text-[12px]"
          >
            <Printer size={14} />
            <span>Print Z-Reading</span>
          </button>
          <button
            type="button"
            onClick={props.onClose}
            className="btn-secondary py-2 px-4 text-[12px]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
