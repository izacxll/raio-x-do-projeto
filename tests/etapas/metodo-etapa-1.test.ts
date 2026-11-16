// Placar do método da etapa 1 (decisão 0034): a leitura nova (8 seções) e a análise antiga (inventário) contra os
// gabaritos do PMO na estrutura do método, para o chamamento da SMPED (parceria) e a concorrência da OEI
// (licitação). Mede: itens que passam no teste do método (casam com um item do gabarito), itens que não passam
// (o que a leitura mostra e o gabarito não tem), cobertura das seções, números sem fonte e citações conferidas.
// O placar sai no console (npx vitest run tests/etapas/metodo-etapa-1.test.ts) e em docs/estudos/.
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import type { DocumentoLido } from "../../src/dossie/esquema";
import { analisarRfp, type AnaliseRfp } from "../../src/etapas/1-rfp/analisar-rfp";
import {
  montarLeituraRfp,
  SECOES_LEITURA,
  type ItemLeitura,
  type LeituraRfp,
} from "../../src/etapas/1-rfp/leitura";
import { combinarLeitura, conferirLeituraRfp } from "../../src/etapas/1-rfp/leitura-pmo";
import { analiseInicial, requisitoComoItem } from "../../src/etapas/1-rfp/revisao";
import { RespostaLeituraRfp } from "../../src/pmo/schemas/leitura-rfp";
import type { ItemAnalise } from "../../src/extracao/rfp/item";
import { citacaoValeComoFato, conferirCitacao } from "../../src/pmo/citacoes";
import { tirarAcentos } from "../../src/texto/normalizar";
import { lerRfpPublica } from "../ajudantes/rfp-publica";

interface ItemGabarito {
  id: string;
  nome: string;
  chaves: string[];
  fontes: { doc: "rfp"; pagina: number; trecho: string }[];
}
interface Gabarito {
  rfp: string;
  modalidade: "parceria" | "licitacao";
  secoes: Record<string, ItemGabarito[]>;
}

const HOJE = new Date(2026, 10, 16);
const CASOS = [
  { nome: "SMPED", gabarito: "rfp-smped", pdf: "chamamento-publico-termo-fomento-smped-sp-2025.pdf" },
  {
    nome: "OEI",
    gabarito: "rfp-oei",
    pdf: "concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf",
  },
] as const;

const normal = (t: string) => tirarAcentos(t).replace(/\s+/g, " ");

function textoDaLeitura(i: ItemLeitura): string {
  return normal(
    [i.nome, i.texto, i.origem?.trecho ?? "", i.pergunta ?? "", ...(i.tabela?.linhas.flat() ?? [])].join(" "),
  );
}
function textoDaAnalise(i: ItemAnalise): string {
  return normal([i.nome, i.texto, i.origem?.trecho ?? "", ...Object.values(i.campos ?? {})].join(" "));
}
/**
 * O item do app cobre o do gabarito quando tem a maioria das chaves (2 de 3, 1 de 2): o gabarito junta num item o
 * que o app às vezes separa em dois (o requisito R e a obrigação do mesmo tema). "Pleno" exige todas.
 */
const acertos = (g: ItemGabarito, texto: string) => g.chaves.filter((c) => new RegExp(c).test(texto)).length;
const casa = (g: ItemGabarito, texto: string) => acertos(g, texto) >= Math.ceil(g.chaves.length / 2);
const casaPleno = (g: ItemGabarito, texto: string) => acertos(g, texto) === g.chaves.length;

