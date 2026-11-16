// Roteiro da etapa 5 sobre um plano real (docs/estudos/roteiro-etapa-5-plano-real.md): roda na máquina da
// responsável, com a chave dela, sobre PDFs que nunca entram no repositório. Faz a conferência por código e, com a
// chave, a leitura do PMO conferida pelo código; grava SÓ números (contagens por tipo, gravidade, parte e situação,
// tokens e custo), fora do repositório. Nenhum trecho, título ou texto do plano sai daqui.
// Só roda pelo npm run conferir-plano-real (CONFERIR_PLANO_REAL=sim).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { MODELO_PADRAO } from "../../src/config/modelo";
import { CARACTERISTICAS_PADRAO, type Caracteristicas } from "../../src/dominio/caracteristicas";
import { PARTES_PGP, PREMISSAS_CRITICAS } from "../../src/dominio/skill";
import { conferirLeitura, pedidoLeitura } from "../../src/etapas/5-conferencia/leitura-pmo";
import { extrairRequisitos } from "../../src/extracao/requisitos";
import { chamarPmo } from "../../src/pmo/cliente";
import { referenciasEtapa5, textoDeSistema, textoDosDocumentos } from "../../src/pmo/montagem";
import { RespostaLeitura } from "../../src/pmo/schemas/leitura";
import { conferirPlano, type TipoPlano } from "../../src/regras/conferencia";
import { aplicarTipoPlano, confirmacaoInicial, proporMapa } from "../../src/regras/mapa-pgp";
import { caminhoForaDoRepositorio, lerChaveDeArquivo } from "../ajudantes/chave-de-arquivo";
import { lerPdf } from "../ajudantes/ler-pdf";

const LIGADO = process.env.CONFERIR_PLANO_REAL === "sim";
const env = process.env;

