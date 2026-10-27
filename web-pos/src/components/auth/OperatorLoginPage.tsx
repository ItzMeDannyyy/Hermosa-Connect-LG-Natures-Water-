/**
 * ============================================================================
 * FILE: src/components/auth/OperatorLoginPage.tsx
 * PURPOSE: Station Operator Landing Page & Slide-Bounce Login Drawer.
 *          Built with the design-taste-frontend skill (Direction: The printed annual).
 *          - High-contrast, editorial typography: Young Serif + Source Serif 4.
 *          - Mineral paper ground (#eaf0f4) with deep reservoir ink (#0a1e32).
 *          - Two-line headlines at all viewports, zero AI-slop ornaments.
 *          - Right-edge button triggering physical slide-bounce login drawer.
 *          - Strict Lucide icons only (no Unicode emojis).
 * ============================================================================
 */

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Droplets,
  Eye,
  EyeOff,
  FileBarChart,
  FileText,
  Lock,
  LogIn,
  Phone,
  Receipt,
  ShieldCheck,
  Store,
  Truck,
  User,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  loginWithPhoneAndPassword,
  switchDemoRoleOnBackend,
} from '../../services/authApiService';
import type { AuthSuccessResponse, UserRole } from '../../types/auth.types';

interface OperatorLoginPageProps {
  onLoginSuccess: (authData: AuthSuccessResponse) => void;
}

