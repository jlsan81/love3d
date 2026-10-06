import { useMemo, useState } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";

const initial = { filamentPrice:"100", weight:"50", waste:"10", printHours:"5", printMinutes:"0", power:"120", energyPrice:"0.95", printerPrice:"3000", machineHours:"5000", labor:"0", packaging:"0", other:"0" };
const number = (value) => { const n = Number(String(value).replace(",", ".")); return Number.isFinite(n) && n >= 0 ? n : 0; };
const money = (value) => value.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });

function Field({label,value,onChange,suffix,help}) {
  return <div className="field"><label>{label}</label><div className="input-suffix"><input className="input" type="text" inputMode="decimal" value={value} onChange={e=>onChange(e.target.value)} />{suffix && <span>{suffix}</span>}</div>{help && <p className="field-help">{help}</p>}</div>;
}

export default function CustoImpressaoPage() {
  const [data,setData] = useState(initial);
  const update = (key,value) => setData(d=>({...d,[key]:value}));
  const reset = () => setData({...initial});
  const result = useMemo(() => {
    const filamentPrice=number(data.filamentPrice), weight=number(data.weight), waste=number(data.waste);
    const printTime=number(data.printHours)+number(data.printMinutes)/60, power=number(data.power), energyPrice=number(data.energyPrice);
    const printerPrice=number(data.printerPrice), machineHours=number(data.machineHours);
    const materialWeight=weight*(1+waste/100);
    const material=materialWeight/1000*filamentPrice;
    const energy=power/1000*printTime*energyPrice;
    const machine=machineHours>0 ? printerPrice/machineHours*printTime : 0;
    const labor=number(data.labor), packaging=number(data.packaging), other=number(data.other);
    return {material,energy,machine,labor,packaging,other,total:material+energy+machine+labor+packaging+other,materialWeight,printTime};
  },[data]);

  return <Layout><section className="tool-page"><div className="container">
    <div className="breadcrumb"><Link href="/">Love3D</Link> / Ferramentas / Custo de impressão 3D</div>
    <div className="tool-header"><h1>Calculadora de custo de impressão 3D</h1><p>Descubra quanto realmente custa produzir uma peça considerando filamento, energia, desgaste da impressora, mão de obra e outros gastos.</p></div>
    <div className="tool-layout">
      <section className="panel">
        <h2>Dados da impressão</h2>
        <div className="calc-section"><h3>Filamento</h3><div className="calc-grid">
          <Field label="Preço do filamento" value={data.filamentPrice} onChange={v=>update("filamentPrice",v)} suffix="R$/kg" help="Use o preço que você realmente paga no rolo."/>
          <Field label="Peso da peça" value={data.weight} onChange={v=>update("weight",v)} suffix="g"/>
          <Field label="Perda / desperdício" value={data.waste} onChange={v=>update("waste",v)} suffix="%" help="Inclui brim, suporte, purga e pequenas perdas."/>
        </div></div>
        <div className="calc-section"><h3>Tempo e energia</h3><div className="calc-grid">
          <Field label="Tempo de impressão" value={data.printHours} onChange={v=>update("printHours",v)} suffix="h"/>
          <Field label="Minutos adicionais" value={data.printMinutes} onChange={v=>update("printMinutes",v)} suffix="min"/>
          <Field label="Potência média da impressora" value={data.power} onChange={v=>update("power",v)} suffix="W" help="Use uma média aproximada, não a potência máxima da fonte."/>
          <Field label="Tarifa de energia" value={data.energyPrice} onChange={v=>update("energyPrice",v)} suffix="R$/kWh"/>
        </div></div>
        <div className="calc-section"><h3>Impressora</h3><div className="calc-grid">
          <Field label="Valor da impressora" value={data.printerPrice} onChange={v=>update("printerPrice",v)} suffix="R$"/>
          <Field label="Vida útil estimada" value={data.machineHours} onChange={v=>update("machineHours",v)} suffix="h" help="Horas de impressão esperadas para a máquina."/>
        </div></div>
        <div className="calc-section"><h3>Outros custos</h3><div className="calc-grid">
          <Field label="Mão de obra" value={data.labor} onChange={v=>update("labor",v)} suffix="R$" help="Preparação, retirada, acabamento etc."/>
          <Field label="Embalagem" value={data.packaging} onChange={v=>update("packaging",v)} suffix="R$"/>
          <Field label="Outros custos" value={data.other} onChange={v=>update("other",v)} suffix="R$" help="Cola, lixa, pintura, ímã ou outro gasto da peça."/>
        </div></div>
        <div className="button-row"><button className="btn btn-secondary" type="button" onClick={reset}>Restaurar valores</button></div>
        <div className="notice"><strong>Importante:</strong> esta ferramenta calcula o custo de produção. Margem, impostos e taxas de marketplace ficarão para a calculadora de preço.</div>
      </section>
      <section className="panel">
        <h2>Resultado</h2>
        <div className="cost-total"><span>Custo total da peça</span><strong>{money(result.total)}</strong></div>
        <div className="cost-breakdown">
          <CostRow label="Filamento" value={result.material}/><CostRow label="Energia elétrica" value={result.energy}/><CostRow label="Depreciação da impressora" value={result.machine}/><CostRow label="Mão de obra" value={result.labor}/><CostRow label="Embalagem" value={result.packaging}/><CostRow label="Outros custos" value={result.other}/>
        </div>
        <div className="calc-summary">
          <div><span>Filamento consumido</span><strong>{result.materialWeight.toFixed(1).replace(".",",")} g</strong></div>
          <div><span>Tempo de impressão</span><strong>{result.printTime.toFixed(2).replace(".",",")} h</strong></div>
          <div><span>Custo por hora</span><strong>{money(result.printTime>0 ? result.total/result.printTime : 0)}</strong></div>
        </div>
        <div className="notice"><strong>Como calculamos:</strong> filamento = peso + desperdício; energia = potência média × tempo × tarifa; depreciação = valor da impressora ÷ vida útil em horas × tempo da impressão.</div>
        <p className="tool-note">Este resultado é o <strong>custo de produção</strong>. Não inclui margem de lucro, impostos ou taxas de marketplace.</p>
      </section>
    </div>
  </div></section></Layout>;
}
function CostRow({label,value}) { return <div className="cost-row"><span>{label}</span><strong>{money(value)}</strong></div>; }
