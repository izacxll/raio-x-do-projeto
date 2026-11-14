// Etapa 4 na tela: os documentos usados (TAP e proposta), as premissas críticas, os seis passos do PMO na ordem da
// decisão 0007 (com a adaptação decidida pelo GP), as contas do código (rastreabilidade, cronograma, marcos, custos),
// os valores e nomes que só o GP preenche, a autoconferência pelas regras da etapa 5 e as saídas.
import { useMemo, useState } from "react";
import { MODELOS, type IdModelo } from "../../config/modelo";
import type { Caracteristicas } from "../../dominio/caracteristicas";
import { PARTES_PGP, PREMISSAS_CRITICAS } from "../../dominio/skill";
import type { ParametrosPgp, PgpDossie } from "../../dossie/esquema";
import { useDossie } from "../../dossie/store";
import {
  autoconferir,
  caracteristicasDoPgp,
  separarDecisoesPendentes,
} from "../../etapas/4-pgp/autoconferencia";
import {
  cronogramaDoPgp,
  custosDoPgp,
  marcosDoPgp,
  rastrear,
  textoDaData,
} from "../../etapas/4-pgp/calculos";
import { montarEntradaPgp, NOME_TAP_DO_DOSSIE, type EntradaPgp } from "../../etapas/4-pgp/entrada";
import { PEDIDOS_PGP } from "../../etapas/4-pgp/pedidos";
import { PASSOS_PGP } from "../../etapas/4-pgp/passos";
import {
  contarPendentesPgp,
  gerarSugerido,
  itensDoPgp,
  nomeDaParte,
  partesAGerar,
  passoAnterior,
  pgpInicial,
} from "../../etapas/4-pgp/pgp";
import { exportar, exportarPacotePgp, exportarTexto } from "../../exportacao/exportar";
import { montarPgp, montarRegistrosPgp } from "../../exportacao/relatorio-pgp";
import { estimarCusto, formatarDolar } from "../../pmo/custo";
import { estimarTokens, referenciasEtapa4, textoDeSistema, textoDosDocumentos } from "../../pmo/montagem";
import { SCHEMAS_PGP, type PassoPgp } from "../../pmo/schemas/pgp";
import type { ResultadoConferencia } from "../../regras/conferencia";
import { resumirAchados } from "../../regras/conferencia";
import { EtiquetaRotulo, RotuloSecao } from "../componentes/basicos";
import { ConectarClaude, useChave } from "../componentes/conectar-claude";
import { ItensPmo } from "../componentes/item-pmo";
import { PassoPmoNaTela, UsoNaTela, useChamadaPmo } from "../componentes/passo-pmo";
import { OPCOES, rotuloValor } from "./conferencia";

const reais = (v?: number) =>
  v === undefined ? "a definir pelo GP" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const numero = (s: string): number | undefined => {
  const v = Number(s.replace(/\./g, "").replace(",", "."));
  return s.trim() === "" || !Number.isFinite(v) ? undefined : v;
};
const NOME_RECOMENDACAO = { essencial: "essencial", recomendado: "recomendado", dispensavel: "dispensável" };

function CampoValor({
  rotulo,
  valor,
  aoMudar,
}: {
  rotulo: string;
  valor: number | undefined;
  aoMudar: (v: number | undefined) => void;
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
    </label>
  );
}

