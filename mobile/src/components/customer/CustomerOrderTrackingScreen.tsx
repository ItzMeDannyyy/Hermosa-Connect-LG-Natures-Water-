/**
 * ============================================================================
 * FILE: src/components/customer/CustomerOrderTrackingScreen.tsx
 * PURPOSE: Implements Wireframe C3 (Live Order Status & "One Count, Two
 *          Documents" View — Features 05 & 06).
 *          - Shows 3-Step Progress Tracker (Photo Taken -> Out for Delivery -> Receipt Issued)
 *          - Shows Live Mini-Map Preview & Rider ETA
 *          - Shows Pre-Dispatch Invoice (#INV-1042) with AI Photo Boxed Count
 *            and converts automatically to Official Receipt (#OR-1042)
 *          - Uses Lucide icons (lucide-react-native) strictly.
 * ============================================================================
 */

import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  Navigation,
  Receipt,
  Truck,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { customerStyles } from '../../styles/customer.styles';
import type { MobileOrderItem } from '../../types/mobile.types';

interface CustomerOrderTrackingScreenProps {
  order: MobileOrderItem;
  onBackToHome: () => void;
  onSimulateRiderDoorstepArrival: () => void;
}

export function CustomerOrderTrackingScreen(
  props: CustomerOrderTrackingScreenProps,
) {
  const isOfficialReceiptIssued =
    props.order.documentStage === 'OFFICIAL_RECEIPT';

  // Build explicit array of bounding box numbers [1..N] without complex chained syntax
  const detectedBoxNumbers: number[] = [];
  for (let index = 1; index <= props.order.verifiedCount; index = index + 1) {
    detectedBoxNumbers.push(index);
  }

  return (
    <ScrollView contentContainerStyle={customerStyles.scrollBody}>
      {/* Top Back Bar */}
      <Pressable
        onPress={props.onBackToHome}
        style={customerStyles.secondaryActionCard}
      >
        <View style={customerStyles.secondaryActionLeft}>
          <ArrowLeft size={18} color="#0f172a" />
          <View>
            <Text style={customerStyles.secondaryActionTitle}>
              Active Order #{props.order.orderNumber}
            </Text>
            <Text style={customerStyles.secondaryActionSub}>
              One Count, Two Documents (#INV before dispatch -&gt; #OR at door)
            </Text>
          </View>
        </View>
      </Pressable>

      {/* 1. Three-Stage Order Progress Bar */}
      <View style={customerStyles.whitePanelCard}>
        <Text style={customerStyles.sectionLabel}>LIVE ORDER PROGRESS</Text>
        <View style={customerStyles.progressStepsRow}>
          <View
            style={[
              customerStyles.progressStepBadge,
              customerStyles.progressStepBadgeDone,
            ]}
          >
            <Camera size={14} color="#059669" />
            <Text style={customerStyles.progressStepText}>Photo Taken</Text>
          </View>

          <View
            style={[
              customerStyles.progressStepBadge,
              isOfficialReceiptIssued
                ? customerStyles.progressStepBadgeDone
                : customerStyles.progressStepBadgeCurrent,
            ]}
          >
            <Truck
              size={14}
              color={isOfficialReceiptIssued ? '#059669' : '#2563eb'}
            />
            <Text style={customerStyles.progressStepText}>
              Out for Delivery
            </Text>
          </View>

          <View
            style={[
              customerStyles.progressStepBadge,
              isOfficialReceiptIssued
                ? customerStyles.progressStepBadgeDone
                : null,
            ]}
          >
            <Receipt
              size={14}
              color={isOfficialReceiptIssued ? '#059669' : '#64748b'}
            />
            <Text style={customerStyles.progressStepText}>Receipt Issued</Text>
          </View>
        </View>

        {/* Live Mini-Map Preview */}
        <View style={customerStyles.miniMapPreviewBox}>
          <View style={customerStyles.miniMapTitleRow}>
            <View style={customerStyles.greetingRow}>
              <Navigation size={15} color="#38bdf8" />
              <Text style={customerStyles.miniMapEtaText}>
                {isOfficialReceiptIssued
                  ? `Delivered by Rider ${props.order.assignedRiderName}`
                  : `Rider ${props.order.assignedRiderName} is 2 stops away (4 min)`}
              </Text>
            </View>
          </View>
          <Text style={customerStyles.miniMapSubText}>
            Live Route: Station 1 -&gt; Pansol St Sequenced Corridor (
            {props.order.scheduledTimeSlot})
          </Text>
        </View>
      </View>

      {/* 2. Smart Document Card (#INV before dispatch -> #OR upon delivery) */}
      <View style={customerStyles.whitePanelCard}>
        <View style={customerStyles.usualOrderHeaderRow}>
          <View style={customerStyles.usualOrderTitleRow}>
            <FileText
              size={18}
              color={isOfficialReceiptIssued ? '#059669' : '#2563eb'}
            />
            <Text style={customerStyles.usualOrderTitle}>
              {isOfficialReceiptIssued
                ? `OFFICIAL RECEIPT #${props.order.receiptNumber}`
                : `INVOICE #${props.order.invoiceNumber} (Before Dispatch)`}
            </Text>
          </View>
        </View>

        <Text style={customerStyles.secondaryActionSub}>
          Issued {props.order.createdAtLabel} • Verified by Roboflow AI Photo (
          {props.order.aiConfidencePercent}% confidence)
        </Text>

        {/* AI Photo Boxed Containers Thumbnail Preview */}
        <View style={customerStyles.aiPhotoThumbnailBox}>
          <View style={customerStyles.greetingRow}>
            <Camera size={14} color="#34d399" />
            <Text style={customerStyles.miniMapSubText}>
              Photo Thumbnail: {props.order.verifiedCount} Containers Boxed by
              AI
            </Text>
          </View>

          <View style={customerStyles.boundingBoxesGrid}>
            {detectedBoxNumbers.map((boxNum) => {
              return (
                <View key={boxNum} style={customerStyles.boundingBoxTag}>
                  <Text style={customerStyles.boundingBoxTagText}>
                    [{boxNum}]
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Itemized Billing Lines */}
        <View style={customerStyles.billRow}>
          <Text style={customerStyles.billRowLabel}>
            {props.order.verifiedCount} containers refilled (PHP{' '}
            {props.order.unitPrice}/jug)
          </Text>
          <Text style={customerStyles.billRowValue}>
            PHP {props.order.subtotalAmount.toFixed(2)}
          </Text>
        </View>

        <View style={customerStyles.billRow}>
          <Text style={customerStyles.billRowLabel}>Delivery fee</Text>
          <Text style={customerStyles.billRowValue}>
            PHP {props.order.deliveryFee.toFixed(2)}
          </Text>
        </View>

        <View style={customerStyles.billTotalRow}>
          <Text style={customerStyles.billTotalLabel}>AMOUNT DUE</Text>
          <Text style={customerStyles.billTotalValue}>
            PHP {props.order.totalDue.toFixed(2)}
          </Text>
        </View>

        {isOfficialReceiptIssued ? (
          <View style={customerStyles.reminderNoticeBox}>
            <CheckCircle2 size={18} color="#059669" />
            <Text style={customerStyles.reminderNoticeText}>
              Official Receipt #{props.order.receiptNumber} issued! Paid PHP{' '}
              {props.order.amountPaid.toFixed(2)} • Balance Due: PHP{' '}
              {props.order.balanceDue.toFixed(2)} ({props.order.paymentState})
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <View style={customerStyles.reminderNoticeBox}>
              <Clock size={18} color="#d97706" />
              <Text style={customerStyles.reminderNoticeText}>
                Status: AWAITING DELIVERY — Converts to Official Receipt #OR-
                {props.order.orderNumber} automatically upon doorstep
                confirmation.
              </Text>
            </View>

            <Pressable
              onPress={props.onSimulateRiderDoorstepArrival}
              style={customerStyles.oneClickOrderButton}
            >
              <CheckCircle2 size={17} color="#ffffff" />
              <Text style={customerStyles.oneClickOrderButtonText}>
                Simulate Doorstep Confirmation (-&gt; #OR-
                {props.order.orderNumber})
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
