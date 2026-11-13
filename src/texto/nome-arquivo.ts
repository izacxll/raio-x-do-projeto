// Nome de arquivo a partir do nome do projeto ou, na falta dele, dos nomes dos PDFs.

// origem: App-final-4.jsx, slugArquivo, linha 2850
export function slugArquivo(texto: string, max = 40): string {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/, "");
}

// origem: App-final-4.jsx, GENERICAS_ARQ, linha 2852 (sem os nomes de casos do Raio-X)
const PALAVRAS_GENERICAS = new Set([
  "plano",
  "planos",
  "de",
  "do",
  "da",
  "dos",
  "das",
  "e",
  "o",
  "a",
  "trabalho",
  "termo",
  "referencia",
  "tr",
  "proposta",
  "tecnica",
  "comercial",
  "versao",
  "final",
  "revisado",
  "revisada",
  "rev",
  "novo",
  "nova",
  "copia",
  "documento",
  "doc",
  "anexo",
  "edital",
  "chamamento",
  "pt",
  "pdf",
  "txt",
  "docx",
  "raio",
  "texto",
  "colado",
  "exemplo",
  "teste",
  "municipio",
  "mun",
  "prefeitura",
  "fgv",
  "projetos",
  "projeto",
  "rfp",
  "tap",
  "pgp",
]);

// origem: App-final-4.jsx, nomeParaArquivo, linha 2854
export function nomeParaArquivo(nomeProjeto: string, nomesArquivos: string[] = []): string {
  const nome = slugArquivo(nomeProjeto);
  if (nome) return nome;
  for (const arquivo of nomesArquivos) {
    const partes = slugArquivo(String(arquivo || "").replace(/\.[a-z0-9]{2,4}$/i, ""), 200)
      .split("-")
      .filter((p) => p.length > 1 && !PALAVRAS_GENERICAS.has(p) && !/^v?\d+$/.test(p));
    if (partes.length) return partes.join("-").slice(0, 40).replace(/-+$/, "");
  }
  return "";
}
