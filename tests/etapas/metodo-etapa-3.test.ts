// Placar do método da etapa 3 (decisões 0034 e 0041): o TAP pelo método contra os gabaritos da SMPED e da OEI, com
// um contrato inventado para cada caso (o assinado não é público). Os gabaritos, os contratos e as leituras gravadas
// foram feitos pelo Claude Code seguindo a skill: o placar mede o que o código monta e confere (divergências, dados
// dos documentos, conferência) e as travas, não a qualidade da leitura do PMO de verdade (decisão 0035).
import { existsSync, readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { criarDossieVazio } from "../../src/dossie/arquivo";
import type { DocumentoLido, Dossie, PropostaDossie, TapDossie } from "../../src/dossie/esquema";
import { propostaInicial } from "../../src/etapas/2-proposta/proposta";
import { conferirTap } from "../../src/etapas/3-tap/conferencia-tap";
import { compararRfpEProposta, type Divergencia } from "../../src/etapas/3-tap/divergencias";
import { dadosDosDocumentos } from "../../src/etapas/3-tap/do-documento";
import { montarEntradaTap, type EntradaTap } from "../../src/etapas/3-tap/entrada";
import { itensDaEtapa3, tapInicial } from "../../src/etapas/3-tap/tap";
import { comCamposNovos, SCHEMAS } from "../../src/pmo/schemas/proposta";
import { comCamposNovosTap, RespostaPremissas, RespostaTap } from "../../src/pmo/schemas/tap";
import { tirarAcentos } from "../../src/texto/normalizar";
import { lerRfpPublica } from "../ajudantes/rfp-publica";

interface ItemGabarito {
  id: string;
  nome: string;
  quem: "codigo" | "pmo";
  chaves: string[];
}
interface Gabarito {
  secoes: Record<string, ItemGabarito[]>;
}

const HOJE = new Date(2026, 10, 16);
const CASOS = [
  {
    nome: "SMPED",
    tap: "tap-smped",
    proposta: "proposta-smped",
    pdf: "chamamento-publico-termo-fomento-smped-sp-2025.pdf",
  },
  {
    nome: "OEI",
    tap: "tap-oei",
    proposta: "proposta-oei",
    pdf: "concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf",
  },
] as const;
const url = (pasta: string, arq: string) => new URL(`../fixtures/gerados/${pasta}/${arq}`, import.meta.url);
const ler = (pasta: string, arq: string) => JSON.parse(readFileSync(url(pasta, arq), "utf8")) as unknown;
const prontos = CASOS.every(
  (c) =>
    existsSync(url(c.tap, "gabarito-metodo-etapa-3.json")) && existsSync(url(c.tap, "contrato-teste.json")),
);

const normal = (t: string) => tirarAcentos(t).toLowerCase().replace(/\s+/g, " ");
const casa = (chaves: string[], texto: string) =>
  chaves.filter((c) => new RegExp(c).test(texto)).length >= Math.ceil(chaves.length / 2);

function documento(
  papel: DocumentoLido["papel"],
  c: { nomeArquivo: string; paginas: string[] },
): DocumentoLido {
  return {
    id: papel,
    papel,
    nomeArquivo: c.nomeArquivo,
    tamanhoBytes: 1,
    totalPaginas: c.paginas.length,
    lidoEm: HOJE.toISOString(),
    paginas: c.paginas.map((texto, k) => ({
      numero: k + 1,
      origem: "texto",
      texto,
      caracteres: texto.length,
    })),
  };
}

function propostaDe(pasta: string): PropostaDossie {
  const em = HOJE.toISOString();
  const passo = (p: keyof typeof SCHEMAS) => ({
    resposta: SCHEMAS[p].parse(comCamposNovos(p, ler(pasta, `${p}.json`))) as never,
    modelo: "gravada",
    em,
  });
  const estrategia = passo("estrategia");
  const pcs = Object.fromEntries(
    (estrategia.resposta as { premissasCriticas: { codigo: string; aplica: string }[] }).premissasCriticas
      .filter((x) => x.aplica !== "nao")
      .map((x) => [x.codigo, true]),
  );
  return {
    ...propostaInicial("gravada"),
    estrategia,
    conteudo: passo("conteudo"),
    eap: passo("eap"),
    abordagem: { id: "B" },
    premissasAplicaveis: pcs,
  };
}

function tapDe(pasta: string, base = ""): TapDossie {
  return {
    ...tapInicial("gravada"),
    tap: {
      resposta: RespostaTap.parse(comCamposNovosTap(ler(pasta, `${base}tap.json`))),
      modelo: "gravada",
      em: HOJE.toISOString(),
    },
    premissas: {
      resposta: RespostaPremissas.parse(ler(pasta, `${base}premissas.json`)),
      modelo: "gravada",
      em: HOJE.toISOString(),
    },
  };
}

interface Texto {
  secao: string;
  texto: string;
}

function textosDoCodigo(e: EntradaTap, divs: Divergencia[]): Texto[] {
  return [
    ...divs.map((d) => ({
      secao: "divergencias",
      texto: normal(
        [d.id, d.tema, d.rfp.texto, d.proposta.texto, d.contrato?.texto ?? "", d.observacao].join(" "),
      ),
    })),
    ...dadosDosDocumentos(e).map((x) => ({ secao: "elementos", texto: normal(`${x.nome} ${x.texto}`) })),
  ];
}

function textosDoTap(
  e: EntradaTap,
  t: TapDossie,
  divs: Divergencia[],
  pcs: Record<string, boolean>,
): Texto[] {
  const itens = itensDaEtapa3(t, e.documentos);
  return [
    ...itens.map((i) => ({
      secao: i.id.startsWith("tap:divergenciasTexto:")
        ? "divergencias"
        : i.passo === "premissas"
          ? "premissas"
          : "elementos",
      texto: normal(`${i.grupo} ${i.item.texto} ${i.complemento ?? ""}`),
    })),
    ...conferirTap(e, t, itens, pcs, divs).map((v) => ({
      secao: "conferencia",
      texto: normal(`${v.nome} ${v.texto}`),
    })),
  ];
}

function medir(textos: Texto[], g: Gabarito) {
  const todos = Object.entries(g.secoes).flatMap(([s, itens]) => itens.map((i) => ({ ...i, secao: s })));
  const cobertos = todos.filter((gi) => textos.some((t) => casa(gi.chaves, t.texto)));
  const passam = textos.filter((t) => todos.some((gi) => casa(gi.chaves, t.texto))).length;
  return {
    itens: textos.length,
    passam,
    cobertos: cobertos.length,
    cobertosCodigo: cobertos.filter((x) => x.quem === "codigo").length,
    total: todos.length,
    doCodigo: todos.filter((x) => x.quem === "codigo").length,
    faltam: todos.filter((x) => !cobertos.includes(x)).map((x) => `${x.secao} · ${x.id} ${x.nome}`),
  };
}

const dados = new Map<
  string,
  { e: EntradaTap; divs: Divergencia[]; t: TapDossie; dossie: Dossie; g: Gabarito }
>();

describe.skipIf(!prontos)("método da etapa 3 — placar contra os gabaritos", () => {
  beforeAll(async () => {
    const linhas: string[] = [];
    for (const c of CASOS) {
      const rfp = await lerRfpPublica(c.pdf, HOJE);
      const proposta = propostaDe(c.proposta);
      const contrato = documento(
        "contrato",
        ler(c.tap, "contrato-teste.json") as { nomeArquivo: string; paginas: string[] },
      );
      const g = ler(c.tap, "gabarito-metodo-etapa-3.json") as Gabarito;
      const dossie = { ...criarDossieVazio(HOJE), documentos: [rfp, contrato], proposta };
      const e = montarEntradaTap(dossie, HOJE);
      const divs = compararRfpEProposta(e);
      const t = tapDe(c.tap);
      dados.set(c.nome, { e, divs, t, dossie, g });
      // antes (v0.8.x): sem o contrato e sem as divergências do método; na OEI, o TAP gravado naquela versão
      const eAntes = montarEntradaTap({ ...dossie, documentos: [rfp] }, HOJE);
      const metodo = new Set([
        "valor-contrato",
        "parcelas",
        "conformidade:parcelas",
        "duracao",
        "equipe-regra",
        "produtividade",
      ]);
      const divsAntes = compararRfpEProposta(eAntes).filter((d) => !metodo.has(d.id));
      const antes = medir(
        [
          ...textosDoCodigo(eAntes, divsAntes),
          ...(c.nome === "OEI"
            ? textosDoTap(eAntes, tapDe(c.tap, "antes-m3/"), divsAntes, proposta.premissasAplicaveis)
            : []),
        ],
        g,
      );
      const codigo = medir(textosDoCodigo(e, divs), g);
      const comPmo = medir(
        [...textosDoCodigo(e, divs), ...textosDoTap(e, t, divs, proposta.premissasAplicaveis)],
        g,
      );
      linhas.push(
        `=== ${c.nome} — gabarito: ${comPmo.total} itens (${comPmo.doCodigo} do código)`,
        `antes:            ${antes.itens} itens; passam ${antes.passam}; gabarito coberto ${antes.cobertos}/${antes.total}`,
        `depois (código):  ${codigo.itens} itens; passam ${codigo.passam}; gabarito coberto ${codigo.cobertos}/${codigo.total} (do código: ${codigo.cobertosCodigo}/${codigo.doCodigo})`,
        `depois (gravada): ${comPmo.itens} itens; passam ${comPmo.passam}; gabarito coberto ${comPmo.cobertos}/${comPmo.total}`,
        `faltam (com a gravada): ${comPmo.faltam.join(" | ")}`,
      );
    }
    console.log(linhas.join("\n"));
  }, 120_000);

  it("o código lê o contrato e acha as divergências plantadas", () => {
    for (const c of CASOS) {
      const d = dados.get(c.nome)!;
      expect(d.e.lidoDoContrato?.valor).toBeDefined();
      expect(d.e.lidoDoContrato?.vigencia?.meses).toBe(12);
      expect(d.divs.find((x) => x.id === "parcelas")?.situacao).toBe("diferente");
    }
  });

  it("o código cobre a maior parte dos itens do gabarito que são do código", () => {
    for (const c of CASOS) {
      const d = dados.get(c.nome)!;
      const r = medir(
        textosDoCodigo(d.e, d.divs).concat(
          textosDoTap(d.e, d.t, d.divs, {}).filter((x) => x.secao === "conferencia"),
        ),
        d.g,
      );
      expect(r.cobertosCodigo / r.doCodigo).toBeGreaterThanOrEqual(0.6);
    }
  });

  it("com a leitura gravada: toda citação conferida e nenhum número sem fonte", () => {
    for (const c of CASOS) {
      const d = dados.get(c.nome)!;
      const itens = itensDaEtapa3(d.t, d.e.documentos);
      expect(itens.filter((i) => i.conferencia.citacaoNaoConferida).map((i) => i.id)).toEqual([]);
      expect(itens.flatMap((i) => i.conferencia.numerosSemFonte)).toEqual([]);
    }
  });

  it("as travas pegam a citação falsa e o número sem fonte numa divergência de texto", () => {
    const d = dados.get("OEI")!;
    const r = structuredClone(d.t.tap!.resposta);
    const base = r.divergenciasTexto[0] ?? {
      item: r.finalidade[0]!,
      ponto: "",
      versaoSugerida: "",
      oQueFazer: "",
    };
    r.divergenciasTexto.push(
      {
        ...base,
        item: {
          ...base.item,
          id: "falsa",
          rotulo: "documento",
          texto: "O contrato fixa multa diária.",
          fontes: [
            {
              doc: "contrato",
              pagina: 1,
              trecho: "a multa diária será de dez por cento do valor do contrato",
            },
          ],
        },
      },
      {
        ...base,
        item: {
          ...base.item,
          id: "numero",
          rotulo: "sugestao",
          texto: "Sugere-se pedir 45 dias de prazo de análise.",
          fontes: [],
        },
      },
    );
    const itens = itensDaEtapa3({ ...d.t, tap: { ...d.t.tap!, resposta: r } }, d.e.documentos);
    const falsa = itens.find((i) => i.item.id === "falsa")!;
    const numero = itens.find((i) => i.item.id === "numero")!;
    expect(falsa.conferencia.citacaoNaoConferida).toBe(true);
    expect(numero.conferencia.numerosSemFonte.length).toBeGreaterThan(0);
  });
});
