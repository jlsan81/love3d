import { useEffect, useState } from "react";

export default function AffiliateSlot({ placement = "geral" }) {
  const [affiliate, setAffiliate] = useState(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/afiliados?placement=${encodeURIComponent(placement)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (active && data?.affiliates?.length) setAffiliate(data.affiliates[0]);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [placement]);

  if (!affiliate) return null;

  async function handleClick() {
    fetch(`/api/afiliados?placement=${encodeURIComponent(placement)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: affiliate.id }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <aside className="affiliate-card" aria-label="Recomendação">
      <span className="affiliate-label">Recomendação Love3D</span>
      <a href={affiliate.url} target="_blank" rel="sponsored nofollow noopener" onClick={handleClick}>
        <strong>{affiliate.titulo}</strong>
        <small>{affiliate.nome}{affiliate.rede ? ` · ${affiliate.rede}` : ""}</small>
      </a>
    </aside>
  );
}
