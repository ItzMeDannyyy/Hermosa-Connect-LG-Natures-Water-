/**
 * ============================================================================
 * FILE: src/components/rider/RiderDoorstepReceiptScreen.tsx
 * PURPOSE: Implements Wireframe R3 (Doorstep Proof of Delivery & 4-State Smart
 *          Receipt — Features 05 & 06).
 *          - Converts #INV to Official Receipt #OR with zero re-encoding
 *          - Adapts to PAID_CASH, E_PAYMENT, PARTIAL, or UNPAID_CHARGE_SLIP
 *          - Shows Live Thermal Smart Receipt Preview (#OR) + Print / Send
 *          - Uses Lucide icons (lucide-react-native) strictly.
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
  Send,
  Smartphone,
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
import { customerStyles } from '../../styles/customer.styles';
import { riderStyles } from '../../styles/rider.styles';
import type {
  MobileOrderItem,
  PaymentStateType,
} from '../../types/mobile.types';

interface RiderDoorstepReceiptScreenProps {
  order: MobileOrderItem;
  onConfirmOfficialReceipt: (
    orderId: string,
    selectedPaymentState: PaymentStateType,
    amountPaid: number,
    balanceDue: number,
    emptyCollectedCount: number,
  ) => void;
  onSimulateBluetoothThermalPrint: (receiptCode: string) => void;
  onBackToRoute: () => void;
}

export function RiderDoorstepReceiptScreen(
  props: RiderDoorstepReceiptScreenProps,
) {
  const [selectedPaymentState, setSelectedPaymentState] =
    useState<PaymentStateType>(props.order.paymentState);
  const [emptyCollected, setEmptyCollected] = useState<number>(
    props.order.emptyContainersToPickup,
  );
  const [partialPaidInput, setPartialPaidInput] = useState<string>(
    String(props.order.amountPaid),
  );

  const parsedPartialPaid = Number(partialPaidInput);
  const safePartialPaid = Number.isNaN(parsedPartialPaid)
    ? 0
    : parsedPartialPaid;

  const paymentComputation = calculateDoorstepPaymentAmounts(
    props.order.totalDue,
    selectedPaymentState,
    safePartialPaid,
  );

  const officialReceiptCode = `OR-${props.order.orderNumber}`;

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
      props.order.id,
      selectedPaymentState,
      paymentComputation.amountPaid,
      paymentComputation.balanceDue,
      emptyCollected,
    );
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
              Confirm Delivery • #{props.order.invoiceNumber} -&gt; #
              {officialReceiptCode}
            </Text>
            <Text style={customerStyles.secondaryActionSub}>
              Customer: {props.order.customerName} • Zero re-encoding
            </Text>
          </View>
        </View>
      </Pressable>

      {/* 1. Locked AI Count & Empty Containers Collected Stepper */}
      <View style={customerStyles.whitePanelCard}>
        <View style={customerStyles.billRow}>
          <Text style={customerStyles.billRowLabel}>Verified Refill Count</Text>
          <Text style={customerStyles.billRowValue}>
            {props.order.verifiedCount} Refills (Locked by AI)
          </Text>
        </View>

        <View style={customerStyles.billRow}>
          <Text style={customerStyles.billRowLabel}>
            Empty Containers Collected
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable
              onPress={() => {
                handleAdjustEmptyCollected(-1);
              }}
              style={customerStyles.stepperButton}
            >
              <Minus size={15} color="#0f172a" />
            </Pressable>
            <Text style={customerStyles.billRowValue}>{emptyCollected}</Text>
            <Pressable
              onPress={() => {
                handleAdjustEmptyCollected(1);
              }}
              style={customerStyles.stepperButton}
            >
              <Plus size={15} color="#0f172a" />
            </Pressable>
          </View>
        </View>

        <View style={customerStyles.billTotalRow}>
          <Text style={customerStyles.billTotalLabel}>Total Due</Text>
          <Text style={customerStyles.billTotalValue}>
            PHP {props.order.totalDue.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* 2. Select 4-State Payment at Doorstep */}
      <View style={customerStyles.whitePanelCard}>
        <Text style={customerStyles.sectionLabel}>
          SELECT PAYMENT STATE AT DOORSTEP
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
                selectedPaymentState === 'PAID_CASH' ? '#2563eb' : '#475569'
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
              PAID (CASH)
            </Text>
          </Pressable>

          {/* State 2: E_PAYMENT */}
          <Pressable
            onPress={() => {
              setSelectedPaymentState('E_PAYMENT');
            }}
            style={[
              riderStyles.paymentStateButton,
              selectedPaymentState === 'E_PAYMENT'
                ? riderStyles.paymentStateButtonActive
                : null,
            ]}
          >
            <Smartphone
              size={15}
              color={
                selectedPaymentState === 'E_PAYMENT' ? '#2563eb' : '#475569'
              }
            />
            <Text
              style={[
                riderStyles.paymentStateButtonText,
                selectedPaymentState === 'E_PAYMENT'
                  ? riderStyles.paymentStateButtonTextActive
                  : null,
              ]}
            >
              E-PAY (GCASH)
            </Text>
          </Pressable>

          {/* State 3: PARTIAL */}
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
              color={selectedPaymentState === 'PARTIAL' ? '#2563eb' : '#475569'}
            />
            <Text
              style={[
                riderStyles.paymentStateButtonText,
                selectedPaymentState === 'PARTIAL'
                  ? riderStyles.paymentStateButtonTextActive
                  : null,
              ]}
            >
              PARTIAL
            </Text>
          </Pressable>

          {/* State 4: UNPAID_CHARGE_SLIP */}
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
                  ? '#2563eb'
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
              UNPAID SLIP
            </Text>
          </Pressable>
        </View>

        {selectedPaymentState === 'PARTIAL' && (
          <View style={{ marginTop: 6, gap: 6 }}>
            <Text style={authStyles.fieldLabel}>Amount Paid Now (PHP)</Text>
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
            <Text style={customerStyles.secondaryActionSub}>
              Balance Carried Automatically: PHP{' '}
              {paymentComputation.balanceDue.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {/* 3. Live Smart Receipt Preview (#OR) */}
      <View style={customerStyles.whitePanelCard}>
        <Text style={customerStyles.sectionLabel}>
          LIVE SMART RECEIPT PREVIEW (#{officialReceiptCode})
        </Text>

        <View style={riderStyles.thermalReceiptPaper}>
          <Text style={riderStyles.thermalReceiptTitle}>
            LG NATURE&apos;S WATER
          </Text>
          <Text style={riderStyles.thermalReceiptSubtitle}>
            OFFICIAL RECEIPT #{officialReceiptCode}
          </Text>

          <View style={customerStyles.billRow}>
            <Text style={customerStyles.billRowLabel}>Customer:</Text>
            <Text style={customerStyles.billRowValue}>
              {props.order.customerName}
            </Text>
          </View>

          <View style={customerStyles.billRow}>
            <Text style={customerStyles.billRowLabel}>Rider / Branch:</Text>
            <Text style={customerStyles.billRowValue}>
              {props.order.assignedRiderName} • Station 1
            </Text>
          </View>

          <View style={customerStyles.billRow}>
            <Text style={customerStyles.billRowLabel}>
              {props.order.verifiedCount} containers refilled
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
            <Text style={customerStyles.billTotalLabel}>TOTAL</Text>
            <Text style={customerStyles.billTotalValue}>
              PHP {props.order.totalDue.toFixed(2)}
            </Text>
          </View>

          <View style={customerStyles.billRow}>
            <Text style={customerStyles.billRowLabel}>Amount Paid</Text>
            <Text style={customerStyles.billRowValue}>
              PHP {paymentComputation.amountPaid.toFixed(2)}
            </Text>
          </View>

          <View style={customerStyles.billRow}>
            <Text style={customerStyles.billRowLabel}>Balance Due</Text>
            <Text
              style={[
                customerStyles.billRowValue,
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

        {/* Print & Issue Receipt Buttons */}
        <View style={riderStyles.stopActionsRow}>
          <Pressable
            onPress={() => {
              props.onSimulateBluetoothThermalPrint(officialReceiptCode);
            }}
            style={riderStyles.stopSecondaryButton}
          >
            <Printer size={15} color="#2563eb" />
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
              Send &amp; Issue #{officialReceiptCode}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
