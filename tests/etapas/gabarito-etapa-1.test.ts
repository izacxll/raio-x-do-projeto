// Engenharia reversa da etapa 1: o gabarito do PMO (tests/fixtures/gerados/rfp-smped/) contra a saída do app
// no mesmo edital. (1) Toda citação do gabarito é achada pelo código do app. (2) Cada item do gabarito recebe
// acerto, parcial ou falta, e quem falta ou erra tem a origem: uma regra de código resolveria ("regra") ou só
// uma leitura com IA ("ia"). A linha de base fica registrada aqui: se o app melhorar ou piorar, o teste avisa.
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import type { DocumentoLido } from "../../src/dossie/esquema";
import { analisarRfp, type AnaliseRfp } from "../../src/etapas/1-rfp/analisar-rfp";
import { montarLeituraRfp, type LeituraRfp } from "../../src/etapas/1-rfp/leitura";
import { analiseInicial } from "../../src/etapas/1-rfp/revisao";
import type { ItemAnalise } from "../../src/extracao/rfp/item";
import { citacaoValeComoFato, conferirCitacao } from "../../src/pmo/citacoes";
import { lerRfpPublica } from "../ajudantes/rfp-publica";

interface ItemGabarito {
  id: string;
  secao: string;
  nome: string;
  valor: string;
  fontes: { doc: "rfp"; pagina: number; trecho: string }[];
}
const gabarito = JSON.parse(
  readFileSync(new URL("../fixtures/gerados/rfp-smped/gabarito-etapa-1.json", import.meta.url), "utf8"),
) as { itens: ItemGabarito[]; naoSaoBrechas: { trecho: string; pagina: number }[] };

const HOJE = new Date(2026, 10, 13);
let doc: DocumentoLido;
let a: AnaliseRfp;
let leitura: LeituraRfp;
const lido = (id: string) => {
  const i = leitura.itens.find((x) => x.id === id);
  return i ? `${i.texto} ${i.origem?.trecho ?? ""}` : "";
};
beforeAll(async () => {
  doc = await lerRfpPublica("chamamento-publico-termo-fomento-smped-sp-2025.pdf", HOJE);
  a = analisarRfp([doc], HOJE);
  leitura = montarLeituraRfp(a, analiseInicial(a, HOJE), HOJE);
}, 120000);

type Situacao = "acerto" | "parcial" | "falta";
type Origem = "regra" | "ia";
const it_ = (id: string) => a.itens.find((i) => i.id === id);
const prefixo = (p: string) => a.itens.filter((i) => i.id.startsWith(p));
const req = (re: RegExp) => a.requisitosDoCodigo.find((r) => re.test(r.descricao));
const naPagina = (i: ItemAnalise | undefined, p: number) =>
  i?.origem?.pagina === p && i.situacao === "localizado";
const s = (cond: boolean, parcial = false): Situacao => (cond ? "acerto" : parcial ? "parcial" : "falta");

/**
 * Como o app se sai em cada item do gabarito (v0.8.1) e, quando não acerta, de onde viria a correção.
 * "como" diz a regra de código que resolveria, ou por que só a leitura com IA resolve.
 */
const COMPARACAO: Record<
  string,
  { situacao: () => Situacao; esperado: Situacao; origem?: Origem; como?: string }
