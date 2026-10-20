/**
 * ============================================================================
 * FILE: src/components/auth/OperatorLoginPage.tsx
 * PURPOSE: Station Operator Authentication Page (Wireframe W0).
 *          - Left Side: Asymmetric brand showcase with a dedicated Logo
 *            Placeholder, large colored "LG Nature's Water" slight-cursive
 *            lettering, and staggered asymmetric placement of the taglines.
 *          - Right Side: Polished Station Operator Sign In card with outer
 *            glass ring, 44x44px Droplets badge + POS Online pill, interactive
 *            focus-aware input icons + password toggle, shift persistence row,
 *            and tactile Demo Switcher pills.
 *          - Styled with Tailwind CSS and Lucide SVG icons strictly.
 * ============================================================================
 */

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Droplets,
  Eye,
  EyeOff,
  FileCheck2,
  Home,
  Image as ImageIcon,
  Lock,
  LogIn,
  Phone,
  RefreshCw,
  ShieldCheck,
  Store,
  TrendingUp,
  Truck,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  loginWithPhoneAndPassword,
  switchDemoRoleOnBackend,
} from '../../services/authApiService';
import type { AuthSuccessResponse, UserRole } from '../../types/auth.types';

interface OperatorLoginPageProps {
  onLoginSuccess: (authData: AuthSuccessResponse) => void;
}

