import { passwordIsValid, verifySmsCode, setSessionCookie } from "../../../../lib/admin-auth";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

  try {
    const { password, code } = req.body || {};
    if (!passwordIsValid(password)) return res.status(401).json({ error: "Senha inválida." });
    if (!await verifySmsCode(String(code || ""))) return res.status(401).json({ error: "Código SMS inválido ou expirado." });

    setSessionCookie(res);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Não foi possível autenticar." });
  }
}
