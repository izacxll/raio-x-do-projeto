// Fila de pendências do GP (decisão 0088): as decisões do GP e os itens a conferir, por impacto, um a um; o que vem do
// documento com a citação conferida e as sugestões sem aviso, aceitos em lote por um clique do GP.
import type { RevisaoItem } from "../../dossie/esquema";
import {
  aceitaveisEmLote,
  contarFila,
  filaDePendencias,
  NOME_CLASSE,
  NOME_IMPACTO,
  type ItemRevisavel,
} from "../../pmo/fila";
import { RotuloSecao } from "./basicos";

/** Leva o GP ao cartão do item (o app usa o hash para as rotas: nada de âncora). */
function irAoItem(id: string) {
  const alvo = document.querySelector(`[data-testid="item-${CSS.escape(id)}"]`);
  if (!(alvo instanceof HTMLElement)) return;
  alvo.scrollIntoView({ behavior: "smooth", block: "center" });
  if (!alvo.hasAttribute("tabindex")) alvo.setAttribute("tabindex", "-1");
  alvo.focus({ preventScroll: true });
}

export function FilaDePendencias({
  itens,
  revisoes,
  aoAceitar,
  maximo = 12,
  prazo,
  outrasDecisoes = [],
}: {
  itens: ItemRevisavel[];
  revisoes: Record<string, RevisaoItem>;
  aoAceitar: (ids: string[]) => void;
  /** Quantas linhas da fila mostrar (as de maior impacto). */
  maximo?: number;
  /** Até quando o GP decide (PRAZO_DAS_DECISOES da etapa). */
  prazo?: string;
  /** Decisões do GP que não são item (participar, abordagem, divergências, aprovação). */
  outrasDecisoes?: string[];
}) {
  const fila = filaDePendencias(itens, revisoes);
  if (!fila.length && !outrasDecisoes.length) return null;
  const conta = contarFila(fila);
  const lote = aceitaveisEmLote(fila);
  const individuais = fila.filter((i) => i.classe === "decisao" || i.classe === "conferir");
  return (
    <section className="bloco" aria-label="Fila de pendências do GP">
      <RotuloSecao>Fila de pendências do GP</RotuloSecao>
      <div className="cartao cartao__corpo">
        <p className="resumo-leitura" aria-live="polite">
          <span>
            {conta.decisao + outrasDecisoes.length} {NOME_CLASSE.decisao.toLowerCase()}
          </span>
          ·<span>{conta.conferir} a conferir</span>·<span>{conta.documento} do documento</span>·
          <span>{conta.sugestao} sugestões sem aviso</span>
        </p>
        {prazo && (
          <p className="texto-apoio">
            <b>Decida {prazo}.</b>
          </p>
        )}
        <p className="texto-apoio">
          Decisões do GP e itens com aviso do código vão um a um, por impacto (caixa ou preço, prazo, aceite,
          quem executa). O que vem do documento com a citação conferida e as sugestões sem aviso podem ser
          aceitos de uma vez.
        </p>
        <div className="decisao">
          {lote.documento.length > 0 && (
            <button className="botao botao--discreto" type="button" onClick={() => aoAceitar(lote.documento)}>
              Aceitar os {lote.documento.length} do documento (citação conferida)
            </button>
          )}
          {lote.sugestao.length > 0 && (
            <button className="botao botao--discreto" type="button" onClick={() => aoAceitar(lote.sugestao)}>
              Aceitar as {lote.sugestao.length} sugestões sem aviso
            </button>
          )}
        </div>
        {(individuais.length > 0 || outrasDecisoes.length > 0) && (
          <ol className="fila-pendencias">
            {outrasDecisoes.map((d) => (
              <li key={d}>
                <span className="lb">{NOME_CLASSE.decisao}</span> {d}
              </li>
            ))}
            {individuais.slice(0, maximo).map((i) => (
              <li key={i.id}>
                <span className={`lb ${i.classe === "decisao" ? "" : "aviso-item"}`}>
                  {NOME_CLASSE[i.classe]}
                </span>{" "}
                <span className="lb">{NOME_IMPACTO[i.impactoFinal] ?? "outro"}</span>{" "}
                <button type="button" className="botao-link" onClick={() => irAoItem(i.id)}>
                  {i.texto.length > 140 ? `${i.texto.slice(0, 140).replace(/\s+\S*$/, "")}…` : i.texto}
                </button>
                {i.avisos.length > 0 && <span className="envio__obs"> ({i.avisos.join("; ")})</span>}
              </li>
            ))}
            {individuais.length > maximo && (
              <li className="texto-apoio">… e mais {individuais.length - maximo} nos passos abaixo.</li>
            )}
          </ol>
        )}
      </div>
    </section>
  );
}
