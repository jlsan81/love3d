import { useEffect, useState } from "react";
import Layout from "../../components/Layout";

const empty = { nome: "", rede: "", url: "", titulo: "", categoria: "", local: "geral", ativo: true, prioridade: 0 };

export default function AfiliadosAdmin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [affiliates, setAffiliates] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");

  async function load() {
    const r = await fetch("/api/admin/afiliados");
    if (r.ok) {
      const data = await r.json();
      setAffiliates(data.affiliates || []);
      setAuthenticated(true);
    }
  }

  useEffect(() => { load(); }, []);

  async function sendCode(e) {
    e.preventDefault();
    setMessage("");
    const r = await fetch("/api/admin/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return setMessage(data.error || "Não foi possível enviar o SMS.");
    setCodeSent(true);
    setMessage("Código enviado por SMS. Ele expira em 5 minutos.");
  }

  async function login(e) {
    e.preventDefault();
    setMessage("");
    const r = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, code }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return setMessage(data.error || "Falha no login.");
    setAuthenticated(true);
    await load();
  }

  async function save(e) {
    e.preventDefault();
    setMessage("");
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/admin/afiliados/${editing}` : "/api/admin/afiliados";
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return setMessage(data.error || "Erro ao salvar.");
    setForm(empty);
    setEditing(null);
    setMessage("Afiliado salvo.");
    load();
  }

  async function remove(id) {
    if (!confirm("Excluir este afiliado?")) return;
    const r = await fetch(`/api/admin/afiliados/${id}`, { method: "DELETE" });
    if (r.ok) {
      setMessage("Afiliado excluído.");
      load();
    }
  }

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    setAuthenticated(false);
    setCodeSent(false);
    setPassword("");
    setCode("");
    setAffiliates([]);
  }

  if (!authenticated) {
    return (
      <Layout>
        <section className="tool-page">
          <div className="container admin-narrow">
            <div className="tool-header">
              <div className="eyebrow">Área restrita</div>
              <h1>Painel de afiliados</h1>
              <p>Cadastre e organize recomendações que podem aparecer nas páginas do Love3D.</p>
            </div>
            <div className="panel">
              {!codeSent ? (
                <form onSubmit={sendCode}>
                  <div className="field"><label>Senha administrativa</label><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></div>
                  <button className="btn btn-primary" type="submit">Enviar código por SMS</button>
                </form>
              ) : (
                <form onSubmit={login}>
                  <div className="field"><label>Código recebido por SMS</label><input className="input" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} required /></div>
                  <div className="button-row">
                    <button className="btn btn-primary" type="submit">Entrar</button>
                    <button className="btn btn-secondary" type="button" onClick={() => setCodeSent(false)}>Voltar</button>
                  </div>
                </form>
              )}
              {message && <div className="notice">{message}</div>}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="tool-page">
        <div className="container">
          <div className="admin-top">
            <div className="tool-header">
              <div className="eyebrow">Administração</div>
              <h1>Afiliados</h1>
              <p>Gerencie links, locais de exibição, prioridade e ativação.</p>
            </div>
            <button className="btn btn-secondary" onClick={logout}>Sair</button>
          </div>

          <div className="tool-layout">
            <form className="panel" onSubmit={save}>
              <h2>{editing ? "Editar afiliado" : "Novo afiliado"}</h2>
              {[
                ["nome", "Nome do parceiro", "Ex.: Amazon"],
                ["rede", "Rede", "Ex.: Amazon, Shopee, Mercado Livre"],
                ["titulo", "Texto exibido", "Ex.: Filamento PETG em promoção"],
                ["url", "Link de afiliado", "https://..."],
                ["categoria", "Categoria", "Ex.: filamento"],
                ["local", "Local / placement", "Ex.: qrcode, custo-impressao, geral"],
              ].map(([key, label, placeholder]) => (
                <div className="field" key={key}>
                  <label>{label}</label>
                  <input className="input" value={form[key]} placeholder={placeholder} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={["nome","titulo","url"].includes(key)} />
                </div>
              ))}
              <div className="calc-grid">
                <div className="field"><label>Prioridade</label><input className="input" type="number" value={form.prioridade} onChange={(e) => setForm({ ...form, prioridade: e.target.value })} /></div>
                <label className="admin-check"><input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Ativo</label>
              </div>
              <div className="button-row">
                <button className="btn btn-primary" type="submit">{editing ? "Salvar alterações" : "Cadastrar afiliado"}</button>
                {editing && <button className="btn btn-secondary" type="button" onClick={() => { setEditing(null); setForm(empty); }}>Cancelar</button>}
              </div>
              {message && <div className="notice">{message}</div>}
            </form>

            <div className="panel">
              <h2>Links cadastrados</h2>
              {affiliates.length === 0 ? <p className="tool-note">Nenhum afiliado cadastrado.</p> : (
                <div className="affiliate-list">
                  {affiliates.map((a) => (
                    <article className={`affiliate-admin-row ${a.ativo ? "" : "inactive"}`} key={a.id}>
                      <div>
                        <strong>{a.titulo}</strong>
                        <span>{a.nome}{a.rede ? ` · ${a.rede}` : ""}</span>
                        <small>{a.local} · prioridade {a.prioridade} · {a.ativo ? "ativo" : "inativo"}</small>
                      </div>
                      <div className="button-row">
                        <button className="btn btn-secondary" type="button" onClick={() => { setEditing(a.id); setForm({ ...a, prioridade: a.prioridade }); }}>Editar</button>
                        <button className="btn btn-danger" type="button" onClick={() => remove(a.id)}>Excluir</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
