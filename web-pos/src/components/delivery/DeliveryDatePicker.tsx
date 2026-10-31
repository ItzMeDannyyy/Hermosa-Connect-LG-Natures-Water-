/**
 * ============================================================================
 * FILE: src/components/delivery/DeliveryDatePicker.tsx
 * PURPOSE: A well-designed, elegant Month/Year & Day picker adhering to
 *          tasteskill v2 framed-sheet principles.
 *          Strict Lucide vector icons, zero Unicode emojis.
 * ============================================================================
 */

import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from 'lucide-react';
import { useState } from 'react';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

interface DeliveryDatePickerProps {
  selectedYear: number;
  selectedMonth: number; // 0-indexed (0 = Jan, 9 = Oct)
  selectedDay: number | null; // 1-31 or null
  onMonthChange: (year: number, month: number) => void;
  onDayChange: (day: number | null) => void;
}

export function DeliveryDatePicker({
  selectedYear,
  selectedMonth,
  selectedDay,
  onMonthChange,
  onDayChange,
}: DeliveryDatePickerProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  const isCurrentMonth =
    selectedYear === currentYear && selectedMonth === currentMonth;

  function handlePrevMonth() {
    if (selectedMonth === 0) {
      onMonthChange(selectedYear - 1, 11);
    } else {
      onMonthChange(selectedYear, selectedMonth - 1);
    }
    onDayChange(null);
  }

  function handleNextMonth() {
    if (selectedMonth === 11) {
      onMonthChange(selectedYear + 1, 0);
    } else {
      onMonthChange(selectedYear, selectedMonth + 1);
    }
    onDayChange(null);
  }

  function handleJumpToday() {
    onMonthChange(currentYear, currentMonth);
    onDayChange(currentDate);
    setIsDropdownOpen(false);
  }

  const monthYearLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;

  return (
    <div className="relative inline-flex items-center gap-1.5 bg-white border border-[#cbd5e1] rounded-[7px] p-1 shadow-xs select-none">
      {/* Month Navigation Prev */}
      <button
        type="button"
        onClick={handlePrevMonth}
        className="w-7 h-7 rounded-[5px] text-[#475569] hover:text-[#0f172a] hover:bg-[#f1f5f9] flex items-center justify-center cursor-pointer transition-colors"
        title="Previous Month"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Month & Year Trigger Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-2.5 py-1 rounded-[5px] hover:bg-[#f8fafc] text-[#0f172a] text-[13px] font-bold cursor-pointer transition-colors"
        >
          <Calendar size={15} className="text-[#0284c7]" />
          <span>{monthYearLabel}</span>
          <ChevronDown
            size={13}
            className={`text-[#64748b] transition-transform ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu for Month & Year Selection */}
        {isDropdownOpen && (
          <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-[260px] bg-white border border-[#cbd5e1] rounded-[8px] p-3 shadow-lg animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e2e8f0]">
              <span className="text-[11.5px] font-semibold text-[#64748b]">
                Select Month &amp; Year
              </span>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(false)}
                className="text-[#94a3b8] hover:text-[#0f172a] cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Year Selector */}
            <div className="flex items-center justify-between mb-3 bg-[#f8fafc] p-1.5 rounded-[5px] border border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => onMonthChange(selectedYear - 1, selectedMonth)}
                className="p-1 hover:bg-[#e2e8f0] rounded text-[#475569] cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[13px] font-bold text-[#0f172a]">
                {selectedYear}
              </span>
              <button
                type="button"
                onClick={() => onMonthChange(selectedYear + 1, selectedMonth)}
                className="p-1 hover:bg-[#e2e8f0] rounded text-[#475569] cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Months 3x4 Grid */}
            <div className="grid grid-cols-3 gap-1 mb-2.5">
              {MONTH_NAMES.map((m, idx) => {
                const isSelected = idx === selectedMonth;
                const isCurrent = idx === currentMonth && selectedYear === currentYear;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      onMonthChange(selectedYear, idx);
                      setIsDropdownOpen(false);
                      onDayChange(null);
                    }}
                    className={`py-1.5 px-2 rounded-[5px] text-[11px] font-medium text-center cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#0284c7] text-white font-bold'
                        : isCurrent
                        ? 'bg-[#e0f2fe] text-[#0369a1] font-semibold'
                        : 'hover:bg-[#f1f5f9] text-[#334155]'
                    }`}
                  >
                    {m.slice(0, 3)}
                  </button>
                );
              })}
            </div>

            {/* Jump to Today Button */}
            <button
              type="button"
              onClick={handleJumpToday}
              className="w-full py-1.5 px-2 rounded-[5px] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#cbd5e1] text-[11px] font-semibold text-[#0284c7] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Today ({MONTH_NAMES[currentMonth].slice(0, 3)} {currentDate})</span>
            </button>
          </div>
        )}
      </div>

      {/* Month Navigation Next */}
      <button
        type="button"
        onClick={handleNextMonth}
        className="w-7 h-7 rounded-[5px] text-[#475569] hover:text-[#0f172a] hover:bg-[#f1f5f9] flex items-center justify-center cursor-pointer transition-colors"
        title="Next Month"
      >
        <ChevronRight size={16} />
      </button>

      {/* Quick Jump Today Pill */}
      {!isCurrentMonth ? (
        <button
          type="button"
          onClick={handleJumpToday}
          className="text-[11px] font-semibold text-[#0284c7] hover:bg-[#eff6ff] px-2 py-1 rounded-[5px] cursor-pointer transition-colors border border-transparent hover:border-[#bae6fd]"
          title="Jump to Current Month"
        >
          Current Month
        </button>
      ) : (
        <span className="text-[10.5px] font-bold text-[#047857] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-[4px]">
          Current
        </span>
      )}

      {/* Focused Day Indicator */}
      {selectedDay !== null && (
        <div className="flex items-center gap-1 bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] px-2 py-0.5 rounded-[4px] text-[11px] font-bold ml-1">
          <span>Day {selectedDay}</span>
          <button
            type="button"
            onClick={() => onDayChange(null)}
            className="text-[#60a5fa] hover:text-[#1d4ed8] cursor-pointer"
            title="Clear day filter"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
