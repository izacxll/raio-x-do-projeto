// Gabarito dos testes ponta a ponta (tests/pmo/gabarito/README.md; docs/papeis.md, primeira camada da revisão): os
// achados confirmados de cada caso, por etapa. Achado do código roda a regra sobre a entrada (inventada, nos casos
// disfarçados) e procura o padrão na saída; achado do PMO é conferido contra a resposta gravada, quando houver. Achado
// que some, ou alarme falso que volta, deixa o teste vermelho. Sem a API.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { citacaoEhFraca } from "../../src/etapas/1-rfp/leitura-pmo";
import {
  faixasDosCompromissos,
  faixasErradasNoTexto,
  numerarCompromissos,
} from "../../src/etapas/2-proposta/compromissos";
import { calcularCronograma, travasDaEap } from "../../src/etapas/2-proposta/cronograma";
import { conferirMarcosPelaConta } from "../../src/etapas/3-tap/conferencia-tap";
import type { EntradaTap } from "../../src/etapas/3-tap/entrada";
import { linhaDoTempo } from "../../src/etapas/linha-do-tempo";
import { citacaoProvaOItem } from "../../src/pmo/redacao";
import type { AtividadeEap, RespostaConteudo } from "../../src/pmo/schemas/proposta";
import type { RespostaTap } from "../../src/pmo/schemas/tap";
import { ehDataDeAtoOuAssinatura, encontrarDatas } from "../../src/texto/datas";

interface AtividadeCurta {
  id: string;
  nome: string;
  pred: string[];
  dur: [number, number, number];
  analise?: boolean;
  produto?: string;
  fixa?: [string, string];
}

interface AchadoGabarito {
  id: string;
  etapa: number;
  camada: "codigo" | "pmo";
  o_que: string;
  padrao: string;
  aparece: boolean;
  secao: string;
  gravidade: "alta" | "media" | "baixa";
  pagina: number | null;
  verificador?: string;
  entrada?: Record<string, unknown>;
  /** Achado do PMO: a resposta gravada (relativa à pasta do gabarito) e, se quiser, só um campo dela. */
  resposta?: string;
  campo?: string;
}

interface CasoGabarito {
  caso: string;
  publico: boolean;
  fonte: string | null;
  data: string | null;
  descricao: string;
  achados: AchadoGabarito[];
}

const PASTA = new URL("./gabarito/", import.meta.url);

const atividades = (xs: AtividadeCurta[]): AtividadeEap[] =>
  xs.map((x) => ({
    id: x.id,
    produto: x.produto ?? "P1",
    nome: x.nome,
    predecessoras: x.pred,
    duracao: {
      otimista: x.dur[0],
      mais_provavel: x.dur[1],
      pessimista: x.dur[2],
      unidade: "dias úteis",
      base: "gabarito",
    },
    restricaoData: x.fixa ? { inicio: x.fixa[0], fim: x.fixa[1] } : null,
    aprovacaoCliente: false,
    analiseDoContratante: Boolean(x.analise),
    requisitos: [],
  })) as unknown as AtividadeEap[];

const dataIso = (s: unknown) => (typeof s === "string" ? new Date(`${s}T00:00:00`) : undefined);

const item = (texto: string, ficha = "") => ({
  id: "x",
  texto,
  rotulo: "sugestao" as const,
  motivo: "",
  fontes: [],
  alternativas: [],
  requisitos: [],
  ficha,
});

