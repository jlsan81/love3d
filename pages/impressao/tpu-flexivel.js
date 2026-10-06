import Link from "next/link";
import Layout from "../../components/Layout";

const profile = {"slug":"tpu-flexivel","icon":"🧵","title":"TPU / flexível","description":"Configuração inicial para materiais flexíveis, priorizando controle e alimentação.","layer":"0,20 mm","walls":"3","infill":"15–25%","speed":"Baixa","supports":"Evitar quando possível","material":"TPU","tolerance":"0,20–0,40 mm"};

export default function Perfil() {
  return <Layout><section className="tool-page"><div className="container">
    <div className="breadcrumb"><Link href="/">Love3D</Link> / Impressão / Perfis / {profile.title}</div>
    <div className="profile-hero"><span className="profile-icon">{profile.icon}</span><div><div className="eyebrow">Perfil Love3D</div><h1>{profile.title}</h1><p>{profile.description}</p></div></div>
    <div className="profile-layout">
      <section className="panel"><h2>Configuração inicial</h2><div className="profile-grid">
        <div><span>Altura de camada</span><strong>{profile.layer}</strong></div><div><span>Paredes</span><strong>{profile.walls}</strong></div><div><span>Infill</span><strong>{profile.infill}</strong></div><div><span>Velocidade</span><strong>{profile.speed}</strong></div><div><span>Suportes</span><strong>{profile.supports}</strong></div><div><span>Material</span><strong>{profile.material}</strong></div><div><span>Tolerância</span><strong>{profile.tolerance}</strong></div>
      </div></section>
      <section className="panel"><h2>Antes de imprimir</h2><ul className="profile-list"><li>Calibre a impressora antes de usar o perfil pela primeira vez.</li><li>Faça um pequeno teste quando a peça tiver tolerâncias críticas.</li><li>A orientação da peça pode ser mais importante que qualquer outro parâmetro.</li><li>As configurações são um ponto de partida e podem variar conforme impressora, bico e material.</li></ul><div className="notice"><strong>Importante:</strong> estes parâmetros são recomendações iniciais do Love3D. Sempre valide o resultado na sua própria impressora.</div></section>
    </div>
    <div className="profile-nav"><Link href="/impressao">← Ver todos os perfis</Link></div>
  </div></section></Layout>;
}
