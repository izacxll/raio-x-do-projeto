// Segunda instância leve da etapa 5 (decisão 0077). Exemplos inventados.
import { describe, expect, it } from "vitest";
import type { DocumentoLido } from "../../src/dossie/esquema";
import { PARTES_PGP, PREMISSAS_CRITICAS } from "../../src/dominio/skill";
import type { CandidatoConferido, ResultadoVereditos } from "../../src/etapas/5-conferencia/candidatos";
import type { RespostaLeitura } from "../../src/pmo/schemas/leitura";
import type { RespostaSegundaEtapa5 } from "../../src/pmo/schemas/segunda-etapa-5";
import {
  aplicarSegundaEtapa5,
  deveConferirEtapa5,
  montarSegundaEtapa5,
  segundaEtapa5EmTexto,
  trechosDaPremissa,
  vereditosAConferir,
} from "../../src/pmo/segunda-etapa-5";
import type { Achado } from "../../src/regras/achado";

const achado = (id: string, pagina?: number): Achado =>
  ({
    id,
    tipo: "ausente",
    regra: "conteudo-minimo",
    parte: id.split(":")[1] ?? "A8",
    partes: [id.split(":")[1] ?? "A8"],
    gravidade: "média",
    categoria: "riscos",
    origemCategoria: "parte",
    titulo: `${id} não localizado pelo código`,
    descricao: "O conteúdo mínimo não foi localizado.",
    evidencias: pagina
      ? [{ documento: "pgp", pagina, trecho: "x", rotulo: `PGP, p. ${pagina}` }]
      : [{ documento: "ficha", trecho: "item", rotulo: "Ficha" }],
    sugestao: "",
  }) as unknown as Achado;

const candidato = (a: Achado, situacao: CandidatoConferido["situacao"]): CandidatoConferido => ({
  achado: a,
  situacao,
  citacoes: [],
  avisos: [],
});

const leitura = {
  achados: [],
  vereditos: [
    {
      achado: "conteudo-minimo:A8:A8.2",
      veredito: "falso",
      evidencias: [{ doc: "pgp", pagina: 9, trecho: "Papéis: o GP conduz o processo de riscos" }],
      motivo: "",
    },
    {
      achado: "conteudo-minimo:A11:A11.1",
      veredito: "regra_errada",
      evidencias: [],
      motivo: "O plano diz quem decide.",
    },
    { achado: "conteudo-minimo:B27:B27.1", veredito: "sustenta", evidencias: [], motivo: "" },
    { achado: "conteudo-minimo:B13:B13.7", veredito: "nao_se_aplica", evidencias: [], motivo: "Sem campo." },
    { achado: "id-que-nao-existe-mais", veredito: "falso", evidencias: [], motivo: "" },
  ],
  dispensas: [],
} as unknown as RespostaLeitura;

const candidatos = [
  candidato(achado("conteudo-minimo:A8:A8.2"), "falso"),
  candidato(achado("conteudo-minimo:A11:A11.1"), "regra-errada"),
  candidato(achado("conteudo-minimo:B27:B27.1", 30), "sustenta"),
  candidato(achado("conteudo-minimo:B13:B13.7", 31), "nao-se-aplica"),
];

const mapa = [
  { codigo: "A8", situacao: "presente", paginaInicial: 8, paginaFinal: 9 },
  { codigo: "A11", situacao: "presente", paginaInicial: 12, paginaFinal: 15 },
  { codigo: "B3", situacao: "presente", paginaInicial: 20, paginaFinal: 20 },
  { codigo: "B27", situacao: "presente", paginaInicial: 30, paginaFinal: 30 },
];

const doc = (papel: DocumentoLido["papel"], n: number, texto = (k: number) => `p${k}`) =>
  ({
    id: papel,
    papel,
    nomeArquivo: `${papel}.pdf`,
    totalPaginas: n,
    lidoEm: "x",
    paginas: Array.from({ length: n }, (_, k) => ({ numero: k + 1, texto: texto(k + 1), origem: "texto" })),
  }) as unknown as DocumentoLido;

