import {
  doublePrecision,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const stationBranches = pgTable('station_branches', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  deliveryFee: numeric('delivery_fee', { precision: 10, scale: 2 })
    .default('30.00')
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type StationBranch = typeof stationBranches.$inferSelect;
export type NewStationBranch = typeof stationBranches.$inferInsert;
