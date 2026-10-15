import React from 'react';
import { useTradingStore } from '../../store/useTradingStore';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useTradingStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-4 h-4 text-[#3b82f6]" />;
        let borderClass = 'border-[#3b82f6]/30';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />;
          borderClass = 'border-[#22c55e]/30';
        } else if (toast.type === 'error') {
          icon = <XCircle className="w-4 h-4 text-[#ef4444]" />;
          borderClass = 'border-[#ef4444]/30';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />;
          borderClass = 'border-[#f59e0b]/30';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 bg-[#0E1728]/95 backdrop-blur-md border ${borderClass} rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.7)] transition-all duration-300 animate-in slide-in-from-bottom-2`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-white tracking-tight">{toast.title}</h4>
              <p className="text-[#8F9BAE] mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#8F9BAE] hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