describe("quando roda e o que vai ao revisor", () => {
  it('só os "falso" e "regra_errada" de achados que ainda são candidatos', () => {
    expect(vereditosAConferir(leitura, candidatos).map((v) => v.achado)).toEqual([
      "conteudo-minimo:A8:A8.2",
      "conteudo-minimo:A11:A11.1",
    ]);
    expect(deveConferirEtapa5(leitura, candidatos)).toBe(true);
    expect(deveConferirEtapa5(leitura, [])).toBe(false);
  });

  it("as páginas citadas e as da parte de cada achado conferido; nada dos outros candidatos", () => {
    const m = montarSegundaEtapa5({
      leitura,
      candidatos,
      partes: PARTES_PGP,
      premissas: PREMISSAS_CRITICAS,
      premissasAplicaveis: {},
      documentos: [doc("pgp", 40), doc("tap", 5)],
      mapa,
    });
    expect(m.quantos).toBe(2);
    // A8: p. 8-9 (parte) e 9 (citada); A11: p. 12-14 (parte, até 3); nada do B27 (p. 30) nem do B13 (p. 31)
    expect(m.documentos.map((d) => [d.papel, d.paginas.map((p) => p.numero)])).toEqual([
      ["pgp", [8, 9, 12, 13, 14]],
    ]);
    expect(m.pedido).toMatch(/item da ficha: A8\.2 /);
    expect(m.pedido).toContain("cobre o **item inteiro** da ficha, não só o tema");
    expect(m.pedido).toContain("sem_base");
    expect(m.pedido).not.toContain("B27.1");
  });

  it("premissa crítica por lugar (B3, B27, A11); o lugar sem trecho é não localizado, não ausente", () => {
    const pc = PREMISSAS_CRITICAS[0]!;
    const pgp = doc("pgp", 40, (k) =>
      k === 20 ? `${pc.codigo}: a premissa escrita no registro.` : `p${k}`,
    ).paginas;
    const t = trechosDaPremissa(pc, pgp, mapa);
    expect(t[0]).toBe(`B3, p. 20: ${pc.codigo}: a premissa escrita no registro.`);
    expect(t.slice(1)).toEqual([
      "B27: não localizado pelo código — conferir no documento",
      "A11: não localizado pelo código — conferir no documento",
    ]);
  });
});

describe("a revisão volta ao resultado", () => {
  const vd: ResultadoVereditos = {
    candidatos,
    contam: [candidatos[2]!.achado],
    dispensas: [],
    partesDevolvidas: [],
    desconhecidos: [],
  };
  const rev = (
    achado: string,
    revisao: RespostaSegundaEtapa5["vereditos"][number]["revisao"],
    motivo = "Motivo.",
    parteQueFalta = "",
  ) => ({ achado, revisao, motivo, parteQueFalta, evidencias: [] });
  const revisao: RespostaSegundaEtapa5 = {
    vereditos: [
      rev("conteudo-minimo:A8:A8.2", "em_parte", "O trecho fala de papéis.", "quem decide sobre as reservas"),
      rev("conteudo-minimo:A11:A11.1", "sem_base"),
      // não foi pedida (o veredito era "não se aplica"): não conta
      rev("conteudo-minimo:B13:B13.7", "derruba"),
    ],
    premissas: [
      { codigo: "PC1", situacao: "so_citada", falta: "A11", motivo: "Sem reajuste.", evidencias: [] },
    ],
    conferido: ["Vereditos lidos contra as páginas."],
  };

  it("em parte: volta a contar, marcado; sem base e revisão não pedida: nada muda", () => {
    const r = aplicarSegundaEtapa5(vd, revisao, leitura);
    expect(r.contam.map((a) => a.id)).toEqual(["conteudo-minimo:A8:A8.2", "conteudo-minimo:B27:B27.1"]);
    const a8 = r.candidatos.find((c) => c.achado.id === "conteudo-minimo:A8:A8.2")!;
    expect(a8.revisadoPelaSegunda).toMatch(
      /cobre só parte do item \(o PMO tinha dito "falso"\).*Falta: quem decide/,
    );
    expect(r.candidatos.find((c) => c.achado.id === "conteudo-minimo:A11:A11.1")!.situacao).toBe(
      "regra-errada",
    );
    expect(r.candidatos.find((c) => c.achado.id === "conteudo-minimo:B13:B13.7")!.situacao).toBe(
      "nao-se-aplica",
    );
    expect(aplicarSegundaEtapa5(vd, undefined, leitura)).toBe(vd);
  });

  it("derruba sem motivo é ignorada, com aviso", () => {
    const r = aplicarSegundaEtapa5(
      vd,
      { ...revisao, vereditos: [rev("conteudo-minimo:A8:A8.2", "derruba", "", "")] },
      leitura,
    );
    const a8 = r.candidatos.find((c) => c.achado.id === "conteudo-minimo:A8:A8.2")!;
    expect(a8.situacao).toBe("falso");
    expect(a8.avisos.join(" ")).toMatch(/sem motivo: a revisão foi ignorada/);
  });

  it("o resumo diz o que voltou a contar e marca citação não conferida", () => {
    const t = segundaEtapa5EmTexto(
      {
        ...revisao,
        vereditos: [
          {
            ...revisao.vereditos[0]!,
            evidencias: [{ doc: "pgp", pagina: 9, trecho: "um trecho que não está na página" }],
          },
        ],
      },
      vd,
      leitura,
      [doc("pgp", 40)],
    );
    expect(t).toMatch(/achados que voltaram a contar: 1/);
    expect(t).toMatch(/Achados do código que contam agora: 2 \(antes: 1\)/);
    expect(t).toMatch(/pgp, p\. 9, citação não conferida/);
    expect(t).toMatch(/\*\*so_citada\*\* · PC1: Sem reajuste\. Falta em: A11/);
  });
});
