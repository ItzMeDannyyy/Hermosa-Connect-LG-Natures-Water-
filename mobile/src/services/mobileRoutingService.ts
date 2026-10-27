/**
 * ============================================================================
 * FILE: src/services/mobileRoutingService.ts
 * PURPOSE: Provides realistic street-level routing and turn-by-turn navigation
 *          data for the LG Nature's Water Delivery Rider Screen.
 *          - Queries OSRM (Open Source Routing Machine) driving API
 *          - Bundles a high-resolution offline fallback for Quezon City
 *            (Katipunan Ave, Pansol St, Xavierville Ave)
 *          - Computes Mercator viewport projections for React Native SVG
 *          - Generates 1-tap Google Maps and Waze navigation deep links
 * ============================================================================
 */

import fallbackRouteJson from '../data/osrmRouteData.json';
import type {
  MapCoordinate,
  OptimizedRouteData,
  RouteLeg,
  RouteManeuver,
  RouteWaypoint,
} from '../types/mobile.types';

export interface ViewportBoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * Calculates a bounding box encompassing all coordinates with safe margin padding.
 */
export function calculateBoundingBox(
  coordinates: MapCoordinate[],
  paddingRatio: number = 0.18,
): ViewportBoundingBox {
  if (coordinates.length === 0) {
    return {
      minLat: 14.635,
      maxLat: 14.648,
      minLng: 121.07,
      maxLng: 121.08,
    };
  }

  let minLat = coordinates[0]!.latitude;
  let maxLat = coordinates[0]!.latitude;
  let minLng = coordinates[0]!.longitude;
  let maxLng = coordinates[0]!.longitude;

  for (let index = 1; index < coordinates.length; index = index + 1) {
    const point = coordinates[index];
    if (!point) continue;

    if (point.latitude < minLat) minLat = point.latitude;
    if (point.latitude > maxLat) maxLat = point.latitude;
    if (point.longitude < minLng) minLng = point.longitude;
    if (point.longitude > maxLng) maxLng = point.longitude;
  }

  const latSpan = Math.max(maxLat - minLat, 0.004);
  const lngSpan = Math.max(maxLng - minLng, 0.004);

  return {
    minLat: minLat - latSpan * paddingRatio,
    maxLat: maxLat + latSpan * paddingRatio,
    minLng: minLng - lngSpan * paddingRatio,
    maxLng: maxLng + lngSpan * paddingRatio,
  };
}

/**
 * Converts a geographic (latitude, longitude) coordinate into a 2D screen coordinate (x, y)
 * using linear projection across the local bounded viewport.
 */
export function projectCoordinateToScreen(
  coord: MapCoordinate,
  bbox: ViewportBoundingBox,
  viewportWidth: number,
  viewportHeight: number,
): { x: number; y: number } {
  const lngRange = bbox.maxLng - bbox.minLng;
  const latRange = bbox.maxLat - bbox.minLat;

  const safeLngRange = lngRange > 0 ? lngRange : 0.001;
  const safeLatRange = latRange > 0 ? latRange : 0.001;

  const normalizedX = (coord.longitude - bbox.minLng) / safeLngRange;
  // Invert Y because latitude increases North, but screen pixels increase South
  const normalizedY = (bbox.maxLat - coord.latitude) / safeLatRange;

  const x = Math.max(0, Math.min(viewportWidth, normalizedX * viewportWidth));
  const y = Math.max(0, Math.min(viewportHeight, normalizedY * viewportHeight));

  return { x, y };
}

/**
 * Constructs an SVG path string ("M x y L x y ...") from a sequence of screen points.
 */
