/**
 * ============================================================================
 * FILE: src/components/delivery/DeliveryCustomersSpreadsheetPage.tsx
 * PURPOSE: Monthly Spreadsheet Ledger (Days 1–31) for Delivery Customers
 *          sorted by Barangay, with vehicle rotation and Date Picker.
 *          Adheres strictly to tasteskill v2 app-screens and Lucide icons only.
 * ============================================================================
 */

import {
  Bike,
  Building,
  ChevronDown,
  Clock,
  Droplets,
  Phone,
  Plus,
  Search,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchDeliveryCustomersFromBackend } from '../../services/deliveryApiService';
import type { DeliveryCustomer, VehicleType } from '../../types/delivery.types';
import type { PosOrderItem } from '../../types/pos.types';
import { DeliveryDatePicker } from './DeliveryDatePicker';

interface DeliveryCustomersSpreadsheetPageProps {
  orders: PosOrderItem[];
  onOpenAddCustomer: () => void;
}

interface CustomerDailySummary {
  customer: DeliveryCustomer;
  dailyGallons: Record<number, number>;
  dailyAmounts: Record<number, number>;
  dailyOrders: Record<number, PosOrderItem[]>;
  totalMonthGallons: number;
  totalMonthAmount: number;
  activeDaysCount: number;
}

const SHORT_DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

