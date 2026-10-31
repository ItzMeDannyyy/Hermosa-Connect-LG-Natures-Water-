/**
 * ============================================================================
 * FILE: src/components/rider/RiderDoorstepReceiptScreen.tsx
 * PURPOSE: Doorstep Proof of Delivery & Cash-Only Smart Receipt.
 *          Converts Station Pre-Dispatch Invoice (#INV) into Official
 *          Receipt (#OR) with 3 cash payment states (Cash COD, Partial, Charge Slip),
 *          empty jug return tracking, and 58mm thermal print preview.
 *          Strict Lucide icons (lucide-react-native).
 * ============================================================================
 */

import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  ClipboardList,
  Minus,
  PieChart,
  Plus,
  Printer,
  Receipt,
  Send,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { calculateDoorstepPaymentAmounts } from '../../data/mobileInitialData';
import { authStyles } from '../../styles/auth.styles';
import { cardStyles } from '../../styles/card.styles';
import { riderStyles } from '../../styles/rider.styles';
import type {
  MobileOrderItem,
  PaymentStateType,
} from '../../types/mobile.types';

interface RiderDoorstepReceiptScreenProps {
  order?: MobileOrderItem | null;
  onConfirmOfficialReceipt: (
    orderId: string,
    selectedPaymentState: PaymentStateType,
    amountPaid: number,
    balanceDue: number,
    emptyCollectedCount: number,
  ) => void;
  onSimulateBluetoothThermalPrint: (receiptCode: string) => void;
  onBackToDeliveries: () => void;
}

