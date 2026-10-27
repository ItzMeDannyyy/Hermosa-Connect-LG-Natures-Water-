/**
 * ============================================================================
 * FILE: src/components/rider/RiderRouteScreen.tsx
 * PURPOSE: Rider Delivery Route Manifest & Street Navigation HUD.
 *          Features real OpenStreetMap integration, sequenced stop manifests,
 *          and direct 1-tap dispatch actions (AI count & receipt issuance).
 *          Strict Lucide icons (lucide-react-native).
 * ============================================================================
 */

import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  CornerUpRight,
  Droplets,
  FileText,
  Map,
  Navigation,
  RefreshCw,
  Store,
  Truck,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { DEMO_STATION_HUB } from '../../data/mobileInitialData';
import { customerStyles } from '../../styles/customer.styles';
import { riderStyles } from '../../styles/rider.styles';
import type { MobileOrderItem } from '../../types/mobile.types';
import { RiderInteractiveRouteMap } from './RiderInteractiveRouteMap';

interface RiderRouteScreenProps {
  riderName: string;
  branchName: string;
  orders: MobileOrderItem[];
  selectedOrderId: string;
  onSelectOrder?: (orderId: string) => void;
  onSelectOrderForAiCount: (orderId: string) => void;
  onSelectOrderForDoorstepReceipt: (orderId: string) => void;
}

