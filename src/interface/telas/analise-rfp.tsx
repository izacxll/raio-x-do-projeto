// Etapa 1 na tela, pelo método (docs/estudos/metodo-etapa-1.md, decisões 0034 e 0035): a leitura da RFP em 8
// seções, na ordem da decisão do gerente. O PMO faz a leitura a partir do esqueleto do código e o código confere
// cada citação e número; sem a leitura do PMO, a tela mostra o esqueleto com o aviso "leitura parcial por código".
// Cada item tem o rótulo, a página e a revisão do GP (aceitar, editar, descartar). Participar é decisão só do GP.
import { useMemo, useState } from "react";
import { MODELO_PADRAO, MODELOS, type IdModelo } from "../../config/modelo";
import type { AnaliseRfpDossie, DocumentoLido, EstadoItem } from "../../dossie/esquema";
import { useDossie } from "../../dossie/store";
import { analisarRfp, type AnaliseRfp } from "../../etapas/1-rfp/analisar-rfp";
import {
  SECOES_LEITURA,
  type ItemLeitura,
  type LeituraRfp,
  type SecaoLeitura,
} from "../../etapas/1-rfp/leitura";
import {
  contarPendentesDaLeitura,
  itensRevisaveis,
  leituraDoDossie,
  NOME_TRAVA,
  pedidoLeituraRfp,
} from "../../etapas/1-rfp/leitura-pmo";
import { sugerirNomeProjeto } from "../../etapas/1-rfp/nome-do-projeto";
import { analiseInicial, estadoDoItem, incluirRequisito } from "../../etapas/1-rfp/revisao";
import { exportar, type FormatoExportacao } from "../../exportacao/exportar";
import {
  montarAnaliseRfp,
  montarChecklistHabilitacao,
  montarPerguntas,
  montarRequisitosEPrazos,
} from "../../exportacao/relatorio-rfp";
import { estimarCusto, formatarDolar } from "../../pmo/custo";
import { estimarTokens, referenciasEtapa1, textoDeSistema, textoDosDocumentos } from "../../pmo/montagem";
import { RespostaLeituraRfp } from "../../pmo/schemas/leitura-rfp";
import { NOME_PREMISSA } from "../../regras/premissas-rfp";
import { EtiquetaRotulo, NOME_ESTADO, RotuloSecao } from "../componentes/basicos";
import { ConectarClaude, useChave } from "../componentes/conectar-claude";
import { PassoPmoNaTela, UsoNaTela, useChamadaPmo } from "../componentes/passo-pmo";

const NOME_SITUACAO: Record<ItemLeitura["situacao"], string> = {
  localizado: "",
  "nao-localizado": "não localizado pelo código",
  "nao-verificavel": "não verificável",
  "nao-se-aplica": "não se aplica a esta modalidade",
  calculado: "calculado pelo código",
};

interface Props {
  /** Todos os documentos do dossiê: a análise usa a RFP e os anexos. */
  todos: DocumentoLido[];
}

export function AnaliseDaRfp({ todos }: Props) {
  const { dossie, guardarAnaliseRfp } = useDossie();
  // a análise leva até alguns décimos de segundo: só refaz quando os documentos mudam
  const analise = useMemo(() => analisarRfp(todos), [todos]);
  const salva = dossie.analiseRfp;

  if (!salva) {
    return (
      <section className="bloco">
        <RotuloSecao>Análise da RFP</RotuloSecao>
        <div className="cartao cartao__corpo">
          <p className="texto-apoio">
            O código lê a RFP no navegador e monta o esqueleto da leitura: páginas, números, datas, contas, a
            lista de documentos e os requisitos numerados (R01, R02…), que seguem até a conferência do plano.
            Nada é enviado para fora. Depois, a leitura do PMO completa o esqueleto.
          </p>
          <button
            className="botao botao--cheio"
            type="button"
            data-testid="analisar-rfp"
            onClick={() => guardarAnaliseRfp(analiseInicial(analise))}
          >
            Analisar a RFP
          </button>
        </div>
      </section>
    );
  }
  return <Analise analise={analise} salva={salva} todos={todos} atualizar={guardarAnaliseRfp} />;
}

