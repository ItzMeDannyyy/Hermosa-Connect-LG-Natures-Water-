/**
 * ============================================================================
 * FILE: src/components/pos/QuickCounterRegisterPanel.tsx
 * PURPOSE: Streamlined Walk-in Counter POS with 3 large container grid boxes:
 *          - 10 Liters (10L) @ ₱13.00
 *          - 7 Liters (7L) @ ₱9.00
 *          - 5-Gallon Round @ ₱20.00
 *          - Tapping any box directly calculates sales in real time.
 *          - Pure direct sales calculation without cash tendered friction.
 *          - Strictly Lucide vector icons, zero Unicode emojis.
 *          - Tasteskill v2 framed-sheet principles: quiet 1px borders, high contrast.
 * ============================================================================
 */

import {
  CheckCircle2,
  CircleDot,
  Droplets,
  GlassWater,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBag,
  Trash2,
  User,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { COUNTER_CONTAINER_PRESETS } from '../../data/initialPosData';
import type { CreateOrderBackendInput } from '../../services/posApiService';
import type {
  WalkInContainerId,
  WalkInContainerItem,
} from '../../types/pos.types';

interface QuickCounterRegisterPanelProps {
  nextOrderNumber: number;
  onAddNewPosOrder: (newOrderInput: CreateOrderBackendInput) => Promise<void>;
}

export function QuickCounterRegisterPanel(
  props: QuickCounterRegisterPanelProps,
) {
  const [customerName, setCustomerName] = useState<string>('Walk-in Customer');

  // Quantities for the 3 container types
  const [cartQuantities, setCartQuantities] = useState<
    Record<WalkInContainerId, number>
  >({
    '10L': 0,
    '7L': 0,
    ROUND: 1, // Default with 1 Round gallon for immediate active calculation
  });

  const [emptyContainersReturned, setEmptyContainersReturned] =
    useState<number>(1);
  const [isSavingOrder, setIsSavingOrder] = useState<boolean>(false);

  // Derived financial calculations
  const lineItems = useMemo(() => {
    return COUNTER_CONTAINER_PRESETS.map((preset) => {
      const quantity = cartQuantities[preset.id] || 0;
      const lineTotal = quantity * preset.unitPrice;
      return {
        ...preset,
        quantity,
        lineTotal,
      };
    });
  }, [cartQuantities]);

  const activeLineItems = useMemo(() => {
    return lineItems.filter((item) => item.quantity > 0);
  }, [lineItems]);

  const totalContainers = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [lineItems]);

  const totalSalesAmount = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  }, [lineItems]);

  /**
   * Adds +1 of the selected container when the large BOX button is clicked
   */
  function handleBoxClick(containerId: WalkInContainerId) {
    setCartQuantities((prev) => ({
      ...prev,
      [containerId]: (prev[containerId] || 0) + 1,
    }));
  }

  function handleAdjustQuantity(containerId: WalkInContainerId, delta: number) {
    setCartQuantities((prev) => {
      const current = prev[containerId] || 0;
      const updated = Math.max(0, Math.min(100, current + delta));
      return {
        ...prev,
        [containerId]: updated,
      };
    });
  }

  function handleRemoveLineItem(containerId: WalkInContainerId) {
    setCartQuantities((prev) => ({
      ...prev,
      [containerId]: 0,
    }));
  }

  function handleResetCart() {
    setCartQuantities({
      '10L': 0,
      '7L': 0,
      ROUND: 0,
    });
  }

  function renderContainerIcon(id: WalkInContainerId) {
    if (id === '10L') {
      return <Droplets size={24} className="text-[#0284c7]" />;
    }
    if (id === '7L') {
      return <GlassWater size={24} className="text-[#0284c7]" />;
    }
    return <CircleDot size={24} className="text-[#0284c7]" />;
  }

  async function handleLogRefillOrderSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (totalContainers === 0 || totalSalesAmount <= 0) return;

    setIsSavingOrder(true);

    try {
      // Build descriptive preset summary
      const summaryParts: string[] = [];
      if (cartQuantities['10L'] > 0) {
        summaryParts.push(`${cartQuantities['10L']}× 10L Refill (₱13)`);
      }
      if (cartQuantities['7L'] > 0) {
        summaryParts.push(`${cartQuantities['7L']}× 7L Refill (₱9)`);
      }
      if (cartQuantities.ROUND > 0) {
        summaryParts.push(`${cartQuantities.ROUND}× 5-Gal Round Refill (₱20)`);
      }
      const presetSummary =
        summaryParts.length > 0
          ? summaryParts.join(', ')
          : 'Station Walk-In Refill';

      await props.onAddNewPosOrder({
        customerName: customerName.trim() || 'Walk-in Customer',
        deliveryAddress: 'Station Counter Walk-In',
        presetName: presetSummary,
        containerCount: totalContainers,
        emptyContainersToPickup: emptyContainersReturned,
        includeDeliveryFee: false,
        paymentState: 'PAID_CASH',
        subtotalAmount: totalSalesAmount,
        cashTendered: totalSalesAmount,
      });
    } finally {
      setIsSavingOrder(false);
    }
  }

  return (
    <form
      onSubmit={handleLogRefillOrderSubmit}
      className="flex flex-col justify-between h-full text-[13px]"
    >
      <div className="flex flex-col gap-4 overflow-y-auto pr-1">
        {/* ====================================================================
            1. HEADER & WALK-IN CUSTOMER NAME
            ==================================================================== */}
        <div className="flex items-center justify-between bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] p-2.5">
          <div className="flex items-center gap-2 flex-1 mr-2">
            <User size={15} className="text-[#64748b] shrink-0" />
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="bg-transparent border-0 font-medium text-[#0f172a] text-[13px] outline-none w-full"
              placeholder="Customer Name (defaults to Walk-in)"
            />
          </div>
          <span className="text-[11px] font-semibold text-[#0284c7] bg-[#f0f9ff] border border-[#bae6fd] rounded-[4px] px-2 py-0.5 whitespace-nowrap">
            Walk-In Only
          </span>
        </div>

        {/* ====================================================================
            2. THREE LARGE BOX BUTTONS IN A GRID
            Tapping any box immediately adds it into the order sales calculation
            ==================================================================== */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
              Select Gallon Type · Tap Box to Add
            </label>
            {totalContainers > 0 && (
              <button
                type="button"
                onClick={handleResetCart}
                className="px-2.5 py-1 rounded-[6px] border border-[#fecaca] bg-[#fff5f5] hover:bg-[#fee2e2] text-[#b91c1c] text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-[0.97]"
                title="Clear all gallon selections"
              >
                <RotateCcw size={13} strokeWidth={2.2} />
                <span>Clear All</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {COUNTER_CONTAINER_PRESETS.map((preset: WalkInContainerItem) => {
              const currentQty = cartQuantities[preset.id] || 0;
              const isSelected = currentQty > 0;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleBoxClick(preset.id)}
                  className={`relative p-3.5 rounded-[8px] border text-left cursor-pointer transition-all flex flex-col justify-between min-h-[124px] group active:scale-[0.98] ${
                    isSelected
                      ? 'border-[#0284c7] bg-[#f0f9ff] shadow-xs'
                      : 'border-[#cbd5e1] bg-white hover:border-[#94a3b8] hover:bg-[#f8fafc]'
                  }`}
                >
                  {/* Top: Icon & Quantity Badge (Quantity stays in black) */}
                  <div className="flex items-start justify-between w-full">
                    <div className="p-2 rounded-[6px] bg-[#f1f5f9] group-hover:bg-[#e2e8f0] transition-colors">
                      {renderContainerIcon(preset.id)}
                    </div>
                    {isSelected && (
                      <span className="num-mono text-[12px] font-bold text-white bg-[#0f172a] px-2.5 py-0.5 rounded-full shadow-xs">
                        ×{currentQty}
                      </span>
                    )}
                  </div>

                  {/* Middle: Title & Volume */}
                  <div className="mt-2.5">
                    <div className="font-semibold text-[#0f172a] text-[13px] leading-tight group-hover:text-[#0284c7] transition-colors">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-[#64748b] mt-0.5">
                      {preset.volumeLabel}
                    </div>
                  </div>

                  {/* Bottom: Gallon Price (in Green) */}
                  <div className="mt-1.5 pt-1.5 border-t border-[#e2e8f0]/60 flex items-baseline justify-between w-full">
                    <span className="text-[22px] font-extrabold text-[#15803d] num-mono leading-none">
                      ₱{preset.unitPrice}
                    </span>
                    <span className="text-[11px] text-[#0284c7] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      + Add
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ====================================================================
            3. LIVE SALES CALCULATION & CART ITEMS
            ==================================================================== */}
        <div className="border border-[#e2e8f0] rounded-[8px] bg-white overflow-hidden">
          <div className="bg-[#f8fafc] px-3.5 py-2.5 border-b border-[#e2e8f0] flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag size={13} className="text-[#0284c7]" />
              <span>Live Sales Calculation</span>
            </span>
            <span className="text-[12px] font-semibold text-[#0f172a] num-mono">
              {totalContainers} {totalContainers === 1 ? 'jug' : 'jugs'} ·{' '}
              <strong className="text-[#15803d] font-bold text-[13px]">
                ₱{totalSalesAmount.toFixed(2)}
              </strong>
            </span>
          </div>

          {activeLineItems.length === 0 ? (
            <div className="p-6 text-center text-[#94a3b8]">
              <Droplets size={24} className="mx-auto mb-1.5 opacity-50" />
              <p className="text-[12px]">Tap a gallon box above to calculate sales</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f1f5f9]">
              {activeLineItems.map((item) => (
                <div
                  key={item.id}
                  className="px-3.5 py-3 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#0f172a] text-[13px] truncate">
                      {item.name}
                    </div>
                    <div className="text-[12px] text-[#64748b] num-mono mt-0.5 flex items-center gap-1.5">
                      <span className="text-[#15803d] font-semibold">
                        ₱{item.unitPrice}.00
                      </span>
                      <span className="text-[#94a3b8]">×</span>
                      <span className="font-bold text-[#0f172a] text-[13px]">
                        {item.quantity}
                      </span>
                      <span className="text-[#94a3b8]">=</span>
                      <strong className="text-[#15803d] font-bold text-[15px]">
                        ₱{item.lineTotal.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  {/* Quantity Stepper (Quantity stays in black) */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAdjustQuantity(item.id, -1)}
                      className="w-7 h-7 rounded-[4px] border border-[#cbd5e1] bg-white flex items-center justify-center hover:bg-[#f1f5f9] cursor-pointer text-[#475569]"
                      title="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center font-bold text-[15px] text-[#0f172a] num-mono">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustQuantity(item.id, 1)}
                      className="w-7 h-7 rounded-[4px] border border-[#cbd5e1] bg-white flex items-center justify-center hover:bg-[#f1f5f9] cursor-pointer text-[#475569]"
                      title="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(item.id)}
                      className="w-7 h-7 rounded-[4px] text-[#94a3b8] hover:text-[#b91c1c] hover:bg-[#fef2f2] flex items-center justify-center cursor-pointer transition-colors ml-1"
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty Containers Returned Row */}
          <div className="px-3.5 py-2.5 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between">
            <span className="text-[12px] text-[#64748b]">
              Empty Containers Returned
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setEmptyContainersReturned((prev) => Math.max(0, prev - 1))
                }
                className="w-6 h-6 rounded-[4px] border border-[#cbd5e1] bg-white flex items-center justify-center hover:bg-[#f1f5f9] cursor-pointer text-[#475569]"
              >
                <Minus size={11} />
              </button>
              <span className="w-7 text-center font-bold text-[13px] text-[#0f172a] num-mono">
                {emptyContainersReturned}
              </span>
              <button
                type="button"
                onClick={() =>
                  setEmptyContainersReturned((prev) => Math.min(100, prev + 1))
                }
                className="w-6 h-6 rounded-[4px] border border-[#cbd5e1] bg-white flex items-center justify-center hover:bg-[#f1f5f9] cursor-pointer text-[#475569]"
              >
                <Plus size={11} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          4. BOTTOM SALES SUMMARY & LOG REFILL ORDER ACTION
          ==================================================================== */}
      <div className="pt-3.5 border-t border-[#e2e8f0] mt-4">
        <div className="flex items-center justify-between mb-3.5 bg-[#f8fafc] p-3 rounded-[6px] border border-[#e2e8f0]">
          <div>
            <div className="text-[11px] font-medium text-[#64748b]">
              Total Calculated Sales
            </div>
            <div className="text-[28px] font-extrabold text-[#15803d] num-mono leading-none mt-1">
              ₱{totalSalesAmount.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-medium text-[#64748b]">
              Refill Quantities
            </div>
            <div className="text-[13px] font-semibold text-[#0284c7] num-mono mt-0.5">
              {totalContainers} {totalContainers === 1 ? 'container' : 'containers'}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSavingOrder || totalContainers === 0}
          className="btn-primary w-full py-4 sm:py-4.5 min-h-[56px] text-[16px] sm:text-[17px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-[0.98] rounded-[8px]"
        >
          {isSavingOrder ? (
            <span>Adding Order...</span>
          ) : (
            <>
              <CheckCircle2 size={20} />
              <span>Add Order · ₱{totalSalesAmount.toFixed(2)}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
