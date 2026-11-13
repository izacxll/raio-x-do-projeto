// Quadro da capa: muitos editais abrem com rótulos em maiúsculas e o valor ao lado ou na linha de baixo
// ("OBJETO:", "DATA DA SESSÃO PÚBLICA", "CRITÉRIO DE JULGAMENTO:"). Lê só as duas primeiras páginas.
import { normalizarTermo } from "../../regras/busca";
import { limparEspacos } from "../../texto/frase";
import type { DocumentoRfp } from "./item";

export interface CampoDaCapa {
  /** Rótulo normalizado (minúsculas, sem acento, sem ":"). */
  rotulo: string;
  valor: string;
  pagina: number;
  /** Posição do rótulo no texto original da página. */
  posicao: number;
}

function proporcaoMaiusculas(t: string): number {
  const letras = t.match(/[A-Za-zÀ-ÿ]/g) ?? [];
  return letras.length ? (t.match(/[A-ZÀ-Ý]/g) ?? []).length / letras.length : 0;
}

const RE_TITULO_NUMERADO = /^\d{1,2}\s*[.)]\s*\S/;

/** Rótulo da capa: curto, em maiúsculas, sem número de item na frente. */
function ehRotulo(linha: string): boolean {
  const semDoisPontos = linha.replace(/:\s*$/, "");
  return (
    semDoisPontos.length >= 4 &&
    semDoisPontos.length <= 60 &&
    proporcaoMaiusculas(semDoisPontos) >= 0.85 &&
    (semDoisPontos.match(/[A-Za-zÀ-ÿ]/g) ?? []).length >= 4 &&
    !RE_TITULO_NUMERADO.test(linha)
  );
}

export function lerCapa(doc: DocumentoRfp): CampoDaCapa[] {
  const campos: CampoDaCapa[] = [];
  for (const p of doc.originais.slice(0, 2)) {
    const linhas = p.texto.split("\n");
    const inicios: number[] = [];
    let pos = 0;
    for (const l of linhas) {
      inicios.push(pos);
      pos += l.length + 1;
    }
    for (let i = 0; i < linhas.length; i++) {
      const linha = (linhas[i] ?? "").trim();
      if (RE_TITULO_NUMERADO.test(linha)) break;
      // "OBJETO: Registro de preço…" (rótulo e valor na mesma linha)
      const mesmaLinha = /^([A-ZÀ-Ý][A-ZÀ-Ý ()/º.-]{2,58}):\s*(\S.*)$/.exec(linha);
      if (mesmaLinha?.[1] && mesmaLinha[2] && proporcaoMaiusculas(mesmaLinha[1]) >= 0.85) {
        campos.push({
          rotulo: normalizarTermo(mesmaLinha[1]),
          valor: limparEspacos(mesmaLinha[2]),
          pagina: p.numero,
          posicao: inicios[i] ?? 0,
        });
        continue;
      }
      if (!ehRotulo(linha)) continue;
      // o valor vem nas linhas de baixo, até o próximo rótulo ou título
      const valor: string[] = [];
      for (let j = i + 1; j < linhas.length && valor.length < 8; j++) {
        const v = (linhas[j] ?? "").trim();
        if (!v) {
          if (valor.length) break;
          continue;
        }
        if (ehRotulo(v) || RE_TITULO_NUMERADO.test(v) || /^[A-ZÀ-Ý][A-ZÀ-Ý ()/º.-]{2,58}:\s/.test(v)) break;
        valor.push(v);
      }
      if (!valor.length) continue;
      campos.push({
        rotulo: normalizarTermo(linha.replace(/:\s*$/, "")),
        valor: limparEspacos(valor.join(" ")),
        pagina: p.numero,
        posicao: inicios[i] ?? 0,
      });
    }
  }
  return campos;
}

export function campoDaCapa(campos: CampoDaCapa[], re: RegExp): CampoDaCapa | undefined {
  return campos.find((c) => re.test(c.rotulo));
}
