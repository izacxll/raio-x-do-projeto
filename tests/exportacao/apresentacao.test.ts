// Resultado no padrão de apresentação da FGV Projetos (decisão 0089): rótulos fora das linhas, decisões no quadro,
// marcas no anexo de revisão, termos internos só no anexo técnico, capa com destaques, sumário e legendas.
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import {
  apresentar,
  lerItem,
  limparTermosInternos,
  secaoTecnica,
  sinalNoCorpo,
} from "../../src/exportacao/apresentacao";
import { contar, corrigirPlurais, plural } from "../../src/texto/plural";
import { gerarDocx } from "../../src/exportacao/docx";
import { duracaoCurta, type CapaDeDecisao } from "../../src/exportacao/capa-de-decisao";
import type { DocumentoExportavel } from "../../src/exportacao/modelo";

const logo = readFileSync(new URL("../../src/interface/ativos/logo-fgv-projetos.jpg", import.meta.url));
const logoBuffer = logo.buffer.slice(logo.byteOffset, logo.byteOffset + logo.byteLength) as ArrayBuffer;

describe("leitura das linhas de item", () => {
  it("do documento: a referência discreta no fim, sem o rótulo", () => {
    const i = lerItem("[Do documento, p. 4] O prazo é de 30 dias.", "TR")!;
    expect(i.rotulo).toBe("documento");
    expect(i.referencia).toBe("TR, p. 4");
    expect(i.texto).toBe("O prazo é de 30 dias.");
    expect(lerItem("[Do documento, proposta, p. 3] Texto.", "TR")!.referencia).toBe("proposta, p. 3");
  });

  it("marcas e avisos saem do texto", () => {
    const i = lerItem(
      "○◊ [Sugestão] Sugere-se reunião mensal. (número sem fonte — conferir: 12 meses)",
      "TR",
    )!;
    expect(i.marcas).toBe("○◊");
    expect(i.avisos).toEqual(["número sem fonte — conferir: 12 meses"]);
    expect(i.texto).toBe("Sugere-se reunião mensal.");
  });

  it("decisão do GP e número C", () => {
    expect(lerItem("[Decisão do GP] Valor-hora do coordenador.", "TR")!.rotulo).toBe("decisao");
    expect(lerItem("○ C04 — [Sugestão] Exclusão de viagens.", "TR")!.numero).toBe("C04");
    expect(lerItem("Texto corrido sem rótulo.", "TR")).toBeUndefined();
  });
});

describe("o que a revisão alta apontou (decisão 0089)", () => {
  it("o item com aviso guarda no corpo um sinal curto, e sem página a citação é não verificável", () => {
    const i = lerItem("[Do documento, p. 4] Prazo de 30 dias. (número sem fonte — conferir: 30)", "TR")!;
    expect(sinalNoCorpo(i)).toBe("valor não conferido");
    expect(lerItem("[Do documento] Texto.", "TR")!.referencia).toBe("não verificável");
    expect(lerItem("[Do documento, proposta] Texto.", "TR")!.referencia).toBe("proposta, não verificável");
  });

  it("o trecho do documento fica como está; lei e unidade não viram termo do app", () => {
    expect(lerItem("[Do documento, p. 2] Conforme o código civil.", "TR")!.texto).toBe(
      "Conforme o código civil.",
    );
    expect(limparTermosInternos("Conforme o Código Civil e o código de defesa do consumidor.")).toBe(
      "Conforme o Código Civil e o código de defesa do consumidor.",
    );
    expect(limparTermosInternos("Área de 40 (m2).")).toBe("Área de 40 (m2).");
    expect(limparTermosInternos("O código não achou o prazo.")).toBe("A ferramenta não achou o prazo.");
  });

  it("plural pela quantidade, sem parênteses", () => {
    expect(contar(1, "decisão", "decisões")).toBe("1 decisão");
    expect(contar(0, "item", "itens")).toBe("0 itens");
    expect(contar(6, "decisão", "decisões")).toBe("6 decisões");
    expect(plural(1.5, "ponto", "pontos")).toBe("ponto");
    // texto pronto da pasta do caso (placar, conferência)
    expect(
      corrigirPlurais("14 item(ns) marcados; folga 7 dia(s) corrido(s); 1 linha(s); 3 decisão(ões)"),
    ).toBe("14 itens marcados; folga 7 dias corridos; 1 linha; 3 decisões");
    expect(corrigirPlurais("2 dia(s) útil(eis) e 2 aceitável(is)")).toBe("2 dias úteis e 2 aceitáveis");
  });
});

