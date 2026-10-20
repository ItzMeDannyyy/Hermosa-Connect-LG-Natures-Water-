/**
 * ============================================================================
 * FILE: src/components/rider/RiderAiPhotoCountScreen.tsx
 * PURPOSE: Implements Wireframe R2 (AI Photo Container Count & Instant Billing
 *          — Feature 04).
 *          - Displays simulated camera load photo with Roboflow bounding boxes
 *            [1]..[N] and AI confidence badge
 *          - Computes pre-dispatch Invoice (#INV) automatically
 *          - Allows Rider to test different detected loads (6, 8, or 12 jugs)
 *            and issue Invoice #INV in 1 tap.
 *          - Uses Lucide icons (lucide-react-native) strictly.
 * ============================================================================
 */

import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Droplets,
  RefreshCw,
  Zap,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { calculateOrderBillBreakdown } from '../../data/mobileInitialData';
import { customerStyles } from '../../styles/customer.styles';
import { riderStyles } from '../../styles/rider.styles';
import type { MobileOrderItem } from '../../types/mobile.types';

interface RiderAiPhotoCountScreenProps {
  order: MobileOrderItem;
  onUpdateVerifiedCount: (orderId: string, newCount: number) => void;
  onIssueInvoiceAndProceedToDoorstep: () => void;
  onBackToRoute: () => void;
}

export function RiderAiPhotoCountScreen(props: RiderAiPhotoCountScreenProps) {
  const billBreakdown = calculateOrderBillBreakdown(props.order.verifiedCount);

  // Build explicit list of detected container indices [1..N]
  const detectedIndices: number[] = [];
  for (let index = 1; index <= props.order.verifiedCount; index = index + 1) {
    detectedIndices.push(index);
  }

  return (
    <ScrollView contentContainerStyle={riderStyles.scrollBody}>
      {/* Top Back Bar */}
      <Pressable
        onPress={props.onBackToRoute}
        style={customerStyles.secondaryActionCard}
      >
        <View style={customerStyles.secondaryActionLeft}>
          <ArrowLeft size={18} color="#0f172a" />
          <View>
            <Text style={customerStyles.secondaryActionTitle}>
              AI Photo Container Count (Order #{props.order.orderNumber})
            </Text>
            <Text style={customerStyles.secondaryActionSub}>
              Customer: {props.order.customerName}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* 1. Camera / Captured Load Photo with Bounding Boxes */}
      <View style={riderStyles.cameraViewportCard}>
        <View style={riderStyles.routeMapHeaderRow}>
          <View style={riderStyles.routeMapTitleRow}>
            <Camera size={16} color="#38bdf8" />
            <Text style={riderStyles.routeMapTitle}>
              CAPTURED LOAD PHOTO (ROBOFLOW AI)
            </Text>
          </View>
        </View>

        <View style={riderStyles.cameraBoxesContainer}>
          {detectedIndices.map((jugNumber) => {
            return (
              <View key={jugNumber} style={riderStyles.detectedJugBox}>
                <Droplets size={18} color="#34d399" />
                <Text style={riderStyles.detectedJugIndexLabel}>
                  [{jugNumber}]
                </Text>
              </View>
            );
          })}
        </View>

        <View style={riderStyles.aiConfidenceBanner}>
          <CheckCircle2 size={14} color="#34d399" />
          <Text style={riderStyles.aiConfidenceText}>
            {props.order.verifiedCount} containers detected •{' '}
            {props.order.aiConfidencePercent}% AI Confidence
          </Text>
        </View>
      </View>

      {/* 2. Quick Camera Load Presets (6, 8, or 12 Jugs) */}
      <View style={customerStyles.whitePanelCard}>
        <Text style={customerStyles.sectionLabel}>
          SIMULATE CAMERA CAPTURE LOAD
        </Text>
        <View style={riderStyles.stopActionsRow}>
          {[6, 8, 12].map((sampleCount) => {
            const isSelected = props.order.verifiedCount === sampleCount;
            return (
              <Pressable
                key={sampleCount}
                onPress={() => {
                  props.onUpdateVerifiedCount(props.order.id, sampleCount);
                }}
                style={[
                  riderStyles.stopSecondaryButton,
                  isSelected
                    ? { backgroundColor: '#2563eb', borderColor: '#2563eb' }
                    : null,
                ]}
              >
                <RefreshCw
                  size={13}
                  color={isSelected ? '#ffffff' : '#2563eb'}
                />
                <Text
                  style={[
                    riderStyles.stopSecondaryButtonText,
                    isSelected ? { color: '#ffffff' } : null,
                  ]}
                >
                  {sampleCount} Jugs
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 3. Auto-Generated Pre-Dispatch Bill (#INV) */}
      <View style={customerStyles.whitePanelCard}>
        <Text style={customerStyles.sectionLabel}>
          AUTO-GENERATED BILL (PRE-DISPATCH #{props.order.invoiceNumber})
        </Text>

        <View style={customerStyles.billRow}>
          <Text style={customerStyles.billRowLabel}>
            {props.order.verifiedCount} containers refilled (× PHP{' '}
            {props.order.unitPrice})
          </Text>
          <Text style={customerStyles.billRowValue}>
            PHP {billBreakdown.subtotalAmount.toFixed(2)}
          </Text>
        </View>

        <View style={customerStyles.billRow}>
          <Text style={customerStyles.billRowLabel}>Delivery fee</Text>
          <Text style={customerStyles.billRowValue}>
            PHP {billBreakdown.deliveryFee.toFixed(2)}
          </Text>
        </View>

        <View style={customerStyles.billTotalRow}>
          <Text style={customerStyles.billTotalLabel}>TOTAL DUE</Text>
          <Text style={customerStyles.billTotalValue}>
            PHP {billBreakdown.totalDue.toFixed(2)}
          </Text>
        </View>

        <View style={riderStyles.stopActionsRow}>
          <Pressable
            onPress={() => {
              props.onUpdateVerifiedCount(props.order.id, 8);
            }}
            style={riderStyles.stopSecondaryButton}
          >
            <RefreshCw size={15} color="#2563eb" />
            <Text style={riderStyles.stopSecondaryButtonText}>Retake</Text>
          </Pressable>

          <Pressable
            onPress={props.onIssueInvoiceAndProceedToDoorstep}
            style={[riderStyles.stopPrimaryButton, { flex: 2 }]}
          >
            <Zap size={16} color="#ffffff" />
            <Text style={riderStyles.stopPrimaryButtonText}>
              ISSUE INVOICE #{props.order.invoiceNumber}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
