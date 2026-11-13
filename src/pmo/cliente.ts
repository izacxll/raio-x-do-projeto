// Único módulo que chama a API do Claude (decisão 0003; seção 8 da especificação).
// A chamada sai direto do navegador, com a chave do GP (SDK com dangerouslyAllowBrowser). Para trocar por um
// servidor intermediário no futuro, só este arquivo muda.
// A chave nunca é registrada: as mensagens de erro passam por semChave().
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import { ESFORCO, LIMITE_SAIDA, type PassoPmo } from "../config/modelo";
import { semChave } from "./chave";
import { custoDoUso, type UsoChamada } from "./custo";

/** Recusa por segurança: a API refaz o mesmo pedido noutro modelo, escolhido por ela (fallbacks "default"). */
const BETA_FALLBACK = "server-side-fallback-2026-07-01";

export interface OpcoesCliente {
  /** Só para testes: troca o fetch do navegador (respostas simuladas, sem chave real). */
  fetch?: typeof fetch;
}

function criarCliente(chave: string, opcoes: OpcoesCliente = {}): Anthropic {
  return new Anthropic({
    apiKey: chave,
    dangerouslyAllowBrowser: true,
    // excesso de pedidos, sobrecarga e queda de rede: o SDK espera e tenta de novo (Retry-After)
    maxRetries: 3,
    timeout: 15 * 60 * 1000,
    ...(opcoes.fetch ? { fetch: opcoes.fetch } : {}),
  });
}

export class ErroPmo extends Error {
  constructor(
    message: string,
    /** O que o GP pode fazer. */
    public readonly oQueFazer: string,
    public readonly tipo:
      | "chave"
      | "creditos"
      | "permissao"
      | "limite"
      | "sobrecarga"
      | "rede"
      | "tamanho"
      | "formato"
      | "recusa"
      | "cortada"
      | "cancelada"
      | "outro",
  ) {
    super(message);
  }
}

/** Erros da API em português, cada um com o que fazer (seção 8). */
export function traduzirErro(e: unknown): ErroPmo {
  if (e instanceof ErroPmo) return e;
  const bruto = semChave(e instanceof Error ? e.message : String(e));
  if (e instanceof Anthropic.APIUserAbortError)
    return new ErroPmo(
      "Chamada cancelada.",
      "Nada foi cobrado além do que a API já tinha gerado.",
      "cancelada",
    );
  if (e instanceof Anthropic.AuthenticationError)
    return new ErroPmo(
      "A chave da API não foi aceita.",
      "Confira se copiou a chave inteira (começa com sk-ant-). Se ela foi revogada, peça outra ao administrador do Claude da FGV.",
      "chave",
    );
  if (e instanceof Anthropic.PermissionDeniedError)
    return new ErroPmo(
      "A chave não tem permissão para este modelo ou esta operação.",
      "Fale com o administrador do Claude da FGV para liberar o modelo na organização.",
      "permissao",
    );
  if (e instanceof Anthropic.RateLimitError)
    return new ErroPmo(
      "Limite de uso da API atingido (muitas chamadas em pouco tempo).",
      "Espere um ou dois minutos e tente de novo. Se continuar, fale com o administrador do Claude da FGV.",
      "limite",
    );
  if (e instanceof Anthropic.ContentTooLargeError)
    return new ErroPmo(
      "Os documentos passam do tamanho que a API aceita numa chamada.",
      "Tire os anexos que não tratam do objeto (planilhas de outros lotes, modelos de declaração) e tente de novo.",
      "tamanho",
    );
  if (e instanceof Anthropic.APIConnectionError)
    return new ErroPmo(
      "Sem conexão com a API do Claude.",
      "Confira a internet e tente de novo. Redes que bloqueiam api.anthropic.com também causam este erro.",
      "rede",
    );
  if (e instanceof Anthropic.APIError) {
    const tipo = (e as { type?: string }).type ?? "";
    if (e.status === 402 || tipo === "billing_error" || /credit balance|billing/i.test(bruto))
      return new ErroPmo(
        "Os créditos da API da organização acabaram.",
        "Fale com o administrador do Claude da FGV: os créditos do mês são ligados à organização no Console.",
        "creditos",
      );
    if (e.status === 529 || tipo === "overloaded_error" || (e.status ?? 0) >= 500)
      return new ErroPmo(
        "A API do Claude está sobrecarregada ou fora do ar neste momento.",
        "Tente de novo em alguns minutos. Nada foi cobrado por esta tentativa.",
        "sobrecarga",
      );
    return new ErroPmo(
      `A API recusou o pedido (${e.status ?? "?"}): ${bruto}`,
      "Tente de novo; se repetir, avise o suporte do app.",
      "outro",
    );
  }
  return new ErroPmo(
    `Erro inesperado: ${bruto}`,
    "Tente de novo; se repetir, avise o suporte do app.",
    "outro",
  );
}

export interface ResultadoTeste {
  ok: boolean;
  mensagem: string;
}

