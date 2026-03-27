fetch('https://produto.mercadolivre.com.br/MLB-4011494548-headset-gamer-com-fio-quantum-100m2-jbl-jblqtum100m2blk-com-mic-_JM', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
  }
})
  .then(r => r.text())
  .then(html => {
    const minified = html.replace(/\n|\r/g, "");
    const firstFractionIndex = minified.indexOf('class="andes-money-amount__fraction"');
    
    if (firstFractionIndex !== -1) {
      console.log("Found first fraction. Context:");
      console.log(minified.substring(Math.max(0, firstFractionIndex - 500), firstFractionIndex + 1000));
    } else {
      console.log("Fraction not found in HTML! Title is:");
      console.log(html.match(/<title>([^<]+)<\/title>/)[1]);
    }
  })
  .catch(err => console.error(err));
