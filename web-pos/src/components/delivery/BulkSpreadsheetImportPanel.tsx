/**
 * ============================================================================
 * FILE: src/components/delivery/BulkSpreadsheetImportPanel.tsx
 * PURPOSE: Bulk spreadsheet copy-paste parser for delivery customers.
 *          Supports direct copy-paste from Excel, Google Sheets, or CSV files.
 *          Customer Name, Barangay, Optional Phone Number.
 *          Strict Lucide vector icons, zero Unicode emojis.
 * ============================================================================
 */

import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { VehicleType } from '../../types/delivery.types';

interface ParsedCustomerRow {
  id: string;
  name: string;
  phoneNumber?: string;
  barangay: string;
  vehicleType: VehicleType;
}

interface BulkSpreadsheetImportPanelProps {
  currentVehicle: VehicleType;
  defaultBarangay: string;
  onBulkImport: (rows: ParsedCustomerRow[]) => Promise<void>;
  onSuccess: () => void;
}

export function BulkSpreadsheetImportPanel({
  currentVehicle,
  defaultBarangay,
  onBulkImport,
  onSuccess,
}: BulkSpreadsheetImportPanelProps) {
  const [rawText, setRawText] = useState<string>('');
  const [manualRows, setManualRows] = useState<ParsedCustomerRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Real-time parser for spreadsheet text (Tab \t or Comma , separated)
   */
  const parsedRowsFromText = useMemo<ParsedCustomerRow[]>(() => {
    if (!rawText.trim()) return [];

    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const results: ParsedCustomerRow[] = [];

    // Check if first row is a header
    const firstLineLower = lines[0]?.toLowerCase() ?? '';
    const hasHeader =
      firstLineLower.includes('name') ||
      firstLineLower.includes('phone') ||
      firstLineLower.includes('barangay');

    const dataLines = hasHeader ? lines.slice(1) : lines;

    dataLines.forEach((line, index) => {
      // Split by tab (\t) or comma (,)
      const delimiter = line.includes('\t') ? '\t' : ',';
      const parts = line.split(delimiter).map((p) => p.trim().replace(/^["']|["']$/g, ''));

      if (parts.length === 0 || !parts[0]) return;

      let name = '';
      let phone: string | undefined = undefined;
      let barangay = defaultBarangay || 'Loyola Heights';

      if (parts.length === 1) {
        // Just name
        name = parts[0];
        barangay = defaultBarangay || 'Loyola Heights';
      } else if (parts.length === 2) {
        // Could be: Name, Barangay OR Name, Phone
        name = parts[0];
        const isSecondPhone = /^[0-9+() -]{7,15}$/.test(parts[1]);
        if (isSecondPhone) {
          phone = parts[1];
          barangay = defaultBarangay || 'Loyola Heights';
        } else {
          barangay = parts[1];
        }
      } else {
        // 3+ columns: Name, Barangay, Phone (or Name, Phone, Barangay)
        name = parts[0];
        const isSecondPhone = /^[0-9+() -]{7,15}$/.test(parts[1]);
        if (isSecondPhone) {
          phone = parts[1];
          barangay = parts[2] || defaultBarangay || 'Loyola Heights';
        } else {
          barangay = parts[1] || defaultBarangay || 'Loyola Heights';
          phone = parts[2] || undefined;
        }
      }

      if (name.trim()) {
        results.push({
          id: `preview-${index}-${Date.now()}`,
          name: name.trim(),
          phoneNumber: phone,
          barangay: barangay.trim(),
          vehicleType: currentVehicle,
        });
      }
    });

    return results;
  }, [rawText, currentVehicle, defaultBarangay]);

  // Combine parsed rows with any manually kept rows
  const activeRows = manualRows.length > 0 ? manualRows : parsedRowsFromText;

  function handlePasteTemplate() {
    const sample = `Maria Santos\tPansol\t+639171112233
Carlo Mendoza\tLoyola Heights\t+639174445566
Katipunan Study Hub\tLoyola Heights\t+639173334455
Elena Bautista\tLoyola Heights\t+639176667788
Ramon Villanueva\tLoyola Heights\t+639174441122`;
    setRawText(sample);
    setManualRows([]);
  }

  function handleRemoveRow(indexToRemove: number) {
    const current = activeRows.filter((_, idx) => idx !== indexToRemove);
    setManualRows(current);
  }

  async function handleImportSubmit() {
    if (activeRows.length === 0) {
      setErrorMessage('Please paste or enter at least one customer row from your spreadsheet.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onBulkImport(activeRows);
      setRawText('');
      setManualRows([]);
      onSuccess();
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to import customers.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col h-full space-y-3.5">
      {/* Instructions Card */}
      <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-[7px] p-3 text-[12px] text-[#0369a1] flex items-start gap-2.5">
        <FileSpreadsheet size={16} className="text-[#0284c7] shrink-0 mt-0.5" />
        <div className="flex-1 leading-snug">
          <strong className="font-semibold block text-[#0c4a6e]">
            Paste Rows Directly from Excel or Google Sheets
          </strong>
          Copy rows from your spreadsheet and paste them below. Expected columns:
          <span className="font-mono bg-white px-1 py-0.5 rounded border border-[#bae6fd] mx-1 text-[11px] text-[#0f172a]">
            Customer Name | Barangay | Phone Number (Optional)
          </span>
          All imported rows will be registered under the active{' '}
          <span className="font-semibold">{currentVehicle}</span> rotation.
        </div>
      </div>

      {/* Paste Textarea */}
      <div className="flex flex-col space-y-1.5 flex-1">
        <div className="flex items-center justify-between text-[11px] text-[#64748b]">
          <span className="font-semibold text-[#334155]">Spreadsheet Data Input</span>
          <button
            type="button"
            onClick={handlePasteTemplate}
            className="text-[#0284c7] hover:underline font-medium cursor-pointer"
          >
            Insert Sample Template
          </button>
        </div>

        <textarea
          rows={5}
          value={rawText}
          onChange={(e) => {
            setRawText(e.target.value);
            setManualRows([]);
          }}
          placeholder="Paste copied cells from Excel or Google Sheets here...&#10;e.g. Maria Santos [Tab] Pansol [Tab] +639171112233"
          className="w-full font-mono text-[11.5px] p-2.5 bg-white border border-[#cbd5e1] rounded-[6px] focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] resize-none h-[110px]"
        />
      </div>

      {/* Parsed Rows Preview */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc] border border-[#e2e8f0] rounded-[7px] p-2.5">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-[#0f172a]">
              Parsed Customers Preview
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e2e8f0] text-[#334155]">
              {activeRows.length} {activeRows.length === 1 ? 'person' : 'persons'} detected
            </span>
          </div>

          {activeRows.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setRawText('');
                setManualRows([]);
              }}
              className="text-[11px] text-[#ef4444] hover:underline cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {activeRows.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-[#94a3b8]">
            <FileSpreadsheet size={28} className="opacity-40 mb-1" />
            <p className="text-[12px]">No rows parsed yet.</p>
            <p className="text-[11px] text-[#94a3b8] mt-0.5">
              Paste spreadsheet rows above or click "Insert Sample Template"
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[170px]">
            {activeRows.map((row, idx) => (
              <div
                key={row.id || idx}
                className="flex items-center justify-between p-2 bg-white rounded border border-[#e2e8f0] text-[11.5px] gap-2 hover:border-[#cbd5e1] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#0f172a] truncate">
                      {row.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#f1f5f9] text-[#475569] font-medium border border-[#e2e8f0] shrink-0">
                      {row.barangay}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#64748b] truncate mt-0.5">
                    {row.phoneNumber ? (
                      <span className="font-mono text-[#475569]">{row.phoneNumber}</span>
                    ) : (
                      <span className="text-[#94a3b8]">No phone number</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded border uppercase ${
                      row.vehicleType === 'FOTON'
                        ? 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]'
                        : 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]'
                    }`}
                  >
                    {row.vehicleType}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveRow(idx)}
                    className="p-1 text-[#94a3b8] hover:text-[#ef4444] transition-colors cursor-pointer"
                    title="Remove row"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-[6px] bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-[11.5px] flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Import Button */}
      <button
        type="button"
        disabled={activeRows.length === 0 || isSubmitting}
        onClick={handleImportSubmit}
        className={`w-full py-2.5 px-4 rounded-[6px] font-semibold text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
          activeRows.length === 0 || isSubmitting
            ? 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed'
            : 'bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-sm hover:shadow'
        }`}
      >
        {isSubmitting ? (
          <span>Importing {activeRows.length} Customers...</span>
        ) : (
          <>
            <CheckCircle2 size={16} className="text-[#38bdf8]" />
            <span>Import All {activeRows.length} Delivery Customers</span>
          </>
        )}
      </button>
    </div>
  );
}
