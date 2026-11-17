// Etapa 5: a busca do ausente do PMO e as partes dispensadas no mapa (teste externo, PR da busca do ausente).
// - O mapa leva as dispensas da etapa 4 e as que o plano declara na lista "Partes dispensadas pelo GP".
// - O ausente do PMO é procurado só na parte apontada (ou nas que absorvem a dispensada), sem a evidência do próprio
//   achado e, quando o PMO manda termos, só com eles.
import { describe, expect, it } from "vitest";
import { PARTES_PGP } from "../../src/dominio/skill";
import type { DocumentoLido, PaginaLida } from "../../src/dossie/esquema";
import { pgpInicial } from "../../src/etapas/4-pgp/pgp";
import { CARACTERISTICAS_PADRAO } from "../../src/dominio/caracteristicas";
import { conferirComCandidatos, conferirVereditos } from "../../src/etapas/5-conferencia/candidatos";
import {
  dispensasCandidatas,
  dispensasDaEtapa4,
  mapaInicialDaConferencia,
} from "../../src/etapas/5-conferencia/dispensas";
import { conferirLeitura, pedidoLeitura, regiaoDoAusente } from "../../src/etapas/5-conferencia/leitura-pmo";
import type { AchadoPmo, VereditoCandidato } from "../../src/pmo/schemas/leitura";
import type { Achado } from "../../src/regras/achado";
import { dispensasDeclaradasNoPlano, type ParteConfirmada } from "../../src/regras/mapa-pgp";

const pagina = (numero: number, texto: string): PaginaLida => ({
  numero,
  origem: "texto",
  texto,
  caracteres: texto.length,
});

const PAGINAS = [
  pagina(
    1,
    "Plano de gerenciamento dos custos\nMétodo: horas por perfil, mais despesas de campo, viagens e impressão.\nControle: planejado × real por produto.",
  ),
  pagina(
    2,
    "Linha de base dos custos\nCustos diretos: horas da equipe. Despesas de campo ficam fora desta conta.\nReserva de contingência: a definir pelo GP.",
  ),
  pagina(
    3,
    "Plano de gerenciamento da qualidade\nDados: protocolo de coleta e checagem de consistência diária; microdados anonimizados.",
  ),
  pagina(
    4,
    "Partes dispensadas pelo GP\nNão contam como ausentes na conferência do plano (etapa 5).\nParte\tJustificativa (sugestão do PMO)\nA16 Linha de base da medição do desempenho\tFundido no A4 e no A7: planejado × real por produto.\nB28 Relatório de riscos\tSeção do relatório de status.",
  ),
];
const pgp: DocumentoLido = {
  id: "pgp",
  papel: "pgp",
  nomeArquivo: "plano.docx",
  tamanhoBytes: 1,
  totalPaginas: PAGINAS.length,
  lidoEm: "",
  paginas: PAGINAS,
};

const MAPA: ParteConfirmada[] = [
  { codigo: "A4", situacao: "presente", paginaInicial: 1, paginaFinal: 1, posicaoTitulo: 0 },
  { codigo: "A15", situacao: "presente", paginaInicial: 2, paginaFinal: 2, posicaoTitulo: 0 },
  { codigo: "A5", situacao: "presente", paginaInicial: 3, paginaFinal: 3, posicaoTitulo: 0 },
  { codigo: "A16", situacao: "dispensada", justificativa: "Fundido no A4 e no A7: planejado × real." },
];

const ausente = (a: Partial<AchadoPmo>): AchadoPmo => ({
  id: "e1",
  tipo: "ausente",
  parte: "A15",
  item: "",
  titulo: "Despesas fora da linha de base",
  descricao: "",
  evidencias: [],
  sugestao: "Sugere-se incluir.",
  termosProcurados: [],
  ...a,
});
const conferir = (a: AchadoPmo, mapa: ParteConfirmada[] = MAPA) =>
  conferirLeitura({ achados: [a], vereditos: [], dispensas: [], observacoes: [] }, { pgp }, [], mapa)[0]!;

