import Link from "next/link";
import Layout from "../components/Layout";

const tools = [
  { icon: "▥", title: "Gerador EAN-13", text: "Gere e valide códigos EAN-13 com dígito verificador calculado automaticamente.", href: "/ferramentas/ean-13" },
  { icon: "₱", title: "Calculadora de custos", text: "Calcule o custo real de uma impressão 3D considerando filamento, tempo, energia e desgaste da impressora.", href: "/ferramentas/custo-impressao" },
  { icon: "R$", title: "Calculadora de preço", text: "Descubra quanto cobrar pela sua peça considerando custos, taxas e margem.", href: "/ferramentas/preco-venda" },
  { icon: "▦", title: "Gerador de QR Code", text: "Crie QR Codes em SVG para Wi-Fi, Pix, WhatsApp, links, textos e etiquetas de impressão 3D.", href: "/ferramentas/qrcode" },
];

export default function Home() {
  return (
    <Layout>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">Ferramentas para quem faz em 3D</div>
            <h1>Crie. Imprima. <span>Venda.</span></h1>
            <p>
              O Love3D está sendo construído para reunir ferramentas gratuitas que ajudam
              quem trabalha com impressão 3D a produzir, precificar e vender melhor.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="ferramentas">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Ferramentas gratuitas</h2>
              <p className="section-intro">Começamos com o que é útil no dia a dia de quem vende produtos impressos.</p>
            </div>
          </div>
          <div className="tool-grid">
            {tools.map((tool) => (
              <article className={`tool-card ${tool.coming ? "coming" : ""}`} key={tool.title}>
                <div className="tool-icon">{tool.icon}</div>
                <h3>{tool.title}</h3>
                <p>{tool.text}</p>
                {tool.href ? (
                  <Link href={tool.href} className="tool-link">Abrir ferramenta →</Link>
                ) : (
                  <span className="tool-link">Em breve</span>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="recursos">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>O portal vai crescer junto com você</h2>
              <p className="section-intro">
                Comparadores, calculadoras, materiais, guias e oportunidades de compra serão adicionados aos poucos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