/** Contagem por chave. */
function contar<T>(lista: T[], chave: (x: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const x of lista) out[chave(x)] = (out[chave(x)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}

interface ItemGabarito {
  tipo: string;
  parte: string;
}

/** Acertos por (tipo, parte): cada item do gabarito casa com no máximo um achado. */
function compararComGabarito(gabarito: ItemGabarito[], achados: ItemGabarito[]) {
  const sobra = [...achados];
  let acertos = 0;
  for (const g of gabarito) {
    const i = sobra.findIndex((a) => a.tipo === g.tipo && a.parte === g.parte);
    if (i >= 0) {
      acertos++;
      sobra.splice(i, 1);
    }
  }
  return {
    gabarito: gabarito.length,
    achados: achados.length,
    acertos,
    precisao: achados.length ? Math.round((acertos / achados.length) * 100) / 100 : null,
    cobertura: gabarito.length ? Math.round((acertos / gabarito.length) * 100) / 100 : null,
  };
}

describe.skipIf(!LIGADO)("roteiro da etapa 5 com um plano real (só números)", () => {
  it(
    "confere o plano e grava o resumo numérico fora do repositório",
    async () => {
      const caminho = (nome: string) => {
        const c = env[nome];
        if (!c) return undefined;
        if (!existsSync(c)) throw new Error(`${nome} aponta para um arquivo que não existe.`);
        if (!caminhoForaDoRepositorio(c))
          throw new Error(`${nome} está dentro da pasta do projeto: use um arquivo de fora.`);
        return c;
      };
      const plano = caminho("RAIO_X_PLANO");
      if (!plano) throw new Error("Falta RAIO_X_PLANO (o PDF do plano, fora do repositório).");
      const tipoPlano: TipoPlano = env.RAIO_X_TIPO_PLANO === "pgp" ? "pgp" : "plano-trabalho";
      const pgp = await lerPdf(plano, "pgp");
      const tapCaminho = caminho("RAIO_X_TAP");
      const rfpCaminho = caminho("RAIO_X_RFP");
      const tap = tapCaminho ? await lerPdf(tapCaminho, "tap") : undefined;
      const rfp = rfpCaminho ? await lerPdf(rfpCaminho, "rfp") : undefined;

      const proposta = proporMapa(pgp.paginas, PARTES_PGP);
      const mapa = aplicarTipoPlano(confirmacaoInicial(proposta), tipoPlano, proposta);
      const caracteristicas: Caracteristicas = env.RAIO_X_CARACTERISTICAS
        ? {
            ...CARACTERISTICAS_PADRAO,
            ...(JSON.parse(env.RAIO_X_CARACTERISTICAS) as Partial<Caracteristicas>),
          }
        : CARACTERISTICAS_PADRAO;
      const pcs = env.RAIO_X_PCS?.split(/[,; ]+/).filter(Boolean);
      const premissasAplicaveis = Object.fromEntries(
        PREMISSAS_CRITICAS.map((p) => [p.codigo, pcs ? pcs.includes(p.codigo) : true]),
      );
      const requisitos = rfp ? extrairRequisitos(rfp.paginas) : [];
      const codigo = conferirPlano({
        pgp: pgp.paginas,
        tap: tap?.paginas,
        rfp: rfp?.paginas,
        partes: PARTES_PGP,
        premissas: PREMISSAS_CRITICAS,
        mapa,
        caracteristicas,
        premissasAplicaveis,
        requisitos,
        tipoPlano,
      });

      const chave = lerChaveDeArquivo();
      let pmo: Record<string, unknown> = {
        pedida: false,
        motivo: "sem RAIO_X_ARQUIVO_CHAVE: só a conferência por código",
      };
      let achadosPmo: { tipo: string; parte: string }[] = [];
      if (chave) {
        const modelo = env.RAIO_X_MODELO || MODELO_PADRAO;
        const r = await chamarPmo({
          chave,
          modelo,
          passo: "leitura",
          sistema: textoDeSistema(referenciasEtapa5()),
          documentos: textoDosDocumentos([pgp, ...(tap ? [tap] : []), ...(rfp ? [rfp] : [])]),
          pedido: pedidoLeitura({
            partesPresentes: mapa.filter((m) => m.situacao === "presente").map((m) => m.codigo),
            caracteristicas,
            premissasAplicaveis,
            achadosDoCodigo: codigo.achados,
            temTap: Boolean(tap),
            temRfp: Boolean(rfp),
          }),
          schema: RespostaLeitura,
        });
        const conferidos = conferirLeitura(r.resposta, { pgp, tap, rfp }, codigo.achados);
        achadosPmo = conferidos.filter((a) => a.situacao === "valido");
        pmo = {
          pedida: true,
          modelo: r.modelo,
          tokens: r.uso,
          custoUsd: r.custo,
          achados: conferidos.length,
          porSituacao: contar(conferidos, (a) => a.situacao),
          porTipo: contar(conferidos, (a) => a.tipo),
          porGravidade: contar(conferidos, (a) => a.gravidade),
          porParte: contar(conferidos, (a) => a.parte),
          jaApontadosPeloCodigo: conferidos.filter((a) => a.jaApontadoPeloCodigo).length,
          redacaoAConferir: conferidos.filter((a) => a.redacaoAConferir).length,
          observacoes: r.resposta.observacoes.length,
        };
      }

      const resumo: Record<string, unknown> = {
        geradoEm: new Date().toISOString(),
        tipoPlano,
        paginas: { plano: pgp.totalPaginas, tap: tap?.totalPaginas ?? 0, rfp: rfp?.totalPaginas ?? 0 },
        paginasIlegiveisNoPlano: pgp.paginas.filter((p) => p.origem === "nao-verificavel").length,
        mapa: contar(mapa, (m) => m.situacao),
        premissasAplicaveis: Object.values(premissasAplicaveis).filter(Boolean).length,
        requisitosDaRfp: requisitos.length,
        codigo: {
          achados: codigo.achados.length,
          porTipo: contar(codigo.achados, (a) => a.tipo),
          porGravidade: contar(codigo.achados, (a) => a.gravidade),
          porTipoEGravidade: contar(codigo.achados, (a) => `${a.tipo} · ${a.gravidade}`),
          porParte: contar(codigo.achados, (a) => a.parte),
          porRegra: contar(codigo.achados, (a) => a.regra),
        },
        pmo,
      };

      const gabaritoCaminho = caminho("RAIO_X_GABARITO");
      if (gabaritoCaminho) {
        const gabarito = JSON.parse(readFileSync(gabaritoCaminho, "utf8")) as ItemGabarito[];
        resumo.comparacaoComGabarito = {
          regra:
            "um acerto por item do gabarito com o mesmo tipo (vago, conflituoso, ausente) e a mesma parte (A1…B33)",
          codigo: compararComGabarito(gabarito, codigo.achados),
          pmoValidos: compararComGabarito(gabarito, achadosPmo),
          codigoMaisPmo: compararComGabarito(gabarito, [...codigo.achados, ...achadosPmo]),
        };
      }

      const saida =
        env.RAIO_X_SAIDA ??
        join(
          homedir(),
          ".raio-x",
          `resumo-etapa-5-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`,
        );
      mkdirSync(dirname(saida), { recursive: true });
      if (!caminhoForaDoRepositorio(dirname(saida)))
        throw new Error("RAIO_X_SAIDA está dentro da pasta do projeto.");
      writeFileSync(saida, `${JSON.stringify(resumo, null, 2)}\n`);
      console.log(`Resumo numérico gravado em ${saida}`);
      console.log(JSON.stringify(resumo, null, 2));
      expect(codigo.achados.length).toBeGreaterThanOrEqual(0);
    },
    20 * 60 * 1000,
  );
});
