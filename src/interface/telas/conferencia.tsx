// Etapa 5 na tela: mapa do PGP, características, premissas críticas e requisitos (confirmados pelo GP),
// depois os achados, com a decisão do GP em cada um, e a exportação.
import { useMemo, useState } from "react";
import { aplicarSegundaEtapa5 } from "../../pmo/segunda-etapa-5";
import {
  CARACTERISTICAS_PADRAO,
  type Caracteristicas,
  VALORES_CARACTERISTICAS,
} from "../../dominio/caracteristicas";
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
import { aplicarTipoPlano, proporMapa, sincronizarMapa, type ParteNoMapa } from "../../regras/mapa-pgp";
import { LeituraDoPmo } from "./leitura-pmo";
import { CapaNaTela } from "../componentes/capa-de-decisao";
import { capaDosVereditos } from "../../exportacao/capas";
import { conferirLeitura, type AchadoPmoConferido } from "../../etapas/5-conferencia/leitura-pmo";
import { mapaInicialDaConferencia } from "../../etapas/5-conferencia/dispensas";
import { presentesPelaMarcaDoDossie } from "../../etapas/4-pgp/autoconferencia";
import {
  conferirComCandidatos,
  conferirVereditos,
  NOME_SITUACAO_CANDIDATO,
  type ResultadoVereditos,
} from "../../etapas/5-conferencia/candidatos";
import { EtiquetaRotulo, RotuloSecao } from "../componentes/basicos";

const NOME_SITUACAO_PROPOSTA: Record<ParteNoMapa["situacao"], string> = {
  titulo: "título localizado",
  conteudo: "conteúdo sem título próprio",
  "nao-localizada": "não localizada pelo código",
};

