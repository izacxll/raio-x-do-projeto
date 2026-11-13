import { describe, expect, it } from "vitest";
import { lerDocumento, resumirLeitura, type DocumentoPdf } from "../../src/leitura/ler-documento";

const OPS = { paintImageXObject: 85, paintInlineImageXObject: 86 };
const TEXTO_LONGO = "Objeto: contratação de consultoria para avaliação de política pública.";

function documentoFalso(paginas: string[]): DocumentoPdf {
  return {
    numPages: paginas.length,
    getPage: async (n) => ({
      getTextContent: async () => ({
        items: paginas[n - 1]
          ? [{ str: paginas[n - 1], transform: [1, 0, 0, 10, 0, 700], width: 300, height: 10 }]
          : [],
      }),
      getOperatorList: async () => ({ fnArray: [], argsArray: [] }),
    }),
  };
}

describe("lerDocumento", () => {
  it("lê o texto de cada página e guarda o número da página", async () => {
    const paginas = await lerDocumento(documentoFalso([TEXTO_LONGO, TEXTO_LONGO]), { OPS });
    expect(paginas.map((p) => [p.numero, p.origem])).toEqual([
      [1, "texto"],
      [2, "texto"],
    ]);
  });

  it("página sem texto e sem OCR fica 'não verificável'", async () => {
    const [, p2] = await lerDocumento(documentoFalso([TEXTO_LONGO, ""]), { OPS });
    expect(p2?.origem).toBe("nao-verificavel");
    expect(p2?.motivo).toMatch(/OCR não foi executado/);
  });

  it("usa o OCR só nas páginas sem texto", async () => {
    const chamadas: number[] = [];
    const paginas = await lerDocumento(documentoFalso(["", TEXTO_LONGO]), {
      OPS,
      ocr: async (n) => {
        chamadas.push(n);
        return { texto: TEXTO_LONGO, confianca: 88.4 };
      },
    });
    expect(chamadas).toEqual([1]);
    expect(paginas[0]).toMatchObject({ origem: "ocr", confiancaOcr: 88 });
  });

  it("OCR com confiança baixa deixa a página 'não verificável'", async () => {
    const [p] = await lerDocumento(documentoFalso([""]), {
      OPS,
      ocr: async () => ({ texto: TEXTO_LONGO, confianca: 20 }),
    });
    expect(p).toMatchObject({ origem: "nao-verificavel", confiancaOcr: 20 });
    expect(p?.motivo).toMatch(/confiança baixa/);
  });

  it("falha do OCR não derruba a leitura", async () => {
    const paginas = await lerDocumento(documentoFalso(["", TEXTO_LONGO]), {
      OPS,
      ocr: async () => {
        throw new Error("motor indisponível");
      },
    });
    expect(paginas[0]?.origem).toBe("nao-verificavel");
    expect(paginas[0]?.motivo).toMatch(/motor indisponível/);
    expect(paginas[1]?.origem).toBe("texto");
  });

  it("pode ser cancelada", async () => {
    const controle = new AbortController();
    controle.abort();
    await expect(
      lerDocumento(documentoFalso([TEXTO_LONGO]), { OPS, sinal: controle.signal }),
    ).rejects.toThrow(/cancelada/);
  });

  it("resume a leitura", async () => {
    const paginas = await lerDocumento(documentoFalso([TEXTO_LONGO, ""]), { OPS });
    expect(resumirLeitura(paginas)).toMatchObject({ total: 2, texto: 1, ocr: 0, naoVerificaveis: [2] });
  });
});
