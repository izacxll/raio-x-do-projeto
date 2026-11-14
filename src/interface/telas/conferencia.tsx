// Etapa 5 na tela: mapa do PGP, características, premissas críticas e requisitos (confirmados pelo GP),
// depois os achados, com a decisão do GP em cada um, e a exportação.
import { useMemo, useState } from "react";
import { CARACTERISTICAS_PADRAO, type Caracteristicas } from "../../dominio/caracteristicas";
import { PARTES_PGP, PREMISSAS_CRITICAS } from "../../dominio/skill";
import type {
  AnaliseRfpDossie,
  Conferencia,
  DecisaoAchado,
  DocumentoLido,
  PgpDossie,
} from "../../dossie/esquema";
import { useDossie } from "../../dossie/store";
import { requisitosValidos } from "../../etapas/1-rfp/revisao";
import { extrairRequisitos, type Requisito } from "../../extracao/requisitos";
import { exportar, type FormatoExportacao } from "../../exportacao/exportar";
import {
  aplicarDecisao,
  montarListaAchados,
  montarRelatorioConformidade,
  NOME_TIPO,
} from "../../exportacao/relatorio-conformidade";
import { procurarSinais } from "../../regras/busca";
import { conferirPlano, resumirAchados } from "../../regras/conferencia";
import { confirmacaoInicial, proporMapa, type ParteNoMapa } from "../../regras/mapa-pgp";
import { EtiquetaRotulo, RotuloSecao } from "../componentes/basicos";

const NOME_SITUACAO_PROPOSTA: Record<ParteNoMapa["situacao"], string> = {
  titulo: "título localizado",
  conteudo: "conteúdo sem título próprio",
  "nao-localizada": "não localizada pelo código",
};

export const OPCOES: { [K in keyof Caracteristicas]: { rotulo: string; valores: Caracteristicas[K][] } } = {
  porte: { rotulo: "Porte", valores: ["pequeno", "médio", "grande"] },
  abordagem: { rotulo: "Abordagem", valores: ["preditiva", "adaptativa", "híbrida"] },
  fases: { rotulo: "Fases", valores: ["uma", "várias"] },
  campo: { rotulo: "Trabalho de campo", valores: [true, false] },
  beneficiarios: { rotulo: "Beneficiários ou participantes", valores: [true, false] },
  subcontratacao: { rotulo: "Subcontratação", valores: ["permitida", "vedada", "não informada"] },
  dadosPessoais: { rotulo: "Dados pessoais", valores: [true, false] },
  frentes: { rotulo: "Frentes de trabalho", valores: ["uma", "várias"] },
  contratante: { rotulo: "Contratante", valores: ["público", "privado"] },
  pagamento: { rotulo: "Pagamento", valores: ["por produto", "por medição", "de outra forma"] },
};

export function rotuloValor(v: string | boolean): string {
  return v === true ? "sim" : v === false ? "não" : v;
}

interface Props {
  pgp: DocumentoLido;
  tap?: DocumentoLido;
  rfp?: DocumentoLido;
}

/**
 * Valores iniciais da conferência: a proposta do código, para o GP confirmar. Com a etapa 4 no dossiê, o que o GP
 * dispensou nela entra como "dispensada" (a especificação pede que a etapa 5 não aponte isso como ausente), e as
 * características e as premissas críticas vêm de lá.
 */
function conferenciaInicial(
  props: Props,
  mapa: ParteNoMapa[],
  analiseRfp?: AnaliseRfpDossie,
  pgp?: PgpDossie,
): Conferencia {
  // os requisitos da etapa 1 (revisados pelo GP) mantêm os números; sem ela, o código extrai os produtos da RFP
  const requisitos = analiseRfp
    ? requisitosValidos(analiseRfp)
    : props.rfp
      ? extrairRequisitos(props.rfp.paginas)
      : [];
  const justificativas = new Map(
    (pgp?.adaptacao?.resposta.partes ?? []).map((s) => [s.codigo, s.justificativa]),
  );
  return {
    caracteristicas: pgp?.caracteristicas ?? CARACTERISTICAS_PADRAO,
    mapa: confirmacaoInicial(mapa).map((m) =>
      pgp?.gerar[m.codigo] === false
        ? {
            codigo: m.codigo,
            situacao: "dispensada" as const,
            justificativa: `Dispensada pelo GP na etapa 4: ${justificativas.get(m.codigo) ?? ""}`.trim(),
          }
        : m,
    ),
    // na dúvida, a premissa "se aplica", para o GP decidir (decisão 0021)
    premissasAplicaveis:
      pgp?.premissasAplicaveis ?? Object.fromEntries(PREMISSAS_CRITICAS.map((p) => [p.codigo, true])),
    requisitos,
    proximoRequisito: analiseRfp?.proximoRequisito ?? requisitos.length + 1,
    decisoes: {},
  };
}

