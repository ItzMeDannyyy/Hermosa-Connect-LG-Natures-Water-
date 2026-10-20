/**
 * ============================================================================
 * FILE: src/components/pos/EndOfDayReportModal.tsx
 * PURPOSE: Implements Wireframe W3 (Feature 03: One-Tap End-of-Day Report).
 *          Styled with Tailwind CSS and Lucide icons (lucide-react) strictly.
 * ============================================================================
 */

import {
  Award,
  Banknote,
  ClipboardList,
  Droplets,
  FileBarChart,
  Printer,
  RefreshCw,
  Smartphone,
  X,
  Zap,
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

  function handlePrintReport() {
    window.print();
  }

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl p-6">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
              <FileBarChart size={20} className="text-blue-600" />
              <span>1-Tap End-of-Day Closing Report</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {props.branchName} • {todayFormatted} • Operator:{' '}
              <strong className="text-slate-700">{props.operatorName}</strong>
            </p>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            onClick={props.onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Report Content Sections */}
        <div className="flex flex-col gap-3.5">
          {/* Section 1: Operations & Container Volume */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 mb-2">
              1. OPERATIONS &amp; CONTAINER VOLUME
            </h4>
            <div className="flex justify-between text-xs text-slate-700 py-1">
              <span>Total Orders Processed:</span>
              <strong className="font-bold text-slate-900">
                {props.metrics.totalOrdersCount} Orders
              </strong>
            </div>
            <div className="flex justify-between text-xs text-slate-700 py-1">
              <span>Total Water Containers Refilled:</span>
              <strong className="font-bold text-slate-900">
                {props.metrics.totalContainersRefilled} Containers
              </strong>
            </div>
            <div className="flex justify-between text-xs text-slate-700 py-1">
              <span>Total Empty Containers Collected:</span>
              <strong className="font-bold text-slate-900">
                {props.metrics.totalEmptyContainersPickedUp} Containers
              </strong>
            </div>
          </div>

          {/* Section 2: Gross Sales by Payment State */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 mb-2">
              2. GROSS SALES BY PAYMENT STATE
            </h4>
            <div className="flex justify-between items-center text-xs text-slate-700 py-1">
              <span className="inline-flex items-center gap-1.5">
                <Banknote size={15} className="text-slate-400" />
                <span>Cash Collected at Door / Counter:</span>
              </span>
              <span className="font-semibold">
                PHP {props.metrics.cashCollected.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-700 py-1">
              <span className="inline-flex items-center gap-1.5">
                <Smartphone size={15} className="text-slate-400" />
                <span>GCash / Maya E-Payment Collected:</span>
              </span>
              <span className="font-semibold">
                PHP {props.metrics.ePaymentCollected.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-700 py-1">
              <span className="inline-flex items-center gap-1.5">
                <ClipboardList size={15} className="text-slate-400" />
                <span>Partial / Unpaid Charge Slips Added:</span>
              </span>
              <span className="font-semibold">
                PHP {props.metrics.unpaidReceivablesAdded.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-900 pt-2 mt-1.5 border-t border-slate-200">
              <strong className="font-extrabold">Gross Sales Revenue:</strong>
              <strong className="font-extrabold">
                PHP {props.metrics.grossSalesRevenue.toFixed(2)}
              </strong>
            </div>
          </div>

          {/* Section 3: Deducted Cost of Refill & True Net Profit */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 mb-2">
              3. DEDUCTED COST OF REFILL (TRUE PROFIT ENGINE)
            </h4>
            <div className="flex justify-between items-center text-xs text-slate-700 py-1">
              <span className="inline-flex items-center gap-1.5">
                <Droplets size={15} className="text-slate-400" />
                <span>Water Filtration Cost (PHP 3.00 / jug):</span>
              </span>
              <span className="font-semibold text-red-600">
                - PHP {props.metrics.waterCostTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-700 py-1">
              <span className="inline-flex items-center gap-1.5">
                <Zap size={15} className="text-slate-400" />
                <span>Electricity &amp; Pump Cost (PHP 3.00 / jug):</span>
              </span>
              <span className="font-semibold text-red-600">
                - PHP {props.metrics.electricityCostTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-700 py-1">
              <span className="inline-flex items-center gap-1.5">
                <RefreshCw size={15} className="text-slate-400" />
                <span>Container Cap, Seal &amp; Wear (PHP 2.00 / jug):</span>
              </span>
              <span className="font-semibold text-red-600">
                - PHP {props.metrics.containerWearCostTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-emerald-700 pt-2.5 mt-1.5 border-t-2 border-emerald-500">
              <strong className="inline-flex items-center gap-1.5 font-extrabold">
                <Award size={17} />
                <span>TRUE NET PROFIT TODAY:</span>
              </strong>
              <strong className="font-extrabold">
                PHP {props.metrics.trueNetProfit.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2.5 mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            onClick={props.onClose}
          >
            Close Report
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-colors cursor-pointer"
            onClick={handlePrintReport}
          >
            <Printer size={15} />
            <span>Print / Export Closing Summary</span>
          </button>
        </div>
      </div>
    </div>
  );
}