export function OperatorLoginPage(props: OperatorLoginPageProps) {
  const [phoneNumber, setPhoneNumber] = useState<string>('+639170000001');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [keepShiftSignedIn, setKeepShiftSignedIn] = useState<boolean>(true);
  const [selectedDemoRole, setSelectedDemoRole] =
    useState<UserRole>('OPERATOR');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Handles standard Phone Number + Password form submission
   */
  async function handleFormLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await loginWithPhoneAndPassword({
        phoneNumber: phoneNumber,
        password: password,
      });

      props.onLoginSuccess(response);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to sign in.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Handles clicking the Demo Switcher quick-fill/switch pills inside the bottom of the card.
   */
  async function handleSelectDemoRolePill(role: UserRole) {
    setSelectedDemoRole(role);
    setErrorMessage(null);
    setPassword('password123');

    if (role === 'OPERATOR') {
      setPhoneNumber('+639170000001');
    } else if (role === 'RIDER') {
      setPhoneNumber('+639170000002');
    } else {
      setPhoneNumber('+639170000003');
    }

    setIsLoading(true);
    try {
      const response = await switchDemoRoleOnBackend(role);
      props.onLoginSuccess(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to switch demo account.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleTogglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-br from-[#061527] via-[#0a2540] to-[#0d3258] text-white px-6 py-12">
      {/* Subtle Asymmetric Ambient Water Glows in Background */}
      <div className="pointer-events-none absolute -top-28 -left-28 w-96 h-96 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 right-10 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        {/* ====================================================================
            LEFT COLUMN: ASYMMETRIC BRAND SHOWCASE, LOGO PLACEHOLDER,
            COLORED SLIGHT-CURSIVE "LG Nature's Water" & STAGGERED TAGLINES
            ==================================================================== */}
        <div className="lg:col-span-7 flex flex-col">
          {/* 1. Asymmetric Top Row: Logo Placeholder Box + Offset Station Pill */}
          <div className="flex items-end gap-5 mb-5">
            {/* Dedicated Logo Placeholder */}
            <div
              title="Replace with LG Nature's Water Official Logo"
              className="group relative w-20 h-20 rounded-2xl border-2 border-dashed border-sky-400/50 bg-sky-500/10 backdrop-blur-xs flex flex-col items-center justify-center gap-1 text-sky-300 shadow-lg shadow-sky-950/50 -rotate-2 hover:rotate-0 transition-transform"
            >
              <Droplets size={24} className="text-sky-300" />
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold tracking-widest uppercase text-sky-200/90">
                <ImageIcon size={9} />
                <span>LOGO</span>
              </span>
              {/* Subtle corner accent dot */}
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-sky-400 ring-4 ring-[#081d35]" />
            </div>

            {/* Offset Eyebrow Tagline */}
            <div className="pb-1.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-400/15 border border-sky-400/30 text-sky-300 text-[11px] font-bold tracking-widest uppercase">
                <Droplets size={12} />
                <span>STATION COUNTER POS</span>
              </div>
              <p className="text-xs text-sky-200/70 font-medium mt-1.5 pl-1">
                Pure Drinking Water • Refill &amp; Delivery Operations
              </p>
            </div>
          </div>

          {/* 2. Big "LG Nature's Water" Slight Cursive Colored Lettering */}
          <div className="relative">
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}
              className="text-5xl sm:text-6xl xl:text-[4.5rem] font-bold italic tracking-tight leading-[1.04] drop-shadow-[0_4px_24px_rgba(14,165,233,0.28)]"
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

            {/* Asymmetric Offset Primary Tagline Indented to the Right */}
            <div className="mt-4 sm:ml-8 pl-4 sm:pl-5 border-l-2 border-sky-400/50 max-w-xl">
              <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug">
                From Paper Notebook to{' '}
                <span className="text-sky-300 underline decoration-sky-400/40 decoration-wavy underline-offset-4">
                  One Tap Register.
                </span>
              </p>
              <p className="text-slate-300/90 text-sm sm:text-base leading-relaxed mt-1.5">
                Streamline walk-in and delivery orders, automated container
                photo billing, customer jug tracking, and daily profit reports
                in one place.
              </p>
            </div>
          </div>

          {/* 3. Asymmetric Staggered Placement of the 4 Feature Taglines */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-start">
            {/* Tagline Card 1 — Shifted Left / Wide (Cols 1-7) */}
            <div className="sm:col-span-7 rounded-2xl bg-white/[0.08] backdrop-blur-xs border border-white/15 p-4 flex items-start gap-3.5 shadow-lg hover:bg-white/[0.11] transition-colors">
              <div className="w-9 h-9 rounded-xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0 mt-0.5">
                <Zap size={17} />
              </div>
              <div className="flex flex-col">
                <strong className="text-sky-300 text-sm font-bold">
                  Instant Preset Pricing
                </strong>
                <span className="text-slate-200/90 text-xs leading-relaxed mt-0.5">
                  Totals and exact change computed automatically
                </span>
              </div>
            </div>

            {/* Tagline Card 2 — Offset Lower on the Right (Cols 8-12, pushed down) */}
            <div className="sm:col-span-5 sm:translate-y-4 rounded-2xl bg-gradient-to-br from-sky-500/15 to-white/[0.05] backdrop-blur-xs border border-sky-300/25 p-4 flex items-start gap-3 shadow-lg hover:border-sky-300/40 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0 mt-0.5">
                <FileCheck2 size={17} />
              </div>
              <div className="flex flex-col">
                <strong className="text-sky-300 text-sm font-bold">
                  One Count, Two Documents
                </strong>
                <span className="text-slate-200/90 text-xs leading-relaxed mt-0.5">
                  Photo count issues the invoice &amp; delivery receipt
                </span>
              </div>
            </div>

            {/* Tagline Card 3 — Indented Asymmetric Left (Cols 2-6) */}
            <div className="sm:col-start-2 sm:col-span-5 rounded-2xl bg-white/[0.06] backdrop-blur-xs border border-white/15 p-4 flex items-start gap-3 shadow-lg hover:bg-white/[0.1] transition-colors">
              <div className="w-9 h-9 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                <TrendingUp size={17} />
              </div>
              <div className="flex flex-col">
                <strong className="text-emerald-300 text-sm font-bold">
                  True Profit Tracking
                </strong>
                <span className="text-slate-200/90 text-xs leading-relaxed mt-0.5">
                  Deducts water, electricity &amp; container costs live
                </span>
              </div>
            </div>

            {/* Tagline Card 4 — Staggered Lower Right (Cols 7-12, pushed down) */}
            <div className="sm:col-span-6 sm:translate-y-3 rounded-2xl bg-white/[0.08] backdrop-blur-xs border border-white/15 p-4 flex items-start gap-3.5 shadow-lg hover:bg-white/[0.11] transition-colors">
              <div className="w-9 h-9 rounded-xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0 mt-0.5">
                <RefreshCw size={17} />
              </div>
              <div className="flex flex-col">
                <strong className="text-sky-300 text-sm font-bold">
                  Container Accountability
                </strong>
                <span className="text-slate-200/90 text-xs leading-relaxed mt-0.5">
                  Tracks empty gallons out &amp; unpaid customer balances
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================
            RIGHT COLUMN: IMPROVED STATION OPERATOR SIGN IN CARD
            ==================================================================== */}
        <div className="lg:col-span-5">
          {/* 1. Outer Glass Ring */}
          <div className="p-1.5 rounded-3xl bg-gradient-to-b from-white/20 to-white/5 shadow-2xl">
            {/* Inner White Card */}
            <div className="bg-white rounded-2xl p-8 text-slate-900 relative overflow-hidden">
              {/* Top decorative gradient bar inside card */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-emerald-400" />

              {/* 2. Header Lockup: 44x44px Soft Blue Icon Badge + Green POS Online Pill */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-[44px] h-[44px] rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                    <Droplets size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                      Station #01 • Main Hub
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Loyola Heights Counter
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  POS Online
                </span>
              </div>

              {/* 3. Heading & Subtitle */}
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Station Operator Sign In
                </h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Enter your registered mobile number and password to open POS.
                </p>
              </div>

              {errorMessage !== null && (
                <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-3.5 py-3 text-xs font-medium text-red-700 flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 4. Login Form with Focus-Aware Icons, Eye Toggle & Crisp Blue Focus Ring */}
              <form onSubmit={handleFormLoginSubmit} className="space-y-4">
                {/* Mobile Number Field */}
                <div className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="phoneNumber"
                      className="block text-xs font-bold text-slate-700 group-focus-within:text-blue-600 transition-colors"
                    >
                      Mobile Number
                    </label>
                    <span className="text-[11px] font-medium text-slate-400">
                      PH Format (+63)
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                      <Phone size={17} />
                    </span>
                    <input
                      id="phoneNumber"
                      type="text"
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      placeholder="+639170000001"
                      required
                      className="w-full pl-10 pr-24 py-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                    />
                    <span className="absolute inset-y-0 right-2.5 my-auto h-6 px-2 rounded-md bg-slate-200/70 text-[10px] font-bold text-slate-600 flex items-center pointer-events-none">
                      {selectedDemoRole}
                    </span>
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="block text-xs font-bold text-slate-700 group-focus-within:text-blue-600 transition-colors"
                    >
                      Password
                    </label>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                      <ShieldCheck size={12} />
                      <span>Shift Encrypted</span>
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                      <Lock size={17} />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleTogglePasswordVisibility}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Shift Session Persistence Row */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={keepShiftSignedIn}
                      onChange={(event) =>
                        setKeepShiftSignedIn(event.target.checked)
                      }
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-600">
                      Keep counter shift active (8 hrs)
                    </span>
                  </label>

                  <span className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                    Reset PIN?
                  </span>
                </div>

                {/* 5. Full-Width Sign In Button with Blue Drop Shadow */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogIn size={17} />
                  <span>
                    {isLoading ? 'Signing in...' : 'Sign In to Station POS'}
                  </span>
                  <ArrowRight
                    size={15}
                    className="opacity-80 group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </form>

              {/* 6. Integrated Demo Switcher Inside the Bottom of the Card */}
              <div className="border-t border-slate-100 mt-6 pt-5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Demo Switcher • Instant Fill &amp; Login
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                    <CheckCircle2 size={12} />
                    <span>RBAC Ready</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSelectDemoRolePill('OPERATOR')}
                    className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedDemoRole === 'OPERATOR'
                        ? 'bg-blue-50/90 border-blue-300 text-blue-700 ring-2 ring-blue-600/10 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Store size={15} />
                    <span>Operator</span>
                    <small className="text-[10px] font-normal opacity-75">
                      POS Access
                    </small>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSelectDemoRolePill('RIDER')}
                    className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedDemoRole === 'RIDER'
                        ? 'bg-blue-50/90 border-blue-300 text-blue-700 ring-2 ring-blue-600/10 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Truck size={15} />
                    <span>Rider</span>
                    <small className="text-[10px] font-normal opacity-75">
                      Tests 403 Guard
                    </small>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSelectDemoRolePill('CUSTOMER')}
                    className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedDemoRole === 'CUSTOMER'
                        ? 'bg-blue-50/90 border-blue-300 text-blue-700 ring-2 ring-blue-600/10 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Home size={15} />
                    <span>Customer</span>
                    <small className="text-[10px] font-normal opacity-75">
                      Tests 403 Guard
                    </small>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
