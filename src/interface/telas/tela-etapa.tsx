// Tela de uma etapa, no fluxo comum da seção 5.0: documentos → leitura → resultado → revisão → exportar → salvar.
// A leitura aparece só como uma linha por arquivo (páginas lidas), com aviso quando alguma página falha ou quando o
// arquivo parece ser de outra caixa. O resultado de cada etapa vem das regras e do PMO.
import { tapDoDossieComoDocumento } from "../../etapas/4-pgp/entrada";
import { useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import type { DocumentoLido } from "../../dossie/esquema";
import { documentosDoPapel, useDossie } from "../../dossie/store";
import {
  buscarEtapa,
  NOME_PAPEL,
  type DocumentoPedido,
  type Etapa,
  type PapelDocumento,
} from "../../etapas/etapas";
import { resumirLeitura, type Progresso } from "../../leitura/ler-documento";
import { caixaParece } from "../../leitura/tipo-documento";
import { LegendaRotulos, RotuloSecao, Titulo } from "../componentes/basicos";
import { AnaliseDaRfp } from "./analise-rfp";
import { ConferenciaPgp } from "./conferencia";
import { PropostaDoFornecedor } from "./proposta";
import { TermoDeAbertura } from "./tap";
import { PlanoDeGerenciamento } from "./pgp";

const PASSOS = [
  "Escolher a etapa",
  "Enviar os documentos",
  "Leitura",
  "Resultado",
  "Revisão do GP",
  "Exportar os relatórios",
  "Salvar para continuar depois",
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
  if (etapa.usaPmo) {
    return (
      <div className="aviso aviso--pmo">
        <p>
          <b>Etapa com o PMO (inteligência artificial).</b> A leitura dos PDFs e as contas acontecem aqui no
          navegador. Quando você pede um passo ao PMO, o texto dos PDFs{" "}
          {etapa.numero === 5
            ? "do plano, do TAP e da RFP"
            : etapa.numero === 4
              ? "da RFP, do TAP e da proposta"
              : etapa.numero === 3
                ? "da RFP e da proposta"
                : "da RFP"}{" "}
          é enviado à API do Claude, pela sua chave, na organização da FGV. Nada é enviado sem o seu clique, e
          o custo aparece antes.
          {" Sem a conexão com o Claude, nada é analisado: conecte a chave."}
        </p>
      </div>
    );
  }
  return (
    <div className="aviso aviso--pmo">
      <p>
        <b>Etapa com o PMO (inteligência artificial).</b> Quando a análise estiver pronta, o conteúdo dos PDFs
        desta etapa será enviado à API do Claude, pela chave do GP na organização da FGV. Em construção: a
        análise chega na próxima versão. Por enquanto, só a leitura funciona, e ela acontece no navegador, sem
        enviar nada.
      </p>
    </div>
  );
}

interface EstadoLeitura {
  arquivo: string;
  progresso: Progresso | null;
}

/** Aviso quando o arquivo parece ser de outra caixa (proposta na do PGP, termo de referência na do TAP). */
function AvisoDeCaixa({ papel, documento }: { papel: PapelDocumento; documento: DocumentoLido }) {
  const aviso = useMemo(() => caixaParece(papel, documento.paginas), [papel, documento.paginas]);
  if (!aviso) return null;
  return (
    <p className="envio__obs envio__obs--aviso" role="status" data-testid={`aviso-caixa-${papel}`}>
      Este arquivo parece ser <b>{aviso.comoFrase}</b> (p. {aviso.pagina}: "{aviso.linha}"). A caixa costuma
      ser "{NOME_PAPEL[aviso.caixaSugerida]}". Se está certo assim, siga: quem decide é o GP.
    </p>
  );
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
          <div key={d.id}>
            <div className="envio__arquivo" data-testid={`lido-${pedido.papel}`}>
              <span title={d.nomeArquivo}>{d.nomeArquivo}</span>
              <span className="envio__paginas">
                {d.totalPaginas} {d.totalPaginas === 1 ? "página lida" : "páginas lidas"}
              </span>
              <button className="botao botao--discreto" type="button" onClick={() => removerDocumento(d.id)}>
                Remover
              </button>
            </div>
            {r.naoVerificaveis.length > 0 && (
              <p className="envio__obs envio__obs--aviso" role="status">
                {r.naoVerificaveis.length === 1 ? "A página" : "As páginas"} {r.naoVerificaveis.join(", ")}{" "}
                {r.naoVerificaveis.length === 1 ? "não pôde ser lida" : "não puderam ser lidas"}: o que
                estiver nelas não é tratado como ausente. Conferir no documento.
              </p>
            )}
            <AvisoDeCaixa papel={pedido.papel} documento={d} />
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

export function TelaEtapa() {
  const { numero } = useParams();
  const dossie = useDossie((s) => s.dossie);
  const etapa = buscarEtapa(Number(numero));
  if (!etapa) return <Navigate to="/" replace />;

  const primeiro = (papel: string) => dossie.documentos.find((d) => d.papel === papel);
  const pgp = primeiro("pgp");
  // sem TAP em PDF, a etapa 5 confere contra o TAP da etapa 3 no dossiê (como a etapa 4)
  const tap = primeiro("tap") ?? (etapa.numero === 5 ? tapDoDossieComoDocumento(dossie) : undefined);
  const rfp = primeiro("rfp");
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
          Etapa {etapa.numero} · {etapa.usaPmo ? "com o PMO" : "sem IA"}
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

        {etapa.numero === 1 &&
          (rfp ? (
            <AnaliseDaRfp todos={dossie.documentos} />
          ) : (
            <section className="bloco">
              <RotuloSecao>Análise da RFP</RotuloSecao>
              <p className="texto-apoio">Envie a RFP para analisar.</p>
            </section>
          ))}

        {etapa.numero === 2 &&
          (rfp ? (
            <PropostaDoFornecedor todos={dossie.documentos} />
          ) : (
            <section className="bloco">
              <RotuloSecao>Proposta</RotuloSecao>
              <p className="texto-apoio">
                Envie a RFP (ou abra o dossiê da etapa 1) para começar a proposta.
              </p>
            </section>
          ))}

        {etapa.numero === 3 &&
          (rfp ? (
            <TermoDeAbertura />
          ) : (
            <section className="bloco">
              <RotuloSecao>Termo de abertura</RotuloSecao>
              <p className="texto-apoio">
                Envie a RFP e a proposta final (ou abra o dossiê das etapas 1 e 2) para começar o TAP.
              </p>
            </section>
          ))}

        {etapa.numero === 4 &&
          (rfp ? (
            <PlanoDeGerenciamento />
          ) : (
            <section className="bloco">
              <RotuloSecao>Plano de gerenciamento</RotuloSecao>
              <p className="texto-apoio">
                Envie a RFP e o TAP aprovado (ou abra o dossiê das etapas anteriores) para começar o plano.
              </p>
            </section>
          ))}

        {etapa.numero === 5 &&
          (pgp ? (
            <ConferenciaPgp pgp={pgp} tap={tap} rfp={rfp} />
          ) : (
            <section className="bloco">
              <RotuloSecao>Conferência</RotuloSecao>
              <p className="texto-apoio">Envie o PGP para conferir.</p>
            </section>
          ))}

        <LegendaRotulos />
      </main>
    </div>
  );
}
