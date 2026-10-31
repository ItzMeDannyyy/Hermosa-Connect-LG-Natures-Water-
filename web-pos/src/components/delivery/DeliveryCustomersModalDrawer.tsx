/**
 * ============================================================================
 * FILE: src/components/delivery/DeliveryCustomersModalDrawer.tsx
 * PURPOSE: Full-height sliding modal drawer for Rapid Delivery Customer Entry.
 *          Operator selects Foton/Sidecar, enters Barangay, types Customer Name,
 *          and hits Enter to queue items rapidly without cursor jumping.
 *          Dynamic button: "Add Delivery Customer(s) - [N]".
 *          Strict Lucide vector icons, zero Unicode emojis.
 * ============================================================================
 */

import {
  ListPlus,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  bulkCreateDeliveryCustomersOnBackend,
  deleteDeliveryCustomerOnBackend,
  fetchDeliveryCustomersFromBackend,
  updateDeliveryCustomerOnBackend,
} from '../../services/deliveryApiService';
import type {
  DeliveryCustomersResponse,
  VehicleType,
} from '../../types/delivery.types';
import { BarangayRosterList } from './BarangayRosterList';
import {
  RapidQueueCustomerEntry,
  type QueuedCustomerItem,
} from './RapidQueueCustomerEntry';
import { VehicleTypeCapsuleToggle } from './VehicleTypeCapsuleToggle';

interface DeliveryCustomersModalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNotification?: (msg: string, variant: 'success' | 'info' | 'error') => void;
}

type TabType = 'QUEUE' | 'ROSTER';

