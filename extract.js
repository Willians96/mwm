const fs = require('fs');
const html = fs.readFileSync('ml_temp.html', 'utf8');

const meta = html.match(/<meta[^>]+itemprop=["']price["'][^>]*content=["']([^"']+)["']/i);
if (meta) {
    console.log("Meta Price:", meta[1]);
} else {
    console.log("No meta price");
}

const mainBlockMatch = html.match(/<div[^>]*class=["'][^"']*ui-pdp-price[^"']*["'][^>]*>([\s\S]{0,2000})/i);
if (mainBlockMatch) {
    const blockHtml = mainBlockMatch[1];
    console.log("\nFound ui-pdp-price block (truncating to 200 chars):\n", blockHtml.replace(/\n/g, '').substring(0, 200));

    const matchFracao = blockHtml.match(/<span class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/);
    const matchCentavos = blockHtml.match(/<span class="andes-money-amount__cents[^>]*>([^<]+)<\/span>/);
    console.log("Extracted main price:", matchFracao ? matchFracao[1] : null, matchCentavos ? matchCentavos[1] : null);
    
    const matchPrevBlock = blockHtml.match(/<s[^>]*andes-money-amount--previous[^>]*>.*?<\/s>/i);
    if (matchPrevBlock) {
        console.log("Extracted previous block:", matchPrevBlock[0].substring(0, 50));
    }
    const matchDiscount = blockHtml.match(/>(\d+%?\s*OFF)</i);
    if (matchDiscount) {
        console.log("Extracted discount:", matchDiscount[1]);
    }
}
