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
    let image = "";

    // Lógica Específica para Meli.la ou MercadoLivre
    if (url.includes("mercadolivre.com.br") || url.includes("meli.la")) {
      // Pega o valor inteiro
      const formatedHtml = html.replace(/\n|\r/g, "");
      const matchFracao = formatedHtml.match(/<span class="andes-money-amount__fraction"\s*>([^<]+)<\/span>/);
      const matchCentavos = formatedHtml.match(/<span class="andes-money-amount__cents[^>]*>([^<]+)<\/span>/);
      
      if (matchFracao) {
        price = "R$ " + matchFracao[1];
        if (matchCentavos) {
           price += "," + matchCentavos[1];
        }
      }

      // Procura a imagem do Produto (no OpenGraph)
      const matchImg = html.match(/<meta property="og:image" content="([^"]+)"/i);
      if (matchImg) {
        image = matchImg[1];
      }
    }
    // TODO: Adicionar lógica da amazon/shopee caso queira

    return {
      statusCode: 200,
      headers: { 
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ price: price, image: image, url: url })
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
