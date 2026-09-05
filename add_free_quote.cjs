const fs = require('fs');
let content = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

const heroButtons = `            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Link to="/login" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="w-full sm:w-auto px-8 py-4 bg-[#d97757] hover:bg-[#c46547] text-[#131314] rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(217,119,87,0.3)] hover:shadow-[0_0_30px_rgba(217,119,87,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-2">
                Start Journaling <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#features" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="w-full sm:w-auto px-8 py-4 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                View Features
              </a>
            </div>`;

const heroButtonsWithQuote = `            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Link to="/login" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="w-full sm:w-auto px-8 py-4 bg-[#d97757] hover:bg-[#c46547] text-[#131314] rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(217,119,87,0.3)] hover:shadow-[0_0_30px_rgba(217,119,87,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-2">
                Start Journaling <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#features" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="w-full sm:w-auto px-8 py-4 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                View Features
              </a>
            </div>
            
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
              <p className="text-sm font-medium text-[#8c8c8c] flex items-center justify-center gap-2 bg-[#18181b]/50 border border-white/5 py-2 px-4 rounded-full inline-flex">
                <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></span>
                "Built by traders, for traders. 100% Free Forever."
              </p>
            </div>`;

content = content.replace(heroButtons, heroButtonsWithQuote);
fs.writeFileSync('src/pages/Landing.tsx', content);
