// Cabeçalho do app: faixa em degradê, logo da FGV Projetos, nome do projeto e o dossiê (abrir e salvar).
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { EXTENSAO_DOSSIE, lerDossie, nomeArquivoDossie, serializarDossie } from "../../dossie/arquivo";
import { useDossie } from "../../dossie/store";
import { baixarArquivo } from "../../exportacao/modelo";
import logo from "../ativos/logo-fgv-projetos.jpg";

export function Cabecalho() {
  const { dossie, alterado, definirNomeProjeto, abrirDossie, novoProjeto, marcarSalvo } = useDossie();
  const entrada = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState("");

  function salvar() {
    const texto = serializarDossie(dossie);
    baixarArquivo(new Blob([texto], { type: "application/json" }), nomeArquivoDossie(dossie));
    marcarSalvo();
  }

  async function abrir(arquivo: File | undefined) {
    if (!arquivo) return;
    if (
      alterado &&
      !window.confirm("Há mudanças que não foram salvas no dossiê. Abrir outro projeto mesmo assim?")
    ) {
      return;
    }
    const r = lerDossie(await arquivo.text(), arquivo.name);
    if (r.ok) {
      abrirDossie(r.dossie);
      setErro("");
    } else setErro(r.erro);
    if (entrada.current) entrada.current.value = "";
  }

  function novo() {
    if (
      alterado &&
      !window.confirm("Há mudanças que não foram salvas no dossiê. Começar um projeto novo mesmo assim?")
    ) {
      return;
    }
    novoProjeto();
  }

  return (
    <>
      <div className="faixa-topo" />
      <header className="cabecalho">
        <div className="cabecalho__dentro">
          <Link to="/" className="marca" aria-label="Raio-X do Projeto — tela inicial">
            <img src={logo} alt="FGV Projetos" width={156} height={26} />
            <span className="marca__nome">Raio-X do Projeto</span>
          </Link>
          <label className="cabecalho__projeto">
            <span className="lb">Projeto</span>
            <input
              value={dossie.projeto.nome}
              onChange={(e) => definirNomeProjeto(e.target.value)}
              placeholder="Nome do projeto (usado no nome dos arquivos)"
              aria-label="Nome do projeto"
            />
          </label>
          <div className="cabecalho__acoes">
            <button className="botao botao--discreto" type="button" onClick={novo}>
              Novo
            </button>
            <button className="botao" type="button" onClick={() => entrada.current?.click()}>
              Abrir projeto
            </button>
            <button className="botao botao--cheio" type="button" onClick={salvar}>
              Salvar projeto{alterado ? " •" : ""}
            </button>
            <input
              ref={entrada}
              type="file"
              accept={`${EXTENSAO_DOSSIE},application/json`}
              hidden
              onChange={(e) => void abrir(e.target.files?.[0])}
              data-testid="abrir-dossie"
            />
          </div>
        </div>
        {erro && (
          <div className="cabecalho__dentro">
            <div className="aviso aviso--erro" role="alert">
              <p>
                <b>Não foi possível abrir o dossiê.</b> {erro}
              </p>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
