// Tela inicial: "Em que etapa do projeto você está?" (página "03 · O fluxo" da apresentação).
import { useState } from "react";
import { Link } from "react-router-dom";
import { ETAPAS } from "../../etapas/etapas";
import { IconeDocumento, LegendaRotulos, RotuloSecao, Titulo } from "../componentes/basicos";

export function TelaInicial() {
  const [selecionada, setSelecionada] = useState(0);
  const etapa = ETAPAS[selecionada] ?? ETAPAS[0]!;

  return (
    <main className="pagina">
      <RotuloSecao>Escolher a etapa</RotuloSecao>
      <Titulo>
        Em que etapa do projeto <em>você está?</em>
      </Titulo>

      <div className="etapas" role="tablist" aria-label="Etapas do projeto">
        {ETAPAS.map((e, i) => (
          <button
            key={e.numero}
            type="button"
            role="tab"
            id={`etapa-${e.numero}`}
            aria-selected={i === selecionada}
            aria-controls="detalhe-etapa"
            className={`cartao-etapa${e.numero === 5 ? " cartao-etapa--conferencia" : ""}`}
            onClick={() => setSelecionada(i)}
          >
            <span className="lb">Etapa {e.numero}</span>
            <b>{e.nome}</b>
            <span>{e.resumoEntrada}</span>
          </button>
        ))}
      </div>

      <div
        className="detalhe-etapa"
        id="detalhe-etapa"
        role="tabpanel"
        aria-labelledby={`etapa-${etapa.numero}`}
      >
        <section className="cartao coluna">
          <span className="lb">Entra</span>
          {etapa.documentos.map((d) => (
            <div className="doc-entrada" key={d.papel}>
              <IconeDocumento />
              <span>
                {d.nome}
                {!d.obrigatorio && " (opcional)"}
              </span>
            </div>
          ))}
        </section>
        <section className="cartao coluna">
          <span className="lb">A ferramenta sugere</span>
          <ul>
            {etapa.ferramentaFaz.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="envio__obs">
            {etapa.usaPmo
              ? `Usa o PMO (Claude), com a chave do GP. Chega na fase ${etapa.fase}; a leitura dos PDFs já funciona.`
              : `Só código, sem chave e sem enviar nada para fora do navegador. As regras chegam na fase ${etapa.fase}.`}
          </p>
        </section>
        <section className="cartao coluna">
          <span className="lb">Sai, para editar e baixar</span>
          {etapa.saidas.map((s) => (
            <div className="saida" key={s.nome}>
              <b>{s.nome}</b>
              <span>
                {s.formatos.map((f) => (
                  <i className="etiqueta etiqueta--formato" key={f}>
                    {f}
                  </i>
                ))}
              </span>
            </div>
          ))}
          <Link
            className="botao botao--cheio"
            to={`/etapa/${etapa.numero}`}
            style={{ alignSelf: "flex-start" }}
          >
            Abrir a etapa {etapa.numero}
          </Link>
        </section>
      </div>

      <LegendaRotulos />
    </main>
  );
}
