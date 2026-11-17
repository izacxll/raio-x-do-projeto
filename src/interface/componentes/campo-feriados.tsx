// Feriados municipais do local do projeto (decisão do GP): o cronograma já desconta os nacionais (decisão 0051).
import { useState } from "react";

/** dd/mm/aaaa separados por vírgula, guardados como aaaa-mm-dd; o que não for data fica para o cronograma acusar. */
export function CampoFeriados({
  valor,
  aoMudar,
}: {
  valor: string[] | undefined;
  aoMudar: (v: string[] | undefined) => void;
}) {
  const paraTela = (d: string) => {
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
    return iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : d;
  };
  const paraGuardar = (d: string) => {
    const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(d);
    return br ? `${br[3]}-${br[2]!.padStart(2, "0")}-${br[1]!.padStart(2, "0")}` : d;
  };
  const [texto, setTexto] = useState((valor ?? []).map(paraTela).join(", "));
  return (
    <label className="campo-numero">
      <span className="lb">Feriados municipais (decisão do GP)</span>
      <input
        aria-label="Feriados municipais"
        value={texto}
        placeholder="dd/mm/aaaa, separados por vírgula"
        onChange={(e) => {
          setTexto(e.target.value);
          const lista = e.target.value
            .split(/[,;]/)
            .map((x) => x.trim())
            .filter(Boolean)
            .map(paraGuardar);
          aoMudar(lista.length ? lista : undefined);
        }}
      />
    </label>
  );
}
