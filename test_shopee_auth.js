const crypto = require('crypto');
const fs = require('fs');

async function testShopeeAuth() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const appIdMatch = envFile.match(/SHOPEE_APP_ID="?([^"\n\r]+)"?/);
  const appSecretMatch = envFile.match(/SHOPEE_APP_SECRET="?([^"\n\r]+)"?/);

  const partnerId = appIdMatch ? appIdMatch[1] : null;
  const partnerKey = appSecretMatch ? appSecretMatch[1] : null;

  if (!partnerId || !partnerKey || partnerId === 'COLE_O_APP_ID_AQUI') {
    console.error("Chaves não configuradas corretamente no .env.local!");
    return;
  }

  const host = 'https://partner.shopeemobile.com';
  // Let's try to get affiliate offer list (requires building a graphql payload) or simple product info
  const path = '/api/v2/shop/get_shop_info'; 
  const timestamp = Math.floor(Date.now() / 1000);

  const signString = partnerId + path + timestamp;
  const signature = crypto.createHmac('sha256', partnerKey).update(signString).digest('hex');

  const url = `${host}${path}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${signature}`;

  console.log("Testando autenticação em:", url);

  try {
    const fetch = (await import('node-fetch')).default || require('node-fetch');
    const response = await fetch(url);
    
    const data = await response.json();
    console.log("Resposta oficial:" + JSON.stringify(data, null, 2));
  } catch(e) {
    try {
      const resp = await globalThis.fetch(url);
      const data = await resp.json();
      console.log("Resposta oficial (native fetch):", JSON.stringify(data, null, 2));
    } catch(e2) {
      console.error("Erro fetch nativo:", e2);
    }
  }
}

testShopeeAuth();
