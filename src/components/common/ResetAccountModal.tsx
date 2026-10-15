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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1424]/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-[#0E1728] border border-[#C6A15B]/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1F2D48]">
          <div className="flex items-center gap-2 text-[#C6A15B]">
            <RotateCcw className="w-5 h-5" />
            <h3 className="text-base font-bold font-serif text-white tracking-wide">Reset Paper Trading Account</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8F9BAE] hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Callout */}
        <div className="p-3 bg-[#C6A15B]/10 border border-[#C6A15B]/30 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
          <div className="text-xs text-[#E5E7EB] leading-relaxed">
            <span className="font-bold text-[#E2C889]">Audited Account Reset:</span>
            <p className="mt-1">
              Resetting will restore your virtual cash balance to <strong>₹10,00,000.00</strong>.
              All active open positions and delivery holdings will be cleared, and all pending orders cancelled.
              A permanent audit log of this reset event will be appended to your account ledger.
            </p>
          </div>
        </div>

        {/* Current Balance Summary */}
        {account && (
          <div className="bg-[#0B1424] p-3 rounded-xl border border-[#1F2D48] text-xs space-y-1">
            <div className="flex justify-between text-[#8F9BAE]">
              <span>Current Cash Balance:</span>
              <span className="font-mono text-white font-bold">
                ₹{account.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-[#8F9BAE]">
              <span>New Virtual Balance:</span>
              <span className="font-mono text-[#10B981] font-bold">₹10,00,000.00</span>
            </div>
          </div>
        )}

        {/* Reset Reason Input */}
        <div>
          <label className="block text-xs font-medium text-[#8F9BAE] mb-1.5">
            Reason for Reset (Recorded in Audit Ledger):
          </label>
          <input
            type="text"
            className="w-full bg-[#0B1424] border border-[#1F2D48] rounded-lg px-3 py-2 text-xs text-white placeholder-[#8F9BAE] focus:outline-none focus:border-[#C6A15B] transition-colors"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Testing new option buying strategy"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1F2D48]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#8F9BAE] hover:text-white hover:bg-[#14223A] transition-colors"
            disabled={isResetting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmReset}
            disabled={isResetting}
            className="px-4 py-2 bg-gradient-to-r from-[#C6A15B] to-[#E2C889] hover:from-[#B38F46] hover:to-[#D4B774] text-[#0B1424] text-xs font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isResetting ? 'Resetting...' : 'Confirm Reset to ₹10L'}
          </button>
        </div>
      </div>
    </div>
  );
};
