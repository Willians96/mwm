export default function handler(req, res) {
  const clientId = process.env.OAUTH_CLIENT_ID;
  if (!clientId) {
    return res.status(500).send("OAUTH_CLIENT_ID não configurado no Vercel.");
  }
  const redirectUri = "https://mwm-topaz.vercel.app/api/callback";
  const oAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user`;
  res.redirect(oAuthUrl);
}
