fetch('https://meli.la/2ZVhMVE', { headers: { 'User-Agent': 'Mozilla/5.0' } })
  .then(r => r.text())
  .then(html => {
      const formatedHtml = html.replace(/\n|\r/g, "");
      const firstFractionIndex = formatedHtml.indexOf('class="andes-money-amount__fraction"');
      if (firstFractionIndex !== -1) {
         const startIndex = Math.max(0, firstFractionIndex - 1000);
         const endIndex = Math.min(formatedHtml.length, firstFractionIndex + 3000);
         const mainProductBlock = formatedHtml.substring(startIndex, endIndex);

         const fractionRegex = /<span class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/gi;
         const fractionMatches = Array.from(mainProductBlock.matchAll(fractionRegex));
         let parsedPrices = [];

         for (const match of fractionMatches) {
             const fractionVal = match[1];
             const lookAhead = mainProductBlock.substring(match.index + match[0].length, match.index + match[0].length + 120);
             const nextFractionIdx = lookAhead.indexOf('andes-money-amount__fraction');
             const centsIdx = lookAhead.indexOf('andes-money-amount__cents');
             
             let centsVal = "00";
             if (centsIdx !== -1 && (nextFractionIdx === -1 || centsIdx < nextFractionIdx)) {
                 const cMatch = lookAhead.match(/<span class="andes-money-amount__cents[^>]*>([^<]+)<\/span>/i);
                 if (cMatch) centsVal = cMatch[1];
             }
             parsedPrices.push({ fraction: fractionVal, cents: centsVal });
         }

         let originalPrice = null, price = null, discount = null;
         const matchDiscount = mainProductBlock.match(/>(\d+%?\s*OFF)</i);
         if (matchDiscount) {
             if (parsedPrices.length >= 2) {
                 originalPrice = "R$ " + parsedPrices[0].fraction + "," + parsedPrices[0].cents;
                 price = "R$ " + parsedPrices[1].fraction + "," + parsedPrices[1].cents;
                 discount = matchDiscount[1];
             } else if (parsedPrices.length === 1) {
                 price = "R$ " + parsedPrices[0].fraction + "," + parsedPrices[0].cents;
             }
         } else {
             if (parsedPrices.length >= 1) {
                 price = "R$ " + parsedPrices[0].fraction + "," + parsedPrices[0].cents;
             }
         }
         console.log({ price, originalPrice, discount, parsedPrices, mainProductBlockLength: mainProductBlock.length });
      } else {
          console.log("No fraction found in html");
      }
  });
