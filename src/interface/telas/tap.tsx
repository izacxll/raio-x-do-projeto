// Etapa 3 na tela: a proposta usada (PDF final do GP ou a da etapa 2), as divergências RFP × proposta com a decisão
// do GP, o que vem dos documentos (código), os dois passos do PMO (12 elementos e registro de premissas), os campos
// que só o GP preenche, a conferência do TAP (código), a aprovação e as saídas.
import { useMemo, useState } from "react";
import { MODELOS, type IdModelo } from "../../config/modelo";
import type { DecisoesTap, TapDossie } from "../../dossie/esquema";
import { useDossie } from "../../dossie/store";
import { PREMISSAS_CRITICAS } from "../../dominio/skill";
import { conferirTap, NOME_SITUACAO_VERIFICACAO } from "../../etapas/3-tap/conferencia-tap";
import {
  compararRfpEProposta,
  NOME_SITUACAO_DIVERGENCIA,
  pedeDecisao,
} from "../../etapas/3-tap/divergencias";
import { dadosDosDocumentos } from "../../etapas/3-tap/do-documento";
import { montarEntradaTap, NOME_PROPOSTA_DO_DOSSIE } from "../../etapas/3-tap/entrada";
import { pedidoPremissas, pedidoTap } from "../../etapas/3-tap/pedidos";
import { contarPendentesTap, itensDaEtapa3, tapInicial, type PassoTap } from "../../etapas/3-tap/tap";
import { exportar, type FormatoExportacao } from "../../exportacao/exportar";
import { montarRegistroPremissas, montarTap } from "../../exportacao/relatorio-tap";
import { estimarCusto, formatarDolar } from "../../pmo/custo";
import { estimarTokens, referenciasEtapa3, textoDeSistema, textoDosDocumentos } from "../../pmo/montagem";
import { SCHEMAS_TAP } from "../../pmo/schemas/tap";
import { EtiquetaRotulo, RotuloSecao } from "../componentes/basicos";
import { ConectarClaude, useChave } from "../componentes/conectar-claude";
import { ItensPmo } from "../componentes/item-pmo";
import { PassoPmoNaTela, UsoNaTela, useChamadaPmo } from "../componentes/passo-pmo";

const NOME_ORIGEM_DADO = {
  documento: "do documento",
  calculado: "conta do código",
  "nao-localizado": "conferir",
};

