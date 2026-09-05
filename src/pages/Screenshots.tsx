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
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-end border-b border-borderColor pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Screenshot Library</h1>
          <p className="text-sm text-textMuted">{filteredScreenshots.length} screenshots</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <select 
              value={phaseFilter} 
              onChange={e => setPhaseFilter(e.target.value)}
              className="appearance-none bg-surface border border-borderColor text-white text-sm rounded-lg pl-4 pr-10 py-2.5 outline-none focus:border-primary"
            >
              <option value="All Phases">All Phases</option>
              <option value="Before">Before</option>
              <option value="During">During</option>
              <option value="After">After</option>
            </select>
            <ChevronDown className="w-4 h-4 text-textMuted absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <select className="appearance-none bg-surface border border-borderColor text-white text-sm rounded-lg pl-4 pr-10 py-2.5 outline-none focus:border-primary">
              <option>All Accounts</option>
            </select>
            <ChevronDown className="w-4 h-4 text-textMuted absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredScreenshots.map(({ id, trade, phase, url }) => (
          <div 
            key={id} 
            className="bg-[#13151a] border border-[#2d323e] rounded-xl overflow-hidden hover:border-[#3d4250] transition-colors cursor-pointer group flex flex-col"
            onClick={() => setZoomedImage(url as string)}
          >
            {/* Image Container */}
            <div className="relative aspect-video bg-[#1a1d24] flex items-center justify-center overflow-hidden border-b border-[#2d323e]">
              <img src={url} alt={`${phase} Entry`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              
              {/* P&L Badge */}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded text-xs font-bold shadow-md ${trade.pnl >= 0 ? 'bg-success/20 text-success backdrop-blur-md' : 'bg-danger/20 text-danger backdrop-blur-md'}`}>
                  {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                </span>
              </div>
              
              {/* Phase Badge */}
              <div className="absolute bottom-2 left-2">
                <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/10">
                  {phase}
                </span>
              </div>

              {/* Hover overlay icon */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
            </div>
            
            {/* Details */}
            <div className="p-4 bg-[#13151a]">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-white text-sm">{trade.instrument} {trade.setup && `• ${trade.setup}`}</h3>
              </div>
              <p className="text-xs text-textMuted">{format(new Date(trade.date), 'yyyy-MM-dd')}</p>
            </div>
          </div>
        ))}

        {filteredScreenshots.length === 0 && (
          <div className="col-span-full py-20 text-center text-textMuted border border-dashed border-[#2d323e] rounded-xl bg-[#13151a]">
            No screenshots found. Add a trade and upload some screenshots!
          </div>
        )}
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-textMuted hover:text-white transition-colors p-2 bg-[#1a1d24] border border-[#2d323e] rounded-full"
            onClick={() => setZoomedImage(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img 
            src={zoomedImage} 
            alt="Zoomed Screenshot" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg border border-[#2d323e] shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}
