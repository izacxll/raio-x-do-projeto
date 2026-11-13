// Etapa 2, passo 9 (código): conferência final da minuta. Matriz de atendimento (todo requisito pelo número e todo
// critério de pontuação ligado ao ponto da proposta que o atende), limite de páginas, declarações e anexos exigidos,
// validade da proposta e checklist de envio com o prazo de entrega.
// "Não achado não é ausente": o que o código não liga a nenhuma seção fica "não localizado na minuta — conferir".
import type { ItemAnalise } from "../../extracao/rfp/item";
import type { RespostaConteudo, RespostaEap, RespostaEstrategia } from "../../pmo/schemas/proposta";
import { normalizarTermo } from "../../regras/busca";
import type { PontoDePartida } from "./ponto-de-partida";

export interface LinhaMatriz {
  /** R01… ou o nome do critério de pontuação. */
  chave: string;
  tipo: "requisito" | "criterio";
  descricao: string;
  /** Onde a minuta atende: "Seção 3 — Metodologia", "Produto P1", "Atividade 1.2". */
  atendidoEm: string[];
  situacao: "atendido" | "nao-localizado";
  origem?: string;
}

export interface ItemChecklist {
  item: string;
  detalhe: string;
  origem?: string;
  situacao: "a-conferir" | "nao-localizado";
}

export interface ConferenciaFinal {
  matriz: LinhaMatriz[];
  paginasEstimadas: number;
  limitePaginas?: { paginas: number; texto: string; situacao: "cabe" | "passa" };
  checklist: ItemChecklist[];
}

const onde = (i?: ItemAnalise) => (i?.origem ? `${i.origem.documento}, p. ${i.origem.pagina}` : undefined);

/** Caracteres por página de proposta (A4, fonte 11, espaço simples): só estimativa, o arquivo final manda. */
export const CARACTERES_POR_PAGINA = 3000;

export function textoDaPropostaTecnica(c: RespostaConteudo): string {
  return [
    ...c.estrutura.flatMap((s) => [s.titulo, ...s.itens.map((i) => i.texto)]),
    ...c.produtos.flatMap((p) => [p.nome, p.descricao, ...p.criteriosAceite]),
    ...c.exclusoes.map((i) => i.texto),
    ...c.premissas.flatMap((p) => [p.item.texto, p.consequencia]),
    ...c.restricoes.map((i) => i.texto),
    ...c.obrigacoesContratante.flatMap((o) => [o.item.texto, o.prazo]),
  ].join("\n");
}

