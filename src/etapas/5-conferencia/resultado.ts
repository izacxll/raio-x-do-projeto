// O resultado da etapa 5 a partir do dossiê, como a tela o calcula (decisões 0037, 0052, 0076, 0077 e 0084): a
// conferência por código com os candidatos, os vereditos do PMO (com a segunda instância leve, se é desta leitura) e a
// leitura do PMO conferida. A conferência não fica guardada no dossiê: só as entradas e as decisões. Sem a leitura do
// PMO, não há resultado (decisão 0037).
import { PARTES_PGP, PREMISSAS_CRITICAS } from "../../dominio/skill";
import type { DocumentoLido, Dossie } from "../../dossie/esquema";
import { aplicarSegundaEtapa5 } from "../../pmo/segunda-etapa-5";
import type { Achado, Verificacao } from "../../regras/achado";
import { proporMapa } from "../../regras/mapa-pgp";
import { presentesPelaMarcaDoDossie } from "../4-pgp/autoconferencia";
import { tapDoDossieComoDocumento } from "../4-pgp/entrada";
import { conferirComCandidatos, conferirVereditos, type ResultadoVereditos } from "./candidatos";
import { conferirLeitura, type AchadoPmoConferido } from "./leitura-pmo";

export interface ResultadoDaEtapa5 {
  /** Os achados do código (todos os candidatos, antes do veredito). */
  achados: Achado[];
  verificacoes: Verificacao[];
  vereditos: ResultadoVereditos;
  leitura: AchadoPmoConferido[];
  /** Os documentos da conferência: o plano, o TAP (ou o da etapa 3) e a RFP. */
  documentos: { pgp: DocumentoLido; tap?: DocumentoLido; rfp?: DocumentoLido };
}

export function resultadoDaEtapa5(dossie: Dossie): ResultadoDaEtapa5 | undefined {
  const conf = dossie.conferencia;
  const primeiro = (papel: DocumentoLido["papel"]) => dossie.documentos.find((d) => d.papel === papel);
  const pgp = primeiro("pgp");
  if (!conf?.leituraPmo || !pgp) return undefined;
  // a leitura e as decisões eram de outro plano: a tela as descarta (decisão 0037)
  if (conf.pgpId && conf.pgpId !== pgp.id) return undefined;
  const tap = primeiro("tap") ?? tapDoDossieComoDocumento(dossie);
  const rfp = primeiro("rfp");
  const c = conferirComCandidatos(
    {
      pgp: pgp.paginas,
      tap: tap?.paginas,
      rfp: rfp?.paginas,
      partes: PARTES_PGP,
      premissas: PREMISSAS_CRITICAS,
      mapa: conf.mapa,
      caracteristicas: conf.caracteristicas,
      premissasAplicaveis: conf.premissasAplicaveis,
      requisitos: conf.requisitos,
      tipoPlano: conf.tipoPlano,
      presentesPelaMarca: presentesPelaMarcaDoDossie(dossie.pgp),
    },
    proporMapa(pgp.paginas, PARTES_PGP),
  );
  const achados = c.resultado.achados;
  const documentos = [pgp, ...(tap ? [tap] : []), ...(rfp ? [rfp] : [])];
  const vereditos = aplicarSegundaEtapa5(
    conferirVereditos(conf.leituraPmo.resposta, achados, c.condicionais, conf.mapa, documentos),
    conf.segundaLeve?.deLeitura === conf.leituraPmo.em ? conf.segundaLeve.resposta : undefined,
    conf.leituraPmo.resposta,
  );
  return {
    achados,
    verificacoes: c.resultado.verificacoes,
    vereditos,
    leitura: conferirLeitura(conf.leituraPmo.resposta, { pgp, tap, rfp }, achados, conf.mapa),
    documentos: { pgp, tap, rfp },
  };
}
