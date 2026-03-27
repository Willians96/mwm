const crypto = require('crypto');
const fs = require('fs');

async function testGraphQL() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const appIdMatch = envFile.match(/SHOPEE_APP_ID="?([^"\n\r]+)"?/);
  const appSecretMatch = envFile.match(/SHOPEE_APP_SECRET="?([^"\n\r]+)"?/);
  const appId = appIdMatch ? appIdMatch[1] : null;
  const appSecret = appSecretMatch ? appSecretMatch[1] : null;

  const url = 'https://open-api.affiliate.shopee.com.br/graphql';
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  const payload = JSON.stringify({ 
    query: `{ __type(name: "Query") { fields { name args { name } type { name kind ofType { name } } } } }` 
  });
  
  // Signature is usually: SHA256(appId + timestamp + payload + appSecret)
  const signString = appId + timestamp + payload + appSecret;
  const signature = crypto.createHash('sha256').update(signString).digest('hex');

  console.log("Testing:", url);
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
    fs.writeFileSync('schema.json', JSON.stringify(data, null, 2));
    console.log("Schema saved to schema.json");
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testGraphQL();