/** Cada verificador roda uma regra do código sobre a entrada e devolve a saída em texto. */
const VERIFICADORES: Record<string, (e: Record<string, unknown>) => string> = {
  "citacao-fraca": (e) => (citacaoEhFraca(String(e.trecho)) ? "citação fraca" : "citação suficiente"),
  "citacao-prova": (e) =>
    citacaoProvaOItem(String(e.texto), e.trechos as string[])
      ? "a citação prova o item"
      : "citação a conferir",
  "data-de-ato": (e) => {
    const t = String(e.texto);
    return encontrarDatas(t)
      .map((d) => (ehDataDeAtoOuAssinatura(t, d) ? "data de ato" : "data de prazo"))
      .join("; ");
  },
  "travas-eap": (e) => travasDaEap(atividades(e.atividades as AtividadeCurta[])).join(" ") || "sem travas",
  cronograma: (e) =>
    calcularCronograma(atividades(e.atividades as AtividadeCurta[]), {
      inicio: dataIso(e.inicio),
    }).problemas.join(" "),
  "linha-do-tempo": (e) => {
    const crono = calcularCronograma(atividades(e.atividades as AtividadeCurta[]), {
      aprovacaoDias: e.aprovacaoDias as number | undefined,
    });
    const produtos = [...new Set(crono.atividades.map((a) => a.produto))].map((id) => ({ id, nome: id }));
    return linhaDoTempo({ cronograma: crono, produtos, aprovacaoDias: e.aprovacaoDias as number | undefined })
      .map((m) => m.texto)
      .join("\n");
  },
  compromissos: (e) => {
    const n = (k: string) => Number(e[k] ?? 0);
    const c = {
      estrutura: [
        {
          codigo: "3",
          titulo: "Metodologia",
          criterio: "",
          itens: (e.metodo as { texto: string; ficha: string }[]).map((m) => item(m.texto, m.ficha)),
        },
      ],
      premissas: Array.from({ length: n("premissas") }, (_, k) => ({ item: item(`Premissa ${k + 1}.`) })),
      obrigacoesContratante: Array.from({ length: n("obrigacoes") }, (_, k) => ({
        item: item(`Obrigação ${k + 1}.`),
      })),
      exclusoes: Array.from({ length: n("exclusoes") }, (_, k) => item(`Exclusão ${k + 1}.`)),
      limitesVolume: Array.from({ length: n("limites") }, (_, k) => item(`Limite ${k + 1}.`)),
    } as unknown as RespostaConteudo;
    const cs = numerarCompromissos(c);
    return [
      `compromissos de método: ${cs.filter((x) => x.tipo === "metodo").length}`,
      `faixas: ${faixasDosCompromissos(cs)}`,
      e.texto
        ? `faixas erradas no texto: ${faixasErradasNoTexto(String(e.texto), cs).join("; ") || "nenhuma"}`
        : "",
    ].join("\n");
  },
  "marcos-tap": (e) => {
    const crono = calcularCronograma(atividades(e.atividades as AtividadeCurta[]), {
      inicio: dataIso(e.inicio),
    });
    const entrada = { dados: { inicio: dataIso(e.inicio), cronograma: crono } } as unknown as EntradaTap;
    const marcos = (e.marcos as { produto: string; prazo: string; texto: string }[]).map((m) => ({
      produto: m.produto,
      prazo: m.prazo,
      item: { texto: m.texto },
    })) as unknown as RespostaTap["marcos"];
    const v = conferirMarcosPelaConta(entrada, marcos, [], 180);
    return `${v.situacao}: ${v.texto}`;
  },
};

const casos: CasoGabarito[] = readdirSync(PASTA)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(new URL(f, PASTA), "utf8")) as CasoGabarito);

describe("gabarito: formato dos casos", () => {
  it("há casos, e cada um segue as regras de publicação", () => {
    expect(casos.length).toBeGreaterThan(0);
    for (const c of casos) {
      // caso público com fonte e data; caso não confirmado como público, só disfarçado
      if (c.publico) expect(c.fonte && c.data, c.caso).toBeTruthy();
      else expect(c.caso, c.caso).toMatch(/disfarcado$/);
      const ids = c.achados.map((a) => a.id);
      expect(new Set(ids).size, c.caso).toBe(ids.length);
      for (const a of c.achados) {
        expect(["alta", "media", "baixa"], a.id).toContain(a.gravidade);
        expect(a.etapa >= 1 && a.etapa <= 5, a.id).toBe(true);
        if (a.camada === "codigo") expect(VERIFICADORES[a.verificador ?? ""], a.id).toBeDefined();
      }
    }
  });
});

for (const c of casos)
  describe(`gabarito: ${c.caso}`, () => {
    for (const a of c.achados) {
      const nome = `${a.id} (etapa ${a.etapa}, ${a.gravidade}): ${a.o_que}`;
      if (a.camada === "codigo") {
        it(nome, () => {
          const saida = VERIFICADORES[a.verificador as string]!(a.entrada ?? {});
          const achou = new RegExp(a.padrao).test(saida);
          expect(achou, `${a.aparece ? "achado sumiu" : "alarme falso voltou"} — saída:\n${saida}`).toBe(
            a.aparece,
          );
        });
        continue;
      }
      const arq = a.resposta ? new URL(a.resposta, PASTA) : undefined;
      if (!arq || !existsSync(arq)) {
        it.todo(`${nome} — aguarda resposta gravada`);
        continue;
      }
      it(nome, () => {
        const r = JSON.parse(readFileSync(arq, "utf8")) as Record<string, unknown>;
        const texto = JSON.stringify(a.campo ? r[a.campo] : r);
        expect(
          new RegExp(a.padrao, "i").test(texto),
          a.aparece ? "achado sumiu" : "alarme falso voltou",
        ).toBe(a.aparece);
      });
    }
  });
