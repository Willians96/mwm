const fs = require('fs');

async function getML() {
  const url = 'https://produto.mercadolivre.com.br/MLB-4395648588-monitor-aoc-24-gamer-165hz-1ms-1ms-vga-hdmi-dp-_JM';
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });
  const html = await response.text();
  fs.writeFileSync('ml_temp.html', html);
  
  const formatedHtml = html.replace(/\n|\r/g, "");
  
  // existing logic
  console.log("Main Fracao:", formatedHtml.match(/<span class="andes-money-amount__fraction"\s*>([^<]+)<\/span>/)?.[1]);

  // Try to find previous price
  // <s class="andes-money-amount andes-money-amount--previous" ...> ... <span class="andes-money-amount__fraction">...</span>
  // <span class="ui-pdp-price__original-value">
  const origHTML = formatedHtml.match(/<s[^>]*andes-money-amount[^>]*>.*?<\/s>/);
  if (origHTML) {
    console.log("Original Price tag HTML:", origHTML[0]);
    console.log("Original Price Fraction:", origHTML[0].match(/<span class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/)?.[1]);
  } else {
    // new style
    const origHTML2 = formatedHtml.match(/<span[^>]*ui-pdp-price__original-value[^>]*>.*?<\/span>/);
    if(origHTML2) {
      console.log("Original Price tag HTML2:", origHTML2[0]);
      console.log("Original Price Fraction2:", origHTML2[0].match(/<span class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/)?.[1]);
    }
  }

  // Try to find discount
  // >60% OFF<
  const discount = formatedHtml.match(/>(\d+%\s*OFF)</i);
  console.log("Discount:", discount?.[1]);
}

getML();
