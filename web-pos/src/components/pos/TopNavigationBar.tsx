/**
 * ============================================================================
 * FILE: src/components/pos/TopNavigationBar.tsx
 * PURPOSE: Station Top Navigation Bar adhering to tasteskill framed-sheet design.
 *          - Quiet 56px height with clean, functional spacing.
 *          - Clear product mark: LG Nature's Water · Station #01 (Loyola Heights).
 *          - Tabbed navigation (Orders & Queue, Transaction Logs)
 *            with quiet active underlines.
 *          - Quick station utility actions: New Order, End-of-Day Z-Reading.
 *          - Strictly Lucide vector icons, zero Unicode emojis.
 * ============================================================================
 */

import {
  ChevronDown,
  Droplets,
  FileBarChart,
  LogOut,
  Monitor,
  Plus,
  ReceiptText,
  ShieldCheck,
  Truck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type {
  StationBranch,
  UserAccount,
  UserRole,
} from '../../types/auth.types';

interface TopNavigationBarProps {
  currentUser: UserAccount;
  currentBranch: StationBranch | null;
  activeOrdersCount?: number;
  onOpenStaffModal: () => void;
  onOpenEndOfDayModal: () => void;
  onOpenRegisterCustomer?: () => void;
  onOpenDeliveryCustomers?: () => void;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
}

export function TopNavigationBar(props: TopNavigationBarProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const location = useLocation();

  const isLogs = location.pathname.startsWith('/pos/logs');
  const isDeliveryCustomers = location.pathname.startsWith('/pos/delivery-customers');
  const isDashboard = !isLogs && !isDeliveryCustomers;

  const rawBranchName =
    props.currentBranch !== null ? props.currentBranch.name : 'Station 1';
  const shortStationLabel = rawBranchName.includes('—')
    ? rawBranchName.split('—')[1]!.trim()
    : rawBranchName;

  function getUserInitials(fullName: string): string {
    const cleanName = fullName.replace(/\(.*\)/g, '').trim();
    const parts = cleanName.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  }

  function getReadableRoleLabel(role: UserRole): string {
    if (role === 'OPERATOR') {
      return 'Station Operator';
    }
    return 'Delivery Rider';
  }

  function handleToggleProfileMenu() {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  }

  function handleMenuActionAndClose(actionCallback: () => void) {
    setIsProfileMenuOpen(false);
    actionCallback();
  }

  return (
    <header className="sticky top-0 z-40 bg-[#ffffff] border-b border-[#e2e8f0]">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* ====================================================================
            1. BRAND IDENTITY & STATION SCOPE
            ==================================================================== */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-[6px] bg-[#0284c7] text-white flex items-center justify-center shrink-0">
            <Droplets size={17} strokeWidth={2.2} />
          </div>

          <div className="flex flex-col">
            <span className="text-[14px] font-semibold tracking-tight text-[#0f172a] leading-none">
              LG Nature&apos;s Water
            </span>
            <span className="text-[11px] text-[#64748b] flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
              <span className="truncate max-w-[200px] sm:max-w-[300px]">
                {shortStationLabel}
              </span>
            </span>
          </div>
        </div>

        {/* ====================================================================
            2. CENTER NAVIGATION TABS (Framed-sheet underline tabs)
            ==================================================================== */}
        <nav
          className="hidden md:flex items-center h-full gap-1 select-none"
          aria-label="POS Operational Navigation"
        >
          <Link
            to="/pos/dashboard"
            className={`h-full px-3.5 inline-flex items-center gap-2 text-[13px] font-medium border-b-2 transition-colors ${
              isDashboard
                ? 'border-[#0284c7] text-[#0f172a] font-semibold'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <Monitor size={15} />
            <span>Orders &amp; Queue</span>
            {typeof props.activeOrdersCount === 'number' && props.activeOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#fef3c7] text-[#92400e] num-mono">
                {props.activeOrdersCount}
              </span>
            )}
          </Link>

          <Link
            to="/pos/logs"
            className={`h-full px-3.5 inline-flex items-center gap-2 text-[13px] font-medium border-b-2 transition-colors ${
              isLogs
                ? 'border-[#0284c7] text-[#0f172a] font-semibold'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <ReceiptText size={15} />
            <span>Transaction Logs</span>
          </Link>

          <Link
            to="/pos/delivery-customers"
            className={`h-full px-3.5 inline-flex items-center gap-2 text-[13px] font-medium border-b-2 transition-colors ${
              isDeliveryCustomers
                ? 'border-[#0284c7] text-[#0f172a] font-semibold'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <Users size={15} />
            <span>Delivery Customers</span>
          </Link>
        </nav>

        {/* ====================================================================
            3. ACTION UTILITIES & OPERATOR PROFILE
            ==================================================================== */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick End of Day Report Button */}
          <button
            type="button"
            onClick={props.onOpenEndOfDayModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#e2e8f0] bg-[#ffffff] hover:bg-[#f8fafc] text-[#334155] text-[12px] font-medium cursor-pointer transition-colors"
            title="Open End-of-Day Z-Reading Report"
          >
            <FileBarChart size={14} className="text-[#0284c7]" />
            <span>EOD Report</span>
          </button>

          {/* Quick Add Delivery Customers Button */}
          {props.onOpenDeliveryCustomers && (
            <button
              type="button"
              onClick={props.onOpenDeliveryCustomers}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#bae6fd] bg-[#f0f9ff] hover:bg-[#e0f2fe] text-[#0369a1] text-[12px] font-semibold cursor-pointer transition-colors"
              title="Add Delivery Customers & Manage Barangay Rotation"
            >
              <Truck size={14} className="text-[#0284c7]" />
              <span>Delivery Customers</span>
            </button>
          )}

          {/* Quick Walk-In Order Button */}
          {props.onOpenRegisterCustomer && (
            <button
              type="button"
              onClick={props.onOpenRegisterCustomer}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#0f172a] hover:bg-[#1e293b] text-[#ffffff] text-[12px] font-semibold cursor-pointer transition-colors"
              title="Open Walk-In Counter POS"
            >
              <Plus size={14} />
              <span>Walk-In POS</span>
            </button>
          )}

          {/* Operator Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={handleToggleProfileMenu}
              aria-expanded={isProfileMenuOpen}
              className="h-8.5 pl-2 pr-2.5 rounded-[6px] border border-[#e2e8f0] bg-[#ffffff] hover:bg-[#f8fafc] text-[#0f172a] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span className="w-6 h-6 rounded-[4px] bg-[#f1f5f9] text-[#334155] font-semibold text-[11px] flex items-center justify-center shrink-0 num-mono">
                {getUserInitials(props.currentUser.fullName)}
              </span>
              <span className="hidden sm:inline-block text-[12px] font-medium text-[#0f172a] max-w-[120px] truncate">
                {props.currentUser.fullName.replace(/\(.*\)/g, '').trim()}
              </span>
              <ChevronDown size={13} className="text-[#64748b]" />
            </button>

            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-1.5 w-60 bg-white border border-[#cbd5e1] rounded-[8px] shadow-sm py-1.5 z-50 text-[12px]"
                role="menu"
              >
                <div className="px-3 py-2 border-b border-[#f1f5f9]">
                  <p className="font-semibold text-[#0f172a] truncate">
                    {props.currentUser.fullName}
                  </p>
                  <p className="text-[11px] text-[#64748b]">
                    {getReadableRoleLabel(props.currentUser.role)} ·{' '}
                    {props.currentUser.phoneNumber}
                  </p>
                </div>

                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase text-[#94a3b8] tracking-wider">
                    Staff Management
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleMenuActionAndClose(props.onOpenStaffModal)
                    }
                    className="w-full px-3 py-1.5 text-left text-[#334155] hover:bg-[#f8fafc] flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus size={14} className="text-[#64748b]" />
                    <span>Provision Staff Account</span>
                  </button>
                </div>

                <div className="border-t border-[#f1f5f9] py-1">
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase text-[#94a3b8] tracking-wider">
                    Quick Role Switch
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleMenuActionAndClose(() =>
                        props.onSwitchRole('OPERATOR'),
                      )
                    }
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between cursor-pointer ${
                      props.currentUser.role === 'OPERATOR'
                        ? 'bg-[#f0f9ff] text-[#0284c7] font-semibold'
                        : 'text-[#334155] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <span>Station Operator</span>
                    {props.currentUser.role === 'OPERATOR' && (
                      <ShieldCheck size={13} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleMenuActionAndClose(() =>
                        props.onSwitchRole('RIDER'),
                      )
                    }
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between cursor-pointer ${
                      props.currentUser.role === 'RIDER'
                        ? 'bg-[#f0f9ff] text-[#0284c7] font-semibold'
                        : 'text-[#334155] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <span>Delivery Rider</span>
                    {props.currentUser.role === 'RIDER' && (
                      <ShieldCheck size={13} />
                    )}
                  </button>
                </div>

                <div className="border-t border-[#f1f5f9] pt-1">
                  <button
                    type="button"
                    onClick={() => handleMenuActionAndClose(props.onLogout)}
                    className="w-full px-3 py-1.5 text-left text-[#b91c1c] hover:bg-[#fef2f2] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
