// Quadros do resultado da etapa no padrão (decisão 0089): equipe, produtos, cronograma em barras e premissas críticas.
// Tudo montado por código a partir do que a etapa já calculou; nenhum número do modelo.
import type { Cronograma } from "../etapas/2-proposta/cronograma";
import type { PgpDossie, PropostaDossie } from "../dossie/esquema";
import { calcularPreco } from "../etapas/2-proposta/preco";
import { curto } from "./capa-de-decisao";
import type { Secao } from "./modelo";

const A_DEFINIR = "a definir pelo GP";

/** Equipe: perfil, requisito do TR, papel, horas e situação. */
export function quadroDaEquipe(p: PropostaDossie): Secao | undefined {
  const eap = p.eap?.resposta;
  if (!eap?.perfis.length) return undefined;
  const preco = calcularPreco(eap.perfis, eap.horas, p.parametros);
  return {
    titulo: "Equipe",
    tabela: {
      colunas: ["Perfil", "Requisito do TR", "Papel", "Horas", "Situação"],
      larguras: [2, 2.6, 3, 0.9, 1.6],
      linhas: eap.perfis.map((x) => {
        const l = preco.linhas.find((y) => y.perfil.id === x.id);
        return [
          x.nome,
          curto(x.requisito || "—", 120),
          curto(x.qualificacao || "—", 140),
          l
            ? `${Math.round(l.horas).toLocaleString("pt-BR")}${l.horasADefinir.length ? " + a definir" : ""}`
            : "—",
          x.exigido ? "exigido pelo TR" : "sugerido pelo PMO",
        ];
      }),
    },
  };
}

/** Produtos: produto, conteúdo, critério de aceite e prazo pela conta (a parcela é do contrato). */
export function quadroDosProdutos(
  p: PropostaDossie,
  prazos: { produto: string; fim?: number; dataFim?: Date }[] = [],
): Secao | undefined {
  const produtos = p.conteudo?.resposta.produtos ?? [];
  if (!produtos.length) return undefined;
  return {
    titulo: "Produtos",
    tabela: {
      colunas: ["Produto", "Conteúdo", "Critério de aceite", "Prazo"],
      larguras: [2, 3.4, 3.4, 1.4],
      linhas: produtos.map((x) => {
        const m = prazos.find((y) => y.produto === x.id);
        return [
          `${x.id} — ${x.nome}`,
          curto(x.descricao || "—", 160),
          curto(x.criteriosAceite.join("; ") || "—", 160),
          m?.dataFim
            ? m.dataFim.toLocaleDateString("pt-BR")
            : m?.fim !== undefined
              ? `dia útil ${m.fim}`
              : A_DEFINIR,
        ];
      }),
    },
  };
}

/**
 * Cronograma em barras: uma linha por produto, do início da primeira atividade ao fim da última (com a aprovação), em
 * meses de 21 dias úteis contados do início. Gerado das datas da conta do cronograma.
 */
export function quadroDoCronograma(crono: Cronograma | undefined, titulo = "Cronograma"): Secao | undefined {
  if (!crono?.atividades.length) return undefined;
  const meses = Math.max(1, Math.ceil(crono.total / 21));
  const porProduto = new Map<string, { ini: number; fim: number }>();
  for (const a of crono.atividades) {
    const atual = porProduto.get(a.produto);
    const fim = a.fimMaisCedo + a.aprovacao;
    porProduto.set(a.produto, {
      ini: Math.min(atual?.ini ?? Infinity, a.inicioMaisCedo),
      fim: Math.max(atual?.fim ?? 0, fim),
    });
  }
  const linhas = [...porProduto.entries()]
    .sort((a, b) => a[1].ini - b[1].ini)
    .map(([produto, x]) => [
      produto,
      ...Array.from({ length: meses }, (_, k) => (x.ini < (k + 1) * 21 && x.fim > k * 21 ? "█" : "")),
    ]);
  return {
    titulo,
    paragrafos: [
      `Barras por mês (21 dias úteis), do início da primeira atividade de cada produto ao fim da última, com a aprovação do cliente. Duração total: ${Math.round(crono.total)} dias úteis.`,
    ],
    tabela: {
      colunas: ["Produto", ...Array.from({ length: meses }, (_, k) => `M${k + 1}`)],
      larguras: [2, ...Array.from({ length: meses }, () => 0.6)],
      linhas,
      barras: true,
    },
  };
}

/**
 * Premissas críticas do plano: onde cada uma está tratada (B3, registro de premissas; B27, registro de riscos com
 * resposta e gatilho; A11, plano de mudanças com o reajuste) e a situação.
 */
export function quadroDasPremissasCriticas(
  p: PgpDossie,
  registroDoTap: { premissaCritica: string }[],
): Secao | undefined {
  const aplicaveis = Object.entries(p.premissasAplicaveis ?? {})
    .filter(([, v]) => v)
    .map(([k]) => k)
    .sort();
  if (!aplicaveis.length) return undefined;
  const b3 = new Set(
    [...registroDoTap, ...(p.riscos?.resposta.premissas ?? [])].map((x) => x.premissaCritica),
  );
  const b27 = new Set((p.riscos?.resposta.riscos ?? []).map((x) => x.premissaCritica));
  const a11 = (p.planos?.resposta.textos ?? [])
    .filter((t) => t.codigo === "A11")
    .flatMap((t) => t.itens.map((i) => i.texto))
    .join(" ");
  return {
    titulo: "Premissas críticas",
    paragrafos: ["Cada premissa crítica que se aplica ao projeto precisa estar nos três lugares do plano."],
    tabela: {
      colunas: ["Premissa", "B3 (premissas)", "B27 (riscos)", "A11 (mudanças)", "Situação"],
      larguras: [1, 1.2, 1.2, 1.2, 2.4],
      linhas: aplicaveis.map((pc) => {
        const lugares = [b3.has(pc), b27.has(pc), new RegExp(`\\b${pc}\\b`).test(a11)];
        const faltam = ["B3", "B27", "A11"].filter((_, k) => !lugares[k]);
        return [
          pc,
          ...lugares.map((x) => (x ? "sim" : "não localizado")),
          faltam.length ? `falta em ${faltam.join(", ")}` : "nos três lugares",
        ];
      }),
    },
  };
}
