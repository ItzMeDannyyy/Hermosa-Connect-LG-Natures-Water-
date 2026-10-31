/**
 * ============================================================================
 * FILE: src/components/delivery/RapidQueueCustomerEntry.tsx
 * PURPOSE: High-speed, keyboard-driven delivery customer entry workflow.
 *          Type name -> Press Enter -> Added to queue -> Cursor stays focused!
 *          Dynamic button: "Add Delivery Customer(s) - [N]".
 *          Strict Lucide vector icons, zero Unicode emojis.
 * ============================================================================
 */

import {
  AlertCircle,
  Building,
  CheckCircle2,
  CornerDownLeft,
  Phone,
  Plus,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import { useRef, useState } from 'react';
import {
  COMMON_BARANGAYS,
  type VehicleType,
} from '../../types/delivery.types';

export interface QueuedCustomerItem {
  id: string;
  name: string;
  phoneNumber?: string;
  barangay: string;
  vehicleType: VehicleType;
}

interface RapidQueueCustomerEntryProps {
  currentVehicle: VehicleType;
  defaultBarangay: string;
  onCommitQueue: (queuedItems: QueuedCustomerItem[]) => Promise<void>;
  onSuccess: () => void;
}

export function RapidQueueCustomerEntry({
  currentVehicle,
  defaultBarangay,
  onCommitQueue,
  onSuccess,
}: RapidQueueCustomerEntryProps) {
  const [barangay, setBarangay] = useState<string>(defaultBarangay || 'Loyola Heights');
  const [customerName, setCustomerName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [queuedCustomers, setQueuedCustomers] = useState<QueuedCustomerItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ref to keep focus in the Customer Name input field
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Adds the current customer to the staging queue on Enter
   */
  function handleQueueCustomer() {
    const trimmedName = customerName.trim();
    const trimmedBarangay = barangay.trim();

    if (!trimmedBarangay) {
      setErrorMessage('Please type a Barangay first.');
      return;
    }

    if (!trimmedName) {
      setErrorMessage('Please enter a Customer Name.');
      nameInputRef.current?.focus();
      return;
    }

    const newItem: QueuedCustomerItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: trimmedName,
      phoneNumber: phoneNumber.trim() || undefined,
      barangay: trimmedBarangay,
      vehicleType: currentVehicle,
    };

    setQueuedCustomers((prev) => [...prev, newItem]);
    setCustomerName('');
    setPhoneNumber('');
    setErrorMessage(null);

    // BONUS IMPLEMENTATION: Keep cursor focused in customer name input field
    // so operator can continuously type Name -> Enter -> Name -> Enter
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 10);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQueueCustomer();
    }
  }

  function handleRemoveQueuedItem(idToRemove: string) {
    setQueuedCustomers((prev) => prev.filter((item) => item.id !== idToRemove));
    nameInputRef.current?.focus();
  }

  function handleClearQueue() {
    setQueuedCustomers([]);
    setErrorMessage(null);
    nameInputRef.current?.focus();
  }

  async function handleCommit() {
    if (queuedCustomers.length === 0) {
      setErrorMessage('Queue is empty. Type a customer name and press Enter to add to queue.');
      nameInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onCommitQueue(queuedCustomers);
      setQueuedCustomers([]);
      setCustomerName('');
      setPhoneNumber('');
      onSuccess();
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to add customers.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col h-full space-y-3.5">
      {/* 1. Barangay Manual Input */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11.5px] font-semibold text-[#334155] flex items-center gap-1.5">
            <Building size={13} className="text-[#0284c7]" />
            <span>Barangay</span>
            <span className="text-[#ef4444]">*</span>
          </label>
          <span className="text-[10.5px] text-[#64748b]">
            Manually type or select
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            required
            list="barangay-suggestions"
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
            placeholder="Type Barangay name (e.g. Loyola Heights, Pansol, Matandang Balara)..."
            className="w-full px-3 py-1.5 bg-white border border-[#cbd5e1] rounded-[6px] text-[12px] font-semibold text-[#0f172a] focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
          />
          <datalist id="barangay-suggestions">
            {COMMON_BARANGAYS.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>
      </div>

      {/* 2. Customer Name & Optional Phone Inputs */}
      <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded-[7px] p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-bold text-[#0f172a] flex items-center gap-1.5">
            <User size={13} className="text-[#0284c7]" />
            <span>Customer Name</span>
            <span className="text-[#ef4444]">*</span>
          </span>
          <span className="text-[10px] font-mono text-[#0284c7] bg-[#e0f2fe] px-2 py-0.5 rounded border border-[#bae6fd] flex items-center gap-1">
            <CornerDownLeft size={10} />
            <span>Press ENTER to Queue</span>
          </span>
        </div>

        {/* Customer Name Input (With Auto-Focus Retention) */}
        <div className="relative">
          <input
            ref={nameInputRef}
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type customer name, then press Enter..."
            autoFocus
            className="w-full px-3 py-2 bg-white border-2 border-[#0284c7] rounded-[6px] text-[13px] font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#38bdf8] shadow-xs"
          />
        </div>

        {/* Optional Phone Number & Queue Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Phone
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
            />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Optional phone number (press Enter)..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#cbd5e1] rounded-[6px] text-[11.5px] text-[#0f172a] focus:outline-none focus:border-[#0284c7]"
            />
          </div>

          <button
            type="button"
            onClick={handleQueueCustomer}
            className="px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-[6px] text-[11.5px] font-semibold flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-2xs"
            title="Add customer to queue"
          >
            <Plus size={13} />
            <span>Queue</span>
          </button>
        </div>

        <p className="text-[10.5px] text-[#64748b]">
          Tip: Cursor automatically stays in the Name input so you can rapidly enter: <code className="bg-[#e2e8f0] px-1 py-0.2 rounded font-mono text-[#0f172a]">Name → Enter → Name → Enter</code>
        </p>
      </div>

      {/* 3. Staged Queue List */}
      <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#e2e8f0] rounded-[7px] p-2.5">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#0f172a]">
              Queued Customers to Add
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                queuedCustomers.length > 0
                  ? 'bg-[#0284c7] text-white'
                  : 'bg-[#e2e8f0] text-[#64748b]'
              }`}
            >
              {queuedCustomers.length} {queuedCustomers.length === 1 ? 'person' : 'persons'}
            </span>
          </div>

          {queuedCustomers.length > 0 && (
            <button
              type="button"
              onClick={handleClearQueue}
              className="text-[11px] text-[#ef4444] hover:underline cursor-pointer"
            >
              Clear Queue
            </button>
          )}
        </div>

        {queuedCustomers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#94a3b8]">
            <Users size={28} className="opacity-30 mb-1.5" />
            <p className="text-[12px] font-medium text-[#475569]">
              Queue is empty
            </p>
            <p className="text-[11px] text-[#94a3b8] mt-0.5">
              Type customer name above and press <kbd className="font-mono bg-[#f1f5f9] px-1 py-0.2 rounded border border-[#cbd5e1] text-[#334155]">Enter</kbd> to build your list.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[220px]">
            {queuedCustomers.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 bg-[#f8fafc] rounded border border-[#e2e8f0] text-[11.5px] hover:border-[#cbd5e1] transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono text-[#94a3b8] w-4 text-right">
                    {idx + 1}.
                  </span>
                  <div className="truncate">
                    <span className="font-bold text-[#0f172a]">
                      {item.name}
                    </span>
                    {item.phoneNumber && (
                      <span className="text-[10.5px] text-[#64748b] ml-1.5 font-mono">
                        ({item.phoneNumber})
                      </span>
                    )}
                  </div>
                  <span className="text-[9.5px] font-semibold px-1.5 py-0.2 rounded bg-[#e2e8f0] text-[#475569] shrink-0">
                    {item.barangay}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[9.5px] font-semibold px-1.5 py-0.2 rounded border uppercase ${
                      item.vehicleType === 'FOTON'
                        ? 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]'
                        : 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]'
                    }`}
                  >
                    {item.vehicleType}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveQueuedItem(item.id)}
                    className="p-1 text-[#94a3b8] hover:text-[#ef4444] transition-colors cursor-pointer"
                    title="Remove from queue"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-2 rounded-[6px] bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-[11.5px] flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 4. Action Button: "Add Delivery Customer(s) - [N]" */}
      <button
        type="button"
        disabled={queuedCustomers.length === 0 || isSubmitting}
        onClick={handleCommit}
        className={`w-full py-2.5 px-4 rounded-[6px] font-bold text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow ${
          queuedCustomers.length === 0 || isSubmitting
            ? 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed shadow-none'
            : 'bg-[#0f172a] hover:bg-[#1e293b] text-white'
        }`}
      >
        {isSubmitting ? (
          <span>Saving {queuedCustomers.length} Customers...</span>
        ) : (
          <>
            <CheckCircle2
              size={16}
              className={queuedCustomers.length > 0 ? 'text-[#38bdf8]' : 'text-[#94a3b8]'}
            />
            <span>Add Delivery Customer(s) - {queuedCustomers.length}</span>
          </>
        )}
      </button>
    </div>
  );
}
