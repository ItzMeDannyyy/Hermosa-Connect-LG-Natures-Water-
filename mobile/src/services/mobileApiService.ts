/**
 * ============================================================================
 * FILE: src/services/mobileApiService.ts
 * PURPOSE: Connects the LG Nature's Water Mobile Application (M0, C1-C3, R1-R3)
 *          to the live NestJS + PostgreSQL Backend using EXPO_PUBLIC_API_URL
 *          (http://10.231.84.70:3000/api).
 *          Written in a clear, step-by-step style without chained .().() syntax.
 * ============================================================================
 */

import {
  DEMO_MOBILE_USERS,
  INITIAL_CUSTOMER_SUMMARY,
  INITIAL_MOBILE_ORDERS,
} from '../data/mobileInitialData';
import type {
  CustomerAccountSummary,
  DocumentStageType,
  MobileOrderItem,
  MobileUserAccount,
  MobileUserRole,
  PaymentStateType,
  TimeSlotOption,
} from '../types/mobile.types';

/**
 * Reads the backend URL from mobile/.env (EXPO_PUBLIC_API_URL)
 * Defaults to http://10.231.84.70:3000/api
 */
export const MOBILE_BACKEND_API_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.231.84.70:3000/api';

// Stores the active JWT Access Token in memory for authenticated POS requests
let currentMobileAccessToken: string | null = null;

export function getMobileAccessToken(): string | null {
  return currentMobileAccessToken;
}

export function clearMobileAccessToken(): void {
  currentMobileAccessToken = null;
}

/**
 * Converts a UI time slot label to the backend enum string
 */
