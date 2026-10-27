/**
 * ============================================================================
 * FILE: src/types/mobile.types.ts
 * PURPOSE: Type definitions for the LG Nature's Water Mobile Application
 *          (Customer View, Delivery Rider View, and Shared Auth M0).
 * ============================================================================
 */

export type MobileUserRole = 'CUSTOMER' | 'RIDER' | 'OPERATOR';

export type CustomerTabName = 'HOME' | 'PICKUP' | 'RECEIPTS';

export type RiderTabName = 'ROUTE' | 'AI_COUNT' | 'DOORSTEP_OR';

export type PaymentStateType =
  | 'PAID_CASH'
  | 'E_PAYMENT'
  | 'PARTIAL'
  | 'UNPAID_CHARGE_SLIP';

export type DocumentStageType = 'INVOICE_ONLY' | 'OFFICIAL_RECEIPT';

export type TimeSlotOption =
  | '8:00 – 10:00 AM'
  | '1:00 – 3:00 PM'
  | '4:00 – 6:00 PM';

export interface MobileUserAccount {
  id: string;
  fullName: string;
  phoneNumber: string;
  role: MobileUserRole;
  address: string;
  nearestBranchName: string;
  nearestBranchDistanceKm: number;
}

export interface MobileOrderItem {
  id: string;
  orderNumber: number;
  invoiceNumber: string;
  receiptNumber: string | null;
  documentStage: DocumentStageType;
  customerName: string;
  deliveryAddress: string;
  presetName: string;
  verifiedCount: number;
  emptyContainersToPickup: number;
  unitPrice: number;
  subtotalAmount: number;
  deliveryFee: number;
  totalDue: number;
  paymentState: PaymentStateType;
  amountPaid: number;
  balanceDue: number;
  scheduledTimeSlot: TimeSlotOption;
  assignedRiderName: string;
  aiConfidencePercent: number;
  stopSequenceNumber: number;
  createdAtLabel: string;
  latitude?: number;
  longitude?: number;
  etaMinutes?: number;
  distanceKm?: number;
}

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface RouteWaypoint extends MapCoordinate {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  type: 'STATION_HUB' | 'DELIVERY_STOP';
  sequenceNumber: number;
  orderId?: string;
  isDelivered?: boolean;
}

export interface RouteManeuver {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  streetName: string;
  type: string;
  modifier?: string;
}

export interface RouteLeg {
  fromWaypointId: string;
  toWaypointId: string;
  distanceMeters: number;
  durationSeconds: number;
  summary: string;
  coordinates: MapCoordinate[];
  maneuvers: RouteManeuver[];
}

export interface OptimizedRouteData {
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  fullCoordinates: MapCoordinate[];
  legs: RouteLeg[];
  allManeuvers: RouteManeuver[];
  waypoints: RouteWaypoint[];
}

export interface CustomerAccountSummary {
  customerName: string;
  phoneNumber: string;
  address: string;
  nearestStationLabel: string;
  emptyContainersOut: number;
  containersDueDateLabel: string;
  unpaidBalanceAmount: number;
  unpaidFromReceiptCode: string;
  usualOrderGallons: number;
  usualPresetName: string;
}

export interface PickupScheduleFormState {
  selectedDayCode: string;
  selectedDayLabel: string;
  selectedTimeSlot: TimeSlotOption;
  containersToReturn: number;
  reminderEnabled: boolean;
}
