// A capa de decisão da etapa na tela (decisão 0085): a mesma que vai no resultado da etapa, montada por código a partir
// do dossiê. O que é, o que decidir agora, os números-chave, os alertas, o que mudou e os quadros.
import { useMemo } from "react";
import type { Dossie } from "../../dossie/esquema";
import { escolherAlertas, MAXIMO_DE_DECISOES } from "../../exportacao/capa-de-decisao";
import { capaDaEtapa } from "../../exportacao/capas";
import { RotuloSecao } from "./basicos";

export function CapaDeDecisao({ dossie, etapa }: { dossie: Dossie; etapa: number }) {
  // a capa é só leitura do dossiê; se uma conta falhar, a tela segue sem ela
  const capa = useMemo(() => {
    try {
      return capaDaEtapa(dossie, etapa);
    } catch {
      return undefined;
    }
  }, [dossie, etapa]);
  if (!capa) return null;
  const alertas = escolherAlertas(capa.alertas);
  return (
    <section className="bloco capa-decisao" aria-label="Capa de decisão">
      <RotuloSecao>Capa de decisão</RotuloSecao>
      <p className="texto-apoio">{capa.oQueE}</p>
      <h3 className="capa-titulo">O que decidir agora</h3>
      {capa.decidir.length ? (
        <ol className="capa-decidir">
          {capa.decidir.slice(0, MAXIMO_DE_DECISOES).map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ol>
      ) : (
        <p className="texto-apoio">Nada a decidir agora pelo que o código conferiu.</p>
      )}
      {capa.numeros.length > 0 && (
        <dl className="capa-numeros">
          {capa.numeros.map((n) => (
            <div key={n.rotulo}>
              <dt>{n.rotulo}</dt>
              <dd>{n.valor}</dd>
            </div>
          ))}
        </dl>
      )}
      {alertas.map((a) => (
        <p key={a.texto} className={`capa-alerta capa-alerta-${a.nivel}`}>
          <strong>{a.nivel === "alto" ? "Alerta: " : "Atenção: "}</strong>
          {a.texto}
        </p>
      ))}
      <h3 className="capa-titulo">O que mudou desde a etapa anterior</h3>
      <ul className="capa-mudou">
        {capa.mudou.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
      {capa.quadros.map((q) => (
        <div key={q.titulo} className="capa-quadro">
          <h3 className="capa-titulo">{q.titulo}</h3>
          {(q.paragrafos ?? []).map((p) => (
            <p key={p} className="texto-apoio">
              {p}
            </p>
          ))}
          {q.tabela && (
            <div className="tabela-rolavel">
              <table className="tabela tabela--quebra">
                <thead>
                  <tr>
                    {q.tabela.colunas.map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {q.tabela.linhas.map((l, k) => (
                    <tr key={k}>
                      {l.map((c, j) => (
                        <td key={j}>{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
