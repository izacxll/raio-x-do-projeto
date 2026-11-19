// Um passo do PMO na tela (todas as etapas): custo antes, botão, progresso, cancelar, erro em português e a resposta.
import { useRef, useState, type ReactNode } from "react";
import type { z } from "zod";
import type { PassoPmo } from "../../config/modelo";
import type { UsoPmo } from "../../dossie/esquema";
import type { ErroPmo } from "../../pmo/cliente";
import { formatarDolar, formatarTokens, type EstimativaCusto } from "../../pmo/custo";
import { usoDaChamada } from "../../pmo/itens";
import { RotuloSecao } from "./basicos";

type PassoComPmo = Exclude<PassoPmo, "teste">;

export interface RespostaDoPasso<T> {
  resposta: T;
  modelo: string;
  em: string;
  uso?: UsoPmo;
}

export interface PedidoDoPasso<S extends z.ZodType> {
  etapa: 1 | 3 | 4 | 5;
  passo: PassoComPmo;
  schema: S;
  chave: string | null;
  modelo: string;
  sistema: string;
  documentos: string;
  pedido: string;
}

/** Chama o PMO com o estado da tela: rodando, recebidos, erro, cancelar. */
export function useChamadaPmo() {
  const [rodando, setRodando] = useState<{ passo: string; recebidos: number } | null>(null);
  const [erro, setErro] = useState<{ passo: string; erro: ErroPmo } | null>(null);
  const controle = useRef<AbortController | null>(null);

  async function chamar<S extends z.ZodType>(
    p: PedidoDoPasso<S>,
  ): Promise<RespostaDoPasso<z.infer<S>> | null> {
    setErro(null);
    try {
      if (!p.chave) return null;
      controle.current = new AbortController();
      setRodando({ passo: p.passo, recebidos: 0 });
      const { chamarPmo } = await import("../../pmo/cliente");
      const r = await chamarPmo({
        chave: p.chave,
        modelo: p.modelo,
        passo: p.passo,
        sistema: p.sistema,
        documentos: p.documentos,
        pedido: p.pedido,
        schema: p.schema,
        sinal: controle.current.signal,
        aoReceber: (recebidos) => setRodando({ passo: p.passo, recebidos }),
      });
      return { resposta: r.resposta, modelo: r.modelo, em: r.em, uso: usoDaChamada(p.passo, r) };
    } catch (e) {
      const erroPmo =
        e && typeof e === "object" && "oQueFazer" in e
          ? (e as ErroPmo)
          : ({
              message: "Não foi possível carregar a resposta.",
              oQueFazer: e instanceof Error ? e.message : String(e),
            } as ErroPmo);
      setErro({ passo: p.passo, erro: erroPmo });
      return null;
    } finally {
      setRodando(null);
      controle.current = null;
    }
  }

  return { rodando, erro, chamar, cancelar: () => controle.current?.abort() };
}

