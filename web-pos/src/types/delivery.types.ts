/**
 * ============================================================================
 * FILE: src/types/delivery.types.ts
 * PURPOSE: Type definitions for Delivery Customers, Barangay routing,
 *          and Vehicle Rotation (Foton vs Sidecar).
 * ============================================================================
 */

export type VehicleType = 'FOTON' | 'SIDECAR';

export interface DeliveryCustomer {
  id: string;
  name: string;
  phoneNumber: string | null;
  barangay: string;
  deliveryAddress?: string;
  vehicleType: VehicleType;
  scheduledDeliveryTime?: string | null;
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BarangayGroup {
  barangay: string;
  totalCustomers: number;
  fotonCount: number;
  sidecarCount: number;
  customers: DeliveryCustomer[];
}

export interface DeliveryCustomersResponse {
  totalCustomers: number;
  fotonCount: number;
  sidecarCount: number;
  barangays: BarangayGroup[];
  allCustomers: DeliveryCustomer[];
}

export interface CreateDeliveryCustomerInput {
  name: string;
  phoneNumber?: string;
  barangay: string;
  deliveryAddress?: string;
  vehicleType?: VehicleType;
  scheduledDeliveryTime?: string;
  notes?: string;
}

export interface BulkCreateDeliveryCustomersInput {
  customers: Array<{
    name: string;
    phoneNumber?: string;
    barangay?: string;
    deliveryAddress?: string;
    vehicleType?: VehicleType;
    scheduledDeliveryTime?: string;
    notes?: string;
  }>;
  defaultVehicleType?: VehicleType;
  defaultBarangay?: string;
}

export const COMMON_BARANGAYS = [
  'Loyola Heights',
  'Pansol',
  'Matandang Balara',
  'Blue Ridge A',
  'Blue Ridge B',
  'Krus na Ligas',
  'San Vicente',
  'U.P. Campus',
  'Old Balara',
  'Teacher\'s Village',
] as const;
