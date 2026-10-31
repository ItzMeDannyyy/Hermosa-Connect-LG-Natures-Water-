/**
 * ============================================================================
 * FILE: src/services/deliveryApiService.ts
 * PURPOSE: API client for managing Delivery Customers, Barangay routing,
 *          and Vehicle Rotation (Foton vs Sidecar).
 * ============================================================================
 */

import type {
  BulkCreateDeliveryCustomersInput,
  CreateDeliveryCustomerInput,
  DeliveryCustomer,
  DeliveryCustomersResponse,
  VehicleType,
} from '../types/delivery.types';
import { getSavedAccessToken } from './authApiService';

const BASE_API_URL =
  import.meta.env.VITE_API_URL ??
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : 'http://10.231.84.70:3000/api');

const BACKEND_DELIVERY_URL = `${BASE_API_URL}/pos/delivery-customers`;
const LOCAL_STORAGE_KEY = 'lg_natures_water_delivery_roster';

function getLocalRoster(): DeliveryCustomer[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRoster(items: DeliveryCustomer[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore local storage errors
  }
}

function groupCustomersByBarangay(
  customers: DeliveryCustomer[],
): DeliveryCustomersResponse {
  // Sort alphabetically by barangay, then name
  const sorted = [...customers].sort((a, b) => {
    const bComp = a.barangay.localeCompare(b.barangay);
    if (bComp !== 0) return bComp;
    return a.name.localeCompare(b.name);
  });

  const barangayMap = new Map<string, DeliveryCustomer[]>();
  let fotonCount = 0;
  let sidecarCount = 0;

  for (const c of sorted) {
    if (c.vehicleType === 'FOTON') {
      fotonCount += 1;
    } else {
      sidecarCount += 1;
    }
    const list = barangayMap.get(c.barangay) ?? [];
    list.push(c);
    barangayMap.set(c.barangay, list);
  }

  const barangays = Array.from(barangayMap.entries()).map(
    ([bName, items]) => ({
      barangay: bName,
      totalCustomers: items.length,
      fotonCount: items.filter((x) => x.vehicleType === 'FOTON').length,
      sidecarCount: items.filter((x) => x.vehicleType === 'SIDECAR').length,
      customers: items,
    }),
  );

  return {
    totalCustomers: sorted.length,
    fotonCount,
    sidecarCount,
    barangays,
    allCustomers: sorted,
  };
}

/**
 * 1. Fetch Delivery Customers from PostgreSQL
 */
export async function fetchDeliveryCustomersFromBackend(): Promise<DeliveryCustomersResponse> {
  const token = getSavedAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(BACKEND_DELIVERY_URL, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch delivery customers: HTTP ${response.status}`);
    }

    const data: DeliveryCustomersResponse = await response.json();
    saveLocalRoster(data.allCustomers);
    return data;
  } catch (err) {
    console.warn('Backend delivery roster offline, using local cache:', err);
    return groupCustomersByBarangay(getLocalRoster());
  }
}

/**
 * 2. Create Single Delivery Customer
 */
export async function createDeliveryCustomerOnBackend(
  input: CreateDeliveryCustomerInput,
): Promise<DeliveryCustomer> {
  const token = getSavedAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(BACKEND_DELIVERY_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to add customer: HTTP ${response.status}`);
    }

    const res = await response.json();
    const created: DeliveryCustomer = res.customer;

    // update local cache
    const current = getLocalRoster();
    saveLocalRoster([...current, created]);

    return created;
  } catch (err) {
    // offline fallback
    const fallbackCustomer: DeliveryCustomer = {
      id: `local-cust-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: input.name.trim(),
      phoneNumber: input.phoneNumber?.trim() || null,
      barangay: input.barangay.trim(),
      deliveryAddress: input.deliveryAddress?.trim() || '',
      vehicleType: input.vehicleType ?? 'FOTON',
      scheduledDeliveryTime: input.scheduledDeliveryTime?.trim() || null,
      notes: input.notes?.trim() || null,
      createdAt: new Date().toISOString(),
    };
    const current = getLocalRoster();
    saveLocalRoster([...current, fallbackCustomer]);
    return fallbackCustomer;
  }
}

/**
 * 3. Bulk Create Delivery Customers from Spreadsheet
 */
export async function bulkCreateDeliveryCustomersOnBackend(
  input: BulkCreateDeliveryCustomersInput,
): Promise<{ insertedCount: number; customers: DeliveryCustomer[] }> {
  const token = getSavedAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BACKEND_DELIVERY_URL}/bulk`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to bulk import: HTTP ${response.status}`);
    }

    const res = await response.json();
    const inserted: DeliveryCustomer[] = res.customers ?? [];

    const current = getLocalRoster();
    saveLocalRoster([...current, ...inserted]);

    return {
      insertedCount: inserted.length,
      customers: inserted,
    };
  } catch (err) {
    // offline fallback
    const fallbackCustomers: DeliveryCustomer[] = input.customers.map((c, i) => ({
      id: `local-bulk-${Date.now()}-${i}`,
      name: c.name.trim(),
      phoneNumber: c.phoneNumber?.trim() || null,
      barangay: (c.barangay || input.defaultBarangay || 'Station Area').trim(),
      deliveryAddress: c.deliveryAddress?.trim() || '',
      vehicleType: c.vehicleType || input.defaultVehicleType || 'FOTON',
      scheduledDeliveryTime: c.scheduledDeliveryTime?.trim() || null,
      notes: c.notes?.trim() || null,
      createdAt: new Date().toISOString(),
    }));

    const current = getLocalRoster();
    saveLocalRoster([...current, ...fallbackCustomers]);

    return {
      insertedCount: fallbackCustomers.length,
      customers: fallbackCustomers,
    };
  }
}

/**
 * 4. Update Customer Vehicle or Details
 */
export async function updateDeliveryCustomerOnBackend(
  id: string,
  input: Partial<CreateDeliveryCustomerInput>,
): Promise<DeliveryCustomer> {
  const token = getSavedAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BACKEND_DELIVERY_URL}/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Failed to update customer: HTTP ${response.status}`);
    }

    const res = await response.json();
    const updated: DeliveryCustomer = res.customer;

    const current = getLocalRoster();
    const next = current.map((c) => (c.id === id ? updated : c));
    saveLocalRoster(next);

    return updated;
  } catch {
    const current = getLocalRoster();
    let updatedCustomer: DeliveryCustomer | null = null;
    const next = current.map((c) => {
      if (c.id === id) {
        updatedCustomer = {
          ...c,
          ...input,
          vehicleType: (input.vehicleType ?? c.vehicleType) as VehicleType,
        };
        return updatedCustomer;
      }
      return c;
    });
    saveLocalRoster(next);
    return updatedCustomer!;
  }
}

/**
 * 5. Delete Delivery Customer
 */
export async function deleteDeliveryCustomerOnBackend(id: string): Promise<void> {
  const token = getSavedAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    await fetch(`${BACKEND_DELIVERY_URL}/${id}`, {
      method: 'DELETE',
      headers,
    });
  } catch {
    // local fallback
  }

  const current = getLocalRoster();
  saveLocalRoster(current.filter((c) => c.id !== id));
}
