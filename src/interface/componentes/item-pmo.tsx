// Item do PMO na tela, em qualquer etapa: rótulo, avisos da conferência do código, alternativas, trechos citados e
// a revisão do GP (pendente, aceito, editado, descartado).
import type { EstadoItem, RevisaoItem } from "../../dossie/esquema";
import { NOME_ESTADO_CITACAO } from "../../pmo/citacoes";
import { estadoDe, type ItemConferido } from "../../pmo/itens";
import { EtiquetaRotulo, NOME_ESTADO } from "./basicos";

const ROTULO_APP = { documento: "documento", sugestao: "sugestao", decisao_gp: "decisao-gp" } as const;
const NOME_DOC = { rfp: "RFP", proposta: "proposta", tap: "TAP", pgp: "PGP" } as const;

export type Revisoes = Record<string, RevisaoItem>;

export function ItemNaTela({
  i,
  revisoes,
  aoMudar,
}: {
  i: ItemConferido;
  revisoes: Revisoes;
  aoMudar: (revisoes: Revisoes) => void;
}) {
  const estado = estadoDe(revisoes, i.id);
  const editado = revisoes[i.id]?.textoEditado;
  const mudar = (e: EstadoItem, texto?: string) =>
    aoMudar({ ...revisoes, [i.id]: { estado: e, textoEditado: texto ?? editado } });
  const rotulo = ROTULO_APP[i.item.rotulo];
  const pagina = i.conferencia.citacoes.find((c) => c.pagina)?.pagina;
  const c = i.conferencia;
  return (
    <article
      className="cartao cartao--borda bloco item-rfp"
      data-estado={estado}
      data-testid={`item-${i.id}`}
    >
      <div className="cartao__corpo">
        <div className="achado__cabeca">
          <EtiquetaRotulo
            rotulo={rotulo}
            pagina={rotulo === "documento" && !c.citacaoNaoConferida ? pagina : undefined}
          />
          {c.citacaoNaoConferida && (
            <span className="lb aviso-item">citação não conferida — não vale como fato</span>
          )}
          {c.redacaoAConferir && <span className="lb aviso-item">redação a conferir (afirmativa)</span>}
          {c.numerosSemFonte.length > 0 && (
            <span className="lb aviso-item">número sem fonte — conferir: {c.numerosSemFonte.join(", ")}</span>
          )}
          {i.item.ficha && <span className="lb">{i.item.ficha}</span>}
          {i.item.requisitos.length > 0 && <span className="lb">{i.item.requisitos.join(", ")}</span>}
        </div>
        <p>{estado === "editado" && editado ? editado : i.item.texto}</p>
        {i.complemento && <p className="envio__obs">{i.complemento}</p>}
        {i.item.alternativas.length > 0 && (
          <table className="tabela">
            <thead>
              <tr>
                <th>Alternativa (sugestão)</th>
                <th>Prós</th>
                <th>Contras</th>
              </tr>
            </thead>
            <tbody>
              {i.item.alternativas.map((a, k) => (
                <tr key={k}>
                  <td>{a.texto}</td>
                  <td>{a.pros}</td>
                  <td>{a.contras}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {i.item.motivo && <p className="envio__obs">Motivo: {i.item.motivo}</p>}
        {i.item.fontes.map((f, k) => (
          <details key={k}>
            <summary className="envio__obs">
              Trecho citado ({NOME_DOC[f.doc]}, p. {f.pagina}) ·{" "}
              {NOME_ESTADO_CITACAO[c.citacoes[k]?.estado ?? "nao-conferida"]}
              {c.citacoes[k]?.estado === "outra-pagina" ? ` (p. ${c.citacoes[k]?.pagina})` : ""}
            </summary>
            <p className="envio__obs">“{f.trecho}”</p>
          </details>
        ))}
        <div className="decisao">
          <span className="lb">Revisão do GP</span>
          <select
            aria-label={`Revisão de ${i.id}`}
            value={estado}
            onChange={(e) => mudar(e.target.value as EstadoItem, editado ?? i.item.texto)}
          >
            {(["pendente", "aceito", "editado", "descartado"] as const).map((s) => (
              <option key={s} value={s}>
                {NOME_ESTADO[s].toLowerCase()}
              </option>
            ))}
          </select>
          {estado === "editado" && (
            <textarea
              aria-label={`Texto editado de ${i.id}`}
              rows={3}
              style={{ flex: 1, minWidth: 260 }}
              value={editado ?? i.item.texto}
              onChange={(e) => mudar("editado", e.target.value)}
            />
          )}
        </div>
      </div>
    </article>
  );
}

/** Itens agrupados, com "aceitar os pendentes" do conjunto. */
export function ItensPmo({
  itens,
  revisoes,
  aoMudar,
  rotuloAceitar = "deste passo",
}: {
  itens: ItemConferido[];
  revisoes: Revisoes;
  aoMudar: (revisoes: Revisoes) => void;
  rotuloAceitar?: string;
}) {
  const grupos = [...new Set(itens.map((i) => i.grupo))];
  const pendentes = itens.filter((i) => estadoDe(revisoes, i.id) === "pendente");
  return (
    <>
      {pendentes.length > 1 && (
        <button
          className="botao botao--discreto"
          type="button"
          style={{ margin: "8px 0" }}
          onClick={() => {
            const novas = { ...revisoes };
            for (const i of pendentes) novas[i.id] = { estado: "aceito" };
            aoMudar(novas);
          }}
        >
          Aceitar os {pendentes.length} pendentes {rotuloAceitar}
        </button>
      )}
      {grupos.map((g) => (
        <div key={g}>
          <h3 className="subtitulo-grupo">{g}</h3>
          {itens
            .filter((i) => i.grupo === g)
            .map((i) => (
              <ItemNaTela key={i.id} i={i} revisoes={revisoes} aoMudar={aoMudar} />
            ))}
        </div>
      ))}
    </>
  );
}
