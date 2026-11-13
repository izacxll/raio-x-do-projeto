// Conferência do PGP (etapa 5), só com código. Decisões 0008 (categoria), 0009 (regras do Raio-X),
// 0013 (base do "ausente" em três níveis) e 0021 (premissas críticas).
// Todo achado é vago, conflituoso ou ausente; a gravidade vem da parte do PGP; a categoria, da regra fixa.
import { avaliarDispensa, type Caracteristicas } from "../dominio/caracteristicas";
import type { Ficha, Gravidade } from "../dominio/fichas";
import type { PremissaCritica } from "../dominio/premissas";
import type { PaginaLida } from "../dossie/esquema";
import { prazoPrincipal, extrairPrazosTotais, type PrazoTotal } from "../extracao/prazos";
import { termosDoRequisito, type Requisito } from "../extracao/requisitos";
import {
  NAO_LOCALIZADO,
  ORDEM_GRAVIDADE,
  type Achado,
  type Evidencia,
  type TipoAchado,
  type Verificacao,
} from "./achado";
import { paginasNaoVerificaveis, procurar, procurarPadrao, procurarSinais, type Ocorrencia } from "./busca";
import { paginasDaParte, parteDaPosicao, type ParteConfirmada } from "./mapa-pgp";
import { PADROES_VAGO } from "./vago";

export interface EntradaConferencia {
  pgp: PaginaLida[];
  tap?: PaginaLida[];
  rfp?: PaginaLida[];
  partes: Ficha[];
  premissas: PremissaCritica[];
  mapa: ParteConfirmada[];
  caracteristicas: Caracteristicas;
  /** PC1…PC8 → se aplica ao projeto (confirmado pelo GP). */
  premissasAplicaveis: Record<string, boolean>;
  /** Requisitos da RFP (extraídos pelo código e editados pelo GP). */
  requisitos: Requisito[];
}

export interface ResultadoConferencia {
  achados: Achado[];
  verificacoes: Verificacao[];
}

/** Itens tratados pela regra das premissas críticas, e não pela busca genérica dos sinais. */
const ITENS_DAS_PREMISSAS = new Set(["B3.9", "B27.13", "A11.12"]);
/** Onde cada premissa crítica tem de estar no plano (decisão 0021). */
const LUGARES_DA_PREMISSA = ["B3", "B27", "A11"] as const;
/** Texto de outro tipo de documento colado no plano (decisão 0009; CP8). */
const TEXTO_DE_OUTRO_DOCUMENTO =
  /\b(?:neste|no presente|deste|do presente) (?:termo de referencia|edital|instrumento convocatorio)\b|\bpresente edital\b|\bdesta licitacao\b|\b[ao]s? licitantes?\b/;

/** Parte usada quando o trecho fica fora de todas as partes do mapa (capa, introdução). */
const SEM_PARTE = "—";

