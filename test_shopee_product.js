const crypto = require('crypto');
const fs = require('fs');

async function testShopeeProduct() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const appIdMatch = envFile.match(/SHOPEE_APP_ID="?([^"\n\r]+)"?/);
  const appSecretMatch = envFile.match(/SHOPEE_APP_SECRET="?([^"\n\r]+)"?/);
  const appId = appIdMatch ? appIdMatch[1] : null;
  const appSecret = appSecretMatch ? appSecretMatch[1] : null;

  const url = 'https://open-api.affiliate.shopee.com.br/graphql';
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  // Let's test with the Carregador from the user's previous example:
  // shopId: 1388112487, itemId: 22894456647
  const payload = JSON.stringify({ 
    query: `
      query {
        productOfferV2(itemId: 22894456647) {
          nodes {
            itemId
            productName
            price
            priceMin
            priceDiscountRate
            offerLink
            imageUrl
          }
        }
      }
    ` 
  });
  
  const signString = appId + timestamp + payload + appSecret;
  const signature = crypto.createHash('sha256').update(signString).digest('hex');

  console.log("Fetching Product...");
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`
      },
      body: payload
    });
    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Product Data:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testShopeeProduct();
