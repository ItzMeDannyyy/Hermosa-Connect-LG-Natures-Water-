/**
 * ============================================================================
 * FILE: src/components/delivery/SingleCustomerForm.tsx
 * PURPOSE: Single delivery customer entry form with customer name, barangay,
 *          optional phone number, and vehicle rotation tagging.
 *          Strict Lucide vector icons, zero Unicode emojis.
 * ============================================================================
 */

import {
  AlertCircle,
  MapPin,
  Phone,
  Plus,
  User,
} from 'lucide-react';
import { useState } from 'react';
import {
  COMMON_BARANGAYS,
  type CreateDeliveryCustomerInput,
  type VehicleType,
} from '../../types/delivery.types';

interface SingleCustomerFormProps {
  currentVehicle: VehicleType;
  defaultBarangay: string;
  onAddCustomer: (input: CreateDeliveryCustomerInput) => Promise<void>;
  onSuccess: () => void;
}

export function SingleCustomerForm({
  currentVehicle,
  defaultBarangay,
  onAddCustomer,
  onSuccess,
}: SingleCustomerFormProps) {
  const [name, setName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [barangay, setBarangay] = useState<string>(defaultBarangay || 'Loyola Heights');
  const [customBarangay, setCustomBarangay] = useState<string>('');
  const [isCustomBarangay, setIsCustomBarangay] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const selectedBarangay = isCustomBarangay
      ? customBarangay.trim()
      : barangay.trim();

    if (!name.trim()) {
      setErrorMessage('Please enter the customer name.');
      return;
    }
    if (!selectedBarangay) {
      setErrorMessage('Please specify the Barangay.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onAddCustomer({
        name: name.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        barangay: selectedBarangay,
        vehicleType: currentVehicle,
        notes: notes.trim() || undefined,
      });

      // Clear form
      setName('');
      setPhoneNumber('');
      setNotes('');
      onSuccess();
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to add delivery customer.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-3.5">
      {/* Customer Full Name */}
      <div>
        <label className="text-[11.5px] font-semibold text-[#334155] block mb-1">
          Customer Full Name <span className="text-[#ef4444]">*</span>
        </label>
        <div className="relative">
          <User
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
          />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Maria Santos or Katipunan Cafe"
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#cbd5e1] rounded-[6px] text-[12px] text-[#0f172a] focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
          />
        </div>
      </div>

      {/* Barangay Selection */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11.5px] font-semibold text-[#334155] block">
            Barangay <span className="text-[#ef4444]">*</span>
          </label>
          <button
            type="button"
            onClick={() => setIsCustomBarangay(!isCustomBarangay)}
            className="text-[11px] text-[#0284c7] hover:underline cursor-pointer"
          >
            {isCustomBarangay ? 'Choose from Common List' : '+ Enter Other Barangay'}
          </button>
        </div>

        {isCustomBarangay ? (
          <div className="relative">
            <MapPin
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
            />
            <input
              type="text"
              required
              value={customBarangay}
              onChange={(e) => setCustomBarangay(e.target.value)}
              placeholder="Type specific Barangay name..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#cbd5e1] rounded-[6px] text-[12px] text-[#0f172a] focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
            />
          </div>
        ) : (
          <select
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-[#cbd5e1] rounded-[6px] text-[12px] text-[#0f172a] focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
          >
            {COMMON_BARANGAYS.map((b) => (
              <option key={b} value={b}>
                Barangay {b}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Optional Contact Phone Number */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11.5px] font-semibold text-[#334155] block">
            Phone Number <span className="text-[#94a3b8] font-normal">(Optional)</span>
          </label>
          <span className="text-[10px] text-[#94a3b8]">PH Mobile or Landline</span>
        </div>
        <div className="relative">
          <Phone
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
          />
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+639171234567 or 09171234567"
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#cbd5e1] rounded-[6px] text-[12px] text-[#0f172a] focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
          />
        </div>
      </div>

      {/* Delivery Notes / Gallon Preference (Optional) */}
      <div>
        <label className="text-[11.5px] font-semibold text-[#334155] block mb-1">
          Gallon Preference / Notes <span className="text-[#94a3b8] font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. 5-Gallon Slim refill preference, morning drop-off"
          className="w-full px-3 py-1.5 bg-white border border-[#cbd5e1] rounded-[6px] text-[12px] text-[#0f172a] focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
        />
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-[6px] bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-[11.5px] flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-[6px] bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
        >
          {isSubmitting ? (
            <span>Adding Customer...</span>
          ) : (
            <>
              <Plus size={16} />
              <span>Register Delivery Customer</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
