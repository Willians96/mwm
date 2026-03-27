fetch('https://produto.mercadolivre.com.br/MLB-4011494548-headset-gamer-com-fio-quantum-100m2-jbl-jblqtum100m2blk-com-mic-_JM', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
})
.then(r => r.text())
.then(html => {
      const formatedHtml = html.replace(/\n|\r/g, "");
      
      const firstFractionIndex = formatedHtml.indexOf('class="andes-money-amount__fraction"');
      if (firstFractionIndex !== -1) {
         const startIndex = Math.max(0, firstFractionIndex - 1000);
         const endIndex = Math.min(formatedHtml.length, firstFractionIndex + 3000);
         const mainProductBlock = formatedHtml.substring(startIndex, endIndex);

         let originalPrice = null, price = null, discount = null;
         let foundDiscount = false;
         const matchPrevTag = mainProductBlock.match(/class=["'][^"']*andes-money-amount--previous[^"']*["']/i);
         
         if (matchPrevTag) {
             console.log("Found matchPrevTag at", matchPrevTag.index);
             const prevStart = matchPrevTag.index;
             const prevBlock = mainProductBlock.substring(prevStart, prevStart + 400);
             
             const matchPrevFra = prevBlock.match(/<span class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/i);
             const matchPrevCen = prevBlock.match(/<span class="andes-money-amount__cents[^>]*>([^<]+)<\/span>/i);
             if (matchPrevFra) {
                 originalPrice = "R$ " + matchPrevFra[1] + "," + (matchPrevCen ? matchPrevCen[1] : "00");
                 console.log("Parsed original price:", originalPrice);
                 
                 const endOfPrevFra = prevStart + prevBlock.indexOf(matchPrevFra[0]) + matchPrevFra[0].length;
                 const remainingHtml = mainProductBlock.substring(endOfPrevFra);
                 
                 const matchFracao = remainingHtml.match(/<span class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/i);
                 const matchCentavos = remainingHtml.match(/<span class="andes-money-amount__cents[^>]*>([^<]+)<\/span>/i);
                 
                 if (matchFracao) {
                     price = "R$ " + matchFracao[1] + "," + (matchCentavos ? matchCentavos[1] : "00");
                     foundDiscount = true;
                     console.log("Parsed new price:", price);
                 } else {
                     console.log("matchFracao failed in remainingHtml");
                 }
             } else {
                 console.log("matchPrevFra failed");
             }
         }
         
         if (!foundDiscount) {
             console.log("foundDiscount is false, fallback running");
             const matchFracao = mainProductBlock.match(/<span class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/i);
             const matchCentavos = mainProductBlock.match(/<span class="andes-money-amount__cents[^>]*>([^<]+)<\/span>/i);
             if (matchFracao) {
                 price = "R$ " + matchFracao[1] + "," + (matchCentavos ? matchCentavos[1] : "00");
                 console.log("Fallback price:", price);
             }
         }

         const matchDiscount = mainProductBlock.match(/>(\d+%?\s*OFF)</i);
         if (matchDiscount) {
            discount = matchDiscount[1];
            console.log("Parsed discount:", discount);
         }
         
         console.log({ price, originalPrice, discount });
      } else {
          console.log("No fraction found in html");
      }
});
