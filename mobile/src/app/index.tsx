/**
 * ============================================================================
 * FILE: src/app/index.tsx
 * PURPOSE: Root Screen Controller for the LG Nature's Water Rider Mobile App.
 *          - Dedicated to Delivery Riders managing their active order queues.
 *          - Seamlessly switches between Deliveries Manifest, AI Photo Scanner,
 *            and Doorstep Official Receipt.
 *          - Connected to NestJS + PostgreSQL at EXPO_PUBLIC_API_URL.
 *          - Strict Lucide icons (lucide-react-native).
 * ============================================================================
 */

import {
  Camera,
  CheckCircle2,
  ClipboardList,
  Droplets,
  LogOut,
  Receipt,
  Truck,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MobileLoginScreen } from '../components/auth/MobileLoginScreen';
import { RiderAiPhotoCountScreen } from '../components/rider/RiderAiPhotoCountScreen';
import { RiderDeliveriesScreen } from '../components/rider/RiderDeliveriesScreen';
import { RiderDoorstepReceiptScreen } from '../components/rider/RiderDoorstepReceiptScreen';
import {
  DEMO_MOBILE_USERS,
  INITIAL_MOBILE_ORDERS,
} from '../data/mobileInitialData';
import {
  clearMobileAccessToken,
  convertMobileOrderToReceiptOnBackend,
  fetchMobileSyncFromBackend,
  loginMobileUserWithPhone,
  MOBILE_BACKEND_API_URL,
  updateMobileOrderAiCountOnBackend,
} from '../services/mobileApiService';
import { sharedStyles } from '../styles/theme.styles';
import type {
  MobileOrderItem,
  MobileUserAccount,
  PaymentStateType,
  RiderTabName,
} from '../types/mobile.types';

