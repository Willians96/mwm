export default async function handler(req, res) {
  try {
    const url = "https://www.mercadolivre.com.br/monitor-gamer-aoc-24-180hz-05ms-ips-24g4p/p/MLB44895498";
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
      }
    });
    const html = await response.text();
    const moneyMatches = html.match(/class="[^"]*money[^"]*"[^>]*>([^<]+)/gi);
    const rsMatches = html.match(/R\$[\s]*[0-9.,]+/gi);

    res.status(200).send(`
      <h1>Status: ${response.status}</h1>
      <h2>Possíveis classes de money:</h2>
      <pre>${moneyMatches ? moneyMatches.slice(0, 5).join('\\n') : 'none'}</pre>
      <h2>Regex R$:</h2>
      <pre>${rsMatches ? rsMatches.slice(0, 5).join('\\n') : 'none'}</pre>
    `);
  } catch (error) {
    res.status(500).send(error.message);
  }
}
