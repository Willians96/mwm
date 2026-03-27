const url = 'https://s.shopee.com.br/60N1f8m863';

fetch(url, {
  redirect: 'follow',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36'
  }
})
.then(async r => {
  console.log("Final URL:", r.url);
  
  // Extract shopid and itemid from "/SHOP_ID/ITEM_ID" or "-i.SHOP_ID.ITEM_ID"
  const match = r.url.match(/-i\.(\d+)\.(\d+)/) || r.url.match(/\/(\d+)\/(\d+)\??/);
  if (match) {
    const shopid = match[1];
    const itemid = match[2];
    console.log(`Found IDs -> ShopID: ${shopid}, ItemID: ${itemid}`);
    
    // Call Shopee's API
    const apiUrl = `https://shopee.com.br/api/v4/item/get?itemid=${itemid}&shopid=${shopid}`;
    console.log("Fetching API:", apiUrl);
    const resp = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36'
      }
    });
    const json = await resp.json();
    console.log("API Response Error:", json.error);
    if (!json.error && json.data) {
       console.log("Price:", json.data.price / 100000); // Shopee prices are usually multiplied by 100,000
       console.log("Price Before Discount:", json.data.price_before_discount / 100000);
       console.log("Discount:", json.data.discount);
    } else {
       console.log("Full JSON (keys):", Object.keys(json));
    }
  } else {
    console.log("Could not find shopid/itemid in the URL.");
  }
})
.catch(e => console.error(e));
