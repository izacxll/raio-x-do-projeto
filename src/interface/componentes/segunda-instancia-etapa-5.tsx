// Segunda instância leve da etapa 5 (decisão 0077): só quando o PMO deu ao menos um veredito "falso" ou
// "regra_errada". Confere esses vereditos contra a página citada (o trecho cobre o item inteiro?) e as premissas
// críticas que se aplicam, numa rodada, no modelo mais barato por padrão. Substitui, na etapa 5, a segunda instância
// genérica com o pedido inteiro.
import { useMemo, useRef, useState } from "react";
import { MODELO_COMPARACAO, MODELOS, type IdModelo } from "../../config/modelo";
import type { Conferencia, DocumentoLido } from "../../dossie/esquema";
import { PARTES_PGP, PREMISSAS_CRITICAS } from "../../dominio/skill";
import { conferirVereditos } from "../../etapas/5-conferencia/candidatos";
import type { ErroPmo } from "../../pmo/cliente";
import { estimarCusto, formatarDolar, formatarTokens } from "../../pmo/custo";
import { identidadeDoCaso } from "../../pmo/identidade-do-caso";
import { estimarTokens, textoDosDocumentos } from "../../pmo/montagem";
import { RespostaSegundaEtapa5 } from "../../pmo/schemas/segunda-etapa-5";
import { aplicarSegundaEtapa5, evidenciaConferida, montarSegundaEtapa5 } from "../../pmo/segunda-etapa-5";
import { EtiquetaRotulo } from "./basicos";
import { sistemaDaSegundaInstancia } from "../../pmo/segunda-instancia";
import type { Achado } from "../../regras/achado";
import { useDossie } from "../../dossie/store";
import { useChave } from "./conectar-claude";
import { contar, plural } from "../../texto/plural";

const NOME_REVISAO = {
  confirma: "confirma o veredito",
  derruba: "derruba o veredito",
  em_parte: "cobre só em parte",
  sem_base: "sem base para julgar (o veredito fica)",
};
const NOME_SITUACAO_PC = {
  tratada: "tratada",
  so_citada: "só citada",
  nao_localizada: "não localizada nas linhas enviadas — conferir no documento",
};