// os valores vêm do domínio: a exportação do teste externo aceita os mesmos (decisão 0069)
const V = VALORES_CARACTERISTICAS;
export const OPCOES: {
  [K in keyof Caracteristicas]: { rotulo: string; valores: readonly Caracteristicas[K][] };
} = {
  porte: { rotulo: "Porte", valores: V.porte },
  abordagem: { rotulo: "Abordagem", valores: V.abordagem },
  fases: { rotulo: "Fases", valores: V.fases },
  campo: { rotulo: "Trabalho de campo", valores: V.campo },
  beneficiarios: { rotulo: "Beneficiários ou participantes", valores: V.beneficiarios },
  subcontratacao: { rotulo: "Subcontratação", valores: V.subcontratacao },
  dadosPessoais: { rotulo: "Dados pessoais", valores: V.dadosPessoais },
  frentes: { rotulo: "Frentes de trabalho", valores: V.frentes },
  contratante: { rotulo: "Contratante", valores: V.contratante },
  pagamento: { rotulo: "Pagamento", valores: V.pagamento },
  exposicao: { rotulo: "Estudo sensível (CPI, comissão, órgão de controle)", valores: V.exposicao },
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
  return {
    caracteristicas: pgp?.caracteristicas ?? CARACTERISTICAS_PADRAO,
    // as dispensas da etapa 4 e as que o próprio plano declara (mesma função do script de teste)
    mapa: mapaInicialDaConferencia(mapa, props.pgp.paginas, PARTES_PGP, pgp),
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
  // trocado o plano (outro documento na caixa), o mapa guardado era de outro arquivo e volta à proposta do código;
  // num dossiê sem o id do plano, o mapa fica como o GP deixou
  const guardada = dossie.conferencia;
  const conf = useMemo(() => {
    if (!guardada)
      return { ...conferenciaInicial(props, proposta, dossie.analiseRfp, dossie.pgp), pgpId: props.pgp.id };
    // outro plano: a leitura do PMO e as decisões eram do plano anterior e saem (decisão 0037)
    if (guardada.pgpId && guardada.pgpId !== props.pgp.id)
      return {
        ...guardada,
        pgpId: props.pgp.id,
        mapa: sincronizarMapa(guardada.mapa, proposta),
        leituraPmo: undefined,
        executadaEm: undefined,
        decisoes: {},
      };
    return guardada.pgpId ? guardada : { ...guardada, pgpId: props.pgp.id };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardada, proposta, props.pgp.id]);
  const atualizar = (mudanca: Partial<Conferencia>) => guardarConferencia({ ...conf, ...mudanca });

  // a conferência por código roda sempre (ela monta o pedido ao PMO); a tela só a mostra com a leitura (decisão 0037)
  // com dispensa declarada só no plano, também os achados que valem se ela não couber (decisão 0052)
  const comCandidatos = useMemo(
    () =>
      conferirComCandidatos(
        {
          pgp: props.pgp.paginas,
          tap: props.tap?.paginas,
          rfp: props.rfp?.paginas,
          partes: PARTES_PGP,
          premissas: PREMISSAS_CRITICAS,
          mapa: conf.mapa,
          caracteristicas: conf.caracteristicas,
          premissasAplicaveis: conf.premissasAplicaveis,
          requisitos: conf.requisitos,
          tipoPlano: conf.tipoPlano,
          // o que a autoconferência da etapa 4 marcou "presente" (decisão 0076): o código procura o texto no plano
          presentesPelaMarca: presentesPelaMarcaDoDossie(dossie.pgp),
        },
        proposta,
      ),
    [
      proposta,
      props.pgp,
      props.tap,
      props.rfp,
      conf.mapa,
      conf.caracteristicas,
      conf.premissasAplicaveis,
      conf.requisitos,
      conf.tipoPlano,
      dossie.pgp,
    ],
  );
  const resultado = comCandidatos.resultado;
  const documentos = [props.pgp, ...(props.tap ? [props.tap] : []), ...(props.rfp ? [props.rfp] : [])];

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
      <LeituraDoPmo
        pgp={props.pgp}
        tap={props.tap}
        rfp={props.rfp}
        conf={conf}
        atualizar={atualizar}
        achadosDoCodigo={resultado.achados}
        dispensasCandidatas={comCandidatos.dispensas}
        condicionais={comCandidatos.condicionais}
      />
      {/* decisão 0037: o resultado só aparece com a leitura do PMO */}
      {conf.leituraPmo && (
        <Resultado
          achados={resultado.achados}
          verificacoes={resultado.verificacoes}
          conf={conf}
          atualizar={atualizar}
          vereditos={aplicarSegundaEtapa5(
            conferirVereditos(
              conf.leituraPmo.resposta,
              resultado.achados,
              comCandidatos.condicionais,
              conf.mapa,
              documentos,
            ),
            // a revisão da segunda instância leve, se é desta leitura (decisão 0077)
            conf.segundaLeve?.deLeitura === conf.leituraPmo.em ? conf.segundaLeve.resposta : undefined,
            conf.leituraPmo.resposta,
          )}
          leitura={conferirLeitura(
            conf.leituraPmo.resposta,
            { pgp: props.pgp, tap: props.tap, rfp: props.rfp },
            resultado.achados,
            conf.mapa,
          )}
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
    atualizar({
      mapa: conf.mapa.map((p) => (p.codigo === codigo ? { ...p, ...campos, confirmadaPeloGp: true } : p)),
    });
  const tipo = conf.tipoPlano ?? "pgp";
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
      <div className="decisao" style={{ margin: "8px 0 12px" }}>
        <EtiquetaRotulo rotulo="decisao-gp" />
        <label>
          <span className="lb">Tipo de plano</span>{" "}
          <select
            aria-label="Tipo de plano"
            value={tipo}
            onChange={(e) => {
              const novo = e.target.value as "pgp" | "plano-trabalho";
              atualizar({ tipoPlano: novo, mapa: aplicarTipoPlano(conf.mapa, novo, proposta) });
            }}
          >
            <option value="pgp">PGP completo</option>
            <option value="plano-trabalho">Plano de trabalho / proposta</option>
          </select>
        </label>
        <span className="texto-apoio">
          {tipo === "plano-trabalho"
            ? 'Configuração, linhas de base, calendários, previsões, lições aprendidas, documentos de teste, dados do cronograma e termo de nomeação vêm dispensados ("não se aplica a plano de trabalho"). Dá para reverter parte a parte.'
            : "Todas as 51 partes do PGP contam."}
        </span>
      </div>
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
  leitura,
  vereditos,
}: {
  achados: ReturnType<typeof conferirPlano>["achados"];
  verificacoes: ReturnType<typeof conferirPlano>["verificacoes"];
  conf: Conferencia;
  atualizar: (m: Partial<Conferencia>) => void;
  leitura: AchadoPmoConferido[];
  vereditos: ResultadoVereditos;
}) {
  const dossie = useDossie((s) => s.dossie);
  const [mensagem, setMensagem] = useState("");
  // decisão 0052: só contam os achados do código que o PMO confirmou; os outros aparecem à parte, com o veredito
  const confirmados = vereditos.contam;
  const aParte = vereditos.candidatos.filter((c) => c.situacao !== "sustenta");
  const finais = confirmados.map((a) => aplicarDecisao(a, conf.decisoes[a.id]));
  const resumo = resumirAchados(finais);
  const decidir = (id: string, d: Partial<DecisaoAchado>) =>
    atualizar({ decisoes: { ...conf.decisoes, [id]: { ...conf.decisoes[id], ...d } } });
  const naoConferidos = verificacoes.filter((v) => v.estado === "nao-conferido").length;
  const naoVerificaveis = verificacoes.filter((v) => v.estado === "nao-verificavel").length;

  async function baixar(formato: FormatoExportacao) {
    try {
      const doc =
        formato === "xlsx"
          ? montarListaAchados(dossie, confirmados, new Date(), leitura, vereditos)
          : montarRelatorioConformidade(dossie, confirmados, verificacoes, new Date(), leitura, vereditos);
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

  // a capa de decisão com os vereditos já calculados aqui (decisão 0085), sem refazer a conferência
  const capa = useMemo(
    () =>
      capaDosVereditos(
        { ...dossie, conferencia: conf },
        vereditos,
        leitura,
        dossie.documentos.find((d) => d.papel === "pgp")?.nomeArquivo ?? "o plano",
      ),
    [dossie, conf, vereditos, leitura],
  );

  return (
    <>
      {capa && <CapaNaTela capa={capa} />}
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
            Só contam os achados do código que o PMO confirmou ou que a segunda instância devolveu (
            {confirmados.length} de {vereditos.candidatos.length}); os outros estão abaixo, com o veredito.
            "Ausente" quer dizer não localizado pelo código no plano: conferir no documento antes de decidir.
            {naoConferidos > 0 &&
              ` ${naoConferidos} itens dependem de interpretação e não foram conferidos pelo código.`}
            {naoVerificaveis > 0 &&
              ` ${naoVerificaveis} verificações ficaram não verificáveis por páginas sem texto legível.`}
          </p>
          {vereditos.candidatos.some((c) => c.revisadoPelaSegunda) && (
            <ul className="envio__obs" data-testid="devolvidos-pela-segunda">
              {vereditos.candidatos
                .filter((c) => c.revisadoPelaSegunda)
                .map((c) => (
                  <li key={c.achado.id}>
                    Voltou a contar pela segunda instância: {c.achado.titulo}. {c.revisadoPelaSegunda}
                  </li>
                ))}
            </ul>
          )}
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

        {finais.length === 0 && (
          <p className="texto-apoio">
            {achados.length
              ? "Nenhum achado do código confirmado pelo PMO."
              : "Nenhum achado nas regras do código."}
          </p>
        )}
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
        {(aParte.length > 0 || vereditos.dispensas.length > 0) && (
          <NaoConfirmados aParte={aParte} vereditos={vereditos} />
        )}
      </section>
    </>
  );
}

/** Achados do código que o PMO não confirmou e dispensas declaradas só no plano (decisão 0052). */
function NaoConfirmados({
  aParte,
  vereditos,
}: {
  aParte: ResultadoVereditos["candidatos"];
  vereditos: ResultadoVereditos;
}) {
  return (
    <div className="cartao cartao__corpo bloco" data-testid="nao-confirmados">
      {aParte.length > 0 && (
        <>
          <h3 style={{ margin: "0 0 4px" }}>Achados do código que o PMO não confirmou ({aParte.length})</h3>
          <p className="envio__obs">
            Achado do código é candidato até o veredito do PMO. Estes não contam no total; você pode rever.
          </p>
          <ul className="evidencias">
            {aParte.map((c) => (
              <li key={c.achado.id}>
                <span className="lb">
                  {NOME_SITUACAO_CANDIDATO[c.situacao]} · parte {c.achado.parte}
                </span>{" "}
                {c.achado.titulo}
                {c.daDispensa && ` (a dispensa do ${c.daDispensa} não cabe)`}
                {c.veredito?.motivo && <> — {c.veredito.motivo}</>}
                {(c.veredito?.evidencias ?? []).map((e, k) => (
                  <span key={k}>
                    {" "}
                    <EtiquetaRotulo rotulo="documento" pagina={e.pagina} /> “{e.trecho}”
                  </span>
                ))}
                {c.avisos.length > 0 && <span className="envio__obs"> ({c.avisos.join("; ")})</span>}
              </li>
            ))}
          </ul>
        </>
      )}
      {vereditos.dispensas.length > 0 && (
        <>
          <h3 style={{ margin: "8px 0 4px" }}>Dispensas declaradas só no plano</h3>
          <ul className="evidencias">
            {vereditos.dispensas.map((d) => (
              <li key={d.parte}>
                <span className="lb">
                  {d.situacao === "cabe"
                    ? "cabe"
                    : d.situacao === "nao-cabe"
                      ? "não cabe: a parte volta à conferência"
                      : "sem veredito do PMO"}
                </span>{" "}
                {d.parte}: {d.justificativa}
                {d.motivo && <> — {d.motivo}</>}
                {d.avisos.length > 0 && <span className="envio__obs"> ({d.avisos.join("; ")})</span>}
              </li>
            ))}
          </ul>
        </>
      )}
      {vereditos.desconhecidos.length > 0 && (
        <p className="envio__obs">
          Vereditos com id fora da lista do pedido (ignorados): {vereditos.desconhecidos.join(", ")}.
        </p>
      )}
    </div>
  );
}
