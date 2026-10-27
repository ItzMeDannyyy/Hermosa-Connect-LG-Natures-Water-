import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userRoleEnum } from './enums.schema.js';
import { stationBranches } from './station-branches.schema.js';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id').references(() => stationBranches.id, {
    onDelete: 'set null',
  }),
  role: userRoleEnum('role').default('OPERATOR').notNull(),
  fullName: text('full_name').notNull(),
  phoneNumber: text('phone_number').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  refreshTokenHash: text('refresh_token_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
