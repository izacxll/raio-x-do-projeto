// Tela de uma etapa, no fluxo comum da seção 5.0: documentos → leitura → resultado → revisão → exportar → salvar.
// Na F0, o resultado é o mapa da leitura (o que o código leu de cada página). As regras e o PMO chegam nas fases
// seguintes, cada etapa na sua.
import { useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import type { DocumentoLido } from "../../dossie/esquema";
import { documentosDoPapel, useDossie } from "../../dossie/store";
import { buscarEtapa, NOME_PAPEL, type DocumentoPedido, type Etapa } from "../../etapas/etapas";
import { exportar, type FormatoExportacao } from "../../exportacao/exportar";
import { montarRelatorioLeitura, NOME_ORIGEM } from "../../exportacao/relatorio-leitura";
import { resumirLeitura, type Progresso } from "../../leitura/ler-documento";
import { EtiquetaRotulo, LegendaRotulos, RotuloSecao, Titulo } from "../componentes/basicos";

const PASSOS = [
  "Escolher a etapa",
  "Enviar os documentos",
  "Leitura",
  "Resultado",
  "Revisão do GP",
  "Exportar",
  "Salvar o dossiê",
];

function Trilho({ etapa }: { etapa: Etapa }) {
  return (
    <aside className="trilho" aria-label={`Etapa ${etapa.numero}: ${etapa.nome}`}>
      <Link to="/" className="trilho__voltar">
        ‹ Etapas
      </Link>
      <div className="trilho__numero">{String(etapa.numero).padStart(2, "0")}</div>
      <div className="trilho__total">/ 05</div>
      <div className="trilho__barra" />
      <div className="trilho__nome">{etapa.nome}</div>
    </aside>
  );
}

function PassosFluxo({ lidos }: { lidos: boolean }) {
  const estado = (i: number) =>
    i === 0 || (lidos && i <= 2) ? "feito" : (lidos ? i === 3 : i === 1) ? "atual" : "";
  return (
    <ol className="passos" aria-label="Passos da etapa">
      {PASSOS.map((p, i) => (
        <li key={p} data-estado={estado(i)}>
          {p}
        </li>
      ))}
    </ol>
  );
}

function AvisoEnvio({ etapa }: { etapa: Etapa }) {
  if (!etapa.usaPmo) {
    return (
      <div className="aviso">
        <p>
          <b>Só código.</b> Os PDFs são lidos aqui no navegador; nada é enviado para fora. As regras desta
          etapa chegam na fase {etapa.fase}.
        </p>
      </div>
    );
  }
  return (
    <div className="aviso aviso--pmo">
      <p>
        <b>Etapa com o PMO.</b> Quando estiver pronta (fase {etapa.fase}), o conteúdo dos PDFs desta etapa
        será enviado à API do Claude, pela chave do GP na organização da FGV. Por enquanto, só a leitura
        funciona, e ela acontece no navegador, sem enviar nada.
      </p>
    </div>
  );
}

interface EstadoLeitura {
  arquivo: string;
  progresso: Progresso | null;
}

function EnvioDocumento({ pedido }: { pedido: DocumentoPedido }) {
  const { dossie, guardarDocumento, removerDocumento } = useDossie();
  const [lendo, setLendo] = useState<EstadoLeitura | null>(null);
  const [erro, setErro] = useState("");
  const cancelar = useRef<AbortController | null>(null);
  const lidos = documentosDoPapel(dossie, pedido.papel);

  async function ler(arquivos: File[]) {
    if (!arquivos.length) return;
    setErro("");
    const { lerPdfNoNavegador } = await import("../../leitura/navegador");
    for (const arquivo of arquivos) {
      if (!/\.pdf$/i.test(arquivo.name) && arquivo.type !== "application/pdf") {
        setErro(`${arquivo.name}: só PDF é aceito.`);
        continue;
      }
      const controle = new AbortController();
      cancelar.current = controle;
      setLendo({ arquivo: arquivo.name, progresso: null });
      try {
        const r = await lerPdfNoNavegador(arquivo, {
          sinal: controle.signal,
          aoProgredir: (progresso) => setLendo({ arquivo: arquivo.name, progresso }),
        });
        const documento: DocumentoLido = {
          id: crypto.randomUUID(),
          papel: pedido.papel,
          nomeArquivo: arquivo.name,
          tamanhoBytes: arquivo.size,
          totalPaginas: r.totalPaginas,
          lidoEm: new Date().toISOString(),
          paginas: r.paginas,
        };
        guardarDocumento(documento, Boolean(pedido.varios));
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError")
          setErro(`Leitura de ${arquivo.name} cancelada.`);
        else
          setErro(
            `Não foi possível ler ${arquivo.name}: ${e instanceof Error ? e.message : String(e)}. ` +
              "Se o PDF tiver senha, salve uma cópia sem senha e tente de novo.",
          );
      } finally {
        setLendo(null);
        cancelar.current = null;
      }
    }
  }

  const p = lendo?.progresso;
  const pct = p ? Math.round((p.pagina / p.total) * 100) : 0;

  return (
    <div className="cartao envio">
      <div className="envio__cabeca">
        <b>{pedido.nome}</b>
        <span className={`envio__exigencia${pedido.obrigatorio ? "" : " envio__exigencia--opcional"}`}>
          {pedido.obrigatorio ? "Obrigatório" : "Opcional"}
        </span>
      </div>
      {pedido.observacao && <p className="envio__obs">{pedido.observacao}</p>}

      {lidos.map((d) => {
        const r = resumirLeitura(d.paginas);
        return (
          <div key={d.id} className="envio__arquivo">
            <span title={d.nomeArquivo}>
              {d.nomeArquivo} · {d.totalPaginas} p.
              {r.naoVerificaveis.length ? ` · ${r.naoVerificaveis.length} não verificáveis` : ""}
            </span>
            <button className="botao botao--discreto" type="button" onClick={() => removerDocumento(d.id)}>
              Remover
            </button>
          </div>
        );
      })}

      {lendo ? (
        <div aria-live="polite">
          <p className="envio__obs">
            Lendo {lendo.arquivo}
            {p
              ? `: página ${p.pagina} de ${p.total}${p.fase === "ocr" ? " (OCR, pode levar alguns segundos)" : ""}`
              : "…"}
          </p>
          <div
            className="progresso"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <i style={{ width: `${pct}%` }} />
          </div>
          <button
            className="botao botao--discreto"
            type="button"
            style={{ marginTop: 8 }}
            onClick={() => cancelar.current?.abort()}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <label className="botao" style={{ alignSelf: "flex-start" }}>
          {lidos.length && !pedido.varios
            ? "Substituir PDF"
            : pedido.varios
              ? "Adicionar PDFs"
              : "Escolher PDF"}
          <input
            type="file"
            accept="application/pdf,.pdf"
            multiple={Boolean(pedido.varios)}
            hidden
            data-testid={`enviar-${pedido.papel}`}
            onChange={(e) => {
              // copia a lista antes de limpar o campo: limpar o campo esvazia a FileList
              const escolhidos = Array.from(e.target.files ?? []);
              e.target.value = "";
              void ler(escolhidos);
            }}
          />
        </label>
      )}
      {erro && (
        <p className="envio__obs" role="alert" style={{ color: "var(--vinho)" }}>
          {erro}
        </p>
      )}
    </div>
  );
}

function MapaLeitura({ documento }: { documento: DocumentoLido }) {
  const r = resumirLeitura(documento.paginas);
  return (
    <div className="cartao cartao--borda bloco">
      <div className="cartao__corpo">
        <span className="lb">{NOME_PAPEL[documento.papel]}</span>
        <h3 style={{ margin: "4px 0 8px", color: "var(--navy950)" }}>{documento.nomeArquivo}</h3>
        <div className="resumo-leitura" style={{ marginBottom: 12 }}>
          <span>{documento.totalPaginas} páginas:</span>
          <span>{r.texto} com texto do PDF</span>·<span>{r.ocr} por OCR</span>·
          <span>{r.naoVerificaveis.length} não verificáveis</span>
          {r.comImagem.length > 0 && (
            <>
              ·<span>{r.comImagem.length} com figura ou tabela em imagem</span>
            </>
          )}
        </div>
        {r.naoVerificaveis.length > 0 && (
          <div className="aviso aviso--pmo">
            <p>
              <b>Páginas não verificáveis: {r.naoVerificaveis.join(", ")}.</b> O código não conseguiu ler o
              texto delas. O que estiver nessas páginas não é tratado como ausente: conferir no documento.
            </p>
          </div>
        )}
        <div className="mapa">
          <table className="tabela">
            <thead>
              <tr>
                <th>Página</th>
                <th>Como foi lida</th>
                <th>Caracteres</th>
                <th>Texto lido pelo código</th>
              </tr>
            </thead>
            <tbody>
              {documento.paginas.map((p) => (
                <tr key={p.numero} data-origem={p.origem}>
                  <td>{p.numero}</td>
                  <td>
                    <span className={`origem origem--${p.origem}`}>{NOME_ORIGEM[p.origem]}</span>
                    {p.origem === "ocr" && <div>confiança {p.confiancaOcr}%</div>}
                    {p.temImagem && p.origem === "texto" && <div>tem imagem</div>}
                  </td>
                  <td>{p.caracteres}</td>
                  <td>
                    {p.motivo && <div>{p.motivo}. Conferir no documento.</div>}
                    {p.texto.trim() && (
                      <details>
                        <summary>
                          <EtiquetaRotulo rotulo="documento" pagina={p.numero} /> ver o texto
                        </summary>
                        <pre className="texto-pagina">{p.texto}</pre>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Exportar({ documentos }: { documentos: DocumentoLido[] }) {
  const dossie = useDossie((s) => s.dossie);
  const [mensagem, setMensagem] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function baixar(formato: FormatoExportacao) {
    setOcupado(true);
    setMensagem("");
    try {
      const doc = montarRelatorioLeitura({ ...dossie, documentos });
      const nome = await exportar(doc, formato, "relatorio-de-leitura");
      setMensagem(`Arquivo gerado: ${nome}`);
    } catch (e) {
      setMensagem(`Não foi possível gerar o arquivo: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="cartao cartao__corpo">
      <p className="texto-apoio">
        <b>Relatório de leitura</b>: o que o código leu de cada PDF desta etapa, página a página. Sai com o
        cabeçalho de minuta enquanto houver item pendente de revisão.
      </p>
      <div className="acoes-exportar">
        {(["docx", "pdf", "xlsx"] as const).map((f) => (
          <button
            key={f}
            className="botao"
            type="button"
            disabled={ocupado || !documentos.length}
            onClick={() => void baixar(f)}
          >
            Baixar {f.toUpperCase()}
          </button>
        ))}
        {mensagem && (
          <span aria-live="polite" className="envio__obs">
            {mensagem}
          </span>
        )}
      </div>
    </div>
  );
}

export function TelaEtapa() {
  const { numero } = useParams();
  const dossie = useDossie((s) => s.dossie);
  const etapa = buscarEtapa(Number(numero));
  if (!etapa) return <Navigate to="/" replace />;

  const papeis = new Set(etapa.documentos.map((d) => d.papel));
  const documentos = dossie.documentos.filter((d) => papeis.has(d.papel));
  const obrigatoriosLidos = etapa.documentos
    .filter((d) => d.obrigatorio)
    .every((d) => documentosDoPapel(dossie, d.papel).length > 0);

  return (
    <div
      className="etapa"
      style={{ ["--cor-secao" as string]: etapa.numero === 5 ? "var(--laranja)" : "var(--blue)" }}
    >
      <Trilho etapa={etapa} />
      <main className="pagina" style={{ width: "100%" }}>
        <RotuloSecao>
          Etapa {etapa.numero} · {etapa.usaPmo ? "com o PMO" : "só código"}
        </RotuloSecao>
        <Titulo>{etapa.nome}</Titulo>
        <PassosFluxo lidos={obrigatoriosLidos} />
        <AvisoEnvio etapa={etapa} />

        <section className="bloco">
          <RotuloSecao>Documentos</RotuloSecao>
          <p className="texto-apoio">
            Envie os PDFs ou abra um dossiê salvo (no alto da página). Páginas em imagem passam pelo OCR; o
            que não puder ser lido é avisado, com o número da página.
          </p>
          <div className="envios">
            {etapa.documentos.map((d) => (
              <EnvioDocumento key={d.papel} pedido={d} />
            ))}
          </div>
        </section>

        <section className="bloco">
          <RotuloSecao>Resultado da leitura</RotuloSecao>
          {documentos.length ? (
            documentos.map((d) => <MapaLeitura key={d.id} documento={d} />)
          ) : (
            <p className="texto-apoio">Nenhum documento lido ainda.</p>
          )}
        </section>

        <section className="bloco">
          <RotuloSecao>Exportar</RotuloSecao>
          <Exportar documentos={documentos} />
        </section>

        <LegendaRotulos />
      </main>
    </div>
  );
}