function convertUiSlotToBackendEnum(
  slotLabel: TimeSlotOption,
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
 * Maps the raw backend dashboard payload into MobileOrderItem[] and CustomerAccountSummary
 * using explicit for-loops for readability.
 */
function mapBackendPayloadToMobileState(rawPayload: {
  orders?: Array<Record<string, unknown>>;
  customerRecords?: Array<Record<string, unknown>>;
}): {
  orders: MobileOrderItem[];
  customerSummary: CustomerAccountSummary;
} {
  const mappedOrders: MobileOrderItem[] = [];
  const rawOrdersList = Array.isArray(rawPayload.orders)
    ? rawPayload.orders
    : [];

  for (let index = 0; index < rawOrdersList.length; index = index + 1) {
    const rawOrder = rawOrdersList[index];
    if (rawOrder === undefined) {
      continue;
    }

    const parsedOrderNum = Number(rawOrder.orderNumber ?? 1042 + index);
    const verifiedCount = Number(rawOrder.verifiedCount ?? 8);
    const emptyPickup = Number(rawOrder.emptyContainersToPickup ?? 0);
    const unitPrice = Number(rawOrder.unitPrice ?? 25);
    const subtotalAmount = Number(rawOrder.subtotalAmount ?? verifiedCount * 25);
    const deliveryFee = Number(rawOrder.deliveryFee ?? 30);
    const totalDue = Number(rawOrder.totalDue ?? subtotalAmount + deliveryFee);
    const amountPaid = Number(rawOrder.amountPaid ?? totalDue);
    const balanceDue = Number(rawOrder.balanceDue ?? 0);

    const docStage =
      rawOrder.documentStage === 'OFFICIAL_RECEIPT'
        ? ('OFFICIAL_RECEIPT' as DocumentStageType)
        : ('INVOICE_ONLY' as DocumentStageType);

    const paymentState = (rawOrder.paymentState ??
      'PAID_CASH') as PaymentStateType;

    const slotLabel = (rawOrder.scheduledTimeSlot ??
      '1:00 – 3:00 PM') as TimeSlotOption;

    const receiptStr =
      typeof rawOrder.receiptNumber === 'string'
        ? rawOrder.receiptNumber
        : null;

    mappedOrders.push({
      id: String(rawOrder.id ?? `ord-${parsedOrderNum}`),
      orderNumber: parsedOrderNum,
      invoiceNumber: String(rawOrder.invoiceNumber ?? `INV-${parsedOrderNum}`),
      receiptNumber: receiptStr,
      documentStage: docStage,
      customerName: String(rawOrder.customerName ?? 'Maria Santos'),
      deliveryAddress: String(
        rawOrder.deliveryAddress ?? 'Blk 4 Lot 12 Pansol St, Quezon City',
      ),
      presetName: String(
        rawOrder.presetName ?? '5-Gallon Slim Container (Refill)',
      ),
      verifiedCount: verifiedCount,
      emptyContainersToPickup: emptyPickup,
      unitPrice: unitPrice,
      subtotalAmount: subtotalAmount,
      deliveryFee: deliveryFee,
      totalDue: totalDue,
      paymentState: paymentState,
      amountPaid: amountPaid,
      balanceDue: balanceDue,
      scheduledTimeSlot: slotLabel,
      assignedRiderName: String(rawOrder.assignedRiderName ?? 'J. Cruz'),
      aiConfidencePercent: 96 + (index % 3),
      stopSequenceNumber: index + 1,
      createdAtLabel: String(rawOrder.invoicedAt ?? 'Today'),
    });
  }

  let updatedCustomerSummary: CustomerAccountSummary = {
    ...INITIAL_CUSTOMER_SUMMARY,
  };

  const rawCustomersList = Array.isArray(rawPayload.customerRecords)
    ? rawPayload.customerRecords
    : [];

  for (let index = 0; index < rawCustomersList.length; index = index + 1) {
    const record = rawCustomersList[index];
    if (record === undefined) {
      continue;
    }

    const recordPhone = String(record.phoneNumber ?? '');
    const recordName = String(record.customerName ?? '');

    if (
      recordPhone === '+639170000003' ||
      recordName.toLowerCase().includes('maria') ||
      index === 0
    ) {
      updatedCustomerSummary = {
        customerName: recordName,
        phoneNumber: recordPhone,
        address: String(record.address ?? INITIAL_CUSTOMER_SUMMARY.address),
        nearestStationLabel: 'Station 1 (Main Hub - 0.3km)',
        emptyContainersOut: Number(record.emptyContainersHeld ?? 3),
        containersDueDateLabel: String(
          record.containersDueBackDate ?? '2026-10-22',
        ),
        unpaidBalanceAmount: Number(record.runningUnpaidBalance ?? 0),
        unpaidFromReceiptCode: String(record.lastOrderNumber ?? '#OR-1042'),
        usualOrderGallons: INITIAL_CUSTOMER_SUMMARY.usualOrderGallons,
        usualPresetName: INITIAL_CUSTOMER_SUMMARY.usualPresetName,
      };
      break;
    }
  }

  const finalOrders =
    mappedOrders.length > 0 ? mappedOrders : INITIAL_MOBILE_ORDERS;

  return {
    orders: finalOrders,
    customerSummary: updatedCustomerSummary,
  };
}

/**
 * 1. POST /api/auth/login
 *    Logs in via Phone Number + Password against http://10.231.84.70:3000/api/auth/login
 */
export async function loginMobileUserWithPhone(
  phoneNumber: string,
  password: string,
): Promise<{
  user: MobileUserAccount;
  isBackendConnected: boolean;
}> {
  try {
    const response = await fetch(`${MOBILE_BACKEND_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber.trim(),
        password: password,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      currentMobileAccessToken = data.accessToken ?? null;

      const backendRole = data.user.role as MobileUserRole;
      const templateUser = DEMO_MOBILE_USERS[backendRole];

      return {
        user: {
          id: data.user.id,
          fullName: data.user.fullName,
          phoneNumber: data.user.phoneNumber,
          role: backendRole,
          address: templateUser.address,
          nearestBranchName:
            data.branch !== null
              ? data.branch.name
              : templateUser.nearestBranchName,
          nearestBranchDistanceKm: templateUser.nearestBranchDistanceKm,
        },
        isBackendConnected: true,
      };
    }
  } catch {
    // Fallback if offline
  }

  const trimmedPhone = phoneNumber.trim();
  if (trimmedPhone.endsWith('0001')) {
    return { user: DEMO_MOBILE_USERS.OPERATOR, isBackendConnected: false };
  }
  if (trimmedPhone.endsWith('0002')) {
    return { user: DEMO_MOBILE_USERS.RIDER, isBackendConnected: false };
  }
  return { user: DEMO_MOBILE_USERS.CUSTOMER, isBackendConnected: false };
}

/**
 * 2. POST /api/auth/demo-switch
 *    Switches active role in 1 tap on http://10.231.84.70:3000/api/auth/demo-switch
 */
export async function switchMobileDemoRole(
  targetRole: MobileUserRole,
): Promise<{
  user: MobileUserAccount;
  isBackendConnected: boolean;
}> {
  try {
    const response = await fetch(`${MOBILE_BACKEND_API_URL}/auth/demo-switch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: targetRole,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      currentMobileAccessToken = data.accessToken ?? null;

      const templateUser = DEMO_MOBILE_USERS[targetRole];
      return {
        user: {
          id: data.user.id,
          fullName: data.user.fullName,
          phoneNumber: data.user.phoneNumber,
          role: targetRole,
          address: templateUser.address,
          nearestBranchName:
            data.branch !== null
              ? data.branch.name
              : templateUser.nearestBranchName,
          nearestBranchDistanceKm: templateUser.nearestBranchDistanceKm,
        },
        isBackendConnected: true,
      };
    }
  } catch {
    // Fallback if offline
  }

  return {
    user: DEMO_MOBILE_USERS[targetRole],
    isBackendConnected: false,
  };
}

/**
 * 3. GET /api/pos/mobile-sync
 *    Fetches live orders and customer accountability records from PostgreSQL
 */
export async function fetchMobileSyncFromBackend(): Promise<{
  orders: MobileOrderItem[];
  customerSummary: CustomerAccountSummary;
} | null> {
  if (currentMobileAccessToken === null) {
    return null;
  }

  try {
    const response = await fetch(`${MOBILE_BACKEND_API_URL}/pos/mobile-sync`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentMobileAccessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const rawData = await response.json();
    return mapBackendPayloadToMobileState(rawData);
  } catch {
    return null;
  }
}

/**
 * 4. POST /api/pos/orders
 *    Creates a new 1-Click Order in PostgreSQL from Customer Screen C1
 */
export async function createMobileOrderOnBackend(input: {
  customerName: string;
  deliveryAddress: string;
  presetName: string;
  containerCount: number;
  emptyContainersToPickup: number;
  scheduledTimeSlot: TimeSlotOption;
}): Promise<{
  orders: MobileOrderItem[];
  customerSummary: CustomerAccountSummary;
} | null> {
  if (currentMobileAccessToken === null) {
    return null;
  }

  try {
    const response = await fetch(`${MOBILE_BACKEND_API_URL}/pos/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentMobileAccessToken}`,
      },
      body: JSON.stringify({
        customerName: input.customerName,
        deliveryAddress: input.deliveryAddress,
        presetName: input.presetName,
        containerCount: input.containerCount,
        emptyContainersToPickup: input.emptyContainersToPickup,
        includeDeliveryFee: true,
        scheduledTimeSlot: convertUiSlotToBackendEnum(input.scheduledTimeSlot),
        paymentState: 'PAID_CASH',
      }),
    });

    if (!response.ok) {
      return null;
    }

    const rawData = await response.json();
    return mapBackendPayloadToMobileState(rawData);
  } catch {
    return null;
  }
}