export function ConferenciaPgp(props: Props) {
  const { dossie, guardarConferencia } = useDossie();
  const proposta = useMemo(() => proporMapa(props.pgp.paginas, PARTES_PGP), [props.pgp]);
  const conf = dossie.conferencia ?? conferenciaInicial(props, proposta, dossie.analiseRfp, dossie.pgp);
  const [executar, setExecutar] = useState(Boolean(dossie.conferencia?.executadaEm));
  const atualizar = (mudanca: Partial<Conferencia>) => guardarConferencia({ ...conf, ...mudanca });

  const resultado = useMemo(
    () =>
      executar
        ? conferirPlano({
            pgp: props.pgp.paginas,
            tap: props.tap?.paginas,
            rfp: props.rfp?.paginas,
            partes: PARTES_PGP,
            premissas: PREMISSAS_CRITICAS,
            mapa: conf.mapa,
            caracteristicas: conf.caracteristicas,
            premissasAplicaveis: conf.premissasAplicaveis,
            requisitos: conf.requisitos,
          })
        : null,
    [
      executar,
      props.pgp,
      props.tap,
      props.rfp,
      conf.mapa,
      conf.caracteristicas,
      conf.premissasAplicaveis,
      conf.requisitos,
    ],
  );

  return (
    <>
      <section className="bloco">
        <RotuloSecao>Mapa do plano</RotuloSecao>
        <MapaDoPlano conf={conf} proposta={proposta} atualizar={atualizar} />
      </section>
      <section className="bloco">
        <RotuloSecao>Características do projeto</RotuloSecao>
        <CaracteristicasProjeto conf={conf} atualizar={atualizar} />
      </section>
      <section className="bloco">
        <RotuloSecao>Premissas críticas</RotuloSecao>
        <PremissasCriticas conf={conf} atualizar={atualizar} documentos={[props.rfp, props.tap, props.pgp]} />
      </section>
      <section className="bloco">
        <RotuloSecao>Requisitos da RFP</RotuloSecao>
        <Requisitos conf={conf} atualizar={atualizar} temRfp={Boolean(props.rfp)} />
      </section>
      <section className="bloco">
        <RotuloSecao>Conferência</RotuloSecao>
        <div className="cartao cartao__corpo">
          <p className="texto-apoio">
            Confira o mapa, as características, as premissas e os requisitos acima e rode a conferência. Ela
            roda no navegador, só com código, e pode ser refeita sempre que você mudar algo.
          </p>
          <button
            className="botao botao--cheio"
            type="button"
            onClick={() => {
              setExecutar(true);
              atualizar({ executadaEm: new Date().toISOString() });
            }}
          >
            {executar ? "Conferir de novo" : "Conferir o plano"}
          </button>
        </div>
      </section>
      {resultado && (
        <Resultado
          achados={resultado.achados}
          verificacoes={resultado.verificacoes}
          conf={conf}
          atualizar={atualizar}
        />
      )}
    </>
  );
}

