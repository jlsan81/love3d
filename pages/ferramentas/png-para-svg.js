import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";

const PRESETS = {
  simples: {
    label: "Logo / desenho simples",
    options: {
      colorsampling: 0,
      numberofcolors: 8,
      colorquantcycles: 1,
      pathomit: 8,
      ltres: 1,
      qtres: 1,
      roundcoords: 1,
      viewbox: true,
      desc: false,
      strokewidth: 0,
    },
  },
  detalhado: {
    label: "Mais detalhes",
    options: {
      colorsampling: 2,
      numberofcolors: 32,
      colorquantcycles: 2,
      pathomit: 2,
      ltres: 0.5,
      qtres: 0.5,
      roundcoords: 2,
      viewbox: true,
      desc: false,
      strokewidth: 0,
    },
  },
  poucasCores: {
    label: "Poucas cores / impressão 3D",
    options: {
      colorsampling: 0,
      numberofcolors: 4,
      colorquantcycles: 1,
      pathomit: 10,
      ltres: 1,
      qtres: 1,
      roundcoords: 1,
      viewbox: true,
      desc: false,
      strokewidth: 0,
    },
  },
};

function resizeImage(ctx, image, maxSize = 1600) {
  const ratio = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  ctx.canvas.width = width;
  ctx.canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);
  return { width, height };
}

function cleanSvg(svg) {
  return svg
    .replace(/<\?xml[^>]*>/gi, "")
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .trim();
}

export default function PngParaSvgPage() {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [svg, setSvg] = useState("");
  const [preset, setPreset] = useState("simples");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const presetInfo = PRESETS[preset];

  const outputName = useMemo(() => {
    if (!fileName) return "imagem-vetorizada.svg";
    return fileName.replace(/\.png$/i, "") + ".svg";
  }, [fileName]);

  async function convert(file) {
    if (!file) return;
    setError("");
    setSvg("");
    setBusy(true);
    setFileName(file.name);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const imageUrl = URL.createObjectURL(file);
      const image = new Image();

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error("Não foi possível abrir a imagem PNG."));
        image.src = imageUrl;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      resizeImage(ctx, image);

      // A vetorização acontece no navegador: a imagem não precisa ser enviada para um servidor.
      const mod = await import("imagetracerjs");
      const ImageTracer = mod.default || mod;

      const result = ImageTracer.imagedataToSVG(
        ctx.getImageData(0, 0, canvas.width, canvas.height),
        presetInfo.options
      );

      setSvg(cleanSvg(result));
      URL.revokeObjectURL(imageUrl);
    } catch (err) {
      console.error(err);
      setError("Não foi possível converter essa imagem. Tente um PNG menor ou com desenho mais simples.");
    } finally {
      setBusy(false);
    }
  }

  function handleFile(event) {
    convert(event.target.files?.[0]);
  }

  function downloadSvg() {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = outputName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function clear() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setFileName("");
    setSvg("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function changePreset(nextPreset) {
    setPreset(nextPreset);
    if (inputRef.current?.files?.[0]) convert(inputRef.current.files[0]);
  }

  return (
    <Layout>
      <section className="tool-page">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Love3D</Link> / Ferramentas / PNG → SVG
          </div>

          <div className="tool-header">
            <h1>Conversor PNG para SVG</h1>
            <p>
              Transforme uma imagem raster em um desenho vetorial. Útil para logos,
              etiquetas, gravações e imagens que você quer levar para o Bambu Studio.
            </p>
          </div>

          <div className="tool-layout">
            <section className="panel">
              <h2>1. Escolha a imagem</h2>

              <label
                htmlFor="png-file"
                className="upload-area"
              >
                <span className="upload-icon">↑</span>
                <strong>{fileName || "Clique para escolher um PNG"}</strong>
                <span>ou arraste a imagem para cá</span>
                <input
                  ref={inputRef}
                  id="png-file"
                  type="file"
                  accept="image/png"
                  onChange={handleFile}
                  style={{ display: "none" }}
                />
              </label>

              <div className="field">
                <label htmlFor="preset">Qualidade da vetorização</label>
                <select
                  id="preset"
                  className="input"
                  value={preset}
                  onChange={(e) => changePreset(e.target.value)}
                  disabled={busy}
                >
                  {Object.entries(PRESETS).map(([key, item]) => (
                    <option key={key} value={key}>{item.label}</option>
                  ))}
                </select>
                <p className="field-help">
                  Para logos e imagens simples, comece com “Logo / desenho simples”.
                </p>
              </div>

              <div className="button-row">
                <button
                  className="btn btn-primary"
                  onClick={() => inputRef.current?.click()}
                  disabled={busy}
                >
                  {busy ? "Convertendo..." : "Escolher PNG"}
                </button>
                <button className="btn btn-secondary" onClick={clear} disabled={busy}>
                  Limpar
                </button>
              </div>

              {error && <div className="notice">{error}</div>}

              <div className="notice">
                <strong>Privacidade:</strong> a conversão é feita diretamente no seu navegador.
                A imagem não precisa ser enviada para o servidor do Love3D.
              </div>

              <p className="tool-note">
                A ferramenta reduz imagens muito grandes para no máximo 1600 px no maior lado
                antes da vetorização, evitando travamentos e arquivos SVG desnecessariamente pesados.
              </p>
            </section>

            <section className="panel">
              <h2>2. Resultado</h2>

              <div className="vector-preview">
                {svg ? (
                  <div className="svg-preview" dangerouslySetInnerHTML={{ __html: svg }} />
                ) : previewUrl ? (
                  <img src={previewUrl} alt="Imagem original" className="original-preview" />
                ) : (
                  <div className="empty-preview">
                    <span>◇</span>
                    <p>O resultado vetorial aparecerá aqui.</p>
                  </div>
                )}
              </div>

              <div className="button-row">
                <button
                  className="btn btn-primary"
                  onClick={downloadSvg}
                  disabled={!svg || busy}
                >
                  Baixar SVG
                </button>
              </div>

              {svg && (
                <div className="result-box">
                  <div className="result-label">Pronto para exportar</div>
                  <div style={{ marginTop: 7 }}>
                    {outputName}
                  </div>
                </div>
              )}

              <p className="tool-note">
                O SVG gerado contém caminhos vetoriais, e não apenas o PNG colocado dentro
                de um arquivo SVG. Isso permite ampliar a arte sem a mesma perda de definição
                de uma imagem raster.
              </p>
            </section>
          </div>
        </div>
      </section>
    </Layout>
  );
}