export function PlanoDeGerenciamento() {
  const { dossie, guardarPgp } = useDossie();
  const p = dossie.pgp ?? pgpInicial(dossie.tap?.modelo ?? dossie.proposta?.modelo);
  const demonstracao = Boolean(dossie.demonstracao);
  const chave = useChave();
  const entrada = useMemo(() => montarEntradaPgp(dossie), [dossie]);
  const sistema = useMemo(() => textoDeSistema(referenciasEtapa4()), []);
  const textoDocs = useMemo(() => textoDosDocumentos(entrada.documentos), [entrada]);
  const itens = useMemo(() => itensDoPgp(p, entrada.documentos), [p, entrada]);
  const premissas = p.premissasAplicaveis ?? entrada.premissasAnteriores;
  const { rodando, erro, chamar, cancelar } = useChamadaPmo();

  const atualizar = (np: PgpDossie) => guardarPgp(np);
  const mudarPar = (m: Partial<ParametrosPgp>) => atualizar({ ...p, parametros: { ...p.parametros, ...m } });

  function pedidoDo(passo: PassoPgp): string | null {
    if (entrada.fonteTap === "nenhuma") return null;
    const anterior = passoAnterior(passo);
    if (anterior && !p[anterior]) return null;
    return PEDIDOS_PGP[passo](entrada, p);
  }

  async function executar(passo: PassoPgp) {
    const pedido = pedidoDo(passo);
    if (!pedido) return;
    const r = await chamar({
      etapa: 4,
      passo,
      schema: SCHEMAS_PGP[passo],
      demonstracao,
      chave,
      modelo: p.modelo,
      sistema,
      documentos: textoDocs,
      pedido,
    });
    if (!r) return;
    const atual = useDossie.getState().dossie.pgp ?? p;
    const guardada = { resposta: r.resposta, modelo: r.modelo, em: r.em };
    const novo = { ...atual, [passo]: guardada, uso: r.uso ? [...atual.uso, r.uso] : atual.uso } as PgpDossie;
    // a adaptação traz a sugestão do que gerar e da abordagem: o GP muda na tabela
    if (passo === "adaptacao" && novo.adaptacao) {
      novo.gerar = gerarSugerido(novo.adaptacao.resposta);
      novo.abordagem = novo.adaptacao.resposta.abordagem;
    }
    atualizar(novo);
  }

  const tokensFixos = estimarTokens(sistema) + estimarTokens(textoDocs);
  const pendentes = contarPendentesPgp(p, itens);
  const totalUso = p.uso.reduce((s, u) => s + (u.custoUsd ?? 0), 0);
  const itensDoPasso = (passo: PassoPgp) => itens.filter((i) => i.passo === passo);

  return (
    <>
      <section className="bloco">
        <RotuloSecao>Conexão com o PMO</RotuloSecao>
        {demonstracao ? (
          <div className="cartao cartao__corpo">
            <p className="texto-apoio">
              Demonstração: a chave não é usada e nada é enviado à API. Cada passo do PMO carrega a resposta
              gravada para esta RFP; a adaptação, as contas, a autoconferência e as decisões do GP são as de
              verdade.
            </p>
          </div>
        ) : (
          <>
            <ConectarClaude modelo={p.modelo as IdModelo} />
            <div className="cartao cartao__corpo acoes-exportar" style={{ marginTop: 8 }}>
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
                Gasto deste plano até agora: {formatarDolar(totalUso)} em {p.uso.length}{" "}
                {p.uso.length === 1 ? "chamada" : "chamadas"}.
              </span>
            </div>
          </>
        )}
      </section>

      <section className="bloco">
        <RotuloSecao>Documentos usados</RotuloSecao>
        <div className="cartao cartao__corpo">
          <p className="texto-apoio" data-testid="fonte-tap">
            TAP:{" "}
            {entrada.fonteTap === "pdf"
              ? `PDF aprovado (${entrada.tap?.nomeArquivo}).`
              : entrada.fonteTap === "dossie"
                ? `${NOME_TAP_DO_DOSSIE}. Se o TAP foi aprovado com mudanças fora da ferramenta, envie o PDF acima: ele passa a valer.`
                : "nenhum. Envie o PDF do TAP aprovado acima, ou faça a etapa 3 neste dossiê."}{" "}
            Proposta:{" "}
            {entrada.fonteProposta === "nenhuma"
              ? "nenhuma (opcional)."
              : entrada.fonteProposta === "pdf"
                ? "PDF."
                : "da etapa 2 (dossiê)."}
          </p>
        </div>
      </section>

      <section className="bloco">
        <RotuloSecao>Premissas críticas (decisão do GP)</RotuloSecao>
        <div className="cartao cartao__corpo">
          <p className="envio__obs">
            Cada uma que se aplica vai para o registro de premissas, para o registro de riscos com resposta e
            gatilho e para o plano de mudanças; o plano de riscos diz como elas são tratadas.
          </p>
          <div className="acoes-exportar">
            {PREMISSAS_CRITICAS.map((pc) => (
              <label key={pc.codigo} title={pc.titulo}>
                <input
                  type="checkbox"
                  checked={Boolean(premissas[pc.codigo])}
                  onChange={(ev) =>
                    atualizar({ ...p, premissasAplicaveis: { ...premissas, [pc.codigo]: ev.target.checked } })
                  }
                />{" "}
                <b>{pc.codigo}</b> {pc.titulo}
              </label>
            ))}
          </div>
        </div>
      </section>

      {PASSOS_PGP.map(({ passo, nome }) => {
        const pedido = pedidoDo(passo);
        const anterior = passoAnterior(passo);
        return (
          <PassoPmoNaTela
            key={passo}
            passo={passo}
            titulo={nome}
            pedido={pedido}
            semPedido={
              entrada.fonteTap === "nenhuma"
                ? "Antes, envie o TAP aprovado (PDF) ou faça a etapa 3 neste dossiê."
                : `Antes, peça o passo anterior (${PASSOS_PGP.find((x) => x.passo === anterior)?.nome ?? ""}).`
            }
            feito={p[passo] ? { modelo: p[passo]!.modelo, em: p[passo]!.em } : undefined}
            demonstracao={demonstracao}
            chave={chave}
            estimativa={
              pedido ? estimarCusto(p.modelo, passo, tokensFixos, estimarTokens(pedido)) : undefined
            }
            rodando={rodando}
            erro={erro}
            aoPedir={() => void executar(passo)}
            aoCancelar={cancelar}
            envio="O texto dos PDFs da RFP, do TAP e da proposta vai para a API do Claude, pela sua chave, na organização da FGV."
          >
            {passo === "adaptacao" && p.adaptacao && <Adaptacao p={p} atualizar={atualizar} />}
            {p[passo] && (
              <ItensPmo
                itens={itensDoPasso(passo)}
                revisoes={p.revisoes}
                aoMudar={(revisoes) => atualizar({ ...p, revisoes })}
              />
            )}
            {passo === "escopo" && p.escopo && <Escopo p={p} e={entrada} />}
            {passo === "cronograma" && p.cronograma && <Cronograma p={p} e={entrada} mudarPar={mudarPar} />}
            {passo === "riscos" && p.cronograma && p.riscos && (
              <Custos p={p} e={entrada} mudarPar={mudarPar} />
            )}
            {passo === "execucao" && p.execucao && <Indicadores p={p} />}
          </PassoPmoNaTela>
        );
      })}

      {p.adaptacao && <Autoconferencia p={p} e={entrada} atualizar={atualizar} />}

      <section className="bloco">
        <RotuloSecao>Exportar</RotuloSecao>
        <div className="cartao cartao__corpo">
          <p className="resumo-leitura" aria-live="polite">
            <span>{partesAGerar(p).length} partes marcadas para gerar</span>·
            <span>{itens.length} itens do PMO</span>·<span>{pendentes} pendências do GP</span>
            <span>
              {pendentes > 0
                ? "· os documentos saem com o cabeçalho de minuta até tudo ser revisado"
                : "· tudo revisado"}
            </span>
          </p>
          <Exportar habilitado={Boolean(p.adaptacao)} />
        </div>
      </section>

      <UsoNaTela uso={p.uso} titulo="Uso da API neste plano" />
    </>
  );
}

