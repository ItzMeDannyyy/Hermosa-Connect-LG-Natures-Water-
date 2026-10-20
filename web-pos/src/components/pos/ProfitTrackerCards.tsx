/**
 * ============================================================================
 * FILE: src/components/pos/ProfitTrackerCards.tsx
 * PURPOSE: Renders the 4 top KPI cards from Wireframe W1.
 *          Styled entirely with Tailwind CSS and Lucide SVG icons.
 * ============================================================================
 */

import {
  Banknote,
  PackageCheck,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react';
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
    totalEmptyJugsOut = totalEmptyJugsOut + record.emptyContainersHeld;
    if (record.isOverdue) {
      overdueCustomersCount = overdueCustomersCount + 1;
    }
  }

  // Calculate operational profit margin percentage and per-container net profit
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
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Gross Sales Revenue */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            GROSS SALES REVENUE
          </span>
          <span className="w-8.5 h-8.5 rounded-lg bg-sky-100 text-sky-600 inline-flex items-center justify-center shrink-0">
            <Banknote size={17} />
          </span>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1.5">
          PHP {props.metrics.grossSalesRevenue.toFixed(2)}
        </div>
        <div className="text-xs text-slate-500">
          {props.metrics.totalOrdersCount} orders •{' '}
          {props.metrics.totalContainersRefilled} containers refilled
        </div>
      </div>

      {/* Card 2: Cost of Refill Deducted */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            COST OF REFILL
          </span>
          <span className="w-8.5 h-8.5 rounded-lg bg-amber-100 text-amber-600 inline-flex items-center justify-center shrink-0">
            <SlidersHorizontal size={17} />
          </span>
        </div>
        <div className="text-2xl font-extrabold text-amber-700 tracking-tight mb-1.5">
          - PHP {props.metrics.totalCostOfRefill.toFixed(2)}
        </div>
        <div className="text-xs text-slate-500">
          Water PHP {props.metrics.waterCostTotal} • Elec PHP{' '}
          {props.metrics.electricityCostTotal} • Wear PHP{' '}
          {props.metrics.containerWearCostTotal}
        </div>
      </div>

      {/* Card 3: True Net Profit */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            NET PROFIT
          </span>
          <span className="w-8.5 h-8.5 rounded-lg bg-emerald-100 text-emerald-600 inline-flex items-center justify-center shrink-0">
            <TrendingUp size={17} />
          </span>
        </div>
        <div className="text-2xl font-extrabold text-emerald-600 tracking-tight mb-1.5">
          PHP {props.metrics.trueNetProfit.toFixed(2)}
        </div>
        <div className="text-xs text-slate-500">
          <span className="text-emerald-600 font-bold">
            {profitMarginPercent}% margin
          </span>{' '}
          • PHP {avgProfitPerContainer.toFixed(2)} net / container
        </div>
      </div>

      {/* Card 4: Empty Containers Out */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            EMPTY CONTAINERS OUT
          </span>
          <span className="w-8.5 h-8.5 rounded-lg bg-indigo-100 text-indigo-600 inline-flex items-center justify-center shrink-0">
            <PackageCheck size={17} />
          </span>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1.5">
          {totalEmptyJugsOut} Gallons
        </div>
        <div className="text-xs text-slate-500">
          {props.metrics.totalEmptyContainersPickedUp} collected today •{' '}
          <span
            className={
              overdueCustomersCount > 0 ? 'text-red-600 font-bold' : ''
            }
          >
            {overdueCustomersCount} overdue
          </span>
        </div>
      </div>
    </section>
  );
}
