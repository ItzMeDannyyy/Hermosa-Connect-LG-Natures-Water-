/**
 * ============================================================================
 * FILE: src/components/delivery/VehicleTypeCapsuleToggle.tsx
 * PURPOSE: Tactile capsule sliding toggle between Foton Truck & Motorcycle Sidecar
 *          rotation according to tasteskill v2 framed-sheet principles.
 *          Strict Lucide vector icons, zero Unicode emojis.
 * ============================================================================
 */

import { Bike, Truck } from 'lucide-react';
import type { VehicleType } from '../../types/delivery.types';

interface VehicleTypeCapsuleToggleProps {
  value: VehicleType;
  onChange: (type: VehicleType) => void;
  label?: string;
  sublabel?: string;
}

export function VehicleTypeCapsuleToggle({
  value,
  onChange,
  label = 'Vehicle Rotation Assignment',
  sublabel = 'Select active delivery rotation for this barangay or customers',
}: VehicleTypeCapsuleToggleProps) {
  return (
    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-2.5">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-[12px] font-semibold text-[#0f172a] block">
            {label}
          </span>
          {sublabel && (
            <span className="text-[11px] text-[#64748b] block mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
        <span
          className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-[4px] border ${
            value === 'FOTON'
              ? 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]'
              : 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]'
          }`}
        >
          {value === 'FOTON' ? 'Foton Fleet' : 'Sidecar Fleet'}
        </span>
      </div>

      {/* Capsule Sliding Rail */}
      <div className="relative bg-[#e2e8f0] p-1 rounded-full flex items-center select-none shadow-inner">
        {/* Sliding Pill Indicator */}
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-transform duration-200 ease-out shadow-sm ${
            value === 'FOTON'
              ? 'translate-x-0 bg-gradient-to-r from-[#065f46] to-[#047857]'
              : 'translate-x-[calc(100%+8px)] bg-gradient-to-r from-[#1e40af] to-[#2563eb]'
          }`}
        />

        {/* Option 1: Foton */}
        <button
          type="button"
          onClick={() => onChange('FOTON')}
          className={`relative z-10 flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-2 text-[13px] font-semibold cursor-pointer transition-colors ${
            value === 'FOTON' ? 'text-white' : 'text-[#475569] hover:text-[#0f172a]'
          }`}
          aria-pressed={value === 'FOTON'}
        >
          <Truck size={16} strokeWidth={2.2} />
          <span>Foton</span>
          <span
            className={`text-[10px] font-medium px-1.5 py-0.2 rounded-full ${
              value === 'FOTON'
                ? 'bg-[#ffffff26] text-white'
                : 'bg-[#cbd5e1] text-[#475569]'
            }`}
          >
            Truck
          </span>
        </button>

        {/* Option 2: Sidecar */}
        <button
          type="button"
          onClick={() => onChange('SIDECAR')}
          className={`relative z-10 flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-2 text-[13px] font-semibold cursor-pointer transition-colors ${
            value === 'SIDECAR' ? 'text-white' : 'text-[#475569] hover:text-[#0f172a]'
          }`}
          aria-pressed={value === 'SIDECAR'}
        >
          <Bike size={16} strokeWidth={2.2} />
          <span>Sidecar</span>
          <span
            className={`text-[10px] font-medium px-1.5 py-0.2 rounded-full ${
              value === 'SIDECAR'
                ? 'bg-[#ffffff26] text-white'
                : 'bg-[#cbd5e1] text-[#475569]'
            }`}
          >
            Motorcycle
          </span>
        </button>
      </div>
    </div>
  );
}
