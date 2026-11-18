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
  documentosDaSegundaEtapa5,
  pedidoSegundaEtapa5,
  segundaEtapa5EmTexto,
  trechosDaPremissa,
  vereditosAConferir,
} from "../../src/pmo/segunda-etapa-5";
import type { Achado } from "../../src/regras/achado";

const achado = (id: string, pagina = 4): Achado =>
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
    evidencias: [{ documento: "pgp", pagina, trecho: "x", rotulo: `PGP, p. ${pagina}` }],
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
    { achado: "id-que-nao-existe-mais", veredito: "falso", evidencias: [], motivo: "" },
  ],
  dispensas: [],
} as unknown as RespostaLeitura;

const candidatos = [
  candidato(achado("conteudo-minimo:A8:A8.2"), "falso"),
  candidato(achado("conteudo-minimo:A11:A11.1", 12), "regra-errada"),
  candidato(achado("conteudo-minimo:B27:B27.1"), "sustenta"),
];

describe("quando roda e o que confere", () => {
  it('só os "falso" e "regra_errada" de achados que ainda são candidatos', () => {
    expect(vereditosAConferir(leitura, candidatos).map((v) => v.achado)).toEqual([
      "conteudo-minimo:A8:A8.2",
      "conteudo-minimo:A11:A11.1",
    ]);
    expect(deveConferirEtapa5(leitura, candidatos)).toBe(true);
    expect(deveConferirEtapa5(leitura, [])).toBe(false);
    expect(deveConferirEtapa5(undefined, candidatos)).toBe(false);
  });

  it("só as páginas citadas pelos vereditos e pelos achados", () => {
    const doc = (papel: DocumentoLido["papel"], n: number) =>
      ({
        id: papel,
        papel,
        nomeArquivo: `${papel}.pdf`,
        totalPaginas: n,
        lidoEm: "x",
        paginas: Array.from({ length: n }, (_, k) => ({
          numero: k + 1,
          texto: `p${k + 1}`,
          origem: "texto",
        })),
      }) as unknown as DocumentoLido;
    const docs = documentosDaSegundaEtapa5(
      [doc("pgp", 20), doc("tap", 5)],
      vereditosAConferir(leitura, candidatos),
      candidatos.slice(0, 2).map((c) => c.achado),
    );
    expect(docs.map((d) => [d.papel, d.paginas.map((p) => p.numero)])).toEqual([["pgp", [4, 9, 12]]]);
  });

  it("o pedido traz o item da ficha, a evidência, a régua do item inteiro e cada premissa crítica que se aplica", () => {
    const pc = PREMISSAS_CRITICAS[0]!;
    const pgp = [
      {
        numero: 3,
        origem: "texto" as const,
        texto: `${pc.codigo}: premissa escrita no registro.`,
        caracteres: 40,
      },
    ];
    const p = pedidoSegundaEtapa5({
      leitura,
      candidatos,
      partes: PARTES_PGP,
      premissas: PREMISSAS_CRITICAS,
      premissasAplicaveis: { [pc.codigo]: true },
      pgp,
    });
    expect(p).toMatch(/## Vereditos a conferir\n- \*\*conteudo-minimo:A8:A8\.2\*\* · veredito do PMO: falso/);
    expect(p).toMatch(/item da ficha: A8\.2 /);
    expect(p).toContain('evidência do PMO: pgp, p. 9: "Papéis: o GP conduz o processo de riscos"');
    expect(p).toContain("cobre o **item inteiro** da ficha, não só o tema");
    expect(p).toMatch(new RegExp(`## Premissas críticas que se aplicam \\(1\\)\\n- \\*\\*${pc.codigo} — `));
    expect(p).not.toContain("B27.1");
    expect(trechosDaPremissa(pc, pgp)).toEqual([`p. 3: ${pc.codigo}: premissa escrita no registro.`]);
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
  const revisao: RespostaSegundaEtapa5 = {
    vereditos: [
      {
        achado: "conteudo-minimo:A8:A8.2",
        revisao: "em_parte",
        parteQueFalta: "quem decide sobre as reservas",
        motivo: "O trecho fala de papéis, não da decisão sobre reservas.",
        evidencias: [],
      },
      {
        achado: "conteudo-minimo:A11:A11.1",
        revisao: "confirma",
        parteQueFalta: "",
        motivo: "Ok.",
        evidencias: [],
      },
    ],
    premissas: [
      { codigo: "PC1", situacao: "so_citada", falta: "A11", motivo: "Sem reajuste.", evidencias: [] },
    ],
    conferido: ["Vereditos lidos contra as páginas citadas."],
  };

  it("em parte ou derrubado: o achado volta a contar, com o que falta; confirmado fica", () => {
    const r = aplicarSegundaEtapa5(vd, revisao);
    expect(r.contam.map((a) => a.id)).toEqual(["conteudo-minimo:A8:A8.2", "conteudo-minimo:B27:B27.1"]);
    const a8 = r.candidatos.find((c) => c.achado.id === "conteudo-minimo:A8:A8.2")!;
    expect(a8.situacao).toBe("sustenta");
    expect(a8.avisos.join(" ")).toMatch(
      /cobre só parte do item \(falso\).*Falta: quem decide sobre as reservas/,
    );
    expect(r.candidatos.find((c) => c.achado.id === "conteudo-minimo:A11:A11.1")!.situacao).toBe(
      "regra-errada",
    );
    expect(aplicarSegundaEtapa5(vd, undefined)).toBe(vd);
  });

  it("o resumo diz o que mudou no total", () => {
    const t = segundaEtapa5EmTexto(revisao, vd);
    expect(t).toMatch(/derrubados ou cobertos só em parte: 1/);
    expect(t).toMatch(/Achados do código que contam agora: 2 \(antes: 1\)/);
    expect(t).toMatch(/\*\*so_citada\*\* · PC1: Sem reajuste\. Falta em: A11/);
  });
});
