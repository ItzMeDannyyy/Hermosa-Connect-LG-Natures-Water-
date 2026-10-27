import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { containerPresets } from './container-presets.schema.js';
import {
  orderStatusEnum,
  orderTypeEnum,
  scheduledTimeSlotEnum,
} from './enums.schema.js';
import { stationBranches } from './station-branches.schema.js';

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone'),
  deliveryAddress: text('delivery_address'),
  branchId: uuid('branch_id')
    .notNull()
    .references(() => stationBranches.id, { onDelete: 'restrict' }),
  presetId: uuid('preset_id').references(() => containerPresets.id, {
    onDelete: 'set null',
  }),
  orderType: orderTypeEnum('order_type').default('REFILL_DELIVERY').notNull(),
  status: orderStatusEnum('status').default('PENDING').notNull(),
  requestedQty: integer('requested_qty').default(0).notNull(),
  verifiedCount: integer('verified_count'),
  emptyContainersToPickup: integer('empty_containers_to_pickup')
    .default(0)
    .notNull(),
  scheduledPickupDate: date('scheduled_pickup_date'),
  scheduledTimeSlot: scheduledTimeSlotEnum('scheduled_time_slot'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
