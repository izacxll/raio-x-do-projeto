// Segunda instância (decisão 0057): depois de cada resposta do PMO, uma chamada separada, com só a skill, os documentos
// e a resposta, devolve os achados. O GP vê antes de aprovar; a tela avisa enquanto a resposta não foi conferida.
import { useMemo, useRef, useState } from "react";
import type { DocumentoLido } from "../../dossie/esquema";
import { useDossie } from "../../dossie/store";
import type { ErroPmo } from "../../pmo/cliente";
import { estimarCusto, formatarDolar, formatarTokens } from "../../pmo/custo";
import { identidadeDoCaso } from "../../pmo/identidade-do-caso";
import { estimarTokens, textoDosDocumentos } from "../../pmo/montagem";
import { RespostaSegundaInstancia } from "../../pmo/schemas/segunda-instancia";
import {
  chaveDaSegundaInstancia,
  conferirSegundaInstancia,
  NOME_GRAVIDADE_SEGUNDA,
  NOME_TIPO_SEGUNDA,
  pedidoSegundaInstancia,
  proximaRodada,
  sistemaDaSegundaInstancia,
} from "../../pmo/segunda-instancia";
import { useChave } from "./conectar-claude";

export function SegundaInstancia({
  etapa,
  passo,
  resposta,
  respostaEm,
  documentos,
  modelo,
  pedidoDoPasso,
}: {
  etapa: number;
  passo: string;
  resposta: unknown;
  /** O "em" da resposta conferida: se mudar, a conferência anterior fica velha. */
  respostaEm: string;
  documentos: DocumentoLido[];
  modelo: string;
  /** O pedido do passo conferido, como foi ao PMO: o esqueleto e o que o passo exige (decisão 0059). */
  pedidoDoPasso: string;
}) {
  const { dossie, guardarSegundaInstancia } = useDossie();
  const chave = useChave();
  const id = chaveDaSegundaInstancia(etapa, passo);
  const guardada = dossie.segundaInstancia?.[id];
  const atual = guardada && guardada.deResposta === respostaEm ? guardada : undefined;
  const [rodando, setRodando] = useState(false);
  const [erro, setErro] = useState<ErroPmo | null>(null);
  const cancelar = useRef<AbortController | null>(null);
  const sistema = useMemo(() => sistemaDaSegundaInstancia(etapa), [etapa]);
  const textoDocs = useMemo(() => textoDosDocumentos(documentos), [documentos]);
  // a identidade do caso no topo do pedido (decisão 0066): os documentos do dossiê, não só os do passo
  const identidade = useMemo(
    () => identidadeDoCaso(dossie.documentos, dossie.projeto.nome),
    [dossie.documentos, dossie.projeto.nome],
  );
  const pedido = useMemo(
    () => pedidoSegundaInstancia(etapa, passo, resposta, pedidoDoPasso, identidade),
    [etapa, passo, resposta, pedidoDoPasso, identidade],
  );
  const est = estimarCusto(
    modelo,
    "segunda-instancia",
    estimarTokens(sistema) + estimarTokens(textoDocs),
    estimarTokens(pedido),
  );
  const resultado = useMemo(
    () => (atual ? conferirSegundaInstancia(atual.resposta, documentos) : undefined),
    [atual, documentos],
  );

  async function executar() {
    if (!chave) return;
    setErro(null);
    setRodando(true);
    const controle = new AbortController();
    cancelar.current = controle;
    try {
      const { chamarPmo } = await import("../../pmo/cliente");
      const r = await chamarPmo({
        chave,
        modelo,
        passo: "segunda-instancia",
        sistema,
        documentos: textoDocs,
        pedido,
        schema: RespostaSegundaInstancia,
        sinal: controle.signal,
      });
      guardarSegundaInstancia(id, {
        resposta: r.resposta,
        modelo: r.modelo,
        em: r.em,
        deResposta: respostaEm,
        rodada: proximaRodada(guardada, respostaEm),
      });
    } catch (e) {
      setErro(e as ErroPmo);
    } finally {
      setRodando(false);
      cancelar.current = null;
    }
  }

  return (
    <div className="cartao cartao__corpo bloco" data-testid={`segunda-instancia-${etapa}-${passo}`}>
      <h3 className="subtitulo-grupo">Segunda instância (conferência antes de aprovar)</h3>
      {!resultado && (
        <p className="aviso" role="status">
          Esta resposta ainda não foi conferida por uma segunda instância. Sugere-se conferir antes de aprovar
          e de seguir para a próxima etapa: uma chamada separada, com só a skill, os documentos e a resposta,
          aponta erros de fato, o que faltou, incoerências entre etapas e rótulos errados.
        </p>
      )}
      {est && (
        <p className="envio__obs">
          Estimativa antes de chamar: cerca de {formatarTokens(est.tokensEntrada)} tokens de entrada,{" "}
          {formatarDolar(est.semCache.min)} a {formatarDolar(est.semCache.max)}.
        </p>
      )}
      <div className="acoes-exportar">
        <button
          className="botao"
          type="button"
          data-testid={`conferir-segunda-${etapa}-${passo}`}
          disabled={!chave || rodando}
          onClick={() => void executar()}
        >
          {resultado ? "Conferir de novo" : "Conferir por uma segunda instância"}
        </button>
        {!chave && <span className="envio__obs">Conecte a chave para conferir.</span>}
        {rodando && (
          <>
            <span className="envio__obs" aria-live="polite">
              A segunda instância está conferindo…
            </span>
            <button className="botao botao--discreto" type="button" onClick={() => cancelar.current?.abort()}>
              Cancelar
            </button>
          </>
        )}
      </div>
      {erro && !rodando && (
        <div className="aviso aviso--erro" role="alert">
          <p>
            <b>{erro.message}</b> {erro.oQueFazer}
          </p>
        </div>
      )}
      {guardada && !atual && (
        <p className="envio__obs">A resposta mudou depois da última conferência: confira de novo.</p>
      )}
      {resultado && (
        <>
          <p className={`aviso${resultado.altas ? " aviso--erro" : ""}`} role="status">
            Rodada {atual?.rodada ?? 1}: {resultado.achados.length} achado(s), {resultado.altas} de gravidade
            alta. Todo achado é Sugestão: quem decide é o GP.
          </p>
          {resultado.achados.length > 0 && (
            <table className="tabela tabela--texto">
              <thead>
                <tr>
                  <th>Gravidade</th>
                  <th>Tipo</th>
                  <th>Onde</th>
                  <th>O que é</th>
                  <th>Sugestão</th>
                </tr>
              </thead>
              <tbody>
                {resultado.achados.map((a) => (
                  <tr key={a.id} data-gravidade={a.gravidade}>
                    <td>{NOME_GRAVIDADE_SEGUNDA[a.gravidade]}</td>
                    <td>{NOME_TIPO_SEGUNDA[a.tipo]}</td>
                    <td>{a.onde}</td>
                    <td>
                      {a.texto}
                      {a.evidencias.length > 0 && (
                        <span className="envio__obs">
                          {" "}
                          ({a.evidencias.map((f) => `${f.doc}, p. ${f.pagina}`).join("; ")}
                          {a.evidenciaConferida ? "" : "; evidência não conferida pelo código"})
                        </span>
                      )}
                    </td>
                    <td>{a.sugestao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {resultado.conferido.length > 0 && (
            <p className="envio__obs">Conferido e em ordem: {resultado.conferido.join("; ")}.</p>
          )}
        </>
      )}
    </div>
  );
}
