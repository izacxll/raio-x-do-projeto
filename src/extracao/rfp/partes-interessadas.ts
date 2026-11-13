// Partes interessadas citadas (etapa 1, passo 9): contratante, áreas e órgãos citados, quem conduz o certame,
// fiscal e gestor do contrato e o público-alvo. Ponto de partida do registro de partes interessadas (PMBOK 13.1).
import { normalizarTermo } from "../../regras/busca";
import { fraseEmVolta, limparEspacos } from "../../texto/frase";
import { type DocumentoRfp, type ItemAnalise } from "./item";
import { localizarPrimeiro, origemDe } from "./localizar";

const UNIDADES = [
  "Ministério",
  "Secretaria",
  "Departamento",
  "Diretoria",
  "Coordenação",
  "Coordenadoria",
  "Coordenação-Geral",
  "Gerência",
  "Divisão",
  "Assessoria",
  "Superintendência",
  "Núcleo",
  "Conselho",
  "Fundação",
  "Tribunal de Contas",
  "Controladoria",
  "Procuradoria",
  "Ouvidoria",
  "Agência",
  "Instituto",
];
const ALTERNATIVAS = UNIDADES.flatMap((u) => [u, u.toUpperCase()]).join("|");
const CONECTOR = "de|da|do|das|dos|e|para|a|DE|DA|DO|DAS|DOS|E|PARA";
/** Nome próprio de unidade: a palavra-chave e palavras com maiúscula (ou conectores) em seguida. */
const RE_UNIDADE = new RegExp(
  `\\b(?:${ALTERNATIVAS})(?:[ \\t]+(?:(?:${CONECTOR})\\b|[A-ZÀ-Ý][\\wÀ-ÿ-]*)){1,9}`,
  "g",
);

function unidadesCitadas(docs: DocumentoRfp[]): ItemAnalise[] {
  const contagem = new Map<
    string,
    { nome: string; n: number; doc: DocumentoRfp; pagina: number; posicao: number; texto: string }
  >();
  for (const doc of docs) {
    for (const p of doc.paginas) {
      for (const m of p.texto.matchAll(RE_UNIDADE)) {
        const nome = limparEspacos(m[0]).replace(new RegExp(`(?:\\s+(?:${CONECTOR}))+$`), "");
        if (nome.split(" ").length < 2) continue;
        // "Secretaria Municipal" sozinha não identifica a área
        if (
          /^(?:\S+)\s+(?:Municipal|Estadual|Nacional|Executiva|Geral|MUNICIPAL|ESTADUAL|NACIONAL)$/.test(nome)
        )
          continue;
        const chave = normalizarTermo(nome);
        const atual = contagem.get(chave);
        if (atual) atual.n++;
        else
          contagem.set(chave, { nome, n: 1, doc, pagina: p.numero, posicao: m.index ?? 0, texto: p.texto });
      }
    }
  }
  return [...contagem.entries()]
    .sort((a, b) => b[1].n - a[1].n)
    .slice(0, 15)
    .map(([chave, c]) => ({
      id: `partes:unidade:${chave.replace(/\s+/g, "-")}`,
      secao: "partes" as const,
      rotulo: "documento" as const,
      nome: "Órgão ou área citada",
      texto: c.nome,
      campos: { Citações: String(c.n) },
      origem: { documento: c.doc.rotulo, pagina: c.pagina, trecho: fraseEmVolta(c.texto, c.posicao) },
      situacao: "localizado" as const,
    }));
}

const PAPEIS: { id: string; nome: string; re: RegExp }[] = [
  {
    id: "conduz",
    nome: "Quem conduz o certame",
    re: /\bagente de contratacao\b|\bpregoeir[oa]\b|\bcomissao (?:de (?:selecao|contratacao|avaliacao|credenciamento|licitacao)|permanente)\b/,
  },
  { id: "gestor", nome: "Gestor do contrato", re: /\bgestor(?:es)? (?:do contrato|da parceria|do termo)\b/ },
  {
    id: "fiscal",
    nome: "Fiscal do contrato",
    re: /\bfisca(?:l|is) (?:tecnico |administrativo |setorial )?(?:do contrato|da parceria|do termo)\b/,
  },
  {
    id: "publico",
    nome: "Público-alvo ou beneficiários",
    re: /\bpublico[- ]alvo\b|\bbeneficiari[oa]s\b|\bdestinatari[oa]s (?:das acoes|do projeto|do programa)\b/,
  },
];

export function extrairPartesInteressadas(docs: DocumentoRfp[], contratante?: ItemAnalise): ItemAnalise[] {
  const itens: ItemAnalise[] = [];
  if (contratante?.situacao === "localizado")
    itens.push({ ...contratante, id: "partes:contratante", secao: "partes", nome: "Contratante" });
  for (const p of PAPEIS) {
    const l = localizarPrimeiro(docs, p.re);
    if (!l) continue;
    itens.push({
      id: `partes:${p.id}`,
      secao: "partes",
      rotulo: "documento",
      nome: p.nome,
      texto: l.frase,
      origem: origemDe(l),
      situacao: "localizado",
      nota:
        p.id === "gestor" || p.id === "fiscal"
          ? "O nome da pessoa costuma ser definido só depois da assinatura."
          : undefined,
    });
  }
  itens.push(...unidadesCitadas(docs));
  return itens;
}
