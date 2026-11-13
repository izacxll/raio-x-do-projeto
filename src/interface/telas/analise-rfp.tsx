// Etapa 1 na tela: a análise da RFP organizada como o documento final, cada item com o rótulo, a página e o
// trecho, e a revisão do GP (aceitar, editar, descartar). A decisão de participar é só do GP.
import { useMemo, useState } from "react";
import type { AnaliseRfpDossie, DocumentoLido, EstadoItem } from "../../dossie/esquema";
import { useDossie } from "../../dossie/store";
import { analisarRfp, NOME_SECAO, ORDEM_SECOES, type AnaliseRfp } from "../../etapas/1-rfp/analisar-rfp";
import {
  analiseInicial,
  contarPendentes,
  ehRevisavel,
  estadoDoItem,
  incluirRequisito,
  itensFinais,
} from "../../etapas/1-rfp/revisao";
import { exportar, type FormatoExportacao } from "../../exportacao/exportar";
import {
  montarAnaliseRfp,
  montarChecklistHabilitacao,
  montarPerguntas,
  montarRequisitosEPrazos,
} from "../../exportacao/relatorio-rfp";
import type { ItemAnalise, SecaoAnalise } from "../../extracao/rfp/item";
import { EtiquetaRotulo, NOME_ESTADO, RotuloSecao } from "../componentes/basicos";

const INTRODUCAO: Partial<Record<SecaoAnalise, string>> = {
  atencao: "Resumo do que pesa na decisão de participar. É insumo, nunca a decisão.",
  identificacao:
    "Como o documento se identifica. O que o documento cita prevalece; a ferramenta não dá parecer jurídico.",
  mapa: "Seções e anexos com a página de cada um, para navegar no documento.",
  requisitos:
    "Cada exigência ganha um número (R01, R02…) que acompanha o projeto até a conferência do plano. Corrija e complete a lista: ela é a base das etapas seguintes. Número de requisito descartado não é reaproveitado.",
  prazos:
    "Datas do certame e prazos da execução, com a forma de contagem do documento. As contas de data são do código: confira feriados.",
  habilitacao:
    "Documentos de habilitação que o código localizou. O que não aparece aqui pode estar no documento com outra redação.",
  brechas:
    "Brechas do texto (contraditório, em aberto, transfere responsabilidade) e trechos vagos, cada um com uma pergunta de esclarecimento sugerida. Quais perguntas enviar é decisão do GP.",
};

const NOME_SITUACAO: Record<ItemAnalise["situacao"], string> = {
  localizado: "",
  "nao-localizado": "não localizado pelo código",
  "nao-verificavel": "não verificável",
  calculado: "calculado pelo código",
};

interface Props {
  /** Todos os documentos do dossiê: a análise usa a RFP e os anexos. */
  todos: DocumentoLido[];
}

export function AnaliseDaRfp({ todos }: Props) {
  const { dossie, guardarAnaliseRfp } = useDossie();
  // a análise leva até alguns décimos de segundo: só refaz quando os documentos mudam
  const analise = useMemo(() => analisarRfp(todos), [todos]);
  const salva = dossie.analiseRfp;

  if (!salva) {
    return (
      <section className="bloco">
        <RotuloSecao>Análise da RFP</RotuloSecao>
        <div className="cartao cartao__corpo">
          <p className="texto-apoio">
            A análise roda no navegador, só com código, e nada é enviado para fora. Ela fixa os números dos
            requisitos (R01, R02…), que seguem até a conferência do plano.
          </p>
          <button
            className="botao botao--cheio"
            type="button"
            data-testid="analisar-rfp"
            onClick={() => guardarAnaliseRfp(analiseInicial(analise))}
          >
            Analisar a RFP
          </button>
        </div>
      </section>
    );
  }
  return <Analise analise={analise} salva={salva} atualizar={guardarAnaliseRfp} />;
}

