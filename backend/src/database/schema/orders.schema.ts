import {
  boolean,
  date,
  integer,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { containerPresets } from './container-presets.schema.js';
import {
  orderStatusEnum,
  orderTypeEnum,
  scheduledTimeSlotEnum,
} from './enums.schema.js';
import { routeTrips } from './route-trips.schema.js';
import { stationBranches } from './station-branches.schema.js';
import { users } from './users.schema.js';

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  branchId: uuid('branch_id')
    .notNull()
    .references(() => stationBranches.id, { onDelete: 'restrict' }),
  tripId: uuid('trip_id').references(() => routeTrips.id, {
    onDelete: 'set null',
  }),
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
  stopSequenceNumber: integer('stop_sequence_number'),
  reminderSent: boolean('reminder_sent').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
