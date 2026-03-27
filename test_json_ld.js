const fs = require('fs');
const html = fs.readFileSync('ml_temp2.html', 'utf8');

const regex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
let match;
while ((match = regex.exec(html)) !== null) {
    try {
        const json = JSON.parse(match[1]);
        if (json && json["@type"] === "Product" && json.offers) {
            console.log("Found JSON-LD Primary Product Price:", json.offers.price);
        }
    } catch(e) {}
}
