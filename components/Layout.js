import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { LogoHorizontal } from "./Logo";
import AffiliateSlot from "./AffiliateSlot";

const SITE_URL = "https://love3d.com.br";

const SEO = {
  "/": {
    title: "Love3D — Ferramentas gratuitas para impressão 3D",
    description: "Ferramentas gratuitas para impressão 3D: calcule custos, defina preço de venda, gere EAN-13 e QR Code e consulte perfis de impressão.",
    keywords: "impressão 3D, ferramentas impressão 3D, calculadora impressão 3D, custo impressão 3D, preço impressão 3D, EAN-13, QR Code",
  },
  "/ferramentas/ean-13": {
    title: "Gerador EAN-13 online gratuito | Love3D",
    description: "Gere e valide códigos EAN-13, calcule o dígito verificador e baixe o código de barras em SVG gratuitamente.",
    keywords: "gerador EAN-13, EAN-13 online, calcular dígito verificador EAN-13, código de barras EAN-13, EAN 13 SVG",
  },
  "/ferramentas/qrcode": {
    title: "Gerador de QR Code para impressão 3D | Love3D",
    description: "Crie QR Codes em SVG, vazados e prontos para impressão 3D. Gere QR Code para Pix, Wi-Fi, WhatsApp, links, texto, e-mail e telefone.",
    keywords: "gerador QR Code, QR Code impressão 3D, QR Code vazado, QR Code SVG, QR Code Pix, QR Code para impressão 3D",
  },
  "/ferramentas/custo-impressao": {
    title: "Calculadora de custo de impressão 3D | Love3D",
    description: "Calcule o custo real de uma impressão 3D considerando filamento, desperdício, energia, tempo, depreciação, mão de obra e embalagem.",
    keywords: "calculadora custo impressão 3D, custo impressão 3D, calcular custo impressão 3D, preço filamento, depreciação impressora 3D",
  },
  "/ferramentas/preco-venda": {
    title: "Calculadora de preço de venda para impressão 3D | Love3D",
    description: "Descubra quanto cobrar por uma peça impressa em 3D considerando custo, taxas, impostos e margem de lucro.",
    keywords: "calculadora preço impressão 3D, preço de venda impressão 3D, quanto cobrar impressão 3D, margem lucro impressão 3D",
  },
  "/impressao": {
    title: "Perfis de impressão 3D e configurações | Love3D",
    description: "Consulte configurações iniciais para impressão 3D de peças articuladas, funcionais, detalhadas, letras, QR Codes, peças grandes e TPU.",
    keywords: "perfil impressão 3D, configuração impressão 3D, parâmetros impressão 3D, Bambu Studio, TPU, peças funcionais",
  },
  "/impressao/articulados": {
    title: "Perfil de impressão 3D para peças articuladas | Love3D",
    description: "Configuração inicial para imprimir peças articuladas em 3D com boa movimentação, tolerância e acabamento.",
    keywords: "peças articuladas impressão 3D, perfil articulado 3D, configuração impressão 3D articulado",
  },
  "/impressao/pecas-funcionais": {
    title: "Perfil de impressão 3D para peças funcionais | Love3D",
    description: "Configuração inicial para peças funcionais impressas em 3D, priorizando resistência, precisão e confiabilidade.",
    keywords: "peças funcionais impressão 3D, configuração peça funcional 3D, resistência impressão 3D",
  },
  "/impressao/alta-qualidade": {
    title: "Perfil de impressão 3D para alta qualidade e detalhes | Love3D",
    description: "Configuração inicial para miniaturas, modelos detalhados e peças que precisam de melhor acabamento na impressão 3D.",
    keywords: "impressão 3D alta qualidade, impressão 3D detalhes, perfil miniatura 3D, acabamento impressão 3D",
  },
  "/impressao/letras-pequenas": {
    title: "Perfil de impressão 3D para letras pequenas | Love3D",
    description: "Configurações para imprimir letras pequenas, textos, logotipos e detalhes com melhor legibilidade em 3D.",
    keywords: "letras pequenas impressão 3D, texto impressão 3D, letras 3D pequenas, logo impressão 3D",
  },
  "/impressao/qrcode": {
    title: "Perfil de impressão 3D para QR Code | Love3D",
    description: "Configurações para imprimir QR Codes e códigos em 3D com boa definição, contraste e legibilidade.",
    keywords: "QR Code impressão 3D, perfil QR Code 3D, código impressão 3D, QR Code vazado",
  },
  "/impressao/letras-caixa": {
    title: "Perfil de impressão 3D para letras caixa | Love3D",
    description: "Configuração inicial para letras caixa, placas e sinalização impressas em 3D.",
    keywords: "letras caixa impressão 3D, letras 3D, placa impressão 3D, sinalização 3D",
  },
  "/impressao/pecas-grandes": {
    title: "Perfil de impressão 3D para peças grandes e rápidas | Love3D",
    description: "Configurações iniciais para peças grandes, equilibrando velocidade, estabilidade, resistência e consumo de filamento.",
    keywords: "peças grandes impressão 3D, impressão 3D rápida, perfil peças grandes, velocidade impressão 3D",
  },
  "/impressao/tpu-flexivel": {
    title: "Perfil de impressão 3D para TPU e materiais flexíveis | Love3D",
    description: "Configuração inicial para imprimir TPU e outros filamentos flexíveis com maior controle e confiabilidade.",
    keywords: "TPU impressão 3D, filamento flexível, configuração TPU, perfil TPU 3D",
  },
};

