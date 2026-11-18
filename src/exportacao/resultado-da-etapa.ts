// Resultado de uma etapa para apresentação (decisão 0072): quando uma etapa fecha, um documento com o resultado final
// de cada passo (os mesmos relatórios que a tela exporta), o placar resumido e as conferências da segunda instância
// (achados e o que o GP decidiu). Gerado fora do Git, a partir do dossiê e dos arquivos do teste externo; o documento
// sai sempre como minuta, porque o GP do teste não revisou item a item.
import type { Dossie } from "../dossie/esquema";
import { analisarRfp } from "../etapas/1-rfp/analisar-rfp";
import { montarPontoDePartida } from "../etapas/2-proposta/ponto-de-partida";
import { camposDoDossie, type DocumentoExportavel, type Secao } from "./modelo";
import { montarPgp } from "./relatorio-pgp";
import { montarPropostaTecnica } from "./relatorio-proposta";
import { montarAnaliseRfp } from "./relatorio-rfp";
import { montarRegistroPremissas, montarTap } from "./relatorio-tap";

export const NOME_DA_ETAPA: Record<number, string> = {
  1: "Leitura da RFP",
  2: "Proposta",
  3: "Termo de abertura (TAP)",
  4: "Plano de gerenciamento do projeto (PGP)",
  5: "Conferência do plano",
};

/** O que o teste externo deixou de cada passo: o placar da importação e a conferência da segunda instância. */
export interface ArquivosDoPasso {
  passo: string;
  /** Conteúdo do resposta-*.placar.md, ou undefined. */
  placar?: string;
  /** Conteúdo do conferencia-*.md, ou undefined (a etapa 5 não tem segunda instância). */
  conferencia?: string;
}