function Analise({
  analise,
  salva,
  atualizar,
}: {
  analise: AnaliseRfp;
  salva: AnaliseRfpDossie;
  atualizar: (a: AnaliseRfpDossie) => void;
}) {
  const itens = itensFinais(analise, salva);
  const pendentes = contarPendentes(itens, salva.revisoes);
  const revisaveis = itens.filter(ehRevisavel).length;
  const mudarEstado = (ids: string[], estado: EstadoItem, textoEditado?: string) => {
    const revisoes = { ...salva.revisoes };
    for (const id of ids) revisoes[id] = { estado, textoEditado: textoEditado ?? revisoes[id]?.textoEditado };
    atualizar({ ...salva, revisoes });
  };

  return (
    <>
      <section className="bloco">
        <RotuloSecao>Análise da RFP</RotuloSecao>
        <div className="cartao cartao__corpo">
          <p className="resumo-leitura" aria-live="polite">
            <span>{revisaveis} itens para revisar</span>·<span>{pendentes} pendentes</span>
            {pendentes > 0 ? (
              <span>· os documentos saem com o cabeçalho de minuta até todos serem revisados</span>
            ) : (
              <span>· todos revisados</span>
            )}
          </p>
          <Participacao salva={salva} atualizar={atualizar} />
          <Exportar analise={analise} />
          <button
            className="botao botao--discreto"
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Recomeçar a análise? As revisões e os requisitos incluídos por você serão perdidos.",
                )
              )
                atualizar(analiseInicial(analise));
            }}
          >
            Recomeçar a análise
          </button>
        </div>
      </section>

      {ORDEM_SECOES.map((secao) => {
        const daSecao = itens.filter((i) => i.secao === secao);
        if (!daSecao.length && secao !== "requisitos") return null;
        const pendentesDaSecao = daSecao.filter(
          (i) => ehRevisavel(i) && estadoDoItem(salva.revisoes, i.id) === "pendente",
        );
        return (
          <section className="bloco" key={secao} data-secao={secao}>
            <RotuloSecao>{NOME_SECAO[secao]}</RotuloSecao>
            {INTRODUCAO[secao] && <p className="texto-apoio">{INTRODUCAO[secao]}</p>}
            {secao === "mapa" ? (
              <MapaDoDocumento itens={daSecao} />
            ) : (
              <>
                {pendentesDaSecao.length > 1 && (
                  <button
                    className="botao botao--discreto"
                    type="button"
                    style={{ marginBottom: 8 }}
                    onClick={() =>
                      mudarEstado(
                        pendentesDaSecao.map((i) => i.id),
                        "aceito",
                      )
                    }
                  >
                    Aceitar os {pendentesDaSecao.length} pendentes desta seção
                  </button>
                )}
                {daSecao.map((i) => (
                  <ItemDaAnalise key={i.id} item={i} salva={salva} mudarEstado={mudarEstado} />
                ))}
                {secao === "requisitos" && <IncluirRequisito salva={salva} atualizar={atualizar} />}
              </>
            )}
          </section>
        );
      })}

      <section className="bloco">
        <RotuloSecao>O que o código não pôde conferir</RotuloSecao>
        <div className="cartao cartao__corpo">
          <p className="texto-apoio">
            Não achado não é ausente: "não localizado pelo código" quer dizer que o código não achou, não que
            o documento não traga. Cada regra de brecha mostra o resultado.
          </p>
          <table className="tabela">
            <thead>
              <tr>
                <th>Regra</th>
                <th>O que procura</th>
                <th>Resultado</th>
                <th>Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {analise.regras.map((r) => (
                <tr
                  key={r.regra}
                  data-origem={r.estado === "nao-verificavel" ? "nao-verificavel" : undefined}
                >
                  <td>{r.regra}</td>
                  <td>{r.nome}</td>
                  <td>
                    {r.estado === "achado"
                      ? "achado"
                      : r.estado === "nao-verificavel"
                        ? "não verificável"
                        : "não identificado"}
                  </td>
                  <td>{r.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Participacao({
  salva,
  atualizar,
}: {
  salva: AnaliseRfpDossie;
  atualizar: (a: AnaliseRfpDossie) => void;
}) {
  const p = salva.participacao;
  return (
    <div className="decisao" style={{ margin: "12px 0" }}>
      <EtiquetaRotulo rotulo="decisao-gp" />
      <label>
        <span className="lb">Participar da disputa?</span>{" "}
        <select
          aria-label="Participar da disputa?"
          value={p.decisao}
          onChange={(e) =>
            atualizar({ ...salva, participacao: { ...p, decisao: e.target.value as typeof p.decisao } })
          }
        >
          <option value="a-decidir">a decidir</option>
          <option value="participar">participar</option>
          <option value="nao-participar">não participar</option>
        </select>
      </label>
      <input
        aria-label="Justificativa da decisão"
        placeholder="Justificativa (registrada no relatório)"
        value={p.justificativa ?? ""}
        onChange={(e) => atualizar({ ...salva, participacao: { ...p, justificativa: e.target.value } })}
      />
    </div>
  );
}

function ItemDaAnalise({
  item,
  salva,
  mudarEstado,
}: {
  item: ItemAnalise;
  salva: AnaliseRfpDossie;
  mudarEstado: (ids: string[], estado: EstadoItem, textoEditado?: string) => void;
}) {
  const estado = estadoDoItem(salva.revisoes, item.id);
  const editado = salva.revisoes[item.id]?.textoEditado;
  const textoBase = item.pergunta ?? item.texto;
  const campos = Object.entries(item.campos ?? {}).filter(([k]) => k !== "Trecho");
  return (
    <article
      className="cartao cartao--borda bloco item-rfp"
      data-estado={estado}
      data-situacao={item.situacao}
      data-testid={`item-${item.id}`}
    >
      <div className="cartao__corpo">
        <div className="achado__cabeca">
          <EtiquetaRotulo
            rotulo={item.rotulo}
            pagina={item.rotulo === "documento" ? item.origem?.pagina : undefined}
          />
          {item.situacao !== "localizado" && <span className="lb">{NOME_SITUACAO[item.situacao]}</span>}
          {campos.map(([k, v]) => (
            <span className="lb" key={k}>
              {k}: {v}
            </span>
          ))}
        </div>
        <h3 className="achado__titulo">{item.nome}</h3>
        {item.pergunta ? (
          <>
            <p>{item.texto}</p>
            <p>
              <EtiquetaRotulo rotulo="sugestao" /> <b>Pergunta sugerida:</b>{" "}
              {estado === "editado" && editado ? editado : item.pergunta}
            </p>
          </>
        ) : (
          <p>{estado === "editado" && editado ? editado : item.texto}</p>
        )}
        {item.origem?.trecho && (
          <details>
            <summary className="envio__obs">
              Trecho do documento ({item.origem.documento}, p. {item.origem.pagina})
            </summary>
            <p className="envio__obs">“{item.origem.trecho}”</p>
            {item.campos?.Trecho && item.campos.Trecho !== item.origem.trecho && (
              <p className="envio__obs">“{item.campos.Trecho}”</p>
            )}
          </details>
        )}
        {item.nota && <p className="envio__obs">{item.nota}</p>}
        <div className="decisao">
          <span className="lb">Revisão do GP</span>
          <select
            aria-label={`Revisão de ${item.nome}`}
            value={estado}
            onChange={(e) => mudarEstado([item.id], e.target.value as EstadoItem, editado ?? textoBase)}
          >
            {(["pendente", "aceito", "editado", "descartado"] as const).map((s) => (
              <option key={s} value={s}>
                {NOME_ESTADO[s].toLowerCase()}
              </option>
            ))}
          </select>
          {estado === "editado" && (
            <textarea
              aria-label={`Texto editado de ${item.nome}`}
              rows={2}
              style={{ flex: 1, minWidth: 260 }}
              value={editado ?? textoBase}
              onChange={(e) => mudarEstado([item.id], "editado", e.target.value)}
            />
          )}
        </div>
      </div>
    </article>
  );
}

function MapaDoDocumento({ itens }: { itens: ItemAnalise[] }) {
  return (
    <div className="cartao cartao__corpo mapa">
      <table className="tabela">
        <thead>
          <tr>
            <th>Seção ou anexo</th>
            <th>Onde</th>
            <th>Páginas</th>
            <th>Tema</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((i) => (
            <tr key={i.id}>
              <td>{i.nome === "Anexo" ? <b>{i.texto}</b> : i.texto}</td>
              <td>
                {i.origem?.documento} · {i.nome}
              </td>
              <td>{i.campos?.Páginas}</td>
              <td>{i.campos?.Tema}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IncluirRequisito({
  salva,
  atualizar,
}: {
  salva: AnaliseRfpDossie;
  atualizar: (a: AnaliseRfpDossie) => void;
}) {
  const [rotulo, setRotulo] = useState("");
  const [descricao, setDescricao] = useState("");
  return (
    <div className="cartao cartao__corpo acoes-exportar">
      <input
        value={rotulo}
        onChange={(e) => setRotulo(e.target.value)}
        placeholder="Rótulo (ex.: Requisito técnico)"
        aria-label="Rótulo do requisito novo"
      />
      <input
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Descrição como está na RFP, com a página"
        aria-label="Descrição do requisito novo"
        style={{ flex: 1, minWidth: 240 }}
      />
      <button
        className="botao"
        type="button"
        disabled={!descricao.trim()}
        onClick={() => {
          atualizar(incluirRequisito(salva, rotulo, descricao));
          setRotulo("");
          setDescricao("");
        }}
      >
        Incluir requisito R{String(salva.proximoRequisito).padStart(2, "0")}
      </button>
    </div>
  );
}

const SAIDAS: {
  rotulo: string;
  nome: string;
  formato: FormatoExportacao;
  montar: typeof montarAnaliseRfp;
}[] = [
  { rotulo: "Análise da RFP · DOCX", nome: "analise-da-rfp", formato: "docx", montar: montarAnaliseRfp },
  { rotulo: "Análise da RFP · PDF", nome: "analise-da-rfp", formato: "pdf", montar: montarAnaliseRfp },
  {
    rotulo: "Requisitos e prazos · XLSX",
    nome: "requisitos-e-prazos",
    formato: "xlsx",
    montar: montarRequisitosEPrazos,
  },
  {
    rotulo: "Checklist de habilitação · XLSX",
    nome: "checklist-de-habilitacao",
    formato: "xlsx",
    montar: montarChecklistHabilitacao,
  },
  {
    rotulo: "Perguntas de esclarecimento · DOCX",
    nome: "perguntas-de-esclarecimento",
    formato: "docx",
    montar: montarPerguntas,
  },
];

function Exportar({ analise }: { analise: AnaliseRfp }) {
  const dossie = useDossie((s) => s.dossie);
  const [mensagem, setMensagem] = useState("");
  const [ocupado, setOcupado] = useState(false);
  async function baixar(s: (typeof SAIDAS)[number]) {
    setOcupado(true);
    setMensagem("");
    try {
      const nome = await exportar(s.montar(dossie, analise), s.formato, s.nome);
      setMensagem(`Arquivo gerado: ${nome}`);
    } catch (e) {
      setMensagem(`Não foi possível gerar o arquivo: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setOcupado(false);
    }
  }
  return (
    <div className="acoes-exportar" style={{ margin: "12px 0" }}>
      {SAIDAS.map((s) => (
        <button
          key={s.rotulo}
          className="botao"
          type="button"
          disabled={ocupado}
          onClick={() => void baixar(s)}
        >
          {s.rotulo}
        </button>
      ))}
      {mensagem && (
        <span aria-live="polite" className="envio__obs">
          {mensagem}
        </span>
      )}
    </div>
  );
}
