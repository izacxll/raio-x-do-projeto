// Rodada seguinte da segunda instância (decisão 0071): o revisor já conferiu a resposta inteira na rodada anterior.
// Agora vão só os achados dela, o que mudou na resposta (antes e depois de cada item) e as páginas dos documentos
// citadas nesses achados e nesses itens. O resto da resposta é o mesmo que a rodada anterior conferiu.
// Economia: a rodada 2 relia de 230 a 320 mil caracteres; com o recorte, lê os achados, o diff e poucas páginas.
import type { DocumentoLido } from "../dossie/esquema";
import { type IdentidadeDoCaso, identidadeEmTexto } from "./identidade-do-caso";
import type { FontePmo } from "./schemas/comum";
import type { AchadoSegundaInstancia, RespostaSegundaInstancia } from "./schemas/segunda-instancia";

/** Um item da resposta que mudou entre a versão conferida e a de agora. */
export interface DiferencaDeItem {
  /** Caminho do item na resposta, com o id no lugar do índice: "textos[A2].itens[a2_8]". */
  caminho: string;
  situacao: "alterado" | "novo" | "removido";
  antes?: unknown;
  depois?: unknown;
}

/** O id que identifica um objeto numa lista: id, codigo, numero, item (texto) ou item.id. */
function idDe(x: unknown): string | undefined {
  if (!x || typeof x !== "object" || Array.isArray(x)) return undefined;
  const o = x as Record<string, unknown>;
  for (const k of ["id", "codigo", "numero", "item", "marco"])
    if (typeof o[k] === "string" && (o[k] as string).trim()) return o[k] as string;
  const item = o.item as Record<string, unknown> | undefined;
  if (item && typeof item === "object" && typeof item.id === "string") return item.id;
  return undefined;
}

/**
 * Achata a resposta: cada valor simples com o caminho dele e a "unidade" a que pertence (o objeto com id mais
 * próximo, ou a chave do primeiro nível). As unidades são o que o diff mostra, antes e depois.
 */
function achatar(
  x: unknown,
  caminho: string,
  unidade: string,
  folhas: Map<string, { valor: string; unidade: string }>,
  unidades: Map<string, unknown>,
): void {
  if (Array.isArray(x)) {
    const vistos = new Map<string, number>();
    x.forEach((y, k) => {
      const id = idDe(y);
      // id repetido na mesma lista: o segundo ganha o índice, para não colar dois itens num só
      const n = id ? (vistos.get(id) ?? 0) : 0;
      if (id) vistos.set(id, n + 1);
      const chave = id ? (n ? `${id}#${n + 1}` : id) : String(k);
      const c = `${caminho}[${chave}]`;
      const u = id ? c : unidade;
      if (id) unidades.set(c, y);
      achatar(y, c, u, folhas, unidades);
    });
    return;
  }
  if (x && typeof x === "object") {
    const entradas = Object.entries(x as Record<string, unknown>);
    for (const [k, v] of entradas) {
      const c = caminho ? `${caminho}.${k}` : k;
      // primeiro nível sem id: a própria chave é a unidade
      const u = caminho ? unidade : c;
      if (!caminho) unidades.set(c, v);
      achatar(v, c, u, folhas, unidades);
    }
    return;
  }
  folhas.set(caminho, { valor: JSON.stringify(x ?? null), unidade });
}

/**
 * O que mudou na resposta, item por item (o objeto com id mais próximo do valor que mudou). Item novo ou removido
 * aparece uma vez, sem repetir os itens de dentro dele.
 */
export function diferencasDaResposta(antes: unknown, depois: unknown): DiferencaDeItem[] {
  const fa = new Map<string, { valor: string; unidade: string }>();
  const fd = new Map<string, { valor: string; unidade: string }>();
  const ua = new Map<string, unknown>();
  const ud = new Map<string, unknown>();
  achatar(antes, "", "", fa, ua);
  achatar(depois, "", "", fd, ud);
  const mudaram = new Set<string>();
  for (const [c, v] of fa) if (fd.get(c)?.valor !== v.valor) mudaram.add(v.unidade);
  for (const [c, v] of fd) if (fa.get(c)?.valor !== v.valor) mudaram.add(v.unidade);
  const lista = [...mudaram].sort();
  const novoOuRemovido = (c: string) => ua.has(c) !== ud.has(c);
  // dentro de um item novo ou removido, os de dentro não se repetem
  const dentroDeOutro = (c: string) =>
    lista.some((o) => o !== c && novoOuRemovido(o) && (c.startsWith(`${o}[`) || c.startsWith(`${o}.`)));
  return lista
    .filter((c) => !dentroDeOutro(c))
    .map((c) => ({
      caminho: c,
      situacao: !ua.has(c) ? "novo" : !ud.has(c) ? "removido" : "alterado",
      ...(ua.has(c) ? { antes: ua.get(c) } : {}),
      ...(ud.has(c) ? { depois: ud.get(c) } : {}),
    }));
}

/** Todas as fontes citadas (doc, página, trecho) dentro de um valor qualquer. */
export function fontesCitadas(x: unknown): FontePmo[] {
  if (Array.isArray(x)) return x.flatMap(fontesCitadas);
  if (!x || typeof x !== "object") return [];
  const o = x as Record<string, unknown>;
  const aqui =
    typeof o.trecho === "string" && typeof o.pagina === "number" && typeof o.doc === "string"
      ? [o as unknown as FontePmo]
      : [];
  return [...aqui, ...Object.values(o).flatMap(fontesCitadas)];
}

