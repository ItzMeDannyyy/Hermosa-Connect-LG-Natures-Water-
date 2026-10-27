/**
 * ============================================================================
 * FILE: src/components/customer/CustomerOrderTrackingScreen.tsx
 * PURPOSE: Customer Live Order Tracking & "One Count, Two Documents" View.
 *          Tracks order progression from Station Pre-Dispatch Invoice (#INV)
 *          to Doorstep Official Receipt (#OR).
 *          Strict Lucide icons (lucide-react-native).
 * ============================================================================
 */

import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  Droplets,
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

  // Build array of container indices
  const detectedBoxNumbers: number[] = [];
  for (let index = 1; index <= props.order.verifiedCount; index = index + 1) {
    detectedBoxNumbers.push(index);
  }

  return (
    <ScrollView contentContainerStyle={customerStyles.scrollBody}>
      {/* Top Back Navigation Bar */}
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
              Dual Document Tracking (#INV at station &rarr; #OR at door)
            </Text>
          </View>
        </View>
      </Pressable>

      {/* 1. Three-Stage Delivery Progress Stepper */}
      <View style={customerStyles.whitePanelCard}>
        <Text style={customerStyles.sectionLabel}>Live Delivery Status</Text>

        <View style={customerStyles.progressStepsRow}>
          <View
            style={[
              customerStyles.progressStepBadge,
              customerStyles.progressStepBadgeDone,
            ]}
          >
            <Camera size={13} color="#059669" />
            <Text style={customerStyles.progressStepText}>AI Audited</Text>
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
              size={13}
              color={isOfficialReceiptIssued ? '#059669' : '#0284c7'}
            />
            <Text style={customerStyles.progressStepText}>In Transit</Text>
          </View>

          <View
            style={[
              customerStyles.progressStepBadge,
              isOfficialReceiptIssued ? customerStyles.progressStepBadgeDone : null,
            ]}
          >
            <Receipt
              size={13}
              color={isOfficialReceiptIssued ? '#059669' : '#94a3b8'}
            />
            <Text style={customerStyles.progressStepText}>Delivered &amp; OR</Text>
          </View>
        </View>

        {/* Live Rider ETA Preview */}
        <View style={customerStyles.miniMapPreviewBox}>
          <View style={customerStyles.miniMapTitleRow}>
            <View style={customerStyles.greetingRow}>
              <Navigation size={14} color="#38bdf8" />
              <Text style={customerStyles.miniMapEtaText}>
                {isOfficialReceiptIssued
                  ? `Delivered by Rider ${props.order.assignedRiderName}`
                  : `Rider ${props.order.assignedRiderName} is en route (ETA ~4 min)`}
              </Text>
            </View>
          </View>
          <Text style={customerStyles.miniMapSubText}>
            Corridor: Station 1 &rarr; Pansol St, Quezon City ({props.order.scheduledTimeSlot})
          </Text>
        </View>
      </View>

      {/* 2. Smart Billing Document Card */}
      <View style={customerStyles.whitePanelCard}>
        <View style={customerStyles.usualOrderHeaderRow}>
          <View style={customerStyles.usualOrderTitleRow}>
            <FileText
              size={17}
              color={isOfficialReceiptIssued ? '#059669' : '#0284c7'}
            />
            <Text style={customerStyles.usualOrderTitle}>
              {isOfficialReceiptIssued
                ? `OFFICIAL RECEIPT #${props.order.receiptNumber}`
                : `PRE-DISPATCH INVOICE #${props.order.invoiceNumber}`}
            </Text>
          </View>
        </View>

        <Text style={customerStyles.secondaryActionSub}>
          Issued {props.order.createdAtLabel} &bull; Verified by Gemini AI Vision (
          {props.order.aiConfidencePercent}% confidence)
        </Text>

        {/* AI Verified Containers Grid */}
        <View style={customerStyles.aiPhotoThumbnailBox}>
          <View style={customerStyles.greetingRow}>
            <Droplets size={13} color="#34d399" />
            <Text style={customerStyles.miniMapSubText}>
              Audit: {props.order.verifiedCount} Containers Verified on Vehicle
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

        {/* Itemized Billing Breakdown */}
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
          <View style={[customerStyles.reminderNoticeBox, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
            <CheckCircle2 size={16} color="#059669" />
            <Text style={[customerStyles.reminderNoticeText, { color: '#065f46' }]}>
              Official Receipt #{props.order.receiptNumber} confirmed. Paid PHP{' '}
              {props.order.amountPaid.toFixed(2)} &bull; Balance Due: PHP{' '}
              {props.order.balanceDue.toFixed(2)} ({props.order.paymentState})
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <View style={customerStyles.reminderNoticeBox}>
              <Clock size={16} color="#b45309" />
              <Text style={customerStyles.reminderNoticeText}>
                Status: In Transit. Converts automatically to BIR Official Receipt #OR-
                {props.order.orderNumber} upon doorstep payment confirmation.
              </Text>
            </View>

            <Pressable
              onPress={props.onSimulateRiderDoorstepArrival}
              style={customerStyles.oneClickOrderButton}
            >
              <CheckCircle2 size={16} color="#ffffff" />
              <Text style={customerStyles.oneClickOrderButtonText}>
                CONFIRM DOORSTEP RECEIPT (#OR-{props.order.orderNumber})
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