export function SegundaInstanciaEtapa5({
  conf,
  atualizar,
  documentos,
  achadosDoCodigo,
  condicionais,
}: {
  conf: Conferencia;
  atualizar: (m: Partial<Conferencia>) => void;
  documentos: DocumentoLido[];
  achadosDoCodigo: Achado[];
  condicionais: Map<string, Achado[]>;
}) {
  const chave = useChave();
  // a identidade do caso pelos documentos do dossiê, como no teste externo (paridade)
  const dossieDocs = useDossie((s) => s.dossie.documentos);
  const nomeProjeto = useDossie((s) => s.dossie.projeto.nome);
  const leitura = conf.leituraPmo;
  const [modelo, setModelo] = useState<string>(MODELO_COMPARACAO);
  const [rodando, setRodando] = useState(false);
  const [erro, setErro] = useState<ErroPmo | null>(null);
  const cancelar = useRef<AbortController | null>(null);
  const atual = leitura && conf.segundaLeve?.deLeitura === leitura.em ? conf.segundaLeve : undefined;
  const montagem = useMemo(() => {
    if (!leitura) return undefined;
    const vd = conferirVereditos(leitura.resposta, achadosDoCodigo, condicionais, conf.mapa, documentos);
    const m = montarSegundaEtapa5({
      leitura: leitura.resposta,
      candidatos: vd.candidatos,
      partes: PARTES_PGP,
      premissas: PREMISSAS_CRITICAS,
      premissasAplicaveis: conf.premissasAplicaveis,
      documentos,
      mapa: conf.mapa,
      identidade: identidadeDoCaso(dossieDocs, nomeProjeto),
    });
    if (!m.quantos) return undefined;
    return { ...m, vd, textoDocs: textoDosDocumentos(m.documentos), sistema: sistemaDaSegundaInstancia(5) };
  }, [
    leitura,
    achadosDoCodigo,
    condicionais,
    conf.mapa,
    conf.premissasAplicaveis,
    documentos,
    dossieDocs,
    nomeProjeto,
  ]);
  if (!leitura) return null;
  if (!montagem)
    return (
      <p className="envio__obs" data-testid="segunda-etapa-5-sem-vereditos">
        Segunda instância: o PMO não deu veredito &quot;falso&quot; nem &quot;regra errada&quot;; não há o que
        conferir nesta leitura (decisão 0077).
      </p>
    );
  const est = estimarCusto(
    modelo,
    "segunda-instancia",
    estimarTokens(montagem.sistema) + estimarTokens(montagem.textoDocs),
    estimarTokens(montagem.pedido),
  );

  async function executar() {
    if (!chave || !montagem || !leitura) return;
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
        sistema: montagem.sistema,
        documentos: montagem.textoDocs,
        pedido: montagem.pedido,
        schema: RespostaSegundaEtapa5,
        sinal: controle.signal,
      });
      atualizar({ segundaLeve: { resposta: r.resposta, modelo: r.modelo, em: r.em, deLeitura: leitura.em } });
    } catch (e) {
      setErro(e as ErroPmo);
    } finally {
      setRodando(false);
      cancelar.current = null;
    }
  }

  return (
    <div className="cartao cartao__corpo bloco" data-testid="segunda-instancia-etapa-5">
      <h3 className="subtitulo-grupo">Segunda instância (vereditos e premissas críticas)</h3>
      <p className="envio__obs">
        O PMO deu {contar(montagem.quantos, "veredito", "vereditos")} &quot;falso&quot; ou &quot;regra
        errada&quot;: cada um tira um achado do código do total. Uma chamada separada confere se o trecho
        citado cobre o item inteiro da ficha e se cada premissa crítica que se aplica está escrita nos três
        lugares. Vão só as páginas citadas.
      </p>
      {est && (
        <p className="envio__obs">
          Estimativa antes de chamar: cerca de {formatarTokens(est.tokensEntrada)} tokens de entrada,{" "}
          {formatarDolar(est.semCache.min)} a {formatarDolar(est.semCache.max)}.
        </p>
      )}
      <div className="acoes-exportar">
        <label>
          Modelo (decisão do GP):{" "}
          <select value={modelo} onChange={(ev) => setModelo(ev.target.value)}>
            {Object.entries(MODELOS).map(([id, m]) => (
              <option key={id} value={id}>
                {m.nome}
                {id === MODELO_COMPARACAO ? " (mais barato, padrão)" : ""}
              </option>
            ))}
          </select>
        </label>{" "}
        <button
          className="botao"
          type="button"
          data-testid="conferir-segunda-etapa-5"
          disabled={!chave || rodando}
          onClick={() => void executar()}
        >
          {atual ? "Conferir de novo" : "Conferir os vereditos"}
        </button>
        {!chave && <span className="envio__obs">Conecte a chave para conferir.</span>}
        {rodando && (
          <button className="botao botao--discreto" type="button" onClick={() => cancelar.current?.abort()}>
            Cancelar
          </button>
        )}
      </div>
      {erro && !rodando && (
        <div className="aviso aviso--erro" role="alert">
          <p>
            <b>{erro.message}</b> {erro.oQueFazer}
          </p>
        </div>
      )}
      {atual && (
        <>
          <p className="aviso" role="status">
            {(() => {
              const n =
                aplicarSegundaEtapa5(montagem.vd, atual.resposta, leitura.resposta).contam.length -
                montagem.vd.contam.length;
              return `${contar(n, "achado", "achados")} ${plural(n, "voltou", "voltaram")}`;
            })()}{" "}
            a contar no resultado. Todo achado é Sugestão: quem decide é o GP. (
            {MODELOS[atual.modelo as IdModelo]?.nome ?? atual.modelo})
          </p>
          <ul>
            {atual.resposta.vereditos.map((v) => (
              <li key={v.achado}>
                <EtiquetaRotulo rotulo="sugestao" /> <b>{NOME_REVISAO[v.revisao]}</b> · {v.achado}: {v.motivo}
                {v.parteQueFalta ? ` Falta: ${v.parteQueFalta}` : ""}
                {v.evidencias.some((e) => !evidenciaConferida(e, documentos))
                  ? " (citação não conferida)"
                  : ""}
              </li>
            ))}
            {atual.resposta.premissas.map((p) => (
              <li key={p.codigo}>
                <EtiquetaRotulo rotulo="sugestao" /> <b>{p.codigo}</b> · {NOME_SITUACAO_PC[p.situacao]}:{" "}
                {p.motivo}
                {p.falta ? ` Falta em: ${p.falta}` : ""}
                {p.evidencias.some((e) => !evidenciaConferida(e, documentos))
                  ? " (citação não conferida)"
                  : ""}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
