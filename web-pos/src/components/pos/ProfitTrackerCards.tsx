/**
 * ============================================================================
 * FILE: src/components/pos/ProfitTrackerCards.tsx
 * PURPOSE: Typography-first station operational ledger bar following tasteskill v2.
 *          - One unified container split by 1px hairlines.
 *          - No icons in colored circles, no sparklines.
 *          - High-contrast tabular numbers (IBM Plex Mono) with muted unit suffixes.
 *          - Sentence-case labels and explicit baselines.
 *          - Strictly Lucide vector icons, zero Unicode emojis.
 * ============================================================================
 */

import type {
  CustomerAccountabilityRecord,
  ProfitSummaryMetrics,
} from '../../types/pos.types';

interface ProfitTrackerCardsProps {
  metrics: ProfitSummaryMetrics;
  customerRecords: CustomerAccountabilityRecord[];
}

export function ProfitTrackerCards(props: ProfitTrackerCardsProps) {
  let totalEmptyJugsOut = 0;
  let overdueCustomersCount = 0;

  for (const record of props.customerRecords) {
    totalEmptyJugsOut += record.emptyContainersHeld;
    if (record.isOverdue) {
      overdueCustomersCount += 1;
    }
  }

  const profitMarginPercent =
    props.metrics.grossSalesRevenue > 0
      ? Math.round(
          (props.metrics.trueNetProfit / props.metrics.grossSalesRevenue) * 100,
        )
      : 0;

  const avgProfitPerContainer =
    props.metrics.totalContainersRefilled > 0
      ? props.metrics.trueNetProfit / props.metrics.totalContainersRefilled
      : 0;

  return (
    <section className="bg-white border border-[#e2e8f0] rounded-[10px] overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#e2e8f0]">
        {/* Metric 1: Gross Sales Revenue */}
        <div className="p-4 flex flex-col justify-between">
          <div className="text-[12px] font-medium text-[#64748b]">
            Gross sales today
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
            orders ({props.metrics.totalContainersRefilled} refills logged)
          </div>
        </div>

        {/* Metric 2: Operational Cost Deductions */}
        <div className="p-4 flex flex-col justify-between">
          <div className="text-[12px] font-medium text-[#64748b]">
            Refill cost deductions
          </div>
          <div className="my-2">
            <span className="text-[24px] font-semibold text-[#475569] tracking-tight num-mono">
              −₱{props.metrics.totalCostOfRefill.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="text-[12px] text-[#64748b] truncate">
            Water ₱{props.metrics.waterCostTotal} · Power ₱{props.metrics.electricityCostTotal} · Wear ₱{props.metrics.containerWearCostTotal}
          </div>
        </div>

        {/* Metric 3: True Net Station Profit */}
        <div className="p-4 flex flex-col justify-between bg-[#fcfdfd]">
          <div className="flex items-center justify-between text-[12px] font-medium text-[#64748b]">
            <span className="text-[#0f172a] font-semibold">True net profit</span>
            <span className="text-[11px] font-medium text-[#15803d] num-mono">
              +{profitMarginPercent}% margin
            </span>
          </div>
          <div className="my-2">
            <span className="text-[24px] font-semibold text-[#15803d] tracking-tight num-mono">
              ₱{props.metrics.trueNetProfit.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="text-[12px] text-[#64748b]">
            Average +₱{avgProfitPerContainer.toFixed(2)} / container
          </div>
        </div>

        {/* Metric 4: Container Fleet Accountability */}
        <div className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[12px] font-medium text-[#64748b]">
            <span>Container accountability</span>
            {overdueCustomersCount > 0 && (
              <span className="text-[11px] font-semibold text-[#b91c1c] num-mono">
                {overdueCustomersCount} overdue
              </span>
            )}
          </div>
          <div className="my-2">
            <span className="text-[24px] font-semibold text-[#0f172a] tracking-tight num-mono">
              {totalEmptyJugsOut}{' '}
              <span className="text-[14px] font-normal text-[#64748b]">
                gallons out
              </span>
            </span>
          </div>
          <div className="text-[12px] text-[#64748b]">
            <span className="num-mono font-medium text-[#334155]">
              {props.metrics.totalEmptyContainersPickedUp}
            </span>{' '}
            empty jugs collected today
          </div>
        </div>
      </div>
    </section>
  );
}