export function conferirPlano(e: EntradaConferencia): ResultadoConferencia {
  const achados: Achado[] = [];
  const verificacoes: Verificacao[] = [];
  const fichas = new Map(e.partes.map((p) => [p.codigo, p]));
  const confirmadas = new Map(e.mapa.map((m) => [m.codigo, m]));
  const ilegiveis = paginasNaoVerificaveis(e.pgp);

  const gravidadeDe = (codigo: string): Gravidade => {
    const g = fichas.get(codigo)?.gravidade;
    return g === "grave" || g === "média" || g === "baixa" ? g : "baixa";
  };
  const categoriaDe = (codigo: string): string => fichas.get(codigo)?.categoria || "planejamento";
  const nomeDe = (codigo: string): string => fichas.get(codigo)?.nome ?? "trecho fora das partes do mapa";
  const presente = (codigo: string) => confirmadas.get(codigo)?.situacao === "presente";

  function registrar(a: {
    tipo: TipoAchado;
    regra: string;
    partes: string[];
    chave: string;
    titulo: string;
    descricao: string;
    evidencias: Evidencia[];
    sugestao: string;
    categoriaComparada?: "tempo" | "custo" | "escopo";
  }) {
    const partes = a.partes.length ? a.partes : [SEM_PARTE];
    // a parte mais grave decide (seção 5 da especificação, etapa 5, passo 4)
    const parte =
      [...partes].sort((x, y) => ORDEM_GRAVIDADE[gravidadeDe(y)] - ORDEM_GRAVIDADE[gravidadeDe(x)])[0] ??
      SEM_PARTE;
    achados.push({
      id: `${a.regra}:${parte}:${a.chave}`,
      tipo: a.tipo,
      regra: a.regra,
      parte,
      partes,
      gravidade: gravidadeDe(parte),
      categoria: a.categoriaComparada ?? categoriaDe(parte),
      origemCategoria: a.categoriaComparada ? "comparado" : "parte",
      titulo: a.titulo,
      descricao: a.descricao,
      evidencias: a.evidencias,
      sugestao: a.sugestao,
    });
  }

  const evidenciaPgp = (o: Ocorrencia): Evidencia => ({
    documento: "pgp",
    pagina: o.pagina,
    trecho: o.trecho,
    rotulo: `PGP, p. ${o.pagina}`,
  });
  const evidenciaFicha = (codigo: string, texto: string): Evidencia => ({
    documento: "ficha",
    trecho: texto,
    rotulo: `Conteúdo mínimo ${codigo} (skill PMO)`,
  });

  /** "Ausente" só vale com o plano inteiro legível; senão, a verificação fica "não verificável". */
  function ausenteOuNaoVerificavel(id: string, alvo: string, descricao: string, gerar: () => void) {
    if (ilegiveis.length) {
      verificacoes.push({
        id,
        alvo,
        descricao,
        estado: "nao-verificavel",
        detalhe: `Páginas sem texto legível no plano (${ilegiveis.join(", ")}): o código não pode dar o item como ausente.`,
      });
      return;
    }
    verificacoes.push({ id, alvo, descricao, estado: "achado", detalhe: NAO_LOCALIZADO });
    gerar();
  }

  // ---------- (b) partes do PGP e (c) conteúdo mínimo ----------
  for (const ficha of e.partes) {
    const conf = confirmadas.get(ficha.codigo);
    const idParte = `parte:${ficha.codigo}`;
    if (!conf || conf.situacao === "dispensada") {
      verificacoes.push({
        id: idParte,
        alvo: ficha.codigo,
        descricao: ficha.nome,
        estado: "dispensado-gp",
        detalhe: conf?.justificativa ? `Dispensado pelo GP: ${conf.justificativa}` : "Dispensado pelo GP.",
      });
      continue;
    }
    if (conf.situacao === "nao-existe") {
      ausenteOuNaoVerificavel(idParte, ficha.codigo, ficha.nome, () =>
        registrar({
          tipo: "ausente",
          regra: "parte-ausente",
          partes: [ficha.codigo],
          chave: "parte",
          titulo: `${ficha.nome}: parte ${NAO_LOCALIZADO}`,
          descricao: `A parte ${ficha.codigo} (${ficha.nome}) não foi localizada no plano, nem com título próprio nem junto de outra parte, e o GP não a marcou como dispensada no mapa.`,
          evidencias: [
            evidenciaFicha(ficha.codigo, `Parte do plano prevista: ${ficha.nome} (${ficha.tipo}).`),
          ],
          sugestao: `Sugere-se incluir a parte "${ficha.nome}" no plano ou, se ela não faz sentido para este projeto, marcá-la como dispensada no mapa, com a justificativa.`,
        }),
      );
      continue;
    }
    verificacoes.push({
      id: idParte,
      alvo: ficha.codigo,
      descricao: ficha.nome,
      estado: "ok",
      detalhe: "Parte presente no mapa.",
    });

    const faixa = paginasDaParte(conf);
    for (const item of ficha.itens) {
      const id = `item:${item.codigo}`;
      const base = { id, alvo: item.codigo, descricao: item.texto };
      const dispensa = avaliarDispensa(item.dispensa, e.caracteristicas);
      if ("dispensavel" in dispensa && dispensa.dispensavel) {
        verificacoes.push({
          ...base,
          estado: "dispensavel",
          detalhe: `Dispensável neste projeto: ${dispensa.motivo}.`,
        });
        continue;
      }
      if (ITENS_DAS_PREMISSAS.has(item.codigo)) {
        verificacoes.push({ ...base, estado: "ok", detalhe: "Conferido na regra das premissas críticas." });
        continue;
      }
      if (item.confere === "só PMO") {
        verificacoes.push({
          ...base,
          estado: "nao-conferido",
          detalhe: "Não conferido pelo código: depende de interpretação.",
        });
        continue;
      }
      if (!item.termos.length && !item.compostos.length) {
        verificacoes.push({
          ...base,
          estado: "nao-conferido",
          detalhe: `Não conferido pelo código: o sinal é uma estrutura (${item.estruturas.join("; ")}).`,
        });
        continue;
      }
      const naParte = procurarSinais(e.pgp, item, faixa);
      if (naParte) {
        verificacoes.push({ ...base, estado: "ok", detalhe: `Localizado na p. ${naParte.pagina}.` });
        continue;
      }
      const noPlano = faixa ? procurarSinais(e.pgp, item) : undefined;
      if (noPlano) {
        verificacoes.push({
          ...base,
          estado: "ok",
          detalhe: `Localizado fora da parte, na p. ${noPlano.pagina}: conferir se é o lugar certo.`,
        });
        continue;
      }
      ausenteOuNaoVerificavel(id, item.codigo, item.texto, () =>
        registrar({
          tipo: "ausente",
          regra: "conteudo-minimo",
          partes: [ficha.codigo],
          chave: item.codigo,
          titulo: `${item.codigo} ${NAO_LOCALIZADO}`,
          descricao: `${ficha.nome}: o conteúdo mínimo "${item.texto}" não foi localizado no plano (termos procurados: ${item.termos.join(", ")}).`,
          evidencias: [evidenciaFicha(item.codigo, `${item.texto}. Fonte: ${item.fonte}.`)],
          sugestao: `Sugere-se incluir em "${ficha.nome}": ${item.texto.charAt(0).toLowerCase()}${item.texto.slice(1)}. Se o projeto não precisa disso, recomenda-se registrar o motivo.`,
        }),
      );
    }
  }

  // ---------- premissas críticas (decisão 0021) ----------
  for (const pc of e.premissas) {
    const id = `premissa:${pc.codigo}`;
    const base = { id, alvo: pc.codigo, descricao: pc.titulo };
    if (!e.premissasAplicaveis[pc.codigo]) {
      verificacoes.push({
        ...base,
        estado: "dispensado-gp",
        detalhe: "O GP marcou que esta premissa não se aplica ao projeto.",
      });
      continue;
    }
    const sinais = { termos: [...pc.sinaisNoPlano.termos, pc.codigo], compostos: pc.sinaisNoPlano.compostos };
    const achadoNoPlano = procurarSinais(e.pgp, sinais);
    const noPlano = achadoNoPlano ? [achadoNoPlano] : [];
    const evidencia = evidenciaFicha(pc.codigo, `${pc.titulo}. Onde no plano: ${pc.ondeNoPlano}`);
    if (!noPlano.length) {
      ausenteOuNaoVerificavel(id, pc.codigo, pc.titulo, () =>
        registrar({
          tipo: "ausente",
          regra: "premissa-critica",
          partes: ["A8", ...LUGARES_DA_PREMISSA],
          chave: pc.codigo,
          titulo: `Premissa crítica ${pc.codigo} ${NAO_LOCALIZADO}`,
          descricao: `A premissa crítica "${pc.titulo}" se aplica ao projeto (confirmado pelo GP) e não foi localizada no plano. Ela deveria estar no registro de premissas (B3), no registro de riscos (B27), no plano de mudanças (A11) e no tratamento das premissas críticas do plano de riscos (A8.12).`,
          evidencias: [evidencia],
          sugestao: `Sugere-se escrever a premissa no plano: o que se assume (${pc.assume.replace(/\.$/, "")}), de quem depende, até quando e o efeito se falhar; com um risco ligado no B27 (resposta e gatilho) e o modo de reajustar escopo, prazo e metas no A11.`,
        }),
      );
      continue;
    }
    let faltou = false;
    for (const lugar of LUGARES_DA_PREMISSA) {
      if (!presente(lugar)) continue; // parte dispensada ou ausente: o achado é o da parte
      const faixa = paginasDaParte(confirmadas.get(lugar));
      if (!faixa) continue; // parte fundida com outra: o plano inteiro já foi procurado
      if (procurarSinais(e.pgp, sinais, faixa)) continue;
      faltou = true;
      ausenteOuNaoVerificavel(`${id}:${lugar}`, pc.codigo, `${pc.titulo} (${lugar})`, () =>
        registrar({
          tipo: "ausente",
          regra: "premissa-critica-lugar",
          partes: [lugar],
          chave: pc.codigo,
          titulo: `Premissa crítica ${pc.codigo} não localizada em ${nomeDe(lugar)}`,
          descricao: `A premissa crítica "${pc.titulo}" aparece no plano (p. ${noPlano[0]?.pagina}), mas não foi localizada em ${lugar} (${nomeDe(lugar)}), onde também tem de estar.`,
          evidencias: [evidenciaPgp(noPlano[0] as Ocorrencia), evidencia],
          sugestao:
            lugar === "B27"
              ? `Sugere-se registrar no B27 o risco de a premissa ${pc.codigo} não se confirmar, com resposta e gatilho.`
              : lugar === "A11"
                ? `Sugere-se dizer no plano de mudanças como reajustar escopo, prazo e metas se a premissa ${pc.codigo} falhar.`
                : `Sugere-se escrever a premissa ${pc.codigo} no registro de premissas, com responsável e prazo para validar.`,
        }),
      );
    }
    if (!faltou)
      verificacoes.push({ ...base, estado: "ok", detalhe: `Localizada (p. ${noPlano[0]?.pagina}).` });
  }

  // ---------- (a) requisitos da RFP ----------
  const lugarDoEscopo = ["B17", "A13", "A1"].find((c) => presente(c)) ?? "B17";
  const faixaEscopo = paginasDaParte(confirmadas.get(lugarDoEscopo));
  for (const r of e.requisitos) {
    const id = `requisito:${r.numero}`;
    const termos = termosDoRequisito(r);
    const base = { id, alvo: r.numero, descricao: `${r.rotulo}: ${r.descricao}` };
    if (!termos.length) {
      verificacoes.push({
        ...base,
        estado: "nao-conferido",
        detalhe: "Descrição curta demais para o código procurar.",
      });
      continue;
    }
    const noEscopo = procurar(e.pgp, termos, { paginas: faixaEscopo, primeira: true });
    if (noEscopo.length) {
      verificacoes.push({ ...base, estado: "ok", detalhe: `Localizado na p. ${noEscopo[0]?.pagina}.` });
      continue;
    }
    const noPlano = faixaEscopo ? procurar(e.pgp, termos, { primeira: true }) : [];
    const evidenciaRfp: Evidencia = {
      documento: "rfp",
      pagina: r.origem === "codigo" ? r.pagina : undefined,
      trecho: r.origem === "codigo" ? r.trecho : r.descricao,
      rotulo: r.origem === "codigo" ? `RFP, p. ${r.pagina}` : "Requisito incluído pelo GP",
    };
    ausenteOuNaoVerificavel(id, r.numero, base.descricao, () =>
      registrar({
        tipo: "ausente",
        regra: "requisito",
        partes: [lugarDoEscopo],
        chave: r.numero,
        categoriaComparada: "escopo",
        titulo: `${r.numero} (${r.rotulo}) ${NAO_LOCALIZADO} na especificação do escopo`,
        descricao: noPlano.length
          ? `O requisito ${r.numero} da RFP ("${r.descricao}") aparece no plano (p. ${noPlano[0]?.pagina}), mas não foi localizado em ${nomeDe(lugarDoEscopo)}.`
          : `O requisito ${r.numero} da RFP ("${r.descricao}") não foi localizado no plano.`,
        evidencias: noPlano.length ? [evidenciaRfp, evidenciaPgp(noPlano[0] as Ocorrencia)] : [evidenciaRfp],
        sugestao: `Sugere-se incluir o ${r.rotulo.toLowerCase()} "${r.descricao}" em ${nomeDe(lugarDoEscopo)}, com o mesmo nome e número da RFP (${r.numero}).`,
      }),
    );
  }

  // ---------- vago ----------
  for (const padrao of PADROES_VAGO) {
    for (const o of procurarPadrao(e.pgp, padrao.re)) {
      const parte = parteDaPosicao(o.pagina, o.posicao, e.mapa) ?? SEM_PARTE;
      registrar({
        tipo: "vago",
        regra: `vago:${padrao.id}`,
        partes: [parte],
        chave: `${o.pagina}:${o.posicao}`,
        titulo: `"${o.termo}" sem ${padrao.falta} verificável`,
        descricao: `Trecho de ${nomeDe(parte)} que não dá para conferir: falta ${padrao.falta}.`,
        evidencias: [evidenciaPgp(o)],
        sugestao: padrao.sugestao,
      });
    }
  }

  // ---------- conflituoso: texto de outro documento (CP8) ----------
  for (const o of procurarPadrao(e.pgp, TEXTO_DE_OUTRO_DOCUMENTO)) {
    const parte = parteDaPosicao(o.pagina, o.posicao, e.mapa) ?? SEM_PARTE;
    registrar({
      tipo: "conflituoso",
      regra: "texto-de-outro-documento",
      partes: [parte],
      chave: `${o.pagina}:${o.posicao}`,
      titulo: `Texto de outro documento no plano: "${o.termo}"`,
      descricao: `O trecho fala como edital ou termo de referência ("${o.termo}"), e não como plano do projeto: parece ter vindo de outro documento sem ajuste.`,
      evidencias: [evidenciaPgp(o)],
      sugestao:
        "Sugere-se reescrever o trecho como compromisso do plano (quem faz o quê e quando), sem a linguagem do edital.",
    });
  }

  // ---------- conflituoso: prazo total (PGP × RFP × TAP) ----------
  const referencias: { doc: "rfp" | "tap"; prazo: PrazoTotal }[] = [];
  const prazoRfp = e.rfp ? prazoPrincipal(extrairPrazosTotais(e.rfp)) : undefined;
  const prazoTap = e.tap ? prazoPrincipal(extrairPrazosTotais(e.tap)) : undefined;
  if (prazoRfp) referencias.push({ doc: "rfp", prazo: prazoRfp });
  if (prazoTap) referencias.push({ doc: "tap", prazo: prazoTap });
  for (const p of extrairPrazosTotais(e.pgp)) {
    const divergentes = referencias.filter((r) => r.prazo.unidade === p.unidade && r.prazo.valor !== p.valor);
    if (!divergentes.length) continue;
    const parte = parteDaPosicao(p.pagina, p.posicao, e.mapa) ?? SEM_PARTE;
    registrar({
      tipo: "conflituoso",
      regra: "prazo-total",
      partes: [parte],
      chave: `${p.pagina}:${p.posicao}`,
      categoriaComparada: "tempo",
      titulo: `Prazo total diferente: ${p.valor} ${p.unidade} no plano × ${divergentes.map((d) => `${d.prazo.valor} ${d.prazo.unidade} no ${d.doc === "rfp" ? "edital" : "TAP"}`).join(" e ")}`,
      descricao: "O plano declara um prazo total diferente do documento de referência.",
      evidencias: [
        { documento: "pgp", pagina: p.pagina, trecho: p.trecho, rotulo: `PGP, p. ${p.pagina}` },
        ...divergentes.map((d) => ({
          documento: d.doc,
          pagina: d.prazo.pagina,
          trecho: d.prazo.trecho,
          rotulo: `${d.doc === "rfp" ? "RFP" : "TAP"}, p. ${d.prazo.pagina}`,
        })),
      ],
      sugestao:
        "Sugere-se alinhar o prazo do plano ao do contrato e, se a diferença for intencional, registrá-la como mudança aprovada.",
    });
  }

  return { achados: ordenarAchados(achados), verificacoes };
}

export function ordenarAchados(achados: Achado[]): Achado[] {
  const tipo = { ausente: 0, conflituoso: 1, vago: 2 };
  return [...achados].sort(
    (a, b) =>
      ORDEM_GRAVIDADE[b.gravidade] - ORDEM_GRAVIDADE[a.gravidade] ||
      tipo[a.tipo] - tipo[b.tipo] ||
      a.parte.localeCompare(b.parte, "pt-BR", { numeric: true }),
  );
}

export function resumirAchados(achados: Achado[]): Record<Gravidade, Record<TipoAchado, number>> {
  const vazio = (): Record<TipoAchado, number> => ({ vago: 0, conflituoso: 0, ausente: 0 });
  const r: Record<Gravidade, Record<TipoAchado, number>> = { grave: vazio(), média: vazio(), baixa: vazio() };
  for (const a of achados) r[a.gravidade][a.tipo]++;
  return r;
}