function Analise({
  analise,
  salva,
  todos,
  atualizar,
}: {
  analise: AnaliseRfp;
  salva: AnaliseRfpDossie;
  todos: DocumentoLido[];
  atualizar: (a: AnaliseRfpDossie) => void;
}) {
  const leitura = useMemo(() => leituraDoDossie(analise, salva, todos), [analise, salva, todos]);
  const pendentes = contarPendentesDaLeitura(leitura, salva);
  const revisaveis = itensRevisaveis(leitura).length;
  const mudarEstado = (ids: string[], estado: EstadoItem, textoEditado?: string) => {
    const revisoes = { ...salva.revisoes };
    for (const id of ids) revisoes[id] = { estado, textoEditado: textoEditado ?? revisoes[id]?.textoEditado };
    atualizar({ ...salva, revisoes });
  };

  return (
    <>
      <section className="bloco">
        <RotuloSecao>Análise da RFP</RotuloSecao>
        <div className="cartao cartao__corpo">
          <p className="resumo-leitura" aria-live="polite">
            <span>{revisaveis} itens para revisar</span>·<span>{pendentes} pendentes</span>
            {pendentes > 0 ? (
              <span>· os documentos saem com o cabeçalho de minuta até todos serem revisados</span>
            ) : (
              <span>· todos revisados</span>
            )}
          </p>
          <NomeDoProjeto analise={analise} />
          <Participacao salva={salva} atualizar={atualizar} />
          <Exportar analise={analise} />
          <button
            className="botao botao--discreto"
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Recomeçar a análise? As revisões, a leitura do PMO e os requisitos incluídos por você serão perdidos.",
                )
              )
                atualizar(analiseInicial(analise));
            }}
          >
            Recomeçar a análise
          </button>
        </div>
      </section>

      {leitura.fonte === "codigo" && (
        <div className="aviso" role="note" data-testid="leitura-parcial">
          <p>
            <b>Leitura parcial por código.</b> O que está abaixo é o esqueleto que o código montou: páginas,
            números, datas, contas e o que as regras acham por padrão de texto. A leitura do PMO completa o
            esqueleto (o que pesa e por quê, trechos que se contradizem, obrigações em texto corrido) e o
            código confere cada citação e cada número dela.
          </p>
        </div>
      )}
      <LeituraDoPmoNaEtapa1
        analise={analise}
        salva={salva}
        todos={todos}
        atualizar={atualizar}
        leitura={leitura}
      />

      {SECOES_LEITURA.map((s, n) => {
        const daSecao = leitura.itens.filter((i) => i.secao === s.id);
        const requisitos = s.id === "fazer-e-entregar" ? daSecao.filter((i) => i.numero) : [];
        const cartoes = daSecao.filter((i) => !i.numero);
        const naoAchou = leitura.naoLocalizados[s.id];
        const doCodigo = leitura.doCodigo[s.id];
        if (!daSecao.length && !naoAchou?.length && s.id !== "fazer-e-entregar") return null;
        const pendentesDaSecao = daSecao.filter((i) => estadoDoItem(salva.revisoes, i.id) === "pendente");
        const corpo = (
          <>
            <p className="texto-apoio">{s.pergunta}</p>
            {pendentesDaSecao.length > 1 && s.id !== "nao-se-aplica" && (
              <button
                className="botao botao--discreto"
                type="button"
                style={{ marginBottom: 8 }}
                onClick={() =>
                  mudarEstado(
                    pendentesDaSecao.map((i) => i.id),
                    "aceito",
                  )
                }
              >
                Aceitar os {pendentesDaSecao.length} pendentes desta seção
              </button>
            )}
            {cartoes.map((i) => (
              <ItemDaLeitura
                key={i.id}
                item={i}
                salva={salva}
                mudarEstado={mudarEstado}
                atualizar={atualizar}
              />
            ))}
            {s.id === "fazer-e-entregar" && (
              <Requisitos itens={requisitos} salva={salva} atualizar={atualizar} mudarEstado={mudarEstado} />
            )}
            {naoAchou?.length ? (
              <p className="envio__obs" data-situacao="nao-localizado">
                Não localizado pelo código — conferir no documento: {naoAchou.join("; ")}.
              </p>
            ) : null}
            {doCodigo?.length ? (
              <details className="envio__obs">
                <summary>O que o código leu nesta seção e não ficou na leitura ({doCodigo.length})</summary>
                <ul>
                  {doCodigo.map((i) => (
                    <li key={i.id}>
                      <b>{i.nome}</b>: {i.texto}
                      {i.origem ? ` (p. ${i.origem.pagina})` : ""}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </>
        );
        return (
          <section className="bloco" key={s.id} data-secao={s.id}>
            <RotuloSecao>
              {n + 1}. {s.titulo}
            </RotuloSecao>
            {s.id === "nao-se-aplica" ? (
              <details>
                <summary className="envio__obs">Mostrar ({daSecao.length})</summary>
                {corpo}
              </details>
            ) : (
              corpo
            )}
          </section>
        );
      })}

      <section className="bloco">
        <RotuloSecao>Fora da leitura e o que o código não pôde conferir</RotuloSecao>
        <div className="cartao cartao__corpo">
          <p className="texto-apoio">
            Pelo método, fica fora o que não muda uma decisão do gerente nem algo que a FGV terá de fazer,
            entregar, cumprir ou pagar. Não achado não é ausente: "não localizado pelo código" quer dizer que
            o código não achou, não que o documento não traga.
          </p>
          {leitura.foraDaLeitura.length > 0 && (
            <ul className="envio__obs" data-testid="fora-da-leitura">
              {leitura.foraDaLeitura.map((f) => (
                <li key={f.motivo}>
                  {f.motivo}: {f.quantos}
                </li>
              ))}
            </ul>
          )}
          {leitura.ilegiveis.length > 0 && (
            <p className="envio__obs" data-situacao="nao-verificavel">
              Páginas sem texto legível (o que estiver nelas não foi lido): {leitura.ilegiveis.join("; ")}.
            </p>
          )}
          <details>
            <summary className="envio__obs">Regras de brecha do código e o resultado de cada uma</summary>
            <table className="tabela">
              <thead>
                <tr>
                  <th>Regra</th>
                  <th>O que procura</th>
                  <th>Resultado</th>
                  <th>Detalhe</th>
                </tr>
              </thead>
              <tbody>
                {analise.regras.map((r) => (
                  <tr
                    key={r.regra}
                    data-origem={r.estado === "nao-verificavel" ? "nao-verificavel" : undefined}
                  >
                    <td>{r.regra}</td>
                    <td>{r.nome}</td>
                    <td>
                      {r.estado === "achado"
                        ? "achado"
                        : r.estado === "nao-verificavel"
                          ? "não verificável"
                          : "não identificado"}
                    </td>
                    <td>{r.motivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>
      </section>
    </>
  );
}

/** A leitura do PMO (decisão 0035): custo antes, aviso de envio, uso depois; na demonstração, a resposta gravada. */
function LeituraDoPmoNaEtapa1({
  salva,
  todos,
  atualizar,
  leitura,
}: {
  analise: AnaliseRfp;
  salva: AnaliseRfpDossie;
  todos: DocumentoLido[];
  atualizar: (a: AnaliseRfpDossie) => void;
  leitura: LeituraRfp;
}) {
  const demonstracao = Boolean(useDossie((s) => s.dossie.demonstracao));
  const chave = useChave();
  const modelo = salva.modeloPmo ?? MODELO_PADRAO;
  const { rodando, erro, chamar, cancelar } = useChamadaPmo();
  const sistema = useMemo(() => textoDeSistema(referenciasEtapa1()), []);
  const docs = useMemo(() => todos.filter((d) => d.papel === "rfp" || d.papel === "anexo-rfp"), [todos]);
  const textoDocs = useMemo(() => textoDosDocumentos(docs), [docs]);
  // o pedido parte do esqueleto (sem a leitura anterior do PMO)
  const esqueleto = leitura.fonte === "codigo" ? leitura : undefined;
  const pedido = useMemo(() => (esqueleto ? pedidoLeituraRfp(esqueleto) : null), [esqueleto]);
  const uso = salva.usoPmo ?? [];
  const travados = leitura.itens.filter((i) => i.trava).length;

  async function pedir() {
    const base = pedido ?? pedidoLeituraRfp(leituraSemPmo(leitura));
    const r = await chamar({
      etapa: 1,
      passo: "leitura-rfp",
      gravacao: "leitura-pmo",
      schema: RespostaLeituraRfp,
      demonstracao,
      chave,
      modelo,
      sistema,
      documentos: textoDocs,
      pedido: base,
    });
    if (!r) return;
    atualizar({
      ...salva,
      leituraPmo: { resposta: r.resposta, modelo: r.modelo, em: r.em },
      usoPmo: r.uso ? [...uso, r.uso] : uso,
    });
  }

  return (
    <>
      {!demonstracao && (
        <section className="bloco">
          <RotuloSecao>Conexão com o PMO</RotuloSecao>
          <ConectarClaude modelo={modelo as IdModelo} />
          <div className="cartao cartao__corpo acoes-exportar" style={{ marginTop: 8 }}>
            <label>
              <span className="lb">Modelo</span>{" "}
              <select
                aria-label="Modelo"
                value={modelo}
                onChange={(e) => atualizar({ ...salva, modeloPmo: e.target.value })}
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
      )}
      <PassoPmoNaTela
        passo="leitura-rfp"
        titulo="Leitura da RFP"
        pedido={pedido ?? "refazer"}
        semPedido=""
        feito={salva.leituraPmo ? { modelo: salva.leituraPmo.modelo, em: salva.leituraPmo.em } : undefined}
        demonstracao={demonstracao}
        chave={chave}
        estimativa={
          pedido
            ? estimarCusto(
                modelo,
                "leitura-rfp",
                estimarTokens(sistema) + estimarTokens(textoDocs),
                estimarTokens(pedido),
              )
            : undefined
        }
        rodando={rodando}
        erro={erro}
        aoPedir={() => void pedir()}
        aoCancelar={cancelar}
        envio="O texto da RFP e dos anexos vai para a API do Claude, pela sua chave, na organização da FGV, junto com o esqueleto do código. Sem a leitura, a tela fica com o esqueleto."
      >
        {salva.leituraPmo && (
          <p className="envio__obs" data-testid="leitura-pmo-rfp">
            Tudo o que veio do PMO é sugestão, com a etiqueta "leitura do PMO". O código conferiu cada citação
            na página e cada número no trecho citado ou no esqueleto
            {travados
              ? `: ${travados} ${travados === 1 ? "item ficou" : "itens ficaram"} com aviso.`
              : "; nenhum aviso."}
          </p>
        )}
      </PassoPmoNaTela>
      {!demonstracao && <UsoNaTela uso={uso} titulo="Uso da API na leitura da RFP" />}
    </>
  );
}

/** Para pedir de novo, o esqueleto: os itens do PMO saem e os recolhidos voltam. */
function leituraSemPmo(l: LeituraRfp): LeituraRfp {
  const recolhidos = Object.values(l.doCodigo).flat();
  return { ...l, itens: [...l.itens.filter((i) => !i.doPmo), ...recolhidos], doCodigo: {}, fonte: "codigo" };
}

/**
 * Nome do projeto sugerido pela RFP (instrumento e objeto), como sugestão editável. Só vira o nome do projeto
 * quando o GP clica; até lá, os documentos exportados usam a sugestão com o aviso "a confirmar pelo GP".
 */
function NomeDoProjeto({ analise }: { analise: AnaliseRfp }) {
  const { dossie, definirNomeProjeto } = useDossie();
  const sugestao = useMemo(() => sugerirNomeProjeto(analise), [analise]);
  const [texto, setTexto] = useState(sugestao?.nome ?? "");
  if (!sugestao) return null;
  const atual = dossie.projeto.nome.trim();
  return (
    <div className="decisao" style={{ margin: "12px 0" }} data-testid="nome-sugerido">
      <EtiquetaRotulo rotulo="sugestao" />
      <label>
        <span className="lb">Nome do projeto sugerido (instrumento e objeto da RFP)</span>{" "}
        <input
          aria-label="Nome do projeto sugerido"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          style={{ minWidth: "min(100%, 520px)" }}
        />
      </label>
      <button
        className="botao"
        type="button"
        disabled={!texto.trim() || texto.trim() === atual}
        onClick={() => definirNomeProjeto(texto.trim())}
      >
        Usar como nome do projeto
      </button>
      <span className="texto-apoio">
        {atual
          ? `Nome atual: ${atual}.`
          : 'Sem nome dado pelo GP: os documentos saem com esta sugestão e o aviso "a confirmar pelo GP".'}
      </span>
    </div>
  );
}

function Participacao({
  salva,
  atualizar,
}: {
  salva: AnaliseRfpDossie;
  atualizar: (a: AnaliseRfpDossie) => void;
}) {
  const p = salva.participacao;
  return (
    <div className="decisao" style={{ margin: "12px 0" }}>
      <EtiquetaRotulo rotulo="decisao-gp" />
      <label>
        <span className="lb">Participar da disputa?</span>{" "}
        <select
          aria-label="Participar da disputa?"
          value={p.decisao}
          onChange={(e) =>
            atualizar({ ...salva, participacao: { ...p, decisao: e.target.value as typeof p.decisao } })
          }
        >
          <option value="a-decidir">a decidir</option>
          <option value="participar">participar</option>
          <option value="nao-participar">não participar</option>
        </select>
      </label>
      <input
        aria-label="Justificativa da decisão"
        placeholder="Justificativa (registrada no relatório)"
        value={p.justificativa ?? ""}
        onChange={(e) => atualizar({ ...salva, participacao: { ...p, justificativa: e.target.value } })}
      />
    </div>
  );
}

function SeletorRevisao({
  item,
  salva,
  mudarEstado,
}: {
  item: ItemLeitura;
  salva: AnaliseRfpDossie;
  mudarEstado: (ids: string[], estado: EstadoItem, textoEditado?: string) => void;
}) {
  const estado = estadoDoItem(salva.revisoes, item.id);
  const editado = salva.revisoes[item.id]?.textoEditado;
  const textoBase = item.pergunta ?? item.texto;
  return (
    <div className="decisao">
      <span className="lb">Revisão do GP</span>
      <select
        aria-label={`Revisão de ${item.nome}`}
        value={estado}
        onChange={(e) => mudarEstado([item.id], e.target.value as EstadoItem, editado ?? textoBase)}
      >
        {(["pendente", "aceito", "editado", "descartado"] as const).map((s) => (
          <option key={s} value={s}>
            {NOME_ESTADO[s].toLowerCase()}
          </option>
        ))}
      </select>
      {estado === "editado" && (
        <textarea
          aria-label={`Texto editado de ${item.nome}`}
          rows={2}
          style={{ flex: 1, minWidth: 260 }}
          value={editado ?? textoBase}
          onChange={(e) => mudarEstado([item.id], "editado", e.target.value)}
        />
      )}
    </div>
  );
}

function ItemDaLeitura({
  item,
  salva,
  mudarEstado,
  atualizar,
}: {
  item: ItemLeitura;
  salva: AnaliseRfpDossie;
  mudarEstado: (ids: string[], estado: EstadoItem, textoEditado?: string) => void;
  atualizar: (a: AnaliseRfpDossie) => void;
}) {
  // o PMO não cria número R (decisões 0032 e 0035): a obrigação que ele leu vira requisito só se o GP incluir
  const podeVirarRequisito =
    item.doPmo && item.secao === "fazer-e-entregar" && !jaEhRequisito(item, salva.requisitos);
  const estado = estadoDoItem(salva.revisoes, item.id);
  const editado = salva.revisoes[item.id]?.textoEditado;
  const comPergunta = Boolean(item.pergunta);
  return (
    <article
      className="cartao cartao--borda bloco item-rfp"
      data-estado={estado}
      data-situacao={item.situacao}
      data-trava={item.trava}
      data-testid={`item-${item.id}`}
    >
      <div className="cartao__corpo">
        <div className="achado__cabeca">
          <EtiquetaRotulo
            rotulo={item.rotulo}
            pagina={item.rotulo === "documento" ? item.origem?.pagina : undefined}
          />
          {item.doPmo && <span className="lb">leitura do PMO</span>}
          {item.rotulo !== "documento" && item.origem && <span className="lb">p. {item.origem.pagina}</span>}
          {item.premissa && (
            <span className="lb" title={NOME_PREMISSA[item.premissa]}>
              {item.premissa}
            </span>
          )}
          {item.situacao !== "localizado" && <span className="lb">{NOME_SITUACAO[item.situacao]}</span>}
          {item.trava && <span className="lb aviso-item">{NOME_TRAVA[item.trava]}</span>}
        </div>
        <h3 className="achado__titulo">{item.nome}</h3>
        <p>{estado === "editado" && editado && !comPergunta ? editado : item.texto}</p>
        {item.porquePesa && (
          <p className="envio__obs">
            <b>Por que pesa:</b> {item.porquePesa}
          </p>
        )}
        {comPergunta && (
          <p>
            <EtiquetaRotulo rotulo="sugestao" /> <b>Pergunta sugerida:</b>{" "}
            {estado === "editado" && editado ? editado : item.pergunta}
          </p>
        )}
        {item.tabela && (
          <details>
            <summary className="envio__obs">Detalhe ({item.tabela.linhas.length} linhas)</summary>
            <table className="tabela tabela--livre">
              <thead>
                <tr>
                  {item.tabela.colunas.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {item.tabela.linhas.map((l, k) => (
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
        {item.origem?.trecho && (
          <details>
            <summary className="envio__obs">
              Trecho do documento ({item.origem.documento}, p. {item.origem.pagina})
            </summary>
            <p className="envio__obs">“{item.origem.trecho}”</p>
          </details>
        )}
        {item.nota && <p className="envio__obs">{item.nota}</p>}
        <SeletorRevisao item={item} salva={salva} mudarEstado={mudarEstado} />
        {podeVirarRequisito && (
          <button
            className="botao botao--discreto"
            type="button"
            data-testid={`virar-requisito-${item.id}`}
            onClick={() => atualizar(incluirRequisito(salva, item.nome, item.texto))}
          >
            Incluir como requisito R{String(salva.proximoRequisito).padStart(2, "0")} (decisão do GP)
          </button>
        )}
      </div>
    </article>
  );
}

/**
 * O item do PMO já é um requisito da lista: ele cita o número, o nome bate com o rótulo ("Produto 2") ou o texto
 * já foi incluído pelo GP. Nesses casos, o botão de incluir não aparece (o mesmo requisito com dois números).
 */
function jaEhRequisito(item: ItemLeitura, requisitos: AnaliseRfpDossie["requisitos"]): boolean {
  const nome = item.nome.toLowerCase();
  return requisitos.some((r) => {
    const rotulo = r.rotulo.trim().toLowerCase();
    const produto = /^produto \d+$/.test(rotulo) && (nome === rotulo || nome.startsWith(`${rotulo} `));
    return Boolean(item.nota?.includes(r.numero)) || r.descricao === item.texto || produto;
  });
}

/** Os requisitos numerados, numa tabela: o número fixo segue até a conferência do plano. */
function Requisitos({
  itens,
  salva,
  atualizar,
  mudarEstado,
}: {
  itens: ItemLeitura[];
  salva: AnaliseRfpDossie;
  atualizar: (a: AnaliseRfpDossie) => void;
  mudarEstado: (ids: string[], estado: EstadoItem, textoEditado?: string) => void;
}) {
  return (
    <div className="cartao cartao__corpo" data-testid="requisitos-numerados">
      <p className="texto-apoio">
        <b>Requisitos numerados.</b> Cada R é uma entrega ou obrigação de quem executa e acompanha o projeto
        até a conferência do plano. Corrija e complete a lista; número descartado não é reaproveitado.
      </p>
      <table className="tabela tabela--livre">
        <thead>
          <tr>
            <th>Nº</th>
            <th>Requisito</th>
            <th>Página</th>
            <th>Revisão do GP</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((i) => {
            const estado = estadoDoItem(salva.revisoes, i.id);
            const editado = salva.revisoes[i.id]?.textoEditado;
            return (
              <tr key={i.id} data-testid={`item-${i.id}`} data-estado={estado}>
                <td>{i.numero}</td>
                <td>
                  <b>{i.nome.replace(/^R\d+ · /, "")}</b>:{" "}
                  {estado === "editado" && editado ? editado : i.texto}
                  {i.nota && <div className="envio__obs">{i.nota}</div>}
                </td>
                <td>{i.origem ? i.origem.pagina : "incluído pelo GP"}</td>
                <td>
                  <SeletorRevisao item={i} salva={salva} mudarEstado={mudarEstado} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <IncluirRequisito salva={salva} atualizar={atualizar} />
    </div>
  );
}

function IncluirRequisito({
  salva,
  atualizar,
}: {
  salva: AnaliseRfpDossie;
  atualizar: (a: AnaliseRfpDossie) => void;
}) {
  const [rotulo, setRotulo] = useState("");
  const [descricao, setDescricao] = useState("");
  return (
    <div className="acoes-exportar" style={{ marginTop: 8 }}>
      <input
        value={rotulo}
        onChange={(e) => setRotulo(e.target.value)}
        placeholder="Rótulo (ex.: Obrigação de relatório)"
        aria-label="Rótulo do requisito novo"
      />
      <input
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Descrição como está na RFP, com a página"
        aria-label="Descrição do requisito novo"
        style={{ flex: 1, minWidth: 240 }}
      />
      <button
        className="botao"
        type="button"
        disabled={!descricao.trim()}
        onClick={() => {
          atualizar(incluirRequisito(salva, rotulo, descricao));
          setRotulo("");
          setDescricao("");
        }}
      >
        Incluir requisito R{String(salva.proximoRequisito).padStart(2, "0")}
      </button>
    </div>
  );
}

const SAIDAS: {
  rotulo: string;
  nome: string;
  formato: FormatoExportacao;
  montar: typeof montarAnaliseRfp;
}[] = [
  { rotulo: "Análise da RFP · DOCX", nome: "analise-da-rfp", formato: "docx", montar: montarAnaliseRfp },
  { rotulo: "Análise da RFP · PDF", nome: "analise-da-rfp", formato: "pdf", montar: montarAnaliseRfp },
  {
    rotulo: "Requisitos e prazos · XLSX",
    nome: "requisitos-e-prazos",
    formato: "xlsx",
    montar: montarRequisitosEPrazos,
  },
  {
    rotulo: "Checklist de habilitação · XLSX",
    nome: "checklist-de-habilitacao",
    formato: "xlsx",
    montar: montarChecklistHabilitacao,
  },
  {
    rotulo: "Perguntas de esclarecimento · DOCX",
    nome: "perguntas-de-esclarecimento",
    formato: "docx",
    montar: montarPerguntas,
  },
];

function Exportar({ analise }: { analise: AnaliseRfp }) {
  const dossie = useDossie((s) => s.dossie);
  const [mensagem, setMensagem] = useState("");
  const [ocupado, setOcupado] = useState(false);
  async function baixar(s: (typeof SAIDAS)[number]) {
    setOcupado(true);
    setMensagem("");
    try {
      const nome = await exportar(s.montar(dossie, analise), s.formato, s.nome);
      setMensagem(`Arquivo gerado: ${nome}`);
    } catch (e) {
      setMensagem(`Não foi possível gerar o arquivo: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setOcupado(false);
    }
  }
  return (
    <div className="acoes-exportar" style={{ margin: "12px 0" }}>
      {SAIDAS.map((s) => (
        <button
          key={s.rotulo}
          className="botao"
          type="button"
          disabled={ocupado}
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

export type { SecaoLeitura };
