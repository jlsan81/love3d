import { neon } from "@neondatabase/serverless";

let initialized = false;

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurada.");
  }
  return neon(process.env.DATABASE_URL);
}

export async function ensureAffiliateTables() {
  if (initialized) return;
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS affiliates (
      id BIGSERIAL PRIMARY KEY,
      nome VARCHAR(160) NOT NULL,
      rede VARCHAR(80) NOT NULL DEFAULT '',
      url TEXT NOT NULL,
      titulo VARCHAR(180) NOT NULL,
      categoria VARCHAR(100) NOT NULL DEFAULT '',
      local VARCHAR(100) NOT NULL DEFAULT 'geral',
      ativo BOOLEAN NOT NULL DEFAULT TRUE,
      prioridade INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS affiliate_clicks (
      id BIGSERIAL PRIMARY KEY,
      affiliate_id BIGINT NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
      placement VARCHAR(100) NOT NULL DEFAULT 'geral',
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS admin_sms_codes (
      id BIGSERIAL PRIMARY KEY,
      code_hash VARCHAR(64) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  initialized = true;
}

export function publicAffiliate(row) {
  return {
    id: Number(row.id),
    nome: row.nome,
    rede: row.rede,
    url: row.url,
    titulo: row.titulo,
    categoria: row.categoria,
    local: row.local,
    prioridade: Number(row.prioridade || 0),
  };
}

export async function listAffiliates() {
  await ensureAffiliateTables();
  const sql = getSql();
  return sql`SELECT * FROM affiliates ORDER BY prioridade DESC, created_at DESC`;
}

export async function listPublicAffiliates(placement) {
  await ensureAffiliateTables();
  const sql = getSql();
  const rows = await sql`
    SELECT id, nome, rede, url, titulo, categoria, local, prioridade
    FROM affiliates
    WHERE ativo = TRUE AND (local = ${placement} OR local = 'geral')
    ORDER BY prioridade DESC, created_at DESC
  `;
  return rows.map(publicAffiliate);
}

export async function createAffiliate(data) {
  await ensureAffiliateTables();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO affiliates (nome, rede, url, titulo, categoria, local, ativo, prioridade)
    VALUES (${data.nome}, ${data.rede || ""}, ${data.url}, ${data.titulo}, ${data.categoria || ""}, ${data.local || "geral"}, ${data.ativo !== false}, ${Number(data.prioridade || 0)})
    RETURNING *
  `;
  return rows[0];
}

export async function updateAffiliate(id, data) {
  await ensureAffiliateTables();
  const sql = getSql();
  const rows = await sql`
    UPDATE affiliates
    SET nome = ${data.nome},
        rede = ${data.rede || ""},
        url = ${data.url},
        titulo = ${data.titulo},
        categoria = ${data.categoria || ""},
        local = ${data.local || "geral"},
        ativo = ${data.ativo !== false},
        prioridade = ${Number(data.prioridade || 0)},
        updated_at = NOW()
    WHERE id = ${Number(id)}
    RETURNING *
  `;
  return rows[0] || null;
}

export async function deleteAffiliate(id) {
  await ensureAffiliateTables();
  const sql = getSql();
  await sql`DELETE FROM affiliates WHERE id = ${Number(id)}`;
}

export async function registerAffiliateClick(id, placement, userAgent) {
  await ensureAffiliateTables();
  const sql = getSql();
  await sql`
    INSERT INTO affiliate_clicks (affiliate_id, placement, user_agent)
    SELECT id, ${placement || "geral"}, ${userAgent || ""}
    FROM affiliates
    WHERE id = ${Number(id)} AND ativo = TRUE
  `;
}
