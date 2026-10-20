import { relations } from 'drizzle-orm';
import { billingDocuments } from './billing-documents.schema.js';
import { containerLedgers } from './container-ledgers.schema.js';
import { containerPresets } from './container-presets.schema.js';
import { customerProfiles } from './customer-profiles.schema.js';
import { orders } from './orders.schema.js';
import { photoCountLogs } from './photo-count-logs.schema.js';
import { routeTrips } from './route-trips.schema.js';
import { stationBranches } from './station-branches.schema.js';
import { users } from './users.schema.js';

// 1. STATION_BRANCH Relations
export const stationBranchesRelations = relations(
  stationBranches,
  ({ many }) => ({
    users: many(users),
    containerPresets: many(containerPresets),
    orders: many(orders),
    routeTrips: many(routeTrips),
  }),
);

// 2. CONTAINER_PRESET Relations
export const containerPresetsRelations = relations(
  containerPresets,
  ({ one, many }) => ({
    branch: one(stationBranches, {
      fields: [containerPresets.branchId],
      references: [stationBranches.id],
    }),
    customerProfiles: many(customerProfiles),
    orders: many(orders),
  }),
);

// 3. USER Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  branch: one(stationBranches, {
    fields: [users.branchId],
    references: [stationBranches.id],
  }),
  customerProfile: one(customerProfiles, {
    fields: [users.id],
    references: [customerProfiles.userId],
  }),
  orders: many(orders),
  routeTrips: many(routeTrips),
  containerLedgers: many(containerLedgers),
}));

// 4. CUSTOMER_PROFILE Relations
export const customerProfilesRelations = relations(
  customerProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [customerProfiles.userId],
      references: [users.id],
    }),
    defaultPreset: one(containerPresets, {
      fields: [customerProfiles.defaultPresetId],
      references: [containerPresets.id],
    }),
  }),
);

// 5. ROUTE_TRIP Relations
export const routeTripsRelations = relations(routeTrips, ({ one, many }) => ({
  branch: one(stationBranches, {
    fields: [routeTrips.branchId],
    references: [stationBranches.id],
  }),
  rider: one(users, {
    fields: [routeTrips.riderId],
    references: [users.id],
  }),
  orders: many(orders),
}));

// 6. ORDER Relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  branch: one(stationBranches, {
    fields: [orders.branchId],
    references: [stationBranches.id],
  }),
  trip: one(routeTrips, {
    fields: [orders.tripId],
    references: [routeTrips.id],
  }),
  preset: one(containerPresets, {
    fields: [orders.presetId],
    references: [containerPresets.id],
  }),
  photoCountLog: one(photoCountLogs, {
    fields: [orders.id],
    references: [photoCountLogs.orderId],
  }),
  billingDocument: one(billingDocuments, {
    fields: [orders.id],
    references: [billingDocuments.orderId],
  }),
  containerLedgers: many(containerLedgers),
}));

// 7. PHOTO_COUNT_LOG Relations
export const photoCountLogsRelations = relations(photoCountLogs, ({ one }) => ({
  order: one(orders, {
    fields: [photoCountLogs.orderId],
    references: [orders.id],
  }),
}));

// 8. BILLING_DOCUMENT Relations
export const billingDocumentsRelations = relations(
  billingDocuments,
  ({ one }) => ({
    order: one(orders, {
      fields: [billingDocuments.orderId],
      references: [orders.id],
    }),
  }),
);

// 9. CONTAINER_LEDGER Relations
export const containerLedgersRelations = relations(
  containerLedgers,
  ({ one }) => ({
    customer: one(users, {
      fields: [containerLedgers.customerId],
      references: [users.id],
    }),
    order: one(orders, {
      fields: [containerLedgers.orderId],
      references: [orders.id],
    }),
  }),
);
