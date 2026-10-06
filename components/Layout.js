import Link from "next/link";
import { LogoHorizontal } from "./Logo";

export default function Layout({ children }) {
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
            <Link href="/#ferramentas">Ferramentas</Link>
            <Link href="/#recursos">Recursos</Link>
          </nav>
        </div>
      </header>
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