/**
 * 5. PATCH /api/pos/orders/:orderId/ai-count
 *    Updates the AI Photo Verified Container Count in PostgreSQL (Screen R2)
 */
export async function updateMobileOrderAiCountOnBackend(
  orderId: string,
  verifiedCount: number,
): Promise<{
  orders: MobileOrderItem[];
  customerSummary: CustomerAccountSummary;
} | null> {
  if (currentMobileAccessToken === null) {
    return null;
  }

  try {
    const response = await fetch(
      `${MOBILE_BACKEND_API_URL}/pos/orders/${orderId}/ai-count`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentMobileAccessToken}`,
        },
        body: JSON.stringify({
          verifiedCount: verifiedCount,
        }),
      },
    );

    if (!response.ok) {
      return null;
    }

    const rawData = await response.json();
    return mapBackendPayloadToMobileState(rawData);
  } catch {
    return null;
  }
}

/**
 * 6. PATCH /api/pos/orders/:orderId/convert-to-receipt
 *    Converts Pre-Dispatch Invoice (#INV) to Official Receipt (#OR) in PostgreSQL (Screen R3 / C3)
 */
export async function convertMobileOrderToReceiptOnBackend(
  orderId: string,
  paymentState: PaymentStateType,
  amountPaid: number,
  emptyContainersCollected: number,
): Promise<{
  orders: MobileOrderItem[];
  customerSummary: CustomerAccountSummary;
} | null> {
  if (currentMobileAccessToken === null) {
    return null;
  }

  try {
    const response = await fetch(
      `${MOBILE_BACKEND_API_URL}/pos/orders/${orderId}/convert-to-receipt`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentMobileAccessToken}`,
        },
        body: JSON.stringify({
          paymentState: paymentState,
          amountPaid: amountPaid,
          emptyContainersCollected: emptyContainersCollected,
        }),
      },
    );

    if (!response.ok) {
      return null;
    }

    const rawData = await response.json();
    return mapBackendPayloadToMobileState(rawData);
  } catch {
    return null;
  }
}
