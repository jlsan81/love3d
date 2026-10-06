import { useState } from "react";
import Link from "next/link";
import { LogoHorizontal } from "./Logo";

export default function Layout({ children }) {
  const [showFavorite, setShowFavorite] = useState(false);

  return (
    <>
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
      <footer className="site-footer">
        <div className="container footer-inner">
          <div><LogoHorizontal /></div>
          <div className="footer-text">Ferramentas gratuitas para quem cria, imprime e vende em 3D.<br />Love3D — em construção.</div>
        </div>
      </footer>
    </>
  );
}