function MapaDoPlano({
  conf,
  proposta,
  atualizar,
}: {
  conf: Conferencia;
  proposta: ParteNoMapa[];
  atualizar: (m: Partial<Conferencia>) => void;
}) {
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const mudar = (codigo: string, campos: Partial<Conferencia["mapa"][number]>) =>
    atualizar({ mapa: conf.mapa.map((p) => (p.codigo === codigo ? { ...p, ...campos } : p)) });
  const contagem = {
    presentes: conf.mapa.filter((p) => p.situacao === "presente").length,
    dispensadas: conf.mapa.filter((p) => p.situacao === "dispensada").length,
    naoExistem: conf.mapa.filter((p) => p.situacao === "nao-existe").length,
  };
  const linhas = PARTES_PGP.filter((p) => {
    const c = conf.mapa.find((m) => m.codigo === p.codigo);
    return mostrarTodas || c?.situacao !== "presente";
  });
  return (
    <div className="cartao cartao__corpo">
      <p className="texto-apoio">
        O código localizou as partes do plano pelos títulos e pelo conteúdo. Confirme ou corrija. A gravidade
        de cada achado depende deste mapa. Parte que não faz sentido para o projeto: marque <b>dispensada</b>,
        com a justificativa; ela não vira ausente.
      </p>
      <p className="resumo-leitura">
        <span>{contagem.presentes} presentes</span>·<span>{contagem.dispensadas} dispensadas</span>·
        <span>{contagem.naoExistem} não localizadas</span>
        <button
          className="botao botao--discreto"
          type="button"
          onClick={() => setMostrarTodas(!mostrarTodas)}
        >
          {mostrarTodas ? "Mostrar só as que pedem atenção" : "Mostrar as 51 partes"}
        </button>
      </p>
      <div className="mapa">
        <table className="tabela">
          <thead>
            <tr>
              <th>Parte</th>
              <th>Proposta do código</th>
              <th>Situação</th>
              <th>Páginas</th>
              <th>Justificativa</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((parte) => {
              const c = conf.mapa.find((m) => m.codigo === parte.codigo);
              const p = proposta.find((m) => m.codigo === parte.codigo);
              if (!c) return null;
              return (
                <tr
                  key={parte.codigo}
                  data-origem={c.situacao === "nao-existe" ? "nao-verificavel" : undefined}
                >
                  <td>
                    <b>{parte.codigo}</b> {parte.nome}
                  </td>
                  <td>
                    {p ? NOME_SITUACAO_PROPOSTA[p.situacao] : ""}
                    {p?.titulo ? ` (p. ${p.paginaInicial})` : ""}
                  </td>
                  <td>
                    <select
                      aria-label={`Situação de ${parte.codigo}`}
                      value={c.situacao}
                      onChange={(e) => mudar(parte.codigo, { situacao: e.target.value as typeof c.situacao })}
                    >
                      <option value="presente">presente</option>
                      <option value="dispensada">dispensada pelo GP</option>
                      <option value="nao-existe">não está no plano</option>
                    </select>
                  </td>
                  <td>
                    {c.situacao === "presente" && (
                      <>
                        <input
                          type="number"
                          min={1}
                          style={{ width: 56 }}
                          aria-label={`Página inicial de ${parte.codigo}`}
                          value={c.paginaInicial ?? ""}
                          onChange={(e) =>
                            mudar(parte.codigo, {
                              paginaInicial: Number(e.target.value) || undefined,
                              posicaoTitulo: undefined,
                            })
                          }
                        />
                        {" a "}
                        <input
                          type="number"
                          min={1}
                          style={{ width: 56 }}
                          aria-label={`Página final de ${parte.codigo}`}
                          value={c.paginaFinal ?? ""}
                          onChange={(e) =>
                            mudar(parte.codigo, { paginaFinal: Number(e.target.value) || undefined })
                          }
                        />
                      </>
                    )}
                  </td>
                  <td>
                    {c.situacao === "dispensada" && (
                      <input
                        aria-label={`Justificativa de ${parte.codigo}`}
                        value={c.justificativa ?? ""}
                        placeholder="Por que esta parte não se aplica"
                        onChange={(e) => mudar(parte.codigo, { justificativa: e.target.value })}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="envio__obs">
        Sem páginas, uma parte presente é procurada no plano inteiro (por exemplo, quando ela está junto de
        outra).
      </p>
    </div>
  );
}

function CaracteristicasProjeto({
  conf,
  atualizar,
}: {
  conf: Conferencia;
  atualizar: (m: Partial<Conferencia>) => void;
}) {
  return (
    <div className="cartao cartao__corpo">
      <p className="texto-apoio">
        O PMBOK é guia, não checklist: as características dizem quais itens do conteúdo mínimo são
        dispensáveis neste projeto. Os valores iniciais são os mais exigentes; ajuste ao projeto.
      </p>
      <div className="caracteristicas">
        {(Object.keys(OPCOES) as (keyof Caracteristicas)[]).map((chave) => (
          <label key={chave}>
            <span className="lb">{OPCOES[chave].rotulo}</span>
            <select
              value={String(conf.caracteristicas[chave])}
              onChange={(e) => {
                const valor = OPCOES[chave].valores.find((v) => String(v) === e.target.value);
                atualizar({ caracteristicas: { ...conf.caracteristicas, [chave]: valor } });
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
    </div>
  );
}

function PremissasCriticas({
  conf,
  atualizar,
  documentos,
}: {
  conf: Conferencia;
  atualizar: (m: Partial<Conferencia>) => void;
  documentos: (DocumentoLido | undefined)[];
}) {
  const evidencias = useMemo(
    () =>
      Object.fromEntries(
        PREMISSAS_CRITICAS.map((pc) => {
          for (const d of documentos) {
            if (!d) continue;
            const o = procurarSinais(d.paginas, pc.sinaisAplicacao);
            if (o) return [pc.codigo, `${d.papel.toUpperCase()}, p. ${o.pagina}: "${o.trecho}"`];
          }
          return [pc.codigo, ""];
        }),
      ),
    [documentos],
  );
  return (
    <div className="cartao cartao__corpo">
      <p className="texto-apoio">
        Premissa crítica é o que o plano assume e que, se falhar, obriga a refazer escopo, prazo e metas. A
        que se aplica ao projeto tem de estar no registro de premissas, no registro de riscos e no plano de
        mudanças. Na dúvida, ela vem marcada: desmarque a que não se aplica.
      </p>
      <ul className="premissas">
        {PREMISSAS_CRITICAS.map((pc) => (
          <li key={pc.codigo}>
            <label>
              <input
                type="checkbox"
                checked={conf.premissasAplicaveis[pc.codigo] ?? true}
                onChange={(e) =>
                  atualizar({
                    premissasAplicaveis: { ...conf.premissasAplicaveis, [pc.codigo]: e.target.checked },
                  })
                }
              />{" "}
              <b>{pc.codigo}</b> {pc.titulo}
            </label>
            <div className="envio__obs">
              {evidencias[pc.codigo] ? (
                <>
                  <EtiquetaRotulo rotulo="documento" /> {evidencias[pc.codigo]}
                </>
              ) : (
                "Sinais de aplicação não localizados pelo código nos documentos — conferir."
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Requisitos({
  conf,
  atualizar,
  temRfp,
}: {
  conf: Conferencia;
  atualizar: (m: Partial<Conferencia>) => void;
  temRfp: boolean;
}) {
  const [rotulo, setRotulo] = useState("");
  const [descricao, setDescricao] = useState("");
  function incluir() {
    if (!descricao.trim()) return;
    const novo: Requisito = {
      numero: `R${String(conf.proximoRequisito).padStart(2, "0")}`,
      rotulo: rotulo.trim() || "Requisito",
      descricao: descricao.trim(),
      pagina: 0,
      trecho: "",
      origem: "gp",
    };
    atualizar({ requisitos: [...conf.requisitos, novo], proximoRequisito: conf.proximoRequisito + 1 });
    setRotulo("");
    setDescricao("");
  }
  return (
    <div className="cartao cartao__corpo">
      <p className="texto-apoio">
        {temRfp
          ? "Produtos e entregáveis que o código localizou na RFP. O que ele não achou, inclua abaixo: requisito que o código não localizou nunca vira ausente por isso."
          : "Sem a RFP, inclua aqui os produtos e entregáveis exigidos, se quiser conferi-los no plano."}{" "}
        Cada requisito mantém o número; número de requisito removido não é reaproveitado.
      </p>
      {conf.requisitos.length > 0 && (
        <table className="tabela" style={{ marginBottom: 12 }}>
          <thead>
            <tr>
              <th>Nº</th>
              <th>Requisito</th>
              <th>Origem</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {conf.requisitos.map((r) => (
              <tr key={r.numero}>
                <td>{r.numero}</td>
                <td>
                  {r.rotulo}: {r.descricao}
                </td>
                <td>
                  {r.origem === "codigo" ? (
                    <EtiquetaRotulo rotulo="documento" pagina={r.pagina} />
                  ) : (
                    "incluído pelo GP"
                  )}
                </td>
                <td>
                  <button
                    className="botao botao--discreto"
                    type="button"
                    onClick={() =>
                      atualizar({ requisitos: conf.requisitos.filter((x) => x.numero !== r.numero) })
                    }
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="acoes-exportar">
        <input
          value={rotulo}
          onChange={(e) => setRotulo(e.target.value)}
          placeholder="Rótulo (ex.: Produto 3)"
          aria-label="Rótulo do requisito"
        />
        <input
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição como está na RFP"
          aria-label="Descrição do requisito"
          style={{ flex: 1, minWidth: 240 }}
        />
        <button className="botao" type="button" onClick={incluir}>
          Incluir requisito
        </button>
      </div>
    </div>
  );
}

function Resultado({
  achados,
  verificacoes,
  conf,
  atualizar,
}: {
  achados: ReturnType<typeof conferirPlano>["achados"];
  verificacoes: ReturnType<typeof conferirPlano>["verificacoes"];
  conf: Conferencia;
  atualizar: (m: Partial<Conferencia>) => void;
}) {
  const dossie = useDossie((s) => s.dossie);
  const [mensagem, setMensagem] = useState("");
  const finais = achados.map((a) => aplicarDecisao(a, conf.decisoes[a.id]));
  const resumo = resumirAchados(finais);
  const decidir = (id: string, d: Partial<DecisaoAchado>) =>
    atualizar({ decisoes: { ...conf.decisoes, [id]: { ...conf.decisoes[id], ...d } } });
  const naoConferidos = verificacoes.filter((v) => v.estado === "nao-conferido").length;
  const naoVerificaveis = verificacoes.filter((v) => v.estado === "nao-verificavel").length;

  async function baixar(formato: FormatoExportacao) {
    try {
      const doc =
        formato === "xlsx"
          ? montarListaAchados(dossie, achados)
          : montarRelatorioConformidade(dossie, achados, verificacoes);
      const nome = await exportar(
        doc,
        formato,
        formato === "xlsx" ? "lista-de-achados" : "relatorio-de-conformidade",
      );
      setMensagem(`Arquivo gerado: ${nome}`);
    } catch (e) {
      setMensagem(`Não foi possível gerar o arquivo: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return (
    <section className="bloco">
      <RotuloSecao>Resultado</RotuloSecao>
      <div className="cartao cartao__corpo bloco">
        <table className="tabela resumo-achados" aria-label="Resumo dos achados">
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
                <td>
                  <i className={`etiqueta etiqueta--${g === "média" ? "media" : g}`}>{g}</i>
                </td>
                <td>{resumo[g].vago}</td>
                <td>{resumo[g].conflituoso}</td>
                <td>{resumo[g].ausente}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="envio__obs">
          "Ausente" quer dizer não localizado pelo código no plano inteiro: conferir no documento antes de
          decidir.
          {naoConferidos > 0 &&
            ` ${naoConferidos} itens dependem de interpretação e não foram conferidos pelo código.`}
          {naoVerificaveis > 0 &&
            ` ${naoVerificaveis} verificações ficaram não verificáveis por páginas sem texto legível.`}
        </p>
        <div className="acoes-exportar">
          <button className="botao" type="button" onClick={() => void baixar("docx")}>
            Relatório DOCX
          </button>
          <button className="botao" type="button" onClick={() => void baixar("pdf")}>
            Relatório PDF
          </button>
          <button className="botao" type="button" onClick={() => void baixar("xlsx")}>
            Lista de achados XLSX
          </button>
          {mensagem && <span className="envio__obs">{mensagem}</span>}
        </div>
      </div>

      {finais.length === 0 && <p className="texto-apoio">Nenhum achado nas regras do código.</p>}
      {finais.map((a) => (
        <article
          key={a.id}
          className={`cartao cartao--borda achado achado--${a.tipo} bloco`}
          data-gravidade={a.gravidade}
        >
          <div className="cartao__corpo">
            <div className="achado__cabeca">
              <i className={`etiqueta etiqueta--${a.gravidade === "média" ? "media" : a.gravidade}`}>
                {a.gravidade}
              </i>
              <i className={`etiqueta etiqueta--tipo-${a.tipo}`}>{NOME_TIPO[a.tipo]}</i>
              <span className="lb">{a.categoria}</span>
              <span className="lb">parte {a.parte}</span>
            </div>
            <h3 className="achado__titulo">{a.titulo}</h3>
            <p>{a.descricao}</p>
            <ul className="evidencias">
              {a.evidencias.map((e, i) => (
                <li key={i}>
                  {e.documento === "ficha" ? (
                    <span className="lb">{e.rotulo}</span>
                  ) : (
                    <EtiquetaRotulo rotulo="documento" pagina={e.pagina} />
                  )}{" "}
                  <span>
                    {e.documento !== "ficha" && `${e.documento.toUpperCase()}: `}“{e.trecho}”
                  </span>
                </li>
              ))}
            </ul>
            <p>
              <EtiquetaRotulo rotulo="sugestao" /> {a.sugestao}
            </p>
            <div className="decisao">
              <EtiquetaRotulo rotulo="decisao-gp" />
              <select
                aria-label="O achado procede?"
                value={a.decisao?.procede ?? ""}
                onChange={(e) =>
                  decidir(a.id, { procede: (e.target.value || undefined) as DecisaoAchado["procede"] })
                }
              >
                <option value="">pendente</option>
                <option value="sim">procede</option>
                <option value="nao">não procede</option>
              </select>
              <select
                aria-label="Gravidade"
                value={a.decisao?.gravidade ?? ""}
                onChange={(e) =>
                  decidir(a.id, { gravidade: (e.target.value || undefined) as DecisaoAchado["gravidade"] })
                }
              >
                <option value="">gravidade do código</option>
                <option value="grave">grave</option>
                <option value="média">média</option>
                <option value="baixa">baixa</option>
              </select>
              <input
                aria-label="Justificativa"
                placeholder="Justificativa (obrigatória se não procede ou se a gravidade mudar)"
                value={a.decisao?.justificativa ?? ""}
                onChange={(e) => decidir(a.id, { justificativa: e.target.value })}
              />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
