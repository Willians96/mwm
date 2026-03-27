const fs = require('fs');

async function test() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const appIdMatch = envFile.match(/SHOPEE_APP_ID="?([^"\n\r]+)"?/);
  const appSecretMatch = envFile.match(/SHOPEE_APP_SECRET="?([^"\n\r]+)"?/);
  process.env.SHOPEE_APP_ID = appIdMatch ? appIdMatch[1] : null;
  process.env.SHOPEE_APP_SECRET = appSecretMatch ? appSecretMatch[1] : null;

  const getPriceModule = await import('file:///' + __dirname.replace(/\\/g, '/') + '/api/get-price.js');
  const handler = getPriceModule.default;
  const req = {
    query: { url: 'https://s.shopee.com.br/60N1f8m863' }
  };
  
  const res = {
    setHeader: () => {},
    status: (code) => {
      console.log("Status:", code);
      return {
        json: (data) => console.log("JSON:", data)
      };
    }
  };

  await handler(req, res);
}

test();