export function PassoPmoNaTela({
  passo,
  titulo,
  pedido,
  semPedido,
  feito,
  chave,
  estimativa,
  rodando,
  erro,
  aoPedir,
  aoCancelar,
  envio = "O texto dos PDFs vai para a API do Claude, pela sua chave, na organização da FGV.",
  rotuloBotao,
  testid,
  explicacao,
  children,
}: {
  passo: string;
  titulo: string;
  pedido: string | null;
  semPedido: string;
  feito?: { modelo: string; em: string };
  chave: string | null;
  estimativa?: EstimativaCusto;
  rodando: { passo: string; recebidos: number } | null;
  erro: { passo: string; erro: ErroPmo } | null;
  aoPedir: () => void;
  aoCancelar: () => void;
  envio?: string;
  /** Texto do botão no lugar de "Pedir ao PMO" (etapas 1 e 5: "Analisar a RFP", "Conferir o plano"). */
  rotuloBotao?: string;
  testid?: string;
  /** O que o passo faz, antes do custo. */
  explicacao?: string;
  children?: ReactNode;
}) {
  const ocupado = Boolean(rodando);
  return (
    <section className="bloco" data-passo={passo}>
      <RotuloSecao>PMO · {titulo}</RotuloSecao>
      <div className="cartao cartao__corpo">
        {!pedido ? (
          <p className="texto-apoio">{semPedido}</p>
        ) : (
          <>
            {explicacao && <p className="texto-apoio">{explicacao}</p>}

            {estimativa && (
              <p className="envio__obs" data-testid={`custo-${passo}`}>
                Estimativa antes de chamar: cerca de {formatarTokens(estimativa.tokensEntrada)} tokens de
                entrada e {formatarTokens(estimativa.saidaMin)} a {formatarTokens(estimativa.saidaMax)} de
                saída: {formatarDolar(estimativa.semCache.min)} a {formatarDolar(estimativa.semCache.max)} na
                primeira chamada; {formatarDolar(estimativa.comCache.min)} a{" "}
                {formatarDolar(estimativa.comCache.max)} se feita em até 1 hora depois da anterior (skill e
                documentos lidos do cache).
              </p>
            )}
            <p className="envio__obs">{envio}</p>
            <div className="acoes-exportar">
              <button
                className="botao botao--cheio"
                type="button"
                data-testid={testid ?? `pedir-${passo}`}
                disabled={!chave || ocupado}
                onClick={() => {
                  if (
                    feito &&
                    !window.confirm(
                      "Pedir de novo? A resposta atual será substituída e as revisões dela, perdidas.",
                    )
                  )
                    return;
                  aoPedir();
                }}
              >
                {rotuloBotao && !feito ? rotuloBotao : feito ? "Pedir de novo ao PMO" : "Pedir ao PMO"}
              </button>
              {!chave && <span className="envio__obs">Conecte a chave acima para pedir.</span>}
              {rodando?.passo === passo && (
                <>
                  <span className="envio__obs" aria-live="polite">
                    O PMO está escrevendo… {formatarTokens(rodando.recebidos)} caracteres recebidos. Pode
                    levar alguns minutos.
                  </span>
                  <button className="botao botao--discreto" type="button" onClick={aoCancelar}>
                    Cancelar
                  </button>
                </>
              )}
            </div>
            {erro?.passo === passo && !rodando && (
              <div className="aviso aviso--erro" role="alert">
                <p>
                  <b>{erro.erro.message}</b> {erro.erro.oQueFazer}
                </p>
              </div>
            )}
          </>
        )}
        {feito && (
          <p className="envio__obs">
            {`Resposta de ${feito.modelo} em ${new Date(feito.em).toLocaleString("pt-BR")}.`}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

const NOME_PASSO: Record<string, string> = {
  estrategia: "Estratégia e abordagens",
  conteudo: "Conteúdo técnico e SOW",
  eap: "EAP, estimativas e equipe",
  tap: "Os 12 elementos do TAP",
  premissas: "Registro de premissas inicial",
  adaptacao: "Adaptação, ciclo de vida e abordagem",
  escopo: "Escopo e requisitos",
  cronograma: "Atividades, recursos e cronograma",
  riscos: "Riscos, custos e premissas",
  planos: "Demais planos e documentos",
  execucao: "Medição e documentos de execução",
  leitura: "Leitura do PMO na conferência",
};

export function UsoNaTela({ uso, titulo }: { uso: UsoPmo[]; titulo: string }) {
  if (!uso.length) return null;
  return (
    <section className="bloco">
      <RotuloSecao>{titulo}</RotuloSecao>
      <div className="cartao cartao__corpo">
        <table className="tabela" data-testid="uso">
          <thead>
            <tr>
              <th>Passo</th>
              <th>Modelo</th>
              <th>Entrada</th>
              <th>Cache (escrita / leitura)</th>
              <th>Saída</th>
              <th>Valor estimado</th>
            </tr>
          </thead>
          <tbody>
            {uso.map((u, k) => (
              <tr key={k}>
                <td>{NOME_PASSO[u.passo] ?? u.passo}</td>
                <td>{u.modelo}</td>
                <td>{formatarTokens(u.entrada)}</td>
                <td>
                  {formatarTokens(u.escritaCache)} / {formatarTokens(u.leituraCache)}
                </td>
                <td>{formatarTokens(u.saida)}</td>
                <td>{formatarDolar(u.custoUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
