fetch('https://s.shopee.com.br/60N1f8m863', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36'
  }
})
.then(r => r.text())
.then(html => {
  const fs = require('fs');
  fs.writeFileSync('shopee_raw.html', html);
  console.log("HTML length:", html.length);
  // check for json preload
  const match = html.match(/window\.__PRELOADED_STATE__\s*=\s*(\{.*?\});/);
  console.log("Has Preloaded State JS?:", !!match);
  if (match) {
    fs.writeFileSync('shopee_state.json', match[1]);
  }
})
.catch(e => console.error(e));