describe("partes dispensadas no mapa da etapa 5", () => {
  it("lê a lista 'Partes dispensadas pelo GP' do próprio plano, com a justificativa", () => {
    const d = dispensasDeclaradasNoPlano(PAGINAS, PARTES_PGP);
    expect([...d.keys()]).toEqual(["A16", "B28"]);
    expect(d.get("A16")).toBe("Fundido no A4 e no A7: planejado × real por produto.");
  });

  it("o mapa inicial leva as dispensas da etapa 4 (que valem sobre as do plano) e as declaradas", () => {
    const base = pgpInicial();
    const p = { ...base, gerar: { ...base.gerar, B7: false, A16: false } };
    expect(dispensasDaEtapa4(p).get("B7")).toMatch(/^Dispensada pelo GP na etapa 4/);
    const proposta = PARTES_PGP.map((x) => ({
      codigo: x.codigo,
      situacao: "conteudo" as const,
      cobertura: 1,
    }));
    const mapa = mapaInicialDaConferencia(proposta, PAGINAS, PARTES_PGP, p);
    const de = (c: string) => mapa.find((m) => m.codigo === c);
    expect(de("B7")?.situacao).toBe("dispensada");
    expect(de("A16")?.justificativa).toMatch(/^Dispensada pelo GP na etapa 4/);
    expect(de("B28")?.justificativa).toMatch(
      /^Declarada dispensada pelo GP no próprio plano: Seção do relatório/,
    );
    expect(de("A4")?.situacao).toBe("presente");
  });
});

describe("busca do ausente do PMO", () => {
  it("procura só na parte apontada: o termo em outra parte não rebaixa", () => {
    const a = ausente({ termosProcurados: ["viagens", "impressão"] });
    expect(conferir(a).situacao).toBe("valido");
    expect(conferir(a).procuradoEm).toMatch(/^A15, p\. 2; termos do PMO/);
    // sem mapa, vale o plano inteiro (como antes)
    expect(conferir(a, []).situacao).toBe("rebaixado");
  });

  it("descarta o trecho citado como evidência do próprio achado", () => {
    const evidencia = {
      doc: "pgp" as const,
      pagina: 2,
      trecho: "Custos diretos: horas da equipe. Despesas de campo ficam fora desta conta.",
    };
    const a = ausente({ termosProcurados: ["despesas de campo"], evidencias: [evidencia] });
    expect(conferir(a).situacao).toBe("valido");
    // sem a evidência, o mesmo termo na parte rebaixa
    expect(conferir({ ...a, evidencias: [] }).situacao).toBe("rebaixado");
    expect(conferir({ ...a, evidencias: [] }).localizadoEm?.pagina).toBe(2);
  });

  it("parte dispensada: procura nas partes que absorvem o conteúdo (pela justificativa)", () => {
    expect(regiaoDoAusente("A16", MAPA)).toBeUndefined(); // o A7 não tem páginas no mapa: plano inteiro
    const comA7: ParteConfirmada[] = [
      ...MAPA,
      { codigo: "A7", situacao: "presente", paginaInicial: 3, paginaFinal: 3, posicaoTitulo: 0 },
    ];
    expect([...(regiaoDoAusente("A16", comA7) ?? [])]).toEqual(["A4", "A7"]);
    const a = ausente({ parte: "A16", termosProcurados: ["planejado × real"] });
    const r = conferir(
      a,
      comA7.filter((m) => m.codigo !== "A5"),
    );
    expect(r.situacao).toBe("rebaixado");
    expect(r.localizadoEm?.pagina).toBe(1);
  });

  it("com termos do PMO, usa só eles, não os sinais do item da ficha", () => {
    const a = ausente({ parte: "A5", item: "A5.12", termosProcurados: ["consentimento", "LGPD"] });
    expect(conferir(a).situacao).toBe("valido");
    // sem termos, os sinais do item (protocolo de coleta, checagem…) estão na parte: rebaixa
    expect(conferir({ ...a, termosProcurados: [] }).situacao).toBe("rebaixado");
  });
});

