import { relations } from 'drizzle-orm';
import { billingDocuments } from './billing-documents.schema.js';
import { containerPresets } from './container-presets.schema.js';
import { orders } from './orders.schema.js';
import { photoCountLogs } from './photo-count-logs.schema.js';
import { stationBranches } from './station-branches.schema.js';
import { users } from './users.schema.js';

// 1. STATION_BRANCH Relations
export const stationBranchesRelations = relations(
  stationBranches,
  ({ many }) => ({
    users: many(users),
    containerPresets: many(containerPresets),
    orders: many(orders),
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
    orders: many(orders),
  }),
);

// 3. USER Relations (Staff only: OPERATOR and RIDER)
export const usersRelations = relations(users, ({ one }) => ({
  branch: one(stationBranches, {
    fields: [users.branchId],
    references: [stationBranches.id],
  }),
}));

// 4. ORDER Relations
export const ordersRelations = relations(orders, ({ one }) => ({
  branch: one(stationBranches, {
    fields: [orders.branchId],
    references: [stationBranches.id],
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
}));

// 5. BILLING_DOCUMENT Relations
export const billingDocumentsRelations = relations(
  billingDocuments,
  ({ one }) => ({
    order: one(orders, {
      fields: [billingDocuments.orderId],
      references: [orders.id],
    }),
  }),
);

// 6. PHOTO_COUNT_LOG Relations
export const photoCountLogsRelations = relations(photoCountLogs, ({ one }) => ({
  order: one(orders, {
    fields: [photoCountLogs.orderId],
    references: [orders.id],
  }),
}));