> = {
  "ID-01": { situacao: () => s(naPagina(it_("identificacao:instrumento"), 1)), esperado: "acerto" },
  "ID-02": {
    situacao: () => s(/Termo de fomento/.test(it_("identificacao:parceria")?.texto ?? "")),
    esperado: "acerto",
  },
  "ID-03": {
    situacao: () =>
      s(
        /PREFEITURA/i.test(it_("identificacao:contratante")?.texto ?? ""),
        Boolean(it_("identificacao:contratante")),
      ),
    esperado: "parcial",
    origem: "regra",
    como: 'Ler "A PREFEITURA… por intermédio da SECRETARIA…" no preâmbulo: o contratante é o ente, a secretaria é quem conduz.',
  },
  "ID-04": {
    situacao: () =>
      s(/^2\.1 /.test(it_("identificacao:objeto")?.texto ?? ""), Boolean(it_("identificacao:objeto"))),
    esperado: "acerto",
    origem: "regra",
    como: 'Preferir a frase "terá por objeto|constitui objeto" e a seção cujo título tem OBJETO à primeira frase da seção de propósito.',
  },
  "ID-05": {
    situacao: () => s(it_("identificacao:processo")?.texto === "6065.2025/0000119-7"),
    esperado: "acerto",
  },
  "ID-06": {
    situacao: () =>
      s(
        /por projeto|cada projeto|teto/i.test(it_("identificacao:valor")?.texto ?? ""),
        Boolean(it_("identificacao:valor")),
      ),
    esperado: "parcial",
    origem: "regra",
    como: 'Quando o trecho diz "para cada projeto" ou "valor teto", rotular "teto por projeto" e avisar que o valor global não é declarado.',
  },
  "ID-07": {
    situacao: () => s(a.itens.some((i) => /dota[cç][aã]o/i.test(i.nome))),
    esperado: "falta",
    origem: "regra",
    como: 'Padrão "dotação orçamentária" seguido do código numérico.',
  },
  "ID-08": {
    situacao: () =>
      s(
        ["lei-13.019", "lei-13.204", "decreto-57.575", "portaria-41"].every((n) =>
          it_(`identificacao:norma:${n}`),
        ),
      ),
    esperado: "acerto",
  },
  "ID-09": {
    situacao: () => s(/e-?mail|pdf/i.test(it_("apresentacao:arquivo")?.texto ?? "")),
    esperado: "falta",
    origem: "regra",
    como: 'Tema "forma de envio": "deverá ser enviada para o e-mail", "arquivo PDF, no tamanho máximo de".',
  },

  "RQ-01": {
    situacao: () => s(Boolean(req(/^1\.1 /))),
    esperado: "falta",
    origem: "ia",
    como: 'Separar o propósito que vincula o projeto da justificativa pede leitura; uma regra "o projeto deverá" traria ruído.',
  },
  // decisão 0048: o público-alvo descreve a quem o projeto atende, não é obrigação nem entrega; deixou de ser R e
  // continua na leitura, no cartão das obrigações da seção 2
  "RQ-02": {
    situacao: () =>
      s(
        leitura.itens.some((i) =>
          /público-alvo as pessoas com deficiência/.test(
            [i.texto, ...(i.tabela?.linhas.flat() ?? [])].join(" "),
          ),
        ) && !req(/^1\.2 /),
      ),
    esperado: "acerto",
  },
  "RQ-03": {
    situacao: () => s(Boolean(req(/^1\.3 /))),
    esperado: "falta",
    origem: "ia",
    como: 'Conteúdo obrigatório das ações em texto corrido ("deverá contemplar ações…"): leitura.',
  },
  // decisão 0034 (método da etapa 1): "até 15 projetos" e "um projeto por proponente" deixaram de ser requisito R;
  // estão na seção 1 da leitura (tamanho e quem pode participar)
  "RQ-04": { situacao: () => s(/15 \(quinze\) projetos/.test(lido("leitura:tamanho"))), esperado: "acerto" },
  "RQ-05": {
    situacao: () => s(/apenas 01 \(um\) único projeto/.test(lido("leitura:participacao"))),
    esperado: "acerto",
  },
  "RQ-06": {
    situacao: () => s(Boolean(req(/^1\.5\.1 /))),
    esperado: "falta",
    origem: "ia",
    como: "Condição de elegibilidade com critério aberto (originalidade): leitura.",
  },
  "RQ-07": {
    situacao: () => s(Boolean(req(/^1\.6 /))),
    esperado: "falta",
    origem: "ia",
    como: "Complementaridade com as ações do poder público: leitura.",
  },
  // decisão 0034: o prazo de execução (1.9) deixou de ser requisito R; está no prazo da seção 1, com o trecho
  "RQ-08": {
    situacao: () =>
      s(/^1\.9 /.test(leitura.itens.find((i) => i.id === "leitura:prazo")?.origem?.trecho ?? "")),
    esperado: "acerto",
  },
  // decisão 0048: "poderá ser executado de forma presencial e/ou à distância" é faculdade, não obrigação nem
  // entrega (apontamento da responsável no teste externo); não vira R
  "RQ-09": {
    situacao: () => s(Boolean(req(/^1\.10 /))),
    esperado: "falta",
    origem: "ia",
    como: "Faculdade de execução remota: só a leitura diz se muda o custo ou a logística.",
  },
  "RQ-10": {
    situacao: () => s(Boolean(req(/^2\.1 /))),
    esperado: "falta",
    origem: "regra",
    como: 'Tipos de deficiência listados no objeto: padrão "deficiência física, visual, auditiva…" como público do objeto.',
  },
  "RQ-11": { situacao: () => s(Boolean(req(/^2\.3 /))), esperado: "acerto" },
  "RQ-12": {
    situacao: () => s(Boolean(req(/atua[cç][aã]o comprovada/))),
    esperado: "falta",
    origem: "regra",
    como: 'Condição territorial na seção de participação: "atuação comprovada no Município".',
  },
  "RQ-13": {
    situacao: () =>
      s(Boolean(req(/Plano de Trabalho/)), it_("apresentacao:modelo-proposta")?.situacao === "localizado"),
    esperado: "acerto", // M1: obrigação de quem executa virou R (decisão 0034)
    origem: "regra",
    como: "O modelo obrigatório (Anexo I) também vira requisito de apresentação, com os quadros do anexo.",
  },
  "RQ-14": {
    situacao: () => s(Boolean(req(/Curr[ií]culos/))),
    esperado: "falta",
    origem: "regra",
    como: '"deverão ser apresentados conforme modelo do Anexo": cada anexo-modelo exigido vira requisito de apresentação.',
  },
  "RQ-15": {
    situacao: () => s(Boolean(req(/03 \(tr[eê]s\) fornecedores/))),
    esperado: "falta",
    origem: "regra",
    como: 'Quantidade com unidade "fornecedores" ou "orçamentos" na seção de proposta.',
  },
  "RQ-16": {
    situacao: () => s(Boolean(req(/gratuita/))),
    esperado: "acerto", // M1: obrigação de quem executa virou R (decisão 0034)
    origem: "regra",
    como: 'Obrigações da parceira na minuta ("Compete à PARCEIRA") viram requisitos de execução.',
  },
  "RQ-17": {
    situacao: () => s(Boolean(req(/formato aberto/))),
    esperado: "acerto", // M1: obrigação de quem executa virou R (decisão 0034)
    origem: "regra",
    como: 'Mesmo caminho: obrigações da parceira na minuta; "disponibilizar… o conteúdo" é entrega.',
  },
  "RQ-18": {
    situacao: () => s(Boolean(req(/formul[aá]rios/))),
    esperado: "falta",
    origem: "regra",
    como: "Obrigação da parceira na minuta.",
  },
  "RQ-19": {
    situacao: () => s(Boolean(req(/a[cç][aã]o de FOMENTO/i))),
    esperado: "falta",
    origem: "regra",
    como: "Obrigação de divulgação na minuta.",
  },
  "RQ-20": {
    situacao: () => s(Boolean(req(/pesquisa de mercado/))),
    esperado: "falta",
    origem: "regra",
    como: "Obrigação na minuta (aquisições com três orçamentos).",
  },

  "PZ-01": {
    situacao: () =>
      s(a.itens.some((i) => i.secao === "prazos" && /publica[cç][aã]o do edital/i.test(i.nome))),
    esperado: "falta",
    origem: "regra",
    como: 'Quando um prazo conta da publicação e a data não está no documento, criar o item "Publicação do edital: não informado no documento — a definir pelo GP".',
  },
  "PZ-02": {
    situacao: () => s(Boolean(it_("prazos:certame:entrega:contado:30-corridos"))),
    esperado: "acerto",
  },
  "PZ-03": { situacao: () => s(prefixo("prazos:esclarecimento").length > 0), esperado: "acerto" },
  "PZ-04": {
    situacao: () => s(prefixo("prazos:").some((i) => /48/.test(i.texto))),
    esperado: "falta",
    origem: "regra",
    como: 'Prazos em horas ("48 (quarenta e oito) horas").',
  },
  "PZ-05": {
    situacao: () => s(Boolean(it_("prazos:certame:resultado:contado:25-úteis"))),
    esperado: "acerto",
  },
  "PZ-06": {
    situacao: () =>
      s(
        /17/.test(it_("prazos:certame:recursos:contado:5-úteis")?.texto ?? ""),
        Boolean(it_("prazos:certame:recursos:contado:5-úteis")),
      ),
    esperado: "parcial",
    origem: "regra",
    como: 'Juntar a hora limite ("até às 17h00 do último dia") ao prazo do mesmo evento.',
  },
  "PZ-07": {
    situacao: () => s(prefixo("prazos:").some((i) => /^6\.10\.1/.test(i.origem?.trecho ?? ""))),
    esperado: "falta",
    origem: "regra",
    como: "Não juntar prazos do mesmo evento com o mesmo valor quando o responsável muda (participante × Comissão).",
  },
  "PZ-08": {
    situacao: () => s(Boolean(it_("prazos:certame:documentos:contado:5-úteis"))),
    esperado: "acerto",
  },
  "PZ-09": {
    situacao: () => s(prefixo("prazos:").some((i) => /^7\.3\.2/.test(i.origem?.trecho ?? ""))),
    esperado: "falta",
    origem: "regra",
    como: 'Evento "análise da documentação" nos prazos contados.',
  },
  "PZ-10": {
    situacao: () => s(prefixo("prazos:").some((i) => /90/.test(i.texto))),
    esperado: "falta",
    origem: "regra",
    como: 'Validade de documentos ("prazo de validade de N dias a contar da expedição").',
  },
  "PZ-11": {
    situacao: () => s(prefixo("prazos:").some((i) => /^7\.4\.1/.test(i.origem?.trecho ?? ""))),
    esperado: "falta",
    origem: "regra",
    como: 'Prazo de regularização ("no prazo de N dias úteis, sob pena de").',
  },
  "PZ-12": { situacao: () => s(Boolean(it_("prazos:execucao:assinatura:10 dias"))), esperado: "acerto" },
  "PZ-13": { situacao: () => s(Boolean(it_("prazos:execucao:vigencia:12 meses"))), esperado: "acerto" },
  "PZ-14": {
    situacao: () => s(prefixo("prazos:").some((i) => /extrato/i.test(i.nome))),
    esperado: "falta",
    origem: "regra",
    como: "Prazos da minuta (anexo) como prazos da execução: publicação do extrato.",
  },
  "PZ-15": {
    situacao: () => s(prefixo("prazos:").some((i) => /trimestral/i.test(i.texto))),
    esperado: "falta",
    origem: "regra",
    como: 'Periodicidade ("trimestralmente, semestralmente") da prestação de contas.',
  },
  "PZ-16": {
    situacao: () =>
      s(prefixo("prazos:").some((i) => /encerramento|t[eé]rmino/i.test(i.origem?.trecho ?? ""))),
    esperado: "falta",
    origem: "regra",
    como: '"N dias antes do término" na minuta.',
  },
  "PZ-17": {
    situacao: () => s(prefixo("prazos:").some((i) => /150|45/.test(i.texto))),
    esperado: "falta",
    origem: "regra",
    como: "Prazos da prestação de contas na minuta.",
  },
  "PZ-18": {
    situacao: () => s(prefixo("prazos:").some((i) => /60/.test(i.texto))),
    esperado: "falta",
    origem: "regra",
    como: "Aviso prévio de denúncia e devolução de saldo na minuta.",
  },
  "PZ-19": {
    situacao: () => s(prefixo("prazos:").some((i) => /10 anos/.test(i.texto))),
    esperado: "falta",
    origem: "regra",
    como: "Guarda de documentos em anos.",
  },

  "JG-01": {
    situacao: () => s(/60 pontos.*40/.test(it_("julgamento:criterio")?.texto ?? "")),
    esperado: "acerto",
  },
  "JG-02": { situacao: () => s(prefixo("julgamento:criterio-pontuado:").length === 13), esperado: "acerto" },
  "JG-03": {
    situacao: () =>
      s(
        a.itens.some(
          (i) => i.secao === "julgamento" && /exclus[aã]o direta|eliminat/i.test(`${i.nome} ${i.texto}`),
        ),
      ),
    esperado: "falta",
    origem: "regra",
    como: '"critérios de exclusão direta" / "eliminatório" com as letras citadas.',
  },
  "JG-04": {
    situacao: () =>
      s(a.itens.some((i) => i.secao === "julgamento" && /desempate/i.test(`${i.nome} ${i.texto}`))),
    esperado: "falta",
    origem: "regra",
    como: "Frase de desempate.",
  },
  "JG-05": {
    situacao: () => s(a.itens.some((i) => i.secao === "julgamento" && /incompat/i.test(i.texto))),
    esperado: "falta",
    origem: "regra",
    como: '"Serão eliminadas as propostas:" com as alíneas.',
  },

  ...Object.fromEntries(
    (
      [
        ["HB-01", "habilitacao:cnpj", "acerto"],
        ["HB-02", "habilitacao:fazenda-federal", "acerto"],
        ["HB-03", "habilitacao:fgts", "acerto"],
        ["HB-04", "habilitacao:fazenda-municipal", "acerto"],
        ["HB-08", "habilitacao:ato-constitutivo", "acerto"],
        ["HB-09", "habilitacao:osc-dirigentes", "acerto"],
        ["HB-15", "habilitacao:menor", "acerto"],
        ["HB-17", "habilitacao:osc-experiencia", "parcial"],
        ["HB-18", "habilitacao:osc-estatuto", "acerto"],
      ] as const
    ).map(([g, id, esperado]) => [
      g,
      {
        situacao: (): Situacao =>
          id === "habilitacao:osc-experiencia"
            ? s(/^20 /.test(it_(id)?.origem?.trecho ?? ""), Boolean(it_(id)))
            : s(it_(id)?.situacao === "localizado"),
        esperado,
        ...(esperado === "parcial"
          ? { origem: "regra" as const, como: "Preferir o item da Tabela 04 (lista) à condição 4.1 e." }
          : {}),
      },
    ]),
  ),
  ...Object.fromEntries(
    ["HB-05", "HB-06", "HB-07", "HB-10", "HB-11", "HB-12", "HB-13", "HB-14", "HB-16", "HB-19"].map((g) => [
      g,
      {
        situacao: (): Situacao => "falta",
        esperado: "falta" as const,
        origem: "regra" as const,
        como: 'Ler a tabela "DOCUMENTAÇÃO OBRIGATÓRIA" linha a linha (item numerado = um documento), em vez de procurar só o catálogo de 31 documentos.',
      },
    ]),
  ),

  "CD-01": {
    situacao: () =>
      s(
        /parcela [uú]nica/i.test(it_("condicoes:pagamento")?.texto ?? ""),
        Boolean(it_("condicoes:pagamento")),
      ),
    esperado: "parcial",
    origem: "regra",
    como: 'No tema pagamento da parceria, procurar "parcela única" e "cronograma de desembolso" antes de "pagamento" genérico.',
  },
  "CD-02": {
    situacao: () => s(a.itens.some((i) => i.secao === "condicoes" && /poupan|conta espec/i.test(i.texto))),
    esperado: "falta",
    origem: "regra",
    como: 'Tema "movimentação dos recursos" na parceria.',
  },
  "CD-03": {
    situacao: () => s(a.itens.some((i) => /contrapartida/i.test(i.nome))),
    esperado: "falta",
    origem: "regra",
    como: 'Tema "contrapartida" (exigida ou "se houver").',
  },
  "CD-04": {
    situacao: () =>
      s(a.itens.some((i) => i.secao === "condicoes" && /remanejamento|remunera/i.test(i.texto))),
    esperado: "falta",
    origem: "ia",
    como: "Despesas admitidas e vedadas espalhadas no edital e na minuta: leitura.",
  },
  "CD-05": {
    situacao: () => s(/advert[eê]ncia/.test(it_("condicoes:penalidades")?.texto ?? "")),
    esperado: "acerto",
  },
  "CD-06": {
    situacao: () => s(it_("condicoes:garantia-execucao")?.situacao === "nao-se-aplica"),
    esperado: "acerto",
  },
  "CD-07": {
    situacao: () => s(a.itens.some((i) => /glos/i.test(i.texto))),
    esperado: "falta",
    origem: "regra",
    como: 'Padrão "serão glosados".',
  },
  "CD-08": {
    situacao: () => s(it_("condicoes:recebimento")?.situacao === "localizado"),
    esperado: "falta",
    origem: "ia",
    como: "Ver a prestação de contas final como o análogo do aceite pede leitura (outra figura jurídica).",
  },
  "CD-09": { situacao: () => s(it_("condicoes:extincao")?.situacao === "localizado"), esperado: "acerto" },
  "CD-10": {
    situacao: () => s(a.itens.some((i) => /bens remanescentes/i.test(i.texto))),
    esperado: "falta",
    origem: "regra",
    como: 'Padrão "bens remanescentes".',
  },
  "CD-11": {
    situacao: () => s(it_("condicoes:subcontratacao")?.situacao === "localizado"),
    esperado: "falta",
    origem: "ia",
    como: 'Sem a palavra "subcontratação", reconhecer contratação de terceiros com recursos da parceria pede leitura.',
  },
  "CD-12": {
    situacao: () =>
      s(
        it_("condicoes:dados")?.situacao !== "localizado" &&
          it_("condicoes:propriedade")?.situacao !== "localizado",
      ),
    esperado: "falta",
    origem: "regra",
    como: '"Dados Pessoais" no modelo de currículo (Anexo II) não é cláusula de LGPD: exigir LGPD, 13.709 ou "proteção de dados", ou ignorar os anexos-modelo.',
  },

  "PT-01": { situacao: () => s(it_("partes:contratante")?.situacao === "localizado"), esperado: "acerto" },
  "PT-02": {
    situacao: () => s(/Comiss[aã]o de Sele[cç][aã]o/.test(it_("partes:conduz")?.texto ?? "")),
    esperado: "acerto",
  },
  "PT-03": {
    situacao: () =>
      s(
        a.itens.some(
          (i) =>
            i.secao === "partes" &&
            /COPPI|Coordena[cç][aã]o de Pol[ií]ticas e Projetos de Inclus[aã]o/.test(i.texto),
        ),
      ),
    esperado: "acerto",
  },
  "PT-04": {
    situacao: () => s(it_("partes:gestor")?.origem?.pagina === 22, Boolean(it_("partes:gestor"))),
    esperado: "parcial",
    origem: "regra",
    como: '"A gestão da parceria será exercida por intermédio de" na minuta: o gestor já vem designado.',
  },
  "PT-05": {
    situacao: () => s(prefixo("partes:unidade").some((i) => /Monitoramento e Avalia/.test(i.texto))),
    esperado: "falta",
    origem: "regra",
    como: '"Comissão de …" como parte citada (nome próprio com "Comissão de").',
  },
  "PT-06": {
    situacao: () => s(a.itens.some((i) => i.secao === "partes" && /Chefia de Gabinete/.test(i.texto))),
    esperado: "falta",
    origem: "regra",
    como: '"Chefia de Gabinete" no catálogo de unidades.',
  },
  "PT-07": { situacao: () => s(it_("partes:publico")?.situacao === "localizado"), esperado: "acerto" },
  "PT-08": {
    situacao: () =>
      s(
        a.itens.some((i) => i.secao === "partes" && /Conselho Municipal da Pessoa com Defici/.test(i.texto)),
        a.itens.some((i) => i.secao === "partes" && /Conselho Municipal/.test(i.texto)),
      ),
    esperado: "parcial",
    origem: "regra",
    como: 'O nome do órgão termina na sigla ("- CMPD") ou na quebra de linha, não no meio ("Conselho Municipal da Pessoa").',
  },

  ...Object.fromEntries(
    (
      [
        ["BR-01", "ia", "Contradição entre itens distantes (parcela única × empenho proporcional): leitura."],
        [
          "BR-02",
          "regra",
          'Prazo contado de um marco sem data no documento vira pergunta ("informar a data de publicação").',
        ],
        [
          "BR-03",
          "regra",
          'Padrões "não obriga a Administração" e "disponibilidade orçamentária" sem valor global.',
        ],
        ["BR-04", "ia", 'Critério aberto de elegibilidade ("evidente continuidade"): leitura.'],
        [
          "BR-05",
          "regra",
          'CE15 para parcerias: prazo de execução contado de publicação que pode atrasar ("até 30 dias da assinatura").',
        ],
        ["BR-06", "regra", 'Padrões "denunciação da lide" e "polo passivo" (transfere responsabilidade).'],
        ["BR-07", "regra", 'Padrões "a juízo da Administração" e "cancelada" sem hipótese.'],
        ["BR-08", "ia", "Cruzar as condições de participação com a lista de documentos: leitura."],
        [
          "BR-09",
          "regra",
          "A mesma norma com anos diferentes no documento (o código já conta as normas citadas).",
        ],
        ["BR-10", "regra", 'Ampliar o vago "a definir" para "a serem definidos pela".'],
        ["BR-11", "ia", "Referência a uma estimativa que o documento não traz: leitura."],
        ["BR-12", "regra", 'Padrão "não suspendem os prazos".'],
      ] as const
    ).map(([g, origem, como]) => [
      g,
      {
        situacao: (): Situacao => "falta",
        esperado: "falta" as const,
        origem,
        como,
      },
    ]),
  ),
};

