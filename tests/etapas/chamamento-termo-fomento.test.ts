// Etapa 1 sobre o chamamento público para termo de fomento da SMPED/SP (Lei 13.019/2014): uma parceria com
// organização da sociedade civil, não uma licitação. Um bloco por ponto da correção v0.8.1; os valores
// esperados foram conferidos à mão no texto do edital.
import { beforeAll, describe, expect, it } from "vitest";
import { criarDossieVazio } from "../../src/dossie/arquivo";
import type { DocumentoLido } from "../../src/dossie/esquema";
import { analisarRfp, type AnaliseRfp } from "../../src/etapas/1-rfp/analisar-rfp";
import { analiseInicial } from "../../src/etapas/1-rfp/revisao";
import { larguraMinima, planejarTabelas } from "../../src/exportacao/larguras";
import { montarAnaliseRfp } from "../../src/exportacao/relatorio-rfp";
import { lerRfpPublica } from "../ajudantes/rfp-publica";

const HOJE = new Date(2026, 10, 13);
let doc: DocumentoLido;
let a: AnaliseRfp;

beforeAll(async () => {
  doc = await lerRfpPublica("chamamento-publico-termo-fomento-smped-sp-2025.pdf", HOJE);
  a = analisarRfp([doc], HOJE);
}, 120000);

const item = (id: string) => a.itens.find((i) => i.id === id);
const comPrefixo = (p: string) => a.itens.filter((i) => i.id.startsWith(p));

describe("modalidade: parceria (termo de fomento), não licitação", () => {
  it("reconhece o termo de fomento e a Lei 13.019/2014", () => {
    expect(item("identificacao:parceria")?.texto).toBe("Termo de fomento (Lei 13.019/2014)");
    expect(item("identificacao:parceria")?.origem?.pagina).toBe(1);
  });
});

describe("1. requisitos", () => {
  it("ignora o campo em branco do formulário do Anexo I", () => {
    for (const r of a.requisitosDoCodigo) {
      expect(r.descricao).not.toMatch(/Nome do Projeto:|Local de realização:/);
      expect(r.pagina).toBeLessThan(10);
    }
  });

  it("acha 1.2, 1.4, 1.5, 1.9, 1.10 e 2.3, todos na p. 1", () => {
    const porItem = (n: string) => a.requisitosDoCodigo.find((r) => r.descricao.startsWith(`${n} `));
    expect(porItem("1.2")?.rotulo).toBe("Público-alvo");
    expect(porItem("1.4")?.rotulo).toBe("Quantidade: 15 projetos");
    expect(porItem("1.5")?.rotulo).toBe("Limite por proponente");
    expect(porItem("1.9")?.rotulo).toBe("Prazo de execução");
    expect(porItem("1.10")?.rotulo).toBe("Forma de execução");
    expect(porItem("2.3")?.rotulo).toBe("Acessibilidade");
    for (const n of ["1.2", "1.4", "1.5", "1.9", "1.10", "2.3"]) expect(porItem(n)?.pagina).toBe(1);
    expect(a.requisitosDoCodigo.map((r) => r.numero)).toEqual(["R01", "R02", "R03", "R04", "R05", "R06"]);
  });
});

