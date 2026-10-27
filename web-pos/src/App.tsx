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
  UserPlus,
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
import { CustomerAccountabilityTable } from './components/pos/CustomerAccountabilityTable';
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
  INITIAL_CUSTOMER_ACCOUNTABILITY,
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
  sendCustomerPickupReminderOnBackend,
  settleCustomerBalanceOnBackend,
  type CreateOrderBackendInput,
} from './services/posApiService';
import type {
  AuthSuccessResponse,
  StationBranch,
  UserAccount,
  UserRole,
} from './types/auth.types';
import type {
  CustomerAccountabilityRecord,
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
  const [notificationToast, setNotificationToast] =
    useState<ToastNotificationData | null>(null);

  // Live POS Orders & Customer Accountability State
  const [orders, setOrders] = useState<PosOrderItem[]>(INITIAL_POS_ORDERS);
  const [customerRecords, setCustomerRecords] = useState<
    CustomerAccountabilityRecord[]
  >(INITIAL_CUSTOMER_ACCOUNTABILITY);

  /**
   * Loads live POS orders and customer accountability records from NestJS
   * GET http://localhost:3000/api/pos/dashboard
   */
  async function loadPosDataFromPostgreSql() {
    try {
      const dashboardData = await fetchPosDashboardFromBackend();
      setOrders(dashboardData.orders);
      setCustomerRecords(dashboardData.customerRecords);
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
      setCustomerRecords(updatedDashboard.customerRecords);
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
      setCustomerRecords(updatedDashboard.customerRecords);
      showToastNotification(
        `Order logged for ${newOrderInput.customerName} (${newOrderInput.containerCount} containers)`,
        'success',
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create order.';
      showToastNotification(message, 'error');
    }
  }

  async function handleSettleCustomerBalance(profileId: string) {
    try {
      const updatedDashboard = await settleCustomerBalanceOnBackend(profileId);
      setOrders(updatedDashboard.orders);
      setCustomerRecords(updatedDashboard.customerRecords);
      showToastNotification(
        'Customer unpaid balance marked as settled!',
        'success',
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to settle balance.';
      showToastNotification(message, 'error');
    }
  }

  function handleSimulateRiderRouteOptimization() {
    showToastNotification(
      'Smart Routing: Sequenced delivery stops along Katipunan & Pansol St for Rider J. Cruz.',
      'info',
    );
  }

  async function handleTriggerPickupReminder(
    profileId: string,
    customerName: string,
    isRemindAgain: boolean,
  ) {
    const timeLabel = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setCustomerRecords((prevRecords) =>
      prevRecords.map((rec) =>
        rec.id === profileId
          ? { ...rec, pickupReminderSent: true, lastRemindedAt: timeLabel }
          : rec,
      ),
    );

    showToastNotification(
      isRemindAgain
        ? `Sent follow-up container pickup reminder to ${customerName}!`
        : `Sent container pickup reminder via SMS to ${customerName}!`,
      'success',
    );

    try {
      const updatedDashboard =
        await sendCustomerPickupReminderOnBackend(profileId);
      setOrders(updatedDashboard.orders);
      setCustomerRecords(updatedDashboard.customerRecords);
    } catch {
      // Keep optimistic local state offline
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
          <ProfitTrackerCards
            metrics={profitMetrics}
            customerRecords={customerRecords}
          />

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

        {/* Pinned Right Tab for Quick POS Entry */}
        <button
          type="button"
          onClick={() => setIsRegisterDrawerOpen(true)}
          className="edge-pos-trigger"
          title="Open Counter POS Register"
          aria-label="Register Customer & Counter POS"
        >
          <div className="edge-pos-trigger__pip" />
          <UserPlus size={15} className="text-[#38bdf8]" />
          <span className="edge-pos-trigger__label">
            Counter POS
          </span>
        </button>

        {/* Register Customer Drawer */}
        <RegisterCustomerModalDrawer
          isOpen={isRegisterDrawerOpen}
          onClose={() => setIsRegisterDrawerOpen(false)}
          nextOrderNumber={nextOrderNumber}
          onAddNewPosOrder={handleAddNewPosOrder}
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
                onSimulateRiderRouteOptimization={
                  handleSimulateRiderRouteOptimization
                }
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
        path="/pos/accountability"
        element={
          <ProtectedOperatorRoute currentUser={currentUser}>
            {renderPosShell(
              <CustomerAccountabilityTable
                records={customerRecords}
                onSettleCustomerBalance={handleSettleCustomerBalance}
                onTriggerPickupReminder={handleTriggerPickupReminder}
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
                  Authenticated as <strong>{currentUser.fullName}</strong> ({currentUser.role}). Station operational margins, utilities, and EOD reconciliations require operator credentials.
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
