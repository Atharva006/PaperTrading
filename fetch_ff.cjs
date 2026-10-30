const https = require('https');
https.get('https://nfs.faireconomy.media/ff_calendar_thisweek.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data.substring(0, 500));
    console.log("Has actual?", data.includes("actual"));
  });
}).on('error', err => console.error(err));