describe("o que a segunda revisão alta apontou (decisão 0089)", () => {
  it("decisão em aberto sem a marca vai ao quadro e o documento continua minuta", () => {
    const d = apresentar(
      { ...base(), minuta: false },
      [{ titulo: "1. Preço", paragrafos: ["[Decisão do GP] Preço: valor final a definir pelo GP."] }],
      [],
      { nomeDaRfp: "TR", tituloDoEstudo: "Estudo", etapa: 2, nomeDaEtapa: "Proposta", destaques: [] },
    );
    const s = d.secoes.find((x) => x.titulo === "1. Preço")!;
    expect(s.decisoes?.map((x) => x.decisao)).toEqual(["Preço: valor final a definir pelo GP"]);
    expect(s.paragrafos).toEqual([]);
    expect(d.minuta).toBe(true);
  });

  it("ids de um dígito saem, unidades e 'código de conduta' ficam", () => {
    expect(limparTermosInternos("Depois da análise do contratante (a5), mas antes (c4, c5).")).toBe(
      "Depois da análise do contratante, mas antes.",
    );
    expect(limparTermosInternos("Área de 40 (m2) e 3 (km2).")).toBe("Área de 40 (m2) e 3 (km2).");
    expect(limparTermosInternos("Segue o código de conduta.")).toBe("Segue o código de conduta.");
  });

  it("item da ferramenta sem página não ganha 'não verificável'; plural com milhar; duração ancorada", () => {
    const i = lerItem("[Do documento] Critérios não localizados pelo código — conferir no documento.", "TR")!;
    expect(i.referencia).toBeUndefined();
    expect(i.texto).toBe("Critérios não localizados pela ferramenta — conferir no documento.");
    expect(corrigirPlurais("1.000.001 item(ns)")).toBe("1.000.001 itens");
    expect(duracaoCurta("assinatura em até 5 dias; vigência de 12 meses")).toBe("12 meses");
    expect(duracaoCurta("prazo de 3 anos e 6 meses")).toBe("3 anos e 6 meses");
  });
});

describe("termos internos", () => {
  it("código vira ferramenta, dossiê vira arquivo do projeto e os ids entre parênteses saem", () => {
    expect(limparTermosInternos("Pela conta do código, o marco cabe (a5_3, QU-09).")).toBe(
      "Pelo cálculo da ferramenta, o marco cabe.",
    );
    expect(limparTermosInternos("Guardado no dossiê.")).toBe("Guardado no arquivo do projeto.");
  });

  it("seções do funcionamento do app vão para o anexo técnico", () => {
    expect(secaoTecnica({ titulo: "Passo riscos: placar resumido" })).toBe(true);
    expect(secaoTecnica({ titulo: "Conferência do TAP (código)" })).toBe(true);
    expect(secaoTecnica({ titulo: "Pontos de atenção" })).toBe(false);
  });
});

const capa: CapaDeDecisao = {
  etapa: 2,
  oQueE: "Etapa 2, proposta.",
  decidir: ["Escolher a abordagem técnica.", "Valores do preço."],
  numeros: [{ rotulo: "Produtos", valor: "3" }],
  alertas: [{ nivel: "alto", texto: "O código não achou o prazo." }],
  mudou: ["Abordagem escolhida."],
  quadros: [{ titulo: "Equipe", tabela: { colunas: ["Perfil", "Horas"], linhas: [["Coordenação", "120"]] } }],
  destaques: [{ valor: "3", rotulo: "Produtos" }],
};

function base(): DocumentoExportavel {
  return {
    titulo: "Resultado da etapa 2",
    projeto: "Estudo inventado",
    minuta: true,
    geradoEm: new Date(2026, 10, 18),
    versaoApp: "0.0.0",
    versaoSkill: "0.3.7",
    secoes: [],
  };
}

