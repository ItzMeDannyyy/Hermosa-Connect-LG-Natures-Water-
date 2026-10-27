/**
 * ============================================================================
 * FILE: src/components/pos/CustomerAccountabilityTable.tsx
 * PURPOSE: Customer Container & Balance Ledger adhering to tasteskill v2 framed-sheet.
 *          - High-density 4-column ledger (Customer, Jugs Held, Balance, Action).
 *          - Urgency strip with quiet 1px dividers.
 *          - Immediate action buttons (Settle Balance, Trigger SMS Reminder).
 *          - High-contrast tabular numbers (IBM Plex Mono).
 *          - Strictly Lucide vector icons, zero Unicode emojis.
 * ============================================================================
 */

import {
  AlertTriangle,
  Banknote,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Search,
} from 'lucide-react';
import React, { useState } from 'react';
import type { CustomerAccountabilityRecord } from '../../types/pos.types';

interface CustomerAccountabilityTableProps {
  records: CustomerAccountabilityRecord[];
  onSettleCustomerBalance: (customerId: string) => void;
  onTriggerPickupReminder: (
    customerId: string,
    customerName: string,
    isRemindAgain: boolean,
  ) => void;
}

type LedgerFilterChip = 'ALL' | 'OVERDUE' | 'WITH_BALANCE' | 'JUGS_OUT';

