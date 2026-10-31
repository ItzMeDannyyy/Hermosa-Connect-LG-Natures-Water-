/**
 * ============================================================================
 * FILE: src/components/pos/ProfitTrackerCards.tsx
 * PURPOSE: Typography-first station operational cash financial ledger bar.
 *          - One unified container split by 1px hairlines.
 *          - Strictly cash-only payments (Cash Drawer & Unpaid Receivables).
 *          - High-contrast tabular numbers (IBM Plex Mono).
 *          - Strictly Lucide vector icons, zero Unicode emojis.
 * ============================================================================
 */

import { Banknote, Calendar, DollarSign, Droplets, ReceiptText } from 'lucide-react';
import type { ProfitSummaryMetrics } from '../../types/pos.types';

interface ProfitTrackerCardsProps {
  metrics: ProfitSummaryMetrics;
}

export function formatCurrentStationDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const day = String(date.getDate()).padStart(2, '0');
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  return `${year}, ${month} ${day} - ${weekday}`;
}

export function ProfitTrackerCards(props: ProfitTrackerCardsProps) {
  const formattedTodayDate = formatCurrentStationDate();

  return (
    <div className="flex flex-col gap-2">
      {/* Date Header Strip Before Cards */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-[#0f172a]">
          <Calendar size={15} className="text-[#0284c7]" />
          <span className="text-[13px] sm:text-[14px] font-bold text-[#0f172a] num-mono tracking-tight">
            {formattedTodayDate}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#64748b]">
          <span className="w-2 h-2 rounded-full bg-[#15803d]" />
          <span>Live Station Sales</span>
        </div>
      </div>

      {/* Cards: Gross Sales, Cash Collected, Unpaid Receivables, Refills Dispensed */}
      <section className="bg-white border border-[#e2e8f0] rounded-[10px] overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#e2e8f0]">
        {/* Metric 1: Gross Sales Revenue */}
        <div className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[12px] font-medium text-[#64748b]">
            <span>Gross sales today</span>
            <DollarSign size={14} className="text-[#0284c7]" />
          </div>
          <div className="my-2">
            <span className="text-[24px] font-semibold text-[#0f172a] tracking-tight num-mono">
              ₱{props.metrics.grossSalesRevenue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="text-[12px] text-[#64748b]">
            <span className="num-mono font-medium text-[#334155]">
              {props.metrics.totalOrdersCount}
            </span>{' '}
            orders logged today
          </div>
        </div>

        {/* Metric 2: Cash Drawer Collections */}
        <div className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[12px] font-medium text-[#64748b]">
            <span>Cash collected</span>
            <Banknote size={14} className="text-[#15803d]" />
          </div>
          <div className="my-2">
            <span className="text-[24px] font-semibold text-[#15803d] tracking-tight num-mono">
              ₱{props.metrics.cashCollected.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="text-[12px] text-[#64748b]">
            Physical cash on-hand in counter drawer
          </div>
        </div>

        {/* Metric 3: Unpaid Receivables */}
        <div className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[12px] font-medium text-[#64748b]">
            <span>Unpaid receivables</span>
            <ReceiptText size={14} className="text-[#b91c1c]" />
          </div>
          <div className="my-2">
            <span className="text-[24px] font-semibold text-[#b91c1c] tracking-tight num-mono">
              ₱{props.metrics.unpaidReceivablesAdded.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="text-[12px] text-[#64748b]">
            Pending balances on charge slips
          </div>
        </div>

        {/* Metric 4: Refill Gallons Dispensed */}
        <div className="p-4 flex flex-col justify-between bg-[#fcfdfd]">
          <div className="flex items-center justify-between text-[12px] font-medium text-[#64748b]">
            <span>Refills dispensed</span>
            <Droplets size={14} className="text-[#0284c7]" />
          </div>
          <div className="my-2">
            <span className="text-[24px] font-semibold text-[#0f172a] tracking-tight num-mono">
              {props.metrics.totalContainersRefilled}{' '}
              <span className="text-[14px] font-normal text-[#64748b]">
                gallons
              </span>
            </span>
          </div>
          <div className="text-[12px] text-[#64748b]">
            <span className="num-mono font-medium text-[#334155]">
              {props.metrics.totalEmptyContainersPickedUp}
            </span>{' '}
            empty jugs retrieved
          </div>
        </div>
      </div>
    </section>
  </div>
);
}
