import affiliates from "../data/affiliates.json";

export default function AffiliateSlot({ placement = "geral" }) {
  const items = affiliates.filter(
    (item) => item.ativo && (item.local === placement || item.local === "geral")
  );

  if (!items.length) return null;

  const item = [...items].sort(
    (a, b) => (b.prioridade || 0) - (a.prioridade || 0)
  )[0];

  return (
    <aside className="affiliate-card" aria-label="Recomendação">
      <span className="affiliate-label">Recomendação Love3D</span>
      <a
        href={item.url}
        target="_blank"
        rel="sponsored nofollow noopener"
      >
        <strong>{item.titulo}</strong>
        <small>
          {item.nome}
          {item.rede ? ` · ${item.rede}` : ""}
        </small>
      </a>
    </aside>
  );
}
