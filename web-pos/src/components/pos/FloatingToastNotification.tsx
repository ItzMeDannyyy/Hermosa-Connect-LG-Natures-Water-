/**
 * ============================================================================
 * FILE: src/components/pos/FloatingToastNotification.tsx
 * PURPOSE: Floating toast notification card with countdown progress bar.
 *          Adheres to tasteskill v2 app-screens:
 *          - Crisp solid overlay (top-right), zero backdrop blur.
 *          - 1px clean border, no heavy drop shadow.
 *          - Strictly Lucide vector icons, zero Unicode emojis.
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

  const [remainingMs, setRemainingMs] = useState<number>(
    activeToast.durationMs,
  );
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const tickIntervalMs = 40;

    const timerId = window.setInterval(() => {
      setRemainingMs((prev) => {
        const next = prev - tickIntervalMs;
        if (next <= 0) {
          window.clearInterval(timerId);
          return 0;
        }
        return next;
      });
    }, tickIntervalMs);

    return () => {
      window.clearInterval(timerId);
    };
  }, [isPaused]);

  useEffect(() => {
    if (remainingMs <= 0) {
      onDismissCallback();
    }
  }, [remainingMs, onDismissCallback]);

  const rawPercent = (remainingMs / activeToast.durationMs) * 100;
  const clampedPercent = Math.max(0, Math.min(100, rawPercent));
  const remainingSecondsFormatted = (remainingMs / 1000).toFixed(1);

  let iconElement = <CheckCircle2 size={16} className="text-[#15803d]" />;
  let badgeTitle = 'Operation Confirmed';
  let progressBarColorClass = 'bg-[#15803d]';
  let borderClass = 'border-[#334155]';

  if (activeToast.variant === 'error') {
    iconElement = <AlertTriangle size={16} className="text-[#f87171]" />;
    badgeTitle = 'Action Alert';
    progressBarColorClass = 'bg-[#b91c1c]';
    borderClass = 'border-[#7f1d1d]';
  } else if (activeToast.variant === 'info') {
    iconElement = <Info size={16} className="text-[#38bdf8]" />;
    badgeTitle = 'Station Notice';
    progressBarColorClass = 'bg-[#0284c7]';
    borderClass = 'border-[#0369a1]';
  }

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed top-16 right-5 z-50 w-full max-w-sm rounded-[8px] bg-[#0f172a] text-white border ${borderClass} overflow-hidden`}
    >
      <div className="p-3 flex items-start gap-2.5">
        <div className="mt-0.5 shrink-0">{iconElement}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
              {badgeTitle}
            </span>
            <span className="text-[10px] font-mono text-[#94a3b8] tabular-nums">
              {isPaused ? 'Paused' : `${remainingSecondsFormatted}s`}
            </span>
          </div>
          <p className="text-[12px] font-medium text-[#f1f5f9] leading-snug mt-0.5 break-words">
            {activeToast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onDismissCallback}
          aria-label="Dismiss notification"
          className="shrink-0 p-1 rounded text-[#94a3b8] hover:text-white cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      <div className="h-1 w-full bg-[#1e293b] overflow-hidden">
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