describe("2. prazos", () => {
  it("prazo de execução de 12 meses (p. 1) e vigência de 12 meses", () => {
    const execucao = item("prazos:execucao:execucao:12 meses");
    expect(execucao?.origem?.pagina).toBe(1);
    expect(execucao?.origem?.trecho).toMatch(/^1\.9 /);
    expect(item("prazos:execucao:vigencia:12 meses")).toBeDefined();
  });

  it("6.5.5, 6.6.2, 6.9.1 e 7.2.1, contados de um marco sem data", () => {
    const entrega = item("prazos:certame:entrega:contado:30-corridos");
    expect(entrega?.texto).toBe("em até 30 (trinta) dias corridos após a publicação do edital");
    expect(entrega?.origem?.trecho).toMatch(/^6\.5\.5 /);
    const resultado = item("prazos:certame:resultado:contado:25-úteis");
    expect(resultado?.texto).toMatch(
      /25 \(vinte e cinco\) dias úteis contados do fim do prazo de inscrição$/,
    );
    expect(resultado?.origem?.trecho).toMatch(/^6\.6\.2 /);
    const recurso = item("prazos:certame:recursos:contado:5-úteis");
    expect(recurso?.texto).toBe("no prazo de 05 (cinco) dias úteis contados da publicação da decisão");
    expect(recurso?.origem?.trecho).toMatch(/^6\.9\.1 /);
    const documentos = item("prazos:certame:documentos:contado:5-úteis");
    expect(documentos?.texto).toBe(
      "em até 05 (cinco) dias úteis após publicação no Diário Oficial do Município",
    );
    expect(documentos?.origem?.trecho).toMatch(/^7\.2\.1 /);
  });

  it("os prazos da minuta (Anexo VII) não entram como prazos do certame", () => {
    for (const i of comPrefixo("prazos:certame:")) expect(i.origem?.pagina).toBeLessThan(10);
  });

  it("esclarecimento: 5 dias úteis antes da data limite (10.2)", () => {
    expect(comPrefixo("prazos:esclarecimento")[0]?.texto).toBe(
      "até 5 dias úteis antes da data limite para envio do projeto",
    );
  });

  it("a CE17 não diz que falta o prazo de execução: diz que falta a data do certame", () => {
    const ce17 = a.regras.find((r) => r.regra === "CE17");
    expect(ce17?.motivo).not.toMatch(/^prazo de execução em número/);
    expect(ce17?.motivo).toMatch(/12 meses, RFP, p\. 1/);
  });
});

describe("3. julgamento", () => {
  it("pontuação como critério: 13 critérios, máximo 60, mínimo 40", () => {
    expect(item("julgamento:criterio")?.texto).toBe(
      "Pontuação por critérios: 13 critérios (A a M), máximo de 60 pontos, mínimo de 40 para não ser eliminada",
    );
    expect(item("julgamento:pontuacao-maxima")?.texto).toMatch(/^60 pontos; .* dá 60 \(confere\)$/);
    expect(item("julgamento:pontuacao-minima")?.campos?.Pontos).toBe("40");
  });

  it("critério e coluna de níveis separados, com a pontuação máxima de cada um", () => {
    const criterios = comPrefixo("julgamento:criterio-pontuado:");
    expect(criterios.map((c) => c.nome)).toEqual("ABCDEFGHIJKLM".split("").map((l) => `Critério (${l})`));
    const maximos = Object.fromEntries(criterios.map((c) => [c.nome.slice(-2, -1), c.campos?.Pontos]));
    expect(maximos).toMatchObject({ A: "5", C: "3", H: "2", M: "5" });
    for (const c of criterios) {
      // nenhum pedaço da coluna REGULAR/PARCIAL/IRREGULAR no texto do critério
      expect(c.texto).not.toMatch(/REGULAR|PARCIAL|pontos?:|atendimento do critério/);
      expect(c.campos?.Níveis).toMatch(/^REGULAR \d; (?:PARCIAL \d; )?IRREGULAR 0$/);
    }
    expect(item("julgamento:criterio-pontuado:A")?.texto).toBe(
      "Apresentação do Plano de Trabalho em conformidade com o modelo deste Edital.",
    );
    expect(item("julgamento:criterio-pontuado:G")?.texto).toBe(
      "Demonstração de conhecimento e compreensão da vulnerabilidade social dos beneficiários diretos e/ou indiretos.",
    );
    // as linhas soltas "IRREGULAR – 0 pontos" não viram itens
    expect(comPrefixo("julgamento:pontuacao:")).toHaveLength(0);
  });
});

describe("4. termo de fomento: o que vale e o que não se aplica", () => {
  it("a fase de celebração conta como habilitação", () => {
    const celebracao = a.mapa.secoes.find((s) => /FASE DE CELEBRAÇÃO/.test(s.titulo));
    expect(celebracao?.tema).toBe("habilitacao");
  });

  it("o Plano de Trabalho é o modelo de proposta (6.5.6)", () => {
    const modelo = item("apresentacao:modelo-proposta");
    expect(modelo?.situacao).toBe("localizado");
    expect(modelo?.origem?.trecho).toMatch(/^6\.5\.6 O Plano de Trabalho/);
  });

  it("as sanções da Cláusula 11ª contam como penalidades", () => {
    const pen = item("condicoes:penalidades");
    expect(pen?.situacao).toBe("localizado");
    expect(pen?.origem?.trecho).toMatch(/DAS SANÇÕES/);
    expect(pen?.texto).toMatch(/advertência/);
    expect(pen?.texto).toMatch(/inidoneidade/);
    expect(pen?.texto).toMatch(/sem multa/);
  });

  it("garantia, reajuste, matriz de riscos e sessão pública: não se aplica, não 'não localizado'", () => {
    for (const id of [
      "condicoes:garantia-execucao",
      "condicoes:reajuste",
      "condicoes:matriz-riscos",
      "prazos:sem:sessao",
    ]) {
      expect(item(id)?.situacao, id).toBe("nao-se-aplica");
      expect(item(id)?.texto, id).toBe("não se aplica a esta modalidade — conferir no documento");
    }
  });
});