function Adaptacao({ p, atualizar }: { p: PgpDossie; atualizar: (np: PgpDossie) => void }) {
  const a = p.adaptacao!.resposta;
  const porCodigo = new Map(a.partes.map((x) => [x.codigo, x]));
  return (
    <div className="cartao cartao__corpo bloco" data-testid="adaptacao">
      <div className="achado__cabeca">
        <EtiquetaRotulo rotulo="decisao-gp" />
        <h3 className="subtitulo-grupo" style={{ margin: 0 }}>
          O que gerar: o GP marca
        </h3>
      </div>
      <p className="envio__obs">
        A sugestão do PMO vem ao lado. O que você dispensar fica registrado e não é apontado como ausente na
        conferência do plano.
      </p>
      <label className="campo-numero">
        <span className="lb">Abordagem (decisão do GP)</span>
        <select
          aria-label="Abordagem"
          value={p.abordagem ?? a.abordagem}
          onChange={(e) => atualizar({ ...p, abordagem: e.target.value as PgpDossie["abordagem"] })}
        >
          <option value="preditiva">preditiva</option>
          <option value="adaptativa">adaptativa</option>
          <option value="hibrida">híbrida</option>
        </select>
      </label>
      <div className="mapa" style={{ marginTop: 8 }}>
        <table className="tabela tabela--texto">
          <thead>
            <tr>
              <th>Gerar</th>
              <th>Parte</th>
              <th>Sugestão do PMO</th>
              <th>Justificativa</th>
            </tr>
          </thead>
          <tbody>
            {PARTES_PGP.map((f) => {
              const s = porCodigo.get(f.codigo);
              return (
                <tr key={f.codigo}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Gerar ${f.codigo}`}
                      checked={Boolean(p.gerar[f.codigo])}
                      onChange={(e) =>
                        atualizar({ ...p, gerar: { ...p.gerar, [f.codigo]: e.target.checked } })
                      }
                    />
                  </td>
                  <td>
                    {f.codigo} {f.nome}
                  </td>
                  <td>{s ? NOME_RECOMENDACAO[s.recomendacao] : "—"}</td>
                  <td>{s?.justificativa ?? "sem sugestão do PMO"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <h4>Fases (sugestão do PMO)</h4>
      <table className="tabela tabela--texto">
        <tbody>
          {a.fases.map((f) => (
            <tr key={f.nome}>
              <td>{f.nome}</td>
              <td>{f.entregas.join(", ")}</td>
              <td>{f.criterioDeSaida}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Escopo({ p, e }: { p: PgpDossie; e: EntradaPgp }) {
  const linhas = rastrear(p, e);
  return (
    <div className="cartao cartao__corpo bloco">
      <h3 className="subtitulo-grupo">EAP e dicionário (sugestão do PMO)</h3>
      <table className="tabela tabela--texto">
        <thead>
          <tr>
            <th>Pacote</th>
            <th>Produto</th>
            <th>Requisitos</th>
            <th>Critério de aceite</th>
          </tr>
        </thead>
        <tbody>
          {p.escopo!.resposta.eap.map((x) => (
            <tr key={x.id}>
              <td>
                {x.id} {x.nome}
              </td>
              <td>{x.produto}</td>
              <td>{x.requisitos.join(", ")}</td>
              <td>{x.criterioDeAceite}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="subtitulo-grupo">Matriz de rastreabilidade RFP → TAP → plano (código)</h3>
      <table className="tabela tabela--texto" data-testid="rastreabilidade">
        <thead>
          <tr>
            <th>Requisito</th>
            <th>No TAP</th>
            <th>Na EAP</th>
            <th>No cronograma</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.requisito} data-origem={l.situacao !== "rastreado" ? "nao-verificavel" : undefined}>
              <td title={l.descricao}>{l.requisito}</td>
              <td>{l.tap.length ? `${l.tap.length} item(ns)` : "—"}</td>
              <td>{l.eap.join("; ") || "não localizado na EAP"}</td>
              <td>{l.atividades.length ? `${l.atividades.length} atividade(s)` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Cronograma({
  p,
  e,
  mudarPar,
}: {
  p: PgpDossie;
  e: EntradaPgp;
  mudarPar: (m: Partial<ParametrosPgp>) => void;
}) {
  const crono = cronogramaDoPgp(p, e)!;
  const marcos = marcosDoPgp(p, e, crono);
  const c = p.cronograma!.resposta;
  return (
    <div className="cartao cartao__corpo bloco">
      <h3 className="subtitulo-grupo">Cronograma, marcos e equipe (código, com as decisões do GP)</h3>
      <div className="acoes-exportar">
        <label className="campo-numero">
          <span className="lb">Início previsto (decisão do GP)</span>
          <input
            type="date"
            aria-label="Início previsto"
            value={p.parametros.inicio ?? ""}
            onChange={(ev) => mudarPar({ inicio: ev.target.value || undefined })}
          />
        </label>
        <CampoValor
          rotulo="Aprovação de cada produto (dias úteis, decisão do GP)"
          valor={p.parametros.aprovacaoDias}
          aoMudar={(v) => mudarPar({ aprovacaoDias: v })}
        />
      </div>
      <div
        className={`aviso aviso--coluna${crono.conferenciaPrazo.situacao === "nao-cabe" ? " aviso--erro" : ""}`}
      >
        <p>
          <b>Total: {crono.total} dias úteis</b>
          {crono.dataFim ? `, até ${textoDaData(crono.dataFim)}` : ""}. Caminho crítico:{" "}
          {crono.caminhoCritico.join(" → ")}. {crono.conferenciaPrazo.texto}
        </p>
        {crono.problemas.map((x) => (
          <p key={x}>{x}</p>
        ))}
      </div>
      <table className="tabela tabela--texto" data-testid="marcos">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Entrega</th>
            <th>Aprovação</th>
            <th>Conferência com o TAP</th>
          </tr>
        </thead>
        <tbody>
          {marcos.map((m) => (
            <tr key={m.produto} data-origem={m.situacao === "nao-cabe" ? "nao-verificavel" : undefined}>
              <td>{m.produto}</td>
              <td>{m.dataEntrega ? textoDaData(m.dataEntrega) : `dia útil ${m.entrega}`}</td>
              <td>{m.dataAprovacao ? textoDaData(m.dataAprovacao) : `dia útil ${m.aprovacao}`}</td>
              <td>
                {m.situacao === "cabe" ? "cabe. " : m.situacao === "nao-cabe" ? "não cabe. " : ""}
                {m.texto}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4>Designações da equipe (nomes: decisão do GP)</h4>
      <table className="tabela tabela--texto">
        <tbody>
          {c.perfis.map((x) => (
            <tr key={x.id}>
              <td>{x.nome}</td>
              <td>{x.exigido ? `exigido${x.requisito ? ` (${x.requisito})` : ""}` : "sugerido"}</td>
              <td>
                <input
                  aria-label={`Nome de ${x.nome}`}
                  placeholder="a definir pelo GP"
                  value={p.parametros.nomes[x.id] ?? ""}
                  onChange={(ev) => mudarPar({ nomes: { ...p.parametros.nomes, [x.id]: ev.target.value } })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Custos({
  p,
  e,
  mudarPar,
}: {
  p: PgpDossie;
  e: EntradaPgp;
  mudarPar: (m: Partial<ParametrosPgp>) => void;
}) {
  const c = custosDoPgp(p, e)!;
  return (
    <div className="cartao cartao__corpo bloco" data-testid="custos">
      <h3 className="subtitulo-grupo">Custos (código, com os valores do GP)</h3>
      <table className="tabela tabela--texto">
        <thead>
          <tr>
            <th>Perfil</th>
            <th>Horas (PERT)</th>
            <th>Valor-hora (GP)</th>
            <th>Custo</th>
          </tr>
        </thead>
        <tbody>
          {c.preco.linhas.map((l) => (
            <tr key={l.perfil.id}>
              <td>{l.perfil.nome}</td>
              <td>{l.horas}</td>
              <td>
                <CampoValor
                  rotulo={`Valor-hora de ${l.perfil.nome}`}
                  valor={l.valorHora}
                  aoMudar={(v) => {
                    const valoresHora = { ...p.parametros.valoresHora };
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
      <div className="acoes-exportar" style={{ marginTop: 8 }}>
        <CampoValor
          rotulo="Reserva de contingência (R$, decisão do GP)"
          valor={p.parametros.contingencia}
          aoMudar={(v) => mudarPar({ contingencia: v })}
        />
        <CampoValor
          rotulo="Reserva gerencial (R$, decisão do GP)"
          valor={p.parametros.gerencial}
          aoMudar={(v) => mudarPar({ gerencial: v })}
        />
      </div>
      <table className="tabela tabela--texto">
        <tbody>
          <tr>
            <td>Pessoal</td>
            <td>{reais(c.preco.pessoal)}</td>
          </tr>
          <tr>
            <td>Linha de base dos custos (pessoal + contingência)</td>
            <td>{reais(c.linhaDeBase)}</td>
          </tr>
          <tr>
            <td>Orçamento (linha de base + reserva gerencial)</td>
            <td data-testid="orcamento">{reais(c.orcamento)}</td>
          </tr>
        </tbody>
      </table>
      <p className="envio__obs">{c.conferencia}</p>
      {c.faltando.length > 0 && <p className="envio__obs">Falta preencher: {c.faltando.join("; ")}.</p>}
    </div>
  );
}

function Indicadores({ p }: { p: PgpDossie }) {
  return (
    <div className="cartao cartao__corpo bloco">
      <h3 className="subtitulo-grupo">Indicadores de acompanhamento (sugestão do PMO)</h3>
      <table className="tabela tabela--texto">
        <thead>
          <tr>
            <th>Indicador</th>
            <th>Fórmula</th>
            <th>Meta</th>
            <th>Frequência</th>
          </tr>
        </thead>
        <tbody>
          {p.execucao!.resposta.indicadores.map((x) => (
            <tr key={x.nome}>
              <td>{x.nome}</td>
              <td>{x.formula}</td>
              <td>{x.meta || "a definir pelo GP"}</td>
              <td>{x.frequencia}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Autoconferencia({
  p,
  e,
  atualizar,
}: {
  p: PgpDossie;
  e: EntradaPgp;
  atualizar: (np: PgpDossie) => void;
}) {
  const dossie = useDossie((s) => s.dossie);
  const [resultado, setResultado] = useState<ResultadoConferencia | null>(null);
  const car = caracteristicasDoPgp(dossie, e);
  const mudar = (m: Partial<Caracteristicas>) => {
    atualizar({ ...p, caracteristicas: { ...car, ...m } });
    setResultado(null);
  };
  const separados = resultado ? separarDecisoesPendentes(resultado.achados) : null;
  const resumo = separados ? resumirAchados(separados.demais) : null;
  return (
    <section className="bloco">
      <RotuloSecao>Autoconferência (código, regras da etapa 5)</RotuloSecao>
      <div className="cartao cartao__corpo">
        <p className="texto-apoio">
          O plano gerado passa pelas mesmas regras da conferência do plano: vago, conflituoso e ausente, com a
          gravidade pela parte. O que você dispensou não conta como ausente. Confirme as características do
          projeto
          {p.caracteristicas ? "" : " (sugestão do código a partir da RFP e da adaptação)"}:
        </p>
        <div className="acoes-exportar">
          {(Object.keys(OPCOES) as (keyof Caracteristicas)[]).map((chave) => (
            <label key={chave} className="campo-numero">
              <span className="lb">{OPCOES[chave].rotulo}</span>
              <select
                aria-label={OPCOES[chave].rotulo}
                value={String(car[chave])}
                onChange={(ev) => {
                  const valor = OPCOES[chave].valores.find((v) => String(v) === ev.target.value);
                  mudar({ [chave]: valor } as Partial<Caracteristicas>);
                }}
              >
                {OPCOES[chave].valores.map((v) => (
                  <option key={String(v)} value={String(v)}>
                    {rotuloValor(v)}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <button
          className="botao botao--cheio"
          type="button"
          data-testid="autoconferir"
          style={{ marginTop: 8 }}
          onClick={() => setResultado(autoconferir(dossie, e))}
        >
          {resultado ? "Conferir de novo" : "Conferir o plano gerado"}
        </button>
        {resultado && separados && resumo && (
          <div data-testid="resultado-autoconferencia">
            <table className="tabela" style={{ marginTop: 8 }}>
              <thead>
                <tr>
                  <th>Gravidade</th>
                  <th>Vago</th>
                  <th>Conflituoso</th>
                  <th>Ausente</th>
                </tr>
              </thead>
              <tbody>
                {(["grave", "média", "baixa"] as const).map((g) => (
                  <tr key={g}>
                    <td>{g}</td>
                    <td>{resumo[g].vago}</td>
                    <td>{resumo[g].conflituoso}</td>
                    <td>{resumo[g].ausente}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="envio__obs">
              Além disso, {separados.decisoes.length} trechos com decisão do GP ainda vazia ("a definir pelo
              GP"): no plano final, eles precisam do valor, do nome ou da cadência que só você define.
            </p>
            {separados.demais.map((a) => (
              <article key={a.id} className="cartao cartao--borda bloco">
                <div className="cartao__corpo">
                  <div className="achado__cabeca">
                    <span className="lb">{a.tipo}</span>
                    <span className="lb">
                      {a.parte} {nomeDaParte(a.parte)}
                    </span>
                    <span className="lb">{a.gravidade}</span>
                  </div>
                  <p>{a.descricao}</p>
                  <p className="envio__obs">{a.sugestao}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Exportar({ habilitado }: { habilitado: boolean }) {
  const dossie = useDossie((s) => s.dossie);
  const [mensagem, setMensagem] = useState("");
  const [ocupado, setOcupado] = useState(false);
  async function rodar(f: () => Promise<string> | string) {
    setOcupado(true);
    setMensagem("");
    try {
      setMensagem(`Arquivo gerado: ${await f()}`);
    } catch (err) {
      setMensagem(`Não foi possível gerar o arquivo: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setOcupado(false);
    }
  }
  const svg = async (qual: "eap" | "rede") => {
    const { svgsDoPgp } = await import("../../exportacao/diagramas-pgp");
    const texto = svgsDoPgp(dossie)[qual];
    if (!texto)
      throw new Error(qual === "eap" ? "peça antes o passo do escopo" : "peça antes o passo do cronograma");
    return exportarTexto(dossie, texto, qual === "eap" ? "eap" : "diagrama-de-rede", "svg", "image/svg+xml");
  };
  const botoes: [string, () => Promise<string> | string][] = [
    ["Plano · DOCX", () => exportar(montarPgp(dossie), "docx", "plano-de-gerenciamento")],
    ["Plano · PDF", () => exportar(montarPgp(dossie), "pdf", "plano-de-gerenciamento")],
    [
      "Registros, cronograma e matrizes · XLSX",
      () => exportar(montarRegistrosPgp(dossie), "xlsx", "registros-do-plano"),
    ],
    ["EAP · SVG", () => svg("eap")],
    ["Diagrama de rede · SVG", () => svg("rede")],
    ["Pacote completo · ZIP", () => exportarPacotePgp(dossie)],
  ];
  return (
    <div className="acoes-exportar">
      {botoes.map(([rotulo, f]) => (
        <button
          key={rotulo}
          className="botao"
          type="button"
          disabled={ocupado || !habilitado}
          onClick={() => void rodar(f)}
        >
          {rotulo}
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
