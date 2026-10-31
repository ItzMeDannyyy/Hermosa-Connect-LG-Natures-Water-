/**
 * ============================================================================
 * FILE: src/components/pos/RegisterCustomerModalDrawer.tsx
 * PURPOSE: Counter POS & Customer Order Drawer conforming to tasteskill v2 framed-sheet.
 *          - High touch-accuracy and full-height right drawer.
 *          - Clean borders (1px hairline) without tacky rest shadows.
 *          - Strictly Lucide vector icons, zero Unicode emojis.
 * ============================================================================
 */

import { Droplets, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CreateOrderBackendInput } from '../../services/posApiService';
import { QuickCounterRegisterPanel } from './QuickCounterRegisterPanel';

interface RegisterCustomerModalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  nextOrderNumber: number;
  onAddNewPosOrder: (newOrderInput: CreateOrderBackendInput) => Promise<void>;
}

export function RegisterCustomerModalDrawer(
  props: RegisterCustomerModalDrawerProps,
) {
  const [isRendered, setIsRendered] = useState<boolean>(props.isOpen);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  useEffect(() => {
    if (props.isOpen) {
      setIsRendered(true);
      setIsExiting(false);
    } else if (isRendered && !isExiting) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsExiting(false);
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [props.isOpen]);

  function handleRequestClose() {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      setIsRendered(false);
      setIsExiting(false);
      props.onClose();
    }, 220);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && props.isOpen && !isExiting) {
        handleRequestClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [props.isOpen, isExiting]);

  async function handleOrderSuccess(newOrderInput: CreateOrderBackendInput) {
    await props.onAddNewPosOrder(newOrderInput);
    handleRequestClose();
  }

  if (!isRendered && !props.isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9998]">
      <div
        className={`register-drawer-scrim pointer-events-auto cursor-pointer ${
          isExiting ? 'is-leaving' : 'is-entering'
        }`}
        onClick={handleRequestClose}
        aria-hidden="true"
        title="Click outside to close"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="New Counter POS Order"
        onClick={(e) => e.stopPropagation()}
        className={`register-drawer-panel pointer-events-auto px-5 py-4 flex flex-col justify-between ${
          isExiting ? 'is-leaving' : 'is-entering'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[5px] bg-[#0284c7] text-white flex items-center justify-center">
              <Droplets size={15} />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-[#0f172a] leading-none">
                Walk-In Counter POS
              </h2>
              <span className="text-[11px] text-[#64748b] mt-0.5 block">
                Quick Gallon Selection &amp; Instant Sales
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRequestClose}
            className="w-7 h-7 rounded-[4px] border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] flex items-center justify-center cursor-pointer transition-colors"
            title="Close Drawer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Counter Register Form Body */}
        <div className="flex-1 overflow-hidden">
          <QuickCounterRegisterPanel
            nextOrderNumber={props.nextOrderNumber}
            onAddNewPosOrder={handleOrderSuccess}
          />
        </div>
      </aside>
    </div>,
    document.body,
  );
}