export function RiderRouteScreen(props: RiderRouteScreenProps) {
  // Navigation active stop index: 0 = heading to Stop 1, 1 = heading to Stop 2, 2 = heading to Stop 3
  const [activeNavStopIndex, setActiveNavStopIndex] = useState<number>(0);

  const activeTargetOrder =
    props.orders[activeNavStopIndex] ?? props.orders[0] ?? null;

  // Turn-by-turn guidance for current targeted stop
  const currentNavManeuver = React.useMemo(() => {
    if (!activeTargetOrder) {
      return {
        instruction: 'All deliveries completed for this trip',
        street: 'LG Nature Station 1',
        distanceText: '0 m',
        etaText: 'Returned',
      };
    }

    if (activeNavStopIndex === 0) {
      return {
        instruction: 'Head North on Katipunan Ave, turn Right onto Pansol St',
        street: 'Pansol St, Quezon City',
        distanceText: `${activeTargetOrder.distanceKm ?? 0.8} km`,
        etaText: `~${activeTargetOrder.etaMinutes ?? 4} min`,
      };
    }
    if (activeNavStopIndex === 1) {
      return {
        instruction: 'Continue onto B. Gonzales, turn Left onto Xavierville Ave',
        street: 'Xavierville Ave, Quezon City',
        distanceText: `${activeTargetOrder.distanceKm ?? 1.4} km`,
        etaText: `~${activeTargetOrder.etaMinutes ?? 7} min`,
      };
    }
    return {
      instruction: 'Head South on Katipunan Ave toward Aurora Blvd intersection',
      street: '102 Katipunan Ave, Quezon City',
      distanceText: `${activeTargetOrder.distanceKm ?? 1.1} km`,
      etaText: `~${activeTargetOrder.etaMinutes ?? 5} min`,
    };
  }, [activeNavStopIndex, activeTargetOrder]);

  const handleSelectOrderInternal = (orderId: string) => {
    if (props.onSelectOrder) {
      props.onSelectOrder(orderId);
    }
    const foundIdx = props.orders.findIndex((o) => o.id === orderId);
    if (foundIdx !== -1) {
      setActiveNavStopIndex(foundIdx);
    }
  };

  const handleNextWaypoint = () => {
    setActiveNavStopIndex((prev) => {
      const nextIdx = (prev + 1) % props.orders.length;
      const targetOrd = props.orders[nextIdx];
      if (targetOrd && props.onSelectOrder) {
        props.onSelectOrder(targetOrd.id);
      }
      return nextIdx;
    });
  };

  const handlePrevWaypoint = () => {
    setActiveNavStopIndex((prev) => {
      const prevIdx = prev === 0 ? props.orders.length - 1 : prev - 1;
      const targetOrd = props.orders[prevIdx];
      if (targetOrd && props.onSelectOrder) {
        props.onSelectOrder(targetOrd.id);
      }
      return prevIdx;
    });
  };

  return (
    <ScrollView contentContainerStyle={riderStyles.scrollBody}>
      {/* 1. Rider Header Banner */}
      <View style={riderStyles.riderHeaderBanner}>
        <View style={riderStyles.riderHeaderTopRow}>
          <View style={riderStyles.riderNameRow}>
            <Truck size={18} color="#38bdf8" />
            <Text style={riderStyles.riderNameTitle}>
              {props.riderName}
            </Text>
          </View>

          <View style={riderStyles.branchPill}>
            <Text style={riderStyles.branchPillText}>{props.branchName}</Text>
          </View>
        </View>

        <Text style={riderStyles.tripSummarySubtitle}>
          Trip #T-204 &bull; {props.orders.length} Sequenced Stops &bull; Katipunan Corridor
        </Text>
      </View>

      {/* 2. Street Route Map & Navigation HUD */}
      <View style={riderStyles.routeMapCard}>
        <View style={riderStyles.routeMapHeaderRow}>
          <View style={riderStyles.routeMapTitleRow}>
            <Map size={15} color="#38bdf8" />
            <Text style={riderStyles.routeMapTitle}>
              STREET ROUTE &amp; DISPATCH MAP
            </Text>
          </View>

          <View style={riderStyles.fuelSavedBadge}>
            <Text style={riderStyles.fuelSavedText}>
              OPTIMIZED CORRIDOR
            </Text>
          </View>
        </View>

        {/* Real Interactive Street Map Canvas */}
        <RiderInteractiveRouteMap
          stationHub={DEMO_STATION_HUB}
          orders={props.orders}
          selectedOrderId={props.selectedOrderId}
          onSelectOrder={handleSelectOrderInternal}
          activeNavStopIndex={activeNavStopIndex}
        />

        {/* Turn-by-Turn Maneuver HUD Bar */}
        <View style={riderStyles.hudCard}>
          <View style={riderStyles.hudTopRow}>
            <View style={riderStyles.hudManeuverRow}>
              <View style={riderStyles.hudManeuverIconBox}>
                <CornerUpRight size={16} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={riderStyles.hudInstructionTitle}>
                  {currentNavManeuver.instruction}
                </Text>
                <Text style={riderStyles.hudInstructionSub}>
                  {currentNavManeuver.street}
                </Text>
              </View>
            </View>

            <View style={riderStyles.hudDistanceBadge}>
              <Text style={riderStyles.hudDistanceText}>
                {currentNavManeuver.distanceText}
              </Text>
            </View>
          </View>

          {/* Current Target Stop Summary */}
          {activeTargetOrder && (
            <View style={riderStyles.hudTargetStopRow}>
              <Text style={riderStyles.hudTargetCustomerText}>
                Target: Stop #{activeTargetOrder.stopSequenceNumber} &bull;{' '}
                {activeTargetOrder.customerName}
              </Text>
              <Text style={riderStyles.hudTargetMetaText}>
                ETA {currentNavManeuver.etaText} &bull;{' '}
                {activeTargetOrder.verifiedCount} Gallons
              </Text>
            </View>
          )}

          {/* Waypoint Stepper Controls */}
          <View style={riderStyles.hudControlsRow}>
            <Pressable
              onPress={handlePrevWaypoint}
              style={riderStyles.hudStepButton}
            >
              <Text style={riderStyles.hudStepButtonText}>Prev Stop</Text>
            </Pressable>

            <Pressable
              onPress={handleNextWaypoint}
              style={[
                riderStyles.hudStepButton,
                riderStyles.hudStepButtonActive,
              ]}
            >
              <Navigation size={12} color="#ffffff" />
              <Text style={[riderStyles.hudStepButtonText, { color: '#ffffff' }]}>
                Next Stop (Stop #
                {activeNavStopIndex + 1 < props.orders.length
                  ? activeNavStopIndex + 2
                  : 1}
                )
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Sequenced Waypoints Chain */}
        <View style={riderStyles.waypointsChainRow}>
          <Pressable
            onPress={() => {
              if (props.orders[0]) handleSelectOrderInternal(props.orders[0].id);
            }}
            style={riderStyles.waypointNode}
          >
            <View
              style={[
                riderStyles.waypointCircle,
                { backgroundColor: '#0284c7' },
              ]}
            >
              <Store size={13} color="#ffffff" />
            </View>
            <Text style={riderStyles.waypointLabel}>Station 1</Text>
          </Pressable>

          <ArrowRight size={13} color="#64748b" />

          {props.orders.map((orderItem, index) => {
            const isDone = orderItem.documentStage === 'OFFICIAL_RECEIPT';
            const isSelected = orderItem.id === props.selectedOrderId;
            const isLastItem = index === props.orders.length - 1;

            return (
              <React.Fragment key={orderItem.id}>
                <Pressable
                  onPress={() => handleSelectOrderInternal(orderItem.id)}
                  style={riderStyles.waypointNode}
                >
                  <View
                    style={[
                      riderStyles.waypointCircle,
                      isDone
                        ? { backgroundColor: '#059669' }
                        : isSelected
                          ? { backgroundColor: '#0284c7', borderWidth: 2, borderColor: '#7dd3fc' }
                          : { backgroundColor: '#334155' },
                    ]}
                  >
                    <Text style={riderStyles.waypointCircleText}>
                      {orderItem.stopSequenceNumber}
                    </Text>
                  </View>
                  <Text style={riderStyles.waypointLabel}>
                    Stop {orderItem.stopSequenceNumber}
                  </Text>
                </Pressable>

                {!isLastItem && <ArrowRight size={13} color="#64748b" />}
              </React.Fragment>
            );
          })}
        </View>
      </View>

      {/* 3. Sequenced Stops Manifest */}
      <View style={{ gap: 10 }}>
        <Text style={customerStyles.sectionLabel}>
          Delivery Stops Manifest
        </Text>

        {props.orders.map((orderItem) => {
          const isSelected = orderItem.id === props.selectedOrderId;
          const isCompleted = orderItem.documentStage === 'OFFICIAL_RECEIPT';
          const statusDocumentLabel =
            orderItem.receiptNumber !== null
              ? `#${orderItem.receiptNumber} (Receipt Issued)`
              : `#${orderItem.invoiceNumber} (Pre-Dispatch)`;

          return (
            <Pressable
              key={orderItem.id}
              onPress={() => handleSelectOrderInternal(orderItem.id)}
              style={[
                riderStyles.stopCard,
                isSelected ? riderStyles.stopCardSelected : null,
              ]}
            >
              <View style={riderStyles.stopTopRow}>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 10,
                    flex: 1,
                    alignItems: 'flex-start',
                  }}
                >
                  <View
                    style={[
                      riderStyles.stopNumberBadge,
                      isCompleted ? { backgroundColor: '#059669' } : null,
                    ]}
                  >
                    <Text
                      style={[
                        riderStyles.stopNumberText,
                        isCompleted ? { color: '#ffffff' } : null,
                      ]}
                    >
                      {orderItem.stopSequenceNumber}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={riderStyles.stopCustomerName}>
                      {orderItem.customerName}
                    </Text>
                    <Text style={riderStyles.stopAddressText}>
                      {orderItem.deliveryAddress}
                    </Text>
                  </View>
                </View>

                <View style={customerStyles.presetTagPill}>
                  <Text style={customerStyles.presetTagText}>
                    PHP {orderItem.totalDue.toFixed(0)}
                  </Text>
                </View>
              </View>

              {/* Metrics Row: Deliver, Pickup, Slot, Doc */}
              <View style={riderStyles.stopMetricsRow}>
                <View style={riderStyles.stopMetricPill}>
                  <Droplets size={12} color="#0284c7" />
                  <Text style={riderStyles.stopMetricText}>
                    Deliver: {orderItem.verifiedCount}
                  </Text>
                </View>

                <View style={riderStyles.stopMetricPill}>
                  <RefreshCw size={12} color="#059669" />
                  <Text style={riderStyles.stopMetricText}>
                    Pickup: {orderItem.emptyContainersToPickup}
                  </Text>
                </View>

                <View style={riderStyles.stopMetricPill}>
                  <Clock size={12} color="#d97706" />
                  <Text style={riderStyles.stopMetricText}>
                    {orderItem.scheduledTimeSlot}
                  </Text>
                </View>

                <View style={riderStyles.stopMetricPill}>
                  <FileText
                    size={12}
                    color={isCompleted ? '#059669' : '#0284c7'}
                  />
                  <Text style={riderStyles.stopMetricText}>
                    {statusDocumentLabel}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={riderStyles.stopActionsRow}>
                <Pressable
                  onPress={() => {
                    props.onSelectOrderForAiCount(orderItem.id);
                  }}
                  style={riderStyles.stopSecondaryButton}
                >
                  <Camera size={14} color="#0284c7" />
                  <Text style={riderStyles.stopSecondaryButtonText}>
                    AI Photo Count
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    props.onSelectOrderForDoorstepReceipt(orderItem.id);
                  }}
                  style={riderStyles.stopPrimaryButton}
                >
                  <CheckCircle2 size={14} color="#ffffff" />
                  <Text style={riderStyles.stopPrimaryButtonText}>
                    {isCompleted ? 'View Receipt (#OR)' : 'Deliver & Issue Receipt'}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
