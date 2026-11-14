// "Relatório de leitura": o que o código conseguiu ler de cada PDF, página a página.
// É a primeira saída do app (F0) e serve para o GP saber, antes de qualquer etapa, que páginas
// precisam ser conferidas no documento original.
import type { Dossie, DocumentoLido, PaginaLida } from "../dossie/esquema";
import { NOME_PAPEL } from "../etapas/etapas";
import { resumirLeitura } from "../leitura/ler-documento";
import { camposDoDossie, precisaDeMinuta, type DocumentoExportavel, type Secao } from "./modelo";

export const NOME_ORIGEM: Record<PaginaLida["origem"], string> = {
  texto: "Texto do PDF",
  ocr: "OCR",
  "nao-verificavel": "Não verificável",
};

function observacao(p: PaginaLida): string {
  if (p.origem === "nao-verificavel") return `${p.motivo ?? "sem texto legível"}. Conferir no documento.`;
  if (p.origem === "ocr")
    return `Lida por OCR (confiança ${p.confiancaOcr ?? "?"}%). Conferir trechos citados.`;
  if (p.temImagem)
    return "Tem figura ou tabela em imagem: o conteúdo dela não foi lido. Conferir no documento.";
  return "";
}

function listarPaginas(numeros: number[]): string {
  return numeros.length ? numeros.join(", ") : "nenhuma";
}

function secaoDocumento(d: DocumentoLido): Secao {
  const r = resumirLeitura(d.paginas);
  return {
    titulo: `${NOME_PAPEL[d.papel]} · ${d.nomeArquivo}`,
    paragrafos: [
      `${d.totalPaginas} páginas: ${r.texto} com texto do PDF, ${r.ocr} lidas por OCR e ${r.naoVerificaveis.length} não verificáveis.`,
      `Páginas não verificáveis: ${listarPaginas(r.naoVerificaveis)}.`,
      `Páginas com figura ou tabela em imagem: ${listarPaginas(r.comImagem)}.`,
    ],
    tabela: {
      colunas: ["Página", "Como foi lida", "Caracteres", "Observação"],
      larguras: [1, 2, 1.2, 6],
      linhas: d.paginas.map((p) => [
        String(p.numero),
        NOME_ORIGEM[p.origem],
        String(p.caracteres),
        observacao(p),
      ]),
    },
  };
}

export function montarRelatorioLeitura(dossie: Dossie, agora = new Date()): DocumentoExportavel {
  return {
    titulo: "Relatório de leitura dos documentos",
    subtitulo:
      "O que o código conseguiu ler de cada PDF. Página não verificável não quer dizer que o conteúdo não exista: conferir no documento.",
    ...camposDoDossie(dossie),
    minuta: precisaDeMinuta(dossie.itens),
    geradoEm: agora,
    secoes: dossie.documentos.map(secaoDocumento),
  };
}
