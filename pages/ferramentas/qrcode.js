import { useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import Layout from "../../components/Layout";

const TYPES = [
  ["url", "URL / Site"], ["wifi", "Wi-Fi"], ["pix", "Pix"],
  ["whatsapp", "WhatsApp"], ["email", "E-mail"], ["phone", "Telefone"], ["text", "Texto livre"],
];

const initial = {
  url: "", ssid: "", password: "", security: "WPA", hidden: false,
  key: "", name: "LOVE3D", city: "RIO DE JANEIRO", amount: "", description: "",
  phone: "", message: "", email: "", subject: "", body: "", text: "",
};

const f = (id, value) => id + String(value.length).padStart(2, "0") + value;

function crc16(text) {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(text)) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function pixText(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
    .replace(/[^A-Z0-9 $%*+\-./:]/g, "").trim();
}

function makePix(d) {
  if (!d.key.trim()) return "";
  const name = pixText(d.name).slice(0, 25) || "LOVE3D";
  const city = pixText(d.city).slice(0, 15) || "BRASIL";
  let account = f("00", "br.gov.bcb.pix") + f("01", d.key.trim());
  if (d.description.trim()) account += f("02", d.description.trim().slice(0, 72));
  let p = f("00", "01") + f("26", account) + f("52", "0000") + f("53", "986");
  const amount = Number(String(d.amount).replace(",", "."));
  if (Number.isFinite(amount) && amount > 0) p += f("54", amount.toFixed(2));
  p += f("58", "BR") + f("59", name) + f("60", city) + f("62", f("05", "***"));
  return p + "6304" + crc16(p + "6304");
}

function wifiEscape(v) {
  return v.replace(/([\\;,:"])/g, "\\$1");
}

function build(type, d) {
  if (type === "url") {
    if (!d.url.trim()) return "";
    return /^https?:\/\//i.test(d.url.trim()) ? d.url.trim() : "https://" + d.url.trim();
  }
  if (type === "wifi") {
    if (!d.ssid.trim()) return "";
    return "WIFI:T:" + (d.security === "nopass" ? "nopass" : d.security) +
      ";S:" + wifiEscape(d.ssid) + ";P:" + wifiEscape(d.password) +
      ";H:" + (d.hidden ? "true" : "false") + ";;";
  }
  if (type === "pix") return makePix(d);
  if (type === "whatsapp") {
    const phone = d.phone.replace(/\D/g, "");
    return phone ? "https://wa.me/" + phone + (d.message.trim() ? "?text=" + encodeURIComponent(d.message.trim()) : "") : "";
  }
  if (type === "email") {
    if (!d.email.trim()) return "";
    const q = new URLSearchParams();
    if (d.subject.trim()) q.set("subject", d.subject.trim());
    if (d.body.trim()) q.set("body", d.body.trim());
    return "mailto:" + d.email.trim() + (q.toString() ? "?" + q.toString() : "");
  }
  if (type === "phone") {
    const phone = d.phone.replace(/[^\d+]/g, "");
    return phone ? "tel:" + phone : "";
  }
  return d.text;
}

function makeCutoutSvg(value, sizeMm, level) {
  const qr = QRCode.create(value, { errorCorrectionLevel: level });
  const { size, data } = qr.modules;
  const moduleMm = sizeMm / (size + 8);
  const quiet = moduleMm * 4;
  const qrMm = moduleMm * size;
  const total = sizeMm;

  // O fundo é uma única peça sólida e cada módulo preto do QR vira um furo.
  // O fill-rule="evenodd" faz o SVG representar literalmente o vazado.
  let holes = "";
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!data[row * size + col]) continue;
      const x = quiet + col * moduleMm;
      const y = quiet + row * moduleMm;
      const x2 = x + moduleMm;
      const y2 = y + moduleMm;
      holes += `M${x} 0H0V${total}H${total}V0H${x}Z M${x} ${y}H${x2}V${y2}H${x}Z `;
    }
  }

  // Uma forma por módulo, com o quadrado externo repetido apenas uma vez.
  // Cada módulo interno é uma subforma e, com evenodd, vira recorte.
  const pathParts = [`M0 0H${total}V${total}H0Z`];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!data[row * size + col]) continue;
      const x = quiet + col * moduleMm;
      const y = quiet + row * moduleMm;
      const x2 = x + moduleMm;
      const y2 = y + moduleMm;
      pathParts.push(`M${x} ${y}H${x2}V${y2}H${x}Z`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${sizeMm}mm" height="${sizeMm}mm" viewBox="0 0 ${total} ${total}">
  <path d="${pathParts.join(" ")}" fill="#000" fill-rule="evenodd"/>
</svg>`;
}

function makeSolidSvg(value, sizeMm, level) {
  const qr = QRCode.create(value, { errorCorrectionLevel: level });
  const { size, data } = qr.modules;
  const moduleMm = sizeMm / (size + 8);
  const quiet = moduleMm * 4;
  const total = sizeMm;
  let rects = `<rect width="${total}" height="${total}" fill="#fff"/>`;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!data[row * size + col]) continue;
      const x = quiet + col * moduleMm;
      const y = quiet + row * moduleMm;
      rects += `<rect x="${x}" y="${y}" width="${moduleMm}" height="${moduleMm}" fill="#000"/>`;
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${sizeMm}mm" height="${sizeMm}mm" viewBox="0 0 ${total} ${total}">${rects}</svg>`;
}

function PreviewSvg({ value, sizeMm, level, mode }) {
  const source = mode === "cutout" ? makeCutoutSvg(value, sizeMm, level) : makeSolidSvg(value, sizeMm, level);
  return <div dangerouslySetInnerHTML={{ __html: source.replace(/<\?xml[^>]*>\s*/, "") }} />;
}

export default function QRCodePage() {
  const [type, setType] = useState("url");
  const [data, setData] = useState(initial);
  const [sizeMm, setSizeMm] = useState(40);
  const [level, setLevel] = useState("H");
  const [mode, setMode] = useState("cutout");
  const value = useMemo(() => build(type, data), [type, data]);

  const update = (key, value) => setData((d) => ({ ...d, [key]: value }));
  const reset = () => setData({ ...initial });

  function downloadSVG() {
    if (!value) return;
    const source = mode === "cutout"
      ? makeCutoutSvg(value, sizeMm, level)
      : makeSolidSvg(value, sizeMm, level);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "love3d-qrcode-" + mode + "-" + type + "-" + sizeMm + "mm.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      <section className="tool-page"><div className="container">
        <div className="breadcrumb"><Link href="/">Love3D</Link> / Ferramentas / QR Code</div>
        <div className="tool-header">
          <h1>Gerador de QR Code em SVG</h1>
          <p>Crie QR Codes vetoriais para etiquetas, placas e peças de impressão 3D. No modo <strong>vazado</strong>, os módulos do QR são recortes reais no SVG.</p>
        </div>
        <div className="tool-layout">
          <section className="panel">
            <h2>O que você quer codificar?</h2>
            <div className="qr-type-grid">{TYPES.map(([id, label]) =>
              <button key={id} type="button" className={"qr-type " + (type === id ? "active" : "")}
                onClick={() => { setType(id); reset(); }}>{label}</button>
            )}</div>

            {type === "url" && <Field label="Endereço do site"><input className="input" value={data.url} onChange={e => update("url", e.target.value)} placeholder="exemplo.com.br/produto" /></Field>}
            {type === "wifi" && <>
              <Field label="Nome da rede (SSID)"><input className="input" value={data.ssid} onChange={e => update("ssid", e.target.value)} placeholder="Minha Wi-Fi" /></Field>
              <Field label="Senha"><input className="input" value={data.password} onChange={e => update("password", e.target.value)} placeholder="Senha da rede" /></Field>
              <Field label="Segurança"><select className="input" value={data.security} onChange={e => update("security", e.target.value)}>
                <option value="WPA">WPA / WPA2 / WPA3</option><option value="WEP">WEP</option><option value="nopass">Sem senha</option>
              </select></Field>
              <label className="checkbox-row"><input type="checkbox" checked={data.hidden} onChange={e => update("hidden", e.target.checked)} /> Rede oculta</label>
            </>}
            {type === "pix" && <>
              <Field label="Chave Pix"><input className="input" value={data.key} onChange={e => update("key", e.target.value)} placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória" /></Field>
              <Field label="Nome do recebedor"><input className="input" maxLength={25} value={data.name} onChange={e => update("name", e.target.value)} /></Field>
              <Field label="Cidade"><input className="input" maxLength={15} value={data.city} onChange={e => update("city", e.target.value)} /></Field>
              <Field label="Valor (opcional)"><input className="input" inputMode="decimal" value={data.amount} onChange={e => update("amount", e.target.value)} placeholder="0,00" /></Field>
              <Field label="Descrição (opcional)"><input className="input" maxLength={72} value={data.description} onChange={e => update("description", e.target.value)} /></Field>
            </>}
            {type === "whatsapp" && <>
              <Field label="WhatsApp"><input className="input" inputMode="tel" value={data.phone} onChange={e => update("phone", e.target.value)} placeholder="5511999999999" /></Field>
              <Field label="Mensagem inicial (opcional)"><textarea className="input textarea" value={data.message} onChange={e => update("message", e.target.value)} /></Field>
            </>}
            {type === "email" && <>
              <Field label="E-mail"><input className="input" type="email" value={data.email} onChange={e => update("email", e.target.value)} placeholder="contato@exemplo.com" /></Field>
              <Field label="Assunto (opcional)"><input className="input" value={data.subject} onChange={e => update("subject", e.target.value)} /></Field>
              <Field label="Mensagem (opcional)"><textarea className="input textarea" value={data.body} onChange={e => update("body", e.target.value)} /></Field>
            </>}
            {type === "phone" && <Field label="Telefone"><input className="input" inputMode="tel" value={data.phone} onChange={e => update("phone", e.target.value)} placeholder="+55 11 99999-9999" /></Field>}
            {type === "text" && <Field label="Texto"><textarea className="input textarea" value={data.text} onChange={e => update("text", e.target.value)} placeholder="Digite o texto que o leitor do QR Code deverá receber." /></Field>}

            <div className="qr-options">
              <Field label={"Tamanho físico: " + sizeMm + " mm"}>
                <input type="range" min="20" max="100" value={sizeMm} onChange={e => setSizeMm(Number(e.target.value))} />
                <div className="range-labels"><span>20 mm</span><span>100 mm</span></div>
              </Field>
              <Field label="Correção de erro"><select className="input" value={level} onChange={e => setLevel(e.target.value)}>
                <option value="M">M — uso geral</option><option value="Q">Q — mais robusto</option><option value="H">H — impressão 3D</option>
              </select></Field>
            </div>

            <Field label="Tipo de saída">
              <select className="input" value={mode} onChange={e => setMode(e.target.value)}>
                <option value="cutout">Vazado — QR vira furos na peça</option>
                <option value="solid">Normal — módulos sólidos</option>
              </select>
            </Field>

            <div className="button-row"><button className="btn btn-primary" onClick={downloadSVG} disabled={!value}>Baixar SVG</button><button className="btn btn-secondary" onClick={reset}>Limpar</button></div>
            {mode === "cutout" && <div className="notice"><strong>Modo vazado:</strong> o fundo é uma peça sólida e os quadrados do QR são recortes. Isso é diferente de simplesmente deixar o fundo transparente.</div>}
            {type === "pix" && <div className="notice"><strong>Pix:</strong> QR estático. Confira recebedor e valor no aplicativo do banco antes de usar.</div>}
          </section>

          <section className="panel">
            <h2>Pré-visualização</h2>
            <div className={"qr-preview " + (mode === "cutout" ? "qr-cutout-preview" : "")}>
              {value ? <PreviewSvg value={value} sizeMm={sizeMm} level={level} mode={mode} />
                : <div className="empty-preview"><span>▦</span><p>Preencha os dados para gerar o QR Code.</p></div>}
            </div>
            <div className="qr-meta"><strong>{sizeMm} × {sizeMm} mm</strong><span>{mode === "cutout" ? "vazado" : "módulos sólidos"} • margem de 4 módulos • correção {level}</span></div>
            <Field label="Conteúdo codificado"><textarea className="input textarea qr-data-text" value={value} readOnly placeholder="O conteúdo aparecerá aqui." /></Field>
            <p className="tool-note">Para impressão 3D, o modo vazado é ideal para placas, etiquetas e gabaritos. Evite QR muito pequeno: 30–40 mm costuma ser uma faixa confortável para impressão e leitura.</p>
          </section>
        </div>
      </div></section>
    </Layout>
  );
}

function Field({ label, children }) {
  return <div className="field"><label>{label}</label>{children}</div>;
}