export function RiderDoorstepReceiptScreen(
  props: RiderDoorstepReceiptScreenProps,
) {
  const [selectedPaymentState, setSelectedPaymentState] =
    useState<PaymentStateType>(props.order?.paymentState ?? 'PAID_CASH');
  const [emptyCollected, setEmptyCollected] = useState<number>(
    props.order?.emptyContainersToPickup ?? 0,
  );
  const [partialPaidInput, setPartialPaidInput] = useState<string>(
    String(props.order?.amountPaid ?? 0),
  );

  if (!props.order) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#f1f5f9',
          padding: 24,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Receipt size={40} color="#94a3b8" />
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: '#0f172a',
            marginTop: 12,
          }}
        >
          No Delivery Order Selected
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: '#64748b',
            textAlign: 'center',
            marginTop: 6,
            marginBottom: 20,
            lineHeight: 18,
          }}
        >
          There are currently no active deliveries in your manifest to generate a doorstep receipt. Select an order from your deliveries queue.
        </Text>
        <Pressable
          onPress={props.onBackToDeliveries}
          style={{
            backgroundColor: '#0284c7',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700' }}>
            Back to Deliveries
          </Text>
        </Pressable>
      </View>
    );
  }

  const currentOrder = props.order;

  const parsedPartialPaid = Number(partialPaidInput);
  const safePartialPaid = Number.isNaN(parsedPartialPaid)
    ? 0
    : parsedPartialPaid;

  const paymentComputation = calculateDoorstepPaymentAmounts(
    currentOrder.totalDue,
    selectedPaymentState,
    safePartialPaid,
  );

  const officialReceiptCode = `OR-${currentOrder.orderNumber}`;

  function handleAdjustEmptyCollected(delta: number) {
    let nextValue = emptyCollected + delta;
    if (nextValue < 0) {
      nextValue = 0;
    }
    if (nextValue > 50) {
      nextValue = 50;
    }
    setEmptyCollected(nextValue);
  }

  function handleConfirmAndSendReceipt() {
    props.onConfirmOfficialReceipt(
      currentOrder.id,
      selectedPaymentState,
      paymentComputation.amountPaid,
      paymentComputation.balanceDue,
      emptyCollected,
    );
  }

  return (
    <ScrollView contentContainerStyle={riderStyles.scrollBody}>
      {/* Top Back Navigation Bar */}
      <Pressable
        onPress={props.onBackToDeliveries}
        style={cardStyles.secondaryActionCard}
      >
        <View style={cardStyles.secondaryActionLeft}>
          <ArrowLeft size={18} color="#0f172a" />
          <View>
            <Text style={cardStyles.secondaryActionTitle}>
              Confirm Delivery &bull; Order #{currentOrder.orderNumber}
            </Text>
            <Text style={cardStyles.secondaryActionSub}>
              Customer: {currentOrder.customerName} &bull; #{currentOrder.invoiceNumber} &rarr; #{officialReceiptCode}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* 1. Verified Load & Empty Containers Collected */}
      <View style={cardStyles.whitePanelCard}>
        <View style={cardStyles.billRow}>
          <Text style={cardStyles.billRowLabel}>AI Verified Refills</Text>
          <Text style={cardStyles.billRowValue}>
            {currentOrder.verifiedCount} Containers Refilled
          </Text>
        </View>

        <View style={cardStyles.billRow}>
          <Text style={cardStyles.billRowLabel}>
            Empty Carboys Collected
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable
              onPress={() => {
                handleAdjustEmptyCollected(-1);
              }}
              disabled={emptyCollected <= 0}
              style={[
                cardStyles.stepperButton,
                emptyCollected <= 0 ? { opacity: 0.4 } : null,
              ]}
            >
              <Minus size={15} color="#0f172a" />
            </Pressable>
            <Text style={[cardStyles.billRowValue, { minWidth: 20, textAlign: 'center' }]}>
              {emptyCollected}
            </Text>
            <Pressable
              onPress={() => {
                handleAdjustEmptyCollected(1);
              }}
              style={cardStyles.stepperButton}
            >
              <Plus size={15} color="#0f172a" />
            </Pressable>
          </View>
        </View>

        <View style={cardStyles.billTotalRow}>
          <Text style={cardStyles.billTotalLabel}>Total Due</Text>
          <Text style={cardStyles.billTotalValue}>
            PHP {currentOrder.totalDue.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* 2. Select Doorstep Payment State */}
      <View style={cardStyles.whitePanelCard}>
        <Text style={cardStyles.sectionLabel}>
          Doorstep Payment State
        </Text>

        <View style={riderStyles.paymentStatesGrid}>
          {/* State 1: PAID_CASH */}
          <Pressable
            onPress={() => {
              setSelectedPaymentState('PAID_CASH');
            }}
            style={[
              riderStyles.paymentStateButton,
              selectedPaymentState === 'PAID_CASH'
                ? riderStyles.paymentStateButtonActive
                : null,
            ]}
          >
            <Banknote
              size={15}
              color={
                selectedPaymentState === 'PAID_CASH' ? '#0284c7' : '#475569'
              }
            />
            <Text
              style={[
                riderStyles.paymentStateButtonText,
                selectedPaymentState === 'PAID_CASH'
                  ? riderStyles.paymentStateButtonTextActive
                  : null,
              ]}
            >
              Cash (COD)
            </Text>
          </Pressable>

          {/* State 2: PARTIAL */}
          <Pressable
            onPress={() => {
              setSelectedPaymentState('PARTIAL');
            }}
            style={[
              riderStyles.paymentStateButton,
              selectedPaymentState === 'PARTIAL'
                ? riderStyles.paymentStateButtonActive
                : null,
            ]}
          >
            <PieChart
              size={15}
              color={selectedPaymentState === 'PARTIAL' ? '#0284c7' : '#475569'}
            />
            <Text
              style={[
                riderStyles.paymentStateButtonText,
                selectedPaymentState === 'PARTIAL'
                  ? riderStyles.paymentStateButtonTextActive
                  : null,
              ]}
            >
              Partial
            </Text>
          </Pressable>

          {/* State 3: UNPAID_CHARGE_SLIP */}
          <Pressable
            onPress={() => {
              setSelectedPaymentState('UNPAID_CHARGE_SLIP');
            }}
            style={[
              riderStyles.paymentStateButton,
              selectedPaymentState === 'UNPAID_CHARGE_SLIP'
                ? riderStyles.paymentStateButtonActive
                : null,
            ]}
          >
            <ClipboardList
              size={15}
              color={
                selectedPaymentState === 'UNPAID_CHARGE_SLIP'
                  ? '#0284c7'
                  : '#475569'
              }
            />
            <Text
              style={[
                riderStyles.paymentStateButtonText,
                selectedPaymentState === 'UNPAID_CHARGE_SLIP'
                  ? riderStyles.paymentStateButtonTextActive
                  : null,
              ]}
            >
              Account Charge
            </Text>
          </Pressable>
        </View>

        {selectedPaymentState === 'PARTIAL' && (
          <View style={{ marginTop: 6, gap: 6 }}>
            <Text style={authStyles.fieldLabel}>Amount Paid Today (PHP)</Text>
            <View style={authStyles.inputRowBox}>
              <TextInput
                value={partialPaidInput}
                onChangeText={(text) => {
                  setPartialPaidInput(text);
                }}
                keyboardType="numeric"
                style={authStyles.textInputField}
              />
            </View>
            <Text style={cardStyles.secondaryActionSub}>
              Remaining balance due: PHP{' '}
              {paymentComputation.balanceDue.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {/* 3. Authentic 58mm Thermal Receipt Preview */}
      <View style={cardStyles.whitePanelCard}>
        <Text style={cardStyles.sectionLabel}>
          Thermal Receipt Preview (#{officialReceiptCode})
        </Text>

        <View style={riderStyles.thermalReceiptPaper}>
          <Text style={riderStyles.thermalReceiptTitle}>
            LG NATURE&apos;S WATER
          </Text>
          <Text style={riderStyles.thermalReceiptSubtitle}>
            BIR OFFICIAL RECEIPT #{officialReceiptCode}
          </Text>

          <View style={cardStyles.billRow}>
            <Text style={cardStyles.billRowLabel}>Customer:</Text>
            <Text style={cardStyles.billRowValue}>
              {currentOrder.customerName}
            </Text>
          </View>

          <View style={cardStyles.billRow}>
            <Text style={cardStyles.billRowLabel}>Rider / Hub:</Text>
            <Text style={cardStyles.billRowValue}>
              {currentOrder.assignedRiderName} &bull; Station 1 Hub
            </Text>
          </View>

          <View style={cardStyles.billRow}>
            <Text style={cardStyles.billRowLabel}>
              {currentOrder.verifiedCount} containers refilled
            </Text>
            <Text style={cardStyles.billRowValue}>
              PHP {currentOrder.subtotalAmount.toFixed(2)}
            </Text>
          </View>

          <View style={cardStyles.billRow}>
            <Text style={cardStyles.billRowLabel}>Delivery fee</Text>
            <Text style={cardStyles.billRowValue}>
              PHP {currentOrder.deliveryFee.toFixed(2)}
            </Text>
          </View>

          <View style={cardStyles.billTotalRow}>
            <Text style={cardStyles.billTotalLabel}>TOTAL DUE</Text>
            <Text style={cardStyles.billTotalValue}>
              PHP {currentOrder.totalDue.toFixed(2)}
            </Text>
          </View>

          <View style={cardStyles.billRow}>
            <Text style={cardStyles.billRowLabel}>Amount Paid</Text>
            <Text style={cardStyles.billRowValue}>
              PHP {paymentComputation.amountPaid.toFixed(2)}
            </Text>
          </View>

          <View style={cardStyles.billRow}>
            <Text style={cardStyles.billRowLabel}>Balance Due</Text>
            <Text
              style={[
                cardStyles.billRowValue,
                paymentComputation.balanceDue > 0
                  ? { color: '#dc2626' }
                  : { color: '#059669' },
              ]}
            >
              PHP {paymentComputation.balanceDue.toFixed(2)}
            </Text>
          </View>

          <View style={riderStyles.thermalStatusStamp}>
            <Text style={riderStyles.thermalStatusStampText}>
              *** {paymentComputation.statusBannerText} ***
            </Text>
          </View>
        </View>

        {/* Print & Confirm Actions */}
        <View style={riderStyles.stopActionsRow}>
          <Pressable
            onPress={() => {
              props.onSimulateBluetoothThermalPrint(officialReceiptCode);
            }}
            style={riderStyles.stopSecondaryButton}
          >
            <Printer size={15} color="#0284c7" />
            <Text style={riderStyles.stopSecondaryButtonText}>
              Print 58mm
            </Text>
          </Pressable>

          <Pressable
            onPress={handleConfirmAndSendReceipt}
            style={[riderStyles.stopPrimaryButton, { flex: 1.5 }]}
          >
            <Send size={15} color="#ffffff" />
            <Text style={riderStyles.stopPrimaryButtonText}>
              Issue #{officialReceiptCode}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
