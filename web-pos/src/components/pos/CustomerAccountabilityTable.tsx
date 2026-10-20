/**
 * ============================================================================
 * FILE: src/components/pos/CustomerAccountabilityTable.tsx
 * PURPOSE: Implements Wireframe W2 — Jug & Balance Ledger.
 *          Refined 4-column operational layout:
 *          1. 4 Columns: Customer (Name + Phone · Short Address), Jugs Out
 *             (count + friendly due/overdue text), Balance (bold amount or —),
 *             and Contextual Action ([Settle] / [Remind] + ⋯ menu).
 *          2. Hides fully cleared customers (0 jugs & PHP 0 balance) by default
 *             with a "Show cleared" toggle.
 *          3. 3-Stat Urgency Strip (Jugs out · Unpaid · Overdue) + Filter Chips
 *             (All · Overdue · With balance · Jugs out).
 *          4. Priority sorting: Overdue first, then highest balance, then jugs.
 *          5. Row-click expandable detail drawer showing Last Receipt / Doc,
 *             full street address, and actions.
 *          - Styled with Tailwind CSS and Lucide icons (lucide-react) strictly.
 * ============================================================================
 */

import {
  AlertTriangle,
  Banknote,
  Bell,
  CheckCircle2,
  Droplets,
  Eye,
  EyeOff,
  FileText,
  MapPin,
  MoreHorizontal,
  Phone,
  RefreshCw,
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
  const [openMenuRowId, setOpenMenuRowId] = useState<string | null>(null);

  /**
   * Computes the 3-stat urgency strip totals using a clear step-by-step loop
   */
  let totalJugsOut = 0;
  let totalUnpaidPhp = 0;
  let totalOverdueCount = 0;
  let totalClearedCount = 0;

  for (let index = 0; index < props.records.length; index = index + 1) {
    const rec = props.records[index];
    if (rec === undefined) {
      continue;
    }

    totalJugsOut = totalJugsOut + rec.emptyContainersHeld;
    totalUnpaidPhp = totalUnpaidPhp + rec.runningUnpaidBalance;

    if (rec.isOverdue && rec.emptyContainersHeld > 0) {
      totalOverdueCount = totalOverdueCount + 1;
    }

    const isCleared =
      rec.emptyContainersHeld === 0 && rec.runningUnpaidBalance <= 0;
    if (isCleared) {
      totalClearedCount = totalClearedCount + 1;
    }
  }

  /**
   * Extracts a concise neighborhood/street label from the full address
   * e.g., "Blk 4 Lot 12 Pansol St, Quezon City" -> "Pansol St"
   */
  function getShortAddressLabel(fullAddress: string): string {
    const commaParts = fullAddress.split(',');
    const firstPart = commaParts[0];
    if (firstPart !== undefined && firstPart.trim().length > 0) {
      return firstPart.trim();
    }
    return fullAddress;
  }

  /**
   * Formats a raw YYYY-MM-DD date string into a friendly operational label
   * e.g., "due Oct 22 · in 2 days" or "8 days overdue"
   */
  function getFriendlyDueDateText(
    isoDateStr: string,
    isOverdueFlag: boolean,
  ): string {
    if (!isoDateStr || isoDateStr === '—') {
      return 'No due date';
    }

    const parsedDate = new Date(`${isoDateStr}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      return isoDateStr;
    }

    // Reference anchor date (Oct 20, 2026) so seeded dates show realistic relative days
    const referenceToday = new Date('2026-10-20T00:00:00');
    const diffMs = parsedDate.getTime() - referenceToday.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const shortMonthDay = parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    if (isOverdueFlag || diffDays < 0) {
      const overdueDays = Math.max(1, Math.abs(diffDays));
      if (overdueDays === 1) {
        return `1 day overdue (${shortMonthDay})`;
      }
      return `${overdueDays} days overdue`;
    }

    if (diffDays === 0) {
      return `due today (${shortMonthDay})`;
    }

    if (diffDays === 1) {
      return `due tomorrow (${shortMonthDay})`;
    }

    if (diffDays <= 7) {
      return `due ${shortMonthDay} (in ${diffDays} days)`;
    }

    return `due ${shortMonthDay}`;
  }

  /**
   * Filters and sorts customer records by priority:
   * 1. Overdue first
   * 2. Highest unpaid balance
   * 3. Highest jugs out
   */
  function getFilteredAndSortedRecords(): CustomerAccountabilityRecord[] {
    const matchingList: CustomerAccountabilityRecord[] = [];
    const normalizedQuery = searchQuery.trim().toLowerCase();

    for (let index = 0; index < props.records.length; index = index + 1) {
      const record = props.records[index];
      if (record === undefined) {
        continue;
      }

      const isCleared =
        record.emptyContainersHeld === 0 && record.runningUnpaidBalance <= 0;

      // Hide cleared customers by default unless "Show cleared" is toggled on
      if (isCleared && !showClearedCustomers && activeFilter === 'ALL') {
        continue;
      }

      // Check Filter Chip
      if (activeFilter === 'OVERDUE') {
        if (!record.isOverdue || record.emptyContainersHeld <= 0) {
          continue;
        }
      } else if (activeFilter === 'WITH_BALANCE') {
        if (record.runningUnpaidBalance <= 0) {
          continue;
        }
      } else if (activeFilter === 'JUGS_OUT') {
        if (record.emptyContainersHeld <= 0) {
          continue;
        }
      }

      // Check Search Input
      if (normalizedQuery.length > 0) {
        const nameMatch = record.customerName
          .toLowerCase()
          .includes(normalizedQuery);
        const addressMatch = record.address
          .toLowerCase()
          .includes(normalizedQuery);
        const phoneMatch = record.phoneNumber
          .toLowerCase()
          .includes(normalizedQuery);
        const receiptMatch = record.lastOrderNumber
          .toLowerCase()
          .includes(normalizedQuery);

        if (!nameMatch && !addressMatch && !phoneMatch && !receiptMatch) {
          continue;
        }
      }

      matchingList.push(record);
    }

    // Sort by Priority: Overdue first -> Highest Balance -> Most Jugs Out
    matchingList.sort((left, right) => {
      const leftOverdue = left.isOverdue && left.emptyContainersHeld > 0 ? 1 : 0;
      const rightOverdue =
        right.isOverdue && right.emptyContainersHeld > 0 ? 1 : 0;

      if (leftOverdue !== rightOverdue) {
        return rightOverdue - leftOverdue;
      }

      if (left.runningUnpaidBalance !== right.runningUnpaidBalance) {
        return right.runningUnpaidBalance - left.runningUnpaidBalance;
      }

      return right.emptyContainersHeld - left.emptyContainersHeld;
    });

    return matchingList;
  }

  function handleToggleRowDrawer(recordId: string) {
    setOpenMenuRowId(null);
    if (expandedRowId === recordId) {
      setExpandedRowId(null);
    } else {
      setExpandedRowId(recordId);
    }
  }

  function handleToggleMoreMenu(
    event: React.MouseEvent<HTMLButtonElement>,
    recordId: string,
  ) {
    event.stopPropagation();
    if (openMenuRowId === recordId) {
      setOpenMenuRowId(null);
    } else {
      setOpenMenuRowId(recordId);
    }
  }

  const visibleRecords = getFilteredAndSortedRecords();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
      {/* ====================================================================
          1. HEADER ROW: SHORTER TITLE + SUBTITLE + SEARCH INPUT
          ==================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 tracking-tight">
            <RefreshCw size={18} className="text-blue-600" />
            <span>Jug &amp; Balance Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer Container Accountability &amp; Unpaid Balance Ledger
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
            }}
            placeholder="Search customer, street, phone, or #OR..."
            className="w-full pl-9 pr-3.5 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* ====================================================================
          2. URGENCY 3-STAT STRIP + FILTER CHIPS + "SHOW CLEARED" TOGGLE
          ==================================================================== */}
      <div className="py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 mb-4">
        {/* Three-Stat Urgency Strip */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <Droplets size={13} className="text-sky-600" />
            <span className="text-slate-500 font-medium">Jugs out</span>
            <strong className="font-extrabold text-slate-900">
              {totalJugsOut}
            </strong>
          </div>

          <span className="text-slate-300">·</span>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <Banknote size={13} className="text-amber-600" />
            <span className="text-slate-500 font-medium">Unpaid</span>
            <strong className="font-extrabold text-slate-900">
              PHP {totalUnpaidPhp.toFixed(0)}
            </strong>
          </div>

          <span className="text-slate-300">·</span>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
              totalOverdueCount > 0
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <AlertTriangle
              size={13}
              className={
                totalOverdueCount > 0 ? 'text-red-600' : 'text-slate-400'
              }
            />
            <span className="font-medium">Overdue</span>
            <strong className="font-extrabold">{totalOverdueCount}</strong>
          </div>
        </div>

        {/* Filter Chips + Show Cleared Toggle */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'ALL', label: 'All needing action' },
              { id: 'OVERDUE', label: 'Overdue' },
              { id: 'WITH_BALANCE', label: 'With balance' },
              { id: 'JUGS_OUT', label: 'Jugs out' },
            ] as const
          ).map((chip) => {
            const isSelected = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  setActiveFilter(chip.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {chip.label}
              </button>
            );
          })}

          {totalClearedCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setShowClearedCustomers(!showClearedCustomers);
              }}
              className={`ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                showClearedCustomers
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-700'
              }`}
            >
              {showClearedCustomers ? (
                <EyeOff size={13} />
              ) : (
                <Eye size={13} />
              )}
              <span>
                {showClearedCustomers
                  ? `Hide cleared (${totalClearedCount})`
                  : `Show cleared (${totalClearedCount})`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ====================================================================
          3. STREAMLINED 4-COLUMN TABLE + EXPANDABLE DETAIL DRAWER
          ==================================================================== */}
      <div className="rounded-xl border border-slate-200 overflow-visible">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Customer
              </th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Jugs Out
              </th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Balance
              </th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {visibleRecords.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-10 px-4 text-center text-xs text-slate-500"
                >
                  No customers match the current filter.
                </td>
              </tr>
            )}

            {visibleRecords.map((record) => {
              const hasJugsOut = record.emptyContainersHeld > 0;
              const hasBalance = record.runningUnpaidBalance > 0;
              const isOverdueRow = record.isOverdue && hasJugsOut;
              const isReminded = Boolean(record.pickupReminderSent);
              const isExpanded = expandedRowId === record.id;
              const isMenuOpen = openMenuRowId === record.id;
              const shortAddress = getShortAddressLabel(record.address);
              const friendlyDueText = getFriendlyDueDateText(
                record.containersDueBackDate,
                isOverdueRow,
              );

              return (
                <React.Fragment key={record.id}>
                  <tr
                    onClick={() => {
                      handleToggleRowDrawer(record.id);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isOverdueRow
                        ? 'border-l-4 border-l-red-500 bg-red-50/35 hover:bg-red-50/60'
                        : isExpanded
                          ? 'bg-sky-50/50'
                          : 'bg-white hover:bg-slate-50/80'
                    }`}
                  >
                    {/* COLUMN 1: CUSTOMER (Semibold Name + Muted Phone · Short Address) */}
                    <td className="py-3.5 px-4 align-middle max-w-[290px]">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {record.customerName}
                      </div>
                      <div
                        title={`${record.phoneNumber} • ${record.address}`}
                        className="text-xs text-slate-500 truncate mt-0.5"
                      >
                        {record.phoneNumber} · {shortAddress}
                      </div>
                    </td>

                    {/* COLUMN 2: JUGS OUT (Count + Friendly Due / Overdue Text) */}
                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                      {hasJugsOut ? (
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {record.emptyContainersHeld}{' '}
                            {record.emptyContainersHeld === 1 ? 'jug' : 'jugs'}
                          </div>
                          <div
                            className={`text-xs mt-0.5 ${
                              isOverdueRow
                                ? 'font-semibold text-red-600'
                                : 'text-slate-500'
                            }`}
                          >
                            {friendlyDueText}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-300 select-none">
                          —
                        </span>
                      )}
                    </td>

                    {/* COLUMN 3: UNPAID BALANCE (Boldest Element in Row or Quiet Dash) */}
                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                      {hasBalance ? (
                        <strong className="text-sm font-extrabold text-slate-900">
                          PHP {record.runningUnpaidBalance.toFixed(2)}
                        </strong>
                      ) : (
                        <span className="text-sm text-slate-300 select-none">
                          —
                        </span>
                      )}
                    </td>

                    {/* COLUMN 4: CONTEXTUAL ACTION (One Primary Button + ⋯ Menu) */}
                    <td
                      className="py-3.5 px-4 align-middle whitespace-nowrap text-right"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      <div className="inline-flex items-center justify-end gap-1.5 relative">
                        {/* Primary Contextual Button */}
                        {hasBalance && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              props.onSettleCustomerBalance(record.id);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                          >
                            <Banknote size={13} />
                            <span>Settle</span>
                          </button>
                        )}

                        {hasJugsOut &&
                          (isReminded ? (
                            <span
                              title={
                                record.lastRemindedAt
                                  ? `Reminded at ${record.lastRemindedAt} (use ⋯ menu to Remind Again)`
                                  : 'Customer has been reminded (use ⋯ menu to Remind Again)'
                              }
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 select-none"
                            >
                              <CheckCircle2
                                size={13}
                                className="text-emerald-600"
                              />
                              <span>Reminded</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              title={`Send pickup reminder to ${record.customerName}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                props.onTriggerPickupReminder(
                                  record.id,
                                  record.customerName,
                                  false,
                                );
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 transition-colors cursor-pointer"
                            >
                              <Bell size={13} className="text-sky-600" />
                              <span>Remind</span>
                            </button>
                          ))}

                        {/* ⋯ Secondary Overflow / Detail Menu Button */}
                        <button
                          type="button"
                          aria-label="More customer actions"
                          onClick={(event) => {
                            handleToggleMoreMenu(event, record.id);
                          }}
                          className="w-8 h-8 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {/* Contextual Overflow Popover Menu */}
                        {isMenuOpen && (
                          <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-30 text-left">
                            <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                              <span>Last Receipt:</span>
                              <code className="font-mono font-bold text-slate-700">
                                {record.lastOrderNumber}
                              </code>
                            </div>

                            {isReminded && record.lastRemindedAt && (
                              <div className="px-2.5 py-1 border-b border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 bg-emerald-50/60">
                                <span>Last Reminded:</span>
                                <span className="font-semibold">
                                  {record.lastRemindedAt}
                                </span>
                              </div>
                            )}

                            {hasJugsOut && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuRowId(null);
                                  props.onTriggerPickupReminder(
                                    record.id,
                                    record.customerName,
                                    isReminded,
                                  );
                                }}
                                className="w-full mt-1 flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <Bell size={13} className="text-blue-600" />
                                <span>
                                  {isReminded
                                    ? 'Remind Again'
                                    : 'Send Pickup Reminder'}
                                </span>
                              </button>
                            )}

                            {hasBalance && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuRowId(null);
                                  props.onSettleCustomerBalance(record.id);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                              >
                                <Banknote size={13} />
                                <span>Settle Balance</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuRowId(null);
                                setExpandedRowId(
                                  isExpanded ? null : record.id,
                                );
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <FileText size={13} />
                              <span>
                                {isExpanded ? 'Hide Details' : 'View Details'}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* ROW-CLICK DETAIL DRAWER (Houses Last Receipt Number, Full Address & Actions) */}
                  {isExpanded && (
                    <tr className="bg-slate-50/80">
                      <td colSpan={4} className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-3.5 text-xs">
                          <div className="flex flex-wrap items-center gap-5">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <FileText size={14} className="text-blue-600" />
                              <span className="text-slate-500">
                                Last Receipt / Doc:
                              </span>
                              <code className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-900">
                                {record.lastOrderNumber}
                              </code>
                            </div>

                            <div className="flex items-center gap-1.5 text-slate-700">
                              <MapPin size={14} className="text-slate-400" />
                              <span className="text-slate-500">
                                Full Address:
                              </span>
                              <span className="font-medium text-slate-900">
                                {record.address}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Phone size={14} className="text-slate-400" />
                              <span className="font-medium text-slate-900">
                                {record.phoneNumber}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {hasJugsOut && (
                              <button
                                type="button"
                                onClick={() => {
                                  props.onTriggerPickupReminder(
                                    record.id,
                                    record.customerName,
                                    isReminded,
                                  );
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                              >
                                <Bell size={13} />
                                <span>
                                  {isReminded
                                    ? 'Remind Again'
                                    : 'Send Pickup Reminder'}
                                </span>
                              </button>
                            )}

                            {hasBalance && (
                              <button
                                type="button"
                                onClick={() => {
                                  props.onSettleCustomerBalance(record.id);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                              >
                                <CheckCircle2 size={13} />
                                <span>
                                  Mark PHP{' '}
                                  {record.runningUnpaidBalance.toFixed(2)}{' '}
                                  Settled
                                </span>
                              </button>
                            )}
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
    </div>
  );
}