/** Números do texto que precisam de fonte: tira páginas, números R, PC e contagens feitas pelo código. */
function numerosDoTexto(t: string): string[] {
  const limpo = normal(t)
    .replace(/\bp\. ?\d+/g, " ")
    .replace(/\br\d{2}\b/g, " ")
    .replace(/\bpc\d\b/g, " ")
    .replace(
      /\b\d{1,3} (?:obrigac\w+|criterios?|parcelas|documentos|trechos|pontos|normas|perfis?|produtos?|prazos?|itens)\b/g,
      " ",
    )
    .replace(/\(\d+(?:, linha a linha)?/g, " ");
  return (limpo.match(/\d[\d.,/]*\d|\d/g) ?? []).map((n) => n.replace(/[.,]$/, ""));
}

function numerosSemFonte(l: LeituraRfp, doc: DocumentoLido): { item: string; numero: string }[] {
  const out: { item: string; numero: string }[] = [];
  const paginas = new Map(doc.paginas.map((p) => [p.numero, normal(p.texto)]));
  for (const i of l.itens) {
    if (i.situacao === "calculado" || i.rotulo === "decisao-gp") continue;
    const citadas = [...i.texto.matchAll(/p\. ?(\d+)/g)].map((m) => Number(m[1]));
    const fonte = [
      i.origem?.trecho ?? "",
      ...(i.tabela?.linhas.flat() ?? []),
      ...[i.origem?.pagina, ...citadas].map((p) => (p ? (paginas.get(p) ?? "") : "")),
      ...(i.tabela?.linhas.map((l) => paginas.get(Number(l.at(-1))) ?? "") ?? []),
    ]
      .map(normal)
      .join(" ");
    const compacta = fonte.replace(/[^0-9]/g, " ");
    for (const n of numerosDoTexto(i.texto)) {
      const digitos = n.replace(/[^0-9]/g, "");
      if (fonte.includes(n) || compacta.includes(digitos) || fonte.replace(/[.\s]/g, "").includes(digitos))
        continue;
      out.push({ item: i.id, numero: n });
    }
  }
  return out;
}

interface Placar {
  caso: string;
  antes: { itens: number; passam: number; naoPassam: number; cobertos: number; plenos: number };
  depois: {
    requisitos: number;
    itens: number;
    passam: number;
    naoPassam: number;
    cobertos: number;
    plenos: number;
    naSecaoCerta: number;
  };
  gabarito: number;
  secoes: { secao: string; gabarito: number; antes: number; depois: number }[];
  semFonte: { item: string; numero: string }[];
  citacoesNaoConferidas: string[];
  naoPassam: string[];
  faltam: string[];
}

const placares: Placar[] = [];
const dados = new Map<string, { doc: DocumentoLido; a: AnaliseRfp; l: LeituraRfp; g: Gabarito }>();

beforeAll(async () => {
  for (const c of CASOS) {
    const doc = await lerRfpPublica(c.pdf, HOJE);
    const a = analisarRfp([doc], HOJE);
    const l = montarLeituraRfp(a, analiseInicial(a, HOJE), HOJE);
    const g = JSON.parse(
      readFileSync(
        new URL(`../fixtures/gerados/${c.gabarito}/gabarito-metodo-etapa-1.json`, import.meta.url),
        "utf8",
      ),
    ) as Gabarito;
    dados.set(c.nome, { doc, a, l, g });
    placares.push(placar(c.nome, doc, a, l, g));
  }
  console.log(formatarPlacar(placares));
}, 180000);

function placar(caso: string, doc: DocumentoLido, a: AnaliseRfp, l: LeituraRfp, g: Gabarito): Placar {
  const doGabarito = Object.entries(g.secoes).flatMap(([secao, itens]) =>
    itens.map((i) => ({ ...i, secao })),
  );
  const contaveis = doGabarito.filter((i) => i.secao !== "nao-se-aplica");
  // antes: a análise de inventário, com os requisitos numerados (o que a tela mostrava na v0.8.3)
  const antigos = [
    ...a.itens,
    // os requisitos como eram na v0.8.3: sem as obrigações de quem executa, que a M1 numerou
    ...a.requisitosDoCodigo.filter((r) => r.tipo !== "obrigacao").map(requisitoComoItem),
  ];
  const textosAntigos = antigos.map((i) => ({ i, t: textoDaAnalise(i) }));
  const novos = l.itens.map((i) => ({ i, t: textoDaLeitura(i) }));
  const antigoPassa = textosAntigos.filter(({ t }) => doGabarito.some((g) => casa(g, t)));
  const novoPassa = novos.filter(({ t }) => doGabarito.some((g) => casa(g, t)));
  const cobertosAntes = contaveis.filter((g) => textosAntigos.some(({ t }) => casa(g, t)));
  const cobertosDepois = contaveis.filter((g) => novos.some(({ t }) => casa(g, t)));
  const naSecaoCerta = contaveis.filter((g) => novos.some(({ i, t }) => i.secao === g.secao && casa(g, t)));
  const plenosAntes = contaveis.filter((g) => textosAntigos.some(({ t }) => casaPleno(g, t))).length;
  const plenosDepois = contaveis.filter((g) => novos.some(({ t }) => casaPleno(g, t))).length;
  const citacoesNaoConferidas = l.itens
    .filter((i) => i.origem?.trecho && i.situacao !== "calculado")
    .filter((i) => {
      const r = conferirCitacao(
        { doc: "rfp", pagina: i.origem?.pagina ?? 0, trecho: i.origem?.trecho ?? "" },
        [doc],
      );
      return !citacaoValeComoFato(r);
    })
    .map((i) => i.id);
  // a meta de 30 a 50 vale para os cartões; os requisitos R são linhas de uma tabela da seção 2
  const contaveisNovos = l.itens.filter((i) => i.secao !== "nao-se-aplica" && !i.numero);
  return {
    caso,
    gabarito: contaveis.length,
    antes: {
      itens: antigos.length,
      passam: antigoPassa.length,
      naoPassam: antigos.length - antigoPassa.length,
      cobertos: cobertosAntes.length,
      plenos: plenosAntes,
    },
    depois: {
      requisitos: l.itens.filter((i) => i.numero).length,
      itens: contaveisNovos.length,
      passam: novoPassa.filter(({ i }) => i.secao !== "nao-se-aplica" && !i.numero).length,
      naoPassam:
        contaveisNovos.length - novoPassa.filter(({ i }) => i.secao !== "nao-se-aplica" && !i.numero).length,
      cobertos: cobertosDepois.length,
      plenos: plenosDepois,
      naSecaoCerta: naSecaoCerta.length,
    },
    secoes: SECOES_LEITURA.map((s) => ({
      secao: s.id,
      gabarito: (g.secoes[s.id] ?? []).length,
      antes: (g.secoes[s.id] ?? []).filter((x) => textosAntigos.some(({ t }) => casa(x, t))).length,
      depois: (g.secoes[s.id] ?? []).filter((x) => novos.some(({ i, t }) => i.secao === s.id && casa(x, t)))
        .length,
    })),
    semFonte: numerosSemFonte(l, doc),
    citacoesNaoConferidas,
    naoPassam: novos
      .filter(({ t }) => !doGabarito.some((g) => casa(g, t)))
      .map(({ i }) => `${i.secao} · ${i.nome}`),
    faltam: contaveis
      .filter((g) => !novos.some(({ t }) => casa(g, t)))
      .map((g) => `${g.secao} · ${g.id} ${g.nome}`),
  };
}

function formatarPlacar(ps: Placar[]): string {
  const linhas: string[] = [];
  for (const p of ps) {
    linhas.push(
      `\n=== ${p.caso} — gabarito: ${p.gabarito} itens (seções 1 a 7)`,
      `antes:  ${p.antes.itens} itens; passam ${p.antes.passam}; não passam ${p.antes.naoPassam}; gabarito coberto ${p.antes.cobertos}/${p.gabarito} (pleno ${p.antes.plenos})`,
      `depois: ${p.depois.itens} cartões + ${p.depois.requisitos} R; passam ${p.depois.passam}; não passam ${p.depois.naoPassam}; gabarito coberto ${p.depois.cobertos}/${p.gabarito} (pleno ${p.depois.plenos}; na seção certa ${p.depois.naSecaoCerta})`,
      `números sem fonte: ${p.semFonte.length} ${JSON.stringify(p.semFonte)}`,
      `citações não conferidas: ${p.citacoesNaoConferidas.length} ${p.citacoesNaoConferidas.join(", ")}`,
      ...p.secoes.map(
        (s) => `  ${s.secao.padEnd(18)} gabarito ${s.gabarito}  antes ${s.antes}  depois ${s.depois}`,
      ),
      `não passam: ${p.naoPassam.join(" | ")}`,
      `faltam: ${p.faltam.join(" | ")}`,
    );
  }
  return linhas.join("\n");
}

describe("método da etapa 1 — placar contra os gabaritos", () => {
  it("as citações dos gabaritos estão na página indicada", () => {
    for (const c of CASOS) {
      const d = dados.get(c.nome);
      if (!d) throw new Error(c.nome);
      const falhas = Object.values(d.g.secoes)
        .flat()
        .flatMap((i) => i.fontes.map((f) => ({ id: i.id, f, r: conferirCitacao(f, [d.doc]) })))
        .filter((x) => !citacaoValeComoFato(x.r) || x.r.pagina !== x.f.pagina)
        .map((x) => `${c.nome} ${x.id} p.${x.f.pagina}`);
      expect(falhas).toEqual([]);
    }
  });

  it("a leitura cabe na meta do método (30 a 50 itens nas seções 1 a 7)", () => {
    for (const p of placares) {
      expect(p.depois.itens, p.caso).toBeGreaterThanOrEqual(30);
      expect(p.depois.itens, p.caso).toBeLessThanOrEqual(50);
    }
  });

  it("nenhum número sem fonte e toda citação da leitura conferida na página", () => {
    for (const p of placares) {
      expect(p.semFonte, p.caso).toEqual([]);
      expect(p.citacoesNaoConferidas, p.caso).toEqual([]);
    }
  });

  it("cobre as seções do método e mais do gabarito que a análise antiga, com menos itens que não passam", () => {
    for (const p of placares) {
      // toda seção do gabarito com pelo menos um item coberto na seção certa
      for (const s of p.secoes.filter((x) => x.gabarito > 0 && x.secao !== "nao-se-aplica"))
        expect(s.depois, `${p.caso} ${s.secao}`).toBeGreaterThan(0);
      expect(p.depois.cobertos, p.caso).toBeGreaterThan(p.antes.cobertos);
      expect(p.depois.naoPassam, p.caso).toBeLessThan(p.antes.naoPassam);
    }
  });
});

describe("método da etapa 1 — leitura do PMO conferida pelo código (decisão 0035)", () => {
  function gravada(pasta: string): RespostaLeituraRfp {
    return RespostaLeituraRfp.parse(
      JSON.parse(
        readFileSync(new URL(`../fixtures/gerados/${pasta}/leitura-pmo.json`, import.meta.url), "utf8"),
      ),
    );
  }

  it("a leitura gravada passa no schema e as citações dela estão na página", () => {
    for (const [caso, pasta] of [
      ["SMPED", "rfp-smped"],
      ["OEI", "rfp-oei"],
    ] as const) {
      const d = dados.get(caso);
      if (!d) throw new Error(caso);
      const c = conferirLeituraRfp(gravada(pasta), [d.doc], d.l, analiseInicial(d.a, HOJE), HOJE);
      expect(
        c.filter((x) => x.trava === "citacao-nao-conferida").map((x) => x.item.id),
        caso,
      ).toEqual([]);
      const l = combinarLeitura(d.l, c);
      expect(l.fonte).toBe("pmo");
      // as contas do código ficam (situação das datas) e os requisitos numerados também
      expect(
        l.itens.some((i) => i.id === "leitura:situacao"),
        caso,
      ).toBe(true);
      expect(l.itens.filter((i) => i.numero).length, caso).toBe(d.l.itens.filter((i) => i.numero).length);
    }
  });

  it("as travas pegam a citação falsa, o número trocado, o R inventado e a conta do PMO", () => {
    const d = dados.get("SMPED");
    if (!d) throw new Error("SMPED");
    const base = gravada("rfp-smped").itens[0];
    if (!base) throw new Error("vazia");
    const plantados: RespostaLeituraRfp = {
      itens: [
        {
          ...base,
          id: "X1",
          fontes: [
            {
              doc: "rfp",
              pagina: 1,
              trecho: "a parceira receberá adiantamento integral antes da assinatura do termo",
            },
          ],
        },
        { ...base, id: "X2", texto: "Teto de R$ 250.000,00 por projeto." },
        { ...base, id: "X3", requisitos: ["R99"] },
        { ...base, id: "X4", rotulo: "sugestao", fontes: [], texto: "Faltam 413 dias para o envio." },
        { ...base, id: "X5", rotulo: "documento", fontes: [] },
      ],
    };
    const c = conferirLeituraRfp(plantados, [d.doc], d.l, analiseInicial(d.a, HOJE), HOJE);
    const por = (id: string) => c.find((x) => x.item.id === id);
    expect(por("X1")?.trava).toBe("citacao-nao-conferida");
    expect(por("X2")?.trava).toBe("valor-nao-conferido");
    expect(por("X3")?.requisitosInexistentes).toEqual(["R99"]);
    expect(por("X3")?.item.requisitos).toEqual([]);
    expect(por("X4")?.trava).toBe("valor-nao-conferido");
    expect(por("X5")?.trava).toBe("citacao-nao-conferida");
    // na leitura, item travado nunca aparece como "Do documento"
    const l = combinarLeitura(d.l, c);
    expect(l.itens.filter((i) => i.trava && i.rotulo === "documento")).toEqual([]);
  });
});
