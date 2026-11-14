// Etapa 2 na tela: o ponto de partida (código), os três passos do PMO com o custo à vista, as decisões do GP
// (abordagem, premissas críticas, valores, nomes), as contas do código (cronograma, preço), a conferência final,
// a revisão item a item e as saídas.
import { useMemo, useRef, useState, type ReactNode } from "react";
import { LIMITE_DOCUMENTO_TOKENS, MODELOS, type IdModelo } from "../../config/modelo";
import { MOEDA, PRECOS_CONSULTADOS_EM } from "../../config/precos";
import type { DocumentoLido, PropostaDossie } from "../../dossie/esquema";
import { useDossie } from "../../dossie/store";
import { conferirMinuta } from "../../etapas/2-proposta/conferencia-final";
import { calcularCronograma, conferirPrazosDosProdutos } from "../../etapas/2-proposta/cronograma";
import { pedidoConteudo, pedidoEap, pedidoEstrategia } from "../../etapas/2-proposta/pedidos";
import { calcularPreco, conferirValor, lerValorEmReais } from "../../etapas/2-proposta/preco";
import { montarPontoDePartida, type PontoDePartida } from "../../etapas/2-proposta/ponto-de-partida";
import {
  contarPendentesProposta,
  itensDaProposta,
  propostaInicial,
  registrarUso,
  type ItemProposta,
  type PassoProposta,
} from "../../etapas/2-proposta/proposta";
import { exportar, type FormatoExportacao } from "../../exportacao/exportar";
import {
  montarMatrizEChecklist,
  montarPerguntasProposta,
  montarPlanilhaPreco,
  montarPropostaTecnica,
} from "../../exportacao/relatorio-proposta";
import type { ErroPmo } from "../../pmo/cliente";
import { estimarCusto, formatarDolar, formatarTokens } from "../../pmo/custo";
import { estimarTokens, referenciasEtapa2, textoDeSistema, textoDosDocumentos } from "../../pmo/montagem";
import { SCHEMAS } from "../../pmo/schemas/proposta";
import { formatarData } from "../../texto/datas";
import { PREMISSAS_CRITICAS } from "../../dominio/skill";
import { EtiquetaRotulo, RotuloSecao } from "../componentes/basicos";
import { ConectarClaude, useChave } from "../componentes/conectar-claude";
import { ItensPmo } from "../componentes/item-pmo";
import { ABORDAGEM_GRAVADA, MODELO_GRAVADO, respostaGravada } from "../../demonstracao/demonstracao";

const NOME_PASSO: Record<PassoProposta, string> = {
  estrategia: "Estratégia e abordagens",
  conteudo: "Conteúdo técnico e SOW",
  eap: "EAP, estimativas e equipe",
};
const NOME_DESTINO = {
  premissa: "premissa",
  exclusao: "exclusão",
  "obrigacao-contratante": "obrigação do contratante",
  folga: "folga no cronograma",
  reserva: "reserva no preço",
  pergunta: "pergunta de esclarecimento",
} as const;

