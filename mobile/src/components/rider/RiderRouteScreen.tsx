/**
 * ============================================================================
 * FILE: src/components/rider/RiderRouteScreen.tsx
 * PURPOSE: Implements Wireframe R1 (Smart Sequenced Route & Stop Manifest —
 *          Feature 01).
 *          - Shows Rider Header (Rider: J. Cruz • Branch: Station 1 • Trip #T-204)
 *          - Shows Interactive Sequenced Route Map Card ([Stn 1] -> (1) -> (2) -> (3))
 *          - Lists Sequenced Stops with Deliver/Pickup counts and action buttons
 *            to open AI Photo Count (R2) or Doorstep Delivery Receipt (R3).
 *          - Uses Lucide icons (lucide-react-native) strictly.
 * ============================================================================
 */

import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  Droplets,
  FileText,
  Map,
  RefreshCw,
  Store,
  Truck,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { customerStyles } from '../../styles/customer.styles';
import { riderStyles } from '../../styles/rider.styles';
import type { MobileOrderItem } from '../../types/mobile.types';

interface RiderRouteScreenProps {
  riderName: string;
  branchName: string;
  orders: MobileOrderItem[];
  selectedOrderId: string;
  onSelectOrderForAiCount: (orderId: string) => void;
  onSelectOrderForDoorstepReceipt: (orderId: string) => void;
}

export function RiderRouteScreen(props: RiderRouteScreenProps) {
  return (
    <ScrollView contentContainerStyle={riderStyles.scrollBody}>
      {/* 1. Rider Header Banner */}
      <View style={riderStyles.riderHeaderBanner}>
        <View style={riderStyles.riderHeaderTopRow}>
          <View style={riderStyles.riderNameRow}>
            <Truck size={20} color="#38bdf8" />
            <Text style={riderStyles.riderNameTitle}>
              Rider: {props.riderName}
            </Text>
          </View>

          <View style={riderStyles.branchPill}>
            <Text style={riderStyles.branchPillText}>{props.branchName}</Text>
          </View>
        </View>

        <Text style={riderStyles.tripSummarySubtitle}>
          Trip #T-204 • {props.orders.length} Sequenced Stops (Pansol &amp;
          Katipunan Corridor)
        </Text>
      </View>

      {/* 2. Interactive Route Map Preview Card */}
      <View style={riderStyles.routeMapCard}>
        <View style={riderStyles.routeMapHeaderRow}>
          <View style={riderStyles.routeMapTitleRow}>
            <Map size={16} color="#38bdf8" />
            <Text style={riderStyles.routeMapTitle}>
              SMART SEQUENCED ROUTE MAP
            </Text>
          </View>

          <View style={riderStyles.fuelSavedBadge}>
            <Text style={riderStyles.fuelSavedText}>
              Fuel Saved: ~28% • Same-Street
            </Text>
          </View>
        </View>

        {/* Sequenced Waypoints Chain: [Stn 1] -> (1) -> (2) -> (3) */}
        <View style={riderStyles.waypointsChainRow}>
          <View style={riderStyles.waypointNode}>
            <View
              style={[
                riderStyles.waypointCircle,
                { backgroundColor: '#0284c7' },
              ]}
            >
              <Store size={14} color="#ffffff" />
            </View>
            <Text style={riderStyles.waypointLabel}>Stn 1</Text>
          </View>

          <ArrowRight size={14} color="#64748b" />

          {props.orders.map((orderItem, index) => {
            const isDone = orderItem.documentStage === 'OFFICIAL_RECEIPT';
            const isLastItem = index === props.orders.length - 1;

            return (
              <React.Fragment key={orderItem.id}>
                <View style={riderStyles.waypointNode}>
                  <View
                    style={[
                      riderStyles.waypointCircle,
                      isDone ? { backgroundColor: '#059669' } : null,
                    ]}
                  >
                    <Text style={riderStyles.waypointCircleText}>
                      {orderItem.stopSequenceNumber}
                    </Text>
                  </View>
                  <Text style={riderStyles.waypointLabel}>
                    Stop #{orderItem.stopSequenceNumber}
                  </Text>
                </View>

                {!isLastItem && <ArrowRight size={14} color="#64748b" />}
              </React.Fragment>
            );
          })}
        </View>
      </View>

      {/* 3. Sequenced Stops Manifest List */}
      <View style={{ gap: 12 }}>
        <Text style={customerStyles.sectionLabel}>
          SEQUENCED STOPS (AUTO-ORDERED BY STREET &amp; SLOT)
        </Text>

        {props.orders.map((orderItem) => {
          const isSelected = orderItem.id === props.selectedOrderId;
          const isCompleted = orderItem.documentStage === 'OFFICIAL_RECEIPT';
          const statusDocumentLabel =
            orderItem.receiptNumber !== null
              ? `#${orderItem.receiptNumber} (Completed)`
              : `#${orderItem.invoiceNumber} (Pre-Dispatch)`;

          return (
            <View
              key={orderItem.id}
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
                  <View style={riderStyles.stopNumberBadge}>
                    <Text style={riderStyles.stopNumberText}>
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

              {/* Deliver / Pickup / Slot / Document Status Pills */}
              <View style={riderStyles.stopMetricsRow}>
                <View style={riderStyles.stopMetricPill}>
                  <Droplets size={13} color="#2563eb" />
                  <Text style={riderStyles.stopMetricText}>
                    Deliver: {orderItem.verifiedCount}
                  </Text>
                </View>

                <View style={riderStyles.stopMetricPill}>
                  <RefreshCw size={13} color="#0284c7" />
                  <Text style={riderStyles.stopMetricText}>
                    Pickup: {orderItem.emptyContainersToPickup}
                  </Text>
                </View>

                <View style={riderStyles.stopMetricPill}>
                  <Clock size={13} color="#d97706" />
                  <Text style={riderStyles.stopMetricText}>
                    {orderItem.scheduledTimeSlot}
                  </Text>
                </View>

                <View style={riderStyles.stopMetricPill}>
                  <FileText
                    size={13}
                    color={isCompleted ? '#059669' : '#2563eb'}
                  />
                  <Text style={riderStyles.stopMetricText}>
                    {statusDocumentLabel}
                  </Text>
                </View>
              </View>

              {/* Stop Action Buttons: [AI Count (R2)] and [Deliver #OR (R3)] */}
              <View style={riderStyles.stopActionsRow}>
                <Pressable
                  onPress={() => {
                    props.onSelectOrderForAiCount(orderItem.id);
                  }}
                  style={riderStyles.stopSecondaryButton}
                >
                  <Camera size={15} color="#2563eb" />
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
                  <CheckCircle2 size={15} color="#ffffff" />
                  <Text style={riderStyles.stopPrimaryButtonText}>
                    {isCompleted ? 'View #OR Receipt' : 'Deliver & Issue #OR'}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
