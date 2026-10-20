/**
 * ============================================================================
 * FILE: src/components/customer/CustomerHomeScreen.tsx
 * PURPOSE: Implements Wireframe C1 (1-Click Order Home & Account Accountability).
 *          - Shows Customer Greeting, Pinned Address & Nearest Station Badge
 *          - Shows Accountability Summary (Empty Containers Out + Unpaid Balance)
 *          - Shows One-Click Usual Order Card (8x 5-Gal Slim + Delivery Fee)
 *          - Uses modular StyleSheet rules from src/styles/customer.styles.ts
 *          - Uses Lucide icons (lucide-react-native) strictly.
 * ============================================================================
 */

import {
  ArrowRight,
  Banknote,
  Bell,
  Calendar,
  Droplets,
  FileText,
  MapPin,
  RefreshCw,
  Store,
  User,
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

  return (
    <ScrollView contentContainerStyle={customerStyles.scrollBody}>
      {/* 1. Customer Greeting & Nearest Station Header Card */}
      <View style={customerStyles.headerCard}>
        <View style={customerStyles.headerTopRow}>
          <View style={customerStyles.greetingRow}>
            <Droplets size={20} color="#38bdf8" />
            <Text style={customerStyles.greetingText}>
              Hi, {props.customerSummary.customerName}
            </Text>
          </View>

          <View style={customerStyles.headerIconsRow}>
            <View style={customerStyles.iconPillButton}>
              <Bell size={14} color="#fde047" />
              <Text style={customerStyles.iconPillBadgeText}>1</Text>
            </View>
            <View style={customerStyles.iconPillButton}>
              <User size={14} color="#ffffff" />
            </View>
          </View>
        </View>

        <View style={customerStyles.locationLine}>
          <MapPin size={14} color="#93c5fd" />
          <Text style={customerStyles.locationText}>
            {props.customerSummary.address}
          </Text>
        </View>

        <View style={customerStyles.nearestStationBadge}>
          <Store size={13} color="#7dd3fc" />
          <Text style={customerStyles.nearestStationText}>
            Nearest: {props.customerSummary.nearestStationLabel}
          </Text>
        </View>
      </View>

      {/* 2. Accountability Summary (Empty Containers Out + Unpaid Balance) */}
      <View>
        <Text style={customerStyles.sectionLabel}>ACCOUNTABILITY SUMMARY</Text>
        <View style={customerStyles.accountabilityGrid}>
          {/* Empty Containers Held Card */}
          <View style={customerStyles.accountabilityCard}>
            <View style={customerStyles.accountabilityCardTitleRow}>
              <Text style={customerStyles.accountabilityCardLabel}>
                Empty Containers
              </Text>
              <RefreshCw size={15} color="#0284c7" />
            </View>
            <Text style={customerStyles.accountabilityValueText}>
              {props.customerSummary.emptyContainersOut} Gallons Out
            </Text>
            <Text style={customerStyles.accountabilityMetaText}>
              Due: {props.customerSummary.containersDueDateLabel}
            </Text>
          </View>

          {/* Unpaid Balance Card */}
          <View style={customerStyles.accountabilityCard}>
            <View style={customerStyles.accountabilityCardTitleRow}>
              <Text style={customerStyles.accountabilityCardLabel}>
                Unpaid Balance
              </Text>
              <Banknote size={15} color="#dc2626" />
            </View>
            <Text style={customerStyles.accountabilityValueDanger}>
              PHP {props.customerSummary.unpaidBalanceAmount.toFixed(2)}
            </Text>
            <Text style={customerStyles.accountabilityMetaText}>
              From {props.customerSummary.unpaidFromReceiptCode}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. One-Click Usual Order Card */}
      <View style={customerStyles.usualOrderCard}>
        <View style={customerStyles.usualOrderHeaderRow}>
          <View style={customerStyles.usualOrderTitleRow}>
            <Zap size={17} color="#2563eb" />
            <Text style={customerStyles.usualOrderTitle}>
              ONE-CLICK USUAL ORDER
            </Text>
          </View>
          <View style={customerStyles.presetTagPill}>
            <Text style={customerStyles.presetTagText}>1-Tap Repeat</Text>
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
          <Text style={customerStyles.billRowLabel}>Delivery Fee</Text>
          <Text style={customerStyles.billRowValue}>
            PHP {usualBill.deliveryFee.toFixed(2)}
          </Text>
        </View>

        <View style={customerStyles.billTotalRow}>
          <Text style={customerStyles.billTotalLabel}>Total</Text>
          <Text style={customerStyles.billTotalValue}>
            PHP {usualBill.totalDue.toFixed(2)}
          </Text>
        </View>

        <Pressable
          onPress={props.onPlaceOneClickUsualOrder}
          style={customerStyles.oneClickOrderButton}
        >
          <Droplets size={18} color="#ffffff" />
          <Text style={customerStyles.oneClickOrderButtonText}>
            TAP TO ORDER USUAL ({props.customerSummary.usualOrderGallons})
          </Text>
        </Pressable>
      </View>

      {/* 4. Quick Navigation to Schedule Empty Container Pickup (C2) */}
      <Pressable
        onPress={props.onNavigateToPickupSchedule}
        style={customerStyles.secondaryActionCard}
      >
        <View style={customerStyles.secondaryActionLeft}>
          <Calendar size={20} color="#2563eb" />
          <View style={{ flex: 1 }}>
            <Text style={customerStyles.secondaryActionTitle}>
              Schedule Empty Container Pickup
            </Text>
            <Text style={customerStyles.secondaryActionSub}>
              Need a custom pickup day or time window? Set your schedule.
            </Text>
          </View>
        </View>
        <ArrowRight size={18} color="#64748b" />
      </Pressable>

      {/* 5. Quick Navigation to Live Order & Smart Receipt Tracking (C3) */}
      <Pressable
        onPress={props.onNavigateToOrderTracking}
        style={customerStyles.secondaryActionCard}
      >
        <View style={customerStyles.secondaryActionLeft}>
          <FileText size={20} color="#059669" />
          <View style={{ flex: 1 }}>
            <Text style={customerStyles.secondaryActionTitle}>
              View Active Order: {activeDocLabel}
            </Text>
            <Text style={customerStyles.secondaryActionSub}>
              Live rider tracking &amp; AI photo-verified smart billing
            </Text>
          </View>
        </View>
        <ArrowRight size={18} color="#64748b" />
      </Pressable>
    </ScrollView>
  );
}
