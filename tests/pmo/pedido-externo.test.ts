// Testar sem a chave: o Claude do claude.ai faz o papel do PMO (pedido da responsável, 16/11/2026).
// - exportar: grava, fora do Git, um .md com exatamente o que o app mandaria à API num passo do PMO (texto de
//   sistema, mensagem do usuário com o texto dos PDFs e o pedido, schema JSON da resposta) e um dossiê para importar.
// - importar: valida a resposta no schema, grava no dossiê como resposta do PMO, roda as travas do código e mede
//   contra o gabarito do Claude Code, numa seção "leitura independente". O gabarito nunca vai no pedido.
// Só roda pelos scripts npm run exportar-pedido / importar-resposta (RAIO_X_MODO=exportar|importar).
import { tapDoDossieComoDocumento } from "../../src/etapas/4-pgp/entrada";
import { conferirQuestoes, questoesDoCodigo, referenciasDoPlano } from "../../src/etapas/4-pgp/questoes";
import { montarPgp } from "../../src/exportacao/relatorio-pgp";
import {
  caracteristicasDoPgp,
  pgpComoDocumento,
  presentesPelaMarcaDoDossie,
} from "../../src/etapas/4-pgp/autoconferencia";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { conteudoDoPedido } from "./conteudo-do-pedido";
import { basename, dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import { criarDossieVazio, lerDossie, serializarDossie } from "../../src/dossie/arquivo";
import type { Dossie, DocumentoLido } from "../../src/dossie/esquema";
import { RespostaSegundaInstancia } from "../../src/pmo/schemas/segunda-instancia";
import { RespostaSegundaEtapa5 } from "../../src/pmo/schemas/segunda-etapa-5";
import {
  deveConferirEtapa5,
  montarSegundaEtapa5,
  segundaEtapa5EmTexto,
  vereditosAConferir,
} from "../../src/pmo/segunda-etapa-5";
import { semRevisoesDoPmo } from "../../src/pmo/itens";
import { identidadeDoCaso } from "../../src/pmo/identidade-do-caso";
import { lerVersaoDoTapNoPedido, montarTapRevisado } from "../../src/pmo/tap-revisado";
import {
  chaveDaSegundaInstancia,
  conferirSegundaInstancia,
  montarPedidoDaSegunda,
  proximaRodada,
  segundaInstanciaEmTexto,
  sistemaDaSegundaInstancia,
} from "../../src/pmo/segunda-instancia";
import { analisarRfp } from "../../src/etapas/1-rfp/analisar-rfp";
import {
  leituraDoDossie,
  NOME_AVISO,
  NOME_TRAVA,
  pedidoLeituraRfp,
} from "../../src/etapas/1-rfp/leitura-pmo";
import { analiseInicial } from "../../src/etapas/1-rfp/revisao";
import {
  estimarTokens,
  pcsConfirmadas,
  referenciasEtapa1,
  referenciasEtapa2,
  referenciasEtapa3,
  referenciasEtapa4,
  referenciasEtapa5,
  textoDeSistema,
  textoDosDocumentos,
} from "../../src/pmo/montagem";
import { RespostaLeituraRfp } from "../../src/pmo/schemas/leitura-rfp";
import {
  CARACTERISTICAS_PADRAO,
  type Caracteristicas,
  lerCaracteristicas,
} from "../../src/dominio/caracteristicas";
import { FICHAS, PARTES_PGP, PREMISSAS_CRITICAS } from "../../src/dominio/skill";
import type { PgpDossie } from "../../src/dossie/esquema";
import { autoconferenciaDaLeitura, citacaoEhFraca } from "../../src/etapas/1-rfp/leitura-pmo";
import { calcularCronograma } from "../../src/etapas/2-proposta/cronograma";
import { esqueletoEmTexto, montarMinuta } from "../../src/etapas/2-proposta/minuta";
import { pedidoConteudo, pedidoEap, pedidoEstrategia } from "../../src/etapas/2-proposta/pedidos";
import { montarPontoDePartida } from "../../src/etapas/2-proposta/ponto-de-partida";
import { propostaAntesDoPasso, propostaInicial } from "../../src/etapas/2-proposta/proposta";
import { compararRfpEProposta } from "../../src/etapas/3-tap/divergencias";
import { dadosDosDocumentos } from "../../src/etapas/3-tap/do-documento";
import { montarEntradaTap } from "../../src/etapas/3-tap/entrada";
import { pedidoPremissas, pedidoTap } from "../../src/etapas/3-tap/pedidos";
import { itensDaEtapa3, tapInicial } from "../../src/etapas/3-tap/tap";
import { conferirTap } from "../../src/etapas/3-tap/conferencia-tap";
import { itensEsperadosDaEtapa3 } from "../../src/etapas/3-tap/autoconferencia";
import { NOME_TIPO_COMPROMISSO, destinosNoTap } from "../../src/etapas/2-proposta/compromissos";
import { inicioFixo } from "../../src/regras/cruzamentos-rfp";
import { montarEntradaPgp } from "../../src/etapas/4-pgp/entrada";
import {
  rastrearCompromissos,
  conferirPacotes,
  conferirRaci,
  contratanteNaRaci,
  cronogramaDoPgp,
  custosDoPgp,
  inicioDoPgp,
} from "../../src/etapas/4-pgp/calculos";
import { autoconferir } from "../../src/etapas/4-pgp/autoconferencia";
import { textoDasHoras, textoDasHorasTotais } from "../../src/etapas/2-proposta/preco";
import { PASSOS_PGP } from "../../src/etapas/4-pgp/passos";
import { reguaQueMudouEmTexto, reguasQueMudaram } from "../../src/etapas/4-pgp/reguas";
import { PEDIDOS_PGP, pgpAntesDoPasso } from "../../src/etapas/4-pgp/pedidos";
import { linhaDaProposta } from "../../src/etapas/linha-do-tempo";
import {
  itensDoPgp,
  pareceRepetirORegistroInicial,
  passoAnterior,
  pgpInicial,
  repeteORegistroInicial,
} from "../../src/etapas/4-pgp/pgp";
import { conferirLeitura, pedidoLeitura } from "../../src/etapas/5-conferencia/leitura-pmo";
import { conferirAutoconferencia, partesARegenerar } from "../../src/pmo/autoconferencia";
import { citacaoValeComoFato, conferirCitacao } from "../../src/pmo/citacoes";
import type { FontePmo, ItemAutoconferencia } from "../../src/pmo/schemas/comum";
import { RespostaLeitura } from "../../src/pmo/schemas/leitura";
import { SCHEMAS_PGP, type PassoPgp } from "../../src/pmo/schemas/pgp";
import { SCHEMAS } from "../../src/pmo/schemas/proposta";
import { SCHEMAS_TAP } from "../../src/pmo/schemas/tap";
import { proporMapa } from "../../src/regras/mapa-pgp";
import { mapaInicialDaConferencia } from "../../src/etapas/5-conferencia/dispensas";
import {
  conferirComCandidatos,
  conferirVereditos,
  NOME_SITUACAO_CANDIDATO,
} from "../../src/etapas/5-conferencia/candidatos";
import { tirarAcentos } from "../../src/texto/normalizar";
import { lerPdf } from "../ajudantes/ler-pdf";
import { lerRfpPublica, PASTA_RFPS } from "../ajudantes/rfp-publica";

const env = process.env;
const MODO = env.RAIO_X_MODO;
const etapa = Number(env.RAIO_X_ETAPA ?? "0");
const PASSO = env.RAIO_X_PASSO ?? "";
const passo = PASSO;
const HOJE = new Date();

/** Gabaritos dos editais públicos de teste, por nome do PDF. */
const GABARITOS: Record<string, string> = {
  "chamamento-publico-termo-fomento-smped-sp-2025.pdf": "rfp-smped",
  "concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf": "rfp-oei",
};

async function lerRfp(arg: string): Promise<DocumentoLido> {
  if (existsSync(join(PASTA_RFPS, arg))) return lerRfpPublica(arg, HOJE);
  if (!existsSync(arg)) throw new Error(`RFP não encontrada: ${arg}`);
  return lerPdf(resolve(arg), "rfp", HOJE);
}

interface Passo {
  sistema: string;
  documentos: string;
  pedido: string;
  schema: z.ZodType;
  /** Linhas a mais no cabeçalho do pedido exportado (a rodada e o modelo da segunda instância). */
  nota?: string;
}

/**
 * A sugestão do código para as características (decisão 0069), a mesma que a tela da etapa 4 mostra antes de o GP
 * mexer: a partir da RFP e da adaptação, sem olhar as do GP no dossiê. Sem a etapa 3 no dossiê, o padrão conservador.
 */
function sugestaoDoCodigo(d: Dossie): Caracteristicas {
  const semAsDoGp: Dossie = d.pgp ? { ...d, pgp: { ...d.pgp, caracteristicas: undefined } } : d;
  const e = montarEntradaPgp(semAsDoGp, HOJE);
  return e.fonteTap === "nenhuma" ? CARACTERISTICAS_PADRAO : caracteristicasDoPgp(semAsDoGp, e);
}

/**
 * Os tokens do pedido que gerou a resposta (lição da rodada 3, item 3e): lidos do pedido exportado ao lado da
 * resposta, para comparar antes e depois de cada corte. Sem o pedido na pasta, diz isso.
 */
function tokensDoPedidoExportado(etapaDoPedido: number, passoDoPedido: string, base: string): string {
  const arq = join(
    dirname(resolve(env.RAIO_X_ARQUIVO ?? "")),
    `etapa-${etapaDoPedido}-${passoDoPedido}-${base}.md`,
  );
  if (!existsSync(arq))
    return `Tokens do pedido: não medidos (o pedido ${basename(arq)} não está ao lado da resposta).`;
  const m =
    /cerca de ([\d.]+) tokens de entrada\*\* \(4 caracteres por token; sistema ([\d.]+), documentos ([\d.]+), pedido ([\d.]+)\)/.exec(
      readFileSync(arq, "utf8"),
    );
  return m
    ? `Tokens do pedido (${basename(arq)}): cerca de ${m[1]} de entrada (sistema ${m[2]}, documentos ${m[3]}, pedido ${m[4]}; 4 caracteres por token).`
    : `Tokens do pedido: não medidos (${basename(arq)} sem a linha da estimativa).`;
}

/** O passo que a segunda instância confere ("segunda-conteudo" → "conteudo"). */
const alvoDaSegunda = (x: string) => x.replace(/^segunda-/, "");

/** A resposta guardada do passo, com o "em" (a segunda instância confere esta). */
function respostaDoPasso(d: Dossie, alvo: string): { resposta: unknown; em: string } | undefined {
  const g =
    etapa === 1
      ? d.analiseRfp?.leituraPmo
      : etapa === 2
        ? d.proposta?.[alvo as "estrategia" | "conteudo" | "eap"]
        : etapa === 3
          ? d.tap?.[alvo as "tap" | "premissas"]
          : etapa === 4
            ? d.pgp?.[alvo as PassoPgp]
            : d.conferencia?.leituraPmo;
  return g ? { resposta: g.resposta, em: g.em } : undefined;
}

/** Os documentos que foram no pedido do passo: a segunda instância confere contra os mesmos. */
function documentosDoPasso(d: Dossie): DocumentoLido[] {
  if (etapa === 3) return montarEntradaTap(d, HOJE).documentos;
  if (etapa === 4) return montarEntradaPgp(d, HOJE).documentos;
  if (etapa === 5) {
    const c = entradaDaConferencia(d);
    return [c.pgp, ...(c.tap ? [c.tap] : []), ...(c.rfp ? [c.rfp] : [])];
  }
  return d.documentos.filter((x) => x.papel === "rfp" || x.papel === "anexo-rfp");
}

/** Segunda instância (decisão 0057): só a skill, os documentos e a resposta do passo. */
/**
 * Etapa 5 (decisão 0077): a segunda instância leve, como na tela. Só os vereditos "falso" e "regra_errada", as páginas
 * que eles e os achados citam e as premissas críticas que se aplicam; uma rodada, no modelo mais barato por padrão.
 */
function segundaDaEtapa5(d: Dossie, leitura: z.infer<typeof RespostaLeitura>): Passo {
  const c = entradaDaConferencia(d);
  const documentos = [c.pgp, ...(c.tap ? [c.tap] : []), ...(c.rfp ? [c.rfp] : [])];
  const vd = conferirVereditos(leitura, c.achados, c.condicionais, c.mapa, documentos);
  // a mesma montagem da tela (paridade): o pedido, as páginas e a identidade pelos documentos do dossiê
  const m = montarSegundaEtapa5({
    leitura,
    candidatos: vd.candidatos,
    partes: PARTES_PGP,
    premissas: PREMISSAS_CRITICAS,
    premissasAplicaveis: c.premissasAplicaveis,
    documentos,
    mapa: c.mapa,
    identidade: identidadeDoCaso(d.documentos, d.projeto.nome),
  });
  precisa(
    m.quantos > 0,
    'a leitura do PMO não tem veredito "falso" nem "regra_errada" de achado do código: a segunda instância leve não roda (decisão 0077)',
  );
  return {
    sistema: sistemaDaSegundaInstancia(5),
    documentos: textoDosDocumentos(m.documentos),
    pedido: m.pedido,
    schema: RespostaSegundaEtapa5,
    nota: [
      '- **Segunda instância leve da etapa 5, rodada única** (decisão 0077): os vereditos "falso" e "regra_errada", as páginas citadas e as premissas críticas que se aplicam.',
      `- **Modelo desta rodada (decisão do GP):** ${env.RAIO_X_MODELO_SEGUNDA || "claude-sonnet-5-5 (padrão da decisão 0077)"}. Quem lança o revisor usa este modelo.`,
      // a leitura que foi conferida: a importação confere que é a mesma (revisão high, 0077)
      `- Leitura conferida: ${d.conferencia?.leituraPmo?.em ?? "—"}`,
    ].join("\n"),
  };
}

function montarSegunda(d: Dossie, passo: string): Passo {
  const alvo = alvoDaSegunda(passo);
  precisa(PASSOS[etapa]?.includes(alvo), `o passo "${alvo}" não existe na etapa ${etapa}`);
  const r = respostaDoPasso(d, alvo);
  precisa(r, `importe a resposta do passo "${alvo}" antes de conferir`);
  if (etapa === 5) return segundaDaEtapa5(d, r.resposta as z.infer<typeof RespostaLeitura>);
  // a mesma montagem do app (decisão 0071): o pedido do passo conferido, como foi ao PMO (esqueleto e o que o passo
  // exige; decisão 0059), com a identidade do caso no topo (decisão 0066) e, nas premissas, o TAP revisado (decisão
  // 0068). Na rodada seguinte, só os achados anteriores, o que mudou e as páginas citadas; --completa pede tudo.
  const m = montarPedidoDaSegunda({
    etapa,
    passo: alvo,
    resposta: r.resposta,
    respostaEm: r.em,
    pedidoDoPasso: montarPasso(d, alvo).pedido,
    documentos: documentosDoPasso(d),
    identidade: identidadeDoCaso(d.documentos, d.projeto.nome),
    tapRevisado: tapRevisadoDoPasso(d, alvo),
    guardada: d.segundaInstancia?.[chaveDaSegundaInstancia(etapa, alvo)],
    completa: env.RAIO_X_SEGUNDA_COMPLETA === "sim",
  });
  return {
    sistema: sistemaDaSegundaInstancia(etapa),
    documentos: textoDosDocumentos(m.documentos),
    pedido: m.pedido,
    schema: RespostaSegundaInstancia,
    nota: [
      `- **Rodada ${m.rodada} da segunda instância**${
        m.compacta
          ? `: pedido compacto (decisão 0071), com os achados da rodada anterior, os ${m.itensQueMudaram ?? 0} item(ns) que mudaram e só as páginas citadas (${m.documentos.reduce((n, x) => n + x.paginas.length, 0)}).`
          : m.rodada > 1
            ? ": pedido completo, com os achados da rodada anterior."
            : "."
      }`,
      env.RAIO_X_MODELO_SEGUNDA
        ? `- **Modelo desta rodada (decisão do GP):** ${env.RAIO_X_MODELO_SEGUNDA}. Quem lança o revisor usa este modelo.`
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

/**
 * O TAP revisado só vai na segunda instância das premissas (decisão 0068), com os itens conferidos contra os mesmos
 * documentos da tela do TAP.
 */
function tapRevisadoDoPasso(d: Dossie, alvo: string) {
  if (etapa !== 3 || alvo !== "premissas" || !d.tap) return undefined;
  return montarTapRevisado(d.tap, itensDaEtapa3(d.tap, montarEntradaTap(d, HOJE).documentos));
}

/** Passos de cada etapa, na ordem: o seguinte só sai depois de importar a resposta do anterior. */
const PASSOS: Record<number, string[]> = {
  1: ["leitura-rfp"],
  2: ["estrategia", "conteudo", "eap"],
  3: ["tap", "premissas"],
  4: ["adaptacao", "escopo", "cronograma", "riscos", "planos", "execucao"],
  5: ["leitura"],
};

function precisa(cond: unknown, oQue: string): asserts cond {
  if (!cond) throw new Error(`Antes deste passo: ${oQue}.`);
}

/** Etapa 5: o plano a conferir entra no dossiê como documento "pgp" na exportação (decisão 0037: o mesmo do app). */
function entradaDaConferencia(d: Dossie) {
  const pgp = d.documentos.find((x) => x.papel === "pgp");
  precisa(pgp, "exporte com --plano <arquivo.pdf> (o plano a conferir)");
  // sem TAP em PDF, o TAP da etapa 3 no dossiê (o mesmo que a tela da etapa 5 usa)
  const tap = d.documentos.find((x) => x.papel === "tap") ?? tapDoDossieComoDocumento(d);
  const rfp = d.documentos.find((x) => x.papel === "rfp");
  // como na tela: as partes dispensadas pelo GP na etapa 4 (e as que o plano declara) entram como dispensadas
  const proposta = proporMapa(pgp.paginas, PARTES_PGP);
  const mapa = mapaInicialDaConferencia(proposta, pgp.paginas, PARTES_PGP, d.pgp);
  const caracteristicas = d.pgp?.caracteristicas ?? CARACTERISTICAS_PADRAO;
  const premissasAplicaveis =
    d.pgp?.premissasAplicaveis ?? d.tap?.premissasAplicaveis ?? d.proposta?.premissasAplicaveis ?? {};
  // como na tela: com dispensa declarada só no plano, também os achados que valem se ela não couber (decisão 0052)
  const c = conferirComCandidatos(
    {
      pgp: pgp.paginas,
      tap: tap?.paginas,
      rfp: rfp?.paginas,
      partes: PARTES_PGP,
      premissas: PREMISSAS_CRITICAS,
      mapa,
      caracteristicas,
      premissasAplicaveis,
      requisitos: [],
      // como na tela: o que a autoconferência da etapa 4 marcou "presente" (decisão 0076)
      presentesPelaMarca: presentesPelaMarcaDoDossie(d.pgp),
    },
    proposta,
  );
  return {
    pgp,
    tap,
    rfp,
    mapa,
    caracteristicas,
    premissasAplicaveis,
    achados: c.resultado.achados,
    dispensasCandidatas: c.dispensas,
    condicionais: c.condicionais,
  };
}

function montarPasso(d: Dossie, passo: string = PASSO): Passo {
  if (passo.startsWith("segunda-")) return montarSegunda(d, passo);
  const docs = d.documentos.filter((x) => x.papel === "rfp" || x.papel === "anexo-rfp");
  if (!PASSOS[etapa]?.includes(passo))
    throw new Error(
      `Passo "${passo}" não existe na etapa ${etapa}. Passos: ${PASSOS[etapa]?.join(", ") ?? "—"}.`,
    );
  if (etapa === 2) {
    const ponto = montarPontoDePartida(docs, d.analiseRfp, HOJE);
    // o passo refeito parte só dos passos anteriores, como na tela (decisão 0057)
    const p = propostaAntesDoPasso(
      d.proposta ?? propostaInicial(),
      passo as "estrategia" | "conteudo" | "eap",
    );
    const minuta = montarMinuta(ponto, p, docs, d.analiseRfp);
    const esqueleto = esqueletoEmTexto(minuta);
    // a estratégia leva o checklist inteiro; os passos seguintes, só as premissas críticas confirmadas (decisão 0064)
    const base = {
      sistema: textoDeSistema(
        referenciasEtapa2(passo === "estrategia" ? {} : { pcs: pcsConfirmadas(p.premissasAplicaveis) }),
      ),
      documentos: textoDosDocumentos(docs),
    };
    if (passo === "estrategia")
      return { ...base, pedido: pedidoEstrategia(ponto, esqueleto), schema: SCHEMAS.estrategia };
    const e = p.estrategia?.resposta;
    precisa(e && p.abordagem, "importe a estratégia (a abordagem escolhida vem dela ou de --abordagem)");
    if (passo === "conteudo")
      return {
        ...base,
        pedido: pedidoConteudo(
          ponto,
          e,
          p.abordagem.id,
          p.abordagem.justificativa,
          p.premissasAplicaveis,
          esqueleto,
        ),
        schema: SCHEMAS.conteudo,
      };
    const c = p.conteudo?.resposta;
    precisa(c, "importe o conteúdo");
    return {
      ...base,
      pedido: pedidoEap(
        ponto,
        e,
        p.abordagem.id,
        c,
        esqueleto,
        minuta.tipo.projeto,
        linhaDaProposta(ponto, p, docs, HOJE),
      ),
      schema: SCHEMAS.eap,
    };
  }
  if (etapa === 3) {
    const entrada = montarEntradaTap(d, HOJE);
    precisa(
      entrada.fonte !== "nenhuma",
      "importe a proposta da etapa 2 (ou ponha o PDF da proposta no dossiê)",
    );
    const t = d.tap ?? tapInicial();
    const premissas = t.premissasAplicaveis ?? d.proposta?.premissasAplicaveis ?? {};
    const base = {
      sistema: textoDeSistema(referenciasEtapa3({ pcs: pcsConfirmadas(premissas) })),
      documentos: textoDosDocumentos(entrada.documentos),
    };
    if (passo === "tap")
      return {
        ...base,
        pedido: pedidoTap(
          entrada,
          dadosDosDocumentos(entrada),
          compararRfpEProposta(entrada),
          t.divergencias,
          premissas,
        ),
        schema: SCHEMAS_TAP.tap,
      };
    precisa(t.tap, "importe o TAP");
    return {
      ...base,
      pedido: pedidoPremissas(entrada, t.tap.resposta, premissas, t.revisoes),
      schema: SCHEMAS_TAP.premissas,
    };
  }
  if (etapa === 4) {
    const entrada = montarEntradaPgp(d, HOJE);
    precisa(entrada.fonteTap !== "nenhuma", "importe o TAP da etapa 3 (ou ponha o PDF do TAP no dossiê)");
    const p = d.pgp ?? pgpInicial();
    const anterior = passoAnterior(passo as PassoPgp);
    precisa(!anterior || p[anterior], `importe o passo "${anterior}"`);
    return {
      sistema: textoDeSistema(
        referenciasEtapa4({ pcs: pcsConfirmadas(p.premissasAplicaveis ?? entrada.premissasAnteriores) }),
      ),
      documentos: textoDosDocumentos(entrada.documentos),
      pedido: PEDIDOS_PGP[passo as PassoPgp](entrada, p),
      schema: SCHEMAS_PGP[passo as PassoPgp],
    };
  }
  if (etapa === 5) {
    const c = entradaDaConferencia(d);
    return {
      sistema: textoDeSistema(referenciasEtapa5({ pcs: pcsConfirmadas(c.premissasAplicaveis) })),
      documentos: textoDosDocumentos([c.pgp, ...(c.tap ? [c.tap] : []), ...(c.rfp ? [c.rfp] : [])]),
      pedido: pedidoLeitura({
        partesPresentes: c.mapa.filter((m) => m.situacao === "presente").map((m) => m.codigo),
        caracteristicas: c.caracteristicas,
        premissasAplicaveis: c.premissasAplicaveis,
        achadosDoCodigo: c.achados,
        temTap: Boolean(c.tap),
        temRfp: Boolean(c.rfp),
        dispensasCandidatas: c.dispensasCandidatas,
        condicionais: c.condicionais,
      }),
      schema: RespostaLeitura,
    };
  }
  if (etapa === 1 && passo === "leitura-rfp") {
    const analise = analisarRfp(docs, HOJE);
    const base = d.analiseRfp ?? analiseInicial(analise, HOJE);
    // o pedido parte do esqueleto do código, sem leitura anterior do PMO: como na tela
    const esqueleto = leituraDoDossie(analise, { ...base, leituraPmo: undefined }, docs, HOJE);
    return {
      sistema: textoDeSistema(referenciasEtapa1()),
      documentos: textoDosDocumentos(docs),
      pedido: pedidoLeituraRfp(esqueleto, HOJE),
      schema: RespostaLeituraRfp,
    };
  }
  throw new Error(
    `Etapa ${etapa}, passo "${passo}": ainda não disponível neste script (por ora, etapa 1, passo leitura-rfp).`,
  );
}

describe.skipIf(MODO !== "exportar")("exportar o pedido de um passo do PMO", () => {
  it("grava o pedido (.md) e o dossiê fora do Git", async () => {
    const saida = resolve(env.RAIO_X_SAIDA ?? "../pedidos-raio-x");
    mkdirSync(saida, { recursive: true });
    let dossie: Dossie;
    if (env.RAIO_X_DOSSIE && existsSync(env.RAIO_X_DOSSIE)) {
      const r = lerDossie(readFileSync(env.RAIO_X_DOSSIE, "utf8"), env.RAIO_X_DOSSIE);
      if (!r.ok) throw new Error(r.erro);
      dossie = r.dossie;
    } else {
      const rfp = await lerRfp(env.RAIO_X_RFP ?? "");
      dossie = { ...criarDossieVazio(HOJE), documentos: [rfp] };
      if (etapa === 1) dossie = { ...dossie, analiseRfp: analiseInicial(analisarRfp([rfp], HOJE), HOJE) };
    }
    // decisão do GP: a modalidade, quando o documento não a diz (--modalidade; decisão 0054), guardada no dossiê
    if (env.RAIO_X_MODALIDADE && dossie.analiseRfp) {
      const m = env.RAIO_X_MODALIDADE as "licitacao" | "contratacao-direta" | "parceria";
      if (!["licitacao", "contratacao-direta", "parceria"].includes(m))
        throw new Error("--modalidade deve ser licitacao, contratacao-direta ou parceria.");
      dossie = { ...dossie, analiseRfp: { ...dossie.analiseRfp, modalidade: m } };
      if (env.RAIO_X_DOSSIE) writeFileSync(env.RAIO_X_DOSSIE, serializarDossie(dossie, HOJE));
    }
    // decisões do GP para as etapas 4 e 5: --porte, --caracteristicas ("campo=não,beneficiarios=não"; decisão 0069)
    // e --pcs ("PC1,PC3,PC4"), guardadas no dossiê para a importação usar as mesmas; sem elas, valem as do dossiê.
    if (env.RAIO_X_PORTE || env.RAIO_X_PCS || env.RAIO_X_CARACTERISTICAS) {
      const atual = dossie.pgp ?? pgpInicial();
      const porte = env.RAIO_X_PORTE ? lerCaracteristicas(`porte=${env.RAIO_X_PORTE}`).porte : undefined;
      const corrigidas = env.RAIO_X_CARACTERISTICAS ? lerCaracteristicas(env.RAIO_X_CARACTERISTICAS) : {};
      // só --pcs não mexe nas características. Com porte ou características, a base é refeita a cada exportação: na
      // etapa 4, a sugestão do código de agora (ela muda com a adaptação), como a tela; na 5, as do dossiê ou o
      // padrão conservador, como a tela da conferência
      const caracteristicas =
        porte || env.RAIO_X_CARACTERISTICAS
          ? {
              ...(etapa === 4 ? sugestaoDoCodigo(dossie) : (atual.caracteristicas ?? CARACTERISTICAS_PADRAO)),
              ...corrigidas,
              ...(porte ? { porte } : {}),
            }
          : atual.caracteristicas;
      dossie = {
        ...dossie,
        pgp: {
          ...atual,
          caracteristicas,
          premissasAplicaveis: env.RAIO_X_PCS
            ? Object.fromEntries(env.RAIO_X_PCS.split(",").map((x) => [x.trim().toUpperCase(), true]))
            : atual.premissasAplicaveis,
        },
      };
      // guardadas também no dossiê de origem: as exportações e importações seguintes usam as mesmas sem repetir
      if (env.RAIO_X_DOSSIE && existsSync(env.RAIO_X_DOSSIE))
        writeFileSync(env.RAIO_X_DOSSIE, serializarDossie(dossie, HOJE));
    }
    // etapa 5: o plano a conferir (o PGP da etapa 4 exportado em PDF, ou outro) entra no dossiê como "pgp"
    // --plano dossie: o PGP inteiro montado pelo app a partir do dossiê (uma página por parte, como na
    // autoconferência da etapa 4); o arquivo vai em DOCX para a leitura (o PDF depende do navegador)
    if (etapa === 5 && env.RAIO_X_PLANO === "dossie") {
      if (!dossie.pgp) throw new Error("--plano dossie pede o PGP da etapa 4 no dossiê.");
      const { gerarDocx } = await import("../../src/exportacao/docx");
      const logo = readFileSync(new URL("../../src/interface/ativos/logo-fgv-projetos.jpg", import.meta.url));
      const docx = await gerarDocx(
        montarPgp(dossie, HOJE),
        logo.buffer.slice(logo.byteOffset, logo.byteOffset + logo.byteLength),
      );
      const baseRfp = basename(
        dossie.documentos.find((x) => x.papel === "rfp")?.nomeArquivo ?? "rfp",
        ".pdf",
      );
      writeFileSync(join(saida, `pgp-${baseRfp}.docx`), Buffer.from(await docx.arrayBuffer()));
      const plano = pgpComoDocumento(dossie, HOJE);
      dossie = { ...dossie, documentos: [...dossie.documentos.filter((x) => x.papel !== "pgp"), plano] };
    } else if (etapa === 5 && env.RAIO_X_PLANO) {
      const plano = await lerPdf(resolve(env.RAIO_X_PLANO), "pgp", HOJE);
      dossie = { ...dossie, documentos: [...dossie.documentos.filter((x) => x.papel !== "pgp"), plano] };
    }
    const p = montarPasso(dossie);
    const schema = zodOutputFormat(p.schema).schema;
    const tokens = estimarTokens(p.sistema) + estimarTokens(p.documentos) + estimarTokens(p.pedido);
    const base = basename(dossie.documentos.find((x) => x.papel === "rfp")?.nomeArquivo ?? "rfp", ".pdf");
    const nome = `etapa-${etapa}-${passo}-${base}`;
    const md = `# Pedido ao PMO — etapa ${etapa}, passo ${passo}

- RFP: ${base}.pdf${
      etapa >= 4
        ? `
- **Características do projeto usadas:** ${Object.entries(
            // etapa 4: as do GP ou a sugestão do código, como a tela; etapa 5: as do GP ou o padrão, como a conferência
            dossie.pgp?.caracteristicas ?? (etapa === 4 ? sugestaoDoCodigo(dossie) : CARACTERISTICAS_PADRAO),
          )
            .map(([k, x]) => `${k} ${String(x)}`)
            .join("; ")}${
            dossie.pgp?.caracteristicas
              ? ""
              : etapa === 4
                ? " (sugestão do código: corrija com --porte e --caracteristicas)"
                : " (padrão conservador: corrija com --porte e --caracteristicas)"
          }
- **Premissas críticas que se aplicam:** ${
            Object.entries(
              dossie.pgp?.premissasAplicaveis ??
                dossie.tap?.premissasAplicaveis ??
                dossie.proposta?.premissasAplicaveis ??
                {},
            )
              .filter(([, x]) => x)
              .map(([k]) => k)
              .join(", ") || "nenhuma (passe --pcs)"
          }`
        : ""
    }
${p.nota ? `${p.nota}\n` : ""}- Gerado em ${HOJE.toLocaleString("pt-BR")} pelo app (npm run exportar-pedido), com exatamente o que iria à API.
- **Estimativa: cerca de ${tokens.toLocaleString("pt-BR")} tokens de entrada** (4 caracteres por token; sistema ${estimarTokens(p.sistema).toLocaleString("pt-BR")}, documentos ${estimarTokens(p.documentos).toLocaleString("pt-BR")}, pedido ${estimarTokens(p.pedido).toLocaleString("pt-BR")}).

## Como usar no claude.ai
1. Cole o bloco "Texto de sistema" como instrução do projeto (ou no início da conversa).
2. Cole a "Mensagem do usuário" (o texto dos PDFs e o pedido, nesta ordem).
3. Peça que a resposta seja **só o objeto JSON**, no schema do fim. Salve a resposta num arquivo .json.
4. Importe: \`npm run importar-resposta -- --etapa ${etapa} --passo ${passo} --arquivo <resposta.json> --dossie "${join(saida, `${nome}.dossie.json`)}"\`

O gabarito do Claude Code não está neste pedido: a leitura tem de ser independente.

## Texto de sistema
\`\`\`\`text
${p.sistema}
\`\`\`\`

## Mensagem do usuário
\`\`\`\`text
${p.documentos}

${p.pedido}
\`\`\`\`

## Schema JSON da resposta
\`\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\`\`
`;
    // o que foi dentro do pedido, contra a tabela da seção 5 da SKILL.md: com FALTA, o pedido não sai
    const conteudo = conteudoDoPedido({
      etapa,
      passo,
      sistema: p.sistema,
      documentos: p.documentos,
      pedido: p.pedido,
      schema: JSON.stringify(schema),
      skill: readFileSync(".claude/skills/pmo/SKILL.md", "utf8"),
    });
    writeFileSync(join(saida, `${nome}.conteudo.md`), conteudo.texto);
    if (conteudo.faltas.length)
      throw new Error(
        `FALTA no pedido (${conteudo.faltas.join("; ")}): veja ${join(saida, `${nome}.conteudo.md`)}. O pedido não foi exportado.`,
      );
    writeFileSync(join(saida, `${nome}.md`), md);
    writeFileSync(join(saida, `${nome}.dossie.json`), serializarDossie(dossie, HOJE));
    console.log(
      `Pedido: ${join(saida, `${nome}.md`)}\nDossiê: ${join(saida, `${nome}.dossie.json`)}\nTokens de entrada: cerca de ${tokens}`,
    );
    expect(md.length).toBeGreaterThan(1000);
  }, 120_000);
});

const normal = (t: string) => tirarAcentos(t).toLowerCase().replace(/\s+/g, " ");

/** Todas as fontes citadas numa resposta do PMO, onde quer que estejam (itens, partes, riscos). */
function coletarFontes(x: unknown): FontePmo[] {
  if (Array.isArray(x)) return x.flatMap(coletarFontes);
  if (!x || typeof x !== "object") return [];
  const o = x as Record<string, unknown>;
  const aqui =
    typeof o.trecho === "string" && typeof o.pagina === "number" && typeof o.doc === "string"
      ? [o as FontePmo]
      : [];
  return [...aqui, ...Object.values(o).flatMap(coletarFontes)];
}

describe.skipIf(MODO !== "importar")("importar a resposta do PMO (leitura independente)", () => {
  it("valida, grava no dossiê, roda as travas e mede contra o gabarito", async () => {
    const arqDossie = env.RAIO_X_DOSSIE ?? "";
    const r = lerDossie(readFileSync(arqDossie, "utf8"), arqDossie);
    if (!r.ok) throw new Error(r.erro);
    let dossie = r.dossie;
    const p = montarPasso(dossie);
    const bruto = readFileSync(env.RAIO_X_ARQUIVO ?? "", "utf8")
      .replace(/^\uFEFF/, "")
      .trim();
    // aceita a resposta com a cerca de código ```json … ``` que o claude.ai costuma pôr em volta
    const json = bruto.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    const v = p.schema.safeParse(JSON.parse(json));
    if (!v.success) {
      const erros = v.error.issues.slice(0, 15).map((i) => `- ${i.path.join(".")}: ${i.message}`);
      console.log(`A resposta não segue o schema do passo:\n${erros.join("\n")}`);
      throw new Error("resposta fora do schema");
    }
    if (passo.startsWith("segunda-") && etapa === 5) {
      // segunda instância leve (decisão 0077): guarda a revisão no dossiê e grava conferencia-etapa-5-leitura-*.md
      const leitura = dossie.conferencia?.leituraPmo;
      precisa(leitura, "importe a leitura da etapa 5 antes da segunda instância");
      // a revisão vale para a leitura que foi no pedido: com outra leitura no dossiê, ela não se aplica
      const pedidoExportado = join(
        dirname(resolve(env.RAIO_X_ARQUIVO ?? "")),
        `etapa-5-${passo}-${basename(dossie.documentos.find((x) => x.papel === "rfp")?.nomeArquivo ?? "rfp", ".pdf")}.md`,
      );
      const daLeitura = existsSync(pedidoExportado)
        ? /- Leitura conferida: (\S+)/.exec(readFileSync(pedidoExportado, "utf8"))?.[1]
        : undefined;
      precisa(
        !daLeitura || daLeitura === leitura.em,
        `a leitura do PMO mudou depois do pedido da segunda instância (pedido: ${daLeitura}; dossiê: ${leitura.em}): exporte a segunda instância de novo`,
      );
      const resposta = v.data as z.infer<typeof RespostaSegundaEtapa5>;
      dossie = {
        ...dossie,
        conferencia: {
          ...dossie.conferencia!,
          segundaLeve: {
            resposta,
            modelo: "claude.ai (segunda instância leve)",
            em: HOJE.toISOString(),
            deLeitura: leitura.em,
          },
        },
      };
      writeFileSync(arqDossie, serializarDossie(dossie, HOJE));
      const c = entradaDaConferencia(dossie);
      const vd = conferirVereditos(leitura.resposta, c.achados, c.condicionais, c.mapa, [
        c.pgp,
        ...(c.tap ? [c.tap] : []),
        ...(c.rfp ? [c.rfp] : []),
      ]);
      const base = basename(dossie.documentos.find((x) => x.papel === "rfp")?.nomeArquivo ?? "rfp", ".pdf");
      const arq = join(dirname(resolve(env.RAIO_X_ARQUIVO ?? "")), `conferencia-etapa-5-leitura-${base}.md`);
      writeFileSync(
        arq,
        `${segundaEtapa5EmTexto(resposta, vd, leitura.resposta, [c.pgp, ...(c.tap ? [c.tap] : []), ...(c.rfp ? [c.rfp] : [])])}\n\n${tokensDoPedidoExportado(5, passo, base)}\n`,
      );
      console.log(`Conferência: ${arq}`);
      return;
    }
    if (passo.startsWith("segunda-")) {
      // segunda instância (decisão 0057): guarda no dossiê e grava conferencia-*.md ao lado da resposta
      const alvo = alvoDaSegunda(passo);
      const r = respostaDoPasso(dossie, alvo)!;
      const resposta = v.data as z.infer<typeof RespostaSegundaInstancia>;
      const chave = chaveDaSegundaInstancia(etapa, alvo);
      // nas premissas, a versão do TAP revisado que foi no pedido (decisão 0068): a do pedido exportado, ao lado da
      // resposta; sem ele, a do dossiê agora
      const baseDoPedido = basename(
        dossie.documentos.find((x) => x.papel === "rfp")?.nomeArquivo ?? "rfp",
        ".pdf",
      );
      const pedidoExportado = join(
        dirname(resolve(env.RAIO_X_ARQUIVO ?? "")),
        `etapa-${etapa}-${passo}-${baseDoPedido}.md`,
      );
      const versaoNoPedido = existsSync(pedidoExportado)
        ? lerVersaoDoTapNoPedido(readFileSync(pedidoExportado, "utf8"))
        : undefined;
      const versaoAgora = tapRevisadoDoPasso(dossie, alvo)?.versao;
      if (versaoAgora && !versaoNoPedido)
        console.warn(
          `Aviso: não achei o pedido exportado (${pedidoExportado}) ao lado da resposta; a conferência fica com o TAP revisado do dossiê agora, que pode não ser o que o revisor recebeu.`,
        );
      const versaoDoTap = versaoNoPedido ?? versaoAgora;
      const rodada = proximaRodada(dossie.segundaInstancia?.[chave], r.em, versaoDoTap);
      dossie = {
        ...dossie,
        segundaInstancia: {
          ...dossie.segundaInstancia,
          [chave]: {
            resposta,
            modelo: "claude.ai (segunda instância)",
            em: HOJE.toISOString(),
            deResposta: r.em,
            // a resposta que esta conferência leu: a rodada seguinte manda só o que mudou (decisão 0071)
            conferiu: r.resposta,
            ...(versaoDoTap ? { deAnterior: versaoDoTap } : {}),
            rodada,
          },
        },
      };
      writeFileSync(arqDossie, serializarDossie(dossie, HOJE));
      const res = conferirSegundaInstancia(resposta, documentosDoPasso(dossie));
      const base = basename(dossie.documentos.find((x) => x.papel === "rfp")?.nomeArquivo ?? "rfp", ".pdf");
      const arq = join(
        dirname(resolve(env.RAIO_X_ARQUIVO ?? "")),
        `conferencia-etapa-${etapa}-${alvo}-${base}.md`,
      );
      writeFileSync(
        arq,
        `${segundaInstanciaEmTexto(etapa, alvo, res, rodada)}\n\n${tokensDoPedidoExportado(etapa, passo, base)}\n`,
      );
      console.log(
        `Conferência: ${arq}\nRodada ${rodada}. Achados: ${res.achados.length}; de gravidade alta: ${res.altas}`,
      );
      expect(res.achados.length).toBeGreaterThanOrEqual(0);
      return;
    }
    const linhas: string[] = [];
    if (etapa === 1) {
      const docs = dossie.documentos.filter((x) => x.papel === "rfp" || x.papel === "anexo-rfp");
      const analise = analisarRfp(docs, HOJE);
      const base = dossie.analiseRfp ?? analiseInicial(analise, HOJE);
      const salva = {
        ...base,
        leituraPmo: {
          resposta: v.data as z.infer<typeof RespostaLeituraRfp>,
          modelo: "claude.ai (leitura independente)",
          em: HOJE.toISOString(),
        },
      };
      dossie = { ...dossie, analiseRfp: salva };
      const leitura = leituraDoDossie(analise, salva, docs, HOJE);
      const doPmo = leitura.itens.filter((i) => i.doPmo);
      const travados = doPmo.filter((i) => i.trava);
      linhas.push(
        `# Leitura independente — etapa 1, ${basename(docs[0]?.nomeArquivo ?? "")}`,
        "",
        `Resposta importada em ${HOJE.toLocaleString("pt-BR")}. Itens do PMO: ${doPmo.length}; com aviso das travas do código: ${travados.length}.`,
        "",
        "## Avisos das travas, um por um",
        ...(travados.length
          ? travados.map(
              (i) =>
                `- ${NOME_TRAVA[i.trava!]} · ${i.secao} · ${i.nome}: ${i.texto.slice(0, 200)}${i.origem ? ` (p. ${i.origem.pagina})` : ""}`,
            )
          : ["- nenhum"]),
        "",
        "## Avisos que não contam como erro (citação a conferir, decisão 0058)",
        ...(doPmo.some((i) => i.aviso)
          ? doPmo
              .filter((i) => i.aviso)
              .map(
                (i) =>
                  `- ${NOME_AVISO[i.aviso!]} · ${i.secao} · ${i.nome}: ${i.texto.slice(0, 200)}${i.origem ? ` (p. ${i.origem.pagina})` : ""}`,
              )
          : ["- nenhum"]),
      );
      // cruzamentos X1 a X6 e autoconferência das 8 seções (decisões 0044 e 0046)
      const resposta = v.data as z.infer<typeof RespostaLeituraRfp>;
      const auto = autoconferenciaDaLeitura(resposta);
      linhas.push(
        "",
        `## Cruzamentos (decisão 0046): ${resposta.cruzamentos.length} de 6 registrados${auto.cruzamentosSemRegistro.length ? `; sem registro: ${auto.cruzamentosSemRegistro.join(", ")}` : ""}`,
        ...resposta.cruzamentos.map(
          (c) =>
            `- ${c.codigo} · ${c.estado}: ${c.resultado.slice(0, 220)}${c.itens.length ? ` (itens: ${c.itens.join(", ")})` : ""}`,
        ),
        "",
        `## Autoconferência das 8 seções (decisão 0044): ${auto.ok ? "completa" : "com falha"}`,
        `- sem marca: ${auto.semMarca.join(", ") || "nenhuma"}`,
        `- marca incompleta: ${auto.incompletas.join(", ") || "nenhuma"}`,
      );
      const pasta = GABARITOS[basename(docs[0]?.nomeArquivo ?? "")];
      if (pasta) {
        const g = JSON.parse(
          readFileSync(
            new URL(`../fixtures/gerados/${pasta}/gabarito-metodo-etapa-1.json`, import.meta.url),
            "utf8",
          ),
        ) as { secoes: Record<string, { id: string; nome: string; chaves: string[] }[]> };
        const textos = leitura.itens.map((i) => ({
          secao: i.secao,
          doPmo: Boolean(i.doPmo),
          texto: normal(
            [
              i.nome,
              i.texto,
              i.origem?.trecho ?? "",
              i.pergunta ?? "",
              ...(i.tabela?.linhas.flat() ?? []),
            ].join(" "),
          ),
        }));
        const casa = (chaves: string[], t: string) =>
          chaves.filter((c) => new RegExp(c).test(t)).length >= Math.ceil(chaves.length / 2);
        const todos = Object.entries(g.secoes).flatMap(([s, itens]) =>
          itens.map((i) => ({ ...i, secao: s })),
        );
        const cobertos = todos.filter((gi) => textos.some((t) => casa(gi.chaves, t.texto)));
        const pmoCobre = todos.filter((gi) => textos.some((t) => t.doPmo && casa(gi.chaves, t.texto)));
        const naoPassam = textos.filter((t) => t.doPmo && !todos.some((gi) => casa(gi.chaves, t.texto)));
        linhas.push(
          "",
          "## Placar contra o gabarito do Claude Code (leitura independente)",
          "",
          "O gabarito foi feito pelo Claude Code seguindo a skill; esta leitura foi feita fora do app, sem o gabarito no pedido.",
          "",
          `- Gabarito coberto pela leitura completa (esqueleto + PMO): ${cobertos.length} de ${todos.length}`,
          `- Gabarito coberto por itens do PMO: ${pmoCobre.length} de ${todos.length}`,
          `- Itens do PMO que não casam com o gabarito: ${naoPassam.length} de ${doPmo.length}`,
          "",
          "Por seção (gabarito / coberto):",
          ...Object.entries(g.secoes).map(
            ([s, itens]) =>
              `- ${s}: ${itens.length} / ${itens.filter((gi) => cobertos.includes({ ...gi, secao: s } as never) || textos.some((t) => casa(gi.chaves, t.texto))).length}`,
          ),
          "",
          "Faltam:",
          ...todos.filter((gi) => !cobertos.includes(gi)).map((gi) => `- ${gi.secao} · ${gi.id} ${gi.nome}`),
        );
      }
    }
    if (etapa >= 2) {
      let decisaoGp = "";
      const guardada = {
        resposta: v.data,
        modelo: "claude.ai (leitura independente)",
        em: HOJE.toISOString(),
      };
      if (etapa === 2) {
        const atual = dossie.proposta ?? propostaInicial();
        // o passo refeito descarta as respostas dos passos seguintes, que dependiam dele (decisão 0057)
        let proposta = {
          ...propostaAntesDoPasso(atual, passo as "estrategia" | "conteudo" | "eap"),
          [passo]: guardada,
        } as typeof atual;
        if (passo === "estrategia") {
          // decisões do GP com o padrão do teste: --abordagem, ou a primeira sugerida; --pcs, ou só as PC que o PMO
          // marcou "sim" (a "a confirmar" é decisão do GP: sem --pcs, não vira confirmada)
          const e = v.data as z.infer<typeof SCHEMAS.estrategia>;
          const id = env.RAIO_X_ABORDAGEM || e.abordagens[0]?.id;
          proposta = {
            ...proposta,
            abordagem: id
              ? { id, justificativa: "Escolhida para o teste externo (decisão do GP simulada)." }
              : undefined,
            premissasAplicaveis: env.RAIO_X_PCS
              ? Object.fromEntries(env.RAIO_X_PCS.split(",").map((x) => [x.trim().toUpperCase(), true]))
              : Object.fromEntries(
                  e.premissasCriticas.filter((x) => x.aplica === "sim").map((x) => [x.codigo, true]),
                ),
          };
          decisaoGp = `Abordagem para os passos seguintes: ${id ?? "nenhuma"} (troque com --abordagem).`;
        }
        dossie = { ...dossie, proposta };
      }
      if (etapa === 3)
        dossie = {
          ...dossie,
          tap: {
            ...(dossie.tap ?? tapInicial()),
            ...(passo === "tap" ? { premissas: undefined } : {}),
            [passo]: guardada,
          },
        };
      if (etapa === 4) {
        let pgp = {
          ...pgpAntesDoPasso(dossie.pgp ?? pgpInicial(), passo as PassoPgp),
          [passo]: guardada,
        } as PgpDossie;
        if (passo === "adaptacao") {
          // decisão do GP com o padrão do teste: --gerar "A1,A3,…", ou tudo o que o PMO não marcou como dispensável
          const a = v.data as z.infer<typeof SCHEMAS_PGP.adaptacao>;
          const escolhidas = env.RAIO_X_GERAR
            ? new Set(env.RAIO_X_GERAR.split(",").map((x) => x.trim()))
            : undefined;
          pgp = {
            ...pgp,
            abordagem: a.abordagem,
            gerar: Object.fromEntries(
              a.partes.map((s) => [
                s.codigo,
                escolhidas ? escolhidas.has(s.codigo) : s.recomendacao !== "dispensavel",
              ]),
            ),
          };
        }
        dossie = { ...dossie, pgp };
      }
      // as citações são procuradas nos documentos que foram no pedido: na etapa 3 e na 4, a proposta e o TAP do
      // dossiê entram como documentos montados pelo app; na 5, o plano conferido
      const docsDoPedido =
        etapa === 3
          ? montarEntradaTap(dossie, HOJE).documentos
          : etapa === 4
            ? montarEntradaPgp(dossie, HOJE).documentos
            : dossie.documentos;
      const fontes = coletarFontes(v.data);
      const citacoes = fontes.map((f) => ({ f, c: conferirCitacao(f, docsDoPedido) }));
      const naoAchadas = citacoes.filter((x) => !citacaoValeComoFato(x.c));
      const fracas = citacoes.filter((x) => citacaoValeComoFato(x.c) && citacaoEhFraca(x.f.trecho));
      linhas.push(
        `# Leitura independente — etapa ${etapa}, passo ${passo}`,
        "",
        `Resposta importada em ${HOJE.toLocaleString("pt-BR")}. Citações: ${fontes.length}; não achadas na página: ${naoAchadas.length}; fracas (menos de 6 palavras): ${fracas.length}.`,
        ...(decisaoGp ? ["", decisaoGp] : []),
        ...naoAchadas
          .slice(0, 20)
          .map((x) => `- não achada · p. ${x.f.pagina}: "${x.f.trecho.slice(0, 120)}"`),
      );
      const marcas = (v.data as { autoconferencia?: ItemAutoconferencia[] }).autoconferencia ?? [];
      if (etapa === 4) {
        const esperados = PARTES_PGP.filter(
          (x) =>
            dossie.pgp?.gerar[x.codigo] &&
            PASSOS_PGP.find((y) => y.passo === passo)?.textos.includes(x.codigo),
        ).flatMap((x) => x.itens.map((i) => i.codigo));
        const r = conferirAutoconferencia(esperados, marcas);
        linhas.push(
          "",
          `## Autoconferência (decisão 0044): ${r.ok ? "completa" : "com falha"}`,
          `- itens esperados: ${esperados.length}; marcados: ${marcas.length}`,
          `- sem marca: ${r.semMarca.join(", ") || "nenhum"}`,
          `- marca incompleta: ${r.incompletas.join(", ") || "nenhuma"}`,
          `- partes que voltariam ao PMO: ${partesARegenerar(r).join(", ") || "nenhuma"}`,
        );
      } else if (etapa < 5) {
        // etapas 2 e 3: os itens esperados são os das fichas que o pedido do passo manda
        const FICHAS_DO_PASSO: Record<string, string[]> = {
          "2:estrategia": ["PROP-ESTRATEGIA."],
          "2:conteudo": ["PROP-ESTRUTURA.", "PROP-ENTENDIMENTO.", "PROP-METODOLOGIA.", "PROP-SOW."],
          "2:eap": ["PROP-EAP.", "PROP-EQUIPE.", "PROP-PRECO."],
        };
        const prefixos = FICHAS_DO_PASSO[`${etapa}:${passo}`];
        // etapa 3: os itens de cada passo vêm do mesmo lugar que o app usa (o TAP não cobra o registro, e vice-versa)
        const doPasso3 = etapa === 3 && (passo === "tap" || passo === "premissas");
        const prefixo = doPasso3 ? passo : prefixos?.join(", ");
        const esperados = doPasso3
          ? itensEsperadosDaEtapa3(passo)
          : prefixos
            ? FICHAS.flatMap((x) => x.itens.map((i) => i.codigo)).filter((c) =>
                prefixos.some((pr) => c.startsWith(pr)),
              )
            : [];
        const r = conferirAutoconferencia(esperados, marcas);
        linhas.push(
          "",
          `## Autoconferência (decisão 0044): ${marcas.length} item(ns) marcados${prefixo ? ` de ${esperados.length} esperados (${r.ok ? "completa" : "com falha"})` : ""}`,
          ...(prefixo
            ? [
                `- sem marca: ${r.semMarca.join(", ") || "nenhum"}`,
                `- marca incompleta: ${r.incompletas.join(", ") || "nenhuma"}`,
              ]
            : marcas.map((m) => `- ${m.item}: ${m.estado}`)),
        );
      }
      if (fracas.length)
        linhas.push("", "## Citações fracas", ...fracas.map((x) => `- p. ${x.f.pagina}: "${x.f.trecho}"`));
      if (etapa === 2 && passo !== "estrategia" && dossie.proposta) {
        // o que o código conferiu com o conteúdo e a EAP: duração × vigência, cronograma, equipe, preço e pendências
        const docsRfp = dossie.documentos.filter((x) => x.papel === "rfp" || x.papel === "anexo-rfp");
        const minuta = montarMinuta(
          montarPontoDePartida(docsRfp, dossie.analiseRfp, HOJE),
          dossie.proposta,
          docsRfp,
          dossie.analiseRfp,
        );
        const conferido = esqueletoEmTexto(minuta)
          .split("\n")
          .filter((l) => /^- \[(?:metas-equipe|preco|escopo|decisoes)\]/.test(l));
        linhas.push("", "## O que o código conferiu (esqueleto)", ...conferido.map((l) => l.slice(0, 400)));
        if (passo === "eap") {
          const eap = dossie.proposta.eap?.resposta;
          // início: o do GP, se ele informou; senão, a data fixa de início do documento (o GP confirma)
          const doGp = dossie.proposta.parametros.inicio;
          const fixo = inicioFixo(analisarRfp(docsRfp, HOJE).documentos);
          const inicio = doGp ? new Date(`${doGp}T00:00:00`) : fixo?.data;
          const cron = eap
            ? calcularCronograma(eap.atividades, {
                inicio,
                aprovacaoDias: dossie.proposta.parametros.aprovacaoDias,
                hoje: HOJE,
              })
            : undefined;
          if (cron)
            linhas.push(
              "",
              `## Cronograma (conta do código, sem a aprovação do cliente se o GP não a informou): ${cron.total} dias úteis; caminho crítico: ${cron.caminhoCritico.join(" → ") || "—"}`,
              `- início usado: ${inicio ? `${inicio.toLocaleDateString("pt-BR")} (${doGp ? "decisão do GP" : `data fixa do documento, p. ${fixo?.origem.pagina}; o GP confirma`})` : "nenhum (sem datas)"}${cron.dataFim ? `; fim: ${cron.dataFim.toLocaleDateString("pt-BR")}` : ""}`,
              ...cron.atividades
                .filter((a) => eap?.atividades.find((x) => x.id === a.id)?.restricaoData)
                .map(
                  (a) =>
                    `- ${a.id} (data fixa): ${a.dataInicio?.toLocaleDateString("pt-BR") ?? "—"} a ${a.dataFim?.toLocaleDateString("pt-BR") ?? "—"}, ${a.duracao} dias úteis, folga ${a.folga}`,
                ),
              ...cron.problemas.map((x) => `- ${x}`),
            );
        }
      }
      if (etapa === 4 && dossie.pgp) {
        // régua corrigida num passo que não chegou às partes geradas antes (decisão 0078)
        const mudaram = reguasQueMudaram(dossie.pgp);
        linhas.push(
          "",
          `## Réguas que mudaram entre os passos (aviso): ${mudaram.length || "nenhuma"}`,
          ...mudaram.map((r) => `- ${reguaQueMudouEmTexto(r)}`),
        );
      }
      if (etapa === 4 && passo === "cronograma" && dossie.pgp?.cronograma) {
        // as contas do código do passo: início, rede com a data fixa, RACI, horas e o pacote de cada atividade
        const ep = montarEntradaPgp(dossie, HOJE);
        const cr = dossie.pgp.cronograma.resposta;
        const crono = cronogramaDoPgp(dossie.pgp, ep)!;
        const { inicio, doDocumento } = inicioDoPgp(dossie.pgp, ep);
        const custos = custosDoPgp(dossie.pgp, ep)!;
        const pacotes = dossie.pgp.escopo?.resposta.eap ?? [];
        const dataBr = (d?: Date) => d?.toLocaleDateString("pt-BR") ?? "—";
        linhas.push(
          "",
          "## Cronograma pelo código",
          `- início: ${inicio ? `${dataBr(inicio)}${doDocumento ? ` (data do documento, ${doDocumento}, a confirmar pelo GP)` : " (do GP)"}` : "a definir pelo GP"}`,
          `- total: ${crono.total} dias úteis, fim em ${dataBr(crono.dataFim)}; caminho crítico: ${crono.caminhoCritico.join(" → ")}`,
          `- ${crono.conferenciaPrazo.texto}`,
          ...crono.problemas.map((x) => `- ${x}`),
          ...crono.datasFixas.map(
            (f) =>
              `- data fixa ${f.atividade}: ${dataBr(f.inicio)} a ${dataBr(f.fim)} (${f.diasCorridos} dias corridos); predecessoras até ${dataBr(f.fimPredecessoras)}; folga ${f.folgaCorrida ?? "—"} dia(s) corrido(s); ${f.vencida ? `NÃO CONFIRMÁVEL: a data já passou (a conta ${f.cabe ? "caberia" : "não caberia"}, só como intervalo)` : f.cabe ? "cabe" : "NÃO CABE"}`,
          ),
          "",
          "| Atividade | Pacote | Duração | Início | Fim | Folga | Crítica |",
          "|---|---|---|---|---|---|---|",
          ...crono.atividades.map((a) => {
            const ref = cr.atividades.find((x) => x.id === a.id)?.pacote.trim() ?? "";
            const pac = pacotes.find((x) => x.id === ref);
            const pacote = !ref
              ? "sem pacote"
              : !pac
                ? `${ref}: não existe na EAP`
                : `${ref} (${pac.produto})`;
            return `| ${a.id} ${a.nome.slice(0, 50)} | ${pacote} | ${a.duracao} | ${dataBr(a.dataInicio)} | ${dataBr(a.dataFim)} | ${a.folga} | ${a.critica ? "sim" : ""} |`;
          }),
          "",
          "## Pacotes pelo código",
          ...(conferirPacotes(dossie.pgp).map((x) => `- ${x}`).length
            ? conferirPacotes(dossie.pgp).map((x) => `- ${x}`)
            : ["- toda atividade com pacote existente do mesmo produto; todo pacote com atividade"]),
          "",
          "## RACI pelo código",
          ...(conferirRaci(cr).length
            ? conferirRaci(cr).map((x) => `- ${x}`)
            : ["- um só A por atividade; toda atividade com A; perfis da equipe na lista"]),
          ...contratanteNaRaci(cr).map((x) => `- contratante (fora da equipe) — ${x}`),
          "",
          "## Horas e custos pelo código",
          ...custos.preco.linhas.map((l) => `- ${l.perfil.id} ${l.perfil.nome}: ${textoDasHoras(l)} h`),
          `- total: ${textoDasHorasTotais(custos.preco)} h; pessoal: ${custos.preco.pessoal ?? "a definir pelo GP"}`,
          `- falta: ${custos.faltando.join("; ")}`,
        );
      }
      if (etapa === 4 && ["riscos", "planos", "execucao"].includes(passo) && dossie.pgp?.riscos) {
        // premissas críticas nos três lugares (regras da etapa 5 sobre o plano gerado), contingência e registro inicial
        const ep = montarEntradaPgp(dossie, HOJE);
        const r = dossie.pgp.riscos.resposta;
        const auto = autoconferir(dossie, ep, HOJE);
        const custos = custosDoPgp(dossie.pgp, ep);
        const pcs = Object.entries(dossie.pgp.premissasAplicaveis ?? ep.premissasAnteriores)
          .filter(([, x]) => x)
          .map(([pc]) => pc)
          .sort();
        const repetidas = r.premissas.filter((x) => repeteORegistroInicial(x, ep.premissasTap));
        // com outras palavras (lição 154): aviso, o PMO e o GP conferem o sentido
        const parecidas = r.premissas.flatMap((x) => {
          const p = pareceRepetirORegistroInicial(x, ep.premissasTap);
          return p
            ? [`${x.item.id} ≈ ${p.linha.item.id} (${Math.round(p.parcela * 100)}% das palavras-chave)`]
            : [];
        });
        linhas.push(
          "",
          "## Autoconferência do plano (regras da etapa 5)",
          `- achados: ${auto.achados.length} (${["vago", "conflituoso", "ausente"].map((t) => `${t} ${auto.achados.filter((a) => a.tipo === t).length}`).join(", ")})`,
          ...auto.achados
            .slice(0, 10)
            .map(
              (a) =>
                `  - ${a.tipo} · ${a.parte} · ${a.titulo}: ${a.evidencias.map((x) => `${x.rotulo} "${x.trecho.slice(0, 160)}"`).join(" × ")}`,
            ),
          `- presentes pela marca do PMO, redação a conferir: ${auto.verificacoes.find((v) => v.id === "presentes-pela-marca-do-pmo")?.detalhe ?? "nenhum"}`,
          `- decisões do GP pendentes: ${auto.verificacoes.find((v) => v.id === "decisoes-do-gp-pendentes")?.detalhe ?? "nenhuma"}`,
          "",
          "## Premissas críticas pelo código (B3, B27 e A8)",
          `- registro inicial da etapa 3: ${ep.premissasTap.length ? `${ep.premissasTap.length} linha(s)` : "não gerado (o passo de premissas da etapa 3 ainda não foi pedido)"}`,
          ...pcs.map((pc) => {
            const premissa = r.premissas.some((x) => x.premissaCritica === pc && x.tipo === "premissa");
            const risco = r.riscos.find(
              (x) => x.premissaCritica === pc && x.resposta.trim() && x.gatilho.trim(),
            );
            return `- ${pc}: premissa no B3 ${premissa || ep.premissasTap.some((x) => x.premissaCritica === pc) ? "sim" : "NÃO"}; risco com resposta e gatilho no B27 ${risco ? `sim (${risco.id})` : "NÃO"}`;
          }),
          ...auto.verificacoes
            .filter((v) => /^item:(B3\.9|B27\.13|A8\.12)$/.test(v.id) || /^premissa:PC\d/.test(v.id))
            .map((v) => `- conferência ${v.id}: ${v.estado} (${v.detalhe.slice(0, 120)})`),
          `- premissas do PMO que repetem o registro inicial e saem do B3: ${repetidas.length ? repetidas.map((x) => `${x.item.id} (${x.tipo === "restricao" ? "restrição" : "premissa"}, ${x.origem}${x.premissaCritica ? `, ${x.premissaCritica}` : ""})`).join("; ") : "nenhuma"}`,
          `- AVISO, premissas novas que podem repetir o registro inicial com outras palavras (o código compara palavras; o PMO e o GP conferem o sentido): ${parecidas.join("; ") || "nenhuma"}`,
          "",
          "## Contingência pelo código",
          `- riscos que pedem reserva: ${custos?.riscosComReserva.map((x) => x.id).join(", ") || "nenhum"}`,
          `- linha de base dos custos: ${custos?.linhaDeBase ?? "a definir pelo GP"}; falta: ${custos?.faltando.filter((x) => /reserva/.test(x)).join("; ") || "—"}`,
        );
        // registro das questões (B9) montado pelo código, com a origem, e o item do PMO que completa cada uma
        const qs = questoesDoCodigo(ep);
        if (qs.length && dossie.pgp.execucao) {
          const its = itensDoPgp(dossie.pgp, ep.documentos, ep.premissasTap);
          const cq = conferirQuestoes(qs, its, referenciasDoPlano(ep, dossie.pgp, its, qs));
          const status = (s?: ReturnType<typeof conferirQuestoes>["linhas"][number]["status"]) =>
            s
              ? `status ${s.estado}${s.referencias.length ? ` (refs. ${s.referencias.join(", ")})` : ""}${s.avisos.length ? ` — AVISO: ${s.avisos.join("; ")}` : ""}`
              : "sem status";
          linhas.push(
            "",
            `## Questões (B9) pelo código: ${qs.length}; origem sem questão: ${cq.semItem.join(", ") || "nenhuma"}; questão sem origem nem fonte: ${cq.semOrigem.join(", ") || "nenhuma"}; questões novas com fonte: ${cq.novas.map((n) => n.numero).join(", ") || "nenhuma"}`,
            ...cq.linhas.map(
              (l) =>
                `- ${l.questao.numero} · ${l.questao.origem} → ${l.item ?? "SEM ITEM"}${l.citadaEm.length ? ` (citada também em ${l.citadaEm.join(", ")})` : ""}; ${status(l.status)}`,
            ),
            ...cq.novas.map(
              (n) =>
                `- ${n.numero} · questão nova do PMO → ${n.item}; fonte ${n.fontes} (${n.citacaoConferida ? "citação conferida" : "citação NÃO conferida"}); ${status(n.status)}`,
            ),
          );
        }
        // compromissos (decisão 0047): o destino no TAP e no plano, como na matriz B23
        const cs = rastrearCompromissos(ep, itensDoPgp(dossie.pgp, ep.documentos, ep.premissasTap));
        if (cs.length)
          linhas.push(
            "",
            `## Compromissos (C) no TAP e no plano: ${cs.filter((x) => x.plano.length).length} de ${cs.length} com destino no plano`,
            ...cs.map(
              (x) =>
                `- ${x.compromisso.numero} · ${NOME_TIPO_COMPROMISSO[x.compromisso.tipo]}: TAP ${x.tap.situacao === "citado" ? x.tap.onde : x.tap.situacao === "provavel" ? `provável (${x.tap.onde})` : "sem destino"}; plano ${x.plano.join("; ") || "sem destino"}`,
            ),
          );
      }
      if (etapa === 3 && dossie.tap) {
        // compromissos numerados da proposta (decisão 0047) e o destino de cada um no TAP e no registro
        const et = montarEntradaTap(dossie, HOJE);
        const cs = et.dados?.compromissos ?? [];
        const destinos = destinosNoTap(
          cs,
          dossie.tap.tap?.resposta,
          dossie.tap.premissas?.resposta.premissas,
        );
        linhas.push(
          "",
          `## Compromissos da proposta (C) e o destino no TAP: ${destinos.filter((d) => d.situacao === "citado").length} citados, ${destinos.filter((d) => d.situacao === "provavel").length} prováveis, ${destinos.filter((d) => d.situacao === "sem-destino").length} sem destino`,
          ...destinos.map(
            (d) =>
              `- ${d.compromisso.numero} · ${NOME_TIPO_COMPROMISSO[d.compromisso.tipo]}: ${d.compromisso.texto.slice(0, 90)} → ${d.texto}`,
          ),
        );
      }
      if (etapa === 3 && passo === "tap" && dossie.tap) {
        // a conferência do TAP pelo código (método da etapa 3): elementos, marcos × vigência, valor, divergências
        const entrada = montarEntradaTap(dossie, HOJE);
        const conf = conferirTap(
          entrada,
          dossie.tap,
          itensDaEtapa3(dossie.tap, entrada.documentos),
          dossie.tap.premissasAplicaveis ?? dossie.proposta?.premissasAplicaveis ?? {},
        );
        const divergencias = compararRfpEProposta(entrada);
        const tap = v.data as z.infer<typeof SCHEMAS_TAP.tap>;
        linhas.push(
          "",
          `## Divergências: ${divergencias.length} do código; ${tap.divergenciasTexto.length} de texto do PMO`,
          ...divergencias.map(
            (d) =>
              `- ${d.id} · ${d.situacao}: RFP ${d.rfp.texto.slice(0, 90)} × proposta ${d.proposta.texto.slice(0, 90)}`,
          ),
          "",
          "## O que veio dos documentos (código)",
          ...dadosDosDocumentos(entrada).map(
            (d) => `- [${d.elemento}] ${d.nome}: ${d.texto.slice(0, 260)}${d.onde ? ` [${d.onde}]` : ""}`,
          ),
          "",
          "## Conferência do TAP pelo código",
          ...conf.map((x) => `- ${x.situacao} · ${x.nome}: ${x.texto.slice(0, 400)}`),
        );
      }
      if (etapa === 2 && passo === "estrategia") {
        const e = v.data as z.infer<typeof SCHEMAS.estrategia>;
        const ponto = montarPontoDePartida(
          dossie.documentos.filter((x) => x.papel === "rfp" || x.papel === "anexo-rfp"),
          dossie.analiseRfp,
          HOJE,
        );
        const ids = ponto.brechas.map((b) => b.id);
        const comDestino = new Set(e.destinos.map((d) => d.origem));
        linhas.push(
          "",
          `## Abordagens (${e.abordagens.length})`,
          ...e.abordagens.map((a) => `- ${a.id} · ${a.nome}: ${a.mudaOResultado.slice(0, 160)}`),
          "",
          `## Destino das brechas: ${ids.filter((i) => comDestino.has(i)).length} de ${ids.length} do ponto de partida com destino; ${e.destinos.filter((d) => !d.origem).length} achadas pelo PMO`,
          ...ids.filter((i) => !comDestino.has(i)).map((i) => `- sem destino: ${i}`),
          ...e.destinos
            .filter((d) => d.origem && !ids.includes(d.origem))
            .map((d) => `- origem que não está no ponto de partida: ${d.origem}`),
          "",
          `## Premissas críticas: ${e.premissasCriticas.map((p) => `${p.codigo} ${p.aplica}`).join(", ")}`,
        );
      }
      if (etapa === 5) {
        const c = entradaDaConferencia(dossie);
        const resposta = v.data as z.infer<typeof RespostaLeitura>;
        // a leitura fica no dossiê, como na tela: a segunda instância leve parte dela (decisão 0077); a revisão
        // anterior fica velha com a leitura nova
        dossie = {
          ...dossie,
          conferencia: {
            ...(dossie.conferencia ?? {
              caracteristicas: c.caracteristicas,
              mapa: c.mapa,
              premissasAplicaveis: c.premissasAplicaveis,
              requisitos: [],
              proximoRequisito: 1,
              decisoes: {},
            }),
            // como a tela (leitura-pmo.tsx): as decisões do GP sobre a leitura anterior saem, o plano fica ligado
            pgpId: c.pgp.id,
            decisoes: semRevisoesDoPmo(dossie.conferencia?.decisoes ?? {}),
            executadaEm: HOJE.toISOString(),
            leituraPmo: { resposta, modelo: "claude.ai (leitura independente)", em: HOJE.toISOString() },
          },
        };
        const candidatosAgora = conferirVereditos(resposta, c.achados, c.condicionais, c.mapa, [
          c.pgp,
          ...(c.tap ? [c.tap] : []),
          ...(c.rfp ? [c.rfp] : []),
        ]).candidatos;
        linhas.push(
          "",
          deveConferirEtapa5(resposta, candidatosAgora)
            ? `Segunda instância leve (decisão 0077): ${vereditosAConferir(resposta, candidatosAgora).length} veredito(s) "falso" ou "regra_errada" a conferir; o pedido é o passo segunda-leitura.`
            : 'Segunda instância leve (decisão 0077): sem veredito "falso" nem "regra_errada"; não roda.',
        );
        const conferidos = conferirLeitura(resposta, c, c.achados, c.mapa);
        const porSituacao = (s: string) => conferidos.filter((x) => x.situacao === s).length;
        const vd = conferirVereditos(resposta, c.achados, c.condicionais, c.mapa, [
          c.pgp,
          ...(c.tap ? [c.tap] : []),
          ...(c.rfp ? [c.rfp] : []),
        ]);
        const porVeredito = (s: keyof typeof NOME_SITUACAO_CANDIDATO) =>
          vd.candidatos.filter((x) => x.situacao === s);
        linhas.push(
          "",
          `Características usadas: ${Object.entries(c.caracteristicas)
            .map(([k, x]) => `${k} ${String(x)}`)
            .join("; ")}. Premissas críticas: ${
            Object.entries(c.premissasAplicaveis)
              .filter(([, x]) => x)
              .map(([k]) => k)
              .join(", ") || "nenhuma"
          }.`,
          `Achados do código (candidatos, decisão 0052): ${vd.candidatos.length} (${["ausente", "conflituoso", "vago"].map((t) => `${t} ${vd.candidatos.filter((x) => x.achado.tipo === t).length}`).join(", ")}); contam (o PMO confirmou): ${vd.contam.length}. Achados do PMO: ${conferidos.length} (válidos ${porSituacao("valido")}, rebaixados ${porSituacao("rebaixado")}, citação não conferida ${porSituacao("citacao-nao-conferida")}).`,
          "",
          "## Vereditos do PMO sobre os achados do código",
          ...(["sustenta", "falso", "nao-se-aplica", "regra-errada", "sem-veredito"] as const).flatMap(
            (sit) => {
              const xs = porVeredito(sit);
              return xs.length
                ? [
                    `### ${NOME_SITUACAO_CANDIDATO[sit]}: ${xs.length}`,
                    ...xs.map(
                      (x) =>
                        `- ${x.achado.tipo} · ${x.achado.parte} · ${x.achado.titulo}${x.daDispensa ? ` (parte devolvida: ${x.daDispensa})` : ""}${x.veredito?.motivo ? ` — ${x.veredito.motivo}` : ""}${(x.veredito?.evidencias ?? []).map((e) => ` — ${e.doc.toUpperCase()} p. ${e.pagina}: "${e.trecho.slice(0, 120)}"`).join("")}${x.avisos.length ? ` — AVISO: ${x.avisos.join("; ")}` : ""}`,
                    ),
                  ]
                : [];
            },
          ),
          ...(vd.dispensas.length
            ? [
                "",
                "## Dispensas declaradas só no plano",
                ...vd.dispensas.map(
                  (d) =>
                    `- ${d.parte}: ${d.situacao}${d.motivo ? ` — ${d.motivo}` : ""}${d.avisos.length ? ` — AVISO: ${d.avisos.join("; ")}` : ""} (no plano: ${d.justificativa.slice(0, 120)})`,
                ),
              ]
            : []),
          ...(vd.desconhecidos.length
            ? [`- vereditos com id fora da lista: ${vd.desconhecidos.join(", ")}`]
            : []),
          "",
          "## Achados do PMO, um por um",
          ...conferidos.map(
            (a) =>
              `- **${a.situacao}** · ${a.tipo} · ${a.gravidade} · ${a.parte}${a.item ? ` (${a.item})` : ""} · ${a.titulo}${
                a.localizadoEm
                  ? ` — o código achou o item na p. ${a.localizadoEm.pagina}: "${a.localizadoEm.trecho.slice(0, 140)}"`
                  : ""
              }${
                a.procuradoEm ? ` — procurado em: ${a.procuradoEm}` : ""
              }${a.jaApontadoPeloCodigo ? " — o código já tinha apontado" : ""}`,
          ),
        );
      }
    }
    writeFileSync(arqDossie, serializarDossie(dossie, HOJE));
    const relatorio = join(
      dirname(resolve(env.RAIO_X_ARQUIVO ?? "")),
      `${basename(env.RAIO_X_ARQUIVO ?? "resposta", ".json")}.placar.md`,
    );
    const notas = relatorio.replace(/\.placar\.md$/, ".notas.md");
    if (existsSync(notas)) linhas.splice(1, 0, "", `Notas à mão (a importação não toca): ${basename(notas)}`);
    linhas.splice(
      1,
      0,
      "",
      tokensDoPedidoExportado(
        etapa,
        passo,
        basename(dossie.documentos.find((x) => x.papel === "rfp")?.nomeArquivo ?? "rfp", ".pdf"),
      ),
    );
    writeFileSync(relatorio, `${linhas.join("\n")}\n`);
    console.log(`${linhas.join("\n")}\n\nDossiê atualizado: ${arqDossie}\nRelatório: ${relatorio}`);
  }, 120_000);
});
