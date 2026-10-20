/**
 * ============================================================================
 * FILE: src/components/pos/FloatingToastNotification.tsx
 * PURPOSE: Floating toast notification card with a live countdown progress bar
 *          that depletes smoothly over the lifespan of the toast.
 *          - Positioned as a fixed floating overlay (top-right) so it never
 *            shifts page layout.
 *          - Uses a keyed inner card (`key={toast.id}`) so each new toast
 *            starts cleanly at 100% (`durationMs`) without state race conditions.
 *          - Pauses countdown while hovered so the operator can read long
 *            messages if needed, and includes a manual dismiss button.
 *          - Uses Tailwind CSS and Lucide icons (lucide-react) strictly.
 * ============================================================================
 */

import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastVariant = 'success' | 'info' | 'error';

export interface ToastNotificationData {
  id: number;
  message: string;
  variant: ToastVariant;
  durationMs: number;
}

interface FloatingToastNotificationProps {
  toast: ToastNotificationData | null;
  onDismiss: () => void;
}

interface ActiveToastCardProps {
  toast: ToastNotificationData;
  onDismiss: () => void;
}

function ActiveToastCard(props: ActiveToastCardProps) {
  const activeToast = props.toast;
  const onDismissCallback = props.onDismiss;

  // Initialized directly to durationMs (e.g. 4500ms) because ActiveToastCard is keyed by toast.id
  const [remainingMs, setRemainingMs] = useState<number>(
    activeToast.durationMs,
  );
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Step-by-step interval timer that updates the progress bar every 40ms
  useEffect(() => {
    if (isPaused) {
      return;
    }

    const tickIntervalMs = 40;

    const timerId = window.setInterval(() => {
      setRemainingMs((previousRemaining) => {
        const nextRemaining = previousRemaining - tickIntervalMs;
        if (nextRemaining <= 0) {
          window.clearInterval(timerId);
          return 0;
        }
        return nextRemaining;
      });
    }, tickIntervalMs);

    return () => {
      window.clearInterval(timerId);
    };
  }, [isPaused]);

  // Dismiss only after the countdown has genuinely reached 0
  useEffect(() => {
    if (remainingMs <= 0) {
      onDismissCallback();
    }
  }, [remainingMs, onDismissCallback]);

  // Calculate remaining percentage (0% to 100%) for the progress bar width
  const rawPercent = (remainingMs / activeToast.durationMs) * 100;
  const clampedPercent =
    rawPercent < 0 ? 0 : rawPercent > 100 ? 100 : rawPercent;

  // Calculate remaining seconds for subtle numeric readout (e.g. "4.2s")
  const remainingSecondsFormatted = (remainingMs / 1000).toFixed(1);

  // Select visual styles based on toast variant
  let iconElement = <CheckCircle2 size={18} className="text-emerald-400" />;
  let badgeTitle = 'Operation Confirmed';
  let progressBarColorClass = 'bg-emerald-400';
  let borderAccentClass = 'border-emerald-500/40';

  if (activeToast.variant === 'error') {
    iconElement = <AlertTriangle size={18} className="text-red-400" />;
    badgeTitle = 'Action Alert';
    progressBarColorClass = 'bg-red-400';
    borderAccentClass = 'border-red-500/40';
  } else if (activeToast.variant === 'info') {
    iconElement = <Info size={18} className="text-sky-400" />;
    badgeTitle = 'Dispatch Notice';
    progressBarColorClass = 'bg-sky-400';
    borderAccentClass = 'border-sky-500/40';
  }

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed top-20 right-5 z-50 w-full max-w-sm rounded-2xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border ${borderAccentClass} overflow-hidden transition-all`}
    >
      {/* Floating Card Body */}
      <div className="p-3.5 flex items-start gap-3">
        <div className="mt-0.5 shrink-0 w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
          {iconElement}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              {badgeTitle}
            </span>
            <span className="text-[10px] font-mono font-semibold text-slate-400 tabular-nums">
              {isPaused ? 'Paused' : `${remainingSecondsFormatted}s`}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-100 leading-relaxed mt-0.5 break-words">
            {activeToast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onDismissCallback}
          aria-label="Dismiss notification"
          className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {/* Countdown Progress Bar Track at the Bottom of the Floating Toast */}
      <div className="h-1.5 w-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full ${progressBarColorClass} transition-[width] duration-75 ease-linear`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  );
}

export function FloatingToastNotification(
  props: FloatingToastNotificationProps,
) {
  if (props.toast === null) {
    return null;
  }

  return (
    <ActiveToastCard
      key={props.toast.id}
      toast={props.toast}
      onDismiss={props.onDismiss}
    />
  );
}
