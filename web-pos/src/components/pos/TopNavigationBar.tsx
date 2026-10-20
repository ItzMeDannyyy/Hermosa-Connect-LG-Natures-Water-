/**
 * ============================================================================
 * FILE: src/components/pos/TopNavigationBar.tsx
 * PURPOSE: Clean, balanced single-row Top Navigation Bar for the Station POS.
 *          - Left: Proportioned Logo Placeholder + Colored slight-cursive
 *            "LG Nature's Water" title + compact branch location badge.
 *          - Center: Perfectly aligned horizontal navigation tab bar.
 *          - Right: Uniformly sized action buttons + User Profile dropdown.
 *          - Styled with Tailwind CSS and Lucide SVG icons strictly.
 * ============================================================================
 */

import {
  ChevronDown,
  Droplets,
  FileBarChart,
  LogOut,
  MapPin,
  Monitor,
  RefreshCw,
  UserPlus,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import type {
  StationBranch,
  UserAccount,
  UserRole,
} from '../../types/auth.types';

interface TopNavigationBarProps {
  currentUser: UserAccount;
  currentBranch: StationBranch | null;
  onOpenStaffModal: () => void;
  onOpenEndOfDayModal: () => void;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
}

export function TopNavigationBar(props: TopNavigationBarProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);

  // Extract a clean, short station label (e.g., "Station 1 • Main Hub")
  const rawBranchName =
    props.currentBranch !== null ? props.currentBranch.name : 'Station 1';
  const shortStationLabel = rawBranchName.includes('—')
    ? rawBranchName.split('—')[1]!.trim()
    : rawBranchName;

  /**
   * Builds a 2-letter avatar initial from the user's full name (e.g., "Danny" -> "DA")
   */
  function getUserInitials(fullName: string): string {
    const cleanName = fullName.replace(/\(.*\)/g, '').trim();
    const parts = cleanName.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  }

  /**
   * Formats the user's role into a clean, human-readable label
   */
  function getReadableRoleLabel(role: UserRole): string {
    if (role === 'OPERATOR') {
      return 'Station Operator';
    }
    if (role === 'RIDER') {
      return 'Delivery Rider';
    }
    return 'Customer';
  }

  function handleToggleProfileMenu() {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  }

  function handleMenuActionAndClose(actionCallback: () => void) {
    setIsProfileMenuOpen(false);
    actionCallback();
  }

  return (
    <header className="sticky top-0 z-40 bg-[#07192d]/95 backdrop-blur-md text-white border-b border-white/10 shadow-md">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* ====================================================================
            1. LEFT ZONE: COMPACT LOGO PLACEHOLDER + BRAND TITLE + BRANCH PILL
            ==================================================================== */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          {/* Proportioned 40x40px Logo Placeholder */}
          <div
            title="Logo Placeholder — Replace with LG Nature's Water Official Logo"
            className="w-10 h-10 shrink-0 rounded-xl border border-dashed border-sky-400/50 bg-sky-500/10 flex flex-col items-center justify-center text-sky-300"
          >
            <Droplets size={15} className="text-sky-300" />
            <span className="text-[7px] font-extrabold tracking-widest uppercase text-sky-200/80 leading-none mt-0.5">
              LOGO
            </span>
          </div>

          {/* Colored Slight-Cursive Brand Name + Subtle Branch Pill */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex flex-col justify-center">
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                }}
                className="text-2xl sm:text-[1.65rem] font-bold italic tracking-tight leading-none whitespace-nowrap"
              >
                <span className="bg-gradient-to-br from-sky-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  LG{' '}
                </span>
                <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  Nature&apos;s{' '}
                </span>
                <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                  Water
                </span>
              </h1>
            </div>

            {/* Subtle Vertical Divider + Branch Location Pill (Hidden on very small screens) */}
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/15">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] font-semibold text-slate-300 whitespace-nowrap">
                <MapPin size={12} className="text-sky-400 shrink-0" />
                <span>{shortStationLabel}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ====================================================================
            2. CENTER ZONE: CLEAN SEGMENTED NAVIGATION TABS
            ==================================================================== */}
        <nav
          className="inline-flex items-center bg-slate-950/60 border border-white/10 p-1 rounded-xl gap-1"
          aria-label="Main Navigation"
        >
          <NavLink
            to="/pos/dashboard"
            className={({ isActive }) =>
              `inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`
            }
          >
            <Monitor size={14} />
            <span>Orders &amp; Counter POS</span>
          </NavLink>

          <NavLink
            to="/pos/accountability"
            className={({ isActive }) =>
              `inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`
            }
          >
            <RefreshCw size={14} />
            <span>Container &amp; Balance Ledger</span>
          </NavLink>
        </nav>

        {/* ====================================================================
            3. RIGHT ZONE: UNIFORM H-9 ACTION BUTTONS + USER PROFILE MENU
            ==================================================================== */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={props.onOpenStaffModal}
            className="h-9 px-3 rounded-lg bg-white/[0.07] hover:bg-white/[0.14] border border-white/15 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <UserPlus size={14} className="text-sky-300" />
            <span className="hidden sm:inline">Add Staff</span>
          </button>

          <button
            type="button"
            onClick={props.onOpenEndOfDayModal}
            className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs transition-colors cursor-pointer"
          >
            <FileBarChart size={14} />
            <span className="hidden sm:inline">End-of-Day Report</span>
          </button>

          <div className="w-px h-5 bg-white/15 mx-1" />

          {/* User Avatar Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={handleToggleProfileMenu}
              aria-expanded={isProfileMenuOpen}
              className="h-9 pl-1.5 pr-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                {getUserInitials(props.currentUser.fullName)}
              </span>
              <span className="hidden lg:inline text-xs font-bold text-slate-100 max-w-[110px] truncate">
                {props.currentUser.fullName.replace(/\(.*\)/g, '').trim()}
              </span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {isProfileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileMenuOpen(false)}
                />

                <div className="absolute right-0 top-[calc(100%+10px)] w-64 bg-white text-slate-900 border border-slate-200 rounded-xl shadow-xl p-2 z-50">
                  <div className="px-3 py-2.5 flex flex-col gap-0.5">
                    <strong className="text-sm font-bold text-slate-900">
                      {props.currentUser.fullName}
                    </strong>
                    <span className="text-xs text-slate-500">
                      {props.currentUser.phoneNumber}
                    </span>
                    <span className="mt-1 self-start bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full text-[11px] font-bold">
                      {getReadableRoleLabel(props.currentUser.role)}
                    </span>
                  </div>

                  <div className="h-px bg-slate-200 my-1.5" />

                  <button
                    type="button"
                    onClick={() =>
                      handleMenuActionAndClose(props.onOpenStaffModal)
                    }
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <UserPlus size={15} />
                    <span>Provision Station Staff</span>
                  </button>

                  <div className="h-px bg-slate-200 my-1.5" />

                  {/* Tucked-away Demo Role Switcher */}
                  <div className="px-3 py-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      <Zap size={12} />
                      <span>Demo Preview Mode</span>
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleMenuActionAndClose(() =>
                            props.onSwitchRole('OPERATOR'),
                          )
                        }
                        className={`py-1.5 px-2 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                          props.currentUser.role === 'OPERATOR'
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Operator
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleMenuActionAndClose(() =>
                            props.onSwitchRole('RIDER'),
                          )
                        }
                        className={`py-1.5 px-2 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                          props.currentUser.role === 'RIDER'
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Rider
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleMenuActionAndClose(() =>
                            props.onSwitchRole('CUSTOMER'),
                          )
                        }
                        className={`py-1.5 px-2 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                          props.currentUser.role === 'CUSTOMER'
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Customer
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-slate-200 my-1.5" />

                  <button
                    type="button"
                    onClick={() => handleMenuActionAndClose(props.onLogout)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
