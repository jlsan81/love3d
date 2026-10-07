import { requireAdmin } from "../../../../lib/admin-auth";
import { listAffiliates, createAffiliate } from "../../../../lib/affiliates";

function validUrl(value) {
  try {
    const url = new URL(String(value));
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === "GET") return res.status(200).json({ affiliates: await listAffiliates() });

    if (req.method === "POST") {
      const data = req.body || {};
      if (!data.nome || !data.url || !data.titulo) return res.status(400).json({ error: "Nome, URL e título são obrigatórios." });
      if (!validUrl(data.url)) return res.status(400).json({ error: "O link deve começar com http:// ou https://." });
      const row = await createAffiliate(data);
      return res.status(201).json({ affiliate: row });
    }

    return res.status(405).json({ error: "Método não permitido." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao acessar os afiliados." });
  }
}
