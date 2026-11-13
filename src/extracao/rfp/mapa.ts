// Mapa da RFP (etapa 1, passo 1): seções numeradas, cláusulas e anexos, com a página de cada um, a separação
// entre o corpo e os anexos e o tema de cada seção (objeto, habilitação, pagamento…).
import { normalizarTermo } from "../../regras/busca";
import type { DocumentoRfp } from "./item";
import type { Faixas } from "./localizar";

export type TemaSecao =
  | "objeto"
  | "justificativa"
  | "escopo"
  | "participacao"
  | "esclarecimento"
  | "proposta"
  | "julgamento"
  | "habilitacao"
  | "recursos"
  | "sancoes"
  | "pagamento"
  | "reajuste"
  | "garantia"
  | "vigencia"
  | "obrigacoes"
  | "subcontratacao"
  | "dados"
  | "propriedade"
  | "recebimento"
  | "fiscalizacao"
  | "extincao"
  | "orcamento"
  | "disposicoes";

/** Ordem importa: o primeiro tema que casa com o título fica. Expressões sobre o título sem acento. */
const TEMAS: [TemaSecao, RegExp][] = [
  ["esclarecimento", /esclarecimento|impugna/],
  ["subcontratacao", /subcontrat/],
  ["dados", /lgpd|dados pessoais|sigilo|confidencialidade/],
  ["propriedade", /propriedade intelectual|direitos? autora/],
  ["reajuste", /reajust|reequilibrio|repactua/],
  ["garantia", /garantia/],
  ["sancoes", /sanc|infrac|penalidade/],
  ["recursos", /\brecursos?\b(?! orcamentari| financeir)/],
  ["habilitacao", /habilitacao|qualificacao|documentacao/],
  [
    "julgamento",
    /julgamento|criterios? de (?:selecao|avaliacao|pontuacao)|avaliacao d[ao]s? propostas?|pontuacao|fase de selecao|classificacao/,
  ],
  ["pagamento", /pagamento|medic|faturamento|desembolso/],
  ["recebimento", /recebimento|aceite|aceitacao/],
  ["fiscalizacao", /fiscaliza|gestao (?:do contrato|contratua)|acompanhamento|controle/],
  ["extincao", /extincao|rescisao|anulacao|revogacao/],
  ["obrigacoes", /obrigac|responsabilidades|competencias/],
  ["vigencia", /vigencia|prazos?\b|cronograma/],
  ["proposta", /propostas?|preenchimento|lances?|disputa|sessao/],
  ["participacao", /participacao|impedimentos|credenciamento|acesso ao sistema|requisitos e impedimentos/],
  [
    "escopo",
    /escopo|especifica|descricao|atividades|produtos?|entrega|metodologia|execucao|requisitos da contratacao|solucao|servicos/,
  ],
  ["objeto", /\bobjeto\b|\bobjetivos?\b|proposito|assunto/],
  ["justificativa", /justificativa|fundamentacao|necessidade/],
  ["orcamento", /valor|orcament|preco|dotacao|custo|contrapartida/],
  ["disposicoes", /disposic|casos omissos|foro|preambulo/],
];

export const NOME_TEMA: Record<TemaSecao, string> = {
  objeto: "Objeto",
  justificativa: "Justificativa",
  escopo: "Escopo e execução",
  participacao: "Participação",
  esclarecimento: "Esclarecimentos e impugnação",
  proposta: "Proposta e sessão",
  julgamento: "Julgamento",
  habilitacao: "Habilitação",
  recursos: "Recursos",
  sancoes: "Sanções",
  pagamento: "Pagamento e medição",
  reajuste: "Reajuste",
  garantia: "Garantia",
  vigencia: "Vigência e prazos",
  obrigacoes: "Obrigações",
  subcontratacao: "Subcontratação",
  dados: "Sigilo e dados pessoais",
  propriedade: "Propriedade intelectual",
  recebimento: "Recebimento",
  fiscalizacao: "Fiscalização e gestão",
  extincao: "Extinção",
  orcamento: "Valor e orçamento",
  disposicoes: "Disposições gerais",
};

export function temaDoTitulo(titulo: string): TemaSecao | undefined {
  const n = normalizarTermo(titulo);
  return TEMAS.find(([, re]) => re.test(n))?.[0];
}

