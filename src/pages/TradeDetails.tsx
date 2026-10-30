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
      <div className="flex flex-col items-center justify-center h-[60vh] text-[#111114]">
        <h2 className="text-xl font-bold font-display text-[#00225A] mb-4">Trade not found</h2>
        <button onClick={() => navigate('/dashboard/journal')} className="px-4 py-2 bg-white border border-[#D9E2F2] rounded-xl text-sm text-[#00225A] font-semibold hover:bg-[#F7F8FA] transition-colors shadow-xs cursor-pointer">
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
    <div className="max-w-[1200px] mx-auto pb-12 space-y-6 text-[#111114] font-sans">
      <button onClick={() => navigate('/dashboard/journal')} className="flex items-center gap-2 text-sm font-semibold text-[#6B7A90] hover:text-[#00225A] transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back to Journal
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#D9E2F2] p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono border ${trade.direction === 'Long' ? 'bg-[#12B76A]/10 text-[#12B76A] border-[#12B76A]/20' : 'bg-[#D92D20]/10 text-[#D92D20] border-[#D92D20]/20'}`}>
              {trade.direction}
            </span>
            <h1 className="text-2xl font-bold font-display tracking-tight text-[#00225A]">{trade.instrument}</h1>
          </div>
          <p className="text-[#6B7A90] text-xs font-mono">
            {format(new Date(trade.date), 'MMMM d, yyyy • h:mm a')}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleEdit} className="px-4 py-2 bg-white border border-[#D9E2F2] rounded-xl text-sm font-semibold text-[#00225A] hover:bg-[#F7F8FA] transition-colors flex items-center gap-2 shadow-xs cursor-pointer">
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button onClick={handleDelete} className="px-4 py-2 bg-[#D92D20]/10 border border-[#D92D20]/20 rounded-xl text-sm font-semibold text-[#D92D20] hover:bg-[#D92D20] hover:text-white transition-colors flex items-center gap-2 shadow-xs cursor-pointer">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#D9E2F2] p-6 rounded-2xl md:col-span-2 shadow-[0_2px_12px_rgba(0,34,90,0.04)] font-mono">
          <h3 className="text-xs font-bold text-[#6B7A90] uppercase tracking-wider mb-6 font-mono">Execution Summary</h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-[#6B7A90] mb-1 font-sans">Entry Price</p>
              <p className="text-lg font-bold text-[#00225A]">{trade.entry}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7A90] mb-1 font-sans">Stop Loss</p>
              <p className="text-lg font-bold text-[#D92D20]">{trade.stopLoss}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7A90] mb-1 font-sans">Take Profit</p>
              <p className="text-lg font-bold text-[#12B76A]">{trade.takeProfit}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7A90] mb-1 font-sans">Exit Price</p>
              <p className="text-lg font-bold text-[#00225A]">{trade.exit || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7A90] mb-1 font-sans">Quantity</p>
              <p className="text-lg font-bold text-[#00225A]">{trade.quantity}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7A90] mb-1 font-sans">Net P&L</p>
              <p className={`text-xl font-bold tracking-tight ${trade.pnl >= 0 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>
                {trade.pnl >= 0 ? '+' : '-'}${Math.abs(trade.pnl).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#D9E2F2] p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,34,90,0.04)] font-mono">
          <h3 className="text-xs font-bold text-[#6B7A90] uppercase tracking-wider mb-6 font-mono">Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#6B7A90] font-sans">Risk Amount</span>
              <span className="text-sm font-bold text-[#00225A]">${trade.riskAmount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#6B7A90] font-sans">R-Multiple</span>
              <span className={`text-sm font-bold ${trade.rr >= 1 ? 'text-[#12B76A]' : 'text-[#D92D20]'}`}>{trade.rr}R</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#6B7A90] font-sans">Fees/Commissions</span>
              <span className="text-sm font-bold text-[#00225A]">${((trade.fees || 0) + (trade.commission || 0)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#D9E2F2] p-6 rounded-2xl space-y-6 shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
        <div>
          <h3 className="text-xs font-bold text-[#6B7A90] uppercase tracking-wider mb-3 font-mono">Pre-Trade Thesis</h3>
          <p className="text-sm text-[#111114] bg-[#F7F8FA] p-4 rounded-xl leading-relaxed whitespace-pre-wrap border border-[#D9E2F2]">{trade.preTradeThesis || 'No thesis recorded.'}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold text-[#6B7A90] uppercase tracking-wider mb-3 font-mono">Post-Trade Review</h3>
          <p className="text-sm text-[#111114] bg-[#F7F8FA] p-4 rounded-xl leading-relaxed whitespace-pre-wrap border border-[#D9E2F2]">{trade.postTradeReview || 'No review recorded.'}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-bold text-[#6B7A90] uppercase tracking-wider mb-3 font-mono">Mistakes</h3>
            <p className="text-sm text-[#D92D20] bg-[#D92D20]/5 p-4 rounded-xl leading-relaxed whitespace-pre-wrap border border-[#D92D20]/20">{trade.mistakes || 'None recorded.'}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#6B7A90] uppercase tracking-wider mb-3 font-mono">Lessons</h3>
            <p className="text-sm text-[#12B76A] bg-[#12B76A]/5 p-4 rounded-xl leading-relaxed whitespace-pre-wrap border border-[#12B76A]/20">{trade.lesson || 'None recorded.'}</p>
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="bg-white border border-[#D9E2F2] p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,34,90,0.04)]">
          <h3 className="text-xs font-bold text-[#6B7A90] uppercase tracking-wider mb-6 font-mono">Screenshots</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {images.map((img, i) => (
              <div key={i} className="group relative rounded-xl overflow-hidden border border-[#D9E2F2] bg-[#F7F8FA]">
                <div className="aspect-video">
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-[#00225A]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => setZoomedImage(img.url || null)} className="bg-white p-3 rounded-full shadow-lg transition-colors text-[#00225A] hover:bg-[#F7F8FA] cursor-pointer">
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
        <div className="fixed inset-0 bg-[#00225A]/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setZoomedImage(null)}>
          <button className="absolute top-6 right-6 text-white hover:text-white/80 transition-colors p-2.5 bg-[#00225A] border border-white/20 rounded-full cursor-pointer shadow-lg">
            <X className="w-5 h-5" />
          </button>
          <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl bg-white border border-[#D9E2F2]" />
        </div>
      )}
    </div>
  );
}