import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { ChevronDown, Search, Maximize2, X } from 'lucide-react';

export default function Screenshots() {
  const { trades } = useStore();
  const [phaseFilter, setPhaseFilter] = useState('All Phases');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Extract all screenshots from trades into a flat list
  const allScreenshots = trades.flatMap(trade => {
    const screens = [];
    if (trade.screenshotBefore) {
      screens.push({ id: `${trade.id}-before`, trade, phase: 'Before', url: trade.screenshotBefore });
    }
    if (trade.screenshotDuring) {
      screens.push({ id: `${trade.id}-during`, trade, phase: 'During', url: trade.screenshotDuring });
    }
    if (trade.screenshotAfter) {
      screens.push({ id: `${trade.id}-after`, trade, phase: 'After', url: trade.screenshotAfter });
    }
    return screens;
  });

  const filteredScreenshots = allScreenshots.filter(s => {
    if (phaseFilter !== 'All Phases' && s.phase !== phaseFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12 text-[#111114]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-[#D9E2F2] pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#00225A] mb-1">Screenshot Library</h1>
          <p className="text-sm text-[#6B7A90] font-mono">{filteredScreenshots.length} screenshots</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select 
              value={phaseFilter} 
              onChange={e => setPhaseFilter(e.target.value)}
              className="appearance-none bg-white border border-[#D9E2F2] text-[#00225A] font-semibold text-sm rounded-xl pl-4 pr-10 py-2.5 outline-none focus:border-[#536CF0] shadow-xs cursor-pointer"
            >
              <option value="All Phases">All Phases</option>
              <option value="Before">Before</option>
              <option value="During">During</option>
              <option value="After">After</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#6B7A90] absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <select className="appearance-none bg-white border border-[#D9E2F2] text-[#00225A] font-semibold text-sm rounded-xl pl-4 pr-10 py-2.5 outline-none focus:border-[#536CF0] shadow-xs cursor-pointer">
              <option>All Accounts</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#6B7A90] absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredScreenshots.map(({ id, trade, phase, url }) => (
          <div 
            key={id} 
            className="bg-white border border-[#D9E2F2] rounded-2xl overflow-hidden hover:border-[#536CF0]/40 shadow-[0_2px_12px_rgba(0,34,90,0.04)] hover:shadow-[0_4px_16px_rgba(0,34,90,0.08)] transition-all cursor-pointer group flex flex-col"
            onClick={() => setZoomedImage(url as string)}
          >
            {/* Image Container */}
            <div className="relative aspect-video bg-[#F7F8FA] flex items-center justify-center overflow-hidden border-b border-[#D9E2F2]">
              <img src={url} alt={`${phase} Entry`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              
              {/* P&L Badge */}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-md text-xs font-bold font-mono shadow-xs ${trade.pnl >= 0 ? 'bg-[#12B76A]/15 text-[#12B76A] border border-[#12B76A]/30 backdrop-blur-md' : 'bg-[#D92D20]/15 text-[#D92D20] border border-[#D92D20]/30 backdrop-blur-md'}`}>
                  {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                </span>
              </div>
              
              {/* Phase Badge */}
              <div className="absolute bottom-2 left-2">
                <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono bg-white/90 text-[#00225A] backdrop-blur-md border border-[#D9E2F2]">
                  {phase}
                </span>
              </div>

              {/* Hover overlay icon */}
              <div className="absolute inset-0 bg-[#00225A]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-6 h-6 text-white drop-shadow-md" />
              </div>
            </div>
            
            {/* Details */}
            <div className="p-4 bg-white">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-[#00225A] text-sm">{trade.instrument} {trade.setup && `• ${trade.setup}`}</h3>
              </div>
              <p className="text-xs text-[#6B7A90] font-mono">{format(new Date(trade.date), 'yyyy-MM-dd')}</p>
            </div>
          </div>
        ))}

        {filteredScreenshots.length === 0 && (
          <div className="col-span-full py-20 text-center text-[#6B7A90] border border-dashed border-[#D9E2F2] rounded-2xl bg-white shadow-xs">
            No screenshots found. Add a trade and upload some screenshots!
          </div>
        )}
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-[#00225A]/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-white/80 transition-colors p-2.5 bg-[#00225A] border border-white/20 rounded-full cursor-pointer shadow-lg"
            onClick={() => setZoomedImage(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img 
            src={zoomedImage} 
            alt="Zoomed Screenshot" 
            className="max-w-full max-h-[90vh] object-contain rounded-2xl border border-[#D9E2F2] shadow-2xl bg-white"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}