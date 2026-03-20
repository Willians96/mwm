---
name: Venda Afiliado
description: Como implementar uma loja de afiliados com extração e sincronização de preços dinâmicos (foco em Mercado Livre) usando Node.js e Serverless Functions.
---

# Skill: Venda Afiliado (Mercado Livre Price Scraper)

Esta skill documenta o padrão de arquitetura para criar vitrines de afiliados que puxam preços, descontos e imagens automaticamente de grandes varejistas através do backend, atualizando a interface do usuário em tempo real.

## Problema Resolvido
Lojas de afiliados sofrem com preços desatualizados. Se o afiliado cadastra "R$ 100", e o Mercado Livre muda para "R$ 150", o cliente se sente enganado. Fazer `fetch` direto do frontend para o Mercado Livre resulta em erro de **CORS**. A solução é usar uma **Serverless Function** (Vercel/Netlify) como proxy e crawler.

## Arquitetura

1. **Frontend (`produtos.js`)**: Lê localmente um banco de dados estático (`data/produtos.json`) contendo apenas os Links de Afiliado e Nomes. Ele renderiza placeholders (ex: "Consultar Site").
2. **Backend Serverless (`api/get-price.js`)**: Recebe a URL do frontend, realiza um `fetch` (sem CORS, pois roda no Node.js cloud), recebe o HTML da página e extrai os dados.
3. **Parse de Preços Sensível a Descontos**: O Mercado Livre usa formatações dinâmicas para ocultar precos antigos (usando tags randômicas como `s`, `del`, `span`). O backend utiliza varredura em array para mapear todas as frações numéricas sequenciais e deduzir o preço original e atual.

## Implementação Backend (O Motor de Busca)

Crie um arquivo `api/get-price.js` (se usar Vercel) ou `netlify/functions/get-price.js` (se usar Netlify) com a seguinte estrutura lógica robusta para Mercado Livre:

```javascript
export default async function handler(req, res) {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0'
            }
        });
        
        const html = await response.text();
        const formatedHtml = html.replace(/\n|\r/g, "");
        
        let price = "Consultar Site";
        let originalPrice = null;
        let discount = null;

        if (url.includes("mercadolivre.com.br") || url.includes("meli.la")) {
            const firstFractionIndex = formatedHtml.indexOf('class="andes-money-amount__fraction"');
            
            if (firstFractionIndex !== -1) {
                // Isola apenas o bloco HTML que contém os preços para evitar falsos positivos
                const startIndex = Math.max(0, firstFractionIndex - 1000);
                const endIndex = Math.min(formatedHtml.length, firstFractionIndex + 3000);
                const mainProductBlock = formatedHtml.substring(startIndex, endIndex);

                // Mapeia todas as frações e centavos na ordem em que aparecem visualmente
                const fractionRegex = /<span class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/gi;
                const fractionMatches = Array.from(mainProductBlock.matchAll(fractionRegex));
                let parsedPrices = [];

                for (const match of fractionMatches) {
                    const lookAhead = mainProductBlock.substring(match.index + match[0].length, match.index + match[0].length + 120);
                    const nextFractionIdx = lookAhead.indexOf('andes-money-amount__fraction');
                    const centsIdx = lookAhead.indexOf('andes-money-amount__cents');
                    
                    let centsVal = "00";
                    if (centsIdx !== -1 && (nextFractionIdx === -1 || centsIdx < nextFractionIdx)) {
                        const cMatch = lookAhead.match(/<span class="andes-money-amount__cents[^>]*>([^<]+)<\/span>/i);
                        if (cMatch) centsVal = cMatch[1];
                    }
                    parsedPrices.push({ fraction: match[1], cents: centsVal });
                }

                // Verifica se há selo de desconto ou tag de preço anterior
                let hasPreviousTag = mainProductBlock.match(/class=["'][^"']*andes-money-amount--previous[^"']*["']/i) !== null;
                const matchDiscount = mainProductBlock.match(/(\d+%\s*OFF)/i);

                if (matchDiscount || hasPreviousTag) {
                    if (parsedPrices.length >= 2) {
                        originalPrice = "R$ " + parsedPrices[0].fraction + "," + parsedPrices[0].cents;
                        price = "R$ " + parsedPrices[1].fraction + "," + parsedPrices[1].cents;
                        discount = matchDiscount ? matchDiscount[1] : null;
                    }
                } else {
                    if (parsedPrices.length >= 1) {
                        price = "R$ " + parsedPrices[0].fraction + "," + parsedPrices[0].cents;
                    }
                }
            }
            
            // Lógica para imagem (opcional)
            const matchImage = formatedHtml.match(/<img[^>]*class="ui-pdp-image ui-pdp-gallery__figure__image"[^>]*src="([^"]+)"/i);
            if (matchImage) {
                // Retorna imagem se ela não foi setada no frontend previamente
            }
        }

        res.status(200).json({ price, originalPrice, discount });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
```

## Implementação Frontend

Para exibir o dado adequadamente no Frontend HTML, o Javascript realiza chamadas assíncronas para carregar o visual no estilo Skeleton Text e depois substituir pelas informações reais assim que a Promise da API finalizar:

```javascript
fetch(`/api/get-price?url=${encodeURIComponent(linkDoAfiliado)}`)
  .then(resp => resp.json())
  .then(data => {
      const priceContainer = document.getElementById(`price-box`);
      
      if (data.originalPrice && data.discount) {
          priceContainer.innerHTML = `
            <div class="discount-area">
                <span class="original-price" style="text-decoration: line-through; color: #999;">${data.originalPrice}</span>
                <span class="discount-badge" style="color: #00a650;">${data.discount}</span>
            </div>
            <div class="current-price" style="color: #333; font-size: 1.5rem;">${data.price}</div>
          `;
      } else {
          priceContainer.textContent = data.price;
      }
  });
```

Este modelo garante que a loja sempre apresentará as promoções exatas ativas no varejista em tempo real, sem que o afiliado tenha que atualizar o banco de dados manualmente.
