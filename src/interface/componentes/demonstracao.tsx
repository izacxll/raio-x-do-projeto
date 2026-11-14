// Modo demonstração na tela (decisão 0027): o aviso fixo e o botão "Ver demonstração" das etapas com o PMO.
import { useState } from "react";
import {
  lerRfpDaDemonstracao,
  NOME_PROJETO_DEMONSTRACAO,
  TEXTO_DEMONSTRACAO,
} from "../../demonstracao/demonstracao";
import { prepararEtapasAnteriores } from "../../demonstracao/preparar";
import { useDossie } from "../../dossie/store";

/** Aviso sempre visível enquanto o dossiê for de demonstração. */
export function AvisoDemonstracao() {
  const demonstracao = useDossie((s) => s.dossie.demonstracao);
  const novoProjeto = useDossie((s) => s.novoProjeto);
  if (!demonstracao) return null;
  return (
    <div className="faixa-demonstracao" role="status" data-testid="aviso-demonstracao">
      <span>
        <b>{TEXTO_DEMONSTRACAO}.</b> As respostas do PMO foram gravadas para a concorrência pública da OEI; o
        código confere as citações e faz as contas de verdade.
      </span>
      <button
        className="botao botao--discreto"
        type="button"
        onClick={() => {
          if (window.confirm("Sair da demonstração? O projeto de demonstração será fechado.")) novoProjeto();
        }}
      >
        Sair da demonstração
      </button>
    </div>
  );
}

/** Botão das etapas 2, 3 e 4: abre a RFP pública da OEI com as respostas gravadas, sem chamar a API. */
export function BotaoDemonstracao({ etapa }: { etapa: 2 | 3 | 4 }) {
  const { dossie, alterado, iniciarDemonstracao } = useDossie();
  const [lendo, setLendo] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  async function iniciar() {
    if (
      alterado &&
      !window.confirm(
        "Há mudanças que não foram salvas no dossiê. Abrir a demonstração mesmo assim? O projeto atual será fechado.",
      )
    )
      return;
    setErro("");
    setLendo("Baixando a RFP da demonstração…");
    try {
      const rfp = await lerRfpDaDemonstracao((pagina, total) =>
        setLendo(`Lendo a RFP da demonstração: página ${pagina} de ${total}`),
      );
      iniciarDemonstracao(rfp, NOME_PROJETO_DEMONSTRACAO);
      await prepararEtapasAnteriores(etapa);
    } catch (e) {
      setErro(`Não foi possível abrir a demonstração: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLendo(null);
    }
  }

  if (dossie.demonstracao) return null;
  return (
    <div className="cartao cartao__corpo demonstracao" data-testid="demonstracao">
      <p className="texto-apoio">
        <b>Sem a chave?</b> Veja a etapa funcionando com as respostas do PMO gravadas para uma concorrência
        pública (OEI), sem chamar a IA. A leitura, a conferência das citações, as contas e as saídas são as de
        verdade.
      </p>
      <div className="acoes-exportar">
        <button
          className="botao"
          type="button"
          disabled={Boolean(lendo)}
          onClick={() => void iniciar()}
          data-testid="ver-demonstracao"
        >
          Ver demonstração
        </button>
        {lendo && (
          <span className="envio__obs" aria-live="polite">
            {lendo}
          </span>
        )}
      </div>
      {erro && (
        <p className="envio__obs" role="alert" style={{ color: "var(--vinho)" }}>
          {erro}
        </p>
      )}
    </div>
  );
}
