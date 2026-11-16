// Dinheiro (método da etapa 1, seção 3.4): o cronograma de desembolso ou de medição (parcela, percentual e prazo),
// a condição de cada pagamento ("após aprovação", "mediante aceite"), o que retém ou glosa, a contrapartida, as
// despesas vedadas e o "não obriga a contratar". Tudo com a página e o trecho; as somas são do código.
import { normalizarTermo } from "../../regras/busca";
import { limparEspacos } from "../../texto/frase";
import { tirarAcentos } from "../../texto/normalizar";
import { ehDoCertame, lerClausulas, trechoDaClausula, type Clausula } from "./clausulas";
import type { DocumentoRfp, OrigemItem } from "./item";
import type { MapaRfp } from "./mapa";

export interface ParcelaDesembolso {
  /** "Produto 1 – Plano de trabalho", "1ª parcela". */
  rotulo: string;
  percentual: number;
  /** "30 dias", quando a linha traz o prazo. */
  prazo?: string;
  origem: OrigemItem;
}

export interface Desembolso {
  parcelas: ParcelaDesembolso[];
  /** "parcela única", quando o texto diz. */
  unica?: OrigemItem;
  soma: number;
}

export type TipoAchadoDinheiro =
  | "condicao"
  | "glosa"
  | "contrapartida"
  | "nao-obriga"
  | "despesa-vedada"
  | "prazo-pagamento"
  | "atraso-pagamento";

export interface AchadoDinheiro {
  tipo: TipoAchadoDinheiro;
  texto: string;
  origem: OrigemItem;
  /** A condição traz prazo para o contratante cumprir (aprovar, atestar)? */
  comPrazo?: boolean;
}

export const NOME_ACHADO_DINHEIRO: Record<TipoAchadoDinheiro, string> = {
  condicao: "Condição do pagamento",
  glosa: "Glosa, retenção ou devolução",
  contrapartida: "Contrapartida",
  "nao-obriga": "A seleção não obriga a contratar",
  "despesa-vedada": "Despesas vedadas",
  "prazo-pagamento": "Prazo de pagamento",
  "atraso-pagamento": "Atraso no pagamento",
};

/** Linha de tabela com rótulo e percentual no fim: "Produto 1 – Plano de trabalho da consultoria 30 5%". */
const RE_LINHA_PARCELA =
  /^((?:produto|parcela|etapa|entrega|medicao|meta|fase)\s*(?:n[º°o.]\s*)?\d{1,2}\b.*?|\d{1,2}\s*[ªa]\s*parcela.*?)\s+(?:(\d{1,4})\s+)?(\d{1,3}(?:,\d{1,2})?)\s*%\s*$/i;
const RE_PARCELA_UNICA =
  /\b(?:parcela unica|unica parcela|de forma integral(?:,)? em parcela unica|repasse unico|pagamento unico)\b/;

const CONDICAO =
  /\b(?:apos (?:a |o )?(?:aprovacao|aceite|ateste|atesto|recebimento definitivo|validacao|homologacao|analise)|mediante (?:a |o )?(?:aprovacao|aceite|ateste|atesto|apresentacao|comprovacao|validacao)|condicionad[oa]s? (?:a|ao|à)|somente (?:apos|mediante)|precedid[oa] d[ao] (?:comprovacao|aprovacao|aceite|recebimento))\b/;
const PAGAMENTO =
  /\b(?:pagamento|pagamentos|desembolso|repasse|liberacao (?:dos? )?(?:recursos?|parcela)|nota fiscal|fatura|parcelas?)\b/;
const GLOSA =
  /\b(?:glosad[oa]s?|glosa|reten(?:cao|cao)|retid[oa]s?|descontad[oa]s?|devolu(?:cao|cao) (?:do|dos|de) (?:saldo|recursos|valores)|restituid[oa]s?|restituir|saldo remanescente)\b/;
const CONTRAPARTIDA = /\bcontrapartida\b/;
const NAO_OBRIGA =
  /\b(?:nao (?:obriga|gera (?:obrigacao|direito)|implica (?:obrigatoriedade|obrigacao))|nao tem(?:m)? direito subjetivo|mera expectativa de direito|nao assegura (?:a|o) (?:celebracao|contratacao))\b/;
const DESPESA_VEDADA =
  /\b(?:(?:e |sao |ficam? |sera |serao )?vedad[oa]s? (?:a |o )?(?:utilizacao|pagamento|realizacao de despesa|despesas?)|despesas? (?:vedadas|nao permitidas|nao admitidas))\b/;
const PRAZO_PAGAMENTO = /\bpagamento\b.{0,60}\bno prazo (?:maximo )?de (?:ate )?\d{1,3}/;
const ATRASO =
  /\batraso\b.{0,80}\b(?:pagamento|repasse|liberacao)\b|\b(?:pagamento|repasse|liberacao)\b.{0,60}\batras/;

function percentual(texto: string): number {
  return Number(texto.replace(",", "."));
}

