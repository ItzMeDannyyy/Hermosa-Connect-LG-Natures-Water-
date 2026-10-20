/**
 * ============================================================================
 * FILE: src/components/pos/QuickCounterRegisterPanel.tsx
 * PURPOSE: Fast, tap-friendly Station Counter POS Register.
 *          - Organized into 3 clear Fieldsets:
 *              1. Customer & Fulfillment
 *              2. Container Count & Pickup Slot (with tap-friendly Radio Cards,
 *                 +/- steppers, and a subtle "AI Photo Tally" popover)
 *              3. Payment Method (4 interactive Radio Cards for Cash, E-Pay,
 *                 Partial, and Unpaid Slip)
 *          - Sticky Checkout Footer at the bottom showing the calculated total,
 *            exact change / balance due, and primary submit button.
 *          - Styled with Tailwind CSS and Lucide icons (lucide-react) strictly.
 * ============================================================================
 */

import {
  Banknote,
  Calculator,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock,
  Droplets,
  Minus,
  PieChart,
  Plus,
  Smartphone,
  Store,
  Truck,
  User,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  DEFAULT_DELIVERY_FEE_PHP,
  DEFAULT_REFILL_PRICE_PHP,
  TOTAL_OPERATIONAL_COST_PER_JUG_PHP,
} from '../../data/initialPosData';
import type { CreateOrderBackendInput } from '../../services/posApiService';
import type { PaymentState, TimeSlotLabel } from '../../types/pos.types';

interface QuickCounterRegisterPanelProps {
  nextOrderNumber: number;
  onAddNewPosOrder: (newOrderInput: CreateOrderBackendInput) => Promise<void>;
}

const AVAILABLE_PRESETS = [
  {
    id: 'slim',
    label: '5-Gal Slim',
    fullName: '5-Gallon Slim Container (Refill)',
    priceLabel: 'PHP 25',
  },
  {
    id: 'round',
    label: '5-Gal Round',
    fullName: '5-Gallon Round Dispenser Jug (Refill)',
    priceLabel: 'PHP 25',
  },
];

const AVAILABLE_TIME_SLOTS: TimeSlotLabel[] = [
  '8:00 – 10:00 AM',
  '1:00 – 3:00 PM',
  '4:00 – 6:00 PM',
];

