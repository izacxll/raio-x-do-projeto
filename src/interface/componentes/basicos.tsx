// Componentes visuais pequenos, reaproveitados nas telas.
import type { ReactNode } from "react";
import type { EstadoItem, Rotulo } from "../../dossie/esquema";

export const NOME_ROTULO: Record<Rotulo, string> = {
  documento: "Do documento",
  sugestao: "Sugestão",
  "decisao-gp": "Decisão do GP",
};

export const NOME_ESTADO: Record<EstadoItem, string> = {
  pendente: "Pendente",
  aceito: "Aceito",
  editado: "Editado",
  descartado: "Descartado",
};

/** Etiqueta de um dos três rótulos (seção 2). "Do documento" pode levar a página. */
export function EtiquetaRotulo({ rotulo, pagina }: { rotulo: Rotulo; pagina?: number }) {
  const texto =
    rotulo === "documento" && pagina ? `${NOME_ROTULO[rotulo]}, p. ${pagina}` : NOME_ROTULO[rotulo];
  return <i className={`etiqueta etiqueta--${rotulo}`}>{texto}</i>;
}

export function RotuloSecao({ children }: { children: ReactNode }) {
  return <div className="rotulo-secao">{children}</div>;
}

export function Titulo({ children, nivel = 1 }: { children: ReactNode; nivel?: 1 | 2 }) {
  return nivel === 1 ? <h1 className="titulo">{children}</h1> : <h2 className="titulo">{children}</h2>;
}

export function IconeDocumento() {
  return (
    <svg viewBox="0 0 30 36" fill="none" aria-hidden="true">
      <path
        d="M3 2h17l7 7v25H3z"
        fill="var(--soft)"
        stroke="var(--navy700)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M20 2v7h7" stroke="var(--navy700)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 18h14M8 23h14M8 28h9" stroke="var(--celeste)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function LegendaRotulos() {
  return (
    <div className="legenda">
      <span>Cada item vem marcado:</span>
      <i className="etiqueta etiqueta--documento">Do documento, com a página</i>
      <i className="etiqueta etiqueta--sugestao">Sugestão</i>
      <i className="etiqueta etiqueta--decisao-gp">Decisão do GP</i>
      <b className="legenda__frase">A ferramenta sugere. Quem decide é o gerente.</b>
    </div>
  );
}
