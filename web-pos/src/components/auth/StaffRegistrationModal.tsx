/**
 * ============================================================================
 * FILE: src/components/auth/StaffRegistrationModal.tsx
 * PURPOSE: Station Staff Provisioning Modal conforming to tasteskill v2 framed-sheet.
 *          - High touch-accuracy and clean input fields.
 *          - Flat dialog with 1px border, zero backdrop blur.
 *          - Strictly Lucide vector icons, zero Unicode emojis.
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
    <div className="fixed inset-0 bg-[#0f172a]/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-[#cbd5e1] rounded-[10px] w-full max-w-md p-5 text-[12px]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 mb-3 border-b border-[#e2e8f0]">
          <div>
            <div className="flex items-center gap-2">
              <UserPlus size={16} className="text-[#0284c7]" />
              <h3 className="text-[14px] font-semibold text-[#0f172a]">
                Provision Station Staff Account
              </h3>
            </div>
            <p className="text-[11px] text-[#64748b] mt-0.5">
              Branch: {props.branchName}
            </p>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="p-1 rounded-[4px] border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc] cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {errorMessage !== null && (
          <div className="mb-3 px-3 py-2 rounded-[5px] bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-[11px]">
            {errorMessage}
          </div>
        )}

        {successMessage !== null && (
          <div className="mb-3 px-3 py-2 rounded-[5px] bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-[11px] flex items-center gap-1.5">
            <CheckCircle2 size={13} />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleStaffFormSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider mb-1">
              Staff Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Juan De La Cruz"
              className="field-input"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider mb-1">
              Mobile Phone Number
            </label>
            <input
              type="text"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+639171234567"
              className="field-input num-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider mb-1">
              Initial Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input num-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider mb-1">
              Assigned Operational Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('RIDER')}
                className={`py-2 px-3 rounded-[5px] border text-center text-[11px] font-medium cursor-pointer transition-colors ${
                  role === 'RIDER'
                    ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0284c7] font-semibold'
                    : 'border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]'
                }`}
              >
                Delivery Rider (Mobile)
              </button>
              <button
                type="button"
                onClick={() => setRole('OPERATOR')}
                className={`py-2 px-3 rounded-[5px] border text-center text-[11px] font-medium cursor-pointer transition-colors ${
                  role === 'OPERATOR'
                    ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0284c7] font-semibold'
                    : 'border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]'
                }`}
              >
                Station Operator (Web POS)
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2 mt-2 border-t border-[#e2e8f0]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 py-2 text-[12px] disabled:opacity-50"
            >
              {isSubmitting ? 'Provisioning...' : 'Create Staff Credentials'}
            </button>
            <button
              type="button"
              onClick={props.onClose}
              className="btn-secondary py-2 px-4 text-[12px]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
