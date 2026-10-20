import { integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { orders } from './orders.schema.js';
import { users } from './users.schema.js';

export const containerLedgers = pgTable('container_ledgers', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  containersDelivered: integer('containers_delivered').default(0).notNull(),
  containersPickedUp: integer('containers_picked_up').default(0).notNull(),
  runningBalanceAfter: integer('running_balance_after').notNull(),
  loggedAt: timestamp('logged_at').defaultNow().notNull(),
});

export type ContainerLedger = typeof containerLedgers.$inferSelect;
export type NewContainerLedger = typeof containerLedgers.$inferInsert;
