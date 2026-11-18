// Tamanho do pedido (decisão 0064): SKILL.md recortado por etapa, checklist só com as premissas críticas confirmadas
// a partir da etapa 2, fichas sem as linhas de fonte. Nenhum corte tira o que a etapa usa.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { conteudoDoPedido } from "./conteudo-do-pedido";
import {
  checklistDasPremissas,
  estimarTokens,
  fichasDasPartes,
  pcsConfirmadas,
  referenciasEtapa1,
  referenciasEtapa2,
  referenciasEtapa3,
  referenciasEtapa4,
  referenciasEtapa5,
  semFonte,
  skillDaEtapa,
  textoDeSistema,
} from "../../src/pmo/montagem";
import { sistemaDaSegundaInstancia } from "../../src/pmo/segunda-instancia";

describe("SKILL.md por etapa", () => {
  it("leva o papel, os princípios, a revisão em camadas, o formato e só a seção da etapa", () => {
    for (const etapa of [1, 2, 3, 4, 5]) {
      const s = skillDaEtapa(etapa);
      expect(s, `etapa ${etapa}`).toMatch(/## 1\. Papel/);
      expect(s, `etapa ${etapa}`).toMatch(/## 2\. Princípios inegociáveis/);
      expect(s, `etapa ${etapa}`).toMatch(/### Revisão em camadas/);
      expect(s, `etapa ${etapa}`).toMatch(/### Tipo de projeto e tipo de plano/);
      expect(s, `etapa ${etapa}`).toMatch(/## 4\. Formato de saída/);
      expect(s, `etapa ${etapa}`).toMatch(new RegExp(`### Etapa ${etapa} —`));
      for (const outra of [1, 2, 3, 4, 5].filter((x) => x !== etapa))
        expect(s, `etapa ${etapa}`).not.toMatch(new RegExp(`### Etapa ${outra} —`));
      // o que o app não usa
      expect(s).not.toMatch(/## 5\. O que carregar|## 6\. Uso no Claude Code|## 7\. Referências/);
      expect(s).toMatch(/recortada para a etapa/);
    }
  });

  it("as regras gerais da seção 3 vão só às etapas do título", () => {
    expect(skillDaEtapa(1)).toMatch(/### Cruzamentos obrigatórios/);
    expect(skillDaEtapa(5)).toMatch(/### Cruzamentos obrigatórios/);
    expect(skillDaEtapa(2)).not.toMatch(/### Cruzamentos obrigatórios/);
    expect(skillDaEtapa(1)).not.toMatch(/### Compromissos numerados/);
    expect(skillDaEtapa(2)).toMatch(/### Compromissos numerados/);
    expect(skillDaEtapa(5)).toMatch(/### Compromissos numerados/);
    expect(skillDaEtapa(4)).toMatch(/### Linha do tempo antes de fechar/);
    expect(skillDaEtapa(5)).not.toMatch(/### Linha do tempo antes de fechar/);
  });

  it("a segunda instância leva o SKILL.md da etapa conferida", () => {
    expect(sistemaDaSegundaInstancia(3)).toMatch(/### Etapa 3 —/);
    expect(sistemaDaSegundaInstancia(3)).not.toMatch(/### Etapa 2 —/);
    expect(sistemaDaSegundaInstancia()).toMatch(/### Etapa 2 —[\s\S]*### Etapa 3 —/);
  });
});

describe("checklist só com as premissas críticas confirmadas", () => {
  it("leva a tabela de onde cada uma aparece e só as fichas das confirmadas", () => {
    const c = checklistDasPremissas(["PC1", "PC4"]);
    expect(c).toMatch(/## Onde cada premissa crítica aparece/);
    expect(c).toMatch(/### PC1 —/);
    expect(c).toMatch(/### PC4 —/);
    expect(c).not.toMatch(/### PC2 —|### PC7 —/);
    expect(c).not.toMatch(/## Cobertura dos 24 riscos/);
    expect(c).toMatch(/Premissas críticas confirmadas pelo GP: PC1, PC4/);
  });

  it("sem premissa confirmada (etapa 1, estratégia), vai inteiro", () => {
    expect(pcsConfirmadas({ PC1: false })).toBeUndefined();
    expect(pcsConfirmadas({ PC3: true, PC1: true, PC2: false })).toEqual(["PC1", "PC3"]);
    expect(checklistDasPremissas(undefined)).toMatch(/### PC7 —[\s\S]*## Cobertura dos 24 riscos/);
  });
});

describe("fichas sem as linhas de fonte", () => {
  it("tira só a linha de fonte; o item, os sinais, quem confere e a dispensa ficam", () => {
    const f =
      '- **X.1** Item\n  - fonte: PMBOK 6, p. 1\n  - sinais: "a"\n  - confere: código\n  - dispensa: nunca\n';
    expect(semFonte(f)).toBe('- **X.1** Item\n  - sinais: "a"\n  - confere: código\n  - dispensa: nunca\n');
    const partes = fichasDasPartes(["A8", "B27"]);
    expect(partes).not.toMatch(/^\s*- fonte:/m);
    expect(partes).toMatch(/\*\*A8\.1\*\*/);
    expect(partes).toMatch(/- confere:/);
  });

  it("os temas do Rework continuam os da ficha inteira", () => {
    const blocos = referenciasEtapa2();
    expect(blocos.some((b) => b.titulo.startsWith("referencias/rework.md"))).toBe(true);
    expect(
      blocos.filter((b) => b.titulo.includes("artefatos/")).every((b) => !/^\s*- fonte:/m.test(b.texto)),
    ).toBe(true);
  });

  it("o pedido da etapa 2 fica menor sem perder as fichas", () => {
    const comPcs = textoDeSistema(referenciasEtapa2({ pcs: ["PC1"] }));
    const inteiro = textoDeSistema(referenciasEtapa2());
    expect(estimarTokens(comPcs)).toBeLessThan(estimarTokens(inteiro));
    expect(comPcs).toMatch(/PROP-SOW\.13/);
  });
});

describe("a conferência do pedido externo aceita o SKILL.md da etapa (decisão 0064)", () => {
  const skill = readFileSync(new URL("../../.claude/skills/pmo/SKILL.md", import.meta.url), "utf8");
  const referencias = [
    referenciasEtapa1(),
    referenciasEtapa2({ pcs: ["PC1"] }),
    referenciasEtapa3({ pcs: ["PC1"] }),
    referenciasEtapa4({ pcs: ["PC1"] }),
    referenciasEtapa5({ pcs: ["PC1"] }),
  ];
  it.each([1, 2, 3, 4, 5])("etapa %i: o recorte da etapa conta como SKILL.md", (etapa) => {
    const c = conteudoDoPedido({
      etapa,
      passo: "x",
      sistema: textoDeSistema(referencias[etapa - 1]!),
      documentos: "=== Página 1 ===\ntexto",
      pedido: "",
      schema: "{}",
      skill,
    });
    expect(c.faltas.filter((f) => /SKILL/.test(f))).toEqual([]);
  });

  it("segunda instância: o recorte da etapa conferida, e só ele", () => {
    const c = conteudoDoPedido({
      etapa: 3,
      passo: "segunda-tap",
      sistema: sistemaDaSegundaInstancia(3),
      documentos: "=== Página 1 ===\ntexto",
      pedido: "## Resposta a conferir\n<pedido-do-passo>\nx\n</pedido-do-passo>",
      schema: "{}",
      skill,
    });
    expect(c.faltas).toEqual([]);
    // o recorte de outra etapa é apontado
    const errado = conteudoDoPedido({
      etapa: 2,
      passo: "segunda-eap",
      sistema: sistemaDaSegundaInstancia(3),
      documentos: "=== Página 1 ===\ntexto",
      pedido: "## Resposta a conferir\n<pedido-do-passo>\nx\n</pedido-do-passo>",
      schema: "{}",
      skill,
    });
    expect(errado.faltas).toEqual(["SKILL.md da etapa 2"]);
  });
});
