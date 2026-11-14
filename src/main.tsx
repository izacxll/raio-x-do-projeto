import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { useDossie } from "./dossie/store";
import { Cabecalho } from "./interface/componentes/cabecalho";
import { AvisoDemonstracao } from "./interface/componentes/demonstracao";
import "./interface/estilos/app.css";
import { TelaEtapa } from "./interface/telas/tela-etapa";
import { TelaInicial } from "./interface/telas/tela-inicial";

function App() {
  const alterado = useDossie((s) => s.alterado);

  // aviso ao fechar a aba com mudanças não salvas: o dossiê só existe na memória desta aba
  useEffect(() => {
    if (!alterado) return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [alterado]);

  return (
    <HashRouter>
      <Cabecalho />
      <AvisoDemonstracao />
      <Routes>
        <Route path="/" element={<TelaInicial />} />
        <Route path="/etapa/:numero" element={<TelaEtapa />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="rodape">
        Raio-X do Projeto {__VERSAO_APP__} · skill PMO {__VERSAO_SKILL__} · os PDFs são lidos no seu
        navegador. Em construção.
      </footer>
    </HashRouter>
  );
}

const raiz = document.getElementById("raiz");
if (raiz) {
  createRoot(raiz).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