/** Linha de markdown em texto corrido: sem marcadores, negrito nem crase. */
function semMarkdown(l: string): string {
  return l
    .replace(/^#+\s*/, "")
    .replace(/^\s*[-*]\s+/, "• ")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();
}

/**
 * O placar resumido: o começo (tokens, citações, achados) e as linhas de título e de resumo de cada bloco, até um
 * limite. O placar inteiro fica na pasta do caso.
 */
export function placarResumido(placar: string, limite = 40): string[] {
  const linhas = placar.split("\n").filter((l) => l.trim());
  const titulo = (l: string) => /^#{1,3}\s/.test(l);
  // o começo vai até o primeiro bloco (no máximo 6 linhas); de cada bloco, o título e a primeira linha
  const k0 = linhas.findIndex((l, k) => k > 0 && titulo(l));
  const comeco = Math.min(6, k0 < 0 ? 6 : k0);
  const resumo = linhas.filter((l, k) => k < comeco || titulo(l) || (k > 0 && titulo(linhas[k - 1] ?? "")));
  const saida = resumo.slice(0, limite).map(semMarkdown);
  if (resumo.length > limite) saida.push(`(… mais ${resumo.length - limite} linha(s) no placar completo)`);
  return saida;
}

/** Os blocos do conferencia-*.md: cabeçalho, achados, conferido e as decisões do GP. */
export function lerConferenciaEmBlocos(texto: string): {
  cabecalho: string[];
  achados: string[];
  conferido: string[];
  decisoes: string[];
} {
  const out = {
    cabecalho: [] as string[],
    achados: [] as string[],
    conferido: [] as string[],
    decisoes: [] as string[],
  };
  let atual: keyof typeof out = "cabecalho";
  for (const l of texto.split("\n")) {
    if (/^## Achados/.test(l)) atual = "achados";
    else if (/^## O que foi conferido/.test(l)) atual = "conferido";
    else if (/^## Decisão do GP/.test(l)) {
      atual = "decisoes";
      out.decisoes.push(semMarkdown(l));
    } else if (l.trim() && !/^# /.test(l)) out[atual].push(semMarkdown(l));
  }
  return out;
}

/** O resultado final do passo: os relatórios que a tela da etapa exporta, com o título de cada um nas seções. */
function resultadoFinal(dossie: Dossie, etapa: number, agora: Date): Secao[] {
  const docs = dossie.documentos.filter((d) => d.papel === "rfp" || d.papel === "anexo-rfp");
  const comPrefixo = (d: DocumentoExportavel): Secao[] =>
    d.secoes.map((s) => ({ ...s, titulo: `${d.titulo} — ${s.titulo}` }));
  if (etapa === 1) return comPrefixo(montarAnaliseRfp(dossie, analisarRfp(docs, agora), agora));
  if (etapa === 2) {
    if (!dossie.proposta) return [];
    return comPrefixo(
      montarPropostaTecnica(dossie, montarPontoDePartida(docs, dossie.analiseRfp, agora), docs, agora),
    );
  }
  if (etapa === 3) {
    if (!dossie.tap) return [];
    return [...comPrefixo(montarTap(dossie, agora)), ...comPrefixo(montarRegistroPremissas(dossie, agora))];
  }
  if (etapa === 4) return dossie.pgp ? comPrefixo(montarPgp(dossie, agora)) : [];
  return [];
}

/**
 * O documento de resultado da etapa (decisão 0072): como ler, o placar resumido e as conferências de cada passo e,
 * por fim, o resultado final da etapa.
 */
export function montarResultadoDaEtapa(
  dossie: Dossie,
  etapa: number,
  passos: ArquivosDoPasso[],
  { caso, agora = new Date() }: { caso: string; agora?: Date },
): DocumentoExportavel {
  const secoes: Secao[] = [
    {
      titulo: "Como ler este documento",
      paragrafos: [
        `Resultado da etapa ${etapa} (${NOME_DA_ETAPA[etapa] ?? ""}) no teste externo, caso ${caso}, gerado quando todos os passos da etapa fecharam (com "seguir" do GP ou sem achado pendente).`,
        "Para cada passo: o placar resumido (o que o código conferiu na resposta do PMO) e a conferência da segunda instância (achados, o que passou e a decisão do GP). Depois, o resultado final da etapa, como a tela o exporta.",
        "Os rótulos valem como na tela: Do documento (com página e trecho), Sugestão e Decisão do GP. Tudo do PMO e da segunda instância é Sugestão; quem decide é o GP.",
      ],
    },
  ];
  for (const p of passos) {
    if (p.placar)
      secoes.push({ titulo: `Passo ${p.passo}: placar resumido`, paragrafos: placarResumido(p.placar) });
    if (p.conferencia) {
      const c = lerConferenciaEmBlocos(p.conferencia);
      secoes.push({
        titulo: `Passo ${p.passo}: segunda instância`,
        paragrafos: [
          ...c.cabecalho,
          "Achados:",
          ...(c.achados.length ? c.achados : ["• nenhum"]),
          "O que foi conferido e passou:",
          ...(c.conferido.length ? c.conferido : ["• (não informado)"]),
          ...(c.decisoes.length ? ["O que o GP decidiu e o que foi corrigido:", ...c.decisoes] : []),
        ],
      });
    }
    if (!p.placar && !p.conferencia)
      secoes.push({
        titulo: `Passo ${p.passo}`,
        paragrafos: ["Sem placar nem conferência na pasta do caso."],
      });
  }
  const final = resultadoFinal(dossie, etapa, agora);
  secoes.push(
    ...(final.length
      ? final
      : [{ titulo: "Resultado final", paragrafos: ["O dossiê não tem o resultado desta etapa."] }]),
  );
  return {
    titulo: `Resultado da etapa ${etapa} — ${NOME_DA_ETAPA[etapa] ?? ""}`,
    subtitulo: `Teste externo, caso ${caso}`,
    ...camposDoDossie(dossie),
    minuta: true,
    geradoEm: agora,
    secoes,
  };
}
