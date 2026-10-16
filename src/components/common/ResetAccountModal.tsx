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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030303]/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
          <div className="flex items-center gap-2 text-[#D4AF65]">
            <RotateCcw className="w-4 h-4" />
            <h3 className="text-sm font-bold font-cinzel text-[#F5F5F5] tracking-wide">Reset Paper Trading Account</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-[#F5F5F5] p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Callout */}
        <div className="p-3 bg-[#D4AF65]/10 border border-[#D4AF65]/25 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-[#D4AF65] shrink-0 mt-0.5" />
          <div className="text-xs text-[#A1A1AA] leading-relaxed">
            <span className="font-bold text-[#F5F5F5]">Audited Account Reset:</span>
            <p className="mt-1">
              Resetting will restore your virtual cash balance to <strong>₹10,00,000.00</strong>.
              All active open positions and delivery holdings will be cleared, and pending orders cancelled.
              A permanent audit log of this reset event will be appended to your ledger.
            </p>
          </div>
        </div>

        {/* Current Balance Summary */}
        {account && (
          <div className="bg-[#080808] p-3 rounded-lg border border-[#191919] text-xs space-y-1 font-mono">
            <div className="flex justify-between text-[#71717A]">
              <span>Current Cash Balance:</span>
              <span className="text-[#F5F5F5] font-bold">
                ₹{account.cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-[#71717A]">
              <span>New Virtual Balance:</span>
              <span className="text-[#00C087] font-bold">₹10,00,000.00</span>
            </div>
          </div>
        )}

        {/* Reset Reason Input */}
        <div>
          <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
            Reason for Reset (Recorded in Audit Ledger):
          </label>
          <input
            type="text"
            className="w-full bg-[#080808] border border-[#242424] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#D4AF65] transition-colors"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Testing new option buying strategy"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#242424]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#71717A] hover:text-[#F5F5F5] hover:bg-[#131313] transition-colors"
            disabled={isResetting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmReset}
            disabled={isResetting}
            className="px-3.5 py-1.5 bg-[#D4AF65] hover:bg-[#B38F46] text-[#030303] text-xs font-bold rounded-md shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {isResetting ? 'Resetting...' : 'Confirm Reset to ₹10L'}
          </button>
        </div>
      </div>
    </div>
  );
};