const numero = (s: string): number | undefined => {
  const v = Number(s.replace(/\./g, "").replace(",", "."));
  return s.trim() === "" || !Number.isFinite(v) ? undefined : v;
};
/** Itens de uma lista numa linha só, sem o ponto final de cada um. */
const lista = (xs: string[]) => xs.map((x) => x.trim().replace(/[.;]$/, "")).join("; ");
const reais = (v?: number) =>
  v === undefined ? "a definir pelo GP" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function PropostaDoFornecedor({ todos }: { todos: DocumentoLido[] }) {
  const { dossie, guardarProposta } = useDossie();
  const docs = useMemo(() => todos.filter((d) => d.papel === "rfp" || d.papel === "anexo-rfp"), [todos]);
  const ponto = useMemo(() => montarPontoDePartida(docs, dossie.analiseRfp), [docs, dossie.analiseRfp]);
  const p = dossie.proposta ?? propostaInicial();
  const chave = useChave();
  const demonstracao = Boolean(dossie.demonstracao);
  /** Na demonstração, o conteúdo e a EAP gravados partem da abordagem da gravação. */
  const foraDaGravacao = demonstracao && Boolean(p.abordagem) && p.abordagem?.id !== ABORDAGEM_GRAVADA;
  const sistema = useMemo(() => textoDeSistema(referenciasEtapa2()), []);
  const textoDocs = useMemo(() => textoDosDocumentos(docs), [docs]);
  const itens = useMemo(() => itensDaProposta(p, docs), [p, docs]);
  const [rodando, setRodando] = useState<{ passo: PassoProposta; recebidos: number } | null>(null);
  const [erro, setErro] = useState<ErroPmo | null>(null);
  const cancelar = useRef<AbortController | null>(null);

  const tokensSistema = estimarTokens(sistema);
  const tokensDocs = estimarTokens(textoDocs);
  const grandeDemais = tokensDocs > LIMITE_DOCUMENTO_TOKENS;

  const atualizar = (np: PropostaDossie) => guardarProposta(np);

  function pedidoDo(passo: PassoProposta, prop: PropostaDossie): string | null {
    const e = prop.estrategia?.resposta;
    if (passo === "estrategia") return pedidoEstrategia(ponto);
    if (!e || !prop.abordagem) return null;
    if (passo === "conteudo")
      return pedidoConteudo(
        ponto,
        e,
        prop.abordagem.id,
        prop.abordagem.justificativa,
        prop.premissasAplicaveis,
      );
    const c = prop.conteudo?.resposta;
    return c ? pedidoEap(ponto, e, prop.abordagem.id, c) : null;
  }

  /** Demonstração (decisão 0027): a resposta gravada do passo, sem chamar a API e sem custo. */
  async function carregarGravada(passo: PassoProposta) {
    setErro(null);
    try {
      const resposta = await respostaGravada(2, passo, SCHEMAS[passo]);
      const atual = useDossie.getState().dossie.proposta ?? propostaInicial(MODELO_GRAVADO);
      const guardada = { resposta, modelo: MODELO_GRAVADO, em: new Date().toISOString() };
      atualizar({ ...atual, modelo: MODELO_GRAVADO, [passo]: guardada } as PropostaDossie);
    } catch (e) {
      setErro({
        message: "Não foi possível carregar a resposta gravada.",
        oQueFazer: e instanceof Error ? e.message : String(e),
      } as ErroPmo);
    }
  }

  async function executar(passo: PassoProposta) {
    const pedido = pedidoDo(passo, p);
    if (!pedido) return;
    if (demonstracao) return carregarGravada(passo);
    if (!chave) return;
    setErro(null);
    const controle = new AbortController();
    cancelar.current = controle;
    setRodando({ passo, recebidos: 0 });
    try {
      const { chamarPmo } = await import("../../pmo/cliente");
      const r = await chamarPmo({
        chave,
        modelo: p.modelo,
        passo,
        sistema,
        documentos: textoDocs,
        pedido,
        schema: SCHEMAS[passo],
        sinal: controle.signal,
        aoReceber: (recebidos) => setRodando({ passo, recebidos }),
      });
      // o estado pode ter mudado durante a chamada (revisões do GP): parte do que está no store agora
      const atual = useDossie.getState().dossie.proposta ?? propostaInicial(p.modelo);
      const guardada = { resposta: r.resposta, modelo: r.modelo, em: r.em };
      const nova: PropostaDossie =
        passo === "estrategia"
          ? { ...atual, estrategia: guardada as PropostaDossie["estrategia"] }
          : passo === "conteudo"
            ? { ...atual, conteudo: guardada as PropostaDossie["conteudo"] }
            : { ...atual, eap: guardada as PropostaDossie["eap"] };
      atualizar(registrarUso(nova, passo, r));
    } catch (e) {
      setErro(e as ErroPmo);
    } finally {
      setRodando(null);
      cancelar.current = null;
    }
  }

  const pendentes = contarPendentesProposta(p, itens);
  const estimativa = (passo: PassoProposta) => {
    const pedido = pedidoDo(passo, p) ?? "";
    return estimarCusto(p.modelo, passo, tokensSistema + tokensDocs, estimarTokens(pedido));
  };
  const totalUso = p.uso.reduce((s, u) => s + (u.custoUsd ?? 0), 0);

  return (
    <>
      <section className="bloco">
        <RotuloSecao>Conexão com o PMO</RotuloSecao>
        {demonstracao ? (
          <div className="cartao cartao__corpo">
            <p className="texto-apoio">
              Demonstração: a chave não é usada e nada é enviado à API. Cada passo do PMO carrega a resposta
              gravada para esta RFP; as decisões do GP, a conferência e as contas são as de verdade.
            </p>
          </div>
        ) : (
          <ConectarClaude modelo={p.modelo as IdModelo} />
        )}
        <div
          className="cartao cartao__corpo acoes-exportar"
          style={{ marginTop: 8, display: demonstracao ? "none" : undefined }}
        >
          <label>
            <span className="lb">Modelo</span>{" "}
            <select
              aria-label="Modelo"
              value={p.modelo}
              onChange={(e) => atualizar({ ...p, modelo: e.target.value })}
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
            Preços de {PRECOS_CONSULTADOS_EM}, em {MOEDA}. Gasto desta proposta até agora:{" "}
            {formatarDolar(totalUso)} em {p.uso.length} {p.uso.length === 1 ? "chamada" : "chamadas"}.
          </span>
        </div>
        {grandeDemais && (
          <div className="aviso aviso--erro">
            <p>
              Os documentos têm cerca de {formatarTokens(tokensDocs)} tokens, mais que o limite do app (
              {formatarTokens(LIMITE_DOCUMENTO_TOKENS)}). Tire os anexos que não tratam do objeto (planilhas
              de outros lotes, modelos de declaração) e tente de novo.
            </p>
          </div>
        )}
      </section>

      <PontoDePartidaNaTela ponto={ponto} />

      {(["estrategia", "conteudo", "eap"] as const).map((passo) => {
        const feito = Boolean(p[passo]);
        const pedido = pedidoDo(passo, p);
        const est = estimativa(passo);
        return (
          <section className="bloco" key={passo} data-passo={passo}>
            <RotuloSecao>PMO · {NOME_PASSO[passo]}</RotuloSecao>
            <div className="cartao cartao__corpo">
              {!pedido ? (
                <p className="texto-apoio">
                  {passo === "conteudo"
                    ? "Antes, peça a estratégia e escolha a abordagem (decisão do GP)."
                    : "Antes, peça o conteúdo técnico."}
                </p>
              ) : (
                <>
                  {demonstracao && passo !== "estrategia" && (
                    <p className="envio__obs" data-testid={`gravacao-${passo}`}>
                      {foraDaGravacao
                        ? `As respostas gravadas partem da abordagem ${ABORDAGEM_GRAVADA}. Para seguir a demonstração, escolha a ${ABORDAGEM_GRAVADA} na estratégia.`
                        : `Resposta gravada a partir da abordagem ${ABORDAGEM_GRAVADA}.`}
                    </p>
                  )}
                  {est && !demonstracao && (
                    <p className="envio__obs" data-testid={`custo-${passo}`}>
                      Estimativa antes de chamar: cerca de {formatarTokens(est.tokensEntrada)} tokens de
                      entrada e {formatarTokens(est.saidaMin)} a {formatarTokens(est.saidaMax)} de saída:{" "}
                      {formatarDolar(est.semCache.min)} a {formatarDolar(est.semCache.max)} na primeira
                      chamada; {formatarDolar(est.comCache.min)} a {formatarDolar(est.comCache.max)} se feita
                      em até 5 minutos depois da anterior (skill e documentos lidos do cache).
                    </p>
                  )}
                  {!demonstracao && (
                    <p className="envio__obs">
                      O texto dos PDFs da RFP vai para a API do Claude, pela sua chave, na organização da FGV.
                    </p>
                  )}
                  <div className="acoes-exportar">
                    <button
                      className="botao botao--cheio"
                      type="button"
                      data-testid={`pedir-${passo}`}
                      disabled={
                        demonstracao
                          ? foraDaGravacao && passo !== "estrategia"
                          : !chave || Boolean(rodando) || grandeDemais
                      }
                      onClick={() => {
                        if (
                          feito &&
                          !window.confirm(
                            "Pedir de novo? A resposta atual será substituída e as revisões dela, perdidas.",
                          )
                        )
                          return;
                        void executar(passo);
                      }}
                    >
                      {demonstracao
                        ? feito
                          ? "Carregar de novo a resposta gravada"
                          : "Carregar a resposta gravada"
                        : feito
                          ? "Pedir de novo ao PMO"
                          : "Pedir ao PMO"}
                    </button>
                    {!chave && !demonstracao && (
                      <span className="envio__obs">Conecte a chave acima para pedir.</span>
                    )}
                    {rodando?.passo === passo && (
                      <>
                        <span className="envio__obs" aria-live="polite">
                          O PMO está escrevendo… {formatarTokens(rodando.recebidos)} caracteres recebidos.
                          Pode levar alguns minutos.
                        </span>
                        <button
                          className="botao botao--discreto"
                          type="button"
                          onClick={() => cancelar.current?.abort()}
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                  {erro && !rodando && (
                    <div className="aviso aviso--erro" role="alert">
                      <p>
                        <b>{erro.message}</b> {erro.oQueFazer}
                      </p>
                    </div>
                  )}
                </>
              )}
              {feito && (
                <p className="envio__obs">
                  {p[passo]?.modelo === MODELO_GRAVADO
                    ? "Resposta gravada (demonstração), sem chamada à IA."
                    : `Resposta de ${p[passo]?.modelo} em ${new Date(p[passo]?.em ?? "").toLocaleString("pt-BR")}.`}
                </p>
              )}
            </div>
            {passo === "estrategia" && p.estrategia && (
              <Estrategia p={p} atualizar={atualizar} itens={itens} />
            )}
            {passo === "conteudo" && p.conteudo && (
              <Itens itens={itens.filter((i) => i.passo === "conteudo")} p={p} atualizar={atualizar} />
            )}
            {passo === "eap" && p.eap && (
              <Eap p={p} ponto={ponto} atualizar={atualizar} itens={itens} docs={docs} />
            )}
          </section>
        );
      })}

      {(p.conteudo || p.estrategia) && <ConferenciaNaTela p={p} ponto={ponto} />}

      <section className="bloco">
        <RotuloSecao>Exportar</RotuloSecao>
        <div className="cartao cartao__corpo">
          <p className="resumo-leitura" aria-live="polite">
            <span>{itens.length} itens do PMO</span>·<span>{pendentes} pendências do GP</span>
            <span>
              {pendentes > 0
                ? "· os documentos saem com o cabeçalho de minuta até tudo ser revisado"
                : "· tudo revisado"}
            </span>
          </p>
          <Exportar ponto={ponto} docs={docs} habilitado={Boolean(p.estrategia)} />
        </div>
      </section>

      {p.uso.length > 0 && <UsoNaTela p={p} />}
    </>
  );
}

function PontoDePartidaNaTela({ ponto }: { ponto: PontoDePartida }) {
  const criterio = ponto.julgamento.find((i) => i.id === "julgamento:criterio");
  const linha = (nome: string, valor: ReactNode, pagina?: number) => (
    <tr>
      <td>{nome}</td>
      <td>{valor}</td>
      <td>{pagina ? <EtiquetaRotulo rotulo="documento" pagina={pagina} /> : "—"}</td>
    </tr>
  );
  return (
    <section className="bloco">
      <RotuloSecao>Ponto de partida (código, da etapa 1)</RotuloSecao>
      <div className="cartao cartao__corpo">
        <p className="texto-apoio">
          {ponto.daEtapa1
            ? "Vem da análise da RFP da etapa 1, com a revisão do GP (requisitos e brechas descartados ficam de fora)."
            : "A etapa 1 não foi feita neste dossiê: a leitura da RFP rodou aqui, sem revisão. Para corrigir os requisitos, faça a etapa 1."}
        </p>
        <table className="tabela">
          <tbody>
            {linha(
              "Requisitos numerados",
              `${ponto.requisitos.length} (${ponto.requisitos.map((r) => r.numero).join(", ")})`,
            )}
            {linha(
              "Critério de julgamento",
              criterio?.texto ?? "não localizado pelo código — conferir no documento",
              criterio?.origem?.pagina,
            )}
            {linha(
              "Modelo obrigatório de proposta",
              ponto.modeloObrigatorio?.texto ?? "não localizado pelo código — conferir no documento",
              ponto.modeloObrigatorio?.origem?.pagina,
            )}
            {linha(
              "Limite de páginas",
              ponto.limitePaginas
                ? `${ponto.limitePaginas.paginas} páginas`
                : "não localizado pelo código — conferir no documento",
              ponto.limitePaginas?.item.origem?.pagina,
            )}
            {linha(
              "Valor estimado",
              ponto.valorEstimado?.texto ?? "não localizado pelo código (ou orçamento sigiloso)",
              ponto.valorEstimado?.origem?.pagina,
            )}
            {linha(
              "Entrega da proposta",
              ponto.entregaDaProposta
                ? `${ponto.entregaDaProposta.texto} — ${ponto.entregaDaProposta.campos?.Alerta ?? ""}`
                : "não localizado pelo código",
              ponto.entregaDaProposta?.origem?.pagina,
            )}
            {linha(
              "Prazo de execução",
              ponto.prazoExecucao?.texto ?? "não localizado pelo código",
              ponto.prazoExecucao?.origem?.pagina,
            )}
            {linha("Brechas com pergunta sugerida", String(ponto.brechas.length))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Itens({
  itens,
  p,
  atualizar,
}: {
  itens: ItemProposta[];
  p: PropostaDossie;
  atualizar: (np: PropostaDossie) => void;
}) {
  return (
    <ItensPmo itens={itens} revisoes={p.revisoes} aoMudar={(revisoes) => atualizar({ ...p, revisoes })} />
  );
}

function Estrategia({
  p,
  atualizar,
  itens,
}: {
  p: PropostaDossie;
  atualizar: (np: PropostaDossie) => void;
  itens: ItemProposta[];
}) {
  const e = p.estrategia!.resposta;
  return (
    <>
      <Itens
        itens={itens.filter((i) => i.passo === "estrategia" && i.grupo !== "Observações do PMO")}
        p={p}
        atualizar={atualizar}
      />
      {e.criterios.length > 0 && (
        <div className="cartao cartao__corpo bloco">
          <h3 className="subtitulo-grupo">Quesitos de pontuação e a seção que responde a cada um</h3>
          <table className="tabela">
            <thead>
              <tr>
                <th>Quesito</th>
                <th>Pontuação</th>
                <th>O que pontua</th>
                <th>Evidência exigida</th>
                <th>Seção sugerida</th>
              </tr>
            </thead>
            <tbody>
              {e.criterios.map((c, k) => (
                <tr key={k}>
                  <td>{c.criterio}</td>
                  <td>{c.pontuacaoMaxima || "—"}</td>
                  <td>{c.oQuePontua}</td>
                  <td>{c.evidenciaExigida}</td>
                  <td>{c.secaoDaProposta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="cartao cartao__corpo bloco" data-testid="abordagens">
        <div className="achado__cabeca">
          <EtiquetaRotulo rotulo="decisao-gp" />
          <h3 className="subtitulo-grupo" style={{ margin: 0 }}>
            Abordagem técnica: o GP escolhe uma
          </h3>
        </div>
        <div className="abordagens">
          {e.abordagens.map((a) => (
            <label
              key={a.id}
              className={`cartao cartao__corpo abordagem${p.abordagem?.id === a.id ? " abordagem--escolhida" : ""}`}
            >
              <span className="achado__cabeca">
                <input
                  type="radio"
                  name="abordagem"
                  checked={p.abordagem?.id === a.id}
                  onChange={() =>
                    atualizar({ ...p, abordagem: { id: a.id, justificativa: p.abordagem?.justificativa } })
                  }
                />
                <EtiquetaRotulo rotulo="sugestao" />
                <b>
                  {a.id} — {a.nome}
                </b>
              </span>
              <span className="envio__obs">{a.descricao}</span>
              <span className="envio__obs">
                <b>Prós:</b> {lista(a.pros)}
              </span>
              <span className="envio__obs">
                <b>Contras:</b> {lista(a.contras)}
              </span>
              <span className="envio__obs">
                <b>Riscos:</b> {lista(a.riscos) || "—"}
              </span>
              <span className="envio__obs">
                <b>Requisitos:</b> {a.requisitos.join(", ") || "—"} · <b>Prazo:</b> {a.impactoPrazo} ·{" "}
                <b>Custo:</b> {a.impactoCusto}
              </span>
            </label>
          ))}
        </div>
        <input
          aria-label="Justificativa da abordagem"
          placeholder="Justificativa da escolha (vai para a minuta)"
          value={p.abordagem?.justificativa ?? ""}
          disabled={!p.abordagem}
          onChange={(ev) =>
            p.abordagem && atualizar({ ...p, abordagem: { ...p.abordagem, justificativa: ev.target.value } })
          }
          style={{ width: "100%", marginTop: 8 }}
        />
      </div>
      <div className="cartao cartao__corpo bloco">
        <div className="achado__cabeca">
          <EtiquetaRotulo rotulo="decisao-gp" />
          <h3 className="subtitulo-grupo" style={{ margin: 0 }}>
            Premissas críticas que se aplicam a este projeto
          </h3>
        </div>
        <p className="envio__obs">
          A sugestão do PMO vem ao lado; quem confirma é o GP. As confirmadas saem escritas no SOW, com a
          consequência.
        </p>
        <table className="tabela">
          <tbody>
            {PREMISSAS_CRITICAS.map((pc) => {
              const s = e.premissasCriticas.find((x) => x.codigo === pc.codigo);
              return (
                <tr key={pc.codigo}>
                  <td>
                    <label>
                      <input
                        type="checkbox"
                        checked={Boolean(p.premissasAplicaveis[pc.codigo])}
                        onChange={(ev) =>
                          atualizar({
                            ...p,
                            premissasAplicaveis: { ...p.premissasAplicaveis, [pc.codigo]: ev.target.checked },
                          })
                        }
                      />{" "}
                      <b>{pc.codigo}</b> {pc.titulo}
                    </label>
                  </td>
                  <td>
                    {s ? (
                      <>
                        <EtiquetaRotulo rotulo="sugestao" />{" "}
                        {s.aplica === "sim"
                          ? "parece aplicar-se"
                          : s.aplica === "nao"
                            ? "parece não se aplicar"
                            : "a confirmar"}
                        : {s.motivo}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {e.destinos.length > 0 && (
        <div className="cartao cartao__corpo bloco">
          <h3 className="subtitulo-grupo">Brechas que viram proposta (sugestão)</h3>
          <table className="tabela">
            <thead>
              <tr>
                <th>Origem</th>
                <th>Destino</th>
                <th>Texto sugerido</th>
                <th>Página</th>
              </tr>
            </thead>
            <tbody>
              {e.destinos.map((d, k) => (
                <tr key={k}>
                  <td>{d.descricaoOrigem}</td>
                  <td>{NOME_DESTINO[d.destino]}</td>
                  <td>{d.texto}</td>
                  <td>{d.fontes[0] ? `p. ${d.fontes[0].pagina}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Itens
        itens={itens.filter((i) => i.passo === "estrategia" && i.grupo === "Observações do PMO")}
        p={p}
        atualizar={atualizar}
      />
    </>
  );
}

function CampoNumero({
  rotulo,
  valor,
  aoMudar,
  sufixo,
}: {
  rotulo: string;
  valor: number | undefined;
  aoMudar: (v: number | undefined) => void;
  sufixo?: string;
}) {
  const [texto, setTexto] = useState(valor === undefined ? "" : String(valor).replace(".", ","));
  return (
    <label className="campo-numero">
      <span className="lb">{rotulo}</span>
      <input
        aria-label={rotulo}
        inputMode="decimal"
        value={texto}
        placeholder="a definir pelo GP"
        onChange={(e) => {
          setTexto(e.target.value);
          aoMudar(numero(e.target.value));
        }}
      />
      {sufixo && <span className="envio__obs">{sufixo}</span>}
    </label>
  );
}

function Eap({
  p,
  ponto,
  atualizar,
  itens,
  docs,
}: {
  p: PropostaDossie;
  ponto: PontoDePartida;
  atualizar: (np: PropostaDossie) => void;
  itens: ItemProposta[];
  docs: DocumentoLido[];
}) {
  const eap = p.eap!.resposta;
  const par = p.parametros;
  const mudarPar = (mudanca: Partial<PropostaDossie["parametros"]>) =>
    atualizar({ ...p, parametros: { ...par, ...mudanca } });
  const crono = calcularCronograma(eap.atividades, {
    aprovacaoDias: par.aprovacaoDias,
    inicio: par.inicio ? new Date(`${par.inicio}T00:00:00`) : undefined,
    prazoRfp: ponto.prazoExecucao,
  });
  const prazos = conferirPrazosDosProdutos(
    crono,
    p.conteudo?.resposta.produtos ?? [],
    docs,
    par.inicio ? new Date(`${par.inicio}T00:00:00`) : undefined,
  );
  const preco = calcularPreco(eap.perfis, eap.horas, par);
  const estimado = ponto.valorEstimado ? lerValorEmReais(ponto.valorEstimado.texto) : undefined;
  const conf = conferirValor(par.precoFinal ?? preco.precoCalculado, estimado);
  return (
    <>
      <div className="cartao cartao__corpo bloco">
        <h3 className="subtitulo-grupo">Cronograma (calculado pelo código)</h3>
        <div className="acoes-exportar">
          <label className="campo-numero">
            <span className="lb">Início previsto (decisão do GP)</span>
            <input
              type="date"
              aria-label="Início previsto"
              value={par.inicio ?? ""}
              onChange={(e) => mudarPar({ inicio: e.target.value || undefined })}
            />
          </label>
          <CampoNumero
            rotulo="Aprovação de cada produto (dias úteis, decisão do GP)"
            valor={par.aprovacaoDias}
            aoMudar={(v) => mudarPar({ aprovacaoDias: v })}
          />
        </div>
        <p className="texto-apoio">
          Duração esperada de cada atividade: (otimista + 4 × mais provável + pessimista) ÷ 6, arredondada
          para cima. Dias úteis descontam só sábados e domingos: conferir feriados.
        </p>
        <div
          className={`aviso aviso--coluna${crono.conferenciaPrazo.situacao === "nao-cabe" ? " aviso--erro" : ""}`}
        >
          <p>
            <b>Total: {crono.total} dias úteis</b>
            {crono.dataFim ? `, até ${formatarData(crono.dataFim)}` : ""} (desvio-padrão do caminho crítico:{" "}
            {crono.desvioTotal.toFixed(1)} dias). {crono.conferenciaPrazo.texto}
          </p>
          {crono.problemas.map((x) => (
            <p key={x}>{x}</p>
          ))}
        </div>
        <table className="tabela" data-testid="cronograma">
          <thead>
            <tr>
              <th>Atividade</th>
              <th>Produto</th>
              <th>Otimista / provável / pessimista</th>
              <th>Duração</th>
              <th>Aprovação</th>
              <th>Início</th>
              <th>Fim</th>
              <th>Folga</th>
            </tr>
          </thead>
          <tbody>
            {crono.atividades.map((a) => {
              const orig = eap.atividades.find((x) => x.id === a.id)!;
              return (
                <tr key={a.id} data-critica={a.critica ? "sim" : undefined}>
                  <td title={orig.duracao.base}>
                    {a.critica ? "● " : ""}
                    {a.id} {a.nome}
                  </td>
                  <td>{a.produto}</td>
                  <td>
                    {orig.duracao.otimista} / {orig.duracao.mais_provavel} / {orig.duracao.pessimista}
                  </td>
                  <td>{a.duracao}</td>
                  <td>{orig.aprovacaoCliente ? (par.aprovacaoDias ?? "a definir") : "—"}</td>
                  <td>{a.dataInicio ? formatarData(a.dataInicio) : `dia ${a.inicioMaisCedo + 1}`}</td>
                  <td>{a.dataFim ? formatarData(a.dataFim) : `dia ${a.fimMaisCedo}`}</td>
                  <td>{a.folga}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="envio__obs">
          ● caminho crítico. Passe o mouse sobre a atividade para ver a base da estimativa.
        </p>
        {prazos.length > 0 && (
          <>
            <h4>Prazo de entrega de cada produto</h4>
            <table className="tabela" data-testid="prazos-produtos">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Conferência do código</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {prazos.map((x) => (
                  <tr key={x.produto} data-origem={x.situacao === "nao-cabe" ? "nao-verificavel" : undefined}>
                    <td>
                      {x.produto} — {x.nome}
                    </td>
                    <td>{x.texto}</td>
                    <td>
                      {x.situacao === "cabe"
                        ? "cabe"
                        : x.situacao === "nao-cabe"
                          ? "não cabe"
                          : "não conferido"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className="cartao cartao__corpo bloco">
        <h3 className="subtitulo-grupo">Equipe e preço (código, com os valores do GP)</h3>
        <table className="tabela" data-testid="preco">
          <thead>
            <tr>
              <th>Perfil</th>
              <th>Exigido</th>
              <th>Nome (decisão do GP)</th>
              <th>Horas (PERT)</th>
              <th>Valor-hora (GP)</th>
              <th>Custo</th>
            </tr>
          </thead>
          <tbody>
            {preco.linhas.map((l) => (
              <tr key={l.perfil.id}>
                <td>{l.perfil.nome}</td>
                <td>
                  {l.perfil.exigido
                    ? `sim${l.perfil.requisito ? ` (${l.perfil.requisito})` : ""}`
                    : "sugerido"}
                </td>
                <td>
                  <input
                    aria-label={`Nome de ${l.perfil.nome}`}
                    placeholder="a definir pelo GP"
                    value={par.nomes[l.perfil.id] ?? ""}
                    onChange={(e) => mudarPar({ nomes: { ...par.nomes, [l.perfil.id]: e.target.value } })}
                  />
                </td>
                <td>{l.horas}</td>
                <td>
                  <CampoNumero
                    rotulo={`Valor-hora de ${l.perfil.nome}`}
                    valor={l.valorHora}
                    aoMudar={(v) => {
                      const valoresHora = { ...par.valoresHora };
                      if (v === undefined) delete valoresHora[l.perfil.id];
                      else valoresHora[l.perfil.id] = v;
                      mudarPar({ valoresHora });
                    }}
                  />
                </td>
                <td>{reais(l.custo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h4>Despesas (decisão do GP)</h4>
        {par.despesas.map((d, k) => (
          <div className="acoes-exportar" key={k}>
            <input
              aria-label="Descrição da despesa"
              value={d.descricao}
              onChange={(e) =>
                mudarPar({
                  despesas: par.despesas.map((x, j) => (j === k ? { ...x, descricao: e.target.value } : x)),
                })
              }
            />
            <CampoNumero
              rotulo="Valor (R$)"
              valor={d.valor}
              aoMudar={(v) =>
                mudarPar({ despesas: par.despesas.map((x, j) => (j === k ? { ...x, valor: v } : x)) })
              }
            />
            <button
              className="botao botao--discreto"
              type="button"
              onClick={() => mudarPar({ despesas: par.despesas.filter((_, j) => j !== k) })}
            >
              Remover
            </button>
          </div>
        ))}
        <button
          className="botao botao--discreto"
          type="button"
          onClick={() => mudarPar({ despesas: [...par.despesas, { descricao: "Nova despesa" }] })}
        >
          Incluir despesa
        </button>
        <div className="acoes-exportar" style={{ marginTop: 8 }}>
          <CampoNumero
            rotulo="Custos indiretos (%)"
            valor={par.indiretosPct}
            aoMudar={(v) => mudarPar({ indiretosPct: v })}
          />
          <CampoNumero
            rotulo="Tributos por dentro (%)"
            valor={par.tributosPct}
            aoMudar={(v) => mudarPar({ tributosPct: v })}
          />
          <CampoNumero
            rotulo="Reserva de contingência (R$)"
            valor={par.reserva}
            aoMudar={(v) => mudarPar({ reserva: v })}
          />
          <CampoNumero
            rotulo="Preço final (R$, decisão do GP)"
            valor={par.precoFinal}
            aoMudar={(v) => mudarPar({ precoFinal: v })}
          />
        </div>
        <table className="tabela">
          <tbody>
            <tr>
              <td>Pessoal ({preco.horasTotais} h)</td>
              <td>{reais(preco.pessoal)}</td>
            </tr>
            <tr>
              <td>Custo direto (pessoal + despesas)</td>
              <td>{reais(preco.direto)}</td>
            </tr>
            <tr>
              <td>Subtotal (com indiretos e reserva)</td>
              <td>{reais(preco.subtotal)}</td>
            </tr>
            <tr>
              <td>Preço calculado (tributos por dentro: subtotal ÷ (1 − tributos))</td>
              <td data-testid="preco-calculado">{reais(preco.precoCalculado)}</td>
            </tr>
            <tr>
              <td>
                <EtiquetaRotulo rotulo="decisao-gp" /> Preço final
              </td>
              <td>{reais(par.precoFinal)}</td>
            </tr>
          </tbody>
        </table>
        {preco.faltando.length > 0 && (
          <p className="envio__obs">Falta preencher: {preco.faltando.join("; ")}.</p>
        )}
        <p className="envio__obs">{conf.texto}</p>
      </div>
      <Itens itens={itens.filter((i) => i.passo === "eap")} p={p} atualizar={atualizar} />
    </>
  );
}

function ConferenciaNaTela({ p, ponto }: { p: PropostaDossie; ponto: PontoDePartida }) {
  const m = conferirMinuta(ponto, p.estrategia?.resposta, p.conteudo?.resposta, p.eap?.resposta);
  return (
    <section className="bloco">
      <RotuloSecao>Conferência final (código)</RotuloSecao>
      <div className="cartao cartao__corpo">
        <p className="texto-apoio">
          Cada requisito e cada quesito de pontuação ligado ao ponto da minuta que o atende. “Não localizado
          na minuta” quer dizer que o código não achou a ligação: conferir.
        </p>
        <table className="tabela" data-testid="matriz">
          <thead>
            <tr>
              <th>Requisito ou quesito</th>
              <th>Descrição</th>
              <th>Atendido em</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            {m.matriz.map((l) => (
              <tr
                key={`${l.tipo}:${l.chave}`}
                data-origem={l.situacao === "nao-localizado" ? "nao-verificavel" : undefined}
              >
                <td>{l.chave}</td>
                <td>{l.descricao}</td>
                <td>{l.atendidoEm.join("; ") || "—"}</td>
                <td>{l.situacao === "atendido" ? "atendido" : "não localizado na minuta — conferir"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h4>Checklist de envio</h4>
        <table className="tabela">
          <tbody>
            {m.checklist.map((c, k) => (
              <tr key={k}>
                <td>{c.item}</td>
                <td>{c.detalhe}</td>
                <td>{c.origem ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const SAIDAS: {
  rotulo: string;
  nome: string;
  formato: FormatoExportacao;
  montar: typeof montarPropostaTecnica;
}[] = [
  {
    rotulo: "Proposta técnica · DOCX",
    nome: "proposta-tecnica",
    formato: "docx",
    montar: montarPropostaTecnica,
  },
  {
    rotulo: "Proposta técnica · PDF",
    nome: "proposta-tecnica",
    formato: "pdf",
    montar: montarPropostaTecnica,
  },
  {
    rotulo: "Planilha de preço · XLSX",
    nome: "planilha-de-preco",
    formato: "xlsx",
    montar: montarPlanilhaPreco,
  },
  {
    rotulo: "Matriz de atendimento e checklist de envio · XLSX",
    nome: "matriz-de-atendimento",
    formato: "xlsx",
    montar: montarMatrizEChecklist,
  },
  {
    rotulo: "Perguntas de esclarecimento · DOCX",
    nome: "perguntas-de-esclarecimento",
    formato: "docx",
    montar: montarPerguntasProposta,
  },
];

function Exportar({
  ponto,
  docs,
  habilitado,
}: {
  ponto: PontoDePartida;
  docs: DocumentoLido[];
  habilitado: boolean;
}) {
  const dossie = useDossie((s) => s.dossie);
  const [mensagem, setMensagem] = useState("");
  const [ocupado, setOcupado] = useState(false);
  async function baixar(s: (typeof SAIDAS)[number]) {
    setOcupado(true);
    setMensagem("");
    try {
      const nome = await exportar(s.montar(dossie, ponto, docs), s.formato, s.nome);
      setMensagem(`Arquivo gerado: ${nome}`);
    } catch (e) {
      setMensagem(`Não foi possível gerar o arquivo: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setOcupado(false);
    }
  }
  return (
    <div className="acoes-exportar">
      {SAIDAS.map((s) => (
        <button
          key={s.rotulo}
          className="botao"
          type="button"
          disabled={ocupado || !habilitado}
          onClick={() => void baixar(s)}
        >
          {s.rotulo}
        </button>
      ))}
      {mensagem && (
        <span aria-live="polite" className="envio__obs">
          {mensagem}
        </span>
      )}
    </div>
  );
}

function UsoNaTela({ p }: { p: PropostaDossie }) {
  return (
    <section className="bloco">
      <RotuloSecao>Uso da API nesta proposta</RotuloSecao>
      <div className="cartao cartao__corpo">
        <table className="tabela" data-testid="uso">
          <thead>
            <tr>
              <th>Passo</th>
              <th>Modelo</th>
              <th>Entrada</th>
              <th>Cache (escrita / leitura)</th>
              <th>Saída</th>
              <th>Valor estimado</th>
            </tr>
          </thead>
          <tbody>
            {p.uso.map((u, k) => (
              <tr key={k}>
                <td>{NOME_PASSO[u.passo as PassoProposta] ?? u.passo}</td>
                <td>{u.modelo}</td>
                <td>{formatarTokens(u.entrada)}</td>
                <td>
                  {formatarTokens(u.escritaCache)} / {formatarTokens(u.leituraCache)}
                </td>
                <td>{formatarTokens(u.saida)}</td>
                <td>{formatarDolar(u.custoUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
