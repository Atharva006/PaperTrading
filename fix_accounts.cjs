const fs = require('fs');
const file = 'src/pages/Accounts.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add trades to useStore destructuring
content = content.replace(
  'const { accounts, addAccount, deleteAccount, setActiveAccount } = useStore();',
  'const { accounts, addAccount, deleteAccount, setActiveAccount, trades } = useStore();'
);

// 2. Add targetPercent and drawdownPercent to form state
content = content.replace(
  'const [status, setStatus] = useState(\'Challenge\');',
  'const [status, setStatus] = useState(\'Challenge\');\n  const [targetPercent, setTargetPercent] = useState(10);\n  const [drawdownPercent, setDrawdownPercent] = useState(8);'
);

// 3. Update handleAddAccount
content = content.replace(
  'profitTarget: sz + (sz * 0.06),',
  'profitTarget: sz + (sz * (targetPercent / 100)),'
);
content = content.replace(
  'maxDrawdown: sz - (sz * 0.08),',
  'maxDrawdown: sz - (sz * (drawdownPercent / 100)),'
);

// 4. Calculate liveBalance in map
content = content.replace(
  '{accounts.map(account => (',
  '{accounts.map(account => {\n          const accountTrades = trades.filter(t => t.accountId === account.id);\n          const totalPnl = accountTrades.reduce((s, t) => s + t.pnl, 0);\n          const liveBalance = account.startingBalance + totalPnl;\n          return ('
);
// replace closing tag of the map
content = content.replace(
  '        ))}    ', // wait, the closing tag is `        ))}` in the original
  '        ))}'
);

// We'll replace all instances of account.currentBalance with liveBalance inside the mapped JSX
// Actually, it's safer to just do a string replacement for the relevant block.
let lines = content.split('\n');
let mappedIdx = lines.findIndex(l => l.includes('{accounts.map(account => {'));
let endMapIdx = lines.findIndex(l => l.includes('))}'));

if (mappedIdx !== -1) {
    for (let i = mappedIdx; i < endMapIdx; i++) {
        lines[i] = lines[i].replace(/account\.currentBalance/g, 'liveBalance');
    }
}
content = lines.join('\n');
content = content.replace('))}','          );\n        })}');


// 5. Add range sliders for Other
const sliders = `
              {isOther && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#8c8c8c] mb-1.5 flex justify-between">
                      Profit Target <span>{targetPercent}%</span>
                    </label>
                    <input type="range" min="1" max="20" value={targetPercent} onChange={e => setTargetPercent(Number(e.target.value))} className="w-full accent-[#d97757]" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#8c8c8c] mb-1.5 flex justify-between">
                      Max Drawdown <span>{drawdownPercent}%</span>
                    </label>
                    <input type="range" min="1" max="20" value={drawdownPercent} onChange={e => setDrawdownPercent(Number(e.target.value))} className="w-full accent-[#d97757]" />
                  </div>
                </div>
              )}
`;

content = content.replace(
  '{/* Status — Challenge/Funded for known firms, Phase 1/2/Master for Other */}',
  sliders + '\n              {/* Status — Challenge/Funded for known firms, Phase 1/2/Master for Other */}'
);

fs.writeFileSync(file, content);
