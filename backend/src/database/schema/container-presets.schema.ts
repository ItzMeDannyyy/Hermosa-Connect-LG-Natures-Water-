import { numeric, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { stationBranches } from './station-branches.schema.js';

export const containerPresets = pgTable('container_presets', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id')
    .notNull()
    .references(() => stationBranches.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  refillPrice: numeric('refill_price', { precision: 10, scale: 2 })
    .default('25.00')
    .notNull(),
});

export type ContainerPreset = typeof containerPresets.$inferSelect;
export type NewContainerPreset = typeof containerPresets.$inferInsert;
