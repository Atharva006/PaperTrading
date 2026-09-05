const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace(
  '<title>trade-edge</title>',
  '<title>Trade Edge | Institutional Analytics</title>'
);

fs.writeFileSync('index.html', content);
