fetch('https://meli.la/2ZVhMVE', { headers: { 'User-Agent': 'Mozilla/5.0' } })
  .then(r => r.text())
  .then(html => {
     const minified = html.replace(/\n|\r/g, "");
     const idx1 = minified.indexOf('class="andes-money-amount__fraction"');
     const idx2 = minified.search(/>(\d+%?\s*OFF)</i);
     console.log("Fraction at:", idx1);
     console.log("Discount at:", idx2, minified.match(/>(\d+%?\s*OFF)/i));
  }).catch(e => console.error(e));
