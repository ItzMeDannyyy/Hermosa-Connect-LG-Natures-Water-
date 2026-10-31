/**
 * ============================================================================
 * FILE: src/components/delivery/BarangayRosterList.tsx
 * PURPOSE: Displays delivery customers grouped and sorted by Barangay,
 *          with vehicle type rotation indicators (Foton vs Sidecar).
 *          Strict Lucide vector icons, zero Unicode emojis.
 * ============================================================================
 */

import {
  Bike,
  Filter,
  MapPin,
  Phone,
  Search,
  Trash2,
  Truck,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
  BarangayGroup,
  DeliveryCustomer,
  VehicleType,
} from '../../types/delivery.types';

interface BarangayRosterListProps {
  barangays: BarangayGroup[];
  allCustomers: DeliveryCustomer[];
  onToggleVehicle: (customerId: string, nextType: VehicleType) => Promise<void>;
  onDeleteCustomer: (customerId: string) => Promise<void>;
}

export function BarangayRosterList({
  barangays,
  allCustomers,
  onToggleVehicle,
  onDeleteCustomer,
}: BarangayRosterListProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vehicleFilter, setVehicleFilter] = useState<'ALL' | VehicleType>('ALL');

  /**
   * Filters customers based on search query and vehicle type
   */
  const filteredBarangays = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return barangays
      .map((group) => {
        const matchingCustomers = group.customers.filter((c) => {
          const matchVehicle =
            vehicleFilter === 'ALL' || c.vehicleType === vehicleFilter;
          const matchSearch =
            !q ||
            c.name.toLowerCase().includes(q) ||
            c.barangay.toLowerCase().includes(q) ||
            (c.phoneNumber && c.phoneNumber.includes(q));

          return matchVehicle && matchSearch;
        });

        return {
          ...group,
          customers: matchingCustomers,
          totalCustomers: matchingCustomers.length,
          fotonCount: matchingCustomers.filter((c) => c.vehicleType === 'FOTON').length,
          sidecarCount: matchingCustomers.filter((c) => c.vehicleType === 'SIDECAR').length,
        };
      })
      .filter((group) => group.customers.length > 0)
      .sort((a, b) => a.barangay.localeCompare(b.barangay));
  }, [barangays, searchQuery, vehicleFilter]);

  const totalVisibleCustomers = useMemo(
    () => filteredBarangays.reduce((acc, g) => acc + g.customers.length, 0),
    [filteredBarangays],
  );

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Controls: Search & Vehicle Filter */}
      <div className="space-y-2">
        {/* Search Input */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, address, or barangay..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#cbd5e1] rounded-[6px] text-[12px] text-[#0f172a] focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748b] flex items-center gap-1">
              <Filter size={11} /> Filter:
            </span>
            <button
              type="button"
              onClick={() => setVehicleFilter('ALL')}
              className={`px-2 py-0.5 rounded-[4px] font-semibold border cursor-pointer transition-colors ${
                vehicleFilter === 'ALL'
                  ? 'bg-[#0f172a] text-white border-[#0f172a]'
                  : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-[#f1f5f9]'
              }`}
            >
              All ({allCustomers.length})
            </button>
            <button
              type="button"
              onClick={() => setVehicleFilter('FOTON')}
              className={`px-2 py-0.5 rounded-[4px] font-semibold border flex items-center gap-1 cursor-pointer transition-colors ${
                vehicleFilter === 'FOTON'
                  ? 'bg-[#065f46] text-white border-[#065f46]'
                  : 'bg-white text-[#047857] border-[#a7f3d0] hover:bg-[#ecfdf5]'
              }`}
            >
              <Truck size={12} /> Foton
            </button>
            <button
              type="button"
              onClick={() => setVehicleFilter('SIDECAR')}
              className={`px-2 py-0.5 rounded-[4px] font-semibold border flex items-center gap-1 cursor-pointer transition-colors ${
                vehicleFilter === 'SIDECAR'
                  ? 'bg-[#1e40af] text-white border-[#1e40af]'
                  : 'bg-white text-[#1d4ed8] border-[#bfdbfe] hover:bg-[#eff6ff]'
              }`}
            >
              <Bike size={12} /> Sidecar
            </button>
          </div>

          <span className="text-[#64748b] font-medium">
            Showing {totalVisibleCustomers} of {allCustomers.length}
          </span>
        </div>
      </div>

      {/* Barangay Grouped List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredBarangays.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-[#94a3b8]">
            <Users size={32} className="opacity-40 mb-2" />
            <p className="text-[13px] font-medium text-[#475569]">
              No delivery customers found
            </p>
            <p className="text-[11px] text-[#94a3b8] mt-1">
              Add customers using the "Single Customer" tab or paste rows in "Bulk Import".
            </p>
          </div>
        ) : (
          filteredBarangays.map((group) => (
            <div
              key={group.barangay}
              className="bg-white border border-[#e2e8f0] rounded-[7px] overflow-hidden shadow-xs"
            >
              {/* Barangay Header */}
              <div className="bg-[#f8fafc] px-3 py-2 border-b border-[#e2e8f0] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#0284c7]" />
                  <span className="text-[12.5px] font-bold text-[#0f172a]">
                    Barangay {group.barangay}
                  </span>
                  <span className="text-[10.5px] font-semibold px-2 py-0.2 rounded-full bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
                    {group.totalCustomers} {group.totalCustomers === 1 ? 'person' : 'persons'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10.5px]">
                  {group.fotonCount > 0 && (
                    <span className="text-[#047857] bg-[#ecfdf5] px-1.5 py-0.2 rounded border border-[#a7f3d0] font-medium flex items-center gap-1">
                      <Truck size={10} /> {group.fotonCount} Foton
                    </span>
                  )}
                  {group.sidecarCount > 0 && (
                    <span className="text-[#1d4ed8] bg-[#eff6ff] px-1.5 py-0.2 rounded border border-[#bfdbfe] font-medium flex items-center gap-1">
                      <Bike size={10} /> {group.sidecarCount} Sidecar
                    </span>
                  )}
                </div>
              </div>

              {/* Customers inside Barangay */}
              <div className="divide-y divide-[#f1f5f9]">
                {group.customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-2.5 flex items-center justify-between gap-2 hover:bg-[#fafafa] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-[#0f172a] truncate">
                          {customer.name}
                        </span>
                        {customer.phoneNumber ? (
                          <span className="text-[10.5px] text-[#64748b] flex items-center gap-1 shrink-0 font-mono">
                            <Phone size={10} /> {customer.phoneNumber}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#94a3b8] italic">
                            No phone
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Vehicle Rotation Badge & Quick Switch */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          onToggleVehicle(
                            customer.id,
                            customer.vehicleType === 'FOTON' ? 'SIDECAR' : 'FOTON',
                          )
                        }
                        title={`Click to switch to ${
                          customer.vehicleType === 'FOTON' ? 'Sidecar' : 'Foton'
                        }`}
                        className={`text-[10px] font-semibold px-2 py-0.8 rounded-[4px] border flex items-center gap-1 cursor-pointer transition-transform hover:scale-102 ${
                          customer.vehicleType === 'FOTON'
                            ? 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0] hover:bg-[#d1fae5]'
                            : 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe] hover:bg-[#dbeafe]'
                        }`}
                      >
                        {customer.vehicleType === 'FOTON' ? (
                          <>
                            <Truck size={11} />
                            <span>Foton</span>
                          </>
                        ) : (
                          <>
                            <Bike size={11} />
                            <span>Sidecar</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteCustomer(customer.id)}
                        className="p-1 text-[#94a3b8] hover:text-[#ef4444] transition-colors cursor-pointer"
                        title="Remove from delivery roster"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
