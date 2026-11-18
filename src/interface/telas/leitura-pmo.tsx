// Etapa 5 (decisões 0013, 0035 e 0037): "Conferir o plano" faz a conferência por código e a leitura do PMO numa
// ação só, com a conexão com o Claude, o custo antes e o uso depois. Cada achado do PMO aparece como sugestão, com a situação dada pelo código (citação conferida, rebaixado,
// citação não conferida) e a gravidade e a categoria pela regra fixa. O GP decide se procede.
import { useMemo } from "react";
import { MODELO_PADRAO, MODELOS, type IdModelo } from "../../config/modelo";
import type { Conferencia, DecisaoAchado, DocumentoLido } from "../../dossie/esquema";
import { conferirLeitura, NOME_SITUACAO_PMO, pedidoLeitura } from "../../etapas/5-conferencia/leitura-pmo";
import { NOME_ESTADO_CITACAO } from "../../pmo/citacoes";
import { estimarCusto, formatarDolar } from "../../pmo/custo";
import {
  estimarTokens,
  pcsConfirmadas,
  referenciasEtapa5,
  textoDeSistema,
  textoDosDocumentos,
} from "../../pmo/montagem";
import { semRevisoesDoPmo } from "../../pmo/itens";
import { RespostaLeitura } from "../../pmo/schemas/leitura";
import type { Achado } from "../../regras/achado";
import { EtiquetaRotulo, RotuloSecao } from "../componentes/basicos";
import { SegundaInstancia } from "../componentes/segunda-instancia";
import { ConectarClaude, useChave } from "../componentes/conectar-claude";
import { PassoPmoNaTela, UsoNaTela, useChamadaPmo } from "../componentes/passo-pmo";

const NOME_DOC = { rfp: "RFP", proposta: "proposta", contrato: "contrato", tap: "TAP", pgp: "PGP" } as const;

