const url = 'https://meli.la/2ZVhMVE'; // PS5
fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  .then(r => r.text())
  .then(html => {
     console.log("Discount text present:", html.match(/(\d+%?\s*OFF)/i));
     const matchFracao = html.match(/<span class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/gi);
     console.log("Fractions:", matchFracao ? matchFracao.slice(0, 3) : "None");
     console.log("Title:", html.match(/<title>([^<]+)<\/title>/));
  }).catch(e => console.error(e));
