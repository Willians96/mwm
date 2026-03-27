const fs = require('fs');
const html = fs.readFileSync('ml_temp2.html', 'utf8');

// 1. Meta preço (mais exato possível)
const regexMetaPrice = /<meta\s+itemprop=["']price["']\s+content=["']([^"']+)["']/i;
const matchMeta = html.match(regexMetaPrice);
if (matchMeta) {
    console.log("META PRICE:", matchMeta[1]);
} else {
    console.log("META PRICE NOT FOUND");
}

// 2. ui-pdp-price__second-line block
const matchBlock = html.match(/<div class="ui-pdp-price__second-line"[^>]*>([\s\S]*?)<\/div>/i);
if (matchBlock) {
    console.log("MAIN PRICE BLOCK:", matchBlock[1].substring(0, 150));
    
    // extrair preco do main price block
    const mFra = matchBlock[1].match(/<span class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/);
    if (mFra) console.log("MAIN FRACTION:", mFra[1]);
    
    // discount e original do main price block
    const mDisc = matchBlock[1].match(/>(\d+%?\s*OFF)</i);
    if(mDisc) console.log("MAIN DISCOUNT:", mDisc[1]);
    
    const mOrig = html.match(/<span class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/); // (só para testar primeiro match da página toda)
    console.log("Primeiro fracao da pagina toda:", mOrig ? mOrig[1] : "nada");
} else {
    console.log("MAIN BLOCK NOT FOUND");
}