export function LeituraDoPmo({
  pgp,
  tap,
  rfp,
  conf,
  atualizar,
  achadosDoCodigo,
  dispensasCandidatas,
  condicionais,
}: {
  pgp: DocumentoLido;
  tap?: DocumentoLido;
  rfp?: DocumentoLido;
  conf: Conferencia;
  atualizar: (m: Partial<Conferencia>) => void;
  achadosDoCodigo: Achado[];
  dispensasCandidatas: { parte: string; justificativa: string }[];
  condicionais: Map<string, Achado[]>;
}) {
  const chave = useChave();
  const modelo = conf.modeloPmo ?? MODELO_PADRAO;
  const { rodando, erro, chamar, cancelar } = useChamadaPmo();
  // só as premissas críticas confirmadas pelo GP vão no checklist (decisão 0064)
  const chavePcs = pcsConfirmadas(conf.premissasAplicaveis)?.join(",") ?? "";
  const sistema = useMemo(
    () => textoDeSistema(referenciasEtapa5({ pcs: chavePcs ? chavePcs.split(",") : undefined })),
    [chavePcs],
  );
  const documentos = useMemo(() => [pgp, ...(tap ? [tap] : []), ...(rfp ? [rfp] : [])], [pgp, tap, rfp]);
  const textoDocs = useMemo(() => textoDosDocumentos(documentos), [documentos]);
  const pedido = pedidoLeitura({
    partesPresentes: conf.mapa.filter((m) => m.situacao === "presente").map((m) => m.codigo),
    caracteristicas: conf.caracteristicas,
    premissasAplicaveis: conf.premissasAplicaveis,
    achadosDoCodigo,
    temTap: Boolean(tap),
    temRfp: Boolean(rfp),
    dispensasCandidatas,
    condicionais,
  });
  const conferidos = conf.leituraPmo
    ? conferirLeitura(conf.leituraPmo.resposta, { pgp, tap, rfp }, achadosDoCodigo, conf.mapa)
    : [];
  const uso = conf.usoPmo ?? [];

  async function pedir() {
    const r = await chamar({
      etapa: 5,
      passo: "leitura",
      schema: RespostaLeitura,
      chave,
      modelo,
      sistema,
      documentos: textoDocs,
      pedido,
    });
    if (!r) return;
    atualizar({
      // a leitura nova não herda as decisões da anterior
      decisoes: semRevisoesDoPmo(conf.decisoes),
      leituraPmo: { resposta: r.resposta, modelo: r.modelo, em: r.em },
      usoPmo: r.uso ? [...uso, r.uso] : uso,
      executadaEm: new Date().toISOString(),
    });
  }

  const decidir = (id: string, m: Partial<DecisaoAchado>) =>
    atualizar({ decisoes: { ...conf.decisoes, [id]: { ...conf.decisoes[id], ...m } } });

  return (
    <>
      <section className="bloco">
        <RotuloSecao>Conexão com o PMO</RotuloSecao>
        <ConectarClaude modelo={modelo as IdModelo} />
        <div className="cartao cartao__corpo acoes-exportar" style={{ marginTop: 8 }}>
          <label>
            <span className="lb">Modelo</span>{" "}
            <select
              aria-label="Modelo"
              value={modelo}
              onChange={(e) => atualizar({ modeloPmo: e.target.value })}
              disabled={Boolean(rodando)}
            >
              {Object.entries(MODELOS).map(([id, m]) => (
                <option key={id} value={id}>
                  {m.nome}
                  {id === "claude-opus-5-5" ? " (padrão provisório)" : ""}
                </option>
              ))}
            </select>
          </label>
          <span className="envio__obs">
            Gasto da leitura até agora: {formatarDolar(uso.reduce((s, u) => s + (u.custoUsd ?? 0), 0))}.
          </span>
        </div>
      </section>

      <PassoPmoNaTela
        passo="leitura"
        titulo="Conferência do plano"
        rotuloBotao="Conferir o plano"
        testid="conferir-plano"
        explicacao="Confira o mapa, as características, as premissas e os requisitos acima. O código confere o plano no navegador e monta o pedido; o PMO lê o plano a partir do que o código apontou; o código confere cada citação do PMO, procura o que ele diz estar ausente na parte apontada (sem os trechos que ele mesmo cita) e dá a gravidade pela parte. Mudou algo acima? Os achados do código se refazem sozinhos; a leitura do PMO, só se você pedir de novo."
        pedido={pedido}
        semPedido=""
        feito={conf.leituraPmo ? { modelo: conf.leituraPmo.modelo, em: conf.leituraPmo.em } : undefined}

        chave={chave}
        estimativa={estimarCusto(
          modelo,
          "leitura",
          estimarTokens(sistema) + estimarTokens(textoDocs),
          estimarTokens(pedido),
        )}
        rodando={rodando}
        erro={erro}
        aoPedir={() => void pedir()}
        aoCancelar={cancelar}
        envio="Ao clicar, o texto do plano, do TAP e da RFP vai para a API do Claude, pela sua chave, na organização da FGV, junto com os achados do código."
      >
        {conf.leituraPmo && (
          <SegundaInstancia
            etapa={5}
            passo="leitura"
            resposta={conf.leituraPmo.resposta}
            respostaEm={conf.leituraPmo.em}
            documentos={documentos}
            modelo={modelo}
            pedidoDoPasso={pedido ?? ""}
          />
        )}
        {conferidos.length > 0 && (
          <div data-testid="leitura-pmo">
            <p className="envio__obs" style={{ margin: "8px 0" }}>
              Todo achado do PMO é sugestão. O código conferiu as citações, procurou o que o PMO diz estar
              ausente na parte apontada (sem os trechos que o próprio achado cita) e aplicou a gravidade e a
              categoria pela parte do plano.
            </p>
            {conferidos.map((a) => {
              const id = `pmo:${a.id}`;
              const d = conf.decisoes[id];
              return (
                <article
                  key={a.id}
                  className="cartao cartao--borda bloco achado"
                  data-situacao={a.situacao}
                  data-testid={`achado-pmo-${a.id}`}
                >
                  <div className="cartao__corpo">
                    <div className="achado__cabeca">
                      <EtiquetaRotulo rotulo="sugestao" />
                      <span className="lb">leitura do PMO</span>
                      <span className="lb">{a.tipo}</span>
                      <span className="lb">{a.parte}</span>
                      <span className="lb">{a.gravidade}</span>
                      <span className="lb">{a.categoria}</span>
                      {a.situacao !== "valido" && (
                        <span className="lb aviso-item">{NOME_SITUACAO_PMO[a.situacao]}</span>
                      )}
                      {a.redacaoAConferir && <span className="lb aviso-item">redação a conferir</span>}
                      {a.jaApontadoPeloCodigo && (
                        <span className="lb">o código também apontou nesta parte</span>
                      )}
                    </div>
                    <h3 style={{ margin: "4px 0" }}>{a.titulo}</h3>
                    <p>{a.descricao}</p>
                    {a.localizadoEm && (
                      <p className="envio__obs">
                        O código achou no plano, p. {a.localizadoEm.pagina}: “{a.localizadoEm.trecho}”
                      </p>
                    )}
                    {a.procuradoEm && (
                      <p className="envio__obs">Procurado pelo código em: {a.procuradoEm}.</p>
                    )}
                    {a.evidencias.map((f, k) => (
                      <p key={k} className="envio__obs">
                        {NOME_DOC[f.doc]}, p. {f.pagina}: “{f.trecho}” ·{" "}
                        {NOME_ESTADO_CITACAO[a.citacoes[k]?.estado ?? "nao-conferida"]}
                      </p>
                    ))}
                    <p className="envio__obs">Sugestão: {a.sugestao}</p>
                    <div className="decisao">
                      <EtiquetaRotulo rotulo="decisao-gp" />
                      <select
                        aria-label={`O achado ${a.id} procede?`}
                        value={d?.procede ?? ""}
                        onChange={(e) =>
                          decidir(id, { procede: (e.target.value || undefined) as DecisaoAchado["procede"] })
                        }
                      >
                        <option value="">pendente</option>
                        <option value="sim">procede</option>
                        <option value="nao">não procede</option>
                      </select>
                      <input
                        aria-label={`Justificativa de ${a.id}`}
                        placeholder="Justificativa"
                        value={d?.justificativa ?? ""}
                        onChange={(e) => decidir(id, { justificativa: e.target.value })}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </PassoPmoNaTela>
      {<UsoNaTela uso={uso} titulo="Uso da API na conferência" />}
    </>
  );
}
