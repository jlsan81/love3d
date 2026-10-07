import { requireAdmin } from "../../../../lib/admin-auth";
import { updateAffiliate, deleteAffiliate } from "../../../../lib/affiliates";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  try {
    const { id } = req.query;

    if (req.method === "PUT") {
      const data = req.body || {};
      if (!data.nome || !data.url || !data.titulo) return res.status(400).json({ error: "Nome, URL e título são obrigatórios." });
      const row = await updateAffiliate(id, data);
      if (!row) return res.status(404).json({ error: "Afiliado não encontrado." });
      return res.status(200).json({ affiliate: row });
    }

    if (req.method === "DELETE") {
      await deleteAffiliate(id);
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Método não permitido." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao alterar o afiliado." });
  }
}
