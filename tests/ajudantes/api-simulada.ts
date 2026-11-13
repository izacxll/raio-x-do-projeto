// API do Claude simulada, para testar sem chave: respostas no formato de streaming (SSE) da Messages API.
// Usada pelos testes de unidade (fetch trocado) e pelo teste de fumaça (rota do Playwright).

export interface RespostaSimulada {
  texto: string;
  modelo?: string;
  stopReason?: "end_turn" | "max_tokens" | "refusal";
  uso?: { entrada: number; saida: number; escritaCache?: number; leituraCache?: number };
}

export function corpoSse(r: RespostaSimulada): string {
  const uso = r.uso ?? { entrada: 1000, saida: 500 };
  const eventos: [string, unknown][] = [
    [
      "message_start",
      {
        type: "message_start",
        message: {
          id: "msg_simulada",
          type: "message",
          role: "assistant",
          model: r.modelo ?? "claude-opus-5-5",
          content: [],
          stop_reason: null,
          stop_sequence: null,
          usage: {
            input_tokens: uso.entrada,
            output_tokens: 1,
            cache_creation_input_tokens: uso.escritaCache ?? 0,
            cache_read_input_tokens: uso.leituraCache ?? 0,
          },
        },
      },
    ],
    [
      "content_block_start",
      { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } },
    ],
  ];
  // o texto chega em pedaços, como na API
  for (let i = 0; i < r.texto.length; i += 2000)
    eventos.push([
      "content_block_delta",
      {
        type: "content_block_delta",
        index: 0,
        delta: { type: "text_delta", text: r.texto.slice(i, i + 2000) },
      },
    ]);
  eventos.push(
    ["content_block_stop", { type: "content_block_stop", index: 0 }],
    [
      "message_delta",
      {
        type: "message_delta",
        delta: { stop_reason: r.stopReason ?? "end_turn", stop_sequence: null },
        usage: { output_tokens: uso.saida },
      },
    ],
    ["message_stop", { type: "message_stop" }],
  );
  return eventos.map(([e, d]) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`).join("");
}

/** Corpo JSON de uma resposta sem streaming (o "Testar" da chave). */
export function corpoJson(texto: string, modelo = "claude-opus-5-5"): string {
  return JSON.stringify({
    id: "msg_simulada",
    type: "message",
    role: "assistant",
    model: modelo,
    content: [{ type: "text", text: texto }],
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: { input_tokens: 12, output_tokens: 2, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
  });
}

export function corpoErro(tipo: string, mensagem: string): string {
  return JSON.stringify({ type: "error", error: { type: tipo, message: mensagem } });
}

export interface PedidoRegistrado {
  url: string;
  headers: Record<string, string>;
  corpo: Record<string, unknown>;
}

/**
 * fetch falso: cada chamada recebe a próxima resposta da fila. Registra os pedidos (para conferir cache, schema,
 * cabeçalhos e que a chave não vai para outro lugar).
 */
export function fetchSimulado(fila: (RespostaSimulada | { status: number; corpo: string })[]) {
  const pedidos: PedidoRegistrado[] = [];
  const f = async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const headers: Record<string, string> = {};
    new Headers(init?.headers).forEach((v, k) => (headers[k] = v));
    const corpo = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};
    pedidos.push({ url: String(url), headers, corpo });
    const proxima = fila.shift();
    if (!proxima) throw new Error("fila de respostas simuladas vazia");
    if ("status" in proxima)
      return new Response(proxima.corpo, {
        status: proxima.status,
        headers: { "content-type": "application/json" },
      });
    if (corpo.stream)
      return new Response(corpoSse(proxima), {
        status: 200,
        headers: { "content-type": "text/event-stream" },
      });
    return new Response(corpoJson(proxima.texto, proxima.modelo), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  return { fetch: f as typeof fetch, pedidos };
}