export function DeliveryCustomersModalDrawer({
  isOpen,
  onClose,
  onNotification,
}: DeliveryCustomersModalDrawerProps) {
  const [isRendered, setIsRendered] = useState<boolean>(isOpen);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  // Active Vehicle Capsule Selection (Foton vs Sidecar)
  const [activeVehicle, setActiveVehicle] = useState<VehicleType>('FOTON');

  // Active View: Defaults directly to Rapid Enter-Key Queue Entry
  const [activeTab, setActiveTab] = useState<TabType>('QUEUE');

  // Delivery Customers State
  const [rosterData, setRosterData] = useState<DeliveryCustomersResponse>({
    totalCustomers: 0,
    fotonCount: 0,
    sidecarCount: 0,
    barangays: [],
    allCustomers: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsExiting(false);
      loadCustomers();
      setActiveTab('QUEUE');
    } else if (isRendered && !isExiting) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsExiting(false);
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  async function loadCustomers() {
    setIsLoading(true);
    try {
      const res = await fetchDeliveryCustomersFromBackend();
      setRosterData(res);
    } catch (e) {
      console.warn('Failed to fetch customers:', e);
    } finally {
      setIsLoading(false);
    }
  }

  function handleRequestClose() {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      setIsRendered(false);
      setIsExiting(false);
      onClose();
    }, 220);
  }

  // Escape key listener
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen && !isExiting) {
        handleRequestClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExiting]);

  async function handleCommitQueue(queuedItems: QueuedCustomerItem[]) {
    const res = await bulkCreateDeliveryCustomersOnBackend({
      customers: queuedItems.map((item) => ({
        name: item.name,
        phoneNumber: item.phoneNumber,
        barangay: item.barangay,
        vehicleType: item.vehicleType,
      })),
      defaultVehicleType: activeVehicle,
    });
    await loadCustomers();
    onNotification?.(
      `Successfully added ${res.insertedCount} delivery customers to database!`,
      'success',
    );
    setActiveTab('ROSTER');
  }

  async function handleToggleCustomerVehicle(customerId: string, nextType: VehicleType) {
    await updateDeliveryCustomerOnBackend(customerId, { vehicleType: nextType });
    await loadCustomers();
    onNotification?.(`Vehicle rotation updated to ${nextType}.`, 'info');
  }

  async function handleDeleteCustomer(customerId: string) {
    await deleteDeliveryCustomerOnBackend(customerId);
    await loadCustomers();
    onNotification?.('Customer removed from delivery roster.', 'info');
  }

  if (!isRendered && !isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9998]">
      {/* Scrim Overlay */}
      <div
        className={`register-drawer-scrim pointer-events-auto cursor-pointer ${
          isExiting ? 'is-leaving' : 'is-entering'
        }`}
        onClick={handleRequestClose}
        aria-hidden="true"
        title="Click outside to close"
      />

      {/* Drawer Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Add Delivery Customers"
        onClick={(e) => e.stopPropagation()}
        className={`register-drawer-panel pointer-events-auto px-5 py-4 flex flex-col justify-between max-w-[560px] w-full ${
          isExiting ? 'is-leaving' : 'is-entering'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[6px] bg-[#0284c7] text-white flex items-center justify-center shadow-xs">
              <Truck size={17} />
            </div>
            <div>
              <h2 className="text-[14.5px] font-bold text-[#0f172a] leading-tight">
                Add Delivery Customers
              </h2>
              <span className="text-[11px] text-[#64748b] block">
                Type name &amp; press Enter to queue • Foton or Sidecar fleet rotation
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

        {/* Top Vehicle Capsule Sliding Toggle (Foton vs Sidecar) */}
        <div className="mb-3">
          <VehicleTypeCapsuleToggle
            value={activeVehicle}
            onChange={setActiveVehicle}
            label="Fleet Vehicle Rotation"
            sublabel="Is this barangay/batch under Foton Truck or Motorcycle Sidecar rotation?"
          />
        </div>

        {/* Navigation Switcher: Add Queue vs Roster */}
        <div className="flex items-center gap-1.5 p-1 bg-[#f1f5f9] rounded-[6px] border border-[#e2e8f0] mb-3.5 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('QUEUE')}
            className={`flex-1 py-1.5 px-3 rounded-[5px] text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'QUEUE'
                ? 'bg-white text-[#0f172a] shadow-xs border border-[#cbd5e1]'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <ListPlus size={14} className="text-[#0284c7]" />
            <span>Add Customers (Queue)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ROSTER')}
            className={`flex-1 py-1.5 px-3 rounded-[5px] text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'ROSTER'
                ? 'bg-white text-[#0f172a] shadow-xs border border-[#cbd5e1]'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <Users size={14} />
            <span>Saved Roster</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                activeTab === 'ROSTER'
                  ? 'bg-[#0284c7] text-white'
                  : 'bg-[#e2e8f0] text-[#475569]'
              }`}
            >
              {rosterData.totalCustomers}
            </span>
          </button>
        </div>

        {/* Content Body Based on Tab */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-0.5">
          {activeTab === 'QUEUE' ? (
            <RapidQueueCustomerEntry
              currentVehicle={activeVehicle}
              defaultBarangay={
                rosterData.barangays[0]?.barangay || 'Loyola Heights'
              }
              onCommitQueue={handleCommitQueue}
              onSuccess={() => {}}
            />
          ) : (
            <BarangayRosterList
              barangays={rosterData.barangays}
              allCustomers={rosterData.allCustomers}
              onToggleVehicle={handleToggleCustomerVehicle}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}
        </div>

        {/* Footer info bar */}
        <div className="pt-3 mt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#64748b]">
          <div className="flex items-center gap-2">
            <span>
              Total Saved: <strong>{rosterData.totalCustomers}</strong>
            </span>
            <span>•</span>
            <span className="text-[#047857]">
              Foton: <strong>{rosterData.fotonCount}</strong>
            </span>
            <span>•</span>
            <span className="text-[#1d4ed8]">
              Sidecar: <strong>{rosterData.sidecarCount}</strong>
            </span>
          </div>

          <span className="text-[#94a3b8]">
            {isLoading ? 'Syncing...' : 'Esc to close'}
          </span>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