export function QuickCounterRegisterPanel(
  props: QuickCounterRegisterPanelProps,
) {
  // Fieldset 1: Customer & Fulfillment State
  const [customerName, setCustomerName] = useState<string>('Walk-in Customer');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    '52 Esteban Abada St, Loyola Heights, QC',
  );
  const [includeDeliveryFee, setIncludeDeliveryFee] = useState<boolean>(true);

  // Fieldset 2: Container Preset, Count & Schedule State
  const [presetName, setPresetName] = useState<string>(
    '5-Gallon Slim Container (Refill)',
  );
  const [containerCount, setContainerCount] = useState<number>(8);
  const [emptyContainersToPickup, setEmptyContainersToPickup] =
    useState<number>(3);
  const [scheduledTimeSlot, setScheduledTimeSlot] =
    useState<TimeSlotLabel>('1:00 – 3:00 PM');
  const [isAiCameraMenuOpen, setIsAiCameraMenuOpen] = useState<boolean>(false);
  const [aiVerifiedBadgeText, setAiVerifiedBadgeText] = useState<string | null>(
    null,
  );

  // Fieldset 3: Payment Method State
  const [paymentState, setPaymentState] = useState<PaymentState>('PAID_CASH');
  const [cashTendered, setCashTendered] = useState<number>(250);
  const [partialAmountPaid, setPartialAmountPaid] = useState<number>(130);
  const [isSavingOrder, setIsSavingOrder] = useState<boolean>(false);

  // Step-by-step POS Pricing & Profit Math
  const subtotalAmount = containerCount * DEFAULT_REFILL_PRICE_PHP;
  const deliveryFee = includeDeliveryFee ? DEFAULT_DELIVERY_FEE_PHP : 0;
  const totalDue = subtotalAmount + deliveryFee;

  const operationalCostTotal =
    containerCount * TOTAL_OPERATIONAL_COST_PER_JUG_PHP;
  const trueNetProfit = totalDue - operationalCostTotal;

  let exactChange = 0;
  let balanceDue = 0;

  if (paymentState === 'PAID_CASH') {
    exactChange = Math.max(0, cashTendered - totalDue);
  } else if (paymentState === 'PARTIAL') {
    const validPaid = Math.min(partialAmountPaid, totalDue);
    balanceDue = Math.max(0, totalDue - validPaid);
  } else if (paymentState === 'UNPAID_CHARGE_SLIP') {
    balanceDue = totalDue;
  }

  /**
   * Adjusts container count via tap-friendly +/- stepper buttons
   */
  function adjustRefillCount(delta: number) {
    const nextValue = Math.max(1, Math.min(100, containerCount + delta));
    setContainerCount(nextValue);
    setAiVerifiedBadgeText(null);
  }

  /**
   * Adjusts empty container pickup count via +/- stepper buttons
   */
  function adjustPickupCount(delta: number) {
    const nextValue = Math.max(
      0,
      Math.min(100, emptyContainersToPickup + delta),
    );
    setEmptyContainersToPickup(nextValue);
  }

  /**
   * Applies AI Camera Container Count from the subtle camera popover
   */
  function handleApplyAiCameraCount(detectedJugs: number) {
    setContainerCount(detectedJugs);
    setAiVerifiedBadgeText(`${detectedJugs} jugs counted by camera`);
    setIsAiCameraMenuOpen(false);
  }

  /**
   * Submits the new order to NestJS (POST /api/pos/orders)
   */
  async function handleCreateOrderSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setIsSavingOrder(true);

    try {
      await props.onAddNewPosOrder({
        customerName: customerName,
        deliveryAddress: includeDeliveryFee
          ? deliveryAddress
          : 'Station Counter Walk-In',
        presetName: presetName,
        containerCount: containerCount,
        emptyContainersToPickup: emptyContainersToPickup,
        includeDeliveryFee: includeDeliveryFee,
        scheduledTimeSlot: scheduledTimeSlot,
        paymentState: paymentState,
        cashTendered: cashTendered,
        partialAmountPaid: partialAmountPaid,
      });
    } finally {
      setIsSavingOrder(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col">
      {/* Compact Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-100">
        <div>
          <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
            <Calculator size={18} className="text-blue-600" />
            <span>Counter POS Register</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tap-to-select presets and instant checkout calculation
          </p>
        </div>

        {/* Subtle Camera Scan Trigger (Tucks away testing buttons) */}
        <div className="relative">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
            onClick={() => setIsAiCameraMenuOpen(!isAiCameraMenuOpen)}
          >
            <Camera size={14} className="text-blue-600" />
            <span>AI Photo Tally</span>
          </button>

          {isAiCameraMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl p-3 shadow-xl z-40 min-w-[220px]">
              <span className="block text-[11px] font-bold text-slate-500 mb-2">
                Simulate Camera Detection Load:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[6, 8, 12].map((count) => (
                  <button
                    key={count}
                    type="button"
                    className="py-1.5 px-2 rounded-lg text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors cursor-pointer"
                    onClick={() => handleApplyAiCameraCount(count)}
                  >
                    {count} Jugs
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleCreateOrderSubmit} className="flex flex-col gap-3">
        {/* ================================================================
            FIELDSET 1: CUSTOMER & FULFILLMENT TYPE
            ================================================================ */}
        <fieldset className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 flex flex-col gap-2.5">
          <legend className="inline-flex items-center gap-1.5 px-2 text-xs font-extrabold text-slate-800">
            <User size={13} className="text-blue-600" />
            <span>1. Customer &amp; Fulfillment</span>
          </legend>

          {/* Fulfillment Radio Cards: Rider Delivery vs Counter Walk-In */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                includeDeliveryFee
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/15'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => setIncludeDeliveryFee(true)}
            >
              <Truck
                size={16}
                className={
                  includeDeliveryFee ? 'text-blue-600' : 'text-slate-400'
                }
              />
              <div className="flex flex-col">
                <strong className="text-xs font-bold">Rider Delivery</strong>
                <small className="text-[11px] text-slate-500">
                  +PHP 30 fee • Issues #INV
                </small>
              </div>
            </button>

            <button
              type="button"
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                !includeDeliveryFee
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/15'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => setIncludeDeliveryFee(false)}
            >
              <Store
                size={16}
                className={
                  !includeDeliveryFee ? 'text-blue-600' : 'text-slate-400'
                }
              />
              <div className="flex flex-col">
                <strong className="text-xs font-bold">Counter Walk-In</strong>
                <small className="text-[11px] text-slate-500">
                  No delivery fee • Issues #OR
                </small>
              </div>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Customer or Office Name"
                required
                className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            {includeDeliveryFee && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Delivery Street Address
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  placeholder="Street, Barangay, City"
                  required
                  className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </fieldset>

        {/* ================================================================
            FIELDSET 2: ORDER COUNT, CONTAINER TYPE & PICKUP SLOT
            ================================================================ */}
        <fieldset className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 flex flex-col gap-2.5">
          <legend className="inline-flex items-center gap-1.5 px-2 text-xs font-extrabold text-slate-800">
            <Droplets size={13} className="text-blue-600" />
            <span>2. Order Count &amp; Container Preset</span>
            {aiVerifiedBadgeText !== null && (
              <span className="inline-flex items-center gap-1 ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={11} />
                <span>{aiVerifiedBadgeText}</span>
              </span>
            )}
          </legend>

          {/* Container Type Radio Cards */}
          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_PRESETS.map((preset) => {
              const isSelected = presetName === preset.fullName;
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/15'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setPresetName(preset.fullName)}
                >
                  <Droplets
                    size={16}
                    className={isSelected ? 'text-blue-600' : 'text-slate-400'}
                  />
                  <div className="flex flex-col">
                    <strong className="text-xs font-bold">
                      {preset.label}
                    </strong>
                    <small className="text-[11px] text-slate-500">
                      {preset.priceLabel} / refill
                    </small>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Fast POS +/- Steppers for Refill Qty & Empty Pickup Qty */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Refill Qty
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => adjustRefillCount(-1)}
                >
                  <Minus size={14} />
                </button>
                <span className="min-w-[24px] text-center text-sm font-extrabold text-slate-900">
                  {containerCount}
                </span>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => adjustRefillCount(1)}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Empty Pickup
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => adjustPickupCount(-1)}
                >
                  <Minus size={14} />
                </button>
                <span className="min-w-[24px] text-center text-sm font-extrabold text-slate-900">
                  {emptyContainersToPickup}
                </span>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => adjustPickupCount(1)}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Time Slot Segmented Pills (Only needed for Delivery / Pickup) */}
          {includeDeliveryFee && (
            <div className="flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                <Clock size={12} />
                <span>Scheduled Time Window</span>
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {AVAILABLE_TIME_SLOTS.map((slot) => {
                  const isActiveSlot = scheduledTimeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                        isActiveSlot
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                      onClick={() => setScheduledTimeSlot(slot)}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </fieldset>

        {/* ================================================================
            FIELDSET 3: PAYMENT METHOD & TENDERED AMOUNT
            ================================================================ */}
        <fieldset className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 flex flex-col gap-2.5">
          <legend className="inline-flex items-center gap-1.5 px-2 text-xs font-extrabold text-slate-800">
            <Banknote size={13} className="text-blue-600" />
            <span>3. Payment Method</span>
          </legend>

          {/* 4 Payment State Radio Cards */}
          <div className="grid grid-cols-4 gap-1.5">
            <button
              type="button"
              className={`flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                paymentState === 'PAID_CASH'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/15'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setPaymentState('PAID_CASH')}
            >
              <Banknote size={15} />
              <strong className="text-[11px] font-bold">Cash</strong>
            </button>

            <button
              type="button"
              className={`flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                paymentState === 'E_PAYMENT'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/15'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setPaymentState('E_PAYMENT')}
            >
              <Smartphone size={15} />
              <strong className="text-[11px] font-bold">GCash / Maya</strong>
            </button>

            <button
              type="button"
              className={`flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                paymentState === 'PARTIAL'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/15'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setPaymentState('PARTIAL')}
            >
              <PieChart size={15} />
              <strong className="text-[11px] font-bold">Partial</strong>
            </button>

            <button
              type="button"
              className={`flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                paymentState === 'UNPAID_CHARGE_SLIP'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/15'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setPaymentState('UNPAID_CHARGE_SLIP')}
            >
              <ClipboardList size={15} />
              <strong className="text-[11px] font-bold">Charge Slip</strong>
            </button>
          </div>

          {paymentState === 'PAID_CASH' && (
            <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2">
              <label className="text-xs font-bold text-slate-700">
                Cash Tendered (PHP):
              </label>
              <input
                type="number"
                min={0}
                value={cashTendered}
                onChange={(event) =>
                  setCashTendered(Number(event.target.value))
                }
                className="w-28 text-right font-extrabold text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          )}

          {paymentState === 'PARTIAL' && (
            <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2">
              <label className="text-xs font-bold text-slate-700">
                Amount Paid Now (PHP):
              </label>
              <input
                type="number"
                min={0}
                max={totalDue}
                value={partialAmountPaid}
                onChange={(event) =>
                  setPartialAmountPaid(Number(event.target.value))
                }
                className="w-28 text-right font-extrabold text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          )}
        </fieldset>

        {/* ================================================================
            STICKY CHECKOUT / SUBMIT FOOTER
            ================================================================ */}
        <div className="sticky bottom-0 z-10 bg-slate-900 text-white rounded-xl p-3.5 shadow-lg flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                TOTAL DUE
              </span>
              <span className="text-xs text-slate-300 mt-0.5">
                {containerCount} × PHP {DEFAULT_REFILL_PRICE_PHP}
                {includeDeliveryFee ? ' + PHP 30 delivery' : ' (Walk-in)'} • Net
                PHP {trueNetProfit.toFixed(0)}
              </span>
            </div>

            <div className="flex flex-col items-end">
              <strong className="text-lg font-extrabold text-white leading-tight">
                PHP {totalDue.toFixed(2)}
              </strong>
              {paymentState === 'PAID_CASH' && (
                <span className="mt-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300">
                  Change: PHP {exactChange.toFixed(2)}
                </span>
              )}
              {(paymentState === 'PARTIAL' ||
                paymentState === 'UNPAID_CHARGE_SLIP') && (
                <span className="mt-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300">
                  Balance Due: PHP {balanceDue.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingOrder}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-colors cursor-pointer"
          >
            <Zap size={16} />
            <span>
              {isSavingOrder
                ? 'Logging Order...'
                : `Complete & Issue ${
                    includeDeliveryFee
                      ? `#INV-${props.nextOrderNumber}`
                      : `#OR-${props.nextOrderNumber}`
                  } (PHP ${totalDue.toFixed(2)})`}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
