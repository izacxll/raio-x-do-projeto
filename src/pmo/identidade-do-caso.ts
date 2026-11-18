// Identidade do caso no topo do pedido da segunda instância (decisão 0066): os arquivos, o objeto da RFP (com página)
// e dois ou três termos do objeto que a resposta certa deve conter. Com vários casos lado a lado, o revisor confere que
// leu o caso certo antes de achar qualquer coisa; se não for, para sem achados.
import type { DocumentoLido } from "../dossie/esquema";
import { extrairIdentificacao } from "../extracao/rfp/identificacao";
import type { DocumentoRfp } from "../extracao/rfp/item";
import { prepararDocumento } from "../extracao/rfp/item";
import { mapearRfp } from "../extracao/rfp/mapa";
import { tirarAcentos } from "../texto/normalizar";

export interface IdentidadeDoCaso {
  projeto?: string;
  arquivos: { papel: string; nome: string; paginas: number }[];
  /** O objeto, do documento: a primeira frase da seção do objeto da RFP, com a página. */
  objeto?: { pagina: number; trecho: string };
  /** Até três palavras do objeto que não são de todo edital, as que mais aparecem na RFP primeiro. */
  termos: string[];
}

/**
 * Palavras de todo edital ou TR (sem acento): não identificam o caso. Saíram dos objetos das RFPs públicas de teste e
 * dos TRs do teste externo. O nome da FGV entra porque, na contratação direta, o objeto nomeia a contratada.
 */
const GENERICAS = new Set(
  (
    "acoes administracao ambito anexo apoio area atividades celebracao cidade concessao conforme constantes " +
    "consultoria contemplando continuada continuadas continuado continuados contratacao contratada contratado " +
    "contratar credenciamento deste desenvolvimento disposto diversas edital elaboracao empresa especializada " +
    "especializadas especializado especializados especificacoes estado estudo estudos eventual execucao fisica " +
    "fomento fundacao getulio inciso juridica licitacao municipal municipio objeto organizacoes parceira parceiro " +
    "parceria pessoa politicas prestacao presente previo processo projeto projetos publica publicas publico publicos " +
    "referencia registro servico servicos sociedade tecnica tecnicas tecnico tecnicos termo vargas vinculadas " +
    "vinculados visando voltadas voltados colaboracao"
  ).split(" "),
);

const semAcento = (t: string) => tirarAcentos(t.toLowerCase());

/**
 * Os primeiros termos do objeto que não são de todo edital e que o texto da RFP traz (a palavra inteira, sem acento).
 * A ordem do objeto vale mais que a frequência: contadas, ganham as palavras de todo edital ("garantia", "situação").
 */
export function termosDoObjeto(objeto: string, docs: DocumentoRfp[], quantos = 3): string[] {
  // a palavra partida na quebra de linha ("desenvolvi- mento"), o quadro da capa que segue ("VALOR TOTAL… R$") e o
  // título seguinte, colado na frase ("… do Estado. JUSTIFICATIVA …")
  const frase =
    objeto
      .replace(/(\p{L})-\s+(\p{L})/gu, "$1$2")
      .split(/\bvalor\b|R\$/i)[0]
      ?.split(/[.;]\s+(?=\p{Lu})/u)[0] ?? "";
  const paginas = docs.flatMap((d) => d.paginas.map((p) => semAcento(p.texto)));
  const vistos = new Set<string>();
  const termos: string[] = [];
  for (const m of frase.matchAll(/\p{L}{6,}/gu)) {
    const termo = m[0].toLowerCase();
    const chave = semAcento(termo);
    if (GENERICAS.has(chave) || vistos.has(chave)) continue;
    vistos.add(chave);
    const re = new RegExp(`(?<!\\p{L})${chave}(?!\\p{L})`, "u");
    if (paginas.some((p) => re.test(p))) termos.push(termo);
    if (termos.length === quantos) break;
  }
  return termos;
}

export function identidadeDoCaso(documentos: DocumentoLido[], projeto?: string): IdentidadeDoCaso {
  const arquivos = documentos.map((d) => ({ papel: d.papel, nome: d.nomeArquivo, paginas: d.totalPaginas }));
  const docs = [
    ...documentos.filter((d) => d.papel === "rfp").map((d) => prepararDocumento(d.id, "RFP", d.paginas)),
    ...documentos
      .filter((d) => d.papel === "anexo-rfp")
      .map((d) => prepararDocumento(d.id, `Anexo: ${d.nomeArquivo}`, d.paginas)),
  ];
  const nome = projeto?.trim() || undefined;
  if (!docs.length) return { projeto: nome, arquivos, termos: [] };
  const item = extrairIdentificacao(docs, mapearRfp(docs)).find((i) => i.id === "identificacao:objeto");
  if (item?.situacao !== "localizado" || !item.origem) return { projeto: nome, arquivos, termos: [] };
  return {
    projeto: nome,
    arquivos,
    objeto: { pagina: item.origem.pagina, trecho: item.origem.trecho },
    termos: termosDoObjeto(item.origem.trecho, docs),
  };
}

/** O bloco do topo do pedido. Sem RFP no dossiê, só os arquivos. */
export function identidadeEmTexto(id: IdentidadeDoCaso): string {
  const linhas = ["## Caso desta conferência (confira antes de tudo)"];
  if (id.projeto) linhas.push(`- Projeto: ${id.projeto}`);
  linhas.push(
    ...id.arquivos.map(
      (a) => `- Documento: ${a.nome} (${a.papel}, ${a.paginas} página${a.paginas === 1 ? "" : "s"})`,
    ),
  );
  if (id.objeto) linhas.push(`- Objeto (do documento, p. ${id.objeto.pagina}): "${id.objeto.trecho}"`);
  if (id.termos.length)
    linhas.push(`- Termos que o documento e a resposta deste caso trazem: ${id.termos.join(", ")}`);
  linhas.push(
    "",
    'Antes de conferir, veja se os documentos acima, o pedido do passo e a resposta são deste caso (o mesmo arquivo, o mesmo objeto, os termos). Se algum for de outro caso, não aponte achados: responda com achados [] e, em conferido, só "caso errado: <o que não bate>".',
  );
  return linhas.join("\n");
}
