import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";

const L_CODES = {
  0: "0001101", 1: "0011001", 2: "0010011", 3: "0111101", 4: "0100011",
  5: "0110001", 6: "0101111", 7: "0111011", 8: "0110111", 9: "0001011"
};
const G_CODES = {
  0: "0100111", 1: "0110011", 2: "0011011", 3: "0100001", 4: "0011101",
  5: "0111001", 6: "0000101", 7: "0010001", 8: "0001001", 9: "0010111"
};
const R_CODES = {
  0: "1110010", 1: "1100110", 2: "1101100", 3: "1000010", 4: "1011100",
  5: "1001110", 6: "1010000", 7: "1000100", 8: "1001000", 9: "1110100"
};
const PARITY = {
  0: "LLLLLL", 1: "LLGLGG", 2: "LLGGLG", 3: "LLGGGL", 4: "LGLLGG",
  5: "LGGLLG", 6: "LGGGLL", 7: "LGLGLG", 8: "LGLGGL", 9: "LGGLGL"
};

function normalize(value) {
  return value.replace(/\D/g, "").slice(0, 13);
}

function checkDigit(first12) {
  const digits = first12.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  return String((10 - (sum % 10)) % 10);
}

function isValid(code) {
  if (!/^\d{13}$/.test(code)) return false;
  return checkDigit(code.slice(0, 12)) === code[12];
}

function randomBrazilianEAN() {
  const prefix = Math.random() < 0.5 ? "789" : "790";
  let base = prefix;
  while (base.length < 12) base += Math.floor(Math.random() * 10);
  return base + checkDigit(base);
}

function encodeEAN13(code) {
  const first = Number(code[0]);
  const left = code.slice(1, 7);
  const right = code.slice(7);
  const parity = PARITY[first];
  let bits = "101";
  for (let i = 0; i < 6; i++) {
    const digit = Number(left[i]);
    bits += parity[i] === "L" ? L_CODES[digit] : G_CODES[digit];
  }
  bits += "01010";
  for (const char of right) bits += R_CODES[Number(char)];
  bits += "101";
  return bits;
}

function Barcode({ code }) {
  if (!isValid(code)) return null;
  const bits = encodeEAN13(code);
  const module = 3;
  const width = bits.length * module + 36;
  const height = 190;
  return (
    <svg className="barcode-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Código de barras EAN-13 ${code}`}>
      <rect width={width} height={height} fill="white" />
      {bits.split("").map((bit, i) => bit === "1" ? (
        <rect key={i} x={18 + i * module} y="12" width={module} height="125" fill="#111" />
      ) : null)}
      <text x={width / 2} y="166" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="24" letterSpacing="3" fill="#111">{code}</text>
    </svg>
  );
}

export default function EAN13Page() {
  const [value, setValue] = useState("");
  const [generated, setGenerated] = useState("");

  useEffect(() => {
    setGenerated(randomBrazilianEAN());
  }, []);

  const status = useMemo(() => {
    if (!value) return null;
    if (value.length === 12) return { type: "info", text: `Dígito verificador: ${checkDigit(value)}` };
    if (value.length === 13) return isValid(value)
      ? { type: "ok", text: "EAN-13 matematicamente válido." }
      : { type: "error", text: `Código inválido. O último dígito deveria ser ${checkDigit(value.slice(0, 12))}.` };
    return { type: "info", text: "Digite 12 ou 13 números." };
  }, [value]);

  function generate() {
    setGenerated(randomBrazilianEAN());
    setValue("");
  }

  function calculate() {
    if (value.length === 12) setGenerated(value + checkDigit(value));
    else if (value.length === 13 && isValid(value)) setGenerated(value);
  }

  function downloadSVG() {
    if (!isValid(generated)) return;
    const bits = encodeEAN13(generated);
    const module = 3;
    const width = bits.length * module + 36;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 190"><rect width="100%" height="100%" fill="white"/>${bits.split("").map((bit,i)=>bit==="1"?`<rect x="${18+i*module}" y="12" width="${module}" height="125" fill="#111"/>`:"").join("")}<text x="${width/2}" y="166" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" letter-spacing="3" fill="#111">${generated}</text></svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EAN-13-${generated}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      <section className="tool-page">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Love3D</Link> / Ferramentas / EAN-13</div>
          <div className="tool-header">
            <h1>Gerador EAN-13</h1>
            <p>Gere um EAN-13 válido matematicamente, calcule o dígito verificador e baixe o código de barras em SVG.</p>
          </div>

          <div className="tool-layout">
            <section className="panel">
              <h2>Gerar ou validar</h2>

              <div className="field">
                <label htmlFor="ean">Código EAN-13</label>
                <input
                  id="ean"
                  className="input"
                  inputMode="numeric"
                  value={value}
                  onChange={(e) => setValue(normalize(e.target.value))}
                  placeholder="Digite 12 ou 13 números"
                  maxLength={13}
                />
                <p className="field-help">Para gerar o dígito final, informe os primeiros 12 números.</p>
              </div>

              <div className="button-row">
                <button className="btn btn-primary" onClick={calculate}>Calcular EAN</button>
                <button className="btn btn-secondary" onClick={generate}>Gerar aleatório</button>
              </div>

              {status && <div className="result-box"><div className="result-label">Status</div><div style={{marginTop: 6}}>{status.text}</div></div>}

              <div className="result-box">
                <div className="result-label">EAN gerado</div>
                <div className="ean-number">{generated}</div>
              </div>

              <div className="notice">
                <strong>Importante:</strong> um código matematicamente válido não significa que ele esteja oficialmente
                atribuído ou registrado pela GS1. Para uso comercial, utilize um GTIN obtido pelos canais oficiais quando necessário.
              </div>
            </section>

            <section className="panel">
              <h2>Pré-visualização</h2>
              <div className="barcode-wrap"><Barcode code={generated} /></div>
              <div className="button-row">
                <button className="btn btn-primary" onClick={downloadSVG}>Baixar SVG</button>
              </div>
              <p className="tool-note">
                O SVG pode ser usado em etiquetas e artes sem perder qualidade. Antes de imprimir em escala comercial,
                confira a leitura do código com um leitor e as exigências do marketplace.
              </p>
            </section>
          </div>
        </div>
      </section>
    </Layout>
  );
}
