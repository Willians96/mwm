export default async function handler(req, res) {
  const { code } = req.query;
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  if (!code || !clientId || !clientSecret) {
    return res.status(500).send("Faltam variáveis de ambiente (Secreta) ou o código de autenticação do GitHub.");
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();
    const token = tokenData.access_token;

    if (!token) {
      return res.status(500).send(`Erro ao obter o token (Verifique o Client Secret).`);
    }

    const script = `
    <script>
      (function() {
        function receiveMessage(e) {
          window.opener.postMessage(
            'authorization:github:success:{"token":"${token}","provider":"github"}',
            e.origin
          );
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      })()
    </script>
    `;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(script);
  } catch (error) {
    res.status(500).send("Erro interno ao tentar se comunicar com o GitHub.");
  }
}