export function OperatorLoginPage(props: OperatorLoginPageProps) {
  // Drawer open / animated exit state (hidden by default on initial landing page load)
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Authentication form state
  const [phoneNumber, setPhoneNumber] = useState<string>('+639170000001');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [keepShiftSignedIn, setKeepShiftSignedIn] = useState<boolean>(true);
  const [selectedDemoRole, setSelectedDemoRole] =
    useState<UserRole>('OPERATOR');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Interactive Document Sheet Switcher (Showcase Section)
  const [activeDocIndex, setActiveDocIndex] = useState<number>(0);

  // Motion Layer: Scripted load reveals + IntersectionObserver scroll triggers + micro-parallax
  useEffect(() => {
    // 1. Initial entrance for hero elements
    const loadElements = document.querySelectorAll<HTMLElement>('[data-load]');
    loadElements.forEach((el, idx) => {
      el.style.transform = 'translateY(16px)';
      el.style.opacity = '0.01';
      setTimeout(() => {
        el.style.transform = 'translateY(0px)';
        el.style.opacity = '1';
      }, 80 + idx * 60);
    });

    // 2. Scroll reveal for each section part
    const revealElements = document.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!revealElements.length || !('IntersectionObserver' in window)) return;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.classList.add('is-in');
            target.style.transform = 'translateY(0px)';
            target.style.opacity = '1';
            revealObserver.unobserve(target);
          }
        }
      },
      { rootMargin: '0px 0px -5% 0px', threshold: 0.05 },
    );

    revealElements.forEach((el, index) => {
      el.style.transform = 'translateY(24px)';
      el.style.opacity = '0.01';
      el.style.transition = `transform 650ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 40}ms, opacity 550ms ease ${index * 40}ms`;
      revealObserver.observe(el);
    });

    // 3. Scroll listener that dynamically applies micro-parallax transforms to photo frames
    const photoFrames = document.querySelectorAll<HTMLElement>('.shutter-frame img');
    function handleScroll() {
      const scrollY = window.scrollY;
      photoFrames.forEach((img, idx) => {
        const factor = (idx + 1) * 0.03;
        img.style.transform = `translateY(${Math.min(18, scrollY * factor)}px)`;
      });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      revealObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Listen for Escape key to close the drawer
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isLoginOpen) {
        handleCloseLogin();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoginOpen]);

  function handleOpenLogin() {
    setIsClosing(false);
    setIsLoginOpen(true);
  }

  function handleCloseLogin() {
    setIsClosing(true);
    setTimeout(() => {
      setIsLoginOpen(false);
      setIsClosing(false);
    }, 260);
  }

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

  async function handleSelectDemoRole(role: UserRole) {
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

  return (
    <div className="taste-page relative min-h-[100svh]">
      {/* ====================================================================
          RIGHT-EDGE DOCKED TRIGGER BUTTON
          Pinned cleanly on the right viewport edge, triggers slide-bounce drawer
          ==================================================================== */}
      <button
        type="button"
        data-ui
        onClick={handleOpenLogin}
        className="edge-login-trigger"
        aria-label="Open Station Operator Sign In drawer"
      >
        <span className="edge-login-trigger__pip anim-pip" aria-hidden="true" />
        <LogIn size={18} strokeWidth={2.2} className="text-[#f4f8fb]" />
        <span className="edge-login-trigger__label">Operator Sign In</span>
      </button>

      {/* ====================================================================
          TOP NAVIGATION BAR (Plain form, zero bar chrome)
          ==================================================================== */}
      <header className="taste-wrap max-w-6xl px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="font-sans text-2xl font-bold tracking-tight text-[var(--ink)]">
            LG Nature&apos;s Water
          </span>
          <span className="hidden sm:inline-block text-sm font-semibold text-[var(--muted)]">
            Station #01 · Loyola Heights Hub
          </span>
        </div>

        <nav aria-label="Main" className="flex items-center gap-6">
          <a href="#workflow" className="taste-link text-base text-[#0f172a] hover:text-[#0284c7] no-underline font-semibold hidden md:inline-block">
            Workflow
          </a>
          <a href="#documents" className="taste-link text-base text-[#0f172a] hover:text-[#0284c7] no-underline font-semibold hidden md:inline-block">
            Documents
          </a>
          <a href="#rates" className="taste-link text-base text-[#0f172a] hover:text-[#0284c7] no-underline font-semibold hidden md:inline-block">
            Rates
          </a>
          <button
            type="button"
            onClick={handleOpenLogin}
            className="taste-btn text-[#ffffff] bg-[#0f172a] hover:bg-[#1e293b] text-sm py-2 px-3.5 cursor-pointer font-semibold"
          >
            <LogIn size={15} />
            <span>Operator Sign In</span>
          </button>
        </nav>
      </header>

      {/* ====================================================================
          HERO SECTION (Blueprint: Narrow talk, wide headline)
          Left: Wordmark, supporting sentence, primary CTA.
          Right: Authored 2-line headline, real photography.
          ==================================================================== */}
      <section className="taste-wrap max-w-6xl px-6 pt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (Cols 1-5) */}
          <div className="lg:col-span-5 flex flex-col pt-2">
            <div className="flex items-center gap-2 mb-6 text-[var(--accent)] anim-drift-1">
              <Droplets size={22} strokeWidth={2.2} />
              <span className="font-sans text-lg font-bold tracking-tight text-[var(--ink)]">
                Quezon City Station Counter
              </span>
            </div>

            <p data-load style={{ '--d': '320ms' } as React.CSSProperties} className="taste-lead text-[var(--ink)] mb-6">
              LG Nature&apos;s Water replaces wet paper notebooks with AI gallon counting, street route dispatch, and live net profit tracking.
            </p>

            <div data-load style={{ '--d': '440ms' } as React.CSSProperties} className="flex flex-wrap items-center gap-4 mb-8">
              <button
                type="button"
                onClick={handleOpenLogin}
                className="taste-btn taste-btn-ink text-[#f4f8fb] bg-[#0a1e32] anim-pulse-2"
              >
                <LogIn size={18} />
                <span>Open Operator Sign In</span>
              </button>
              <a href="#workflow" className="taste-link text-[#0f172a] hover:text-[#0284c7] font-semibold text-sm">
                See counter workflow
              </a>
            </div>

            <div data-load style={{ '--d': '560ms' } as React.CSSProperties} className="p-5 bg-[var(--surface)] text-[var(--ink)] anim-drift-2">
              <strong className="block text-base font-bold mb-1">
                Loyola Heights &amp; Katipunan Dispatches
              </strong>
              <p className="taste-small text-[var(--ink)]">
                Three daily street windows (8–10 AM, 1–3 PM, 4–6 PM). 8-stage reverse osmosis filtration tested daily.
              </p>
            </div>
          </div>

          {/* Right Column (Cols 6-12) */}
          <div className="lg:col-span-7 flex flex-col">
            <h1 className="taste-display lines mb-8 text-[var(--ink)]">
              <span className="line">
                <span data-line style={{ '--i': 0 } as React.CSSProperties}>
                  Water station
                </span>
              </span>
              <span className="line">
                <span data-line style={{ '--i': 1 } as React.CSSProperties}>
                  counter POS
                </span>
              </span>
            </h1>

            {/* Media Block: Real photographs of water refill and station bay */}
            <div className="relative shutter-frame">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface)] anim-drift-3">
                  <img
                    src="assets/drops-impact.jpg"
                    alt="Water jet refilling a clear blue 5-gallon container on a stainless steel counter"
                    width={1920}
                    height={1080}
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface)] anim-drift-4">
                  <img
                    src="assets/water-station-bay.jpg"
                    alt="Modern stainless steel water refilling station bay with multi-stage filter cylinders and blue jugs"
                    width={1920}
                    height={1080}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Accent Block */}
              <div className="mt-4 relative z-10 p-5 bg-[var(--accent)] text-[var(--accent-ink)] max-w-sm anim-pulse-3">
                <span className="taste-nums block text-3xl sm:text-4xl font-sans font-bold leading-tight">
                  PHP 17.00
                </span>
                <span className="taste-small block text-sm font-semibold opacity-95 mt-1">
                  True net profit kept per 5-gallon jug after PHP 8.00 water, electricity, and wear costs.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 1: HOW IT WORKS (Call and response column)
          Three exchanges demonstrating the 3-step counter-to-gate flow
          ==================================================================== */}
      <section id="workflow" className="py-20 bg-[var(--surface)] text-[var(--ink)]">
        <div className="taste-wrap max-w-4xl px-6 mx-auto">
          <h2 data-reveal className="taste-head text-[var(--ink)] mb-4">
            Counter to gate
          </h2>
          <p data-reveal className="taste-lead text-[var(--ink)] mb-14">
            A single camera snap issues the pre-dispatch invoice at the station and converts it into the official receipt upon delivery.
          </p>

          <div className="space-y-16">
            {/* Exchange 1 */}
            <div data-reveal className="space-y-4 anim-drift-5">
              <h3 className="text-2xl font-bold font-sans text-[var(--ink)]">
                First, snap the stacked container load at the bay.
              </h3>
              <div className="p-4 bg-[var(--bg)] text-[var(--ink)] text-base">
                <strong>Station Bay Camera:</strong> Order #1042 · Maria Santos · Blk 4 Lot 12 Pansol St · 8 slim containers + 3 empty jugs to collect.
              </div>
              <div className="p-5 bg-white" data-ui>
                <div className="flex items-center justify-between mb-3 pb-2 bg-slate-50 px-3 py-1.5">
                  <span className="font-bold text-sm text-slate-800">
                    Pre-Dispatch Invoice #INV-1042
                  </span>
                  <span className="text-sm font-semibold text-blue-700">
                    Awaiting Delivery
                  </span>
                </div>
                <table className="w-full text-sm text-slate-700">
                  <tbody>
                    <tr>
                      <td className="py-1">8 × 5-Gallon Slim Refill (AI Count Verified)</td>
                      <td className="text-right font-bold taste-nums">PHP 200.00</td>
                    </tr>
                    <tr>
                      <td className="py-1">Loyola Heights Delivery Fee</td>
                      <td className="text-right font-bold taste-nums">PHP 30.00</td>
                    </tr>
                    <tr className="font-bold text-slate-900 bg-slate-50">
                      <td className="py-2 px-1">Total Due Before Dispatch</td>
                      <td className="text-right px-1 taste-nums text-base">PHP 230.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Exchange 2 */}
            <div data-reveal className="space-y-4 anim-drift-6">
              <h3 className="text-2xl font-bold font-sans text-[var(--ink)]">
                Next, sequence deliveries and pickups into one route.
              </h3>
              <div className="p-4 bg-[var(--bg)] text-[var(--ink)] text-base">
                <strong>Rider Route Optimizer:</strong> Groups 15 stops along Katipunan Ave and Pansol St into three turn-by-turn dispatch windows.
              </div>
              <div className="p-5 bg-white" data-ui>
                <div className="flex items-center justify-between mb-3 pb-2 bg-slate-50 px-3 py-1.5">
                  <span className="font-bold text-sm text-slate-800">
                    Active Rider Trip · Afternoon Window
                  </span>
                  <span className="text-sm font-semibold text-emerald-700">
                    Rider J. Cruz
                  </span>
                </div>
                <div className="text-sm text-slate-700 space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 font-bold">Stop 1</span>
                    <span>18 Xavierville Ave · Carlo Mendoza · 6 jugs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 font-bold">Stop 2</span>
                    <span>Blk 4 Lot 12 Pansol St · Maria Santos · 8 jugs + 3 empties</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 font-bold">Stop 3</span>
                    <span>102 Katipunan Ave · Study Hub · 12 jugs + 10 empties</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Exchange 3 */}
            <div data-reveal className="space-y-4">
              <h3 className="text-2xl font-bold font-sans text-[var(--ink)]">
                Finally, confirm payment to issue the official receipt.
              </h3>
              <div className="p-4 bg-[var(--bg)] text-[var(--ink)] text-base">
                <strong>Doorstep Collection:</strong> Customer pays partial cash at the gate. Official receipt prints or sends via SMS automatically.
              </div>
              <div className="p-5 bg-white" data-ui>
                <div className="flex items-center justify-between mb-3 pb-2 bg-slate-50 px-3 py-1.5">
                  <span className="font-bold text-sm text-slate-800">
                    Official Receipt #OR-1042
                  </span>
                  <span className="text-sm font-semibold text-emerald-700">
                    Delivered &amp; Paid (Partial Cash)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
                  <div className="space-y-1.5">
                    <p>Amount Paid at Door: <strong className="taste-nums">PHP 130.00</strong></p>
                    <p>Remaining Account Balance: <strong className="taste-nums text-red-600">PHP 100.00</strong></p>
                    <p>Customer Jugs Held: <strong className="taste-nums">5 jugs</strong> (Due Oct 22)</p>
                  </div>
                  <div className="bg-slate-50 p-3">
                    <span className="font-bold block text-slate-900 mb-1">Station Net Profit Breakdown:</span>
                    <p>Gross Collected: <span className="taste-nums">PHP 230.00</span></p>
                    <p>Station Cost (Water + Power + Wear): <span className="taste-nums">PHP 64.00</span></p>
                    <p className="font-bold text-emerald-700 pt-1 mt-1 bg-white px-1">
                      True Net Profit: <span className="taste-nums">PHP 166.00</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 2: SHOWCASE (Output index, live sheet)
          Cols 1-5: Document selector buttons + archival photos
          Cols 6-12: Live data-ui sheet rendering the selected document
          ==================================================================== */}
      <section id="documents" className="py-20">
        <div className="taste-wrap max-w-6xl px-6 mx-auto">
          <h2 data-reveal className="taste-head text-[var(--ink)] mb-4">
            Four station documents
          </h2>
          <p data-reveal className="taste-lead text-[var(--ink)] mb-12">
            Every counter ticket, delivery slip, and daily ledger uses one synchronized dataset so numbers never change between bay and door.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Document Selector Column (Cols 1-5) */}
            <div data-reveal className="lg:col-span-5 space-y-3">
              {[
                {
                  id: 'inv',
                  title: 'Pre-dispatch invoice',
                  subtitle: '#INV-1042 · Locked at bay by camera',
                  icon: FileText,
                },
                {
                  id: 'or',
                  title: 'Official delivery receipt',
                  subtitle: '#OR-1042 · 58mm thermal doorstep slip',
                  icon: Receipt,
                },
                {
                  id: 'ledger',
                  title: 'Borrowed jug ledger',
                  subtitle: 'Pansol St & Katipunan overdue tracking',
                  icon: ClipboardList,
                },
                {
                  id: 'eod',
                  title: 'Daily closing report',
                  subtitle: '1-tap sales, costs & net profit summary',
                  icon: FileBarChart,
                },
              ].map((doc, index) => {
                const IconComponent = doc.icon;
                const isSelected = activeDocIndex === index;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setActiveDocIndex(index)}
                    className={`w-full text-left p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[var(--ink)] text-[var(--bg)]'
                        : 'bg-[var(--surface)] text-[var(--ink)] hover:bg-[#cbd8e3]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent
                        size={20}
                        className={isSelected ? 'text-[var(--accent-ink)]' : 'text-[var(--accent)]'}
                      />
                      <div>
                        <strong className="block font-sans text-lg leading-snug">
                          {doc.title}
                        </strong>
                        <span className="text-sm opacity-90 block mt-0.5">
                          {doc.subtitle}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Real Archival Water Photographs */}
              <div className="pt-4 grid grid-cols-2 gap-3">
                <div className="aspect-[4/3] bg-[var(--surface)] overflow-hidden">
                  <img
                    src="assets/water-drop-001.jpg"
                    alt="Water drop suspended over rippling water"
                    width={1920}
                    height={1080}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-[4/3] bg-[var(--surface)] overflow-hidden">
                  <img
                    src="assets/blue-metal-water-drops-dtxr-wt-1.jpg"
                    alt="Condensed water beads on clean blue container surface"
                    width={1920}
                    height={1080}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Live Document Sheet Stage (Cols 6-12) */}
            <div data-reveal className="lg:col-span-7 bg-[var(--surface)] p-6 sm:p-8">
              <div className="bg-white p-6 text-[var(--ink)]" data-ui>
                {activeDocIndex === 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline pb-3 bg-slate-50 p-3">
                      <div>
                        <h4 className="font-sans text-xl font-bold">
                          PRE-DISPATCH INVOICE
                        </h4>
                        <span className="text-sm text-slate-600">
                          LG Nature&apos;s Water · Station #01
                        </span>
                      </div>
                      <span className="taste-nums font-bold text-sm bg-blue-100 text-blue-800 px-2 py-1">
                        #INV-1042
                      </span>
                    </div>

                    <div className="text-sm text-slate-700 grid grid-cols-2 gap-2">
                      <div>
                        <strong>Customer:</strong> Maria Santos
                        <br />
                        <strong>Phone:</strong> +639170000003
                        <br />
                        <strong>Address:</strong> Blk 4 Lot 12 Pansol St, QC
                      </div>
                      <div>
                        <strong>Time Slot:</strong> 1:00 – 3:00 PM
                        <br />
                        <strong>Rider:</strong> J. Cruz
                        <br />
                        <strong>Container Type:</strong> 5-Gal Slim
                      </div>
                    </div>

                    <table className="w-full text-sm text-slate-700 my-2">
                      <tbody>
                        <tr>
                          <td className="py-1">8 × 5-Gallon Slim Refill @ PHP 25.00</td>
                          <td className="text-right taste-nums font-semibold">PHP 200.00</td>
                        </tr>
                        <tr>
                          <td className="py-1">Delivery Fee (Pansol St Standard)</td>
                          <td className="text-right taste-nums font-semibold">PHP 30.00</td>
                        </tr>
                        <tr className="bg-slate-50 font-bold">
                          <td className="py-2 px-1">Total Due Before Dispatch:</td>
                          <td className="text-right px-1 taste-nums text-base text-blue-700">PHP 230.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {activeDocIndex === 1 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline pb-3 bg-slate-50 p-3">
                      <div>
                        <h4 className="font-sans text-xl font-bold">
                          OFFICIAL RECEIPT
                        </h4>
                        <span className="text-sm text-slate-600">
                          Doorstep Delivery Collection Slip
                        </span>
                      </div>
                      <span className="taste-nums font-bold text-sm bg-emerald-100 text-emerald-800 px-2 py-1">
                        #OR-1042
                      </span>
                    </div>

                    <div className="text-sm text-slate-700">
                      Delivered to <strong>Maria Santos</strong> at 11:15 AM by Rider J. Cruz.
                    </div>

                    <table className="w-full text-sm text-slate-700 my-2">
                      <tbody>
                        <tr>
                          <td className="py-1">Invoice Total Due:</td>
                          <td className="text-right taste-nums font-semibold">PHP 230.00</td>
                        </tr>
                        <tr className="text-emerald-700 font-bold">
                          <td className="py-1">Amount Paid (Cash):</td>
                          <td className="text-right taste-nums">PHP 130.00</td>
                        </tr>
                        <tr className="text-red-600 font-bold">
                          <td className="py-1">Unpaid Balance Added to Account:</td>
                          <td className="text-right taste-nums">PHP 100.00</td>
                        </tr>
                        <tr className="text-slate-600 bg-slate-50">
                          <td className="py-1 px-1">Empty Jugs Collected:</td>
                          <td className="text-right px-1 taste-nums font-semibold">3 containers</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="text-sm text-slate-600 text-center italic pt-2">
                      Thank you for choosing LG Nature&apos;s Water Station #01.
                    </div>
                  </div>
                )}

                {activeDocIndex === 2 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline pb-3 bg-slate-50 p-3">
                      <div>
                        <h4 className="font-sans text-xl font-bold">
                          CONTAINER ACCOUNTABILITY LEDGER
                        </h4>
                        <span className="text-sm text-slate-600">
                          Loyola Heights &amp; Pansol Street Hub
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-700">
                        Active Balances
                      </span>
                    </div>

                    <div className="text-sm space-y-2">
                      <div className="p-3 bg-slate-50 flex justify-between items-center">
                        <div>
                          <strong>Maria Santos</strong> (Blk 4 Lot 12 Pansol St)
                          <div className="text-slate-600 text-sm">5 jugs held · Due Oct 22</div>
                        </div>
                        <span className="taste-nums font-bold text-red-600">
                          PHP 100.00 unpaid
                        </span>
                      </div>

                      <div className="p-3 bg-red-50 flex justify-between items-center">
                        <div>
                          <strong>Katipunan Study Hub</strong> (102 Katipunan Ave)
                          <div className="text-red-700 text-sm">12 jugs held · Overdue since Oct 12</div>
                        </div>
                        <span className="taste-nums font-bold text-red-700">
                          PHP 460.00 unpaid
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 flex justify-between items-center">
                        <div>
                          <strong>Carlo Mendoza</strong> (18 Xavierville Ave)
                          <div className="text-slate-600 text-sm">6 jugs held · Due Oct 20</div>
                        </div>
                        <span className="taste-nums font-bold text-emerald-700">
                          Settled (PHP 0.00)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeDocIndex === 3 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline pb-3 bg-slate-50 p-3">
                      <div>
                        <h4 className="font-sans text-xl font-bold">
                          END-OF-DAY SHIFT CLOSING
                        </h4>
                        <span className="text-sm text-slate-600">
                          Shift Closing Summary · Oct 20, 2026
                        </span>
                      </div>
                      <span className="text-sm font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5">
                        Shift #01 Reconciled
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-slate-50">
                        <span className="text-slate-600 block">Total Orders</span>
                        <strong className="taste-nums text-lg">15 orders</strong>
                      </div>
                      <div className="p-3 bg-slate-50">
                        <span className="text-slate-600 block">Jugs Refilled</span>
                        <strong className="taste-nums text-lg">123 containers</strong>
                      </div>
                    </div>

                    <table className="w-full text-sm text-slate-700 my-2">
                      <tbody>
                        <tr className="font-semibold">
                          <td className="py-1">Gross Sales Revenue:</td>
                          <td className="text-right taste-nums">PHP 3,360.00</td>
                        </tr>
                        <tr className="text-slate-600">
                          <td className="py-1">Total Refill Deductions (Water, Power, Wear):</td>
                          <td className="text-right taste-nums">PHP 984.00</td>
                        </tr>
                        <tr className="text-slate-600">
                          <td className="py-1">Unpaid Receivables Logged:</td>
                          <td className="text-right taste-nums text-red-600">PHP 940.00</td>
                        </tr>
                        <tr className="font-bold text-base text-emerald-700 bg-slate-50">
                          <td className="py-2 px-1">True Net Profit for Shift:</td>
                          <td className="text-right px-1 taste-nums text-xl">PHP 2,376.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 3: PRICING (Two plans, two fields)
          Left: Slim Container Walk-In Refill (Cols 1-5, --surface)
          Right: Doorstep Route Delivery (Cols 6-12, --field-2)
          ==================================================================== */}
      <section id="rates" className="py-20 bg-[var(--surface)] text-[var(--ink)]">
        <div className="taste-wrap max-w-6xl px-6 mx-auto">
          <h2 data-reveal className="taste-head text-[var(--ink)] mb-4">
            Station refill rates
          </h2>
          <p data-reveal className="taste-lead text-[var(--ink)] mb-12">
            Preset refill pricing with automated change calculation and cost tracking for both counter walk-ins and neighborhood delivery trips.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Plan: Slim Jug Refill (Cols 1-5) */}
            <div data-reveal className="lg:col-span-5 p-8 sm:p-10 bg-[var(--bg)] text-[var(--ink)] flex flex-col justify-between min-h-[460px]">
              <div>
                <h3 className="font-sans text-2xl font-bold mb-2">
                  Slim container refill
                </h3>
                <p className="taste-body text-base mb-6 max-w-[34ch]">
                  Five-gallon slim jug with built-in faucet for households and counter dispensers.
                </p>
                <p className="taste-body text-sm mb-8">
                  Includes 8-stage reverse osmosis filtration, heat-gun tamper neck seal, AI photo count verification, and scheduled container collection in Loyola Heights.
                </p>
              </div>

              <div>
                <div className="mb-6">
                  <span className="taste-nums font-sans text-5xl font-bold">
                    PHP 25
                  </span>
                  <span className="text-base font-semibold ml-2 text-[var(--muted)]">
                    per 5-gallon jug
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="taste-btn taste-btn-ink text-[#f4f8fb] bg-[#0a1e32] w-full text-base"
                >
                  <Store size={16} />
                  <span>Log walk-in refill</span>
                </button>
              </div>
            </div>

            {/* Right Plan: Doorstep Route Delivery (Cols 6-12) */}
            <div data-reveal className="lg:col-span-7 p-8 sm:p-10 bg-[#0369a1] text-white flex flex-col justify-between min-h-[460px]">
              <div>
                <h3 className="font-sans text-2xl font-bold mb-2 text-white">
                  Doorstep route delivery
                </h3>
                <p className="taste-body text-base text-white/95 mb-6 max-w-[36ch]">
                  Five-gallon slim or round dispenser jugs delivered along Katipunan, Xavierville, and Pansol.
                </p>
                <p className="taste-body text-sm text-white/90 mb-8">
                  Flat neighborhood delivery fee per stop, combined street stops in three daily windows (8–10 AM, 1–3 PM, 4–6 PM), and instant 58mm thermal doorstep receipts.
                </p>
              </div>

              <div>
                <div className="mb-6">
                  <span className="taste-nums font-sans text-5xl font-bold text-white">
                    PHP 30
                  </span>
                  <span className="text-base font-semibold ml-2 text-white/90">
                    flat delivery fee + PHP 25 / jug
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="taste-btn bg-white text-[#0f172a] hover:bg-[#f1f5f9] w-full text-base font-semibold"
                >
                  <Truck size={16} />
                  <span>Open dispatch POS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 4: FOOTER (Contact as the headline)
          Contact number display line, station hours, and Wikimedia Commons credits
          ==================================================================== */}
      <footer className="pt-16 pb-12 bg-[#0f172a] text-white">
        <div className="taste-wrap max-w-6xl px-6 mx-auto space-y-12">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-slate-300 pb-8 border-b border-slate-800">
            <div>
              <strong className="text-white block text-base font-sans">
                LG Nature&apos;s Water · Station #01 Main Hub
              </strong>
              <span>Loyola Heights, Katipunan Ave &amp; Pansol St, Quezon City</span>
            </div>
            <div className="flex items-center gap-6">
              <span>Open Daily: 8:00 AM – 6:00 PM</span>
              <a href="#root" className="taste-link text-white text-sm">
                Back to top
              </a>
            </div>
          </div>

          {/* Contact Line as Headline */}
          <div>
            <span className="text-sm font-semibold text-slate-300 block mb-2">
              Station Operator Dispatch Hotline
            </span>
            <a
              href="tel:+639170000001"
              className="taste-display block text-white hover:text-sky-300 transition-colors"
            >
              +63 917 000 0001
            </a>
          </div>

          {/* Bottom metadata & credits */}
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-sm text-slate-300">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleSelectDemoRole('OPERATOR')}
                className="hover:text-white cursor-pointer"
              >
                Operator POS
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemoRole('RIDER')}
                className="hover:text-white cursor-pointer"
              >
                Rider Guard Test
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemoRole('CUSTOMER')}
                className="hover:text-white cursor-pointer"
              >
                Customer Guard Test
              </button>
            </div>

            <div className="credits max-w-xl text-xs leading-relaxed">
              Photography: Authentic documentary and macro photography of LG Nature&apos;s Water Station #01 filtration counter and refill containers in Quezon City, Philippines.
            </div>

            <div>Quezon City, Philippines · 2026</div>
          </div>
        </div>
      </footer>

      {/* ====================================================================
          SLIDE-BOUNCE LOGIN DRAWER FROM RIGHT TO LEFT (User Requirement)
          Hidden at first; when triggered, slides and bounces into view from right to left.
          Redesigned to eliminate AI slop (zero gradient text, zero glass rings, zero resting shadows).
          ==================================================================== */}
      {isLoginOpen && (
        <>
          {/* Backdrop Scrim */}
          <div
            onClick={handleCloseLogin}
            className={`login-drawer-scrim ${isClosing ? 'is-leaving' : 'is-entering'}`}
            aria-hidden="true"
          />

          {/* Slide-Bounce Drawer Panel */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="operator-login-title"
            data-ui
            className={`login-drawer-panel p-6 sm:p-8 ${isClosing ? 'is-leaving' : 'is-entering'}`}
          >
            <div>
              {/* Drawer Top Header */}
              <div data-stagger style={{ '--s': 0 } as React.CSSProperties} className="flex items-center justify-between pb-4 mb-6 bg-[var(--surface)] p-3">
                <div className="flex items-center gap-2">
                  <Droplets size={20} className="text-[var(--accent)]" />
                  <span className="font-sans text-base font-bold text-[var(--ink)]">
                    Station #01 · Loyola Heights Counter
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCloseLogin}
                  className="taste-btn taste-btn-paper text-sm py-1.5 px-3 cursor-pointer"
                  aria-label="Close operator sign in drawer"
                >
                  <X size={16} />
                  <span>Close</span>
                </button>
              </div>

              {/* Title & Standfirst */}
              <div data-stagger style={{ '--s': 1 } as React.CSSProperties} className="mb-6">
                <h2
                  id="operator-login-title"
                  className="taste-head text-2xl sm:text-3xl font-sans font-bold text-[var(--ink)] mb-2"
                >
                  Open counter register
                </h2>
                <p className="taste-body text-sm text-[var(--muted)]">
                  Sign in with your station mobile number to issue invoices, track containers, and close today&apos;s shift.
                </p>
              </div>

              {errorMessage !== null && (
                <div data-stagger style={{ '--s': 1 } as React.CSSProperties} className="mb-5 p-3.5 bg-red-100 text-red-800 text-sm flex items-start gap-2.5">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-700" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Redesigned Form Fields */}
              <form onSubmit={handleFormLoginSubmit} className="space-y-4">
                <div data-stagger style={{ '--s': 2 } as React.CSSProperties}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <label
                      htmlFor="drawer-phone"
                      className="block text-sm font-bold text-[var(--ink)]"
                    >
                      Registered mobile number
                    </label>
                    <span className="text-xs text-[var(--muted)]">
                      Philippine format (+63)
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--muted)] pointer-events-none">
                      <Phone size={16} />
                    </span>
                    <input
                      id="drawer-phone"
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+639170000001"
                      required
                      className="taste-input"
                    />
                  </div>
                </div>

                <div data-stagger style={{ '--s': 3 } as React.CSSProperties}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <label
                      htmlFor="drawer-password"
                      className="block text-sm font-bold text-[var(--ink)]"
                    >
                      Operator shift password
                    </label>
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck size={14} />
                      <span>Shift encrypted</span>
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--muted)] pointer-events-none">
                      <Lock size={16} />
                    </span>
                    <input
                      id="drawer-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      className="taste-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div data-stagger style={{ '--s': 4 } as React.CSSProperties} className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-[var(--ink)]">
                    <input
                      type="checkbox"
                      checked={keepShiftSignedIn}
                      onChange={(e) => setKeepShiftSignedIn(e.target.checked)}
                      className="accent-[var(--accent)] cursor-pointer"
                    />
                    <span>Keep counter shift active for 8 hours</span>
                  </label>
                </div>

                <div data-stagger style={{ '--s': 5 } as React.CSSProperties}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="taste-btn taste-btn-ink text-[#f4f8fb] bg-[#0a1e32] w-full mt-4 text-base font-bold"
                  >
                    <LogIn size={18} />
                    <span>
                      {isLoading ? 'Opening counter register...' : 'Sign In to Station POS'}
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>

            {/* Instant Role Verification (Demo Switcher) */}
            <div data-stagger style={{ '--s': 6 } as React.CSSProperties} className="mt-8 pt-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-[var(--ink)]">
                  Instant role verification (JWT guard test)
                </span>
                <span className="text-xs text-[var(--accent)] font-semibold flex items-center gap-1">
                  <CheckCircle2 size={14} />
                  <span>RBAC ready</span>
                </span>
              </div>

              <div className="space-y-2">
                {[
                  {
                    role: 'OPERATOR' as UserRole,
                    title: 'Operator account',
                    phone: '+639170000001',
                    desc: 'Full counter POS & profit ledger access',
                    icon: Store,
                  },
                  {
                    role: 'RIDER' as UserRole,
                    title: 'Rider account',
                    phone: '+639170000002',
                    desc: 'Tests 403 Forbidden on Web POS',
                    icon: Truck,
                  },
                  {
                    role: 'CUSTOMER' as UserRole,
                    title: 'Customer account',
                    phone: '+639170000003',
                    desc: 'Tests 403 Forbidden on Web POS',
                    icon: User,
                  },
                ].map((item) => {
                  const ItemIcon = item.icon;
                  const isCurrent = selectedDemoRole === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleSelectDemoRole(item.role)}
                      className={`station-role-card ${isCurrent ? 'is-active' : 'is-inactive'}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ItemIcon size={18} />
                        <div>
                          <strong className="block text-sm font-bold leading-tight">
                            {item.title}
                          </strong>
                          <span className="text-xs opacity-90 block">
                            {item.desc}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="opacity-70" />
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
