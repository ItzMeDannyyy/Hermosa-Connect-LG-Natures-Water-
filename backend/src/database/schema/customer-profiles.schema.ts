import {
  boolean,
  date,
  doublePrecision,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { containerPresets } from './container-presets.schema.js';
import { users } from './users.schema.js';

export const customerProfiles = pgTable('customer_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  defaultPresetId: uuid('default_preset_id').references(
    () => containerPresets.id,
    { onDelete: 'set null' },
  ),
  defaultOrderQty: integer('default_order_qty').default(1).notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  emptyContainersHeld: integer('empty_containers_held').default(0).notNull(),
  runningUnpaidBalance: numeric('running_unpaid_balance', {
    precision: 10,
    scale: 2,
  })
    .default('0.00')
    .notNull(),
  containersDueBackDate: date('containers_due_back_date'),
  pickupReminderSent: boolean('pickup_reminder_sent').default(false).notNull(),
  lastRemindedAt: timestamp('last_reminded_at'),
});

export type CustomerProfile = typeof customerProfiles.$inferSelect;
export type NewCustomerProfile = typeof customerProfiles.$inferInsert;
