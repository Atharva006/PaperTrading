import React from 'react';
import { useTradingStore } from '../../store/useTradingStore';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useTradingStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-4 h-4 text-[#536CF0]" />;
        let borderClass = 'border-[#536CF0]/30';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-[#12B76A]" />;
          borderClass = 'border-[#12B76A]/30';
        } else if (toast.type === 'error') {
          icon = <XCircle className="w-4 h-4 text-[#D92D20]" />;
          borderClass = 'border-[#D92D20]/30';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-[#F5B800]" />;
          borderClass = 'border-[#F5B800]/30';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 bg-white border ${borderClass} rounded-2xl shadow-[0_8px_30px_rgba(0,34,90,0.1)] transition-all duration-200 animate-in slide-in-from-bottom-2 text-[#111114]`}
          >
            <div className="mt-0.5 shrink-0">{icon}</div>
            <div className="flex-1 text-xs">
              <h4 className="font-bold font-display text-[#00225A] tracking-tight">{toast.title}</h4>
              <p className="text-[#6B7A90] mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#6B7A90] hover:text-[#00225A] p-1 rounded-lg hover:bg-[#F7F8FA] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};