export default function MobileApplicationIndexScreen() {
  // Authentication & Active Role State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<MobileUserAccount>(
    DEMO_MOBILE_USERS.RIDER,
  );

  // Active Tab: DELIVERIES | AI_COUNT | DOORSTEP_OR
  const [activeRiderTab, setActiveRiderTab] =
    useState<RiderTabName>('DELIVERIES');

  // Shared Orders State
  const [orders, setOrders] = useState<MobileOrderItem[]>(
    INITIAL_MOBILE_ORDERS,
  );
  const [selectedRiderOrderId, setSelectedRiderOrderId] =
    useState<string>('ord-1042');

  // Toast Notification Banner State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToastBanner(message: string) {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }

  /**
   * Syncs live orders from PostgreSQL (GET /api/pos/mobile-sync)
   */
  async function syncDataWithPostgreSqlBackend() {
    const syncedData = await fetchMobileSyncFromBackend();
    if (syncedData !== null) {
      setOrders(syncedData.orders);
      if (syncedData.orders.length > 0 && syncedData.orders[0] !== undefined) {
        setSelectedRiderOrderId(syncedData.orders[0].id);
      }
    }
  }

  function getActiveSelectedOrder(): MobileOrderItem | undefined {
    for (let index = 0; index < orders.length; index = index + 1) {
      const candidateOrder = orders[index];
      if (
        candidateOrder !== undefined &&
        candidateOrder.id === selectedRiderOrderId
      ) {
        return candidateOrder;
      }
    }
    return orders[0];
  }

  async function handleLoginSubmit(phoneNumber: string, password: string) {
    setIsSubmittingAuth(true);
    try {
      const loginResult = await loginMobileUserWithPhone(phoneNumber, password);
      setCurrentUser(loginResult.user);
      setIsAuthenticated(true);

      if (loginResult.isBackendConnected) {
        await syncDataWithPostgreSqlBackend();
        showToastBanner(
          `Connected to backend as ${loginResult.user.fullName}`,
        );
      } else {
        showToastBanner(
          `Signed in as ${loginResult.user.fullName} (${loginResult.user.role})`,
        );
      }
    } finally {
      setIsSubmittingAuth(false);
    }
  }

  function handleLogout() {
    clearMobileAccessToken();
    setIsAuthenticated(false);
    setActiveRiderTab('DELIVERIES');
    showToastBanner('Logged out of Rider dispatch terminal.');
  }

  async function handleUpdateOrderVerifiedCount(
    orderId: string,
    newVerifiedCount: number,
  ) {
    setOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.id === orderId) {
          const newSubtotal = newVerifiedCount * ord.unitPrice;
          const newTotal = newSubtotal + ord.deliveryFee;
          return {
            ...ord,
            verifiedCount: newVerifiedCount,
            subtotalAmount: newSubtotal,
            totalDue: newTotal,
            amountPaid: ord.paymentState === 'PAID_CASH' ? newTotal : ord.amountPaid,
          };
        }
        return ord;
      }),
    );

    showToastBanner(
      `AI verified ${newVerifiedCount} containers! Order updated.`,
    );

    const remoteSync = await updateMobileOrderAiCountOnBackend(
      orderId,
      newVerifiedCount,
    );
    if (remoteSync !== null) {
      setOrders(remoteSync.orders);
    }
  }

  async function handleConfirmOfficialReceipt(
    orderId: string,
    selectedPaymentState: PaymentStateType,
    amountPaid: number,
    balanceDue: number,
    emptyCollected: number,
  ) {
    const receiptCode = `OR-${orderId.replace(/[^0-9]/g, '') || '1042'}`;

    setOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            documentStage: 'OFFICIAL_RECEIPT',
            receiptNumber: receiptCode,
            paymentState: selectedPaymentState,
            amountPaid: amountPaid,
            balanceDue: balanceDue,
            emptyContainersToPickup: emptyCollected,
          };
        }
        return ord;
      }),
    );

    showToastBanner(
      `Official Receipt #${receiptCode} issued (${selectedPaymentState})!`,
    );

    const remoteSync = await convertMobileOrderToReceiptOnBackend(
      orderId,
      selectedPaymentState,
      amountPaid,
      emptyCollected,
    );
    if (remoteSync !== null) {
      setOrders(remoteSync.orders);
    }
  }

  const activeOrder = getActiveSelectedOrder();

  return (
    <SafeAreaView style={sharedStyles.safeScreenContainer}>
      {/* Toast Notification Banner */}
      {toastMessage !== null && (
        <View style={sharedStyles.toastNotificationBanner}>
          <CheckCircle2 size={16} color="#ffffff" />
          <Text style={sharedStyles.toastNotificationText}>{toastMessage}</Text>
        </View>
      )}

      {!isAuthenticated ? (
        <MobileLoginScreen
          isSubmitting={isSubmittingAuth}
          onLoginSubmit={(phone, pass) => {
            void handleLoginSubmit(phone, pass);
          }}
        />
      ) : (
        <View style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
          {/* Top Status Header */}
          <View
            style={{
              height: 52,
              backgroundColor: '#ffffff',
              borderBottomWidth: 1,
              borderBottomColor: '#e2e8f0',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: '#0284c7',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Droplets size={16} color="#ffffff" />
              </View>
              <View>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>
                  LG Nature&apos;s Water
                </Text>
                <Text style={{ fontSize: 10, color: '#64748b' }}>
                  {currentUser.fullName} · {currentUser.nearestBranchName}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleLogout}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                paddingHorizontal: 9,
                paddingVertical: 5,
                borderRadius: 6,
                backgroundColor: '#f8fafc',
                borderWidth: 1,
                borderColor: '#e2e8f0',
              }}
            >
              <LogOut size={13} color="#64748b" />
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b' }}>
                Sign Out
              </Text>
            </Pressable>
          </View>

          {/* Active Screen Body */}
          <View style={{ flex: 1 }}>
            {activeRiderTab === 'DELIVERIES' && (
              <RiderDeliveriesScreen
                riderName={currentUser.fullName}
                branchName={currentUser.nearestBranchName}
                orders={orders}
                selectedOrderId={selectedRiderOrderId}
                onSelectOrder={(orderId) => setSelectedRiderOrderId(orderId)}
                onSelectOrderForAiCount={(orderId) => {
                  setSelectedRiderOrderId(orderId);
                  setActiveRiderTab('AI_COUNT');
                }}
                onSelectOrderForDoorstepReceipt={(orderId) => {
                  setSelectedRiderOrderId(orderId);
                  setActiveRiderTab('DOORSTEP_OR');
                }}
              />
            )}

            {activeRiderTab === 'AI_COUNT' && (
              <RiderAiPhotoCountScreen
                order={activeOrder}
                onUpdateVerifiedCount={(orderId, newCount) => {
                  void handleUpdateOrderVerifiedCount(orderId, newCount);
                }}
                onIssueInvoiceAndProceedToDoorstep={() => {
                  const invoiceTag = activeOrder?.invoiceNumber ? ` #${activeOrder.invoiceNumber}` : '';
                  showToastBanner(
                    `Pre-Dispatch Invoice${invoiceTag} locked! Ready for doorstep delivery.`,
                  );
                  setActiveRiderTab('DOORSTEP_OR');
                }}
                onBackToDeliveries={() => {
                  setActiveRiderTab('DELIVERIES');
                }}
              />
            )}

            {activeRiderTab === 'DOORSTEP_OR' && (
              <RiderDoorstepReceiptScreen
                order={activeOrder}
                onConfirmOfficialReceipt={(
                  orderId,
                  paymentState,
                  paid,
                  balance,
                  emptyCollected,
                ) => {
                  void handleConfirmOfficialReceipt(
                    orderId,
                    paymentState,
                    paid,
                    balance,
                    emptyCollected,
                  );
                  setActiveRiderTab('DELIVERIES');
                }}
                onSimulateBluetoothThermalPrint={(receiptCode) => {
                  showToastBanner(
                    `Printing #${receiptCode} on 58mm Bluetooth Thermal Printer...`,
                  );
                }}
                onBackToDeliveries={() => {
                  setActiveRiderTab('DELIVERIES');
                }}
              />
            )}
          </View>

          {/* Rider Bottom Navigation Bar */}
          <View style={sharedStyles.bottomTabBar}>
            <Pressable
              onPress={() => {
                setActiveRiderTab('DELIVERIES');
              }}
              style={[
                sharedStyles.bottomTabItem,
                activeRiderTab === 'DELIVERIES'
                  ? sharedStyles.bottomTabItemActive
                  : null,
              ]}
            >
              <Truck
                size={18}
                color={activeRiderTab === 'DELIVERIES' ? '#0284c7' : '#64748b'}
              />
              <Text
                style={[
                  sharedStyles.bottomTabLabel,
                  activeRiderTab === 'DELIVERIES'
                    ? sharedStyles.bottomTabLabelActive
                    : null,
                ]}
              >
                Deliveries
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setActiveRiderTab('AI_COUNT');
              }}
              style={[
                sharedStyles.bottomTabItem,
                activeRiderTab === 'AI_COUNT'
                  ? sharedStyles.bottomTabItemActive
                  : null,
              ]}
            >
              <Camera
                size={18}
                color={activeRiderTab === 'AI_COUNT' ? '#0284c7' : '#64748b'}
              />
              <Text
                style={[
                  sharedStyles.bottomTabLabel,
                  activeRiderTab === 'AI_COUNT'
                    ? sharedStyles.bottomTabLabelActive
                    : null,
                ]}
              >
                AI Scanner
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setActiveRiderTab('DOORSTEP_OR');
              }}
              style={[
                sharedStyles.bottomTabItem,
                activeRiderTab === 'DOORSTEP_OR'
                  ? sharedStyles.bottomTabItemActive
                  : null,
              ]}
            >
              <Receipt
                size={18}
                color={activeRiderTab === 'DOORSTEP_OR' ? '#0284c7' : '#64748b'}
              />
              <Text
                style={[
                  sharedStyles.bottomTabLabel,
                  activeRiderTab === 'DOORSTEP_OR'
                    ? sharedStyles.bottomTabLabelActive
                    : null,
                ]}
              >
                Receipt
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