export function conferirMinuta(
  p: PontoDePartida,
  e: RespostaEstrategia | undefined,
  c: RespostaConteudo | undefined,
  eap: RespostaEap | undefined,
): ConferenciaFinal {
  const matriz: LinhaMatriz[] = p.requisitos.map((r) => {
    const atendidoEm = [
      ...(c?.estrutura ?? [])
        .map((s, i) => ({ s, i }))
        .filter(({ s }) => s.itens.some((it) => it.requisitos.includes(r.numero)))
        .map(({ s, i }) => `Seção ${i + 1} — ${s.titulo}`),
      ...(c?.produtos ?? [])
        .filter((x) => x.requisitos.includes(r.numero))
        .map((x) => `Produto ${x.id} — ${x.nome}`),
      ...(
        [
          ["Exclusões", c?.exclusoes ?? []],
          ["Premissas", c?.premissas.map((x) => x.item) ?? []],
          ["Restrições", c?.restricoes ?? []],
          ["Obrigações do contratante", c?.obrigacoesContratante.map((x) => x.item) ?? []],
        ] as const
      )
        .filter(([, itens]) => itens.some((it) => it.requisitos.includes(r.numero)))
        .map(([nome]) => `SOW — ${nome}`),
      ...(eap?.atividades ?? [])
        .filter((a) => a.requisitos.includes(r.numero))
        .map((a) => `Atividade ${a.id}`),
      ...(eap?.perfis ?? []).filter((x) => x.requisito === r.numero).map((x) => `Equipe — ${x.nome}`),
    ];
    return {
      chave: r.numero,
      tipo: "requisito",
      descricao: `${r.rotulo}: ${r.descricao}`,
      atendidoEm,
      situacao: atendidoEm.length ? "atendido" : "nao-localizado",
      origem: r.pagina ? `${r.documento ?? "RFP"}, p. ${r.pagina}` : "incluído pelo GP",
    };
  });
  for (const cr of e?.criterios ?? []) {
    const alvo = normalizarTermo(cr.criterio);
    const atendidoEm = (c?.estrutura ?? [])
      .map((s, i) => ({ s, i }))
      .filter(
        ({ s }) =>
          s.criterio &&
          (normalizarTermo(s.criterio) === alvo ||
            normalizarTermo(s.criterio).includes(alvo) ||
            alvo.includes(normalizarTermo(s.criterio))),
      )
      .map(({ s, i }) => `Seção ${i + 1} — ${s.titulo}`);
    matriz.push({
      chave: cr.criterio,
      tipo: "criterio",
      descricao: `${cr.oQuePontua}${cr.pontuacaoMaxima ? ` (${cr.pontuacaoMaxima})` : ""}`,
      atendidoEm,
      situacao: atendidoEm.length ? "atendido" : "nao-localizado",
      origem: cr.fontes[0] ? `RFP, p. ${cr.fontes[0].pagina}` : undefined,
    });
  }

  const paginasEstimadas = c
    ? Math.max(1, Math.ceil(textoDaPropostaTecnica(c).length / CARACTERES_POR_PAGINA))
    : 0;
  const limitePaginas = p.limitePaginas
    ? {
        paginas: p.limitePaginas.paginas,
        situacao: (paginasEstimadas <= p.limitePaginas.paginas ? "cabe" : "passa") as "cabe" | "passa",
        texto: `Limite do edital: ${p.limitePaginas.paginas} páginas (${onde(p.limitePaginas.item)}). Minuta: cerca de ${paginasEstimadas} páginas (estimativa do código, ${CARACTERES_POR_PAGINA} caracteres por página; conferir no arquivo final).`,
      }
    : undefined;

  const checklist: ItemChecklist[] = [];
  const add = (item: string, fonte: ItemAnalise | undefined, semAchado: string) =>
    checklist.push(
      fonte
        ? { item, detalhe: fonte.texto, origem: onde(fonte), situacao: "a-conferir" }
        : { item, detalhe: semAchado, situacao: "nao-localizado" },
    );
  const NAO = "não localizado pelo código — conferir no documento";
  const entrega = p.entregaDaProposta;
  add(
    "Prazo de entrega da proposta",
    entrega && {
      ...entrega,
      texto: `${entrega.nome}: ${entrega.texto}${entrega.campos?.Alerta ? ` — ${entrega.campos.Alerta}` : ""}`,
    },
    NAO,
  );
  add("Limite para pedir esclarecimento", p.limiteEsclarecimento, NAO);
  add("Validade da proposta", p.validadeDaProposta, NAO);
  add(
    "Modelo obrigatório de proposta",
    p.modeloObrigatorio,
    "o código não localizou modelo obrigatório — conferir no documento",
  );
  add("Planilha de preços do edital", p.planilhaDoEdital, NAO);
  for (const a of p.apresentacao.filter(
    (i) =>
      !["apresentacao:modelo-proposta", "apresentacao:planilha"].includes(i.id) &&
      i.situacao === "localizado",
  ))
    add(a.nome, a, NAO);
  for (const h of p.habilitacao.filter((i) => i.situacao === "localizado"))
    add(`Habilitação: ${h.nome}`, h, NAO);
  if (limitePaginas)
    checklist.push({
      item: "Limite de páginas",
      detalhe: limitePaginas.texto,
      origem: onde(p.limitePaginas?.item),
      situacao: "a-conferir",
    });
  return { matriz, paginasEstimadas, limitePaginas, checklist };
}