describe("veredito do PMO sobre os achados do código (decisão 0052)", () => {
  const achado = (id: string, tipo: Achado["tipo"], parte: string): Achado =>
    ({ id, tipo, parte, partes: [parte], titulo: id, evidencias: [] }) as unknown as Achado;
  const base = [
    achado("c1", "ausente", "A15"),
    achado("c2", "vago", "A4"),
    achado("c3", "conflituoso", "B9"),
    achado("c4", "ausente", "A5"),
    achado("c5", "ausente", "A15"),
    achado("c6", "ausente", "A4"),
  ];
  const v = (
    achado: string,
    veredito: VereditoCandidato["veredito"],
    extra: Partial<VereditoCandidato> = {},
  ) => ({
    achado,
    veredito,
    evidencias: [],
    motivo: "",
    ...extra,
  });

  it("só o 'sustenta' conta; falso com trecho conferido; incompleto ou sem veredito fica como candidato", () => {
    const r = conferirVereditos(
      {
        achados: [],
        vereditos: [
          v("c1", "sustenta"),
          v("c2", "falso", {
            evidencias: [{ doc: "pgp", pagina: 1, trecho: "Controle: planejado × real por produto." }],
          }),
          v("c3", "regra_errada", { motivo: "a regra não deveria valer no registro de questões" }),
          v("c4", "nao_se_aplica"),
          v("c6", "falso", {
            evidencias: [{ doc: "pgp", pagina: 2, trecho: "Custos diretos: horas da equipe." }],
          }),
          v("zz", "sustenta"),
        ],
        dispensas: [],
        observacoes: [],
      },
      base,
      new Map(),
      MAPA,
      [pgp],
    );
    const de = (id: string) => r.candidatos.find((c) => c.achado.id === id)!;
    expect(r.contam.map((a) => a.id)).toEqual(["c1"]);
    expect(de("c2").situacao).toBe("falso");
    expect(de("c2").avisos).toEqual([]);
    expect(de("c3").situacao).toBe("regra-errada");
    expect(de("c4").situacao).toBe("sem-veredito"); // "não se aplica" sem o motivo
    expect(de("c5").situacao).toBe("sem-veredito");
    // o trecho existe, mas na p. 2, que é o A15, fora da parte A4
    expect(de("c6").avisos.join(" ")).toMatch(/fora da parte A4 \(p\. 2\)/);
    expect(r.desconhecidos).toEqual(["zz"]);
  });

  it("dispensa só do plano é candidata: 'não cabe' devolve a parte e os achados dela viram candidatos", () => {
    const base = pgpInicial();
    const proposta = PARTES_PGP.map((x) => ({
      codigo: x.codigo,
      situacao: "conteudo" as const,
      cobertura: 1,
    }));
    // A16 dispensada na etapa 4 (vale direto); B28 só no plano (candidata)
    const mapa = mapaInicialDaConferencia(proposta, PAGINAS, PARTES_PGP, {
      ...base,
      gerar: { ...base.gerar, A16: false },
    });
    expect(dispensasCandidatas(mapa).map((p) => p.codigo)).toEqual(["B28"]);
    const c = conferirComCandidatos(
      {
        pgp: PAGINAS,
        partes: PARTES_PGP,
        premissas: [],
        mapa,
        caracteristicas: CARACTERISTICAS_PADRAO,
        premissasAplicaveis: {},
        requisitos: [],
      },
      proposta,
    );
    expect(c.dispensas.map((d) => d.parte)).toEqual(["B28"]);
    const doB28 = c.condicionais.get("B28") ?? [];
    expect(doB28.length).toBeGreaterThan(0);
    expect(c.resultado.achados.some((a) => a.parte === "B28")).toBe(false);
    const resposta = (veredito: "cabe" | "nao_cabe", motivo = "") => ({
      achados: [],
      vereditos: doB28.map((a) => v(a.id, "sustenta")),
      dispensas: [{ parte: "B28", veredito, motivo }],
      observacoes: [],
    });
    const cabe = conferirVereditos(resposta("cabe"), c.resultado.achados, c.condicionais, mapa, [pgp]);
    expect(cabe.partesDevolvidas).toEqual([]);
    expect(cabe.candidatos.some((x) => x.daDispensa)).toBe(false);
    const naoCabe = conferirVereditos(
      resposta("nao_cabe", "a ficha não deixa dispensar o B28.1"),
      c.resultado.achados,
      c.condicionais,
      mapa,
      [pgp],
    );
    expect(naoCabe.partesDevolvidas).toEqual(["B28"]);
    expect(naoCabe.contam.filter((a) => a.parte === "B28")).toHaveLength(doB28.length);
    // "não cabe" sem o motivo: a dispensa fica como o plano declara
    expect(
      conferirVereditos(resposta("nao_cabe"), c.resultado.achados, c.condicionais, mapa, [pgp])
        .partesDevolvidas,
    ).toEqual([]);
    // o pedido leva a dispensa candidata e os achados se ela não couber
    const pedido = pedidoLeitura({
      partesPresentes: [],
      caracteristicas: CARACTERISTICAS_PADRAO,
      premissasAplicaveis: {},
      achadosDoCodigo: c.resultado.achados,
      temTap: false,
      temRfp: false,
      dispensasCandidatas: c.dispensas,
      condicionais: c.condicionais,
    });
    expect(pedido).toContain("## Dispensas declaradas só no plano: candidatas");
    expect(pedido).toContain("### B28 — Relatório de riscos");
    expect(pedido).toContain(`- id \`${doB28[0]!.id}\``);
  });
});
