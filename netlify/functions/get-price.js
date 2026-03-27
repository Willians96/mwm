// Esta função rodará na infraestrutura gratuita do Netlify
exports.handler = async function(event, context) {
  const url = event.queryStringParameters.url;
  
  if (!url) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "URL não fornecida" })
    };
  }

  try {
    // Fazemos a requisição para a página como se fôssemos um navegador normal
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
      },
      // follow redirects (como os do meli.la)
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

    const finalUrl = response.url || url;

    // Lógica Específica para Meli.la ou MercadoLivre
    if (finalUrl.includes("mercadolivre.com.br") || finalUrl.includes("meli.la")) {
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

      // Procura a imagem do Produto (várias alternativas)
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
    } else if (finalUrl.includes("shopee.com.br") || finalUrl.includes("shope.ee")) {
      const matchItemId = finalUrl.match(/-i\.(\d+)\.(\d+)/) || finalUrl.match(/\/(\d+)\/(\d+)\??/);
      if (matchItemId) {
        const itemId = parseInt(matchItemId[2], 10);
        const appId = process.env.SHOPEE_APP_ID;
        const appSecret = process.env.SHOPEE_APP_SECRET;

        if (appId && appSecret) {
            const crypto = require('crypto');
            const apiUrl = 'https://open-api.affiliate.shopee.com.br/graphql';
            const timestamp = Math.floor(Date.now() / 1000).toString();
            const payload = JSON.stringify({ 
              query: `query { productOfferV2(itemId: ${itemId}) { nodes { price priceMin priceDiscountRate imageUrl } } }` 
            });
            
            const signString = appId + timestamp + payload + appSecret;
            const signature = crypto.createHash('sha256').update(signString).digest('hex');
            
            try {
              const shopeeRes = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`
                },
                body: payload
              });
              
              if (shopeeRes.ok) {
                  const sData = await shopeeRes.json();
                  const node = sData?.data?.productOfferV2?.nodes?.[0];
                  if (node) {
                      if (node.priceMin || node.price) {
                          const currentPrice = parseFloat(node.priceMin || node.price);
                          price = "R$ " + currentPrice.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                          
                          if (node.priceDiscountRate > 0) {
                              discount = node.priceDiscountRate + "% OFF";
                              const origPrice = currentPrice / (1 - (node.priceDiscountRate / 100));
                              originalPrice = "R$ " + origPrice.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                          }
                      }
                      if (node.imageUrl) {
                          image = node.imageUrl;
                      }
                  }
              }
            } catch (err) {
              console.error("Shopee API Error:", err);
            }
        } else {
            console.warn("Shopee API keys are missing in environment variables.");
        }
      }
    }

    return {
      statusCode: 200,
      headers: { 
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ price, originalPrice, discount, image, url })
    };
  } catch (error) {
    console.error("Erro na Extração:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Falha na extração de dados", details: error.message })
    };
  }
};
