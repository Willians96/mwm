const url = 'https://www.mercadolivre.com.br/monitor-gamer-aoc-24-180hz-05ms-ips-24g4p/p/MLB44895498';
fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9'
  }
}).then(r => r.text()).then(html => {
  const formatedHtml = html.replace(/\n|\r/g, "");
  
  const priceMatches = html.match(/class="[^"]*price[^"]*"[^>]*>([^<]+)/gi);
  console.log("Possible prices:");
  if (priceMatches) {
      console.log(priceMatches.slice(0, 15));
  }
  
  const moneyMatches = html.match(/class="[^"]*money[^"]*"[^>]*>([^<]+)/gi);
  console.log("Possible money classes:");
  if (moneyMatches) {
      console.log(moneyMatches.slice(0, 15));
  }
  
  const imgMatches = html.match(/<meta[^>]+image[^>]+>/gi);
  console.log("Images meta:");
  if(imgMatches) {
      console.log(imgMatches);
  }
}).catch(console.error);
