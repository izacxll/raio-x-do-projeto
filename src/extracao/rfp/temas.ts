// Forma de apresentação (passo 7) e condições contratuais (passo 8), por catálogo de temas. Cada tema é
// procurado primeiro nas seções do mesmo assunto e depois no documento inteiro. Quando dá, o código tira o
// valor (garantia de 5%, multas de 0,5% a 20%, índice de reajuste); o trecho vem sempre junto.
import { itemSemAchado, type DocumentoRfp, type ItemAnalise, type SecaoAnalise } from "./item";
import { localizarPrimeiro, localizarTodos, origemDe, type Localizado } from "./localizar";
import { faixasDoTema, type MapaRfp, type TemaSecao } from "./mapa";

interface Tema {
  id: string;
  secao: Extract<SecaoAnalise, "apresentacao" | "condicoes">;
  nome: string;
  /** Expressões na ordem de preferência; a primeira que acha manda. Sobre texto sem acento. */
  res: RegExp[];
  /** Seções do mapa onde procurar primeiro. */
  temas?: TemaSecao[];
  /** Valor resumido, tirado por código do trecho achado (ou de todas as ocorrências). */
  valor?: (l: Localizado, todas: () => Localizado[]) => string | undefined;
  /** Item que, se não achado, aparece como "não localizado" (os demais só aparecem quando achados). */
  sempre?: boolean;
}

const pct = (s: string) => Number(s.replace(",", "."));
const fmtPct = (n: number) => `${String(n).replace(".", ",")}%`;

