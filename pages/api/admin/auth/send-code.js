import { passwordIsValid, generateCode, saveSmsCode } from "../../../../lib/admin-auth";
import { sendAdminSms } from "../../../../lib/sms";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

  try {
    const { password } = req.body || {};
    if (!passwordIsValid(password)) return res.status(401).json({ error: "Senha inválida." });

    const code = generateCode();
    await saveSmsCode(code);
    await sendAdminSms(code);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || "Não foi possível enviar o SMS." });
  }
}
