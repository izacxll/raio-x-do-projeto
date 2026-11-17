// Feriados para as contas do cronograma (decisão 0051). Os nacionais saem da lei: Lei 662/1949 (com a Lei
// 10.607/2002), Lei 6.802/1980 (12 de outubro) e Lei 14.759/2023 (20 de novembro); a Sexta-feira Santa entra como
// feriado religioso de observância nacional. Carnaval e Corpus Christi são ponto facultativo e não entram: o GP os
// informa como feriados municipais quando valerem no local do projeto.
import type { Calendario } from "./datas";

const FIXOS: [mes: number, dia: number, nome: string][] = [
  [1, 1, "Confraternização Universal"],
  [4, 21, "Tiradentes"],
  [5, 1, "Dia do Trabalho"],
  [9, 7, "Independência"],
  [10, 12, "Nossa Senhora Aparecida"],
  [11, 2, "Finados"],
  [11, 15, "Proclamação da República"],
  [11, 20, "Dia Nacional de Zumbi e da Consciência Negra"],
  [12, 25, "Natal"],
];

/** Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher, calendário gregoriano). */
export function pascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}

export function feriadosNacionais(ano: number): { data: Date; nome: string }[] {
  const p = pascoa(ano);
  return [
    ...FIXOS.map(([mes, dia, nome]) => ({ data: new Date(ano, mes - 1, dia), nome })),
    { data: new Date(ano, p.getMonth(), p.getDate() - 2), nome: "Sexta-feira Santa" },
  ].sort((x, y) => x.data.getTime() - y.data.getTime());
}

const chave = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Calendário do cronograma: os feriados nacionais de cada ano e os municipais que o GP informa (aaaa-mm-dd ou
 * dd/mm/aaaa; o que não for data é ignorado e devolvido em `ilegiveis`).
 */
export function calendarioDoProjeto(municipais: string[] = []): Calendario & { ilegiveis: string[] } {
  const porAno = new Map<number, Set<string>>();
  const ilegiveis: string[] = [];
  const locais = new Set<string>();
  for (const t of municipais) {
    const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t.trim());
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t.trim());
    const d = br
      ? new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]))
      : iso
        ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
        : undefined;
    if (d) locais.add(chave(d));
    else if (t.trim()) ilegiveis.push(t);
  }
  const nacionais = (ano: number) => {
    let s = porAno.get(ano);
    if (!s) porAno.set(ano, (s = new Set(feriadosNacionais(ano).map((f) => chave(f.data)))));
    return s;
  };
  return {
    ehFeriado: (d) => nacionais(d.getFullYear()).has(chave(d)) || locais.has(chave(d)),
    descricao: locais.size
      ? `com os feriados nacionais e ${locais.size} municipal(is) informado(s) pelo GP`
      : "com os feriados nacionais (municipais: o GP informa)",
    ilegiveis,
  };
}