export const TEMAS_RFP: Tema[] = [
  // ---------- forma de apresentação ----------
  {
    id: "modelo-proposta",
    secao: "apresentacao",
    nome: "Modelo de proposta",
    res: [
      /\bmodelo de proposta\b|\bproposta[^.;]{0,40}conforme (?:o )?modelo\b|\banexo[^.;]{0,30}\bproposta (?:de precos?|comercial)\b/,
    ],
    sempre: true,
  },
  {
    id: "planilha",
    secao: "apresentacao",
    nome: "Planilha de preços ou de custos",
    res: [
      /\bplanilha (?:de )?(?:custos|precos|orcamentaria)|\bcomposicao de (?:custos|precos)\b|\bformacao de precos\b/,
    ],
    sempre: true,
  },
  {
    id: "proposta-tecnica",
    secao: "apresentacao",
    nome: "Conteúdo da proposta técnica",
    res: [
      /\bproposta tecnica (?:devera|contera|deve conter|sera composta|devera conter)\b|\bplano de trabalho (?:devera|contera|deve conter)\b/,
    ],
    temas: ["proposta", "julgamento"],
  },
  {
    id: "limite-paginas",
    secao: "apresentacao",
    nome: "Limite de páginas",
    res: [
      /\b(?:maximo|limite|nao podera exceder|nao deverao exceder|ate) (?:de )?\d{1,3} (?:\([a-z ]+\) )?(?:paginas|laudas|folhas)\b/,
    ],
    valor: (l) =>
      /\d{1,3} (?:\([a-z ]+\) )?(?:paginas|laudas|folhas)/.exec(l.termo)?.[0]?.replace(/\([^)]*\) /, ""),
  },
  {
    id: "formatacao",
    secao: "apresentacao",
    nome: "Formatação (fonte, papel, margens)",
    res: [
      /\bfonte (?:arial|times|calibri|verdana)|\bfonte tamanho\b|\btamanho (?:de fonte )?\d{1,2}\b[^.;]{0,20}fonte|\bpapel (?:tamanho )?a4\b|\bespacamento (?:simples|entre linhas)\b/,
    ],
  },
  {
    id: "arquivo",
    secao: "apresentacao",
    nome: "Formato do arquivo ou do envio",
    res: [
      /\bexclusivamente por meio do sistema\b|\bpor meio do sistema eletronico\b|\bformato (?:pdf|digital)\b|\benvelopes? (?:lacrad|n[o°º]? ?\d|fechad)/,
    ],
    temas: ["proposta"],
  },
  {
    id: "idioma",
    secao: "apresentacao",
    nome: "Idioma",
    res: [/\blingua portuguesa\b|\bidioma (?:portugues|oficial)\b/],
  },
  {
    id: "amostra",
    secao: "apresentacao",
    nome: "Amostra ou prova de conceito",
    res: [/\bprova de conceito\b|\bapresentacao (?:de|da) amostra\b/],
  },
  // ---------- condições contratuais ----------
  {
    id: "pagamento",
    secao: "condicoes",
    nome: "Pagamento e medição",
    res: [
      /\bpagamento\b[^.;]{0,120}?\b(?:ate|em|no prazo (?:maximo )?de)\s+\d{1,3}\s*(?:\([a-z ]+\)\s*)?dias(?: uteis| corridos)?/,
      /\bpagamento\b[^.;]{0,80}\b(?:por produto|mediante (?:a )?(?:entrega|apresentacao)|apos (?:a |o )?(?:aprovacao|aceite|entrega|atesto|recebimento))/,
      /\bpagamento\b/,
    ],
    temas: ["pagamento"],
    valor: (l) => {
      const m = /(\d{1,3})\s*(?:\([a-z ]+\)\s*)?dias( uteis| corridos)?/.exec(l.termo);
      return m
        ? `em até ${m[1]} dias${m[2] ?? ""} (contagem: ${m[2] ? m[2].trim() : "não informada no trecho"})`
        : undefined;
    },
    sempre: true,
  },
  {
    id: "reajuste",
    secao: "condicoes",
    nome: "Reajuste",
    res: [/\breajust\w*\b[^.;]{0,200}?\b(?:ipca|igp-?m|inpc|ist|icti|incc|ipc-?fipe)\b/, /\breajust\w*\b/],
    temas: ["reajuste"],
    valor: (l) => /\b(?:ipca|igp-?m|inpc|ist|icti|incc|ipc-?fipe)\b/.exec(l.termo)?.[0]?.toUpperCase(),
    sempre: true,
  },
  {
    id: "garantia-execucao",
    secao: "condicoes",
    nome: "Garantia de execução",
    res: [
      /\bnao (?:sera|havera|se) exig\w* (?:de )?(?:a )?(?:prestacao de )?garantia\b|\bnao se (?:exigira|exige|preve) garantia\b|\bdispensad[ao] (?:a )?(?:prestacao de )?garantia\b/,
      /\bgarantia (?:contratual|de execucao|de cumprimento)?\b[^.;]{0,120}?\b\d{1,2}(?:[.,]\d+)?\s*%/,
      /\bgarantia (?:contratual|de execucao)\b/,
    ],
    temas: ["garantia"],
    valor: (l) => {
      if (/nao (?:sera|havera|se) exig|nao se preve|dispensad/.test(l.termo))
        return "não exigida, pelo trecho";
      const m = /(\d{1,2}(?:[.,]\d+)?)\s*%/.exec(l.termo);
      return m?.[1] ? `${fmtPct(pct(m[1]))} (conferir a base de cálculo)` : undefined;
    },
    sempre: true,
  },
  {
    id: "garantia-proposta",
    secao: "condicoes",
    nome: "Garantia de proposta",
    res: [/\bgarantia de proposta\b[^.;]{0,120}?\b\d{1,2}(?:[.,]\d+)?\s*%|\bgarantia de proposta\b/],
    valor: (l) => {
      const m = /(\d{1,2}(?:[.,]\d+)?)\s*%/.exec(l.termo);
      return m?.[1] ? fmtPct(pct(m[1])) : undefined;
    },
  },
  {
    id: "penalidades",
    secao: "condicoes",
    nome: "Penalidades (multas)",
    res: [/\bmulta\b[^.;]{0,200}?\b\d{1,3}(?:[.,]\d+)?\s*%/, /\bmulta\b/],
    temas: ["sancoes"],
    valor: (_l, todas) => {
      const valores = todas()
        .flatMap((x) => [...x.frase.matchAll(/(\d{1,3}(?:[.,]\d+)?)\s*%/g)].map((m) => pct(m[1] ?? "0")))
        .filter((n) => n > 0 && n <= 100);
      if (!valores.length) return undefined;
      const min = Math.min(...valores);
      const max = Math.max(...valores);
      return min === max
        ? `multa de ${fmtPct(min)} (contado pelo código)`
        : `multas de ${fmtPct(min)} a ${fmtPct(max)} (menor e maior percentual citados junto de "multa"; contado pelo código)`;
    },
    sempre: true,
  },
  {
    id: "matriz-riscos",
    secao: "condicoes",
    nome: "Matriz de riscos",
    res: [/\bmatriz de (?:alocacao de )?riscos?\b/],
    sempre: true,
  },
  {
    id: "subcontratacao",
    secao: "condicoes",
    nome: "Subcontratação",
    res: [
      /\b(?:e |sera )?vedad[ao]\s+(?:a\s+)?subcontratacao|\bnao (?:sera|e) (?:admitida|permitida) (?:a )?subcontratacao|\bsubcontratacao[^.;]{0,40}\b(?:vedada|proibida|nao (?:sera )?(?:admitida|permitida))/,
      /\bsubcontratacao[^.;]{0,80}\b(?:permitida|admitida|autorizada)\b|\b(?:e|sera) (?:permitida|admitida) (?:a )?subcontratacao/,
      /\bsubcontratacao\b/,
    ],
    temas: ["subcontratacao"],
    valor: (l) =>
      /vedad|proibid|nao (?:sera |e )?(?:admitida|permitida)/.test(l.termo)
        ? "vedada, pelo trecho"
        : /permitida|admitida|autorizada/.test(l.termo)
          ? "permitida, pelo trecho (conferir limites e condições)"
          : undefined,
    sempre: true,
  },
  {
    id: "propriedade",
    secao: "condicoes",
    nome: "Propriedade intelectual e direitos autorais",
    res: [
      /\bpropriedade intelectual\b|\bdireitos? (?:patrimoniais|autorais)\b|\bcessao (?:total |definitiva )?(?:dos )?direitos\b/,
    ],
    temas: ["propriedade"],
    sempre: true,
  },
  {
    id: "dados",
    secao: "condicoes",
    nome: "Confidencialidade e LGPD",
    res: [
      /\blgpd\b|\b13\.709\b|\bprotecao de dados pessoais\b|\bdados pessoais\b|\bsigilo\b|\bconfidencialidade\b/,
    ],
    temas: ["dados"],
    sempre: true,
  },
  {
    id: "recebimento",
    secao: "condicoes",
    nome: "Recebimento e aceite",
    res: [
      /\brecebimento (?:provisorio|definitivo)\b|\btermo de (?:aceite|recebimento)\b|\baceite d[oa]s? (?:produtos?|servicos?|entregas?)\b|\bnao aceite\b/,
    ],
    temas: ["recebimento", "pagamento"],
    sempre: true,
  },
  {
    id: "extincao",
    secao: "condicoes",
    nome: "Extinção ou rescisão",
    res: [/\bextincao (?:do contrato|contratual|da parceria)\b|\brescisao\b/],
    temas: ["extincao"],
    sempre: true,
  },
];

