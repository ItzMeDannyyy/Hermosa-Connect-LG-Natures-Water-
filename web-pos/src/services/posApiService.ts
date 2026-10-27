/**
 * ============================================================================
 * FILE: src/services/posApiService.ts
 * PURPOSE: Step-by-step API functions that connect the Station Counter Web POS
 *          directly to the NestJS Backend (http://localhost:3000/api/pos).
 *          Every action reads/writes real records in PostgreSQL.
 * ============================================================================
 */

import type {
  PaymentState,
  PosOrderItem,
  TimeSlotLabel,
} from '../types/pos.types';
import { getSavedAccessToken } from './authApiService';

const BASE_API_URL =
  import.meta.env.VITE_API_URL ?? 'http://10.231.84.70:3000/api';
const BACKEND_POS_BASE_URL = `${BASE_API_URL}/pos`;

export interface PosDashboardBackendResponse {
  orders: PosOrderItem[];
}

export interface CreateOrderBackendInput {
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  presetName: string;
  containerCount: number;
  emptyContainersToPickup: number;
  includeDeliveryFee: boolean;
  scheduledTimeSlot?: TimeSlotLabel;
  paymentState: PaymentState;
  subtotalAmount?: number;
  cashTendered?: number;
  partialAmountPaid?: number;
}

/**
 * Helper to convert the UI time slot label into the PostgreSQL enum value
 */
function convertUiSlotToDatabaseEnum(
  slotLabel: TimeSlotLabel,
): 'SLOT_8_10_AM' | 'SLOT_1_3_PM' | 'SLOT_4_6_PM' {
  if (slotLabel === '8:00 – 10:00 AM') {
    return 'SLOT_8_10_AM';
  }
  if (slotLabel === '4:00 – 6:00 PM') {
    return 'SLOT_4_6_PM';
  }
  return 'SLOT_1_3_PM';
}

/**
 * 1. Fetch Live Orders (#INV & #OR) from PostgreSQL
 *    Calls GET http://localhost:3000/api/pos/dashboard
 */
export async function fetchPosDashboardFromBackend(): Promise<PosDashboardBackendResponse> {
  const accessToken = getSavedAccessToken();

  const response = await fetch(`${BACKEND_POS_BASE_URL}/dashboard`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken ?? ''}`,
    },
    credentials: 'include',
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(
      responseData.message || 'Failed to load POS dashboard from PostgreSQL.',
    );
  }

  return responseData as PosDashboardBackendResponse;
}

/**
 * 2. Create a New POS Order + Billing Document (#INV or #OR) in PostgreSQL
 *    Calls POST http://localhost:3000/api/pos/orders
 */
export async function createPosOrderOnBackend(
  input: CreateOrderBackendInput,
): Promise<PosDashboardBackendResponse> {
  const accessToken = getSavedAccessToken();

  const payload = {
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    deliveryAddress: input.deliveryAddress,
    presetName: input.presetName,
    containerCount: input.containerCount,
    emptyContainersToPickup: input.emptyContainersToPickup,
    includeDeliveryFee: input.includeDeliveryFee,
    scheduledTimeSlot: input.scheduledTimeSlot
      ? convertUiSlotToDatabaseEnum(input.scheduledTimeSlot)
      : 'SLOT_1_3_PM',
    paymentState: input.paymentState,
    subtotalAmount: input.subtotalAmount,
    cashTendered: input.cashTendered,
    partialAmountPaid: input.partialAmountPaid,
  };

  const response = await fetch(`${BACKEND_POS_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken ?? ''}`,
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorMessage = Array.isArray(responseData.message)
      ? responseData.message.join(', ')
      : responseData.message || 'Failed to save order to PostgreSQL.';
    throw new Error(errorMessage);
  }

  return responseData as PosDashboardBackendResponse;
}

/**
 * 3. Convert a Pre-Dispatch Invoice (#INV) into an Official Receipt (#OR) in PostgreSQL
 *    Calls PATCH http://localhost:3000/api/pos/orders/:orderId/convert-to-receipt
 */
export async function convertInvoiceToReceiptOnBackend(
  orderId: string,
  selectedPaymentState: PaymentState,
): Promise<PosDashboardBackendResponse> {
  const accessToken = getSavedAccessToken();

  const response = await fetch(
    `${BACKEND_POS_BASE_URL}/orders/${orderId}/convert-to-receipt`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken ?? ''}`,
      },
      credentials: 'include',
      body: JSON.stringify({
        paymentState: selectedPaymentState,
      }),
    },
  );

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(
      responseData.message || 'Failed to convert Invoice to Official Receipt.',
    );
  }

  return responseData as PosDashboardBackendResponse;
}