export function TermoDeAbertura() {
  const { dossie, guardarTap } = useDossie();
  const t = dossie.tap ?? tapInicial(dossie.proposta?.modelo);
  const demonstracao = Boolean(dossie.demonstracao);
  const chave = useChave();
  const entrada = useMemo(() => montarEntradaTap(dossie), [dossie]);
  const divergencias = useMemo(() => compararRfpEProposta(entrada), [entrada]);
  const dados = useMemo(() => dadosDosDocumentos(entrada), [entrada]);
  const sistema = useMemo(() => textoDeSistema(referenciasEtapa3()), []);
  const textoDocs = useMemo(() => textoDosDocumentos(entrada.documentos), [entrada]);
  const itens = useMemo(() => itensDaEtapa3(t, entrada.documentos), [t, entrada]);
  const premissas = t.premissasAplicaveis ?? dossie.proposta?.premissasAplicaveis ?? {};
  const { rodando, erro, chamar, cancelar } = useChamadaPmo();

  const atualizar = (nt: TapDossie) => guardarTap(nt);
  const mudarDecisoes = (m: Partial<DecisoesTap>) => atualizar({ ...t, decisoes: { ...t.decisoes, ...m } });

  function pedidoDo(passo: PassoTap): string | null {
    if (entrada.fonte === "nenhuma") return null;
    if (passo === "tap") return pedidoTap(entrada, dados, divergencias, t.divergencias, premissas);
    return t.tap ? pedidoPremissas(entrada, t.tap.resposta, premissas) : null;
  }

  async function executar(passo: PassoTap) {
    const pedido = pedidoDo(passo);
    if (!pedido) return;
    const r = await chamar({
      etapa: 3,
      passo,
      schema: SCHEMAS_TAP[passo],
      demonstracao,
      chave,
      modelo: t.modelo,
      sistema,
      documentos: textoDocs,
      pedido,
    });
    if (!r) return;
    const atual = useDossie.getState().dossie.tap ?? t;
    const guardada = { resposta: r.resposta, modelo: r.modelo, em: r.em };
    atualizar({
      ...atual,
      [passo]: guardada,
      uso: r.uso ? [...atual.uso, r.uso] : atual.uso,
    } as TapDossie);
  }

  const tokensFixos = estimarTokens(sistema) + estimarTokens(textoDocs);
  const pendentes = contarPendentesTap(t, itens, divergencias);
  const totalUso = t.uso.reduce((s, u) => s + (u.custoUsd ?? 0), 0);

  return (
    <>
      <section className="bloco">
        <RotuloSecao>Conexão com o PMO</RotuloSecao>
        {demonstracao ? (
          <div className="cartao cartao__corpo">
            <p className="texto-apoio">
              Demonstração: a chave não é usada e nada é enviado à API. Cada passo do PMO carrega a resposta
              gravada para esta RFP; as divergências, a conferência e as decisões do GP são as de verdade.
            </p>
          </div>
        ) : (
          <>
            <ConectarClaude modelo={t.modelo as IdModelo} />
            <div className="cartao cartao__corpo acoes-exportar" style={{ marginTop: 8 }}>
              <label>
                <span className="lb">Modelo</span>{" "}
                <select
                  aria-label="Modelo"
                  value={t.modelo}
                  onChange={(e) => atualizar({ ...t, modelo: e.target.value })}
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
                Gasto deste TAP até agora: {formatarDolar(totalUso)} em {t.uso.length}{" "}
                {t.uso.length === 1 ? "chamada" : "chamadas"}.
              </span>
            </div>
          </>
        )}
      </section>

      <section className="bloco">
        <RotuloSecao>Proposta usada</RotuloSecao>
        <div className="cartao cartao__corpo">
          <p className="texto-apoio" data-testid="fonte-proposta">
            {entrada.fonte === "pdf"
              ? `PDF da versão final do GP: ${entrada.proposta?.nomeArquivo}.`
              : entrada.fonte === "dossie"
                ? `${NOME_PROPOSTA_DO_DOSSIE}: a minuta da etapa 2, com as revisões do GP. Se o GP editou a proposta fora da ferramenta, envie o PDF da versão final acima: ele passa a valer.`
                : "Nenhuma proposta: envie o PDF da proposta final acima, ou faça a etapa 2 neste dossiê."}
          </p>
        </div>
      </section>

      <section className="bloco">
        <RotuloSecao>Premissas críticas (decisão do GP)</RotuloSecao>
        <div className="cartao cartao__corpo">
          <p className="envio__obs">
            {dossie.proposta && !t.premissasAplicaveis ? "Vêm confirmadas da etapa 2. " : ""}
            As confirmadas saem no registro de premissas, com a consequência se não se confirmarem.
          </p>
          <div className="acoes-exportar">
            {PREMISSAS_CRITICAS.map((pc) => (
              <label key={pc.codigo} title={pc.titulo}>
                <input
                  type="checkbox"
                  checked={Boolean(premissas[pc.codigo])}
                  onChange={(ev) =>
                    atualizar({ ...t, premissasAplicaveis: { ...premissas, [pc.codigo]: ev.target.checked } })
                  }
                />{" "}
                <b>{pc.codigo}</b> {pc.titulo}
              </label>
            ))}
          </div>
        </div>
      </section>

      {divergencias.length > 0 && (
        <section className="bloco">
          <RotuloSecao>Divergências RFP × proposta (código)</RotuloSecao>
          <div className="cartao cartao__corpo">
            <p className="texto-apoio">
              Requisito a requisito, mais o prazo e o valor. Onde a proposta diverge da RFP, o GP decide qual
              vale no TAP. “Não localizado” quer dizer que o código não achou: conferir.
            </p>
            <table className="tabela tabela--texto" data-testid="divergencias">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>RFP</th>
                  <th>Proposta</th>
                  <th>Situação</th>
                  <th>O que vale (decisão do GP)</th>
                </tr>
              </thead>
              <tbody>
                {divergencias.map((d) => {
                  const dec = t.divergencias[d.id];
                  return (
                    <tr key={d.id} data-origem={pedeDecisao(d) && !dec ? "nao-verificavel" : undefined}>
                      <td>{d.requisito ?? d.tema}</td>
                      <td>
                        {d.rfp.texto}
                        {d.rfp.onde && <div className="envio__obs">{d.rfp.onde}</div>}
                      </td>
                      <td>
                        {d.proposta.texto}
                        {d.proposta.onde && <div className="envio__obs">{d.proposta.onde}</div>}
                      </td>
                      <td title={d.observacao}>{NOME_SITUACAO_DIVERGENCIA[d.situacao]}</td>
                      <td>
                        {pedeDecisao(d) ? (
                          <>
                            <select
                              aria-label={`O que vale em ${d.id}`}
                              value={dec?.vale ?? ""}
                              onChange={(e) => {
                                const divs = { ...t.divergencias };
                                if (!e.target.value) delete divs[d.id];
                                else divs[d.id] = { vale: e.target.value as "rfp", texto: dec?.texto };
                                atualizar({ ...t, divergencias: divs });
                              }}
                            >
                              <option value="">pendente</option>
                              <option value="rfp">vale a RFP</option>
                              <option value="proposta">vale a proposta</option>
                              <option value="outra">outra redação</option>
                            </select>
                            {dec?.vale === "outra" && (
                              <input
                                aria-label={`Redação de ${d.id}`}
                                value={dec.texto ?? ""}
                                onChange={(e) =>
                                  atualizar({
                                    ...t,
                                    divergencias: {
                                      ...t.divergencias,
                                      [d.id]: { vale: "outra", texto: e.target.value },
                                    },
                                  })
                                }
                              />
                            )}
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
        </section>
      )}

      <section className="bloco">
        <RotuloSecao>O que vem dos documentos (código)</RotuloSecao>
        <div className="cartao cartao__corpo">
          <table className="tabela tabela--texto" data-testid="do-documento">
            <thead>
              <tr>
                <th>Elemento</th>
                <th>Dado</th>
                <th>Conteúdo</th>
                <th>Origem</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((d) => (
                <tr key={d.id} data-origem={d.origem === "nao-localizado" ? "nao-verificavel" : undefined}>
                  <td>{d.elemento}</td>
                  <td>{d.nome}</td>
                  <td>{d.texto}</td>
                  <td>
                    {d.origem === "documento" ? (
                      <EtiquetaRotulo rotulo="documento" />
                    ) : (
                      NOME_ORIGEM_DADO[d.origem]
                    )}{" "}
                    {d.onde}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {(["tap", "premissas"] as const).map((passo) => {
        const pedido = pedidoDo(passo);
        return (
          <PassoPmoNaTela
            key={passo}
            passo={passo}
            titulo={passo === "tap" ? "Os 12 elementos do TAP" : "Registro de premissas inicial"}
            pedido={pedido}
            semPedido={
              entrada.fonte === "nenhuma"
                ? "Antes, envie a proposta final (PDF) ou faça a etapa 2 neste dossiê."
                : "Antes, peça os 12 elementos do TAP."
            }
            feito={t[passo] ? { modelo: t[passo]!.modelo, em: t[passo]!.em } : undefined}
            demonstracao={demonstracao}
            chave={chave}
            estimativa={
              pedido ? estimarCusto(t.modelo, passo, tokensFixos, estimarTokens(pedido)) : undefined
            }
            rodando={rodando}
            erro={erro}
            aoPedir={() => void executar(passo)}
            aoCancelar={cancelar}
            envio="O texto dos PDFs da RFP e da proposta vai para a API do Claude, pela sua chave, na organização da FGV."
          >
            {t[passo] && (
              <ItensPmo
                itens={itens.filter((i) => i.passo === passo)}
                revisoes={t.revisoes}
                aoMudar={(revisoes) => atualizar({ ...t, revisoes })}
              />
            )}
            {passo === "tap" && t.tap && <DecisoesDoGp t={t} mudar={mudarDecisoes} />}
          </PassoPmoNaTela>
        );
      })}

      {t.tap && <ConferenciaDoTap t={t} />}

      <section className="bloco">
        <RotuloSecao>Aprovação do TAP (decisão do GP)</RotuloSecao>
        <div className="cartao cartao__corpo acoes-exportar">
          <label className="campo-numero">
            <span className="lb">Aprovado por</span>
            <input
              aria-label="Aprovado por"
              placeholder="a definir pelo GP"
              value={t.decisoes.aprovadoPor ?? ""}
              onChange={(e) => mudarDecisoes({ aprovadoPor: e.target.value })}
            />
          </label>
          <label className="campo-numero">
            <span className="lb">Data da aprovação</span>
            <input
              type="date"
              aria-label="Data da aprovação"
              value={t.decisoes.aprovadoEm ?? ""}
              onChange={(e) => mudarDecisoes({ aprovadoEm: e.target.value || undefined })}
            />
          </label>
        </div>
      </section>

      <section className="bloco">
        <RotuloSecao>Exportar</RotuloSecao>
        <div className="cartao cartao__corpo">
          <p className="resumo-leitura" aria-live="polite">
            <span>{itens.length} itens do PMO</span>·<span>{pendentes} pendências do GP</span>
            <span>
              {pendentes > 0
                ? "· os documentos saem com o cabeçalho de minuta até tudo ser revisado e o TAP aprovado"
                : "· tudo revisado"}
            </span>
          </p>
          <Exportar habilitado={Boolean(t.tap)} />
        </div>
      </section>

      <UsoNaTela uso={t.uso} titulo="Uso da API neste TAP" />
    </>
  );
}

function DecisoesDoGp({ t, mudar }: { t: TapDossie; mudar: (m: Partial<DecisoesTap>) => void }) {
  const campo = (rotulo: string, chave: keyof DecisoesTap, largo = false) => (
    <label className="campo-numero" style={largo ? { flex: 1, minWidth: 280 } : undefined}>
      <span className="lb">{rotulo}</span>
      <input
        aria-label={rotulo}
        placeholder="a definir pelo GP"
        value={t.decisoes[chave] ?? ""}
        onChange={(e) => mudar({ [chave]: e.target.value })}
        style={largo ? { width: "100%" } : undefined}
      />
    </label>
  );
  return (
    <div className="cartao cartao__corpo bloco" data-testid="decisoes-gp">
      <div className="achado__cabeca">
        <EtiquetaRotulo rotulo="decisao-gp" />
        <h3 className="subtitulo-grupo" style={{ margin: 0 }}>
          Campos que só o GP preenche
        </h3>
      </div>
      <p className="envio__obs">
        A redação sugerida pelo PMO está nos itens acima. Vazio sai como “a definir pelo GP”.
      </p>
      <div className="acoes-exportar">
        {campo("Recursos financeiros pré-aprovados (TAP.7)", "recursos", true)}
        {campo("Gerente do projeto (TAP.11)", "gerente")}
        {campo("Nível de autoridade do GP (TAP.11)", "autoridade", true)}
        {campo("Patrocinador (TAP.12)", "patrocinador")}
        {campo("Autoridade do patrocinador (TAP.12)", "autoridadePatrocinador", true)}
      </div>
    </div>
  );
}

function ConferenciaDoTap({ t }: { t: TapDossie }) {
  const dossie = useDossie((s) => s.dossie);
  const entrada = useMemo(() => montarEntradaTap(dossie), [dossie]);
  const itens = itensDaEtapa3(t, entrada.documentos);
  const premissas = t.premissasAplicaveis ?? dossie.proposta?.premissasAplicaveis ?? {};
  const v = conferirTap(entrada, t, itens, premissas);
  return (
    <section className="bloco">
      <RotuloSecao>Conferência do TAP (código)</RotuloSecao>
      <div className="cartao cartao__corpo">
        <table className="tabela tabela--texto" data-testid="conferencia-tap">
          <thead>
            <tr>
              <th>Verificação</th>
              <th>Situação</th>
              <th>Detalhe</th>
            </tr>
          </thead>
          <tbody>
            {v.map((x) => (
              <tr key={x.id} data-origem={x.situacao === "atencao" ? "nao-verificavel" : undefined}>
                <td>{x.nome}</td>
                <td>{NOME_SITUACAO_VERIFICACAO[x.situacao]}</td>
                <td>{x.texto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const SAIDAS: { rotulo: string; nome: string; formato: FormatoExportacao; montar: typeof montarTap }[] = [
  { rotulo: "Termo de abertura · DOCX", nome: "termo-de-abertura", formato: "docx", montar: montarTap },
  { rotulo: "Termo de abertura · PDF", nome: "termo-de-abertura", formato: "pdf", montar: montarTap },
  {
    rotulo: "Registro de premissas · XLSX",
    nome: "registro-de-premissas",
    formato: "xlsx",
    montar: montarRegistroPremissas,
  },
];

function Exportar({ habilitado }: { habilitado: boolean }) {
  const dossie = useDossie((s) => s.dossie);
  const [mensagem, setMensagem] = useState("");
  const [ocupado, setOcupado] = useState(false);
  async function baixar(s: (typeof SAIDAS)[number]) {
    setOcupado(true);
    setMensagem("");
    try {
      const nome = await exportar(s.montar(dossie), s.formato, s.nome);
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
