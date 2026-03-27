fetch('https://meli.la/2ZVhMVE', { headers: { 'User-Agent': 'Mozilla/5.0' } })
.then(r=>r.text())
.then(h => {
  const m = h.replace(/\n|\r/g, '');
  const f = m.indexOf('class="andes-money-amount__fraction"');
  const d1 = m.indexOf('7% OFF');
  const d2 = m.search(/>(\d+%?\s*OFF)</i);
  console.log('Fraction:', f);
  console.log('7% OFF:', d1);
  console.log('>7% OFF<:', d2);
});
