import {
  date,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { documentStageEnum, paymentStateEnum } from './enums.schema.js';
import { orders } from './orders.schema.js';

export const billingDocuments = pgTable('billing_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: 'cascade' }),
  invoiceNumber: text('invoice_number').notNull().unique(),
  receiptNumber: text('receipt_number').unique(),
  documentStage: documentStageEnum('document_stage')
    .default('INVOICE_ONLY')
    .notNull(),
  paymentState: paymentStateEnum('payment_state'),
  subtotalAmount: numeric('subtotal_amount', {
    precision: 10,
    scale: 2,
  }).notNull(),
  deliveryFee: numeric('delivery_fee', { precision: 10, scale: 2 })
    .default('30.00')
    .notNull(),
  totalDue: numeric('total_due', { precision: 10, scale: 2 }).notNull(),
  amountPaid: numeric('amount_paid', { precision: 10, scale: 2 })
    .default('0.00')
    .notNull(),
  changeGiven: numeric('change_given', { precision: 10, scale: 2 })
    .default('0.00')
    .notNull(),
  balanceDue: numeric('balance_due', { precision: 10, scale: 2 })
    .default('0.00')
    .notNull(),
  chargeSlipDueDate: date('charge_slip_due_date'),
  invoicedAt: timestamp('invoiced_at').defaultNow().notNull(),
  receiptIssuedAt: timestamp('receipt_issued_at'),
});

export type BillingDocument = typeof billingDocuments.$inferSelect;
export type NewBillingDocument = typeof billingDocuments.$inferInsert;