describe("o documento apresentado", () => {
  const corpo = [
    {
      titulo: "1. Metodologia",
      paragrafos: [
        "[Sugestão] Sugere-se oficina de abertura.",
        "○ [Decisão do GP] Cadência das reuniões.",
        "[Do documento, p. 7] O relatório final é entregue no mês 6.",
      ],
    },
    { titulo: "Situação da minuta", paragrafos: ["12 pendências."] },
    {
      titulo: "2. Leitura",
      paragrafos: [],
      tabela: {
        colunas: ["Item", "Conteúdo", "Rótulo", "Estado"],
        linhas: [
          ["Prazo", "12 meses", "Do documento", "Aceito"],
          ["Reunião", "Sugere-se reunião mensal", "Sugestão", "○ Pendente"],
        ],
      },
    },
  ];
  const doc = apresentar(base(), corpo, [{ titulo: "Passo eap: placar resumido", parte: "anexo" as const }], {
    capa,
    nomeDaRfp: "TR",
    tituloDoEstudo: "Estudo inventado",
    etapa: 2,
    nomeDaEtapa: "Proposta",
    destaques: capa.destaques!,
  });

  it("o que decidir, quadros com legenda, corpo numerado e os dois anexos", () => {
    const titulos = doc.secoes.map((s) => s.titulo);
    expect(titulos[0]).toBe("1. O que decidir");
    expect(titulos).toContain("2. Resultado em quadros");
    expect(titulos).toContain("3. Metodologia");
    expect(doc.secoes.find((s) => s.titulo === "Equipe")?.tabela?.legenda).toBe("Tabela 2.1 – Equipe");
    expect(titulos).toContain("A. Revisão do GP: o que ainda está pendente");
    expect(titulos).toContain("B. Anexo técnico");
    // a seção do funcionamento do app foi para o anexo técnico
    expect(doc.secoes.find((s) => s.titulo === "Situação da minuta")?.parte).toBe("anexo");
  });

  it("no corpo: sem rótulo por linha, decisão no quadro, referência no fim e nota de sugestão", () => {
    const s = doc.secoes.find((x) => x.titulo === "3. Metodologia")!;
    expect(s.paragrafos).toEqual([
      "• Sugere-se oficina de abertura.",
      "• O relatório final é entregue no mês 6. (TR, p. 7)",
    ]);
    expect(s.decisoes?.map((d) => d.decisao)).toEqual(["Cadência das reuniões"]);
    expect(s.nota).toMatch(/sugerido pelo PMO/);
    expect(JSON.stringify(s)).not.toMatch(/\[Sugestão\]|\[Do documento|○/);
    // a marca foi para o anexo de revisão
    expect(doc.secoes.find((x) => x.titulo.startsWith("A. Revisão"))?.paragrafos?.join(" ")).toMatch(
      /3\. Metodologia — Cadência das reuniões: pendente de revisão do GP/,
    );
  });

  it("tabela do corpo: o rótulo fica, o estado sai e o pendente vai ao anexo de revisão", () => {
    const s = doc.secoes.find((x) => x.titulo === "4. Leitura")!;
    expect(s.tabela?.colunas).toEqual(["Item", "Conteúdo", "Rótulo"]);
    expect(s.nota).toMatch(/sugerido pelo PMO/);
    expect(doc.secoes.find((x) => x.titulo.startsWith("A. Revisão"))?.paragrafos?.join(" ")).toMatch(
      /4\. Leitura — Reunião: pendente de revisão do GP/,
    );
    expect(doc.minuta).toBe(true);
  });

  it("decisão sem dimensão clara não mostra impacto", () => {
    const d = doc.secoes.find((x) => x.titulo === "3. Metodologia")!.decisoes!;
    expect(d[0]!.impacto).toBeUndefined();
  });

  it("o alerta e as decisões da capa sem termo interno", () => {
    expect(JSON.stringify(doc.secoes[0])).not.toMatch(/código/);
  });

  it("DOCX: capa com o título e os destaques, sumário, legenda e rodapé com página n / total", async () => {
    const arquivos = unzipSync(new Uint8Array(await (await gerarDocx(doc, logoBuffer)).arrayBuffer()));
    const corpoXml = strFromU8(arquivos["word/document.xml"]!);
    expect(corpoXml).toContain("Estudo inventado");
    expect(corpoXml).toContain("SUMÁRIO");
    expect(corpoXml).toMatch(/TOC \\h \\o/);
    expect(corpoXml).toContain("PARA O GP DECIDIR");
    expect(corpoXml).toContain("Tabela 2.1 – Equipe");
    const rodape = Object.keys(arquivos)
      .filter((n) => /^word\/footer\d*\.xml$/.test(n))
      .map((n) => strFromU8(arquivos[n]!))
      .join("");
    expect(rodape).toMatch(/NUMPAGES/);
  });
});
