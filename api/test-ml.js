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
    res.status(200).send(`
      <h1>Status: ${response.status}</h1>
      <h2>HTML (primeiros 500 chars):</h2>
      <pre>${html.substring(0, 500).replace(/</g, "&lt;")}</pre>
      <h2>Regex teste:</h2>
      <pre>${html.match(/<span class="andes-money-amount__fraction"[^>]*>([^<]+)/)?.[1] || "Not Found"}</pre>
    `);
  } catch (error) {
    res.status(500).send(error.message);
  }
}