describe("gabarito do PMO da etapa 1 (chamamento SMPED)", () => {
  it("toda citação do gabarito é achada pelo código do app", () => {
    const naoConferidas = gabarito.itens.flatMap((i) =>
      i.fontes
        .map((f) => ({ id: i.id, f, r: conferirCitacao(f, [doc]) }))
        .filter((x) => !citacaoValeComoFato(x.r) || x.r.pagina !== x.f.pagina),
    );
    expect(naoConferidas.map((x) => `${x.id} p. ${x.f.pagina}: ${x.r.estado} ${x.r.pagina ?? ""}`)).toEqual(
      [],
    );
  });

  it("todo item do gabarito tem comparação, e quem não acerta tem origem", () => {
    for (const i of gabarito.itens) {
      const c = COMPARACAO[i.id];
      expect(c, i.id).toBeDefined();
      if (c?.esperado !== "acerto") expect(c?.origem, i.id).toBeDefined();
    }
  });

  it("linha de base da v0.8.1: cada item tem a situação registrada", () => {
    const diferentes = gabarito.itens
      .map((i) => ({ id: i.id, agora: COMPARACAO[i.id]?.situacao(), esperado: COMPARACAO[i.id]?.esperado }))
      .filter((x) => x.agora !== x.esperado);
    expect(diferentes).toEqual([]);
  });

  it("o app não marca como brecha o que o gabarito diz que não é", () => {
    const brechas = a.itens.filter((i) => i.secao === "brechas");
    for (const n of gabarito.naoSaoBrechas)
      expect(
        brechas.some((b) => b.origem?.pagina === n.pagina && b.origem.trecho.includes(n.trecho.slice(0, 30))),
      ).toBe(false);
  });
});

export { COMPARACAO };
