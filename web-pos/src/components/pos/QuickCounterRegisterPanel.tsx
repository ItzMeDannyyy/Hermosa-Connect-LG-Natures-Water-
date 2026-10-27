/**
 * ============================================================================
 * FILE: src/components/pos/QuickCounterRegisterPanel.tsx
 * PURPOSE: Quick Counter POS Register & Customer Order Form.
 *          Adheres strictly to tasteskill v2 framed-sheet principles:
 *          - High touch-accuracy and engineered layout.
 *          - Clean segmented controls, clear price and profit math.
 *          - Tabular numbers (IBM Plex Mono).
 *          - Strictly Lucide vector icons, zero Unicode emojis.
 * ============================================================================
 */

import {
  Clock,
  Minus,
  Plus,
  Truck,
  User,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  DEFAULT_DELIVERY_FEE_PHP,
  DEFAULT_REFILL_PRICE_PHP,
} from '../../data/initialPosData';
import type { CreateOrderBackendInput } from '../../services/posApiService';
import type { PaymentState, TimeSlotLabel } from '../../types/pos.types';

interface QuickCounterRegisterPanelProps {
  nextOrderNumber: number;
  onAddNewPosOrder: (newOrderInput: CreateOrderBackendInput) => Promise<void>;
}

const SLIM_PRESET_NAME = '5-Gallon Slim Container (Refill)';
const ROUND_PRESET_NAME = '5-Gallon Round Dispenser Jug (Refill)';

const AVAILABLE_TIME_SLOTS: TimeSlotLabel[] = [
  '8:00 – 10:00 AM',
  '1:00 – 3:00 PM',
  '4:00 – 6:00 PM',
];

