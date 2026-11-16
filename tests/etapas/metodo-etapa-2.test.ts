// Placar do método da etapa 2 (decisões 0034 e 0038): a minuta pelo método contra os gabaritos da SMPED (parceria,
// operação contínua) e da OEI (licitação, consultoria por produtos). Os gabaritos e as leituras gravadas foram feitos
// pelo Claude Code seguindo a skill: o placar mede o esqueleto do código (o que vai no pedido ao PMO) e as travas do
// código sobre a leitura gravada, não a qualidade da leitura do PMO de verdade (decisão 0035).
// O placar sai no console (npx vitest run tests/etapas/metodo-etapa-2.test.ts) e em docs/estudos/placar-m2-etapa-2.md.
import { existsSync, readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import type { DocumentoLido, PropostaDossie } from "../../src/dossie/esquema";
import { montarMinuta, type MinutaProposta } from "../../src/etapas/2-proposta/minuta";
import { montarPontoDePartida, type PontoDePartida } from "../../src/etapas/2-proposta/ponto-de-partida";
import { itensDaProposta, propostaInicial } from "../../src/etapas/2-proposta/proposta";
import { comCamposNovos, SCHEMAS } from "../../src/pmo/schemas/proposta";
import { tirarAcentos } from "../../src/texto/normalizar";
import { lerRfpPublica } from "../ajudantes/rfp-publica";

interface ItemGabarito {
  id: string;
  nome: string;
  quem: "codigo" | "pmo";
  chaves: string[];
}
interface Gabarito {
  tipo: { contrato: string; projeto: string };
  secoes: Record<string, ItemGabarito[]>;
  minuta: { codigo: string; titulo: string; chaves: string[] }[];
}

const HOJE = new Date(2026, 10, 16);
const CASOS = [
  { nome: "SMPED", pasta: "proposta-smped", pdf: "chamamento-publico-termo-fomento-smped-sp-2025.pdf" },
  {
    nome: "OEI",
    pasta: "proposta-oei",
    pdf: "concorrencia-tecnica-preco-oei-mdhc-criancas-situacao-rua-2026.pdf",
  },
] as const;
const ler = (pasta: string, arq: string) =>
  JSON.parse(
    readFileSync(new URL(`../fixtures/gerados/${pasta}/${arq}`, import.meta.url), "utf8"),
  ) as unknown;
const temGabarito = CASOS.every((c) =>
  existsSync(new URL(`../fixtures/gerados/${c.pasta}/gabarito-metodo-etapa-2.json`, import.meta.url)),
);

const normal = (t: string) => tirarAcentos(t).toLowerCase().replace(/\s+/g, " ");
const acertos = (chaves: string[], texto: string) => chaves.filter((c) => new RegExp(c).test(texto)).length;
const casa = (chaves: string[], texto: string) => acertos(chaves, texto) >= Math.ceil(chaves.length / 2);

function gravada(pasta: string, base: string): Pick<PropostaDossie, "estrategia" | "conteudo" | "eap"> {
  const em = HOJE.toISOString();
  const passo = (p: keyof typeof SCHEMAS) => ({
    resposta: SCHEMAS[p].parse(comCamposNovos(p, ler(pasta, `${base}${p}.json`))) as never,
    modelo: "gravada",
    em,
  });
  return { estrategia: passo("estrategia"), conteudo: passo("conteudo"), eap: passo("eap") };
}

function textoDaMinuta(m: MinutaProposta): { secao: string; texto: string; doPmo: boolean }[] {
  return m.itens.map((i) => ({
    secao: i.secao,
    doPmo: Boolean(i.doPmo),
    texto: normal([i.nome, i.texto, i.nota ?? "", ...(i.tabela?.linhas.flat() ?? [])].join(" ")),
  }));
}

interface Resultado {
  itens: number;
  passam: number;
  cobertos: number;
  cobertosCodigo: number;
  porSecao: Record<string, [number, number]>;
  naoPassam: string[];
  faltam: string[];
}

function medir(textos: { secao: string; texto: string }[], g: Gabarito, nomes: string[]): Resultado {
  const todos = Object.entries(g.secoes).flatMap(([s, itens]) => itens.map((i) => ({ ...i, secao: s })));
  const cobertos = todos.filter((gi) => textos.some((t) => casa(gi.chaves, t.texto)));
  const porSecao: Record<string, [number, number]> = {};
  for (const [s, itens] of Object.entries(g.secoes))
    porSecao[s] = [
      itens.length,
      itens.filter((gi) => textos.some((t) => t.secao === s && casa(gi.chaves, t.texto))).length,
    ];
  const passam = textos.filter((t) => todos.some((gi) => casa(gi.chaves, t.texto)));
  return {
    itens: textos.length,
    passam: passam.length,
    cobertos: cobertos.length,
    cobertosCodigo: cobertos.filter((gi) => gi.quem === "codigo").length,
    porSecao,
    naoPassam: textos.map((t, k) => (passam.includes(t) ? "" : (nomes[k] ?? ""))).filter(Boolean),
    faltam: todos.filter((gi) => !cobertos.includes(gi)).map((gi) => `${gi.secao} · ${gi.id} ${gi.nome}`),
  };
}

const dados = new Map<
  string,
  {
    doc: DocumentoLido;
    ponto: PontoDePartida;
    g: Gabarito;
    codigo: MinutaProposta;
    comPmo: MinutaProposta;
    p: PropostaDossie;
  }
>();
const linhas: string[] = [];

describe.skipIf(!temGabarito)("método da etapa 2 — placar contra os gabaritos", () => {
  beforeAll(async () => {
    for (const c of CASOS) {
      const doc = await lerRfpPublica(c.pdf, HOJE);
      const ponto = montarPontoDePartida([doc], undefined, HOJE);
      const g = ler(c.pasta, "gabarito-metodo-etapa-2.json") as Gabarito;
      const vazia = propostaInicial("gravada");
      const codigo = montarMinuta(ponto, vazia, [doc], undefined, HOJE);
      const pcs = Object.fromEntries(
        (gravada(c.pasta, "").estrategia?.resposta.premissasCriticas ?? [])
          .filter((x) => x.aplica !== "nao")
          .map((x) => [x.codigo, true]),
      );
      const p: PropostaDossie = {
        ...vazia,
        ...gravada(c.pasta, ""),
        abordagem: { id: "B" },
        premissasAplicaveis: pcs,
      };
      const comPmo = montarMinuta(ponto, p, [doc], undefined, HOJE);
      dados.set(c.nome, { doc, ponto, g, codigo, comPmo, p });

      // antes (v0.8.3): o ponto de partida do código e, na OEI, a resposta do PMO gravada naquela versão
      const antesTextos = [
        ...[
          ...ponto.identificacao,
          ...ponto.julgamento,
          ...ponto.apresentacao,
          ...ponto.prazos,
          ...ponto.condicoes,
          ...ponto.brechas,
        ].map((i) => ({ secao: "", texto: normal(`${i.nome} ${i.texto}`) })),
        ...(c.nome === "OEI"
          ? itensDaProposta({ ...vazia, ...gravada(c.pasta, "antes-m2/") }, [doc]).map((i) => ({
              secao: "",
              texto: normal(`${i.grupo} ${i.item.texto} ${i.complemento ?? ""}`),
            }))
          : []),
      ];
      const antes = medir(antesTextos, g, []);
      const depoisCodigo = medir(
        textoDaMinuta(codigo),
        g,
        codigo.itens.map((i) => `${i.secao} · ${i.nome}`),
      );
      const depoisPmo = medir(
        textoDaMinuta(comPmo),
        g,
        comPmo.itens.map((i) => `${i.secao} · ${i.nome}`),
      );
      const redigidas = g.minuta.filter((m) =>
        comPmo.documento.some(
          (s) =>
            s.codigo === m.codigo &&
            s.situacao === "redigida" &&
            casa(m.chaves, normal(s.paragrafos.map((x) => x.item.texto).join(" "))),
        ),
      ).length;
      const totalGab = Object.values(g.secoes).flat().length;
      const doCodigo = Object.values(g.secoes)
        .flat()
        .filter((x) => x.quem === "codigo").length;
      linhas.push(
        `=== ${c.nome} — gabarito: ${totalGab} itens (${doCodigo} do código) e ${g.minuta.length} seções da minuta`,
        `antes:           ${antes.itens} itens; passam ${antes.passam}; não passam ${antes.itens - antes.passam}; gabarito coberto ${antes.cobertos}/${totalGab}`,
        `depois (código): ${depoisCodigo.itens} itens; passam ${depoisCodigo.passam}; não passam ${depoisCodigo.itens - depoisCodigo.passam}; gabarito coberto ${depoisCodigo.cobertos}/${totalGab} (do código: ${depoisCodigo.cobertosCodigo}/${doCodigo})`,
        `depois (gravada): ${depoisPmo.itens} itens; passam ${depoisPmo.passam}; não passam ${depoisPmo.itens - depoisPmo.passam}; gabarito coberto ${depoisPmo.cobertos}/${totalGab}; minuta redigida ${redigidas}/${g.minuta.length}`,
        ...Object.entries(depoisPmo.porSecao).map(
          ([s, [n, d]]) =>
            `  ${s.padEnd(15)} gabarito ${n}  código ${depoisCodigo.porSecao[s]?.[1] ?? 0}  com a gravada ${d}`,
        ),
        `não passam (código): ${depoisCodigo.naoPassam.join(" | ")}`,
        `faltam (com a gravada): ${depoisPmo.faltam.join(" | ")}`,
      );
    }
    console.log(linhas.join("\n"));
  }, 120_000);

  it("o tipo sugerido pelo código bate com o do gabarito", () => {
    for (const c of CASOS) {
      const d = dados.get(c.nome)!;
      expect(d.codigo.tipo.contrato).toBe(d.g.tipo.contrato);
      expect(d.codigo.tipo.projeto).toBe(d.g.tipo.projeto);
    }
  });

  it("o esqueleto do código segue o modelo do edital e cobre os itens do gabarito que são do código", () => {
    for (const c of CASOS) {
      const d = dados.get(c.nome)!;
      expect(d.codigo.documento.map((s) => s.codigo)).toEqual(d.g.minuta.map((m) => m.codigo));
      const doCodigo = Object.values(d.g.secoes)
        .flat()
        .filter((x) => x.quem === "codigo");
      const r = medir(textoDaMinuta(d.codigo), d.g, []);
      expect(r.cobertosCodigo / doCodigo.length).toBeGreaterThanOrEqual(0.6);
    }
  });

  it("com a leitura gravada: a minuta sai redigida por inteiro, sem número sem fonte nem citação não conferida", () => {
    for (const c of CASOS) {
      const d = dados.get(c.nome)!;
      expect(
        d.comPmo.documento.filter((s) => s.doModelo && s.situacao !== "redigida").map((s) => s.codigo),
      ).toEqual([]);
      const paragrafos = d.comPmo.documento.flatMap((s) => s.paragrafos);
      expect(paragrafos.filter((x) => x.conferencia.citacaoNaoConferida).map((x) => x.id)).toEqual([]);
      expect(paragrafos.flatMap((x) => x.conferencia.numerosSemFonte)).toEqual([]);
      expect(d.comPmo.itens.filter((i) => i.conferencia?.numerosSemFonte.length).map((i) => i.id)).toEqual(
        [],
      );
    }
  });

  it("as travas pegam a seção só descrita, o número sem fonte, a citação falsa e a premissa crítica sem premissa escrita", () => {
    const d = dados.get("OEI")!;
    const conteudo = structuredClone(d.p.conteudo!.resposta);
    const primeira = conteudo.estrutura[2]!;
    primeira.itens = [
      { ...primeira.itens[0]!, texto: "Nesta seção, apresentar a compreensão do objeto e do público." },
    ];
    conteudo.estrutura[3]!.itens.push({
      ...conteudo.estrutura[3]!.itens[0]!,
      id: "plantado-numero",
      rotulo: "sugestao",
      texto: "Sugere-se prever 37 oficinas regionais com a rede de proteção.",
      fontes: [],
    });
    conteudo.estrutura[4]!.itens.push({
      ...conteudo.estrutura[4]!.itens[0]!,
      id: "plantado-citacao",
      rotulo: "documento",
      texto: "O edital exige escuta de 500 crianças.",
      fontes: [
        {
          doc: "rfp",
          pagina: 19,
          trecho: "a contratada deverá escutar quinhentas crianças em cada território",
        },
      ],
    });
    const pc = conteudo.premissas[0]!.premissaCritica;
    conteudo.premissas = conteudo.premissas.filter((x) => x.premissaCritica !== pc);
    const p: PropostaDossie = { ...d.p, conteudo: { ...d.p.conteudo!, resposta: conteudo } };
    const m = montarMinuta(d.ponto, p, [d.doc], undefined, HOJE);
    expect(m.documento.find((s) => s.codigo === d.g.minuta[2]!.codigo)?.situacao).toBe("so-descrita");
    const todos = m.documento.flatMap((s) => s.paragrafos);
    expect(todos.find((x) => x.item.id === "plantado-numero")?.conferencia.numerosSemFonte).toContain(
      "37 oficinas",
    );
    expect(todos.find((x) => x.item.id === "plantado-citacao")?.conferencia.citacaoNaoConferida).toBe(true);
    expect(m.itens.find((i) => i.id === `minuta:premissas:${pc}`)?.alerta).toBe(true);
    expect(m.itens.some((i) => i.id === "minuta:estrutura:nao-redigidas" && i.alerta)).toBe(true);
  });

  it("a revisão do GP vale na minuta: descartado sai, editado vale o texto dele; 'documento' só com a citação conferida", () => {
    const d = dados.get("OEI")!;
    const c = d.p.conteudo!.resposta;
    const k = c.estrutura.findIndex((s) => s.itens.length >= 2);
    const revisoes = {
      ...d.p.revisoes,
      [`conteudo:estrutura:${k}:0`]: { estado: "descartado" as const },
      [`conteudo:estrutura:${k}:1`]: { estado: "editado" as const, textoEditado: "Texto editado pelo GP." },
      "conteudo:exclusoes:0": { estado: "descartado" as const },
    };
    const conteudo = structuredClone(c);
    conteudo.estrutura[k]!.itens.push({
      ...conteudo.estrutura[k]!.itens[0]!,
      id: "doc-falso",
      rotulo: "documento",
      texto: "O edital exige relatório mensal.",
      fontes: [{ doc: "rfp", pagina: 3, trecho: "trecho que não existe neste edital de forma alguma" }],
    });
    const m = montarMinuta(
      d.ponto,
      { ...d.p, revisoes, conteudo: { ...d.p.conteudo!, resposta: conteudo } },
      [d.doc],
      undefined,
      HOJE,
    );
    const secao = m.documento.find((s) =>
      s.paragrafos.some((x) => x.id.startsWith(`conteudo:estrutura:${k}:`)),
    )!;
    expect(secao.paragrafos.map((x) => x.id)).not.toContain(`conteudo:estrutura:${k}:0`);
    expect(secao.paragrafos.find((x) => x.id === `conteudo:estrutura:${k}:1`)?.item.texto).toBe(
      "Texto editado pelo GP.",
    );
    expect(secao.paragrafos.find((x) => x.item.id === "doc-falso")?.rotulo).toBe("sugestao");
    expect(m.itens.find((i) => i.id === "conteudo:exclusoes:0")).toBeUndefined();
  });
});
