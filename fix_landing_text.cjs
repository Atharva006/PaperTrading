const fs = require('fs');
let content = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

content = content.replace(
  "The top 1% of traders don't guess their metrics. They know them. Join the ranks of disciplined, funded traders today.",
  "The top 1% of market operators don't guess their edge. They calculate it. Step up to institutional-grade analytics today."
);

fs.writeFileSync('src/pages/Landing.tsx', content);
