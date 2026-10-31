import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { stationBranches } from './station-branches.schema.js';

export const deliveryCustomers = pgTable('delivery_customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  phoneNumber: text('phone_number'),
  barangay: text('barangay').notNull(),
  deliveryAddress: text('delivery_address'),
  vehicleType: text('vehicle_type').default('FOTON').notNull(),
  scheduledDeliveryTime: text('scheduled_delivery_time'),
  notes: text('notes'),
  branchId: uuid('branch_id').references(() => stationBranches.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type DeliveryCustomer = typeof deliveryCustomers.$inferSelect;
export type NewDeliveryCustomer = typeof deliveryCustomers.$inferInsert;