export function buildSvgPathFromPoints(
  points: Array<{ x: number; y: number }>,
): string {
  if (points.length === 0) return '';
  let pathStr = `M ${points[0]!.x.toFixed(1)},${points[0]!.y.toFixed(1)}`;
  for (let index = 1; index < points.length; index = index + 1) {
    const pt = points[index]!;
    pathStr += ` L ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }
  return pathStr;
}

/**
 * Formats distance in meters into human-readable kilometers or meters.
 */
export function formatMetersDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * Formats duration in seconds into human-readable minutes.
 */
export function formatSecondsDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return '< 1 min';
  return `${minutes} min`;
}

/**
 * Generates an external deep link URL to launch native Google Maps or Waze navigation.
 */
export function buildNativeNavigationUrl(
  origin: MapCoordinate,
  destination: MapCoordinate,
  intermediateWaypoints: MapCoordinate[] = [],
  provider: 'google' | 'waze' = 'google',
): string {
  if (provider === 'waze') {
    return `https://waze.com/ul?ll=${destination.latitude},${destination.longitude}&navigate=yes`;
  }

  // Google Maps Universal Driving Directions URL with waypoints
  const waypointsQuery = intermediateWaypoints
    .map((wp) => `${wp.latitude},${wp.longitude}`)
    .join('|');

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&travelmode=driving`;
  if (waypointsQuery.length > 0) {
    url += `&waypoints=${encodeURIComponent(waypointsQuery)}`;
  }
  return url;
}

/**
 * Parses raw OSRM JSON response payload into strongly typed OptimizedRouteData.
 */
function parseOsrmResponse(
  rawJson: any,
  waypoints: RouteWaypoint[],
): OptimizedRouteData {
  const route = rawJson?.routes?.[0];
  if (!route) {
    throw new Error('No driving route found in OSRM payload');
  }

  const rawCoordinates = Array.isArray(route.geometry?.coordinates)
    ? route.geometry.coordinates
    : [];

  const fullCoordinates: MapCoordinate[] = [];
  for (let i = 0; i < rawCoordinates.length; i = i + 1) {
    const pair = rawCoordinates[i];
    if (Array.isArray(pair) && pair.length >= 2) {
      fullCoordinates.push({
        latitude: pair[1],
        longitude: pair[0],
      });
    }
  }

  const allManeuvers: RouteManeuver[] = [];
  const legs: RouteLeg[] = [];
  const rawLegs = Array.isArray(route.legs) ? route.legs : [];

  for (let legIdx = 0; legIdx < rawLegs.length; legIdx = legIdx + 1) {
    const rawLeg = rawLegs[legIdx];
    const fromWp = waypoints[legIdx] ?? waypoints[0]!;
    const toWp = waypoints[legIdx + 1] ?? waypoints[waypoints.length - 1]!;

    const legManeuvers: RouteManeuver[] = [];
    const legSteps = Array.isArray(rawLeg?.steps) ? rawLeg.steps : [];

    for (let sIdx = 0; sIdx < legSteps.length; sIdx = legSteps + 1) {
      const step = legSteps[sIdx];
      const mType = String(step?.maneuver?.type ?? 'turn');
      const modifier = step?.maneuver?.modifier
        ? String(step.maneuver.modifier)
        : undefined;
      const street = String(step?.name || 'Unnamed Road');
      const dist = Number(step?.distance ?? 0);
      const dur = Number(step?.duration ?? 0);

      let instruction = street;
      if (mType === 'depart') {
        instruction = `Head ${modifier ? modifier + ' ' : ''}on ${street}`;
      } else if (mType === 'arrive') {
        instruction = `Arrive at Stop #${toWp.sequenceNumber || legIdx + 1}`;
      } else {
        const turnAction = modifier ? `Turn ${modifier}` : 'Continue';
        instruction = `${turnAction} onto ${street}`;
      }

      const maneuverObj: RouteManeuver = {
        instruction,
        streetName: street,
        distanceMeters: dist,
        durationSeconds: dur,
        type: mType,
        modifier,
      };

      legManeuvers.push(maneuverObj);
      allManeuvers.push(maneuverObj);
    }

    // Extract slice of coordinates for this leg
    const legCoords: MapCoordinate[] = [];
    for (let sIdx = 0; sIdx < legSteps.length; sIdx = legSteps + 1) {
      const stepGeom = legSteps[sIdx]?.geometry?.coordinates;
      if (Array.isArray(stepGeom)) {
        for (let ptIdx = 0; ptIdx < stepGeom.length; ptIdx = ptIdx + 1) {
          legCoords.push({
            latitude: stepGeom[ptIdx][1],
            longitude: stepGeom[ptIdx][0],
          });
        }
      }
    }

    legs.push({
      fromWaypointId: fromWp.id,
      toWaypointId: toWp.id,
      distanceMeters: Number(rawLeg?.distance ?? 0),
      durationSeconds: Number(rawLeg?.duration ?? 0),
      summary: String(rawLeg?.summary || `${fromWp.label} -> ${toWp.label}`),
      coordinates: legCoords.length > 0 ? legCoords : fullCoordinates,
      maneuvers: legManeuvers,
    });
  }

  return {
    totalDistanceMeters: Number(route.distance ?? 0),
    totalDurationSeconds: Number(route.duration ?? 0),
    fullCoordinates,
    legs,
    allManeuvers,
    waypoints,
  };
}

/**
 * Fetches the real street-network polyline and turn maneuvers from OSRM,
 * with seamless high-resolution fallback to pre-bundled local Quezon City street network.
 */
export async function fetchOptimizedStreetRoute(
  waypoints: RouteWaypoint[],
): Promise<OptimizedRouteData> {
  if (waypoints.length < 2) {
    return {
      totalDistanceMeters: 0,
      totalDurationSeconds: 0,
      fullCoordinates: [],
      legs: [],
      allManeuvers: [],
      waypoints,
    };
  }

  // Format waypoints as "{lng},{lat};{lng},{lat}..." for OSRM
  const coordsQuery = waypoints
    .map((wp) => `${wp.longitude},${wp.latitude}`)
    .join(';');

  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsQuery}?overview=full&geometries=geojson&steps=true`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(osrmUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OSRM HTTP error status ${response.status}`);
    }

    const json = await response.json();
    return parseOsrmResponse(json, waypoints);
  } catch (_error) {
    // Network delay, offline, or rate-limited: use instant pre-bundled high-resolution road route
    return parseOsrmResponse(fallbackRouteJson, waypoints);
  }
}
