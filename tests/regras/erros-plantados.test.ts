// Etapa 5 nos planos com erros plantados (seção 11 da especificação): um plano gerado pelo PMO a partir de uma
// RFP pública, e cópias com um vago, um conflituoso e um ausente em cada faixa de gravidade.
// O teste confere se a conferência acha cada erro plantado, com o tipo, a parte e a gravidade esperados,
// e se não acusa o plano limpo nessas regras.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { Caracteristicas } from "../../src/dominio/caracteristicas";
import { PARTES_PGP, PREMISSAS_CRITICAS } from "../../src/dominio/skill";
import type { PaginaLida } from "../../src/dossie/esquema";
import type { Requisito } from "../../src/extracao/requisitos";
import type { Achado } from "../../src/regras/achado";
import { conferirPlano } from "../../src/regras/conferencia";
import { confirmacaoInicial, proporMapa } from "../../src/regras/mapa-pgp";

const RAIZ = new URL("../fixtures/gerados/conferencia/", import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/,
  "$1",
);
const CASOS = readdirSync(RAIZ, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

interface ErroPlantado {
  id: string;
  tipo: Achado["tipo"];
  gravidade: Achado["gravidade"];
  parte: string;
  descricao: string;
  de: string;
  para: string;
}

/** Texto com marcadores "=== Página N ===" → páginas lidas. */
export function paginasDoTexto(texto: string): PaginaLida[] {
  return texto
    .split(/^=== Página (\d+) ===\s*$/m)
    .slice(1)
    .reduce<PaginaLida[]>((acc, parte, i, todas) => {
      if (i % 2 === 0) {
        const corpo = (todas[i + 1] ?? "").trim();
        acc.push({ numero: Number(parte), origem: "texto", texto: corpo, caracteres: corpo.length });
      }
      return acc;
    }, []);
}

function ler(caso: string, arquivo: string): string {
  return readFileSync(join(RAIZ, caso, arquivo), "utf8").replace(/\r\n/g, "\n");
}

/** Só as regras que os erros plantados exercitam: texto, prazo, premissas, requisitos e partes. */
const REGRAS_DO_TESTE = /^(vago:|texto-de-outro-documento|prazo-total|premissa|requisito|parte-ausente)/;

for (const caso of CASOS) {
  describe(`erros plantados: ${caso}`, () => {
    const textoPlano = ler(caso, "plano.md");
    const tap = paginasDoTexto(ler(caso, "tap.md"));
    const caracteristicas = JSON.parse(ler(caso, "caracteristicas.json")) as Caracteristicas;
    const premissasAplicaveis = JSON.parse(ler(caso, "premissas.json")) as Record<string, boolean>;
    const requisitos = JSON.parse(ler(caso, "requisitos.json")) as Requisito[];
    const erros = JSON.parse(ler(caso, "erros-plantados.json")) as ErroPlantado[];
    const rfp = paginasDoTexto(
      "=== Página 1 ===\nO prazo de vigência da contratação é de até 04 (quatro) meses.",
    );

    function conferir(texto: string) {
      const pgp = paginasDoTexto(texto);
      const mapa = confirmacaoInicial(proporMapa(pgp, PARTES_PGP)).map((p) =>
        // partes que o plano não traz: o GP as dispensa no mapa (adaptação ao porte)
        p.situacao === "nao-existe" ? { ...p, situacao: "dispensada" as const } : p,
      );
      return conferirPlano({
        pgp,
        tap,
        rfp,
        partes: PARTES_PGP,
        premissas: PREMISSAS_CRITICAS,
        mapa,
        caracteristicas,
        premissasAplicaveis,
        requisitos,
      });
    }

    const limpo = conferir(textoPlano);

    it("o mapa acha as partes do plano limpo pelo título", () => {
      const pgp = paginasDoTexto(textoPlano);
      const proposta = proporMapa(pgp, PARTES_PGP);
      const comTitulo = proposta.filter((p) => p.situacao === "titulo").map((p) => p.codigo);
      for (const codigo of ["A1", "A3", "A8", "A11", "B3", "B11", "B15", "B17", "B27", "B31"]) {
        expect(comTitulo, codigo).toContain(codigo);
      }
    });

    it("não acusa o plano limpo nas regras que os erros exercitam", () => {
      const acusados = limpo.achados.filter((a) => REGRAS_DO_TESTE.test(a.regra));
      expect(acusados.map((a) => `${a.regra} ${a.parte}: ${a.titulo}`)).toEqual([]);
    });

    for (const erro of erros) {
      it(`acha o erro plantado ${erro.id} (${erro.tipo}, ${erro.gravidade}, ${erro.parte})`, () => {
        expect(textoPlano.split(erro.de).length - 1, "o trecho 'de' aparece uma vez").toBe(1);
        const r = conferir(textoPlano.replace(erro.de, erro.para));
        const antes = new Set(limpo.achados.map((a) => a.id));
        const novos = r.achados.filter((a) => !antes.has(a.id));
        const certo = novos.find((a) => a.tipo === erro.tipo && a.parte === erro.parte);
        expect(
          certo,
          `novos achados: ${novos.map((a) => `${a.tipo}/${a.parte}/${a.regra}`).join("; ") || "nenhum"}`,
        ).toBeDefined();
        expect(certo?.gravidade).toBe(erro.gravidade);
      });
    }
  });
}