/**
 * Os documentos só com as páginas citadas nos achados da rodada anterior e nos itens que mudaram (o "rfp" vale para
 * a RFP e os anexos, como na conferência das citações). Documento sem página citada sai inteiro do pedido.
 */
export function documentosCitados(
  documentos: DocumentoLido[],
  achados: AchadoSegundaInstancia[],
  diferencas: DiferencaDeItem[],
): DocumentoLido[] {
  const fontes = [
    ...achados.flatMap((a) => a.evidencias),
    ...diferencas.flatMap((d) => [...fontesCitadas(d.antes), ...fontesCitadas(d.depois)]),
  ];
  const doDoc = (f: FontePmo, d: DocumentoLido) =>
    f.doc === "rfp" ? d.papel === "rfp" || d.papel === "anexo-rfp" : d.papel === f.doc;
  return documentos
    .map((d) => {
      const paginas = new Set(fontes.filter((f) => doDoc(f, d)).map((f) => f.pagina));
      return { ...d, paginas: d.paginas.filter((p) => paginas.has(p.numero)) };
    })
    .filter((d) => d.paginas.length);
}

const NOME_GRAVIDADE = { alta: "alta", media: "média", baixa: "baixa" } as const;
const NOME_TIPO = {
  erro_de_fato: "erro de fato",
  faltou: "o que faltou",
  incoerencia_entre_etapas: "incoerência entre etapas",
  rotulo_errado: "rótulo errado",
} as const;

/** Um item do diff em texto: o caminho e o JSON compacto de antes e de depois. */
function diferencaEmTexto(d: DiferencaDeItem): string {
  const j = (x: unknown) => JSON.stringify(x);
  if (d.situacao === "novo") return `- **novo** \`${d.caminho}\`: ${j(d.depois)}`;
  if (d.situacao === "removido") return `- **removido** \`${d.caminho}\`: ${j(d.antes)}`;
  return `- **alterado** \`${d.caminho}\`\n  - antes: ${j(d.antes)}\n  - depois: ${j(d.depois)}`;
}

/**
 * Pedido da rodada seguinte (decisão 0071): a rubrica da rodada, os achados da anterior, o diff e o que a rodada
 * anterior conferiu. Os documentos vão à parte, só com as páginas citadas (documentosCitados).
 */
export function pedidoDaRodadaSeguinte(
  etapa: number,
  passo: string,
  rodada: number,
  anterior: RespostaSegundaInstancia,
  diferencas: DiferencaDeItem[],
  { identidade }: { identidade?: IdentidadeDoCaso } = {},
): string {
  const r0 = rodada - 1;
  return `# Segunda instância — rodada ${rodada} da conferência da etapa ${etapa}, passo ${passo}
${identidade ? `\n${identidadeEmTexto(identidade)}\n` : ""}
Você é a segunda instância, na rodada ${rodada}. A rodada ${r0} conferiu a resposta inteira, com o pedido do passo, o esqueleto do código e os documentos; os achados dela vão abaixo. Depois, a resposta foi corrigida. Vão aqui **só os itens que mudaram** (antes e depois) e, acima, **só as páginas dos documentos citadas** nos achados e nesses itens. O resto da resposta é o mesmo que a rodada ${r0} conferiu e passou.

## Achados da rodada ${r0}
${
  anterior.achados.length
    ? anterior.achados
        .map(
          (a) =>
            `- ${a.id} · ${NOME_GRAVIDADE[a.gravidade]} · ${NOME_TIPO[a.tipo]} · ${a.onde}: ${a.texto}${a.sugestao ? ` Sugestão: ${a.sugestao}` : ""}${a.evidencias.length ? ` (${a.evidencias.map((f) => `${f.doc}, p. ${f.pagina}: "${f.trecho}"`).join("; ")})` : ""}`,
        )
        .join("\n")
    : "- nenhum"
}

## O que a rodada ${r0} conferiu e passou
${anterior.conferido.length ? anterior.conferido.map((x) => `- ${x}`).join("\n") : "- (não informado)"}

## O que mudou na resposta desde a rodada ${r0} (${diferencas.length} item(ns))
${diferencas.length ? diferencas.map(diferencaEmTexto).join("\n") : "- nada mudou nos itens"}

# O que procurar
1. Cada achado da rodada ${r0}: resolvido, resolvido em parte ou não resolvido, pelo que mudou. O não resolvido volta como achado, com o mesmo id da rodada ${r0} no começo do "onde" ("s3 (rodada ${r0}) · …") e a mesma gravidade; o resolvido em parte volta com o que falta.
2. Erro novo trazido pela correção, só nos itens que mudaram: erro de fato, número ou data sem fonte, citação que não prova, rótulo errado, decisão do GP preenchida, incoerência com outro item que mudou ou com os achados.
3. Correção pela metade: o achado pedia mudar vários itens (o mesmo número, a mesma regra) e só parte deles mudou.
4. Não reconfira o que não mudou nem procure falta nova fora do diff: a rodada ${r0} já fez isso. Se um achado não puder ser julgado sem ver um item que não está aqui, diga isso em "conferido", sem inventar.

# Como responder
- achados: só os que continuam ou os novos, com tipo, gravidade (alta só quando muda escopo, prazo, preço, caixa, aceite ou quem executa; media: o GP precisa corrigir antes de aprovar; baixa: redação ou rastreabilidade), onde, texto, evidencias (doc, página do arquivo e trecho literal das páginas acima; [] quando o problema é a falta) e sugestao em redação condicional.
- conferido: uma linha por achado da rodada ${r0} resolvido ("s2 resolvido: …") e o que mais você conferiu nos itens que mudaram.
- Responda só com o objeto JSON, no schema enviado. Listas sem conteúdo ficam com [].`;
}
