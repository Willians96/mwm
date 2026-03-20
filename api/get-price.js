export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const url = req.query.url;
  
  if (!url) {
    return res.status(400).json({ error: "URL não fornecida" });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
      },
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const html = await response.text();
    let price = "Consultar Site";
    let originalPrice = null;
    let discount = null;
    let image = "";

    if (url.includes("mercadolivre.com.br") || url.includes("meli.la")) {
      const formatedHtml = html.replace(/\n|\r/g, "");
      
      const firstFractionIndex = formatedHtml.indexOf('class="andes-money-amount__fraction"');
      if (firstFractionIndex !== -1) {
         const startIndex = Math.max(0, firstFractionIndex - 1000);
         const endIndex = Math.min(formatedHtml.length, firstFractionIndex + 3000);
         const mainProductBlock = formatedHtml.substring(startIndex, endIndex);

         // Mapear todas as frações e seus respectivos centavos
         const fractionRegex = /<span class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/gi;
         const fractionMatches = Array.from(mainProductBlock.matchAll(fractionRegex));
         let parsedPrices = [];

         for (const match of fractionMatches) {
             const fractionVal = match[1];
             const lookAhead = mainProductBlock.substring(match.index + match[0].length, match.index + match[0].length + 120);
             
             const nextFractionIdx = lookAhead.indexOf('andes-money-amount__fraction');
             const centsIdx = lookAhead.indexOf('andes-money-amount__cents');
             
             let centsVal = "00";
             if (centsIdx !== -1 && (nextFractionIdx === -1 || centsIdx < nextFractionIdx)) {
                 const cMatch = lookAhead.match(/<span class="andes-money-amount__cents[^>]*>([^<]+)<\/span>/i);
                 if (cMatch) centsVal = cMatch[1];
             }
             parsedPrices.push({ fraction: fractionVal, cents: centsVal });
         }

         let hasPreviousTag = mainProductBlock.match(/class=["'][^"']*andes-money-amount--previous[^"']*["']/i) !== null;
         const matchDiscount = mainProductBlock.match(/(\d+%\s*OFF)/i);

         if (matchDiscount || hasPreviousTag) {
             if (parsedPrices.length >= 2) {
                 originalPrice = "R$ " + parsedPrices[0].fraction + "," + parsedPrices[0].cents;
                 price = "R$ " + parsedPrices[1].fraction + "," + parsedPrices[1].cents;
                 discount = matchDiscount ? matchDiscount[1] : null;
             } else if (parsedPrices.length === 1) {
                 price = "R$ " + parsedPrices[0].fraction + "," + parsedPrices[0].cents;
             }
         } else {
             if (parsedPrices.length >= 1) {
                 price = "R$ " + parsedPrices[0].fraction + "," + parsedPrices[0].cents;
             }
         }
      }

      const matchImg = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      const matchImgTw = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
      const matchMlsWebp = html.match(/https:\/\/http2\.mlstatic\.com\/D_NQ_NP_[A-Za-z0-9_]+\.webp/);
      const matchMlsJpg = html.match(/https:\/\/http2\.mlstatic\.com\/D_NQ_NP_[A-Za-z0-9_]+\.jpg/);
      const fallbackImg = html.match(/<img[^>]+ui-pdp-gallery__figure__image[^>]+src=["']([^"']+)["']/i);

      if (matchImg) image = matchImg[1];
      else if (matchImgTw) image = matchImgTw[1];
      else if (matchMlsWebp) image = matchMlsWebp[0];
      else if (matchMlsJpg) image = matchMlsJpg[0];
      else if (fallbackImg) image = fallbackImg[1];
    }

    return res.status(200).json({ price, originalPrice, discount, image, url });
  } catch (error) {
    console.error("Erro na Extração:", error);
    return res.status(500).json({ error: "Falha na extração de dados", details: error.message });
  }
}