/** Cronograma de desembolso: as linhas de tabela com rótulo e percentual, e o "parcela única". */
export function extrairDesembolso(docs: DocumentoRfp[]): Desembolso {
  const parcelas: ParcelaDesembolso[] = [];
  let unica: OrigemItem | undefined;
  for (const doc of docs)
    for (const p of doc.paginas) {
      if (p.origem === "nao-verificavel") continue;
      const linhas = p.texto.split("\n");
      linhas.forEach((linha) => {
        const limpa = limparEspacos(linha.replace(/\t+/g, " "));
        const m = RE_LINHA_PARCELA.exec(limpa);
        if (!m?.[1] || !m[3]) return;
        const pct = percentual(m[3]);
        if (!pct || pct > 100) return;
        const rotulo = m[1].replace(/\s+\d{1,4}$/, "").trim();
        // a mesma parcela em duas tabelas (o TR e a minuta) entra uma vez
        if (parcelas.some((x) => normalizarTermo(x.rotulo) === normalizarTermo(rotulo))) return;
        parcelas.push({
          rotulo,
          percentual: pct,
          prazo: m[2] ? `${m[2]} dias` : undefined,
          origem: { documento: doc.rotulo, pagina: p.numero, trecho: limpa },
        });
      });
      if (!unica) {
        const n = tirarAcentos(p.texto.replace(/\s+/g, " "));
        const m = RE_PARCELA_UNICA.exec(n);
        if (m) {
          const ini = Math.max(0, n.lastIndexOf(". ", m.index) + 2);
          const fim = n.indexOf(".", m.index + m[0].length);
          const original = p.texto.replace(/\s+/g, " ");
          unica = {
            documento: doc.rotulo,
            pagina: p.numero,
            trecho: original.slice(ini, fim < 0 ? undefined : fim + 1).trim(),
          };
        }
      }
    }
  // só vale como cronograma se as parcelas somam perto de 100% (senão são percentuais soltos de outra tabela)
  const soma = Math.round(parcelas.reduce((s, x) => s + x.percentual, 0) * 100) / 100;
  if (parcelas.length < 2 || soma < 90 || soma > 110) return { parcelas: [], unica, soma: 0 };
  return { parcelas, unica, soma };
}

function tipoDaClausula(c: Clausula): TipoAchadoDinheiro[] {
  const n = normalizarTermo(c.texto);
  const out: TipoAchadoDinheiro[] = [];
  if (CONDICAO.test(n) && PAGAMENTO.test(n)) out.push("condicao");
  if (GLOSA.test(n) && !/\bpenalidade|\bmulta\b/.test(n.slice(0, 60))) out.push("glosa");
  // contrapartida dita numa regra (com verbo), não o rótulo de um campo do formulário ("Contrapartida (Se houver)")
  if (
    CONTRAPARTIDA.test(n) &&
    /\b(?:sera|serao|devera|deverao|exigid[oa]|prestar|nao ha|nao havera|admitid[oa])\b/.test(n)
  )
    out.push("contrapartida");
  if (NAO_OBRIGA.test(n)) out.push("nao-obriga");
  if (DESPESA_VEDADA.test(n)) out.push("despesa-vedada");
  if (PRAZO_PAGAMENTO.test(n)) out.push("prazo-pagamento");
  if (ATRASO.test(n)) out.push("atraso-pagamento");
  return out;
}

/** Condição sem prazo para o contratante: "após aprovação" sem "no prazo de N dias" na mesma cláusula. */
const RE_PRAZO_DO_CONTRATANTE =
  /\b(?:no prazo de|em ate|ate)\s+(?:\d{1,3})\s*(?:\([^)]{1,25}\)\s*)?(?:dias?|horas?)\b/;

/** Achados de dinheiro, no máximo `limite` por tipo, sem repetir a mesma frase. */
export function extrairDinheiro(docs: DocumentoRfp[], mapa: MapaRfp, limite = 3): AchadoDinheiro[] {
  const out: AchadoDinheiro[] = [];
  const porTipo = new Map<TipoAchadoDinheiro, number>();
  const vistas = new Set<string>();
  for (const c of lerClausulas(docs, mapa)) {
    for (const tipo of tipoDaClausula(c)) {
      // no certame, só o "não obriga a contratar": devolução de envelope não é glosa
      if (tipo !== "nao-obriga" && ehDoCertame(c)) continue;
      const n = porTipo.get(tipo) ?? 0;
      if (n >= limite) continue;
      const chave = `${tipo}:${normalizarTermo(c.texto).slice(0, 80)}`;
      if (vistas.has(chave)) continue;
      vistas.add(chave);
      porTipo.set(tipo, n + 1);
      const trecho = trechoDaClausula(c);
      out.push({
        tipo,
        texto: trecho.replace(/^(?:\d{1,2}(?:\.\d{1,2}){0,4}\.?|[a-z]\))\s*/, ""),
        origem: { documento: c.doc.rotulo, pagina: c.pagina, trecho },
        comPrazo: tipo === "condicao" ? RE_PRAZO_DO_CONTRATANTE.test(normalizarTermo(c.texto)) : undefined,
      });
    }
  }
  return out;
}
