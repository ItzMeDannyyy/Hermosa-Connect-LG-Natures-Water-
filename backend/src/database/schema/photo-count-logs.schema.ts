import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { capturedStageEnum } from './enums.schema.js';
import { orders } from './orders.schema.js';

export interface BoundingBoxPrediction {
  boxNumber?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class?: string;
}

export const photoCountLogs = pgTable('photo_count_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  detectedCount: integer('detected_count').notNull(),
  boundingBoxes: jsonb('bounding_boxes')
    .$type<BoundingBoxPrediction[]>()
    .notNull(),
  capturedStage: capturedStageEnum('captured_stage')
    .default('PRE_DISPATCH_STATION')
    .notNull(),
  capturedAt: timestamp('captured_at').defaultNow().notNull(),
});

export type PhotoCountLog = typeof photoCountLogs.$inferSelect;
export type NewPhotoCountLog = typeof photoCountLogs.$inferInsert;