export function extrairTemas(docs: DocumentoRfp[], mapa: MapaRfp): ItemAnalise[] {
  const itens: ItemAnalise[] = [];
  for (const t of TEMAS_RFP) {
    const faixas = t.temas ? faixasDoTema(mapa, ...t.temas) : undefined;
    let achado: { l: Localizado; re: RegExp } | undefined;
    for (const re of t.res) {
      const l = (faixas && localizarPrimeiro(docs, re, faixas)) ?? localizarPrimeiro(docs, re);
      if (l) {
        achado = { l, re };
        break;
      }
    }
    const base = { id: `${t.secao}:${t.id}`, secao: t.secao, nome: t.nome };
    if (!achado) {
      if (t.sempre) itens.push(itemSemAchado(docs, base));
      continue;
    }
    const { l, re } = achado;
    const valor = t.valor?.(l, () => localizarTodos(docs, re));
    itens.push({
      ...base,
      rotulo: "documento",
      texto: valor ?? l.frase,
      campos: valor ? { Trecho: l.frase } : undefined,
      origem: origemDe(l),
      situacao: "localizado",
    });
  }
  return itens;
}

/** Valor resumido de um tema já extraído (para os pontos de atenção). */
export function valorDoTema(itens: ItemAnalise[], id: string): ItemAnalise | undefined {
  return itens.find((i) => i.id.endsWith(`:${id}`) && i.situacao === "localizado");
}
