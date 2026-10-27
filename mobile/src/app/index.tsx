/**
 * ============================================================================
 * FILE: src/app/index.tsx
 * PURPOSE: Root Screen Controller for the LG Nature's Water Mobile App.
 *          - Connected to NestJS + PostgreSQL at EXPO_PUBLIC_API_URL
 *            (http://10.231.84.70:3000/api)
 *          - Orchestrates all Wireframe Flows (M0, C1-C3, R1-R3) in a clean,
 *            modular, step-by-step structure with zero chained .().() syntax
 *            and strict Lucide icons (lucide-react-native).
 * ============================================================================
 */

import {
  Calendar,
  Camera,
  CheckCircle2,
  Home,
  Map,
  Printer,
  Receipt,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MobileLoginScreen } from '../components/auth/MobileLoginScreen';
import { DemoRoleSwitcherBar } from '../components/common/DemoRoleSwitcherBar';
import { CustomerHomeScreen } from '../components/customer/CustomerHomeScreen';
import { CustomerOrderTrackingScreen } from '../components/customer/CustomerOrderTrackingScreen';
import { CustomerPickupScheduleScreen } from '../components/customer/CustomerPickupScheduleScreen';
import { RiderAiPhotoCountScreen } from '../components/rider/RiderAiPhotoCountScreen';
import { RiderDoorstepReceiptScreen } from '../components/rider/RiderDoorstepReceiptScreen';
import { RiderRouteScreen } from '../components/rider/RiderRouteScreen';
import {
  calculateOrderBillBreakdown,
  DEMO_MOBILE_USERS,
  INITIAL_CUSTOMER_SUMMARY,
  INITIAL_MOBILE_ORDERS,
} from '../data/mobileInitialData';
import {
  clearMobileAccessToken,
  convertMobileOrderToReceiptOnBackend,
  createMobileOrderOnBackend,
  fetchMobileSyncFromBackend,
  loginMobileUserWithPhone,
  MOBILE_BACKEND_API_URL,
  switchMobileDemoRole,
  updateMobileOrderAiCountOnBackend,
} from '../services/mobileApiService';
import { sharedStyles } from '../styles/theme.styles';
import type {
  CustomerAccountSummary,
  CustomerTabName,
  MobileOrderItem,
  MobileUserAccount,
  MobileUserRole,
  PaymentStateType,
  PickupScheduleFormState,
  RiderTabName,
  TimeSlotOption,
} from '../types/mobile.types';

