---
name: Venda Afiliado
description: Como implementar uma loja de afiliados com extração e sincronização de preços dinâmicos (Mercado Livre e Shopee) usando Node.js e Serverless Functions.
---

# Skill: Venda Afiliado (Mercado Livre & Shopee Price Resolver)

Esta skill documenta o padrão de arquitetura para criar vitrines de afiliados que puxam preços, descontos e imagens automaticamente de grandes varejistas através do backend, atualizando a interface do usuário em tempo real.

## Problema Resolvido
Lojas de afiliados sofrem com preços desatualizados. Se o afiliado cadastra "R$ 100", e a loja muda para "R$ 150", o cliente se sente enganado. Fazer `fetch` direto do frontend para grandes redes resulta em erro de **CORS** ou bloqueios de bots severos. A solução é usar uma **Serverless Function** (Vercel/Netlify) como proxy inteligente.

## Arquitetura

1. **Frontend (`produtos.js`)**: Lê localmente um banco de dados estático (`data/produtos.json`) contendo apenas os Links de Afiliado e Nomes. Ele renderiza placeholders (ex: "Consultar Site").
2. **Backend Serverless (`api/get-price.js`)**: Recebe a URL do frontend e bifurca a lógica dependendo da plataforma.

## Implementação Backend (O Motor de Busca)

Crie um arquivo `api/get-price.js` (se usar Vercel) ou `netlify/functions/get-price.js` (se usar Netlify) cobrindo ambas as plataformas:

### 1. Mercado Livre (Raspagem de HTML)
O Mercado Livre usa formatações dinâmicas para ocultar precos antigos (usando tags randômicas como `s`, `del`, `span`). O backend realiza um \`fetch\` (sem CORS), baixa o HTML e utiliza varredura Regex em array para mapear todas as frações numéricas (\`andes-money-amount__fraction\`) sequenciais, deduzindo o preço original e atual.

### 2. Shopee (Plataforma Aberta GraphQL + HMAC)
A Shopee **bloqueia agressivamente raspagem direta** devolvendo "Access Denied (Erro 90309999)". A solução nativa é:
- Utilizar a API GraphQL Aberta da Shopee (`https://open-api.affiliate.shopee.com.br/graphql`).
- Obter um `SHOPEE_APP_ID` e `SHOPEE_APP_SECRET` no painel oficial do Afiliado.
- Criptografar as requisições com assinatura **HMAC-SHA256**. Exemplo:

```javascript
import crypto from 'crypto';

// Captura a URL real após possíveis redirecionamentos (ex: s.shopee.com.br/xxxxx -> shopee.com.br/Produto-i.SHOPID.ITEMID)
const finalUrl = response.url || url;
const matchItemId = finalUrl.match(/-i\.(\d+)\.(\d+)/) || finalUrl.match(/\/(\d+)\/(\d+)\??/);

if (matchItemId) {
    const itemId = parseInt(matchItemId[2], 10);
    const appId = process.env.SHOPEE_APP_ID;
    const appSecret = process.env.SHOPEE_APP_SECRET;
    
    const apiUrl = 'https://open-api.affiliate.shopee.com.br/graphql';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = JSON.stringify({ 
      query: \`query { productOfferV2(itemId: ${itemId}) { nodes { price priceMin priceDiscountRate imageUrl } } }\` 
    });
    
    const signString = appId + timestamp + payload + appSecret;
    const signature = crypto.createHash('sha256').update(signString).digest('hex');
    
    const shopeeRes = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': \`SHA256 Credential=\${appId}, Timestamp=\${timestamp}, Signature=\${signature}\`
        },
        body: payload
    });
    
    // Converte os dados nativos (ex: discountRate de 54) para "54% OFF" 
    // e recalcula o preço original via formula matemática.
}
```

> [!WARNING]
> Nunca comite chaves da Shopee no código-fonte! Sempre leia via `process.env.SHOPEE_APP_ID` de arquivos `.env` protegidos.

## Implementação Frontend

Para exibir o dado adequadamente no Frontend HTML, o Javascript realiza chamadas assíncronas para carregar o visual no estilo Skeleton Text e depois substituir pelas informações reais assim que a Promise da API finalizar:

```javascript
// Gatilho multi-plataforma:
if (!p.preco || p.link.includes('meli.la') || p.link.includes('mercadolivre.com') || p.link.includes('shopee.com.br') || p.link.includes('shope.ee')) {
  fetch(`/api/get-price?url=\${encodeURIComponent(p.link)}`)
    .then(resp => resp.json())
    .then(data => {
        // Atualiza UI com de/por (data.originalPrice > data.price) e selo verde (data.discount)
    });
}
```

Este modelo multi-plataforma garante que a loja sempre apresentará as promoções exatas e ativas na plataforma oficial (seja ML ou Shopee) em tempo real.
