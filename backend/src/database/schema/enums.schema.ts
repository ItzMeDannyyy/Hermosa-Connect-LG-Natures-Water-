import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'CUSTOMER',
  'RIDER',
  'OPERATOR',
]);

export const routeTripStatusEnum = pgEnum('route_trip_status', [
  'PLANNED',
  'IN_PROGRESS',
  'COMPLETED',
]);

export const orderTypeEnum = pgEnum('order_type', [
  'REFILL_DELIVERY',
  'CONTAINER_PICKUP',
  'BOTH',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'PENDING',
  'INVOICED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
]);

export const scheduledTimeSlotEnum = pgEnum('scheduled_time_slot', [
  'SLOT_8_10_AM',
  'SLOT_1_3_PM',
  'SLOT_4_6_PM',
]);

export const capturedStageEnum = pgEnum('captured_stage', [
  'PRE_DISPATCH_STATION',
  'DOORSTEP_DELIVERY',
]);

export const documentStageEnum = pgEnum('document_stage', [
  'INVOICE_ONLY',
  'OFFICIAL_RECEIPT',
]);

export const paymentStateEnum = pgEnum('payment_state', [
  'PAID_CASH',
  'E_PAYMENT',
  'PARTIAL',
  'UNPAID_CHARGE_SLIP',
]);
