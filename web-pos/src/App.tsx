/**
 * ============================================================================
 * FILE: src/App.tsx
 * PURPOSE: Root Component for the LG Nature's Water Station Counter Web POS.
 *          Redesigned according to tasteskill v2 framed-sheet principles:
 *          - Clean, engineered tinted ground (#f1f5f9) and inset work surface.
 *          - High touch-accuracy and zero AI-slop ornaments.
 *          - Strict Lucide vector icons (lucide-react), zero Unicode emojis.
 * ============================================================================
 */

import {
  Droplets,
  LogOut,
  ShieldAlert,
  Store,
  Truck,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { OperatorLoginPage } from './components/auth/OperatorLoginPage';
import { ProtectedOperatorRoute } from './components/auth/ProtectedOperatorRoute';
import { StaffRegistrationModal } from './components/auth/StaffRegistrationModal';
import { DeliveryCustomersModalDrawer } from './components/delivery/DeliveryCustomersModalDrawer';
import { DeliveryCustomersSpreadsheetPage } from './components/delivery/DeliveryCustomersSpreadsheetPage';
import { EndOfDayReportModal } from './components/pos/EndOfDayReportModal';
import {
  FloatingToastNotification,
  type ToastNotificationData,
  type ToastVariant,
} from './components/pos/FloatingToastNotification';
import { LiveOrderQueuePanel } from './components/pos/LiveOrderQueuePanel';
import { ProfitTrackerCards } from './components/pos/ProfitTrackerCards';
import { RegisterCustomerModalDrawer } from './components/pos/RegisterCustomerModalDrawer';
import { TopNavigationBar } from './components/pos/TopNavigationBar';
import { TransactionLogsPanel } from './components/pos/TransactionLogsPanel';
import {
  INITIAL_POS_ORDERS,
  calculateProfitSummaryMetrics,
  filterActiveOrders,
} from './data/initialPosData';
import {
  fetchCurrentUserProfile,
  getSavedAccessToken,
  logoutFromBackend,
  switchDemoRoleOnBackend,
  verifyOperatorAccessOnBackend,
} from './services/authApiService';
import {
  convertInvoiceToReceiptOnBackend,
  createPosOrderOnBackend,
  fetchPosDashboardFromBackend,
  type CreateOrderBackendInput,
} from './services/posApiService';
import type {
  AuthSuccessResponse,
  StationBranch,
  UserAccount,
  UserRole,
} from './types/auth.types';
import type {
  PaymentState,
  PosOrderItem,
} from './types/pos.types';

function PosApplicationRouterContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication & Role State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [currentBranch, setCurrentBranch] = useState<StationBranch | null>(
    null,
  );
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [rbacBackendStatus, setRbacBackendStatus] = useState<string | null>(
    null,
  );

  // Modal & Toast State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [isEndOfDayModalOpen, setIsEndOfDayModalOpen] =
    useState<boolean>(false);
  const [isRegisterDrawerOpen, setIsRegisterDrawerOpen] =
    useState<boolean>(false);
  const [isDeliveryCustomersDrawerOpen, setIsDeliveryCustomersDrawerOpen] =
    useState<boolean>(false);
  const [notificationToast, setNotificationToast] =
    useState<ToastNotificationData | null>(null);

  // Live POS Orders State
  const [orders, setOrders] = useState<PosOrderItem[]>(INITIAL_POS_ORDERS);

  /**
   * Loads live POS orders from NestJS GET /api/pos/dashboard
   */
  async function loadPosDataFromPostgreSql() {
    try {
      const dashboardData = await fetchPosDashboardFromBackend();
      setOrders(dashboardData.orders);
    } catch {
      // Fallback to initial data if backend is offline or unauthorized
    }
  }

  /**
   * On initial page load, check if we have a saved JWT Access Token in localStorage
   * and validate it against NestJS GET /api/auth/me
   */
  useEffect(() => {
    async function restoreExistingSession() {
      const savedToken = getSavedAccessToken();
      if (!savedToken) {
        setIsCheckingSession(false);
        return;
      }

      try {
        const profileData = await fetchCurrentUserProfile();
        setCurrentUser(profileData.user);
        setCurrentBranch(profileData.branch);

        if (profileData.user.role === 'OPERATOR') {
          await loadPosDataFromPostgreSql();
        }
      } catch {
        setCurrentUser(null);
        setCurrentBranch(null);
      } finally {
        setIsCheckingSession(false);
      }
    }

    void restoreExistingSession();
  }, []);

  function showToastNotification(
    message: string,
    variant: ToastVariant = 'success',
    durationMs: number = 4000,
  ) {
    setNotificationToast({
      id: Date.now(),
      message: message,
      variant: variant,
      durationMs: durationMs,
    });
  }

  const handleDismissToast = useCallback(() => {
    setNotificationToast(null);
  }, []);

  async function handleLoginSuccess(authData: AuthSuccessResponse) {
    setCurrentUser(authData.user);
    setCurrentBranch(authData.branch);

    try {
      const verifyResponse = await verifyOperatorAccessOnBackend();
      setRbacBackendStatus(verifyResponse.message);
      await loadPosDataFromPostgreSql();
      navigate('/pos/dashboard');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Forbidden by NestJS RolesGuard';
      setRbacBackendStatus(message);
      navigate('/unauthorized');
    }
  }

  async function handleQuickRoleSwitch(targetRole: UserRole) {
    try {
      const authData = await switchDemoRoleOnBackend(targetRole);
      await handleLoginSuccess(authData);
      showToastNotification(
        `Switched session to ${authData.user.fullName} (${authData.user.role})`,
        'info',
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to switch role.';
      showToastNotification(message, 'error');
    }
  }

  async function handleLogout() {
    await logoutFromBackend();
    setCurrentUser(null);
    setCurrentBranch(null);
    setRbacBackendStatus(null);
    navigate('/login');
  }

  async function handleConvertInvoiceToReceipt(
    orderId: string,
    selectedPaymentState: PaymentState,
  ) {
    try {
      const updatedDashboard = await convertInvoiceToReceiptOnBackend(
        orderId,
        selectedPaymentState,
      );
      setOrders(updatedDashboard.orders);
      showToastNotification(
        `Official Receipt issued (${selectedPaymentState})! Order completed and archived.`,
        'success',
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to convert receipt.';
      showToastNotification(message, 'error');
    }
  }

  async function handleAddNewPosOrder(newOrderInput: CreateOrderBackendInput) {
    try {
      const updatedDashboard = await createPosOrderOnBackend(newOrderInput);
      setOrders(updatedDashboard.orders);
      showToastNotification(
        `Order logged for ${newOrderInput.customerName} (${newOrderInput.containerCount} containers)`,
        'success',
      );
    } catch {
      // Local fallback for offline mode
      const nextNum = 1042 + orders.length;
      const subtotal =
        newOrderInput.subtotalAmount ?? newOrderInput.containerCount * 20;
      const newOrder: PosOrderItem = {
        id: `order-${nextNum}`,
        orderNumber: String(nextNum),
        customerName: newOrderInput.customerName,
        customerPhone: newOrderInput.customerPhone ?? '+639170000000',
        deliveryAddress: 'Station Counter Walk-In',
        presetName: newOrderInput.presetName,
        unitPrice: Math.round(subtotal / Math.max(1, newOrderInput.containerCount)),
        verifiedCount: newOrderInput.containerCount,
        emptyContainersToPickup: newOrderInput.emptyContainersToPickup,
        scheduledTimeSlot: '1:00 – 3:00 PM',
        status: 'DELIVERED',
        documentStage: 'OFFICIAL_RECEIPT',
        invoiceNumber: `INV-${nextNum}`,
        receiptNumber: `OR-${nextNum}`,
        paymentState: newOrderInput.paymentState,
        subtotalAmount: subtotal,
        deliveryFee: 0,
        totalDue: subtotal,
        amountPaid:
          newOrderInput.paymentState === 'PAID_CASH'
            ? subtotal
            : (newOrderInput.partialAmountPaid ?? 0),
        balanceDue:
          newOrderInput.paymentState === 'PAID_CASH'
            ? 0
            : Math.max(0, subtotal - (newOrderInput.partialAmountPaid ?? 0)),
        netProfit: subtotal,
        assignedRiderName: 'Walk-In Counter',
        invoicedAt: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        deliveredAt: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        orderDate: new Date().toISOString().slice(0, 10),
        createdAtIso: new Date().toISOString(),
      };
      setOrders((prev) => [newOrder, ...prev]);
      showToastNotification(
        `Walk-in refill logged (#OR-${nextNum}) for ${newOrderInput.customerName}!`,
        'success',
      );
    }
  }

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] text-[#0f172a]">
        <div className="flex items-center gap-2.5 text-[14px] font-semibold">
          <Droplets size={20} className="text-[#0284c7]" />
          <span>Connecting to LG Nature&apos;s Water POS...</span>
        </div>
      </div>
    );
  }

  const profitMetrics = calculateProfitSummaryMetrics(orders);
  const activeOrdersCount = filterActiveOrders(orders).length;
  const nextOrderNumber = 1042 + orders.length;

  function renderPosShell(pageContent: React.ReactNode) {
    if (currentUser === null) {
      return null;
    }

    return (
      <div className="app-frame">
        <TopNavigationBar
          currentUser={currentUser}
          currentBranch={currentBranch}
          activeOrdersCount={activeOrdersCount}
          onOpenStaffModal={() => setIsStaffModalOpen(true)}
          onOpenEndOfDayModal={() => setIsEndOfDayModalOpen(true)}
          onOpenRegisterCustomer={() => setIsRegisterDrawerOpen(true)}
          onOpenDeliveryCustomers={() => setIsDeliveryCustomersDrawerOpen(true)}
          onSwitchRole={handleQuickRoleSwitch}
          onLogout={handleLogout}
        />

        <FloatingToastNotification
          toast={notificationToast}
          onDismiss={handleDismissToast}
        />

        {/* Framed Inset Work Surface */}
        <main className="p-4 sm:p-6 max-w-[1560px] w-full mx-auto flex flex-col gap-5 flex-1">
          {/* Top Ledger Strip */}
          <ProfitTrackerCards metrics={profitMetrics} />

          {/* Page Work Surface */}
          <div key={location.pathname} className="pos-page-transition w-full">
            {pageContent}
          </div>
        </main>

        <StaffRegistrationModal
          isOpen={isStaffModalOpen}
          branchName={
            currentBranch?.name ?? "LG Nature's Water — Station 1 (Main Hub)"
          }
          onClose={() => setIsStaffModalOpen(false)}
        />

        <EndOfDayReportModal
          isOpen={isEndOfDayModalOpen}
          branchName={
            currentBranch?.name ?? "LG Nature's Water — Station 1 (Main Hub)"
          }
          operatorName={currentUser.fullName}
          metrics={profitMetrics}
          onClose={() => setIsEndOfDayModalOpen(false)}
        />

        {/* Pinned Right Tabs for Quick POS Entry & Delivery Customers */}
        <button
          type="button"
          onClick={() => setIsRegisterDrawerOpen(true)}
          className="edge-pos-trigger"
          title="Open Walk-In Counter POS"
          aria-label="Walk-In POS"
        >
          <div className="edge-pos-trigger__pip" />
          <Droplets size={15} className="text-[#38bdf8]" />
          <span className="edge-pos-trigger__label">
            Walk-In POS
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsDeliveryCustomersDrawerOpen(true)}
          className="edge-delivery-trigger"
          title="Add Delivery Customers & Barangay Rotation"
          aria-label="Add Delivery Customers"
        >
          <div className="edge-delivery-trigger__pip" />
          <Truck size={15} className="text-[#38bdf8]" />
          <span className="edge-delivery-trigger__label">
            Add Delivery Customers
          </span>
        </button>

        {/* Register Customer Drawer */}
        <RegisterCustomerModalDrawer
          isOpen={isRegisterDrawerOpen}
          onClose={() => setIsRegisterDrawerOpen(false)}
          nextOrderNumber={nextOrderNumber}
          onAddNewPosOrder={handleAddNewPosOrder}
        />

        {/* Delivery Customers Drawer */}
        <DeliveryCustomersModalDrawer
          isOpen={isDeliveryCustomersDrawerOpen}
          onClose={() => setIsDeliveryCustomersDrawerOpen(false)}
          onNotification={(msg, variant) => showToastNotification(msg, variant)}
        />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          currentUser !== null ? (
            currentUser.role === 'OPERATOR' ? (
              <Navigate to="/pos/dashboard" replace />
            ) : (
              <Navigate to="/unauthorized" replace />
            )
          ) : (
            <OperatorLoginPage onLoginSuccess={handleLoginSuccess} />
          )
        }
      />
      <Route
        path="/login"
        element={
          currentUser !== null ? (
            currentUser.role === 'OPERATOR' ? (
              <Navigate to="/pos/dashboard" replace />
            ) : (
              <Navigate to="/unauthorized" replace />
            )
          ) : (
            <OperatorLoginPage onLoginSuccess={handleLoginSuccess} />
          )
        }
      />

      <Route
        path="/pos/dashboard"
        element={
          <ProtectedOperatorRoute currentUser={currentUser}>
            {renderPosShell(
              <LiveOrderQueuePanel
                orders={orders}
                onConvertInvoiceToReceipt={handleConvertInvoiceToReceipt}
                onOpenRegisterCustomer={() => setIsRegisterDrawerOpen(true)}
              />,
            )}
          </ProtectedOperatorRoute>
        }
      />

      <Route
        path="/pos/logs"
        element={
          <ProtectedOperatorRoute currentUser={currentUser}>
            {renderPosShell(
              <TransactionLogsPanel
                orders={orders}
                onOpenRegisterCustomer={() => setIsRegisterDrawerOpen(true)}
              />,
            )}
          </ProtectedOperatorRoute>
        }
      />

      <Route
        path="/pos/delivery-customers"
        element={
          <ProtectedOperatorRoute currentUser={currentUser}>
            {renderPosShell(
              <DeliveryCustomersSpreadsheetPage
                orders={orders}
                onOpenAddCustomer={() => setIsDeliveryCustomersDrawerOpen(true)}
              />,
            )}
          </ProtectedOperatorRoute>
        }
      />

      {/* Unauthorized Access Page */}
      <Route
        path="/unauthorized"
        element={
          currentUser === null ? (
            <Navigate to="/login" replace />
          ) : (
            <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] p-4 text-[13px]">
              <div className="bg-white rounded-[10px] p-6 max-w-lg w-full border border-[#cbd5e1]">
                <div className="inline-flex items-center gap-1.5 bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] px-2.5 py-0.5 rounded-[4px] text-[11px] font-semibold mb-3">
                  <ShieldAlert size={13} />
                  <span>RBAC Guard: Operator Role Required</span>
                </div>
                <h2 className="text-[18px] font-semibold text-[#0f172a] mb-1">
                  Counter POS Restricted to Station Operators
                </h2>
                <p className="text-[12px] text-[#64748b] mb-4">
                  Authenticated as <strong>{currentUser.fullName}</strong> ({currentUser.role}). Station operational access and EOD reconciliations require operator credentials.
                  {rbacBackendStatus && (
                    <span className="block mt-1 font-mono text-[11px] text-[#b91c1c]">
                      {rbacBackendStatus}
                    </span>
                  )}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-primary text-[12px] py-1.5"
                    onClick={() => handleQuickRoleSwitch('OPERATOR')}
                  >
                    <Store size={14} />
                    <span>Switch to Station Operator</span>
                  </button>
                  <button
                    type="button"
                    className="btn-secondary text-[12px] py-1.5"
                    onClick={handleLogout}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )
        }
      />

      <Route path="*" element={<Navigate to="/pos/dashboard" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <PosApplicationRouterContent />
    </BrowserRouter>
  );
}

export default App;
