import { listPublicAffiliates, registerAffiliateClick } from "../../../lib/affiliates";

export default async function handler(req, res) {
  try {
    const placement = String(req.query.placement || "geral").slice(0, 100);

    if (req.method === "GET") {
      const affiliates = await listPublicAffiliates(placement);
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
      return res.status(200).json({ affiliates });
    }

    if (req.method === "POST") {
      const { id } = req.body || {};
      if (!Number.isInteger(Number(id))) return res.status(400).json({ error: "ID inválido." });
      await registerAffiliateClick(id, placement, req.headers["user-agent"]);
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Método não permitido." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Serviço de afiliados indisponível." });
  }
}
