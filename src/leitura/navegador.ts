// Leitura de PDF no navegador: pdf.js e OCR (Tesseract.js), tudo servido pelo próprio site (decisão 0019).
// O PDF nunca sai da máquina do GP.
import * as pdfjs from "pdfjs-dist";
import urlWorkerPdf from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { PaginaLida } from "../dossie/esquema";
import { lerDocumento, type Progresso, type Reconhecer } from "./ler-documento";

pdfjs.GlobalWorkerOptions.workerSrc = urlWorkerPdf;

const base = import.meta.env.BASE_URL;
const VENDOR = `${base}vendor`;

/** Escala da página renderizada para o OCR (2 ≈ 144 dpi numa página A4). */
const ESCALA_OCR = 2;

function abrirPdf(dados: Uint8Array) {
  return pdfjs.getDocument({
    data: dados,
    wasmUrl: `${VENDOR}/pdfjs/wasm/`,
    standardFontDataUrl: `${VENDOR}/pdfjs/standard_fonts/`,
    cMapUrl: `${VENDOR}/pdfjs/cmaps/`,
    iccUrl: `${VENDOR}/pdfjs/iccs/`,
  });
}

type MotorOcr = Awaited<ReturnType<typeof import("tesseract.js").createWorker>>;
let motorOcr: Promise<MotorOcr> | null = null;

/** Motor do OCR em português, criado uma vez e reaproveitado. Carregado só quando alguma página precisa. */
function obterMotorOcr(): Promise<MotorOcr> {
  if (!motorOcr) {
    motorOcr = (async () => {
      const { createWorker, OEM } = await import("tesseract.js");
      const origem = new URL(VENDOR, window.location.href).href;
      return createWorker("por", OEM.LSTM_ONLY, {
        workerPath: `${origem}/tesseract/worker.min.js`,
        corePath: `${origem}/tesseract/nucleo/`,
        langPath: `${origem}/tesseract/idiomas`,
        workerBlobURL: false,
        gzip: true,
        cacheMethod: "none",
      });
    })();
    // a falha não fica guardada: a próxima leitura tenta de novo
    motorOcr.catch(() => {
      motorOcr = null;
    });
  }
  return motorOcr;
}

export interface OpcoesLeituraNavegador {
  aoProgredir?: (p: Progresso) => void;
  sinal?: AbortSignal;
  usarOcr?: boolean;
}

export async function lerPdfNoNavegador(
  arquivo: File,
  opcoes: OpcoesLeituraNavegador = {},
): Promise<{ paginas: PaginaLida[]; totalPaginas: number }> {
  const dados = new Uint8Array(await arquivo.arrayBuffer());
  const tarefa = abrirPdf(dados);
  const pdf = await tarefa.promise;
  try {
    const ocr: Reconhecer | undefined =
      opcoes.usarOcr === false
        ? undefined
        : async (numero) => {
            const pagina = await pdf.getPage(numero);
            const viewport = pagina.getViewport({ scale: ESCALA_OCR });
            const canvas = document.createElement("canvas");
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            const contexto = canvas.getContext("2d");
            if (!contexto) throw new Error("o navegador não liberou o desenho da página");
            await pagina.render({ canvas, canvasContext: contexto, viewport, background: "white" }).promise;
            const motor = await obterMotorOcr();
            const r = await motor.recognize(canvas);
            canvas.width = 0;
            canvas.height = 0;
            return { texto: r.data.text, confianca: r.data.confidence };
          };
    const paginas = await lerDocumento(pdf, {
      OPS: pdfjs.OPS,
      ocr,
      aoProgredir: opcoes.aoProgredir,
      sinal: opcoes.sinal,
    });
    return { paginas, totalPaginas: pdf.numPages };
  } finally {
    await tarefa.destroy();
  }
}
