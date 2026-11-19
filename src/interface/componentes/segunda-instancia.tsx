// Segunda instância (decisão 0057): depois de cada resposta do PMO, uma chamada separada, com só a skill, os documentos
// e a resposta, devolve os achados. O GP vê antes de aprovar; a tela avisa enquanto a resposta não foi conferida.
import { useMemo, useRef, useState } from "react";
import type { DocumentoLido } from "../../dossie/esquema";
import { useDossie } from "../../dossie/store";
import type { ErroPmo } from "../../pmo/cliente";
import { MODELO_COMPARACAO, MODELOS, type IdModelo } from "../../config/modelo";
import { estimarCusto, formatarDolar, formatarTokens } from "../../pmo/custo";
import { identidadeDoCaso } from "../../pmo/identidade-do-caso";
import { estimarTokens, textoDosDocumentos } from "../../pmo/montagem";
import { RespostaSegundaInstancia } from "../../pmo/schemas/segunda-instancia";
import type { TapRevisado } from "../../pmo/tap-revisado";
import {
  chaveDaSegundaInstancia,
  conferenciaVelha,
  conferirSegundaInstancia,
  montarPedidoDaSegunda,
  NOME_GRAVIDADE_SEGUNDA,
  NOME_TIPO_SEGUNDA,
  sistemaDaSegundaInstancia,
} from "../../pmo/segunda-instancia";
import { useChave } from "./conectar-claude";
import { contar, plural } from "../../texto/plural";

export function SegundaInstancia({
  etapa,
  passo,
  resposta,
  respostaEm,
  documentos,
  modelo,
  pedidoDoPasso,
  tapRevisado,
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
  /** Só nas premissas: o TAP revisado pelo GP, montado na tela do TAP com os itens já conferidos (decisão 0068). */
  tapRevisado?: TapRevisado;
}) {
  const { dossie, guardarSegundaInstancia } = useDossie();
  const chave = useChave();
  const id = chaveDaSegundaInstancia(etapa, passo);
  const guardada = dossie.segundaInstancia?.[id];
  // a conferência guardada vale para esta resposta e para o mesmo TAP revisado
  const velha = conferenciaVelha(guardada, respostaEm, tapRevisado?.versao);
  const atual = velha ? undefined : guardada;
  const [rodando, setRodando] = useState(false);
  const [erro, setErro] = useState<ErroPmo | null>(null);
  const cancelar = useRef<AbortController | null>(null);
  const sistema = useMemo(() => sistemaDaSegundaInstancia(etapa), [etapa]);
  // rodada seguinte (decisão 0071): o GP pode pedir a resposta inteira de novo e escolher um modelo mais barato
  const [completa, setCompleta] = useState(false);
  const [modeloDaRodada, setModeloDaRodada] = useState<string>(modelo);
  // a identidade do caso no topo do pedido (decisão 0066): os documentos do dossiê, não só os do passo
  const identidade = useMemo(
    () => identidadeDoCaso(dossie.documentos, dossie.projeto.nome),
    [dossie.documentos, dossie.projeto.nome],
  );
  // o mesmo pedido do teste externo: completo na rodada 1; na seguinte, só os achados, o diff e as páginas citadas
  const montagem = useMemo(
    () =>
      montarPedidoDaSegunda({
        etapa,
        passo,
        resposta,
        respostaEm,
        pedidoDoPasso,
        documentos,
        identidade,
        tapRevisado,
        guardada,
        completa,
      }),
    [
      etapa,
      passo,
      resposta,
      respostaEm,
      pedidoDoPasso,
      documentos,
      identidade,
      tapRevisado,
      guardada,
      completa,
    ],
  );
  const pedido = montagem.pedido;
  const textoDocs = useMemo(() => textoDosDocumentos(montagem.documentos), [montagem.documentos]);
  const rodadaSeguinte = montagem.rodada > 1;
  const modeloDaChamada = rodadaSeguinte ? modeloDaRodada : modelo;
  // na rodada compacta, os documentos são só as páginas citadas: prefixo que não se repete, vai sem cache (0095)
  const cacheDocumentos = !montagem.compacta;
  const est = estimarCusto(
    modeloDaChamada,
    "segunda-instancia",
    estimarTokens(sistema) + (cacheDocumentos ? estimarTokens(textoDocs) : 0),
    estimarTokens(pedido) + (cacheDocumentos ? 0 : estimarTokens(textoDocs)),
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
        modelo: modeloDaChamada,
        passo: "segunda-instancia",
        sistema,
        documentos: textoDocs,
        cacheDocumentos,
        pedido,
        schema: RespostaSegundaInstancia,
        sinal: controle.signal,
      });
      guardarSegundaInstancia(id, {
        resposta: r.resposta,
        modelo: r.modelo,
        em: r.em,
        deResposta: respostaEm,
        ...(tapRevisado ? { deAnterior: tapRevisado.versao } : {}),
        rodada: montagem.rodada,
        // a resposta que esta conferência leu: a rodada seguinte manda só o que mudou desde ela (decisão 0071)
        conferiu: resposta,
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
      {rodadaSeguinte && (
        <div className="envio__obs" data-testid={`rodada-seguinte-${etapa}-${passo}`}>
          <p>
            Rodada {montagem.rodada}:{" "}
            {montagem.compacta
              ? `vão só os achados da rodada anterior, ${plural(montagem.itensQueMudaram ?? 0, "o", "os")} ${contar(montagem.itensQueMudaram ?? 0, "item", "itens")} que ${plural(montagem.itensQueMudaram ?? 0, "mudou", "mudaram")} e as páginas citadas.`
              : "vai a resposta inteira, com os achados da rodada anterior."}
          </p>
          <label>
            <input type="checkbox" checked={completa} onChange={(ev) => setCompleta(ev.target.checked)} />{" "}
            Conferir a resposta inteira de novo (pedido completo, mais caro)
          </label>{" "}
          <label>
            Modelo desta rodada (decisão do GP):{" "}
            <select value={modeloDaRodada} onChange={(ev) => setModeloDaRodada(ev.target.value)}>
              <option value={modelo}>{MODELOS[modelo as IdModelo]?.nome ?? modelo} (o mesmo da etapa)</option>
              {modelo !== MODELO_COMPARACAO && (
                <option value={MODELO_COMPARACAO}>{MODELOS[MODELO_COMPARACAO].nome} (mais barato)</option>
              )}
            </select>
          </label>
        </div>
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
      {velha === "resposta-mudou" && (
        <p className="envio__obs">A resposta mudou depois da última conferência: confira de novo.</p>
      )}
      {velha === "tap-mudou" && (
        <p className="envio__obs">
          O TAP revisado mudou depois da última conferência (item editado ou descartado, ou campo do GP):
          confira de novo.
        </p>
      )}
      {velha === "tap-ausente" && (
        <p className="envio__obs">O TAP não está mais no dossiê: refaça o TAP antes de conferir de novo.</p>
      )}
      {resultado && (
        <>
          <p className={`aviso${resultado.altas ? " aviso--erro" : ""}`} role="status">
            Rodada {atual?.rodada ?? 1}: {contar(resultado.achados.length, "achado", "achados")},{" "}
            {resultado.altas} de gravidade alta. Todo achado é Sugestão: quem decide é o GP.
          </p>
          {resultado.achados.length > 0 && resultado.achados.every((a) => a.gravidade === "baixa") && (
            <p className="envio__obs">
              Só achados de gravidade baixa: sugere-se corrigir e seguir, sem nova rodada (uma nova
              conferência continua possível, se o GP quiser).
            </p>
          )}
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
