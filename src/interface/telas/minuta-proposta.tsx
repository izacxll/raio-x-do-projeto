// Etapa 2 na tela, pelo método (docs/estudos/metodo-etapa-2.md, decisão 0038): o tipo de contrato e de projeto
// (sugerido pelo código, confirmado pelo GP), as 9 seções do método e a minuta redigida por inteiro, na ordem do
// modelo do edital. As contas são do código (pontos, preço pelo tipo, caixa, produtividade, duração × vigência); a
// redação é do PMO, sempre Sugestão até o GP revisar nos passos acima.
import { useState } from "react";
import type { PropostaDossie } from "../../dossie/esquema";
import {
  SECOES_PROPOSTA,
  type ItemMinuta,
  type MinutaProposta,
  type SecaoRedigida,
} from "../../etapas/2-proposta/minuta";
import {
  NOME_TIPO_CONTRATO,
  NOME_TIPO_PROJETO,
  type TipoContrato,
  type TipoProjeto,
} from "../../etapas/2-proposta/tipo";
import { NOME_ESTADO_CITACAO, citacaoValeComoFato } from "../../pmo/citacoes";
import { EtiquetaRotulo, RotuloSecao } from "../componentes/basicos";

const numero = (t: string): number | undefined => {
  const s = t.trim();
  // "4500.00" é decimal com ponto; "4.500,00" é milhar com ponto e decimal com vírgula
  const n = /^\d+\.\d{1,2}$/.test(s) ? Number(s) : Number(s.replace(/\./g, "").replace(",", "."));
  return t.trim() && Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function TipoDoProjeto({
  minuta,
  p,
  atualizar,
}: {
  minuta: MinutaProposta;
  p: PropostaDossie;
  atualizar: (np: PropostaDossie) => void;
}) {
  const { tipo } = minuta;
  return (
    <section className="bloco" data-testid="tipo-projeto">
      <RotuloSecao>Tipo de contrato e de projeto</RotuloSecao>
      <div className="cartao cartao__corpo">
        <p className="texto-apoio">
          O tipo muda a estrutura do preço, o vocabulário e o caixa. Sugestão do código:{" "}
          {tipo.sugerido.motivos.join("; ")}.
        </p>
        <div className="decisao">
          <EtiquetaRotulo rotulo={tipo.confirmado ? "decisao-gp" : "sugestao"} />
          <select
            aria-label="Tipo de contrato"
            value={tipo.contrato}
            onChange={(e) =>
              atualizar({ ...p, tipo: { contrato: e.target.value as TipoContrato, projeto: tipo.projeto } })
            }
          >
            {Object.entries(NOME_TIPO_CONTRATO).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            aria-label="Tipo de projeto"
            value={tipo.projeto}
            onChange={(e) =>
              atualizar({ ...p, tipo: { contrato: tipo.contrato, projeto: e.target.value as TipoProjeto } })
            }
          >
            {Object.entries(NOME_TIPO_PROJETO).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          {!tipo.confirmado && (
            <button
              className="botao"
              type="button"
              data-testid="confirmar-tipo"
              onClick={() => atualizar({ ...p, tipo: { contrato: tipo.contrato, projeto: tipo.projeto } })}
            >
              Confirmar o tipo
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function ItemDaMinuta({ i }: { i: ItemMinuta }) {
  const citacoes = i.conferencia?.citacoes ?? [];
  return (
    <article
      className="cartao cartao--borda item-rfp"
      data-testid={`minuta-${i.id}`}
      data-situacao={i.alerta ? "nao-localizado" : undefined}
    >
      <div className="cartao__corpo">
        <div className="achado__cabeca">
          <EtiquetaRotulo
            rotulo={i.rotulo}
            pagina={i.rotulo === "documento" ? i.origem?.pagina : undefined}
          />
          {i.doPmo && <span className="lb">leitura do PMO</span>}
          {i.alerta && <span className="lb aviso-item">alerta da conferência do código</span>}
          {i.conferencia?.citacaoNaoConferida && <span className="lb aviso-item">citação não conferida</span>}
          {i.conferencia?.citacaoNaoProva && <span className="lb">citação a conferir (aviso)</span>}
          {i.conferencia?.numerosSemFonte.length ? (
            <span className="lb aviso-item">
              valor não conferido: {i.conferencia.numerosSemFonte.join(", ")}
            </span>
          ) : null}
          {i.conferencia?.redacaoAConferir && <span className="lb aviso-item">redação a conferir</span>}
          {i.pendente && <span className="lb">pendente de revisão do GP (nos passos acima)</span>}
        </div>
        <h3 style={{ margin: "4px 0" }}>{i.nome}</h3>
        <p>{i.texto}</p>
        {i.nota && <p className="envio__obs">{i.nota}</p>}
        {citacoes.length > 0 && (
          <p className="envio__obs">
            {citacoes.map((c, k) => (
              <span key={k}>
                {k > 0 ? " · " : ""}
                {citacaoValeComoFato(c) ? "citação conferida" : NOME_ESTADO_CITACAO[c.estado]}
              </span>
            ))}
          </p>
        )}
        {i.tabela && (
          <details>
            <summary className="envio__obs">Mostrar a tabela ({i.tabela.linhas.length} linhas)</summary>
            <table className="tabela">
              <thead>
                <tr>
                  {i.tabela.colunas.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {i.tabela.linhas.map((l, k) => (
                  <tr key={k}>
                    {l.map((c, j) => (
                      <td key={j}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        )}
      </div>
    </article>
  );
}

/** Os campos do GP do preço de operação contínua: custo mensal de cada função e o mês das parcelas sem prazo. */
function CamposDoPreco({
  minuta,
  p,
  atualizar,
}: {
  minuta: MinutaProposta;
  p: PropostaDossie;
  atualizar: (np: PropostaDossie) => void;
}) {
  const funcoes = minuta.contas.folha?.funcoes ?? [];
  // as parcelas cujo mês o documento não dá: o campo fica mesmo depois de o GP preencher
  const semMes = minuta.contas.parcelasSemPrazo.map((rotulo) => ({ rotulo }));
  const [textos, setTextos] = useState<Record<string, string>>({});
  if (!funcoes.length && !semMes.length) return null;
  const par = p.parametros;
  return (
    <div className="cartao cartao__corpo" data-testid="campos-preco">
      <EtiquetaRotulo rotulo="decisao-gp" />
      {funcoes.map((f) => (
        <label className="campo-numero" key={f.funcao}>
          <span className="lb">Custo mensal de {f.funcao} (salário, encargos e benefícios)</span>
          <input
            aria-label={`Custo mensal de ${f.funcao}`}
            inputMode="decimal"
            placeholder="a definir pelo GP"
            value={
              textos[f.funcao] ?? (f.custoMensal !== undefined ? String(f.custoMensal).replace(".", ",") : "")
            }
            onChange={(e) => {
              setTextos({ ...textos, [f.funcao]: e.target.value });
              // vazio ou inválido sai da lista: o dossiê nunca guarda um custo indefinido
              const custos = { ...(par.custoMensal ?? {}) };
              const n = numero(e.target.value);
              if (n === undefined) delete custos[f.funcao];
              else custos[f.funcao] = n;
              atualizar({ ...p, parametros: { ...par, custoMensal: custos } });
            }}
          />
        </label>
      ))}
      {semMes.map((x) => (
        <label className="campo-numero" key={x.rotulo}>
          <span className="lb">Mês em que entra: {x.rotulo}</span>
          <input
            aria-label={`Mês da parcela ${x.rotulo}`}
            inputMode="numeric"
            placeholder="a definir pelo GP"
            value={par.mesesParcelas?.[x.rotulo] ?? ""}
            onChange={(e) => {
              const n = numero(e.target.value);
              const meses = { ...(par.mesesParcelas ?? {}) };
              if (n && Number.isInteger(n) && n > 0) meses[x.rotulo] = n;
              else delete meses[x.rotulo];
              atualizar({ ...p, parametros: { ...par, mesesParcelas: meses } });
            }}
          />
        </label>
      ))}
    </div>
  );
}

function SecaoDoDocumento({ s }: { s: SecaoRedigida }) {
  return (
    <article
      className="cartao cartao--borda"
      data-testid={`redigida-${s.codigo}`}
      data-situacao={s.situacao === "redigida" ? undefined : "nao-localizado"}
    >
      <div className="cartao__corpo">
        <div className="achado__cabeca">
          <span className="lb">{s.codigo}</span>
          {s.criterio && <span className="lb">responde a: {s.criterio}</span>}
          {!s.doModelo && <span className="lb">fora do modelo do edital</span>}
          {s.situacao !== "redigida" && (
            <span className="lb aviso-item">{s.situacao === "vazia" ? "não redigida" : "só descrita"}</span>
          )}
        </div>
        <h3 style={{ margin: "4px 0" }}>{s.titulo}</h3>
        {s.paragrafos.map((x) => (
          <p key={x.id} data-so-descrito={x.soDescrito || undefined}>
            <EtiquetaRotulo rotulo={x.rotulo} /> {x.item.texto}
            {x.conferencia.citacaoNaoConferida && (
              <span className="lb aviso-item"> citação não conferida</span>
            )}
            {x.conferencia.citacaoNaoProva && <span className="lb"> citação a conferir (aviso)</span>}
            {x.conferencia.numerosSemFonte.length > 0 && (
              <span className="lb aviso-item">
                {" "}
                valor não conferido: {x.conferencia.numerosSemFonte.join(", ")}
              </span>
            )}
          </p>
        ))}
        {!s.paragrafos.length && <p className="envio__obs">A redigir na minuta do PMO.</p>}
      </div>
    </article>
  );
}

export function MinutaPeloMetodo({
  minuta,
  p,
  atualizar,
}: {
  minuta: MinutaProposta;
  p: PropostaDossie;
  atualizar: (np: PropostaDossie) => void;
}) {
  const redigidas = minuta.documento.filter((s) => s.situacao === "redigida").length;
  return (
    <>
      {SECOES_PROPOSTA.map((s, n) => {
        const itens = minuta.itens.filter((i) => i.secao === s.id);
        if (!itens.length && s.id !== "preco") return null;
        return (
          <section className="bloco" key={s.id} data-secao={s.id}>
            <RotuloSecao>
              {n}. {s.titulo}
            </RotuloSecao>
            <p className="texto-apoio">{s.pergunta}</p>
            {itens.map((i) => (
              <ItemDaMinuta key={i.id} i={i} />
            ))}
            {s.id === "preco" && <CamposDoPreco minuta={minuta} p={p} atualizar={atualizar} />}
          </section>
        );
      })}
      <section className="bloco" data-secao="minuta-redigida">
        <RotuloSecao>A minuta redigida, na ordem do modelo do edital</RotuloSecao>
        <p className="resumo-leitura" aria-live="polite">
          <span>
            {redigidas} de {minuta.documento.length} seções redigidas
          </span>
          {minuta.fonte === "codigo" && (
            <span>· a minuta é redigida no passo "a minuta redigida" do PMO</span>
          )}
        </p>
        {minuta.documento.map((s) => (
          <SecaoDoDocumento key={`${s.codigo}-${s.titulo}`} s={s} />
        ))}
      </section>
    </>
  );
}
