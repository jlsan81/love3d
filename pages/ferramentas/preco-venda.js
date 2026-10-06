import { useMemo, useState } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";

const initial = {
  cost: "10",
  extra: "0",
  marketplace: "0",
  payment: "0",
  tax: "0",
  fixedFee: "0",
  margin: "30",
};

const number = (value) => {
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const money = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Field({ label, value, onChange, suffix, help }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="input-suffix">
        <input
          className="input"
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && <span>{suffix}</span>}
      </div>
      {help && <p className="field-help">{help}</p>}
    </div>
  );
}

export default function PrecoVendaPage() {
  const [data, setData] = useState(initial);
  const update = (key, value) => setData((d) => ({ ...d, [key]: value }));
  const reset = () => setData({ ...initial });

  const result = useMemo(() => {
    const cost = number(data.cost);
    const extra = number(data.extra);
    const marketplace = number(data.marketplace) / 100;
    const payment = number(data.payment) / 100;
    const tax = number(data.tax) / 100;
    const fixedFee = number(data.fixedFee);
    const margin = number(data.margin) / 100;

    const base = cost + extra + fixedFee;
    const deductions = marketplace + payment + tax;
    const denominator = 1 - deductions - margin;

    if (denominator <= 0) {
      return { error: true, base, price: 0, fees: 0, profit: 0, net: 0, effectiveMargin: 0 };
    }

    const price = base / denominator;
    const fees = price * deductions;
    const profit = price - cost - extra - fixedFee - fees;
    const net = price - fees;
    const effectiveMargin = price > 0 ? (profit / price) * 100 : 0;

    return { error: false, base, price, fees, profit, net, effectiveMargin };
  }, [data]);

  return (
    <Layout>
      <section className="tool-page">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Love3D</Link> / Ferramentas / Calculadora de preço
          </div>

          <div className="tool-header">
            <h1>Calculadora de preço de venda</h1>
            <p>
              Descubra quanto cobrar pela sua peça para pagar os custos, absorver taxas
              e ainda alcançar a margem de lucro que você deseja.
            </p>
          </div>

          <div className="tool-layout">
            <section className="panel">
              <h2>Dados da venda</h2>

              <div className="calc-section">
                <h3>Custo da peça</h3>
                <Field
                  label="Custo de produção"
                  value={data.cost}
                  onChange={(v) => update("cost", v)}
                  suffix="R$"
                  help="Use o resultado da Calculadora de custo de impressão 3D."
                />
                <Field
                  label="Custos extras por unidade"
                  value={data.extra}
                  onChange={(v) => update("extra", v)}
                  suffix="R$"
                  help="Frete absorvido, embalagem adicional, acabamento ou outro custo que não esteja no custo de produção."
                />
              </div>

              <div className="calc-section">
                <h3>Taxas sobre a venda</h3>
                <div className="calc-grid">
                  <Field label="Marketplace" value={data.marketplace} onChange={(v) => update("marketplace", v)} suffix="%" help="Comissão percentual da plataforma." />
                  <Field label="Pagamento" value={data.payment} onChange={(v) => update("payment", v)} suffix="%" help="Cartão, intermediador ou outra taxa percentual." />
                  <Field label="Impostos" value={data.tax} onChange={(v) => update("tax", v)} suffix="%" help="Percentual efetivo que incide sobre a venda." />
                  <Field label="Taxa fixa por venda" value={data.fixedFee} onChange={(v) => update("fixedFee", v)} suffix="R$" help="Taxa fixa cobrada pela plataforma ou meio de pagamento." />
                </div>
              </div>

              <div className="calc-section">
                <h3>Lucro desejado</h3>
                <Field
                  label="Margem de lucro"
                  value={data.margin}
                  onChange={(v) => update("margin", v)}
                  suffix="%"
                  help="Margem líquida desejada sobre o preço final, depois dos custos e taxas."
                />
              </div>

              <div className="button-row">
                <button className="btn btn-secondary" type="button" onClick={reset}>
                  Restaurar valores
                </button>
              </div>

              <div className="notice">
                <strong>Dica:</strong> margem de 30% significa que, depois de pagar custos,
                taxas e impostos, você quer que 30% do preço de venda permaneça como lucro.
              </div>
            </section>

            <section className="panel">
              <h2>Preço recomendado</h2>

              {result.error ? (
                <div className="price-error">
                  <strong>Não é possível calcular.</strong>
                  <p>
                    A soma das taxas e da margem precisa ser menor que 100%.
                    Reduza algum percentual e tente novamente.
                  </p>
                </div>
              ) : (
                <>
                  <div className="cost-total price-total">
                    <span>Preço de venda sugerido</span>
                    <strong>{money(result.price)}</strong>
                  </div>

                  <div className="price-breakdown">
                    <PriceRow label="Preço de venda" value={result.price} highlight />
                    <PriceRow label="Custos + extras + taxa fixa" value={result.base} />
                    <PriceRow label="Taxas e impostos" value={result.fees} />
                    <PriceRow label="Lucro líquido" value={result.profit} />
                  </div>

                  <div className="calc-summary">
                    <div>
                      <span>Você recebe após taxas</span>
                      <strong>{money(result.net)}</strong>
                    </div>
                    <div>
                      <span>Lucro por peça</span>
                      <strong>{money(result.profit)}</strong>
                    </div>
                    <div>
                      <span>Margem efetiva</span>
                      <strong>{result.effectiveMargin.toFixed(1).replace(".", ",")}%</strong>
                    </div>
                  </div>
                </>
              )}

              <div className="notice">
                <strong>Importante:</strong> as taxas de marketplace variam conforme
                plataforma, categoria, anúncio e condições da venda. Informe as taxas
                que realmente se aplicam ao seu caso.
              </div>

              <p className="tool-note">
                Esta calculadora trabalha com <strong>margem sobre o preço de venda</strong>,
                e não com acréscimo sobre o custo. Por isso o preço recomendado pode ser
                maior do que simplesmente adicionar 30% ao custo.
              </p>
            </section>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function PriceRow({ label, value, highlight }) {
  return (
    <div className={"cost-row " + (highlight ? "price-row-highlight" : "")}>
      <span>{label}</span>
      <strong>{money(value)}</strong>
    </div>
  );
}
