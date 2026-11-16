// Autoconferência do PMO (decisão 0044): o código confere se cada item esperado (do método ou das fichas das partes
// mantidas) recebeu uma marca, e se a marca está completa. Item sem marca é falha da etapa; na etapa 4, ele volta
// para o PMO num pedido só daquela parte (não o bloco inteiro).
import type { CruzamentoPmo, ItemAutoconferencia } from "./schemas/comum";

export interface ResultadoAutoconferencia {
  /** Itens esperados que o PMO não marcou. */
  semMarca: string[];
  /** Marcas incompletas: "presente" sem onde; "dispensado" ou "decisao_gp" sem motivo. */
  incompletas: string[];
  /** Marcas de itens que não eram esperados (o PMO citou item que não existe ou de outra parte). */
  sobrando: string[];
  /** Tudo certo: nenhum item sem marca e nenhuma marca incompleta. */
  ok: boolean;
}

export function conferirAutoconferencia(
  esperados: string[],
  marcas: ItemAutoconferencia[],
): ResultadoAutoconferencia {
  const marcados = new Map(marcas.map((m) => [m.item.trim(), m]));
  const semMarca = esperados.filter((e) => !marcados.has(e));
  const incompletas = marcas
    .filter((m) => (m.estado === "presente" ? !m.onde.trim() : !m.motivo.trim()))
    .map((m) => m.item);
  const conjunto = new Set(esperados);
  const sobrando = marcas.map((m) => m.item.trim()).filter((i) => !conjunto.has(i));
  return { semMarca, incompletas, sobrando, ok: !semMarca.length && !incompletas.length };
}

/** Partes que voltam ao PMO: as que têm item sem marca ou com marca incompleta ("A8.7" → "A8"). */
export function partesARegenerar(r: ResultadoAutoconferencia): string[] {
  return [...new Set([...r.semMarca, ...r.incompletas].map((i) => i.replace(/\.\d+$/, "")))];
}

export const CRUZAMENTOS_OBRIGATORIOS = ["X1", "X2", "X3", "X4", "X5", "X6"] as const;

/** Cruzamentos que o PMO não registrou (decisão 0046): os seis são obrigatórios. */
export function cruzamentosSemRegistro(registrados: CruzamentoPmo[]): string[] {
  const feitos = new Set(registrados.map((c) => c.codigo));
  return CRUZAMENTOS_OBRIGATORIOS.filter((c) => !feitos.has(c));
}
