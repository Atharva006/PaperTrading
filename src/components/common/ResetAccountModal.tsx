import React, { useState } from 'react';
import { useTradingStore } from '../../store/useTradingStore';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';

interface ResetAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetAccountModal: React.FC<ResetAccountModalProps> = ({ isOpen, onClose }) => {
  const { account, resetAccount } = useTradingStore();
  const [reason, setReason] = useState('Restart simulated testing strategy');
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleConfirmReset = async () => {
    setIsResetting(true);
    await resetAccount(reason);
    setIsResetting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00225A]/30 backdrop-blur-sm animate-in fade-in select-none">
      <div className="bg-white border border-[#D9E2F2] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-[#111114] font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D9E2F2]">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#D92D20]" />
            <h3 className="text-base font-bold font-display text-[#00225A] tracking-tight">Reset Paper Trading Account</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B7A90] hover:text-[#00225A] p-1.5 rounded-lg hover:bg-[#F7F8FA] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Callout */}
        <div className="p-3.5 bg-[#D92D20]/5 border border-[#D92D20]/20 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#D92D20] shrink-0 mt-0.5" />
          <div className="text-xs text-[#6B7A90] leading-relaxed">
            <span className="font-bold text-[#D92D20]">Audited Account Reset:</span>
            <p className="mt-1">
              Resetting will restore your virtual cash balance to <strong>₹10,00,000.00</strong>.
              All active open positions and delivery holdings will be cleared, and pending orders cancelled.
              A permanent audit log of this reset event will be appended to your ledger.
            </p>
          </div>
        </div>

        {/* Current Balance Summary */}
        {account && (
          <div className="bg-[#F7F8FA] p-3.5 rounded-xl border border-[#D9E2F2] text-xs space-y-1.5 font-mono">
            <div className="flex justify-between text-[#6B7A90]">
              <span>Current Cash Balance:</span>
              <span className="text-[#00225A] font-bold">
                ₹{account.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-[#6B7A90]">
              <span>New Virtual Balance:</span>
              <span className="text-[#12B76A] font-bold">₹10,00,000.00</span>
            </div>
          </div>
        )}

        {/* Reset Reason Input */}
        <div>
          <label className="block text-xs font-semibold text-[#6B7A90] mb-1.5 uppercase font-mono">
            Reason for Reset (Recorded in Audit Ledger):
          </label>
          <input
            type="text"
            className="w-full bg-[#F7F8FA] border border-[#D9E2F2] rounded-xl px-3.5 py-2.5 text-xs text-[#111114] placeholder-[#6B7A90]/60 focus:outline-none focus:border-[#536CF0] focus:bg-white transition-colors"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Testing new option buying strategy"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D9E2F2]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7A90] hover:text-[#00225A] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
            disabled={isResetting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmReset}
            disabled={isResetting}
            className="px-4 py-2 bg-[#D92D20] hover:bg-[#B42318] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isResetting ? 'Resetting...' : 'Confirm Reset to ₹10L'}
          </button>
        </div>
      </div>
    </div>
  );
};