// Etapa 5: a busca do ausente do PMO e as partes dispensadas no mapa (teste externo, PR da busca do ausente).
// - O mapa leva as dispensas da etapa 4 e as que o plano declara na lista "Partes dispensadas pelo GP".
// - O ausente do PMO é procurado só na parte apontada (ou nas que absorvem a dispensada), sem a evidência do próprio
//   achado e, quando o PMO manda termos, só com eles.
import { describe, expect, it } from "vitest";
import { PARTES_PGP } from "../../src/dominio/skill";
import type { DocumentoLido, PaginaLida } from "../../src/dossie/esquema";
import { pgpInicial } from "../../src/etapas/4-pgp/pgp";
import { dispensasDaEtapa4, mapaInicialDaConferencia } from "../../src/etapas/5-conferencia/dispensas";
import { conferirLeitura, regiaoDoAusente } from "../../src/etapas/5-conferencia/leitura-pmo";
import type { AchadoPmo } from "../../src/pmo/schemas/leitura";
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
  conferirLeitura({ achados: [a], observacoes: [] }, { pgp }, [], mapa)[0]!;

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