export function CustomerAccountabilityTable(
  props: CustomerAccountabilityTableProps,
) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<LedgerFilterChip>('ALL');
  const [showClearedCustomers, setShowClearedCustomers] =
    useState<boolean>(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Compute summary metrics
  let totalJugsOut = 0;
  let totalUnpaidPhp = 0;
  let totalOverdueCount = 0;
  let totalClearedCount = 0;

  for (let i = 0; i < props.records.length; i++) {
    const rec = props.records[i];
    totalJugsOut += rec.emptyContainersHeld;
    totalUnpaidPhp += rec.runningUnpaidBalance;

    if (rec.isOverdue && rec.emptyContainersHeld > 0) {
      totalOverdueCount += 1;
    }

    if (rec.emptyContainersHeld === 0 && rec.runningUnpaidBalance <= 0) {
      totalClearedCount += 1;
    }
  }

  // Filter records
  const filteredRecords = props.records.filter((rec) => {
    // Hidden cleared filter
    if (
      !showClearedCustomers &&
      rec.emptyContainersHeld === 0 &&
      rec.runningUnpaidBalance <= 0
    ) {
      return false;
    }

    if (activeFilter === 'OVERDUE' && (!rec.isOverdue || rec.emptyContainersHeld === 0)) {
      return false;
    }
    if (activeFilter === 'WITH_BALANCE' && rec.runningUnpaidBalance <= 0) {
      return false;
    }
    if (activeFilter === 'JUGS_OUT' && rec.emptyContainersHeld === 0) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rec.customerName.toLowerCase().includes(q) ||
        rec.phoneNumber.includes(q) ||
        rec.address.toLowerCase().includes(q)
      );
    }

    return true;
  });

  function getShortAddress(full: string): string {
    const parts = full.split(',');
    return parts[0]?.trim() || full;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ====================================================================
          1. TITLE ROW
          ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-[#0f172a] tracking-tight">
            Container &amp; Balance Ledger
          </h1>
          <p className="text-[12px] text-[#64748b] mt-0.5">
            Tracks loaned 5-gallon containers, overdue return cycles, and customer running balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 text-[12px] text-[#475569] cursor-pointer">
            <input
              type="checkbox"
              checked={showClearedCustomers}
              onChange={(e) => setShowClearedCustomers(e.target.checked)}
              className="rounded-[3px] border-[#cbd5e1] text-[#0284c7] focus:ring-0"
            />
            <span>Show cleared accounts ({totalClearedCount})</span>
          </label>
        </div>
      </div>

      {/* ====================================================================
          2. URGENCY SUMMARY STRIP (App-screens: quiet 1px hairlines)
          ==================================================================== */}
      <div className="bg-white border border-[#e2e8f0] rounded-[8px] overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#e2e8f0]">
          <div className="p-3.5">
            <div className="text-[11px] font-medium text-[#64748b]">Jugs in field</div>
            <div className="text-[20px] font-semibold text-[#0f172a] num-mono mt-1">
              {totalJugsOut} <span className="text-[12px] font-normal text-[#64748b]">gallons</span>
            </div>
          </div>

          <div className="p-3.5">
            <div className="text-[11px] font-medium text-[#64748b]">Overdue returns</div>
            <div className="text-[20px] font-semibold text-[#b91c1c] num-mono mt-1">
              {totalOverdueCount} <span className="text-[12px] font-normal text-[#64748b]">accounts</span>
            </div>
          </div>

          <div className="p-3.5">
            <div className="text-[11px] font-medium text-[#64748b]">Unpaid credit balance</div>
            <div className="text-[20px] font-semibold text-[#0f172a] num-mono mt-1">
              ₱{totalUnpaidPhp.toFixed(2)}
            </div>
          </div>

          <div className="p-3.5">
            <div className="text-[11px] font-medium text-[#64748b]">Cleared accounts</div>
            <div className="text-[20px] font-semibold text-[#15803d] num-mono mt-1">
              {totalClearedCount} <span className="text-[12px] font-normal text-[#64748b]">accounts</span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. FILTER CHIPS & SEARCH
          ==================================================================== */}
      <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1 text-[12px] font-medium rounded-[5px] cursor-pointer transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-[#0f172a] text-white'
                : 'bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            All Active
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('OVERDUE')}
            className={`px-3 py-1 text-[12px] font-medium rounded-[5px] cursor-pointer transition-colors ${
              activeFilter === 'OVERDUE'
                ? 'bg-[#b91c1c] text-white'
                : 'bg-[#f1f5f9] text-[#64748b] hover:text-[#b91c1c]'
            }`}
          >
            Overdue Jugs ({totalOverdueCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('WITH_BALANCE')}
            className={`px-3 py-1 text-[12px] font-medium rounded-[5px] cursor-pointer transition-colors ${
              activeFilter === 'WITH_BALANCE'
                ? 'bg-[#0f172a] text-white'
                : 'bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            With Balance
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('JUGS_OUT')}
            className={`px-3 py-1 text-[12px] font-medium rounded-[5px] cursor-pointer transition-colors ${
              activeFilter === 'JUGS_OUT'
                ? 'bg-[#0f172a] text-white'
                : 'bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Holding Jugs
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, phone, address..."
            className="w-full bg-[#ffffff] border border-[#e2e8f0] focus:border-[#0284c7] rounded-[6px] pl-8 pr-3 py-1.5 text-[12px] text-[#0f172a] outline-none"
          />
        </div>
      </div>

      {/* ====================================================================
          4. TABLE
          ==================================================================== */}
      <div className="bg-white border border-[#e2e8f0] rounded-[8px] overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-[#64748b] text-[13px]">
            No customer accounts found matching this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] font-medium text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-4">Customer &amp; Contact</th>
                  <th className="py-2.5 px-4">Jugs Held</th>
                  <th className="py-2.5 px-4 text-right">Running Balance</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {filteredRecords.map((rec) => {
                  const isExpanded = expandedRowId === rec.id;

                  return (
                    <React.Fragment key={rec.id}>
                      <tr className="hover:bg-[#fcfdfd] transition-colors">
                        {/* Customer */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#0f172a]">
                            {rec.customerName}
                          </div>
                          <div className="text-[11px] text-[#64748b] flex items-center gap-2 mt-0.5">
                            <span className="num-mono">{rec.phoneNumber}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 truncate max-w-[220px]">
                              <MapPin size={10} className="text-[#94a3b8]" />
                              {getShortAddress(rec.address)}
                            </span>
                          </div>
                        </td>

                        {/* Jugs Held */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#0f172a] num-mono text-[13px]">
                              {rec.emptyContainersHeld} gal
                            </span>
                            {rec.isOverdue && rec.emptyContainersHeld > 0 ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#fef2f2] text-[#b91c1c] text-[10px] font-semibold num-mono">
                                <AlertTriangle size={10} />
                                <span>Due: {rec.containersDueBackDate}</span>
                              </span>
                            ) : rec.emptyContainersHeld > 0 ? (
                              <span className="text-[11px] text-[#64748b] num-mono">
                                (Due: {rec.containersDueBackDate})
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#15803d]">All returned</span>
                            )}
                          </div>
                        </td>

                        {/* Running Balance */}
                        <td className="py-3 px-4 text-right">
                          {rec.runningUnpaidBalance > 0 ? (
                            <span className="font-semibold text-[#b91c1c] num-mono text-[13px]">
                              ₱{rec.runningUnpaidBalance.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-[#64748b] num-mono">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {rec.runningUnpaidBalance > 0 && (
                              <button
                                type="button"
                                onClick={() => props.onSettleCustomerBalance(rec.id)}
                                className="btn-secondary text-[11px] py-1 px-2.5"
                                title="Mark running balance as settled"
                              >
                                <Banknote size={12} className="text-[#15803d]" />
                                <span>Settle</span>
                              </button>
                            )}

                            {rec.emptyContainersHeld > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  props.onTriggerPickupReminder(
                                    rec.id,
                                    rec.customerName,
                                    Boolean(rec.pickupReminderSent),
                                  )
                                }
                                className={`text-[11px] py-1 px-2.5 rounded-[4px] border cursor-pointer inline-flex items-center gap-1 transition-colors ${
                                  rec.pickupReminderSent
                                    ? 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]'
                                    : 'bg-white text-[#334155] border-[#e2e8f0] hover:bg-[#f8fafc]'
                                }`}
                              >
                                {rec.pickupReminderSent ? (
                                  <>
                                    <CheckCircle2 size={12} />
                                    <span>Reminded {rec.lastRemindedAt ?? ''}</span>
                                  </>
                                ) : (
                                  <>
                                    <Bell size={12} className="text-[#0284c7]" />
                                    <span>Remind Pickup</span>
                                  </>
                                )}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedRowId(isExpanded ? null : rec.id)
                              }
                              className="p-1 text-[#94a3b8] hover:text-[#0f172a] rounded-[4px]"
                              title="Toggle account history drawer"
                            >
                              {isExpanded ? (
                                <ChevronUp size={15} />
                              ) : (
                                <ChevronDown size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Account Details */}
                      {isExpanded && (
                        <tr className="bg-[#f8fafc]">
                          <td colSpan={4} className="p-3.5 text-[11px] text-[#475569]">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <span className="font-semibold text-[#0f172a] block">
                                  Full Street Address:
                                </span>
                                <span>{rec.address}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-[#0f172a] block">
                                  Last Order Reference:
                                </span>
                                <span className="num-mono">
                                  {rec.lastOrderNumber}
                                </span>
                              </div>
                              <div>
                                <span className="font-semibold text-[#0f172a] block">
                                  Account Status:
                                </span>
                                <span>
                                  {rec.emptyContainersHeld === 0 &&
                                  rec.runningUnpaidBalance <= 0
                                    ? 'Cleared (Good standing)'
                                    : `${rec.emptyContainersHeld} empty jugs out, ₱${rec.runningUnpaidBalance.toFixed(2)} unpaid.`}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
