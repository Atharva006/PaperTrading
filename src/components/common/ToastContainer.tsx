import React from 'react';
import { useTradingStore } from '../../store/useTradingStore';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useTradingStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-4 h-4 text-[#60A5FA]" />;
        let borderClass = 'border-[#60A5FA]/30';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-[#00C087]" />;
          borderClass = 'border-[#00C087]/30';
        } else if (toast.type === 'error') {
          icon = <XCircle className="w-4 h-4 text-[#FF4D67]" />;
          borderClass = 'border-[#FF4D67]/30';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-[#D4AF65]" />;
          borderClass = 'border-[#D4AF65]/30';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 bg-[#0D0D0D] border ${borderClass} rounded-xl shadow-2xl transition-all duration-200 animate-in slide-in-from-bottom-2`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-[#F5F5F5] tracking-tight">{toast.title}</h4>
              <p className="text-[#A1A1AA] mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#71717A] hover:text-[#F5F5F5] p-1 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
