import { date, jsonb, pgTable, uuid } from 'drizzle-orm/pg-core';
import { routeTripStatusEnum } from './enums.schema.js';
import { stationBranches } from './station-branches.schema.js';
import { users } from './users.schema.js';

export interface OptimizedWaypoint {
  orderId: string;
  stopSequenceNumber: number;
  latitude: number;
  longitude: number;
  address?: string;
}

export const routeTrips = pgTable('route_trips', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id')
    .notNull()
    .references(() => stationBranches.id, { onDelete: 'cascade' }),
  riderId: uuid('rider_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  status: routeTripStatusEnum('status').default('PLANNED').notNull(),
  tripDate: date('trip_date').notNull(),
  optimizedWaypoints: jsonb('optimized_waypoints').$type<OptimizedWaypoint[]>(),
});

export type RouteTrip = typeof routeTrips.$inferSelect;
export type NewRouteTrip = typeof routeTrips.$inferInsert;