describe("5. habilitação: só a lista de documentos", () => {
  it("Fazenda Municipal aponta o item 4 da Tabela 04, não a cláusula 3.3.10 da minuta", () => {
    const fm = item("habilitacao:fazenda-municipal");
    expect(fm?.origem?.trecho).toBe(
      "4 Certidão Negativa de Tributos Mobiliários relativos ao Município de São Paulo;",
    );
    expect(fm?.origem?.pagina).toBe(6);
  });

  it("a justificativa sobre pessoa com deficiência não vira declaração de reserva de cargos", () => {
    expect(item("habilitacao:pcd")).toBeUndefined();
  });

  it("todo trecho de habilitação está na seção de participação ou na fase de celebração (p. 2 a 8)", () => {
    const hab = comPrefixo("habilitacao:");
    expect(hab.length).toBeGreaterThanOrEqual(8);
    for (const h of hab) {
      expect(h.origem?.pagina, h.id).toBeGreaterThanOrEqual(2);
      expect(h.origem?.pagina, h.id).toBeLessThanOrEqual(8);
    }
    // o trecho começa no item da lista, não no item anterior
    expect(item("habilitacao:ato-constitutivo")?.origem?.trecho).toMatch(/^10 Estatuto Social/);
    expect(item("habilitacao:fgts")?.origem?.trecho).toMatch(/^3 FGTS/);
  });
});

describe("6. brechas", () => {
  it("não marca 'eventualmente' na cláusula de foro", () => {
    const vagos = comPrefixo("brechas:vago:eventualmente");
    expect(vagos.some((v) => /foro/i.test(v.origem?.trecho ?? ""))).toBe(false);
  });

  it("não marca o 'eventualmente' do 1.1 (incorporação futura pela rede pública)", () => {
    expect(comPrefixo("brechas:vago:eventualmente")).toHaveLength(0);
  });

  it("não marca 'entre outras' nas atribuições do gestor da parceria", () => {
    expect(comPrefixo("brechas:vago:entre-outros")).toHaveLength(0);
  });
});

describe("7. PDF exportado", () => {
  function documento() {
    const d = criarDossieVazio();
    d.projeto.nome = "Teste";
    d.documentos.push(doc);
    d.analiseRfp = analiseInicial(a, HOJE);
    return montarAnaliseRfp(d, a, HOJE);
  }

  it("nenhuma coluna fica mais estreita que a sua palavra mais longa", () => {
    const exportavel = documento();
    const tabelas = exportavel.secoes.flatMap((s) => (s.tabela ? [s.tabela] : []));
    const plano = planejarTabelas(tabelas);
    tabelas.forEach((t, k) => {
      t.colunas.forEach((c, i) => {
        const minima = larguraMinima([c, ...t.linhas.map((l) => l[i] ?? "")], plano.corpo);
        expect(plano.larguras[k]?.[i], `${c}`).toBeGreaterThanOrEqual(minima - 0.01);
      });
    });
  });

  it("rótulos curtos e trechos repetidos cortados", () => {
    const exportavel = documento();
    const linhas = exportavel.secoes.flatMap((s) => s.tabela?.linhas ?? []);
    const celulas = linhas.flat();
    expect(celulas).not.toContain("Do documento");
    expect(celulas).toContain("Documento");
    // a habilitação traz o trecho como conteúdo: não repete na coluna da origem
    const fm = linhas.find((l) => l[0] === "Regularidade com a Fazenda Municipal");
    expect(fm?.join(" | ")).toMatch(/RFP, p\. 6 \(o trecho é o conteúdo\)/);
    // a legislação citada na mesma frase da abertura: o trecho sai uma vez só
    const leis = linhas.filter((l) => l[0] === "Legislação citada");
    expect(leis.filter((l) => l.some((c) => /mesmo trecho da linha de cima/.test(c))).length).toBeGreaterThan(
      0,
    );
  });
});
