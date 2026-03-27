const fs = require('fs');
const html = fs.readFileSync('ml_temp.html', 'utf8');
const formatedHtml = html.replace(/\n|\r/g, "");

const titleMatch = formatedHtml.match(/<h1 class="ui-pdp-title"[^>]*>.*?<\/h1>/i) || formatedHtml.match(/<h1[^>]*>.*?<\/h1>/i);

let block = formatedHtml;
if (titleMatch) {
    console.log("Title found!");
    const startIndex = formatedHtml.indexOf(titleMatch[0]);
    // Extract next 3000 chars (plenty to cover the price box, stops before related products)
    block = formatedHtml.substring(startIndex, startIndex + 5000);
}

let price = null;
let originalPrice = null;
let discount = null;

const matchPrevBlock = block.match(/<s[^>]*andes-money-amount--previous[^>]*>.*?<\/s>/i);
if (matchPrevBlock) {
    const matchPrevFra = matchPrevBlock[0].match(/<span class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/);
    const matchPrevCen = matchPrevBlock[0].match(/<span class="andes-money-amount__cents[^>]*>([^<]+)<\/span>/);
    if (matchPrevFra) {
        originalPrice = "R$ " + matchPrevFra[1];
        if (matchPrevCen) originalPrice += "," + matchPrevCen[1];
    }
    
    const remainingHtml = block.substring(block.indexOf(matchPrevBlock[0]) + matchPrevBlock[0].length);
    const matchFracao = remainingHtml.match(/<span class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/);
    const matchCentavos = remainingHtml.match(/<span class="andes-money-amount__cents[^>]*>([^<]+)<\/span>/);
    if (matchFracao) {
        price = "R$ " + matchFracao[1];
        if (matchCentavos) price += "," + matchCentavos[1];
    }
} else {
    const matchFracao = block.match(/<span class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/);
    const matchCentavos = block.match(/<span class="andes-money-amount__cents[^>]*>([^<]+)<\/span>/);
    if (matchFracao) {
        price = "R$ " + matchFracao[1];
        if (matchCentavos) price += "," + matchCentavos[1];
    }
}

const matchDiscount = block.match(/>(\d+%?\s*OFF)</i);
if (matchDiscount) {
    discount = matchDiscount[1];
}

console.log({ price, originalPrice, discount });
