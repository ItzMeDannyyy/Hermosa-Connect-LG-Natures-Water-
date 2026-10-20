/**
 * ============================================================================
 * FILE: src/App.tsx
 * PURPOSE: Root Component for the LG Nature's Water Station Counter Web POS.
 *          Styled with Tailwind CSS and Lucide icons (lucide-react) strictly.
 * ============================================================================
 */

import {
  Droplets,
  LogOut,
  ShieldAlert,
  Store,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
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
import { QuickCounterRegisterPanel } from './components/pos/QuickCounterRegisterPanel';
import { TopNavigationBar } from './components/pos/TopNavigationBar';
import {
  INITIAL_CUSTOMER_ACCOUNTABILITY,
  INITIAL_POS_ORDERS,
  calculateProfitSummaryMetrics,
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
      // Fallback to initial data if user is not an OPERATOR
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

  /**
   * Helper to trigger a floating toast notification with a countdown progress bar
   */
  function showToastNotification(
    message: string,
    variant: ToastVariant = 'success',
    durationMs: number = 4500,
  ) {
    setNotificationToast({
      id: Date.now(),
      message: message,
      variant: variant,
      durationMs: durationMs,
    });
  }

  /**
   * Dismisses the active floating toast notification
   */
  const handleDismissToast = useCallback(() => {
    setNotificationToast(null);
  }, []);

  /**
   * Called when OperatorLoginPage finishes logging in or switching roles
   */
  async function handleLoginSuccess(authData: AuthSuccessResponse) {
    setCurrentUser(authData.user);
    setCurrentBranch(authData.branch);

    // Verify Operator RBAC Guard on the backend
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

  /**
   * Switches between OPERATOR, RIDER, and CUSTOMER using NestJS POST /api/auth/demo-switch
   */
  async function handleQuickRoleSwitch(targetRole: UserRole) {
    try {
      const authData = await switchDemoRoleOnBackend(targetRole);
      await handleLoginSuccess(authData);
      showToastNotification(
        `Switched active session to ${authData.user.fullName} (${authData.user.role})`,
        'info',
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to switch role.';
      showToastNotification(message, 'error');
    }
  }

  /**
   * Logs out from NestJS and navigates to /login
   */
  async function handleLogout() {
    await logoutFromBackend();
    setCurrentUser(null);
    setCurrentBranch(null);
    setRbacBackendStatus(null);
    navigate('/login');
  }

  /**
   * Converts a pre-dispatch Invoice (#INV) into an Official Receipt (#OR)
   * Calls PATCH /api/pos/orders/:orderId/convert-to-receipt
   */
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
        `Official Receipt issued (${selectedPaymentState})`,
        'success',
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to convert receipt.';
      showToastNotification(message, 'error');
    }
  }

  /**
   * Creates a new POS order
   * Calls POST /api/pos/orders
   */
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

  /**
   * Settles a customer's unpaid balance
   * Calls PATCH /api/pos/customers/:profileId/settle-balance
   */
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

  /**
   * Simulates Google Maps / PostGIS Waypoint Sequencing for active delivery stops
   */
  function handleSimulateRiderRouteOptimization() {
    showToastNotification(
      'Smart Routing: Grouped & sequenced all deliveries + container pickups along Katipunan & Pansol St for Rider J. Cruz!',
      'info',
    );
  }

  /**
   * Sends a day-before or overdue container pickup notification, marks the
   * customer as Reminded (green check), and persists to PostgreSQL if connected.
   */
  async function handleTriggerPickupReminder(
    profileId: string,
    customerName: string,
    isRemindAgain: boolean,
  ) {
    const timeLabel = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Update local state immediately so the row switches to "Reminded" with green check
    setCustomerRecords((previousRecords) => {
      const updatedList: CustomerAccountabilityRecord[] = [];
      for (let i = 0; i < previousRecords.length; i++) {
        const currentRec = previousRecords[i];
        if (currentRec.id === profileId) {
          updatedList.push({
            ...currentRec,
            pickupReminderSent: true,
            lastRemindedAt: timeLabel,
          });
        } else {
          updatedList.push(currentRec);
        }
      }
      return updatedList;
    });

    showToastNotification(
      isRemindAgain
        ? `Sent follow-up pickup reminder again via Push & SMS to ${customerName}!`
        : `Sent container pickup reminder via Push & SMS to ${customerName}!`,
      'success',
    );

    try {
      const updatedDashboard =
        await sendCustomerPickupReminderOnBackend(profileId);
      setOrders(updatedDashboard.orders);
      setCustomerRecords(updatedDashboard.customerRecords);
    } catch {
      // Keep optimistic local "Reminded" state when running offline
    }
  }

  // Show loading indicator while checking existing token on boot
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <h2 className="flex items-center gap-2.5 text-lg font-bold">
          <Droplets size={24} className="text-sky-400" />
          <span>Loading LG Nature&apos;s Water Station POS...</span>
        </h2>
      </div>
    );
  }

  const profitMetrics = calculateProfitSummaryMetrics(orders);
  const nextOrderNumber = 1042 + orders.length;

  /**
   * Shared POS Layout wrapper for /pos/dashboard and /pos/accountability
   */
  function renderPosShell(pageContent: React.ReactNode) {
    if (currentUser === null) {
      return null;
    }

    return (
      <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
        <TopNavigationBar
          currentUser={currentUser}
          currentBranch={currentBranch}
          onOpenStaffModal={() => setIsStaffModalOpen(true)}
          onOpenEndOfDayModal={() => setIsEndOfDayModalOpen(true)}
          onSwitchRole={handleQuickRoleSwitch}
          onLogout={handleLogout}
        />

        <FloatingToastNotification
          toast={notificationToast}
          onDismiss={handleDismissToast}
        />

        <main className="p-4 lg:p-6 max-w-[1600px] w-full mx-auto flex flex-col gap-5">
          <ProfitTrackerCards
            metrics={profitMetrics}
            customerRecords={customerRecords}
          />
          {pageContent}
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
      </div>
    );
  }

  return (
    <Routes>
      {/* Route 1: Public Login Route (/login) */}
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

      {/* Route 2: Protected Operator POS Dashboard (/pos/dashboard — Wireframe W1) */}
      <Route
        path="/pos/dashboard"
        element={
          <ProtectedOperatorRoute currentUser={currentUser}>
            {renderPosShell(
              <div className="grid grid-cols-1 xl:grid-cols-[1.45fr_1fr] gap-5 items-start">
                <LiveOrderQueuePanel
                  orders={orders}
                  onConvertInvoiceToReceipt={handleConvertInvoiceToReceipt}
                  onSimulateRiderRouteOptimization={
                    handleSimulateRiderRouteOptimization
                  }
                />
                <QuickCounterRegisterPanel
                  nextOrderNumber={nextOrderNumber}
                  onAddNewPosOrder={handleAddNewPosOrder}
                />
              </div>,
            )}
          </ProtectedOperatorRoute>
        }
      />

      {/* Route 3: Protected Customer Container & Balance Ledger (/pos/accountability — Wireframe W2) */}
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

      {/* Route 4: RBAC Forbidden Route (/unauthorized) when RIDER or CUSTOMER tries to access Web POS */}
      <Route
        path="/unauthorized"
        element={
          currentUser === null ? (
            <Navigate to="/login" replace />
          ) : (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
              <div className="bg-white rounded-2xl p-8 max-w-xl w-full shadow-2xl border-t-4 border-red-600">
                <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-extrabold mb-3">
                  <ShieldAlert size={14} />
                  <span>
                    NESTJS RBAC MIDDLEWARE &amp; ROLES GUARD ACTIVE (
                    <code className="font-mono">/unauthorized</code>)
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mb-2">
                  Station Counter Web POS is Restricted to Operators
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  You are currently authenticated as{' '}
                  <strong className="text-slate-900">
                    {currentUser.fullName}
                  </strong>{' '}
                  with role{' '}
                  <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono font-bold text-slate-800">
                    {currentUser.role}
                  </code>
                  .
                </p>
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium mb-4">
                  <strong>
                    Backend Response (/api/auth/verify/operator-only &amp;
                    /api/pos/dashboard):
                  </strong>{' '}
                  {rbacBackendStatus ??
                    '403 Forbidden: Access denied. Required role(s): OPERATOR'}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  In <strong>LG Nature&apos;s Water</strong>, Operational Costs
                  (Water, Electricity, Container Wear) and True Net Profit are
                  strictly restricted to <code className="font-mono">OPERATOR</code>{' '}
                  accounts. <code className="font-mono">RIDER</code> and{' '}
                  <code className="font-mono">CUSTOMER</code> accounts use the
                  React Native Mobile App.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-colors cursor-pointer"
                    onClick={() => handleQuickRoleSwitch('OPERATOR')}
                  >
                    <Store size={16} />
                    <span>Switch Back to Station Operator</span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )
        }
      />

      {/* Default Fallback Route -> Redirects to /pos/dashboard */}
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
