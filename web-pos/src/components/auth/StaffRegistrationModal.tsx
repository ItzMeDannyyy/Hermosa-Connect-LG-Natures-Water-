/**
 * ============================================================================
 * FILE: src/components/auth/StaffRegistrationModal.tsx
 * PURPOSE: Modal allowing a logged-in Station Operator to provision new RIDER
 *          or OPERATOR staff accounts. Styled with Tailwind CSS and Lucide icons.
 * ============================================================================
 */

import { CheckCircle2, UserPlus, X } from 'lucide-react';
import React, { useState } from 'react';
import { registerNewStaffMember } from '../../services/authApiService';

interface StaffRegistrationModalProps {
  isOpen: boolean;
  branchName: string;
  onClose: () => void;
}

export function StaffRegistrationModal(props: StaffRegistrationModalProps) {
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('+63917');
  const [password, setPassword] = useState<string>('password123');
  const [role, setRole] = useState<'RIDER' | 'OPERATOR'>('RIDER');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!props.isOpen) {
    return null;
  }

  async function handleStaffFormSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await registerNewStaffMember({
        fullName: fullName,
        phoneNumber: phoneNumber,
        password: password,
        role: role,
      });

      setSuccessMessage(response.message);
      setFullName('');
      setPhoneNumber('+63917');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to provision staff account.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
              <UserPlus size={20} className="text-blue-600" />
              <span>Provision New Station Staff</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Branch: <strong className="text-slate-700">{props.branchName}</strong>
            </p>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            onClick={props.onClose}
          >
            <X size={18} />
          </button>
        </div>

        {errorMessage !== null && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {successMessage !== null && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleStaffFormSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Staff Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="e.g., Mark Reyes (Delivery Rider)"
              required
              className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Phone Number (+63)
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="+639175554433"
              required
              className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Assign Staff Role
            </label>
            <select
              value={role}
              onChange={(event) =>
                setRole(event.target.value as 'RIDER' | 'OPERATOR')
              }
              className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            >
              <option value="RIDER">
                RIDER (Delivery Route, AI Photo Count &amp; Smart Receipts)
              </option>
              <option value="OPERATOR">
                OPERATOR (Station Counter POS &amp; Profit Dashboard)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Temporary Password
            </label>
            <input
              type="text"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex justify-end gap-2.5 mt-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              onClick={props.onClose}
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white shadow-md shadow-blue-600/20 transition-colors cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>
                {isSubmitting ? 'Creating Account...' : 'Create Staff Account'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
