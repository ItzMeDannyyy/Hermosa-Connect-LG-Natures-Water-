/**
 * ============================================================================
 * FILE: src/components/customer/CustomerHomeScreen.tsx
 * PURPOSE: Customer Dashboard & 1-Tap Refill Ordering.
 *          Displays real customer accountability metrics (empty jugs held +
 *          unpaid balance), station status, and quick order repeat.
 *          Strict Lucide icons (lucide-react-native).
 * ============================================================================
 */

import {
  ArrowRight,
  Banknote,
  Calendar,
  Droplets,
  FileText,
  MapPin,
  RefreshCw,
  Store,
  Zap,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { calculateOrderBillBreakdown } from '../../data/mobileInitialData';
import { customerStyles } from '../../styles/customer.styles';
import type {
  CustomerAccountSummary,
  MobileOrderItem,
} from '../../types/mobile.types';

interface CustomerHomeScreenProps {
  customerSummary: CustomerAccountSummary;
  activeOrder: MobileOrderItem;
  onPlaceOneClickUsualOrder: () => void;
  onNavigateToPickupSchedule: () => void;
  onNavigateToOrderTracking: () => void;
}

export function CustomerHomeScreen(props: CustomerHomeScreenProps) {
  const usualBill = calculateOrderBillBreakdown(
    props.customerSummary.usualOrderGallons,
  );

  const activeDocLabel =
    props.activeOrder.receiptNumber !== null
      ? `#${props.activeOrder.receiptNumber} (Official Receipt)`
      : `#${props.activeOrder.invoiceNumber} (Out for Delivery)`;

  const hasUnpaidBalance = props.customerSummary.unpaidBalanceAmount > 0;

  return (
    <ScrollView contentContainerStyle={customerStyles.scrollBody}>
      {/* 1. Customer Greeting & Station Status */}
      <View style={customerStyles.headerCard}>
        <View style={customerStyles.headerTopRow}>
          <View style={customerStyles.greetingRow}>
            <Droplets size={18} color="#38bdf8" />
            <Text style={customerStyles.greetingText}>
              {props.customerSummary.customerName}
            </Text>
          </View>

          <View style={customerStyles.nearestStationBadge}>
            <Store size={12} color="#7dd3fc" />
            <Text style={customerStyles.nearestStationText}>
              {props.customerSummary.nearestStationLabel}
            </Text>
          </View>
        </View>

        <View style={customerStyles.locationLine}>
          <MapPin size={13} color="#7dd3fc" />
          <Text style={customerStyles.locationText}>
            {props.customerSummary.address}
          </Text>
        </View>
      </View>

      {/* 2. Accountability Summary (Empty Jugs Out + Balance) */}
      <View>
        <Text style={customerStyles.sectionLabel}>Account Accountability</Text>
        <View style={customerStyles.accountabilityGrid}>
          {/* Empty Containers Held Card */}
          <View style={customerStyles.accountabilityCard}>
            <View style={customerStyles.accountabilityCardTitleRow}>
              <Text style={customerStyles.accountabilityCardLabel}>
                Containers Held
              </Text>
              <RefreshCw size={13} color="#0284c7" />
            </View>
            <Text style={customerStyles.accountabilityValueText}>
              {props.customerSummary.emptyContainersOut} Gallons
            </Text>
            <Text style={customerStyles.accountabilityMetaText}>
              Return Due: {props.customerSummary.containersDueDateLabel}
            </Text>
          </View>

          {/* Unpaid Balance Card */}
          <View style={customerStyles.accountabilityCard}>
            <View style={customerStyles.accountabilityCardTitleRow}>
              <Text style={customerStyles.accountabilityCardLabel}>
                Outstanding Due
              </Text>
              <Banknote
                size={13}
                color={hasUnpaidBalance ? '#dc2626' : '#059669'}
              />
            </View>
            <Text
              style={
                hasUnpaidBalance
                  ? customerStyles.accountabilityValueDanger
                  : [customerStyles.accountabilityValueText, { color: '#059669' }]
              }
            >
              PHP {props.customerSummary.unpaidBalanceAmount.toFixed(2)}
            </Text>
            <Text style={customerStyles.accountabilityMetaText}>
              {hasUnpaidBalance
                ? `From ${props.customerSummary.unpaidFromReceiptCode}`
                : 'All previous orders settled'}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. One-Click Usual Refill Card */}
      <View style={customerStyles.usualOrderCard}>
        <View style={customerStyles.usualOrderHeaderRow}>
          <View style={customerStyles.usualOrderTitleRow}>
            <Zap size={16} color="#0284c7" />
            <Text style={customerStyles.usualOrderTitle}>
              1-Tap Usual Refill Order
            </Text>
          </View>
          <View style={customerStyles.presetTagPill}>
            <Text style={customerStyles.presetTagText}>Quick Repeat</Text>
          </View>
        </View>

        <View style={customerStyles.billRow}>
          <Text style={customerStyles.billRowLabel}>
            {props.customerSummary.usualOrderGallons}x{' '}
            {props.customerSummary.usualPresetName}
          </Text>
          <Text style={customerStyles.billRowValue}>
            PHP {usualBill.subtotalAmount.toFixed(2)}
          </Text>
        </View>

        <View style={customerStyles.billRow}>
          <Text style={customerStyles.billRowLabel}>Station Delivery Fee</Text>
          <Text style={customerStyles.billRowValue}>
            PHP {usualBill.deliveryFee.toFixed(2)}
          </Text>
        </View>

        <View style={customerStyles.billTotalRow}>
          <Text style={customerStyles.billTotalLabel}>Total Due (COD / GCash)</Text>
          <Text style={customerStyles.billTotalValue}>
            PHP {usualBill.totalDue.toFixed(2)}
          </Text>
        </View>

        <Pressable
          onPress={props.onPlaceOneClickUsualOrder}
          style={customerStyles.oneClickOrderButton}
        >
          <Droplets size={16} color="#ffffff" />
          <Text style={customerStyles.oneClickOrderButtonText}>
            PLACE USUAL ORDER ({props.customerSummary.usualOrderGallons} JUGS)
          </Text>
        </Pressable>
      </View>

      {/* 4. Quick Action: Schedule Empty Container Pickup */}
      <Pressable
        onPress={props.onNavigateToPickupSchedule}
        style={customerStyles.secondaryActionCard}
      >
        <View style={customerStyles.secondaryActionLeft}>
          <Calendar size={18} color="#0284c7" />
          <View style={{ flex: 1 }}>
            <Text style={customerStyles.secondaryActionTitle}>
              Schedule Empty Jug Pickup
            </Text>
            <Text style={customerStyles.secondaryActionSub}>
              Return empty 5-gallon carboys on your preferred time slot
            </Text>
          </View>
        </View>
        <ArrowRight size={16} color="#94a3b8" />
      </Pressable>

      {/* 5. Quick Action: Active Order Tracking */}
      <Pressable
        onPress={props.onNavigateToOrderTracking}
        style={customerStyles.secondaryActionCard}
      >
        <View style={customerStyles.secondaryActionLeft}>
          <FileText size={18} color="#059669" />
          <View style={{ flex: 1 }}>
            <Text style={customerStyles.secondaryActionTitle}>
              Active Order: {activeDocLabel}
            </Text>
            <Text style={customerStyles.secondaryActionSub}>
              View live driver status and AI photo verification
            </Text>
          </View>
        </View>
        <ArrowRight size={16} color="#94a3b8" />
      </Pressable>
    </ScrollView>
  );
}