/** "Testar": uma chamada mínima, com poucos tokens. */
export async function testarChave(
  chave: string,
  modelo: string,
  opcoes: OpcoesCliente = {},
): Promise<ResultadoTeste> {
  try {
    const r = await criarCliente(chave, opcoes).messages.create({
      model: modelo,
      max_tokens: LIMITE_SAIDA.teste,
      output_config: { effort: ESFORCO.teste },
      messages: [{ role: "user", content: "Responda só com a palavra OK." }],
    });
    return { ok: true, mensagem: `Chave aceita. Modelo ${r.model} respondeu.` };
  } catch (e) {
    const erro = traduzirErro(e);
    return { ok: false, mensagem: `${erro.message} ${erro.oQueFazer}` };
  }
}

export interface PedidoPmo<S extends z.ZodType> {
  chave: string;
  modelo: string;
  passo: Exclude<PassoPmo, "teste">;
  /** Skill e referências da etapa: vão com cache. */
  sistema: string;
  /** Texto dos documentos: vai com cache, antes do pedido. */
  documentos: string;
  /** O pedido do passo (ponto de partida, abordagem escolhida…). */
  pedido: string;
  schema: S;
  sinal?: AbortSignal;
  /** Caracteres recebidos até agora, para a barra de progresso. */
  aoReceber?: (caracteres: number) => void;
}

export interface RespostaPmo<T> {
  resposta: T;
  /** Modelo que de fato respondeu (pode ser outro, se houve recusa e a API usou o modelo de reserva). */
  modelo: string;
  uso: UsoChamada;
  custo: number | undefined;
  em: string;
}

function lerUso(u: Anthropic.Beta.BetaUsage): UsoChamada {
  return {
    entrada: u.input_tokens ?? 0,
    saida: u.output_tokens ?? 0,
    escritaCache: u.cache_creation_input_tokens ?? 0,
    leituraCache: u.cache_read_input_tokens ?? 0,
  };
}

/** Lê a resposta estruturada: JSON validado pelo schema. Fora do formato → erro em português. */
export function lerResposta<S extends z.ZodType>(texto: string, schema: S): z.infer<S> {
  let dados: unknown;
  try {
    dados = JSON.parse(texto);
  } catch {
    throw new ErroPmo(
      "A resposta do PMO veio fora do formato esperado.",
      "Tente de novo. Se repetir, o pedido pode estar grande demais para o limite de saída.",
      "formato",
    );
  }
  const r = schema.safeParse(dados);
  if (!r.success) {
    const onde = r.error.issues
      .slice(0, 3)
      .map((i) => i.path.join("."))
      .join("; ");
    throw new ErroPmo(
      `A resposta do PMO não seguiu o formato do passo (${onde}).`,
      "Tente de novo.",
      "formato",
    );
  }
  return r.data;
}

/** Uma chamada ao PMO: streaming, saída estruturada validada, cache da skill e dos documentos. */
export async function chamarPmo<S extends z.ZodType>(
  p: PedidoPmo<S>,
  opcoes: OpcoesCliente = {},
): Promise<RespostaPmo<z.infer<S>>> {
  const cliente = criarCliente(p.chave, opcoes);
  const formato = zodOutputFormat(p.schema);
  const montar = (comReserva: boolean) => ({
    model: p.modelo,
    max_tokens: LIMITE_SAIDA[p.passo],
    ...(comReserva ? { betas: [BETA_FALLBACK], fallbacks: "default" as const } : {}),
    output_config: {
      effort: ESFORCO[p.passo],
      format: { type: "json_schema" as const, schema: formato.schema },
    },
    system: [{ type: "text" as const, text: p.sistema, cache_control: { type: "ephemeral" as const } }],
    messages: [
      {
        role: "user" as const,
        content: [
          { type: "text" as const, text: p.documentos, cache_control: { type: "ephemeral" as const } },
          { type: "text" as const, text: p.pedido },
        ],
      },
    ],
  });

  const executar = async (comReserva: boolean) => {
    const fluxo = cliente.beta.messages.stream(montar(comReserva), { signal: p.sinal });
    let recebidos = 0;
    fluxo.on("text", (t) => {
      recebidos += t.length;
      p.aoReceber?.(recebidos);
    });
    return fluxo.finalMessage();
  };

  let final: Anthropic.Beta.BetaMessage;
  try {
    try {
      final = await executar(true);
    } catch (e) {
      // organização sem o recurso de modelo de reserva: tenta uma vez sem ele
      if (e instanceof Anthropic.BadRequestError && /fallback/i.test(e.message))
        final = await executar(false);
      else throw e;
    }
  } catch (e) {
    throw traduzirErro(e);
  }

  const uso = lerUso(final.usage);
  if (final.stop_reason === "refusal")
    throw new ErroPmo(
      "O modelo recusou o pedido por regra de segurança.",
      "Confira se os documentos são os da RFP. Se forem, tente de novo; se repetir, avise o suporte do app.",
      "recusa",
    );
  if (final.stop_reason === "max_tokens")
    throw new ErroPmo(
      "A resposta passou do limite de tamanho e veio cortada.",
      "Tente de novo. Se repetir, tire anexos que não tratam do objeto, para o PMO ter menos a cobrir.",
      "cortada",
    );
  const texto = final.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return {
    resposta: lerResposta(texto, p.schema),
    modelo: final.model,
    uso,
    custo: custoDoUso(final.model, uso),
    em: new Date().toISOString(),
  };
}