const DEFAULT_SEO = {
  title: "Love3D — Ferramentas para impressão 3D",
  description: "Ferramentas gratuitas para impressão 3D, cálculo de custos, preço de venda, códigos e perfis de impressão.",
  keywords: "impressão 3D, ferramentas 3D, calculadora impressão 3D",
};

function getSeo(pathname) {
  return SEO[pathname] || DEFAULT_SEO;
}

function StructuredData({ pathname, seo }) {
  const canonical = SITE_URL + (pathname === "/" ? "" : pathname);
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": SITE_URL + "/#organization",
      name: "Love3D",
      url: SITE_URL,
      logo: SITE_URL + "/logo-love3d.png",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": SITE_URL + "/#website",
      name: "Love3D",
      url: SITE_URL,
      description: DEFAULT_SEO.description,
      publisher: { "@id": SITE_URL + "/#organization" },
      inLanguage: "pt-BR",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": canonical + "#webpage",
      url: canonical,
      name: seo.title,
      description: seo.description,
      isPartOf: { "@id": SITE_URL + "/#website" },
      inLanguage: "pt-BR",
    },
  ];

  if (pathname !== "/") {
    data.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Love3D", item: SITE_URL + "/" },
        { "@type": "ListItem", position: 2, name: seo.title.split(" | ")[0], item: canonical },
      ],
    });
  }

  return data.map((item, index) => (
    <script key={index} type="application/ld+json">
      {JSON.stringify(item)}
    </script>
  ));
}

export default function Layout({ children }) {
  const router = useRouter();
  const [showFavorite, setShowFavorite] = useState(false);
  const pathname = router.pathname || "/";
  const seo = getSeo(pathname);
  const canonical = SITE_URL + (pathname === "/" ? "" : pathname);

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <meta name="robots" content={pathname.startsWith("/admin") ? "noindex,nofollow,noarchive" : "index,follow,max-image-preview:large"} />
        <link rel="canonical" href={canonical} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Love3D" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={SITE_URL + "/logo-love3d.png"} />
        <meta property="og:image:alt" content="Love3D — ferramentas para impressão 3D" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={SITE_URL + "/logo-love3d.png"} />

        <StructuredData pathname={pathname} seo={seo} />
      </Head>

      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="logo-link" aria-label="Love3D - início">
            <LogoHorizontal />
          </Link>
          <nav className="nav">
            <Link href="/ferramentas/ean-13">EAN-13</Link>
            <Link href="/ferramentas/qrcode">QR Code</Link>
            <Link href="/ferramentas/custo-impressao">Custos</Link>
            <Link href="/ferramentas/preco-venda">Preços</Link>
            <Link href="/#ferramentas">Ferramentas</Link>
            <Link href="/#recursos">Recursos</Link>
            <Link href="/impressao">Perfis</Link>
            <button type="button" className="favorite-button" onClick={() => setShowFavorite(true)}>
              ★ Favoritar Love3D
            </button>
          </nav>
        </div>
      </header>

      {showFavorite && (
        <div className="favorite-overlay" role="presentation" onClick={() => setShowFavorite(false)}>
          <div className="favorite-modal" role="dialog" aria-modal="true" aria-labelledby="favorite-title" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="favorite-close" aria-label="Fechar" onClick={() => setShowFavorite(false)}>×</button>
            <div className="favorite-icon">★</div>
            <h2 id="favorite-title">Adicione o Love3D aos seus favoritos</h2>
            <p>Tenha nossas ferramentas sempre à mão na barra de favoritos do navegador.</p>
            <div className="favorite-step">
              <strong>Pressione <kbd>Ctrl</kbd> + <kbd>D</kbd></strong>
              <span>Depois escolha a pasta <strong>Barra de favoritos</strong> e confirme.</span>
            </div>
            <button type="button" className="btn btn-primary favorite-done" onClick={() => setShowFavorite(false)}>
              Entendi
            </button>
            <small>O navegador não permite que um site adicione favoritos automaticamente por segurança.</small>
          </div>
        </div>
      )}

      <main>{children}</main>
      {!pathname.startsWith("/admin") && <AffiliateSlot placement={pathname === "/" ? "home" : pathname.replace(/^\//, "").replaceAll("/", "-")} />}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div><LogoHorizontal /></div>
          <div className="footer-text">Ferramentas gratuitas para quem cria, imprime e vende em 3D.<br />Love3D — em construção.</div>
        </div>
      </footer>
    </>
  );
}