export interface SecaoRfp {
  docId: string;
  documento: string;
  titulo: string;
  pagina: number;
  /** Página onde a seção termina (a da seção seguinte, no mesmo documento). */
  paginaFinal: number;
  posicao: number;
  tipo: "secao" | "clausula" | "anexo";
  /** Anexo a que a seção pertence ("ANEXO I"), ou vazio no corpo. */
  anexo: string;
  tema?: TemaSecao;
}

export interface MapaRfp {
  secoes: SecaoRfp[];
  /** Por documento, a primeira página de anexo: as anteriores são o corpo. */
  inicioAnexos: Map<string, number>;
}

const MAX_TITULO = 110;
const RE_NUMERADO = /^(\d{1,2}|[IVX]{1,5}(?=\s*[-–—.)]))\s*([.)])?\s*[-–—]?\s*([A-ZÀ-Ý].*)$/;
const RE_CLAUSULA = /^CL[AÁ]USULA\s+[A-ZÀ-Ý0-9ºª]+(?:\s+[A-ZÀ-Ý]+)?\s*[-–—:.]/;
const RE_ANEXO =
  /^ANEXO\s+(?:[“"'‘]([A-Z])[”"'’]|([IVXLC]{1,6}|\d{1,2}|[A-Z])(?:\s*-\s*[A-Z](?![a-z]))?\b)(.*)$/;
/** Documento anexo que começa no alto da página sem a palavra "ANEXO" (o termo de referência, a minuta). */
const RE_DOCUMENTO_ANEXO =
  /^(?:termo de referencia|minuta d[oe] (?:termo de )?contrato|estudo tecnico preliminar|projeto basico)\b/;
const RE_SUMARIO = /(\.{3,}|…{2,}|_{3,}|\.\s\.\s\.)/;

function maiusculas(texto: string): number {
  const letras = texto.match(/[A-Za-zÀ-ÿ]/g) ?? [];
  if (!letras.length) return 0;
  return (texto.match(/[A-ZÀ-Ý]/g) ?? []).length / letras.length;
}

function ehTituloNumerado(linha: string): boolean {
  const m = RE_NUMERADO.exec(linha);
  if (!m?.[3]) return false;
  const resto = m[3];
  // linha de planilha de preço ("1 COMPOSIÇÃO PML-REL-01 UN 10 R$ 4.529,40") não é título
  if (/R\$/.test(resto) || (resto.match(/\d+(?:[.,]\d+)*/g) ?? []).length >= 3) return false;
  const palavras = resto.match(/[A-Za-zÀ-ÿ]{2,}/g) ?? [];
  // título de uma palavra só ("1. OBJETO") precisa do ponto depois do número: "7 PONTOS" é célula de tabela
  const bastam = palavras.length >= 2 || (palavras.length === 1 && Boolean(m[2]) && resto.length >= 5);
  return bastam && maiusculas(resto) >= 0.75 && !/[;]$/.test(resto);
}

export function mapearRfp(docs: DocumentoRfp[]): MapaRfp {
  const secoes: SecaoRfp[] = [];
  const inicioAnexos = new Map<string, number>();
  for (const doc of docs) {
    const doDoc: SecaoRfp[] = [];
    let anexoAtual = "";
    for (const p of doc.paginas) {
      const linhas = p.texto.split("\n");
      const anexosNaPagina = linhas.filter((l) => RE_ANEXO.test(l.trim())).length;
      // página com 3 ou mais "ANEXO X" é a lista de anexos, não o início de um
      const listaDeAnexos = anexosNaPagina >= 3;
      let posicao = 0;
      let linhasDeTexto = 0;
      for (const original of linhas) {
        const inicio = posicao;
        posicao += original.length + 1;
        const linha = original.replace(/\t+/g, " ").trim();
        if (!linha) continue;
        linhasDeTexto++;
        if (linha.length > MAX_TITULO || RE_SUMARIO.test(linha)) continue;
        const anexo = RE_ANEXO.exec(linha);
        const docAnexo =
          !anexo &&
          p.numero > 1 &&
          linhasDeTexto <= 6 &&
          linha.length <= 80 &&
          // título, não frase: sem vírgula, ponto e vírgula ou ponto final ("Termo de Referência, deverá…")
          !/[,;]|\.\s*$/.test(linha) &&
          RE_DOCUMENTO_ANEXO.test(normalizarTermo(linha)) &&
          // em caixa mista, só com o número do documento ("Termo de Referência 2/2026")
          (maiusculas(linha) >= 0.6 || /\d/.test(linha)) &&
          !doDoc.some((s) => s.tipo === "anexo" && s.pagina === p.numero) &&
          // o anexo atual já é este documento ("ANEXO V - TERMO DE REFERÊNCIA" e, na página seguinte, o título)
          !normalizarTermo(doDoc.findLast((s) => s.tipo === "anexo")?.titulo ?? "").includes(
            RE_DOCUMENTO_ANEXO.exec(normalizarTermo(linha))?.[0] ?? "\u0000",
          );
        if (docAnexo) {
          anexoAtual = linha.replace(/\s*[-–—]\s*.*$/, "").toUpperCase();
          if (!inicioAnexos.has(doc.id)) inicioAnexos.set(doc.id, p.numero);
          doDoc.push({
            docId: doc.id,
            documento: doc.rotulo,
            titulo: linha,
            pagina: p.numero,
            paginaFinal: p.numero,
            posicao: inicio,
            tipo: "anexo",
            anexo: anexoAtual,
            tema: temaDoTitulo(linha),
          });
          continue;
        }
        if (anexo) {
          const resto = (anexo[3] ?? "").trim();
          const valido =
            !listaDeAnexos &&
            !/;\s*$|\be;?$/.test(linha) &&
            (!resto || /^[-–—:.]?\s*[A-ZÀ-Ý(]/.test(resto)) &&
            maiusculas(linha) >= 0.6;
          // o anexo começa no alto da página; mais abaixo, só se a linha for toda em maiúsculas
          if (valido && (linhasDeTexto <= 8 || maiusculas(linha) >= 0.9)) {
            anexoAtual = `ANEXO ${anexo[1] ?? anexo[2]}`;
            if (!inicioAnexos.has(doc.id)) inicioAnexos.set(doc.id, p.numero);
            doDoc.push({
              docId: doc.id,
              documento: doc.rotulo,
              titulo: linha,
              pagina: p.numero,
              paginaFinal: p.numero,
              posicao: inicio,
              tipo: "anexo",
              anexo: anexoAtual,
              tema: temaDoTitulo(resto),
            });
          }
          continue;
        }
        const tipo = RE_CLAUSULA.test(linha) ? "clausula" : ehTituloNumerado(linha) ? "secao" : null;
        if (!tipo) continue;
        const titulo = tipo === "clausula" ? linha.slice(0, 90) : linha;
        doDoc.push({
          docId: doc.id,
          documento: doc.rotulo,
          titulo,
          pagina: p.numero,
          paginaFinal: p.numero,
          posicao: inicio,
          tipo,
          anexo: anexoAtual,
          tema: temaDoTitulo(
            titulo.replace(
              /^(?:\d{1,2}|[IVX]{1,5})\s*[.)]?\s*[-–—]?\s*|^CL[AÁ]USULA\s+\S+(?:\s+\S+)?\s*[-–—:.]\s*/i,
              "",
            ),
          ),
        });
      }
    }
    const ultima = doc.paginas.at(-1)?.numero ?? 1;
    doDoc.forEach((s, i) => {
      s.paginaFinal = doDoc[i + 1]?.pagina ?? ultima;
    });
    secoes.push(...doDoc);
  }
  return { secoes, inicioAnexos };
}

/** Páginas das seções de um ou mais temas, por documento. Sem seção do tema, devolve undefined. */
export function faixasDoTema(mapa: MapaRfp, ...temas: TemaSecao[]): Faixas | undefined {
  const faixas: Faixas = new Map();
  for (const s of mapa.secoes) {
    if (!s.tema || !temas.includes(s.tema)) continue;
    if (!faixas.has(s.docId)) faixas.set(s.docId, new Set());
    for (let p = s.pagina; p <= s.paginaFinal; p++) faixas.get(s.docId)?.add(p);
  }
  return faixas.size ? faixas : undefined;
}

/** Seção em que fica uma posição (a última seção que começa antes dela). */
export function secaoDaPosicao(mapa: MapaRfp, docId: string, pagina: number, posicao: number) {
  let atual: SecaoRfp | undefined;
  for (const s of mapa.secoes) {
    if (s.docId !== docId) continue;
    if (s.pagina < pagina || (s.pagina === pagina && s.posicao <= posicao)) atual = s;
    else break;
  }
  return atual;
}
