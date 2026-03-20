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

    // Lógica Específica para Meli.la ou MercadoLivre
    if (url.includes("mercadolivre.com.br") || url.includes("meli.la")) {
      const formatedHtml = html.replace(/\n|\r/g, "");
      
      const firstFractionIndex = formatedHtml.indexOf('class="andes-money-amount__fraction"');
      if (firstFractionIndex !== -1) {
         const startIndex = Math.max(0, firstFractionIndex - 500);
         const endIndex = Math.min(formatedHtml.length, firstFractionIndex + 1000);
         const mainProductBlock = formatedHtml.substring(startIndex, endIndex);

         const matchPrevBlock = mainProductBlock.match(/<s[^>]*andes-money-amount--previous[^>]*>.*?<\/s>/i);
         if (matchPrevBlock) {
             const matchPrevFra = matchPrevBlock[0].match(/<span class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/);
             const matchPrevCen = matchPrevBlock[0].match(/<span class="andes-money-amount__cents[^>]*>([^<]+)<\/span>/);
             if (matchPrevFra) {
                originalPrice = "R$ " + matchPrevFra[1];
                if (matchPrevCen) {
                    originalPrice += "," + matchPrevCen[1];
                } else {
                    originalPrice += ",00";
                }
             }
             
             const remainingHtml = mainProductBlock.substring(mainProductBlock.indexOf(matchPrevBlock[0]) + matchPrevBlock[0].length);
             const matchFracao = remainingHtml.match(/<span class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/);
             const matchCentavos = remainingHtml.match(/<span class="andes-money-amount__cents[^>]*>([^<]+)<\/span>/);
             if (matchFracao) {
               price = "R$ " + matchFracao[1];
               if (matchCentavos) price += "," + matchCentavos[1];
               else price += ",00";
             }
         } else {
             const matchFracao = mainProductBlock.match(/<span class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/);
             const matchCentavos = mainProductBlock.match(/<span class="andes-money-amount__cents[^>]*>([^<]+)<\/span>/);
             if (matchFracao) {
               price = "R$ " + matchFracao[1];
               if (matchCentavos) price += "," + matchCentavos[1];
               else price += ",00";
             }
         }

         const matchDiscount = mainProductBlock.match(/>(\d+%?\s*OFF)</i);
         if (matchDiscount) {
            discount = matchDiscount[1];
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
    }
    // TODO: Adicionar lógica da amazon/shopee caso queira

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
