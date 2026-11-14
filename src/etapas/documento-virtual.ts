// Documento gerado na ferramenta (a minuta da proposta, o TAP, o plano) como documento "lido": uma página por seção,
// com o texto como sai no DOCX. Assim o PMO cita o documento como cita a RFP, e o código confere a citação na
// "página" (seção) e roda as regras da etapa 5 sobre o plano gerado (autoconferência).
import type { DocumentoLido } from "../dossie/esquema";
import type { PapelDocumento } from "./etapas";
import type { DocumentoExportavel } from "../exportacao/modelo";

export function documentoDeExportavel(
  exp: DocumentoExportavel,
  opcoes: { id: string; papel: PapelDocumento; nomeArquivo: string; lidoEm: string },
): DocumentoLido {
  const paginas = exp.secoes.map((s, k) => {
    const linhas = [
      s.titulo,
      ...(s.paragrafos ?? []),
      ...(s.tabela ? [s.tabela.colunas.join("\t"), ...s.tabela.linhas.map((l) => l.join("\t"))] : []),
    ];
    const texto = linhas.join("\n");
    return { numero: k + 1, origem: "texto" as const, texto, caracteres: texto.length };
  });
  return {
    id: opcoes.id,
    papel: opcoes.papel,
    nomeArquivo: opcoes.nomeArquivo,
    tamanhoBytes: 0,
    totalPaginas: paginas.length,
    lidoEm: opcoes.lidoEm,
    paginas,
  };
}