export default function MobileApplicationIndexScreen() {
  // Authentication & Active Role State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<MobileUserAccount>(
    DEMO_MOBILE_USERS.CUSTOMER,
  );

  // Navigation Tab States for Customer (C1, C2, C3) and Rider (R1, R2, R3)
  const [activeCustomerTab, setActiveCustomerTab] =
    useState<CustomerTabName>('HOME');
  const [activeRiderTab, setActiveRiderTab] = useState<RiderTabName>('ROUTE');

  // Shared Orders & Customer Accountability State
  const [orders, setOrders] = useState<MobileOrderItem[]>(
    INITIAL_MOBILE_ORDERS,
  );
  const [selectedRiderOrderId, setSelectedRiderOrderId] =
    useState<string>('ord-1042');
  const [customerSummary, setCustomerSummary] =
    useState<CustomerAccountSummary>(INITIAL_CUSTOMER_SUMMARY);

  // Customer Pickup Schedule State (Screen C2)
  const [pickupSchedule, setPickupSchedule] = useState<PickupScheduleFormState>(
    {
      selectedDayCode: 'TUE_13',
      selectedDayLabel: 'Tuesday, Oct 13',
      selectedTimeSlot: '1:00 – 3:00 PM',
      containersToReturn: 3,
      reminderEnabled: true,
    },
  );

  // Toast Notification Banner State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  /**
   * Displays a temporary notification banner at the top of the screen
   */
  function showToastBanner(message: string) {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }

  /**
   * Syncs live orders and customer records from PostgreSQL (GET /api/pos/mobile-sync)
   */
  async function syncDataWithPostgreSqlBackend() {
    const syncedData = await fetchMobileSyncFromBackend();
    if (syncedData !== null) {
      setOrders(syncedData.orders);
      setCustomerSummary(syncedData.customerSummary);
      if (syncedData.orders.length > 0 && syncedData.orders[0] !== undefined) {
        setSelectedRiderOrderId(syncedData.orders[0].id);
      }
    }
  }

  /**
   * Finds the currently selected order for the Rider or Customer without chained .().()
   */
  function getActiveSelectedOrder(): MobileOrderItem {
    for (let index = 0; index < orders.length; index = index + 1) {
      const candidateOrder = orders[index];
      if (
        candidateOrder !== undefined &&
        candidateOrder.id === selectedRiderOrderId
      ) {
        return candidateOrder;
      }
    }
    return orders[0]!;
  }

  /**
   * Handles logging in from Screen M0 (POST http://10.231.84.70:3000/api/auth/login)
   */
  async function handleLoginSubmit(phoneNumber: string, password: string) {
    setIsSubmittingAuth(true);
    try {
      const loginResult = await loginMobileUserWithPhone(phoneNumber, password);
      setCurrentUser(loginResult.user);
      setIsAuthenticated(true);

      if (loginResult.isBackendConnected) {
        await syncDataWithPostgreSqlBackend();
        showToastBanner(
          `Connected to ${MOBILE_BACKEND_API_URL} as ${loginResult.user.fullName}`,
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

  /**
   * Handles 1-Tap Role Switching from the top Ideathon Demo Bar
   * (POST http://10.231.84.70:3000/api/auth/demo-switch)
   */
  async function handleDemoRoleSwitch(targetRole: MobileUserRole) {
    setIsSubmittingAuth(true);
    try {
      const switchResult = await switchMobileDemoRole(targetRole);
      setCurrentUser(switchResult.user);
      setIsAuthenticated(true);

      if (switchResult.isBackendConnected) {
        await syncDataWithPostgreSqlBackend();
      }

      if (targetRole === 'CUSTOMER') {
        setActiveCustomerTab('HOME');
      } else if (targetRole === 'RIDER') {
        setActiveRiderTab('ROUTE');
      }

      showToastBanner(
        `Switched to ${switchResult.user.fullName} (${switchResult.user.role})`,
      );
    } finally {
      setIsSubmittingAuth(false);
    }
  }

  /**
   * Handles completing the 2-Step Customer Delivery Profile Setup in Screen M0
   */
  async function handleCompleteCustomerSetup(
    fullName: string,
    address: string,
    defaultGallons: number,
  ) {
    const switchResult = await switchMobileDemoRole('CUSTOMER');
    if (switchResult.isBackendConnected) {
      await syncDataWithPostgreSqlBackend();
    }

    const updatedSummary: CustomerAccountSummary = {
      customerName: fullName,
      phoneNumber: '+639170000003',
      address: address,
      nearestStationLabel: 'Station 1 (Main Hub - 0.3km)',
      emptyContainersOut: customerSummary.emptyContainersOut,
      containersDueDateLabel: customerSummary.containersDueDateLabel,
      unpaidBalanceAmount: customerSummary.unpaidBalanceAmount,
      unpaidFromReceiptCode: customerSummary.unpaidFromReceiptCode,
      usualOrderGallons: defaultGallons,
      usualPresetName: customerSummary.usualPresetName,
    };

    setCustomerSummary(updatedSummary);
    setCurrentUser({
      id: switchResult.user.id,
      fullName: fullName,
      phoneNumber: '+639170000003',
      role: 'CUSTOMER',
      address: address,
      nearestBranchName: 'Station 1 (Main Hub)',
      nearestBranchDistanceKm: 0.3,
    });
    setIsAuthenticated(true);
    setActiveCustomerTab('HOME');
    showToastBanner(
      `1-Click Delivery Profile saved for ${fullName} (${defaultGallons} gallons)!`,
    );
  }

  /**
   * Handles Customer 1-Click Usual Order on Screen C1
   * Calls POST http://10.231.84.70:3000/api/pos/orders
   */
  async function handlePlaceOneClickUsualOrder() {
    const usualGallons = customerSummary.usualOrderGallons;

    const backendResult = await createMobileOrderOnBackend({
      customerName: customerSummary.customerName,
      deliveryAddress: customerSummary.address,
      presetName: '5-Gallon Slim Container (Refill)',
      containerCount: usualGallons,
      emptyContainersToPickup: customerSummary.emptyContainersOut,
      scheduledTimeSlot: '1:00 – 3:00 PM',
    });

    if (backendResult !== null && backendResult.orders.length > 0) {
      setOrders(backendResult.orders);
      setCustomerSummary(backendResult.customerSummary);
      const newestOrder = backendResult.orders[0]!;
      setSelectedRiderOrderId(newestOrder.id);
      setActiveCustomerTab('RECEIPTS');
      showToastBanner(
        `Order #${newestOrder.orderNumber} saved to PostgreSQL! Pre-dispatch #${newestOrder.invoiceNumber} ready.`,
      );
      return;
    }

    // Fallback if offline
    const nextOrderNumber = 1042 + orders.length;
    const bill = calculateOrderBillBreakdown(usualGallons);
    const newOrder: MobileOrderItem = {
      id: `ord-${nextOrderNumber}`,
      orderNumber: nextOrderNumber,
      invoiceNumber: `INV-${nextOrderNumber}`,
      receiptNumber: null,
      documentStage: 'INVOICE_ONLY',
      customerName: customerSummary.customerName,
      deliveryAddress: customerSummary.address,
      presetName: '5-Gallon Slim Container (Refill)',
      verifiedCount: usualGallons,
      emptyContainersToPickup: customerSummary.emptyContainersOut,
      unitPrice: 25,
      subtotalAmount: bill.subtotalAmount,
      deliveryFee: bill.deliveryFee,
      totalDue: bill.totalDue,
      paymentState: 'PAID_CASH',
      amountPaid: bill.totalDue,
      balanceDue: 0,
      scheduledTimeSlot: '1:00 – 3:00 PM',
      assignedRiderName: 'J. Cruz',
      aiConfidencePercent: 97,
      stopSequenceNumber: 1,
      createdAtLabel: 'Just now',
    };

    const updatedOrders: MobileOrderItem[] = [newOrder];
    for (let index = 0; index < orders.length; index = index + 1) {
      const existingOrder = orders[index];
      if (existingOrder !== undefined) {
        updatedOrders.push(existingOrder);
      }
    }

    setOrders(updatedOrders);
    setSelectedRiderOrderId(newOrder.id);
    setActiveCustomerTab('RECEIPTS');
    showToastBanner(
      `1-Click Order #${nextOrderNumber} sent to Station 1! Pre-dispatch #${newOrder.invoiceNumber} ready.`,
    );
  }

  /**
   * Updates the selected pickup day on Screen C2
   */
  function handleSelectPickupDay(dayCode: string, dayFullLabel: string) {
    setPickupSchedule({
      selectedDayCode: dayCode,
      selectedDayLabel: dayFullLabel,
      selectedTimeSlot: pickupSchedule.selectedTimeSlot,
      containersToReturn: pickupSchedule.containersToReturn,
      reminderEnabled: pickupSchedule.reminderEnabled,
    });
  }

  /**
   * Updates the selected time window on Screen C2
   */
  function handleSelectPickupTimeSlot(slot: TimeSlotOption) {
    setPickupSchedule({
      selectedDayCode: pickupSchedule.selectedDayCode,
      selectedDayLabel: pickupSchedule.selectedDayLabel,
      selectedTimeSlot: slot,
      containersToReturn: pickupSchedule.containersToReturn,
      reminderEnabled: pickupSchedule.reminderEnabled,
    });
  }

  /**
   * Adjusts the number of empty containers ready for pickup on Screen C2
   */
  function handleAdjustPickupContainerCount(delta: number) {
    let nextCount = pickupSchedule.containersToReturn + delta;
    if (nextCount < 1) {
      nextCount = 1;
    }
    if (nextCount > 30) {
      nextCount = 30;
    }

    setPickupSchedule({
      selectedDayCode: pickupSchedule.selectedDayCode,
      selectedDayLabel: pickupSchedule.selectedDayLabel,
      selectedTimeSlot: pickupSchedule.selectedTimeSlot,
      containersToReturn: nextCount,
      reminderEnabled: pickupSchedule.reminderEnabled,
    });
  }

  /**
   * Confirms the customer's empty container pickup schedule on Screen C2
   */
  function handleConfirmPickupSchedule() {
    showToastBanner(
      `Pickup scheduled for ${pickupSchedule.selectedDayLabel} (${pickupSchedule.selectedTimeSlot}) • ${pickupSchedule.containersToReturn} empty jugs!`,
    );
    setActiveCustomerTab('HOME');
  }

  /**
   * Updates the AI-verified container count on Screen R2
   * Calls PATCH http://10.231.84.70:3000/api/pos/orders/:orderId/ai-count
   */
  async function handleUpdateOrderVerifiedCount(
    orderId: string,
    newCount: number,
  ) {
    const backendResult = await updateMobileOrderAiCountOnBackend(
      orderId,
      newCount,
    );

    if (backendResult !== null) {
      setOrders(backendResult.orders);
      setCustomerSummary(backendResult.customerSummary);
      const bill = calculateOrderBillBreakdown(newCount);
      showToastBanner(
        `PostgreSQL Updated: AI Photo Count = ${newCount} containers (PHP ${bill.totalDue.toFixed(2)})`,
      );
      return;
    }

    const bill = calculateOrderBillBreakdown(newCount);
    const updatedList: MobileOrderItem[] = [];

    for (let index = 0; index < orders.length; index = index + 1) {
      const currentOrder = orders[index];
      if (currentOrder !== undefined) {
        if (currentOrder.id === orderId) {
          updatedList.push({
            ...currentOrder,
            verifiedCount: newCount,
            subtotalAmount: bill.subtotalAmount,
            deliveryFee: bill.deliveryFee,
            totalDue: bill.totalDue,
          });
        } else {
          updatedList.push(currentOrder);
        }
      }
    }

    setOrders(updatedList);
    showToastBanner(
      `Roboflow AI Photo Count updated to ${newCount} containers (PHP ${bill.totalDue.toFixed(2)})`,
    );
  }

  /**
   * Converts Pre-Dispatch Invoice (#INV) to Official Receipt (#OR) on Screen R3 or C3
   * Calls PATCH http://10.231.84.70:3000/api/pos/orders/:orderId/convert-to-receipt
   */
  async function handleConfirmOfficialReceipt(
    orderId: string,
    selectedPaymentState: PaymentStateType,
    amountPaid: number,
    balanceDue: number,
    emptyCollectedCount: number,
  ) {
    const backendResult = await convertMobileOrderToReceiptOnBackend(
      orderId,
      selectedPaymentState,
      amountPaid,
      emptyCollectedCount,
    );

    if (backendResult !== null) {
      setOrders(backendResult.orders);
      setCustomerSummary(backendResult.customerSummary);
      showToastBanner(
        `Official Receipt saved to PostgreSQL (${selectedPaymentState})!`,
      );
      return;
    }

    const updatedList: MobileOrderItem[] = [];

    for (let index = 0; index < orders.length; index = index + 1) {
      const currentOrder = orders[index];
      if (currentOrder !== undefined) {
        if (currentOrder.id === orderId) {
          const officialCode = `OR-${currentOrder.orderNumber}`;
          updatedList.push({
            ...currentOrder,
            receiptNumber: officialCode,
            documentStage: 'OFFICIAL_RECEIPT',
            paymentState: selectedPaymentState,
            amountPaid: amountPaid,
            balanceDue: balanceDue,
            emptyContainersToPickup: emptyCollectedCount,
          });
        } else {
          updatedList.push(currentOrder);
        }
      }
    }

    setOrders(updatedList);
    showToastBanner(
      `Official Receipt issued (${selectedPaymentState}) • Synced with Station 1 POS!`,
    );
  }

  const activeOrder = getActiveSelectedOrder();

  return (
    <SafeAreaView style={sharedStyles.safeScreenContainer}>
      {/* Top Ideathon 1-Tap Role Switcher Bar (Always Accessible) */}
      <DemoRoleSwitcherBar
        activeRole={currentUser.role}
        isAuthenticated={isAuthenticated}
        onSelectRole={handleDemoRoleSwitch}
        onSignOut={() => {
          clearMobileAccessToken();
          setIsAuthenticated(false);
        }}
      />

      {/* Toast Notification Banner */}
      {toastMessage !== null && (
        <View style={sharedStyles.toastNotificationBanner}>
          <CheckCircle2 size={15} color="#ffffff" />
          <Text style={sharedStyles.toastNotificationText}>{toastMessage}</Text>
        </View>
      )}

      {/* ====================================================================
          SCREEN M0: SHARED MOBILE LOGIN & 2-STEP CUSTOMER ONBOARDING
          ==================================================================== */}
      {!isAuthenticated && (
        <MobileLoginScreen
          selectedRole={currentUser.role}
          isSubmitting={isSubmittingAuth}
          onLoginSubmit={handleLoginSubmit}
          onCompleteCustomerSetup={handleCompleteCustomerSetup}
        />
      )}

      {/* ====================================================================
          ROLE 1: CUSTOMER VIEW (SCREENS C1, C2, C3 + BOTTOM TAB BAR)
          ==================================================================== */}
      {isAuthenticated && currentUser.role === 'CUSTOMER' && (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            {activeCustomerTab === 'HOME' && (
              <CustomerHomeScreen
                customerSummary={customerSummary}
                activeOrder={activeOrder}
                onPlaceOneClickUsualOrder={handlePlaceOneClickUsualOrder}
                onNavigateToPickupSchedule={() => {
                  setActiveCustomerTab('PICKUP');
                }}
                onNavigateToOrderTracking={() => {
                  setActiveCustomerTab('RECEIPTS');
                }}
              />
            )}

            {activeCustomerTab === 'PICKUP' && (
              <CustomerPickupScheduleScreen
                emptyContainersOut={customerSummary.emptyContainersOut}
                scheduleForm={pickupSchedule}
                onSelectDay={handleSelectPickupDay}
                onSelectTimeSlot={handleSelectPickupTimeSlot}
                onAdjustContainerCount={handleAdjustPickupContainerCount}
                onConfirmSchedule={handleConfirmPickupSchedule}
                onBackToHome={() => {
                  setActiveCustomerTab('HOME');
                }}
              />
            )}

            {activeCustomerTab === 'RECEIPTS' && (
              <CustomerOrderTrackingScreen
                order={activeOrder}
                onBackToHome={() => {
                  setActiveCustomerTab('HOME');
                }}
                onSimulateRiderDoorstepArrival={() => {
                  void handleConfirmOfficialReceipt(
                    activeOrder.id,
                    activeOrder.paymentState,
                    activeOrder.amountPaid,
                    activeOrder.balanceDue,
                    activeOrder.emptyContainersToPickup,
                  );
                }}
              />
            )}
          </View>

          {/* Customer Bottom Navigation Bar: [Home] [Pickup] [Receipts] */}
          <View style={sharedStyles.bottomTabBar}>
            <Pressable
              onPress={() => {
                setActiveCustomerTab('HOME');
              }}
              style={[
                sharedStyles.bottomTabItem,
                activeCustomerTab === 'HOME'
                  ? sharedStyles.bottomTabItemActive
                  : null,
              ]}
            >
              <Home
                size={18}
                color={activeCustomerTab === 'HOME' ? '#0284c7' : '#64748b'}
              />
              <Text
                style={[
                  sharedStyles.bottomTabLabel,
                  activeCustomerTab === 'HOME'
                    ? sharedStyles.bottomTabLabelActive
                    : null,
                ]}
              >
                Home
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setActiveCustomerTab('PICKUP');
              }}
              style={[
                sharedStyles.bottomTabItem,
                activeCustomerTab === 'PICKUP'
                  ? sharedStyles.bottomTabItemActive
                  : null,
              ]}
            >
              <Calendar
                size={18}
                color={activeCustomerTab === 'PICKUP' ? '#0284c7' : '#64748b'}
              />
              <Text
                style={[
                  sharedStyles.bottomTabLabel,
                  activeCustomerTab === 'PICKUP'
                    ? sharedStyles.bottomTabLabelActive
                    : null,
                ]}
              >
                Schedule
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setActiveCustomerTab('RECEIPTS');
              }}
              style={[
                sharedStyles.bottomTabItem,
                activeCustomerTab === 'RECEIPTS'
                  ? sharedStyles.bottomTabItemActive
                  : null,
              ]}
            >
              <Receipt
                size={18}
                color={activeCustomerTab === 'RECEIPTS' ? '#0284c7' : '#64748b'}
              />
              <Text
                style={[
                  sharedStyles.bottomTabLabel,
                  activeCustomerTab === 'RECEIPTS'
                    ? sharedStyles.bottomTabLabelActive
                    : null,
                ]}
              >
                Tracking
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ====================================================================
          ROLE 2: DELIVERY RIDER VIEW
          ==================================================================== */}
      {isAuthenticated && currentUser.role === 'RIDER' && (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            {activeRiderTab === 'ROUTE' && (
              <RiderRouteScreen
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
                  showToastBanner(
                    `Pre-Dispatch Invoice #${activeOrder.invoiceNumber} locked and sent to Customer!`,
                  );
                  setActiveRiderTab('DOORSTEP_OR');
                }}
                onBackToRoute={() => {
                  setActiveRiderTab('ROUTE');
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
                  setActiveRiderTab('ROUTE');
                }}
                onSimulateBluetoothThermalPrint={(receiptCode) => {
                  showToastBanner(
                    `Printing #${receiptCode} on 58mm Bluetooth Thermal Printer...`,
                  );
                }}
                onBackToRoute={() => {
                  setActiveRiderTab('ROUTE');
                }}
              />
            )}
          </View>

          {/* Rider Bottom Navigation Bar */}
          <View style={sharedStyles.bottomTabBar}>
            <Pressable
              onPress={() => {
                setActiveRiderTab('ROUTE');
              }}
              style={[
                sharedStyles.bottomTabItem,
                activeRiderTab === 'ROUTE'
                  ? sharedStyles.bottomTabItemActive
                  : null,
              ]}
            >
              <Map
                size={18}
                color={activeRiderTab === 'ROUTE' ? '#0284c7' : '#64748b'}
              />
              <Text
                style={[
                  sharedStyles.bottomTabLabel,
                  activeRiderTab === 'ROUTE'
                    ? sharedStyles.bottomTabLabelActive
                    : null,
                ]}
              >
                Manifest
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