export function DeliveryCustomersSpreadsheetPage({
  orders,
  onOpenAddCustomer,
}: DeliveryCustomersSpreadsheetPageProps) {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [barangayFilter, setBarangayFilter] = useState<string>('ALL');
  const [vehicleFilter, setVehicleFilter] = useState<'ALL' | VehicleType>('ALL');

  const [customers, setCustomers] = useState<DeliveryCustomer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCellOrder, setActiveCellOrder] = useState<{
    customerName: string;
    day: number;
    orders: PosOrderItem[];
  } | null>(null);

  // Load registered delivery customers
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await fetchDeliveryCustomersFromBackend();
        setCustomers(res.allCustomers);
      } catch (err) {
        console.warn('Failed to load delivery customers:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute number of days in the selected month (e.g. 28, 29, 30, or 31)
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const monthDaysList = useMemo(() => {
    const list: Array<{ dayNumber: number; dayName: string; isToday: boolean }> = [];
    const isCurrentMonth =
      today.getFullYear() === selectedYear && today.getMonth() === selectedMonth;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(selectedYear, selectedMonth, d);
      list.push({
        dayNumber: d,
        dayName: SHORT_DAY_NAMES[dateObj.getDay()]!,
        isToday: isCurrentMonth && today.getDate() === d,
      });
    }
    return list;
  }, [daysInMonth, selectedYear, selectedMonth]);

  // Extract unique Barangays for the dropdown filter
  const uniqueBarangays = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.barangay) set.add(c.barangay);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [customers]);

  // Filter and sort customers by Barangay, then Name
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return customers
      .filter((c) => {
        const matchBarangay =
          barangayFilter === 'ALL' || c.barangay === barangayFilter;
        const matchVehicle =
          vehicleFilter === 'ALL' || c.vehicleType === vehicleFilter;
        const matchSearch =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.barangay.toLowerCase().includes(q) ||
          (c.phoneNumber && c.phoneNumber.includes(q));

        return matchBarangay && matchVehicle && matchSearch;
      })
      .sort((a, b) => {
        const bComp = a.barangay.localeCompare(b.barangay);
        if (bComp !== 0) return bComp;
        return a.name.localeCompare(b.name);
      });
  }, [customers, searchQuery, barangayFilter, vehicleFilter]);

  // Calculate daily order breakdown for each customer
  const customerSummaries = useMemo<CustomerDailySummary[]>(() => {
    return filteredCustomers.map((cust) => {
      const dailyGallons: Record<number, number> = {};
      const dailyAmounts: Record<number, number> = {};
      const dailyOrders: Record<number, PosOrderItem[]> = {};

      for (let d = 1; d <= daysInMonth; d++) {
        dailyGallons[d] = 0;
        dailyAmounts[d] = 0;
        dailyOrders[d] = [];
      }

      // Match orders for this customer
      const custNameNorm = cust.name.toLowerCase().trim();
      const custPhoneNorm = cust.phoneNumber?.replace(/\D/g, '') || '';

      const matchingOrders = orders.filter((o) => {
        const oName = o.customerName.toLowerCase().trim();
        const oPhone = o.customerPhone.replace(/\D/g, '');
        const isNameMatch = oName === custNameNorm || oName.includes(custNameNorm) || custNameNorm.includes(oName);
        const isPhoneMatch = custPhoneNorm.length > 6 && oPhone.length > 6 && oPhone === custPhoneNorm;
        return isNameMatch || isPhoneMatch;
      });

      // Distribute orders into days of this month
      let totalMonthGallons = 0;
      let totalMonthAmount = 0;
      let activeDaysCount = 0;

      matchingOrders.forEach((o) => {
        let orderDate: Date | null = null;
        if (o.createdAtIso) {
          orderDate = new Date(o.createdAtIso);
        } else if (o.orderDate) {
          orderDate = new Date(o.orderDate);
        }

        if (
          orderDate &&
          !isNaN(orderDate.getTime()) &&
          orderDate.getFullYear() === selectedYear &&
          orderDate.getMonth() === selectedMonth
        ) {
          const dayNum = orderDate.getDate();
          if (dayNum >= 1 && dayNum <= daysInMonth) {
            dailyGallons[dayNum] = (dailyGallons[dayNum] || 0) + (o.verifiedCount || 0);
            dailyAmounts[dayNum] = (dailyAmounts[dayNum] || 0) + (o.totalDue || 0);
            dailyOrders[dayNum]!.push(o);
          }
        }
      });

      for (let d = 1; d <= daysInMonth; d++) {
        const gals = dailyGallons[d] || 0;
        if (gals > 0) {
          totalMonthGallons += gals;
          totalMonthAmount += dailyAmounts[d] || 0;
          activeDaysCount += 1;
        }
      }

      return {
        customer: cust,
        dailyGallons,
        dailyAmounts,
        dailyOrders,
        totalMonthGallons,
        totalMonthAmount,
        activeDaysCount,
      };
    });
  }, [filteredCustomers, orders, daysInMonth, selectedYear, selectedMonth]);

  // Daily station totals across all filtered customers
  const dailyStationTotals = useMemo(() => {
    const gallonsMap: Record<number, number> = {};
    const amountsMap: Record<number, number> = {};
    let grandGallons = 0;
    let grandAmount = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      gallonsMap[d] = 0;
      amountsMap[d] = 0;
    }

    customerSummaries.forEach((summary) => {
      for (let d = 1; d <= daysInMonth; d++) {
        const g = summary.dailyGallons[d] || 0;
        const a = summary.dailyAmounts[d] || 0;
        gallonsMap[d] += g;
        amountsMap[d] += a;
        grandGallons += g;
        grandAmount += a;
      }
    });

    return { gallonsMap, amountsMap, grandGallons, grandAmount };
  }, [customerSummaries, daysInMonth]);

  // Statistics for the selected inspection day
  const selectedDayStats = useMemo(() => {
    if (selectedDay === null) return null;
    const gallons = dailyStationTotals.gallonsMap[selectedDay] || 0;
    const amount = dailyStationTotals.amountsMap[selectedDay] || 0;
    const activeCustomers = customerSummaries.filter(
      (c) => (c.dailyGallons[selectedDay] || 0) > 0,
    ).length;

    const dateObj = new Date(selectedYear, selectedMonth, selectedDay);
    const dateFormatted = dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return {
      day: selectedDay,
      dateFormatted,
      gallons,
      amount,
      activeCustomers,
    };
  }, [selectedDay, dailyStationTotals, customerSummaries, selectedYear, selectedMonth]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* ====================================================================
          1. HEADER & CONTROLS TOOLBAR
          ==================================================================== */}
      <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-[#e2e8f0]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[5px] bg-[#0284c7] text-white flex items-center justify-center">
                <Users size={15} />
              </div>
              <h1 className="text-[16px] font-bold text-[#0f172a] tracking-tight">
                Delivery Customers &amp; Monthly Order Matrix
              </h1>
            </div>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              Calendar days 1–31 order volume tracking • Sorted by Barangay • Foton &amp; Sidecar fleet allocation
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Well-Designed Date Picker */}
            <DeliveryDatePicker
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              selectedDay={selectedDay}
              onMonthChange={(y, m) => {
                setSelectedYear(y);
                setSelectedMonth(m);
              }}
              onDayChange={setSelectedDay}
            />

            {/* Add Delivery Customers Modal Button */}
            <button
              type="button"
              onClick={onOpenAddCustomer}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#0f172a] hover:bg-[#1e293b] text-white text-[12px] font-semibold cursor-pointer transition-colors shadow-xs"
            >
              <Plus size={14} />
              <span>Add Delivery Customers</span>
            </button>
          </div>
        </div>

        {/* Filters Row: Barangay Dropdown, Search Input, Vehicle Pills */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-[12px]">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Barangay Dropdown */}
            <div className="relative min-w-[210px]">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#0284c7] pointer-events-none">
                <Building size={13} />
              </div>
              <select
                value={barangayFilter}
                onChange={(e) => setBarangayFilter(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] text-[12px] font-semibold text-[#0f172a] focus:outline-none focus:border-[#0284c7] cursor-pointer appearance-none"
              >
                <option value="ALL">All Barangays ({customers.length} total)</option>
                {uniqueBarangays.map((bName) => {
                  const count = customers.filter((c) => c.barangay === bName).length;
                  return (
                    <option key={bName} value={bName}>
                      Barangay {bName} ({count})
                    </option>
                  );
                })}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none"
              />
            </div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer name, barangay, or phone..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] text-[12px] text-[#0f172a] focus:outline-none focus:border-[#0284c7]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a]"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Vehicle Filter Pills */}
            <div className="flex items-center gap-1 bg-[#f1f5f9] p-0.5 rounded-[6px] border border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setVehicleFilter('ALL')}
                className={`px-2 py-1 rounded-[5px] text-[11px] font-semibold cursor-pointer transition-colors ${
                  vehicleFilter === 'ALL'
                    ? 'bg-white text-[#0f172a] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                All Fleet
              </button>
              <button
                type="button"
                onClick={() => setVehicleFilter('FOTON')}
                className={`px-2 py-1 rounded-[5px] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  vehicleFilter === 'FOTON'
                    ? 'bg-[#065f46] text-white shadow-xs'
                    : 'text-[#047857] hover:bg-white'
                }`}
              >
                <Truck size={11} /> Foton
              </button>
              <button
                type="button"
                onClick={() => setVehicleFilter('SIDECAR')}
                className={`px-2 py-1 rounded-[5px] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  vehicleFilter === 'SIDECAR'
                    ? 'bg-[#1e40af] text-white shadow-xs'
                    : 'text-[#1d4ed8] hover:bg-white'
                }`}
              >
                <Bike size={11} /> Sidecar
              </button>
            </div>
          </div>

          <div className="text-[11.5px] text-[#64748b]">
            Showing <strong>{filteredCustomers.length}</strong> of{' '}
            <strong>{customers.length}</strong> delivery customers
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. FOCUSED DAY INSPECTION BANNER (When day column is selected)
          ==================================================================== */}
      {selectedDayStats && (
        <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-[8px] px-4 py-2.5 flex items-center justify-between text-[12px] text-[#1e40af] animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <span className="font-bold flex items-center gap-1.5 text-[#1e3a8a]">
              <Clock size={14} className="text-[#0284c7]" />
              Inspection Focus: {selectedDayStats.dateFormatted} (Day {selectedDayStats.day})
            </span>
            <span>•</span>
            <span>
              Orders on this day:{' '}
              <strong className="text-[#0f172a] font-bold">
                {selectedDayStats.gallons} Gallons
              </strong>{' '}
              across <strong>{selectedDayStats.activeCustomers}</strong> customers
            </span>
            <span>•</span>
            <span>
              Sales Total:{' '}
              <strong className="text-[#047857] font-bold">
                ₱{selectedDayStats.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            className="text-[11px] text-[#1e40af] hover:text-[#0f172a] hover:underline flex items-center gap-1 cursor-pointer font-medium"
          >
            <span>Clear Day Focus</span>
            <X size={12} />
          </button>
        </div>
      )}

      {/* ====================================================================
          3. SPREADSHEET LEDGER TABLE (Days 1–31 Grid)
          ==================================================================== */}
      <div className="bg-white border border-[#e2e8f0] rounded-[8px] overflow-hidden flex-1 flex flex-col shadow-xs min-h-[460px]">
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-left select-none">
            {/* Table Header */}
            <thead className="bg-[#f8fafc] text-[11px] font-semibold text-[#475569] border-b border-[#cbd5e1] sticky top-0 z-30">
              <tr>
                {/* Sticky Identification Columns */}
                <th className="py-2.5 px-2 text-center w-[40px] border-r border-[#e2e8f0] sticky left-0 bg-[#f8fafc] z-30">
                  #
                </th>
                <th className="py-2.5 px-3 min-w-[190px] border-r border-[#e2e8f0] sticky left-[40px] bg-[#f8fafc] z-30">
                  Customer Name
                </th>
                <th className="py-2.5 px-3 min-w-[140px] border-r border-[#e2e8f0] sticky left-[230px] bg-[#f8fafc] z-30">
                  Barangay
                </th>
                <th className="py-2.5 px-3 min-w-[130px] border-r border-[#e2e8f0] hidden sm:table-cell">
                  Phone (Optional)
                </th>
                <th className="py-2.5 px-2 text-center w-[75px] border-r border-[#cbd5e1]">
                  Rotation
                </th>

                {/* Days 1 to 31 Columns */}
                {monthDaysList.map(({ dayNumber, dayName, isToday }) => {
                  const isFocused = selectedDay === dayNumber;
                  return (
                    <th
                      key={dayNumber}
                      onClick={() => setSelectedDay(dayNumber)}
                      title={`Click to focus Day ${dayNumber} (${dayName})`}
                      className={`py-1.5 px-1 text-center w-[38px] min-w-[38px] cursor-pointer transition-colors border-r border-[#e2e8f0] ${
                        isFocused
                          ? 'bg-[#dbeafe] text-[#1e40af] ring-1 ring-inset ring-[#2563eb]'
                          : isToday
                          ? 'bg-[#eff6ff] text-[#0284c7] font-bold'
                          : 'hover:bg-[#f1f5f9]'
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-tight">
                        {dayNumber}
                      </div>
                      <div
                        className={`text-[9px] font-medium leading-none ${
                          isToday ? 'text-[#0284c7] font-bold' : 'text-[#94a3b8]'
                        }`}
                      >
                        {dayName}
                      </div>
                    </th>
                  );
                })}

                {/* Monthly Totals Columns */}
                <th className="py-2.5 px-2.5 text-center min-w-[85px] bg-[#f1f5f9] border-l border-r border-[#cbd5e1] font-bold text-[#0f172a]">
                  Month Gal
                </th>
                <th className="py-2.5 px-2.5 text-right min-w-[95px] bg-[#f1f5f9] border-r border-[#cbd5e1] font-bold text-[#0f172a]">
                  Total ₱
                </th>
                <th className="py-2.5 px-2 text-center min-w-[65px] bg-[#f1f5f9] font-bold text-[#475569]">
                  Days
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#f1f5f9] text-[11.5px]">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={daysInMonth + 8}
                    className="py-12 text-center text-[#94a3b8]"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Users size={32} className="opacity-40 animate-pulse mb-2 text-[#0284c7]" />
                      <p className="text-[13px] font-medium text-[#475569]">
                        Loading delivery customer matrix from PostgreSQL...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : customerSummaries.length === 0 ? (
                <tr>
                  <td
                    colSpan={daysInMonth + 8}
                    className="py-12 text-center text-[#94a3b8]"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Users size={32} className="opacity-30 mb-2" />
                      <p className="text-[13px] font-medium text-[#475569]">
                        No delivery customers match your filters
                      </p>
                      <p className="text-[11px] text-[#94a3b8] mt-1">
                        Try changing the Barangay dropdown or click "Add Delivery Customers"
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customerSummaries.map((summary, idx) => {
                  const { customer, dailyGallons, dailyOrders, totalMonthGallons, totalMonthAmount, activeDaysCount } = summary;

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-[#fafafa] transition-colors group"
                    >
                      {/* Row # */}
                      <td className="py-2 px-2 text-center text-[#94a3b8] font-mono text-[10.5px] border-r border-[#e2e8f0] sticky left-0 bg-white group-hover:bg-[#fafafa] z-20">
                        {idx + 1}
                      </td>

                      {/* Customer Name */}
                      <td className="py-2 px-3 font-semibold text-[#0f172a] border-r border-[#e2e8f0] sticky left-[40px] bg-white group-hover:bg-[#fafafa] z-20 truncate max-w-[200px]">
                        <span title={customer.name}>{customer.name}</span>
                      </td>

                      {/* Barangay */}
                      <td className="py-2 px-3 border-r border-[#e2e8f0] sticky left-[230px] bg-white group-hover:bg-[#fafafa] z-20 truncate max-w-[150px]">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
                          {customer.barangay}
                        </span>
                      </td>

                      {/* Phone Number (Optional) */}
                      <td className="py-2 px-3 border-r border-[#e2e8f0] hidden sm:table-cell text-[#475569] truncate max-w-[150px]">
                        {customer.phoneNumber ? (
                          <span className="text-[11px] font-mono text-[#0f172a] flex items-center gap-1">
                            <Phone size={10} className="text-[#64748b]" />
                            {customer.phoneNumber}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#94a3b8] italic">
                            No phone
                          </span>
                        )}
                      </td>

                      {/* Vehicle Rotation Badge */}
                      <td className="py-2 px-2 text-center border-r border-[#cbd5e1]">
                        <span
                          className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded border uppercase inline-flex items-center gap-1 ${
                            customer.vehicleType === 'FOTON'
                              ? 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]'
                              : 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]'
                          }`}
                        >
                          {customer.vehicleType === 'FOTON' ? (
                            <Truck size={10} />
                          ) : (
                            <Bike size={10} />
                          )}
                          <span>{customer.vehicleType === 'FOTON' ? 'Foton' : 'Sidecar'}</span>
                        </span>
                      </td>

                      {/* Days 1 to 31 Cells */}
                      {monthDaysList.map(({ dayNumber, isToday }) => {
                        const gallons = dailyGallons[dayNumber] || 0;
                        const dayOrdersList = dailyOrders[dayNumber] || [];
                        const isFocused = selectedDay === dayNumber;

                        return (
                          <td
                            key={dayNumber}
                            onClick={() => {
                              if (dayOrdersList.length > 0) {
                                setActiveCellOrder({
                                  customerName: customer.name,
                                  day: dayNumber,
                                  orders: dayOrdersList,
                                });
                              }
                            }}
                            className={`py-1.5 px-1 text-center border-r border-[#f1f5f9] font-mono text-[11px] transition-colors ${
                              isFocused
                                ? 'bg-[#eff6ff]'
                                : isToday
                                ? 'bg-[#f0f9ff]'
                                : ''
                            } ${gallons > 0 ? 'cursor-pointer' : ''}`}
                          >
                            {gallons > 0 ? (
                              <span
                                title={`${customer.name} ordered ${gallons} gal on Day ${dayNumber} (Click for details)`}
                                className="inline-block px-1 py-0.2 rounded font-bold text-[10px] bg-[#0284c7] text-white hover:bg-[#0369a1] transition-transform hover:scale-105 shadow-2xs"
                              >
                                {gallons}
                              </span>
                            ) : (
                              <span className="text-[#cbd5e1] font-normal select-none">
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* Monthly Total Gallons */}
                      <td className="py-2 px-2.5 text-center font-bold text-[#0f172a] bg-[#f8fafc] border-l border-r border-[#cbd5e1] num-mono">
                        {totalMonthGallons > 0 ? (
                          <span className="text-[#0284c7]">
                            {totalMonthGallons}{' '}
                            <span className="text-[10px] font-normal text-[#64748b]">gal</span>
                          </span>
                        ) : (
                          <span className="text-[#94a3b8]">0</span>
                        )}
                      </td>

                      {/* Monthly Total Amount */}
                      <td className="py-2 px-2.5 text-right font-bold bg-[#f8fafc] border-r border-[#cbd5e1] num-mono">
                        {totalMonthAmount > 0 ? (
                          <span className="text-[#047857]">
                            ₱{totalMonthAmount.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                          </span>
                        ) : (
                          <span className="text-[#94a3b8]">₱0</span>
                        )}
                      </td>

                      {/* Active Days Count */}
                      <td className="py-2 px-2 text-center bg-[#f8fafc] font-medium text-[#475569] num-mono">
                        {activeDaysCount > 0 ? (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#e2e8f0] text-[#334155] text-[10px] font-semibold">
                            {activeDaysCount}d
                          </span>
                        ) : (
                          <span className="text-[#94a3b8] text-[10px]">0d</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Footer: Daily Station Volume Totals */}
            <tfoot className="bg-[#f1f5f9] text-[11px] font-bold text-[#0f172a] border-t-2 border-[#cbd5e1] sticky bottom-0 z-30">
              <tr>
                <td
                  colSpan={4}
                  className="py-2.5 px-3 text-left sticky left-0 bg-[#f1f5f9] z-30 border-r border-[#cbd5e1]"
                >
                  <div className="flex items-center gap-1.5">
                    <Droplets size={13} className="text-[#0284c7]" />
                    <span>Station Daily Delivery Volume Totals</span>
                  </div>
                </td>
                <td className="py-2.5 px-2 text-center border-r border-[#cbd5e1] text-[10px] text-[#64748b]">
                  SUM
                </td>

                {/* Daily Volume Sums */}
                {monthDaysList.map(({ dayNumber, isToday }) => {
                  const dayTotalGallons = dailyStationTotals.gallonsMap[dayNumber] || 0;
                  const isFocused = selectedDay === dayNumber;

                  return (
                    <td
                      key={dayNumber}
                      onClick={() => setSelectedDay(dayNumber)}
                      className={`py-2 px-1 text-center font-mono text-[10.5px] border-r border-[#e2e8f0] cursor-pointer ${
                        isFocused
                          ? 'bg-[#dbeafe] text-[#1e40af]'
                          : isToday
                          ? 'bg-[#e0f2fe] text-[#0369a1]'
                          : ''
                      }`}
                    >
                      {dayTotalGallons > 0 ? (
                        <span className="font-bold text-[#0f172a]">
                          {dayTotalGallons}
                        </span>
                      ) : (
                        <span className="text-[#94a3b8]">—</span>
                      )}
                    </td>
                  );
                })}

                {/* Grand Monthly Total Gallons */}
                <td className="py-2.5 px-2.5 text-center border-l border-r border-[#cbd5e1] bg-[#e2e8f0] text-[#0284c7] font-bold">
                  {dailyStationTotals.grandGallons}{' '}
                  <span className="text-[10px] font-normal">gal</span>
                </td>

                {/* Grand Monthly Total Amount */}
                <td className="py-2.5 px-2.5 text-right border-r border-[#cbd5e1] bg-[#e2e8f0] text-[#047857] font-bold">
                  ₱{dailyStationTotals.grandAmount.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                </td>

                {/* Footer tail */}
                <td className="py-2.5 px-2 text-center bg-[#e2e8f0] text-[#64748b] text-[10px]">
                  MONTH
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ====================================================================
          4. POPUP MODAL: DAY ORDER DETAIL (When clicked on a day cell)
          ==================================================================== */}
      {activeCellOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-[#cbd5e1] rounded-[8px] max-w-[420px] w-full p-4 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[5px] bg-[#0284c7] text-white flex items-center justify-center">
                  <Droplets size={14} />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-[#0f172a]">
                    {activeCellOrder.customerName}
                  </h3>
                  <span className="text-[11px] text-[#64748b]">
                    Orders on Day {activeCellOrder.day} of{' '}
                    {new Date(selectedYear, selectedMonth, 1).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveCellOrder(null)}
                className="w-7 h-7 rounded-[4px] border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] flex items-center justify-center cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2 mb-3 max-h-[220px] overflow-y-auto">
              {activeCellOrder.orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] text-[11.5px] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0f172a]">
                      #{ord.invoiceNumber || ord.orderNumber}
                    </span>
                    <span className="font-bold text-[#047857]">
                      ₱{ord.totalDue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#64748b] text-[11px]">
                    <span>
                      {ord.verifiedCount} Gallons ({ord.presetName})
                    </span>
                    <span>{ord.invoicedAt || 'Morning'}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveCellOrder(null)}
              className="w-full py-1.5 bg-[#0f172a] text-white rounded-[5px] text-[12px] font-semibold hover:bg-[#1e293b] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
