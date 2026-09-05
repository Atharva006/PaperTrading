import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { ArrowLeft, Edit2, Trash2, Maximize2, X } from 'lucide-react';
import type { Trade } from '../data/mockData';

export default function TradeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trades, deleteTrade, setEditingTradeId } = useStore();
  
  const trade = trades.find(t => t.id === id);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  if (!trade) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-xl font-medium tracking-tight text-[#e5e5e5] mb-4">Trade not found</h2>
        <button onClick={() => navigate('/dashboard/journal')} className="px-4 py-2 bg-[#18181b]/50 border border-white/5 rounded-lg text-sm text-[#e5e5e5] hover:bg-white/5 transition-colors">
          Back to Journal
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this trade?')) {
      await deleteTrade(trade.id);
      navigate('/dashboard/journal');
    }
  };

  const handleEdit = () => {
    setEditingTradeId(trade.id);
    navigate('/dashboard/journal');
  };

  const images = [
    { label: 'Before Entry', url: trade.screenshotBefore },
    { label: 'During Trade', url: trade.screenshotDuring },
    { label: 'After Exit', url: trade.screenshotAfter },
  ].filter(img => img.url);

  return (
    <div className="max-w-[1200px] mx-auto pb-12 space-y-6">
      <button onClick={() => navigate('/dashboard/journal')} className="flex items-center gap-2 text-sm font-medium text-[#8c8c8c] hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Journal
      </button>

      <div className="flex justify-between items-center bg-[#18181b]/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${trade.direction === 'Long' ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20' : 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20'}`}>
              {trade.direction}
            </span>
            <h1 className="text-2xl font-medium tracking-tight text-[#e5e5e5]">{trade.instrument}</h1>
          </div>
          <p className="text-[#8c8c8c] text-sm">
            {format(new Date(trade.date), 'MMMM d, yyyy • h:mm a')}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleEdit} className="px-4 py-2 bg-[#18181b] border border-white/10 rounded-lg text-sm font-medium text-[#e5e5e5] hover:bg-white/5 transition-colors flex items-center gap-2">
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button onClick={handleDelete} className="px-4 py-2 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg text-sm font-medium text-[#ef4444] hover:bg-[#ef4444]/20 transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl md:col-span-2">
          <h3 className="text-sm font-semibold text-[#8c8c8c] uppercase tracking-wider mb-6">Execution Summary</h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-[#8c8c8c] mb-1">Entry Price</p>
              <p className="text-lg font-medium text-[#e5e5e5]">{trade.entry}</p>
            </div>
            <div>
              <p className="text-xs text-[#8c8c8c] mb-1">Stop Loss</p>
              <p className="text-lg font-medium text-danger/90">{trade.stopLoss}</p>
            </div>
            <div>
              <p className="text-xs text-[#8c8c8c] mb-1">Take Profit</p>
              <p className="text-lg font-medium text-success/90">{trade.takeProfit}</p>
            </div>
            <div>
              <p className="text-xs text-[#8c8c8c] mb-1">Exit Price</p>
              <p className="text-lg font-medium text-[#e5e5e5]">{trade.exit || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-[#8c8c8c] mb-1">Quantity</p>
              <p className="text-lg font-medium text-[#e5e5e5]">{trade.quantity}</p>
            </div>
            <div>
              <p className="text-xs text-[#8c8c8c] mb-1">Net P&L</p>
              <p className={`text-xl font-medium tracking-tight ${trade.pnl >= 0 ? 'text-success/90' : 'text-danger/90'}`}>
                {trade.pnl >= 0 ? '+' : '-'}${Math.abs(trade.pnl).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl">
          <h3 className="text-sm font-semibold text-[#8c8c8c] uppercase tracking-wider mb-6">Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#8c8c8c]">Risk Amount</span>
              <span className="text-sm font-medium text-[#e5e5e5]">${trade.riskAmount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#8c8c8c]">R-Multiple</span>
              <span className={`text-sm font-medium ${trade.rr >= 1 ? 'text-success/90' : 'text-danger/90'}`}>{trade.rr}R</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#8c8c8c]">Fees/Commissions</span>
              <span className="text-sm font-medium text-[#e5e5e5]">${((trade.fees || 0) + (trade.commission || 0)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-[#8c8c8c] uppercase tracking-wider mb-3">Pre-Trade Thesis</h3>
          <p className="text-sm text-[#e5e5e5] bg-[#18181b]/60 p-4 rounded-xl leading-relaxed whitespace-pre-wrap border border-white/5">{trade.preTradeThesis || 'No thesis recorded.'}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#8c8c8c] uppercase tracking-wider mb-3">Post-Trade Review</h3>
          <p className="text-sm text-[#e5e5e5] bg-[#18181b]/60 p-4 rounded-xl leading-relaxed whitespace-pre-wrap border border-white/5">{trade.postTradeReview || 'No review recorded.'}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-[#8c8c8c] uppercase tracking-wider mb-3">Mistakes</h3>
            <p className="text-sm text-danger/80 bg-danger/5 p-4 rounded-xl leading-relaxed whitespace-pre-wrap border border-danger/10">{trade.mistakes || 'None recorded.'}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#8c8c8c] uppercase tracking-wider mb-3">Lessons</h3>
            <p className="text-sm text-success/80 bg-success/5 p-4 rounded-xl leading-relaxed whitespace-pre-wrap border border-success/10">{trade.lesson || 'None recorded.'}</p>
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="bg-[#18181b]/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl">
          <h3 className="text-sm font-semibold text-[#8c8c8c] uppercase tracking-wider mb-6">Screenshots</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {images.map((img, i) => (
              <div key={i} className="group relative rounded-xl overflow-hidden border border-white/5 bg-[#18181b]">
                <div className="aspect-video">
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => setZoomedImage(img.url || null)} className="bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-colors text-white">
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <span className="text-xs font-semibold text-white">{img.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {zoomedImage && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setZoomedImage(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
            <X className="w-8 h-8" />
          </button>
          <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
}
