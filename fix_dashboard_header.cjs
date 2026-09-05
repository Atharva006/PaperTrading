const fs = require('fs');
let content = fs.readFileSync('src/layouts/DashboardLayout.tsx', 'utf8');

const oldHeader = `<div className="flex items-center gap-2 mb-6">
            <span className="text-[13px] font-bold text-white tracking-widest">[ TRADE EDGE ]</span>
          </div>`;

const newHeader = `<div className="flex items-center gap-3 mb-6 group cursor-default">
            {/* Sleek Custom Logo Mark */}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#d97757] to-[#9b4931] flex items-center justify-center shadow-[0_0_15px_rgba(217,119,87,0.4)] relative overflow-hidden transition-transform group-hover:scale-105 duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="relative w-3 h-3 border-t-[2.5px] border-r-[2.5px] border-white transform -rotate-45 translate-y-[1px]" />
              <div className="absolute bottom-1.5 left-1.5 w-1 h-1 bg-white rounded-full" />
            </div>
            {/* Typography */}
            <span className="text-lg font-black tracking-tighter text-white">TRADE<span className="text-[#d97757]">EDGE</span></span>
          </div>`;

content = content.replace(oldHeader, newHeader);

// Now let's capitalize the user's name if they have one, or format the email
const oldUserDisplay = `<p className="text-white text-xs font-bold mb-1 truncate">{user?.email || 'Guest'}</p>`;
const newUserDisplay = `<p className="text-white text-xs font-bold mb-1 truncate capitalize">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest'}
            </p>`;

content = content.replace(oldUserDisplay, newUserDisplay);

fs.writeFileSync('src/layouts/DashboardLayout.tsx', content);