export function QuickCounterRegisterPanel(
  props: QuickCounterRegisterPanelProps,
) {
  const [includeDeliveryFee, setIncludeDeliveryFee] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('Walk-in Customer');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    '52 Esteban Abada St, Loyola Heights, QC',
  );

  const [presetName, setPresetName] = useState<string>(SLIM_PRESET_NAME);
  const [containerCount, setContainerCount] = useState<number>(5);
  const [emptyContainersToPickup, setEmptyContainersToPickup] =
    useState<number>(3);
  const [scheduledTimeSlot, setScheduledTimeSlot] =
    useState<TimeSlotLabel>('1:00 – 3:00 PM');

  const [paymentState, setPaymentState] = useState<PaymentState>('PAID_CASH');
  const [cashTendered, setCashTendered] = useState<number>(200);
  const [partialAmountPaid, setPartialAmountPaid] = useState<number>(100);
  const [isSavingOrder, setIsSavingOrder] = useState<boolean>(false);

  // Financial calculations
  const subtotalAmount = containerCount * DEFAULT_REFILL_PRICE_PHP;
  const deliveryFee = includeDeliveryFee ? DEFAULT_DELIVERY_FEE_PHP : 0;
  const totalDue = subtotalAmount + deliveryFee;

  let exactChange = 0;

  if (paymentState === 'PAID_CASH') {
    exactChange = Math.max(0, cashTendered - totalDue);
  }

  function adjustRefillCount(delta: number) {
    setContainerCount((prev) => Math.max(1, Math.min(100, prev + delta)));
  }

  function adjustPickupCount(delta: number) {
    setEmptyContainersToPickup((prev) =>
      Math.max(0, Math.min(100, prev + delta)),
    );
  }

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
    <form
      onSubmit={handleCreateOrderSubmit}
      className="flex flex-col justify-between h-full text-[13px]"
    >
      <div className="flex flex-col gap-4 overflow-y-auto pr-1">
        {/* Fulfillment Type Toggle */}
        <div>
          <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider mb-1.5">
            Fulfillment Mode
          </label>
          <div className="grid grid-cols-2 gap-2 bg-[#f1f5f9] p-1 rounded-[6px]">
            <button
              type="button"
              onClick={() => setIncludeDeliveryFee(false)}
              className={`py-2 px-3 rounded-[5px] text-[12px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                !includeDeliveryFee
                  ? 'bg-white text-[#0f172a] shadow-xs font-semibold'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <User size={14} />
              <span>Counter Walk-In</span>
            </button>
            <button
              type="button"
              onClick={() => setIncludeDeliveryFee(true)}
              className={`py-2 px-3 rounded-[5px] text-[12px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                includeDeliveryFee
                  ? 'bg-white text-[#0f172a] shadow-xs font-semibold'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Truck size={14} />
              <span>Rider Delivery (+₱25)</span>
            </button>
          </div>
        </div>

        {/* Customer Details */}
        <div className="flex flex-col gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider mb-1">
              Customer Name / Account
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="field-input"
              placeholder="e.g. Danny O., Ateneo Loyola Dorm"
            />
          </div>

          {includeDeliveryFee && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="field-input"
                  placeholder="Street address in Quezon City"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider mb-1">
                  Scheduled Delivery Window
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {AVAILABLE_TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setScheduledTimeSlot(slot)}
                      className={`py-1.5 px-2 rounded-[5px] border text-center text-[11px] font-medium cursor-pointer transition-colors ${
                        scheduledTimeSlot === slot
                          ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0284c7] font-semibold'
                          : 'border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]'
                      }`}
                    >
                      <Clock size={11} className="inline mr-1" />
                      <span>{slot}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Container Preset */}
        <div>
          <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider mb-1.5">
            Water Refill Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPresetName(SLIM_PRESET_NAME)}
              className={`p-2.5 rounded-[6px] border text-left cursor-pointer transition-colors ${
                presetName === SLIM_PRESET_NAME
                  ? 'border-[#0284c7] bg-[#f0f9ff]'
                  : 'border-[#e2e8f0] bg-white hover:bg-[#f8fafc]'
              }`}
            >
              <div className="font-semibold text-[#0f172a] text-[12px]">
                Slim 5-Gal Refill
              </div>
              <div className="text-[11px] text-[#64748b] num-mono">
                ₱{DEFAULT_REFILL_PRICE_PHP}.00 / jug
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPresetName(ROUND_PRESET_NAME)}
              className={`p-2.5 rounded-[6px] border text-left cursor-pointer transition-colors ${
                presetName === ROUND_PRESET_NAME
                  ? 'border-[#0284c7] bg-[#f0f9ff]'
                  : 'border-[#e2e8f0] bg-white hover:bg-[#f8fafc]'
              }`}
            >
              <div className="font-semibold text-[#0f172a] text-[12px]">
                Round Dispenser Jug
              </div>
              <div className="text-[11px] text-[#64748b] num-mono">
                ₱{DEFAULT_REFILL_PRICE_PHP}.00 / jug
              </div>
            </button>
          </div>
        </div>

        {/* Quantities & Pickups */}
        <div className="grid grid-cols-2 gap-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] p-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider mb-1">
              Refill Jugs
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustRefillCount(-1)}
                className="w-8 h-8 rounded-[4px] border border-[#cbd5e1] bg-white flex items-center justify-center hover:bg-[#f1f5f9] cursor-pointer"
              >
                <Minus size={13} />
              </button>
              <span className="w-10 text-center font-bold text-[16px] text-[#0f172a] num-mono">
                {containerCount}
              </span>
              <button
                type="button"
                onClick={() => adjustRefillCount(1)}
                className="w-8 h-8 rounded-[4px] border border-[#cbd5e1] bg-white flex items-center justify-center hover:bg-[#f1f5f9] cursor-pointer"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider mb-1">
              Empty Return
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustPickupCount(-1)}
                className="w-8 h-8 rounded-[4px] border border-[#cbd5e1] bg-white flex items-center justify-center hover:bg-[#f1f5f9] cursor-pointer"
              >
                <Minus size={13} />
              </button>
              <span className="w-10 text-center font-bold text-[16px] text-[#0f172a] num-mono">
                {emptyContainersToPickup}
              </span>
              <button
                type="button"
                onClick={() => adjustPickupCount(1)}
                className="w-8 h-8 rounded-[4px] border border-[#cbd5e1] bg-white flex items-center justify-center hover:bg-[#f1f5f9] cursor-pointer"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Payment Mode */}
        <div>
          <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider mb-1.5">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setPaymentState('PAID_CASH')}
              className={`py-2 px-2 rounded-[5px] border text-center text-[11px] font-medium cursor-pointer transition-colors ${
                paymentState === 'PAID_CASH'
                  ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0284c7] font-semibold'
                  : 'border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]'
              }`}
            >
              Cash (Tendered)
            </button>
            <button
              type="button"
              onClick={() => setPaymentState('PARTIAL')}
              className={`py-2 px-2 rounded-[5px] border text-center text-[11px] font-medium cursor-pointer transition-colors ${
                paymentState === 'PARTIAL'
                  ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0284c7] font-semibold'
                  : 'border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]'
              }`}
            >
              Partial Deposit
            </button>
            <button
              type="button"
              onClick={() => setPaymentState('UNPAID_CHARGE_SLIP')}
              className={`py-2 px-2 rounded-[5px] border text-center text-[11px] font-medium cursor-pointer transition-colors ${
                paymentState === 'UNPAID_CHARGE_SLIP'
                  ? 'border-[#b91c1c] bg-[#fef2f2] text-[#b91c1c] font-semibold'
                  : 'border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]'
              }`}
            >
              Charge Slip
            </button>
          </div>

          {paymentState === 'PAID_CASH' && (
            <div className="mt-2 flex items-center justify-between bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] p-2.5">
              <span className="text-[12px] text-[#64748b]">Cash Tendered:</span>
              <div className="flex items-center gap-2">
                <span className="num-mono text-[12px]">₱</span>
                <input
                  type="number"
                  min={totalDue}
                  step={5}
                  value={cashTendered}
                  onChange={(e) => setCashTendered(Number(e.target.value))}
                  className="w-24 bg-white border border-[#cbd5e1] rounded-[4px] px-2 py-1 text-right num-mono text-[12px] font-semibold outline-none"
                />
                <span className="text-[11px] text-[#15803d] num-mono">
                  Change: ₱{exactChange.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {paymentState === 'PARTIAL' && (
            <div className="mt-2 flex items-center justify-between bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] p-2.5">
              <span className="text-[12px] text-[#64748b]">Deposit Received:</span>
              <div className="flex items-center gap-2">
                <span className="num-mono text-[12px]">₱</span>
                <input
                  type="number"
                  min={0}
                  max={totalDue}
                  step={5}
                  value={partialAmountPaid}
                  onChange={(e) => setPartialAmountPaid(Number(e.target.value))}
                  className="w-24 bg-white border border-[#cbd5e1] rounded-[4px] px-2 py-1 text-right num-mono text-[12px] font-semibold outline-none"
                />
                <span className="text-[11px] text-[#b91c1c] num-mono">
                  Remaining: ₱{Math.max(0, totalDue - partialAmountPaid).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Summary & Order Creation Action */}
      <div className="pt-3 border-t border-[#e2e8f0] mt-3">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <div className="text-[11px] text-[#64748b]">Total Collectible Due</div>
            <div className="text-[18px] font-bold text-[#0f172a] num-mono">
              ₱{totalDue.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-[#64748b]">Breakdown</div>
            <div className="text-[12px] font-medium text-[#475569] num-mono">
              ₱{subtotalAmount.toFixed(2)} + ₱{deliveryFee.toFixed(2)} fee
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSavingOrder}
          className="btn-primary w-full py-2.5 text-[13px] font-semibold cursor-pointer disabled:opacity-50"
        >
          {isSavingOrder
            ? 'Logging Order to Station Ledger...'
            : `Log Refill Order (#ORD-${props.nextOrderNumber})`}
        </button>
      </div>
    </form>
  );
}
