const fs = require('fs');

let content = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

const oldLogo1 = `<span className="text-[13px] font-bold text-white tracking-widest">[ TRADE EDGE ]</span>`;
const newLogo1 = `<div className="flex items-center gap-2 group cursor-none">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#d97757] to-[#9b4931] flex items-center justify-center shadow-[0_0_10px_rgba(217,119,87,0.4)] relative overflow-hidden transition-transform group-hover:scale-105 duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="relative w-2.5 h-2.5 border-t-[2px] border-r-[2px] border-white transform -rotate-45 translate-y-[1px]" />
              <div className="absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full" />
            </div>
            <span className="text-sm font-black tracking-tighter text-white">TRADE<span className="text-[#d97757]">EDGE</span></span>
          </div>`;

const oldLogo2 = `<span className="text-[13px] font-bold text-[#8c8c8c] tracking-widest">[ TRADE EDGE ]</span>`;
const newLogo2 = `<div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
              <div className="w-5 h-5 rounded bg-[#d97757] flex items-center justify-center relative overflow-hidden">
                <div className="relative w-2 h-2 border-t-[1.5px] border-r-[1.5px] border-white transform -rotate-45 translate-y-[0.5px]" />
              </div>
              <span className="text-xs font-black tracking-tighter text-[#8c8c8c]">TRADE<span className="text-[#d97757]">EDGE</span></span>
            </div>`;

content = content.replace(oldLogo1, newLogo1);
content = content.replace(oldLogo2, newLogo2);

fs.writeFileSync('src/pages/Landing.tsx', content);

let layoutContent = fs.readFileSync('src/layouts/DashboardLayout.tsx', 'utf8');

const oldDashboardLogo = `<div className="flex items-center gap-2 px-2 mb-8">
          <BarChart2 className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-textMain tracking-tight">TradeEdge</span>
        </div>`;
const newDashboardLogo = `<div className="flex items-center gap-3 px-2 mb-8 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d97757] to-[#9b4931] flex items-center justify-center shadow-[0_0_15px_rgba(217,119,87,0.4)] relative overflow-hidden transition-transform group-hover:scale-105 duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="relative w-3.5 h-3.5 border-t-[2.5px] border-r-[2.5px] border-white transform -rotate-45 translate-y-[1.5px]" />
            <div className="absolute bottom-1.5 left-1.5 w-1 h-1 bg-white rounded-full" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">TRADE<span className="text-[#d97757]">EDGE</span></span>
        </div>`;

layoutContent = layoutContent.replace(oldDashboardLogo, newDashboardLogo);
fs.writeFileSync('src/layouts/DashboardLayout.tsx', layoutContent);
