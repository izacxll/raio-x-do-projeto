// Vagos e brechas da RFP (etapa 1, passo 10): o que está contraditório, o que ficou em aberto e o que transfere
// responsabilidade para a contratada. Brechas do texto, não riscos do projeto (CLAUDE.md, seção 3).
// Regras sem IA copiadas do Raio-X do Plano de Trabalho e aplicadas só à RFP; os códigos V29 aparecem como
// referência, sem mudar a taxonomia. Cada regra devolve um de três estados: achado, não identificado (nada
// encontrado com o documento lido por inteiro) ou não verificável (há páginas sem texto legível).
// Toda pergunta sai de um modelo de texto, em redação de pedido de esclarecimento, nunca de afirmação.
import { type DocumentoRfp, type ItemAnalise } from "../extracao/rfp/item";
import { localizarTodos, type Localizado } from "../extracao/rfp/localizar";
import { faixasDoTema, type MapaRfp } from "../extracao/rfp/mapa";
import { NOME_PRAZO_EXECUCAO, prazosDeExecucao, datasDoCertame, NOME_EVENTO } from "../extracao/rfp/prazos";
import { encontrarDatas, formatarData } from "../texto/datas";
import { limparEspacos } from "../texto/frase";
import { tirarAcentos } from "../texto/normalizar";
import { normalizarTermo } from "./busca";
import { PADROES_VAGO } from "./vago";

export type TipoBrecha = "contraditório" | "em aberto" | "transfere responsabilidade" | "vago";

export interface EstadoRegra {
  regra: string;
  nome: string;
  estado: "achado" | "nao-identificado" | "nao-verificavel";
  motivo: string;
}

export interface ResultadoBrechas {
  itens: ItemAnalise[];
  regras: EstadoRegra[];
}

// origem: App-final-4.jsx, RR_NOMES, linha 1653 (só as regras que se aplicam a uma RFP sozinha)
export const NOMES_REGRAS: Record<string, string> = {
  CTR4: "prazo da contratada contado de obrigação do contratante",
  CTR5: "aprovação sem prazo para a própria aprovação",
  CP13: "dependência declarada sem prazo",
  CE15: "data fixa dentro de prazo com início móvel",
  "CTR2-campo": "vedação de subcontratação × atividade de campo",
  CE17: "período de execução × data de eleição",
  "prazo-divergente": "o mesmo prazo com valores diferentes",
  "data-divergente": "o mesmo evento do certame com datas diferentes",
  "encargo-logistica": "custo de deslocamento, logística ou insumo a cargo da contratada, sem quantidade",
  vago: "trecho vago por padrão de texto",
};

// origem: App-final-4.jsx, RR_PRAZO, linha 1684 (sobre texto sem acento)
const RR_PRAZO =
  /\d(?:\s?\d){0,2}\s*(?:\([^)]{1,25}\)\s*)?(?:d\s?i\s?a\s?s?|m\s?e\s?s\s?e\s?s|mes|h\s?o\s?r\s?a\s?s|semanas)\b|\d{1,2}\s?\/\s?\d{1,2}\s?\/\s?\d{2,4}/;

// origem: App-final-4.jsx, rrPalavras, linha 1687
function palavras(s: string): Set<string> {
  return new Set(
    (tirarAcentos(s).match(/[a-z]{5,}/g) ?? [])
      .filter(
        (w) =>
          !/^(sobre|entre|ainda|sendo|deste|desta|cada|parte|forma|serao|seras|serem|outros|outras|contratante|contratada|prazo|dias)$/.test(
            w,
          ),
      )
      .map((w) => w.slice(0, 6)),
  );
}

// origem: App-final-4.jsx, RR_CAMPO, linha 1670
const RE_CAMPO =
  /pesquisa de campo|aplicacao d[eo]s? questionarios|questionarios validos|entrevistas? (?:com|presenciais|domiciliares|em campo)|coleta de dados primarios|levantamento de campo|trabalho de campo/;

const MARCOS: Record<string, string> = {
  assinatura: "na assinatura",
  aceite: "no aceite",
  publicacao: "na publicação",
  "ordem de servico": "na ordem de serviço",
  emissao: "na emissão",
  recebimento: "no recebimento",
};

// origem: App-final-4.jsx, RR_ELEICOES, linha 1672
const ELEICOES = [
  { nivel: "municipal", nome: "eleições municipais", data: "2028-10-01" },
  { nivel: "geral", nome: "eleições gerais", data: "2030-10-06" },
] as const;

function trecho(l: Localizado): ItemAnalise["origem"] {
  return { documento: l.doc.rotulo, pagina: l.pagina, trecho: l.frase };
}

export function aplicarRegrasRfp(docs: DocumentoRfp[], mapa: MapaRfp): ResultadoBrechas {
  const itens: ItemAnalise[] = [];
  const regras: EstadoRegra[] = [];
  const ilegiveis = docs.filter((d) => d.ilegiveis.length);
  const estado = (regra: string, achou: number, oQue: string) => {
    if (achou) {
      regras.push({
        regra,
        nome: NOMES_REGRAS[regra] ?? regra,
        estado: "achado",
        motivo: `${achou} ${achou === 1 ? "achado" : "achados"}`,
      });
      return;
    }
    regras.push(
      ilegiveis.length
        ? {
            regra,
            nome: NOMES_REGRAS[regra] ?? regra,
            estado: "nao-verificavel",
            motivo: `${oQue}: ${ilegiveis.map((d) => `${d.rotulo}, p. ${d.ilegiveis.join(", ")} sem texto legível`).join("; ")}; o que estiver nelas não foi conferido`,
          }
        : {
            regra,
            nome: NOMES_REGRAS[regra] ?? regra,
            estado: "nao-identificado",
            motivo: `${oQue}: nada encontrado, com o documento lido por inteiro`,
          },
    );
  };
  const novo = (
    regra: string,
    tipo: TipoBrecha,
    chave: string,
    i: Omit<ItemAnalise, "id" | "secao" | "rotulo" | "situacao">,
  ) =>
    itens.push({
      ...i,
      id: `brechas:${regra}:${chave}`,
      secao: "brechas",
      rotulo: "sugestao",
      situacao: "localizado",
      campos: { Tipo: tipo, Regra: regra, ...i.campos },
    });

  // ---------- CTR4 · prazo da contratada contado de algo que o contratante deve fazer ----------
  // origem: App-final-4.jsx, regrasRisco (CTR4), linha 1719
  {
    const OBRIG =
      /\b(?:a\s+)?(?:contratante|prefeitura|municipio|secretaria|cliente|ministerio|administracao)\s+(?:ficara|sera)\s+responsavel|\b(?:contratante|prefeitura|municipio|secretaria|cliente)\s+devera\s+(?:fornecer|disponibilizar|enviar|autorizar|indicar|providenciar|encaminhar)|(?:disponibilizad|fornecid|enviad|encaminhad)[oa]s?\s+pel[oa]s?\s+(?:contratante|prefeitura|municipio|secretaria|cliente|ministerio)/;
    const DEP =
      /(apos|a partir d[oa]|contad[oa]s?\s+d[oa])\s+(?:o\s+|a\s+)?(recebimento|envio|disponibilizacao|autorizacao|liberacao|entrega\s+d[oa]s?\s+(?:dados|informa))\b([^.;]{0,90})/;
    const obrigacoes = localizarTodos(docs, OBRIG);
    let achou = 0;
    for (const l of localizarTodos(docs, DEP)) {
      const p = l.doc.paginas.find((x) => x.numero === l.pagina);
      const antes = tirarAcentos(p?.texto.slice(Math.max(0, l.posicao - 140), l.posicao) ?? "");
      if (!RR_PRAZO.test(antes)) continue;
      const m = new RegExp(DEP.source).exec(l.termo);
      if (!m) continue;
      // pagamento contado do recebimento da nota fiscal é a regra comum, não brecha
      if (/nota fiscal|fatura|documento fiscal|documento de cobranca/.test(m[3] ?? "")) continue;
      // a palavra em comum tem de estar no objeto ("dos dados cadastrais"), não no marco ("recebimento"):
      // senão qualquer obrigação que fale de recebimento casaria
      const doMarco = palavras(m[2] ?? "");
      const objeto = new Set([...palavras(m[3] ?? "")].filter((w) => !doMarco.has(w)));
      const casa = obrigacoes.find((o) => [...palavras(o.frase)].some((w) => objeto.has(w)));
      if (!casa || itens.some((x) => x.origem?.trecho === l.frase)) continue;
      achou++;
      // o marco com os acentos do documento: o termo achado está sem acento
      const original = p?.texto.slice(l.posicao, l.posicao + 120) ?? "";
      const inicioMarco = tirarAcentos(original).indexOf(m[2] ?? "");
      const marco = limparEspacos(original.slice(Math.max(0, inicioMarco)))
        .split(/[.;]/)[0]!
        .slice(0, 70)
        .replace(/\s+\S*$/, "");
      novo("CTR4", "transfere responsabilidade", `${l.pagina}:${l.posicao}`, {
        nome: `O prazo da contratada conta a partir de "${marco}", que depende do contratante`,
        texto: `Prazo contado a partir de "${marco}" (${l.doc.rotulo}, p. ${l.pagina}); a obrigação do contratante está na p. ${casa.pagina}: "${casa.frase}". A regra não verifica se o documento diz o que acontece se o contratante não cumprir.`,
        origem: trecho(l),
        pergunta: `Solicita-se esclarecer o que ocorre com o prazo da contratada se "${marco}" não acontecer no tempo previsto (item da p. ${l.pagina}): o prazo será prorrogado na mesma medida do atraso?`,
      });
    }
    estado("CTR4", achou, "prazo da contratada contado de obrigação do contratante");
  }

  // ---------- CTR5 · aprovação sem prazo para a própria aprovação ----------
  // origem: App-final-4.jsx, regrasRisco (CTR5), linha 1810
  {
    const APROV =
      /(?:apos|mediante|depois\s+d[aeo]|condicionad[oa]s?\s+a|sujeit[oa]s?\s+a)\s+(?:a\s+)?(?:previa\s+)?aprovacao\s+d[oa]s?\s+([^.;:)–]{3,60})|\bpela\s+aprovacao\s+d[eoa]s?\s+([^.;:)–]{3,60})/;
    const OBJ = /produt|relatori|etapa|entreg|fase|parcel|medic|nota\s+fiscal|pagamento/;
    const PRAZO_DA_APROV =
      /(aprovacao|aprovar|analise|manifestacao)[^.;]{0,100}?(no\s+prazo\s+(?:maximo\s+)?de|em\s+ate|prazo\s+de)\s*\d|\d+\s*(?:\([^)]{1,20}\)\s*)?dias?(?:\s+uteis)?\s+(?:para|de)\s+(?:a\s+)?(?:analise|aprovacao|manifestacao)/;
    let achou = 0;
    for (const doc of docs) {
      if (localizarTodos([doc], PRAZO_DA_APROV).length) continue; // o documento dá prazo para aprovar
      const casos = localizarTodos([doc], APROV).filter((l) => {
        const m = new RegExp(APROV.source).exec(l.termo);
        return OBJ.test(m?.[1] ?? m?.[2] ?? "");
      });
      const l = casos[0];
      if (!l) continue;
      const m = new RegExp(APROV.source).exec(l.termo);
      const objeto = limparEspacos(m?.[1] ?? m?.[2] ?? "")
        .replace(/\s+\S*$/, "")
        .slice(0, 50);
      const outras = [...new Set(casos.slice(1).map((c) => c.pagina))].filter((p) => p !== l.pagina);
      achou++;
      novo("CTR5", "em aberto", `${doc.id}:${l.pagina}:${l.posicao}`, {
        nome: `Aprovação de ${objeto} sem prazo para a aprovação`,
        texto: `O documento condiciona algo à aprovação de ${objeto}, mas não diz em quantos dias a aprovação acontece${outras.length ? `; também nas p. ${outras.join(", ")}` : ""}.`,
        origem: trecho(l),
        pergunta: `Solicita-se informar em quantos dias o contratante se manifestará sobre ${objeto} (item da p. ${l.pagina}) e o que ocorre com o cronograma e o pagamento se a aprovação não vier nesse prazo.`,
      });
    }
    estado("CTR5", achou, "aprovação sem prazo próprio");
  }

  // ---------- CP13 · dependência declarada sem prazo ----------
  // origem: App-final-4.jsx, regrasRisco (CP13), linha 1832
  {
    const DEPENDE =
      /(?<!nao\s)\bdepende(?:ra|m|rao)?\s+(?:do\s+envio\s+)?d[aoe]s?\b|\ba\s+ser(?:em)?\s+fornecid[oa]s?\s+pel[oa]s?\b/;
    const ATOR =
      /contratante|prefeitura|municipio|secretaria|cliente|ministerio|orgao|terceir|envio|fornecimento|disponibiliza|autoriza|informac(?:ao|oes)|dados/;
    const JURIDICO =
      /cess(?:ao|oes)\s+de\s+credito|subcontrata|garantia|penalidade|multa|reajust|rescis|habilitac/;
    let achou = 0;
    const vistos = new Set<string>();
    for (const l of localizarTodos(docs, DEPENDE)) {
      const p = l.doc.paginas.find((x) => x.numero === l.pagina);
      const depois =
        tirarAcentos(p?.texto.slice(l.posicao, l.posicao + 100) ?? "").split(/[.;]\s|\)/)[0] ?? "";
      const f = tirarAcentos(l.frase);
      if (
        vistos.has(f) ||
        RR_PRAZO.test(f) ||
        JURIDICO.test(f) ||
        !ATOR.test(/a\s+ser/.test(l.termo) ? "secretaria" : depois)
      )
        continue;
      vistos.add(f);
      achou++;
      const inicio = limparEspacos(p?.texto.slice(l.posicao, l.posicao + 70) ?? l.termo).replace(
        /\s+\S*$/,
        "",
      );
      novo("CP13", "em aberto", `${l.pagina}:${l.posicao}`, {
        nome: `Dependência declarada sem prazo: "${inicio}…"`,
        texto: `"${limparEspacos(l.termo)}" sem prazo na mesma frase (${l.doc.rotulo}, p. ${l.pagina}). A regra não verifica se há compromisso ou alternativa em outro trecho.`,
        origem: trecho(l),
        pergunta: `Solicita-se informar o prazo e o responsável pelo que é citado em "${inicio}…" (p. ${l.pagina}), e se o cronograma será ajustado caso não seja cumprido.`,
      });
      if (achou >= 4) break;
    }
    estado("CP13", achou, "dependência declarada sem prazo");
  }

  // ---------- CE15 · data fixa (evento) dentro de prazo com início móvel ----------
  // origem: App-final-4.jsx, regrasRisco (CE15), linha 1785
  {
    const MOVEL =
      /(?:prazo|vigencia|execucao)[^.;]{0,140}?contad[oa]s?\s+(?:a\s+partir\s+)?d[aoe]\s+(?:data\s+d[aoe]\s+)?(assinatura|aceite|publicacao|ordem\s+de\s+servico|emissao|recebimento)/;
    const FUTURO =
      /a\s+ser\s+realizad|sera\s+realizad|ocorrera|acontecera|previst[oa]s?\s+para|programad[oa]s?\s+para|entre\s+os\s+dias/;
    const moveis = localizarTodos(docs, MOVEL);
    let achou = 0;
    const doCertame = datasDoCertame(docs);
    const certame = doCertame.map((d) => `${d.pagina}:${formatarData(d.data)}`);
    // data anterior ao certame (lei, contrato antigo, convenção coletiva) não cabe no prazo de execução
    const desde = doCertame.reduce<Date | undefined>((m, d) => (!m || d.data < m ? d.data : m), undefined);
    const mv = moveis[0];
    if (mv) {
      const chave =
        /(assinatura|aceite|publicacao|ordem\s+de\s+servico|emissao|recebimento)/.exec(mv.termo)?.[1] ?? "";
      const marco = MARCOS[chave.replace(/\s+/g, " ")] ?? "no marco inicial";
      for (const doc of docs) {
        for (const p of doc.paginas) {
          for (const d of encontrarDatas(p.texto)) {
            const frase = tirarAcentos(p.texto.slice(Math.max(0, d.posicao - 150), d.posicao + 60));
            if (!FUTURO.test(frase) || certame.includes(`${p.numero}:${formatarData(d.data)}`)) continue;
            if (desde && d.data < desde) continue;
            achou++;
            const loc: Localizado = {
              doc,
              pagina: p.numero,
              posicao: d.posicao,
              termo: "",
              frase: limparEspacos(p.texto.slice(Math.max(0, d.posicao - 150), d.posicao + 60)),
            };
            novo("CE15", "em aberto", `${p.numero}:${d.posicao}`, {
              nome: `Evento com data fixa (${formatarData(d.data)}) dentro de um prazo que começa ${marco}, que não tem data fixa`,
              texto: `Data fixa na p. ${p.numero}; prazo que começa ${marco} na p. ${mv.pagina} ("${mv.frase}"). A regra só mostra a combinação; o efeito no cronograma fica com o GP.`,
              origem: trecho(loc),
              pergunta: `Solicita-se confirmar se a data de ${formatarData(d.data)} (p. ${p.numero}) se mantém caso o início (${marco.replace(/^n[ao] /, "")}) ocorra depois do previsto, ou se ela será reprogramada.`,
            });
            if (achou >= 3) break;
          }
          if (achou >= 3) break;
        }
      }
    }
    estado("CE15", achou, mv ? "data fixa de evento ou atividade" : "prazo contado de marco móvel");
  }

  // ---------- CTR2 · vedação de subcontratação × atividade de campo ----------
  // origem: App-final-4.jsx, regrasRisco (CTR2), linha 1862
  {
    const VED =
      /(?:e\s+)?vedad[ao]\s+a\s+subcontratacao|nao\s+(?:e|sera)\s+(?:admitida|permitida)\s+(?:a\s+)?subcontratacao|subcontratacao[^.;]{0,30}\b(?:vedada|proibida|nao\s+(?:sera\s+)?(?:admitida|permitida))/;
    const ved = localizarTodos(docs, VED)[0];
    const campo = localizarTodos(docs, RE_CAMPO)[0];
    if (ved && campo)
      novo("CTR2-campo", "transfere responsabilidade", `${ved.pagina}`, {
        nome: "O documento veda a subcontratação e prevê atividade de campo",
        texto: `Vedação de subcontratação (p. ${ved.pagina}) e atividade de campo (p. ${campo.pagina}: "${campo.frase}"). A regra não verifica se a vedação admite exceção nem se a equipe própria basta para o campo.`,
        origem: trecho(ved),
        pergunta: `Solicita-se esclarecer se a vedação de subcontratação (p. ${ved.pagina}) alcança a atividade de campo prevista na p. ${campo.pagina} e, nesse caso, de que forma a equipe de campo pode ser contratada.`,
      });
    estado(
      "CTR2-campo",
      ved && campo ? 1 : 0,
      ved ? "atividade de campo junto da vedação" : "vedação de subcontratação",
    );
  }

  // ---------- CE17 · período de execução × data de eleição ----------
  // origem: App-final-4.jsx, regrasRisco (CE17), linha 1876
  {
    const prazos = prazosDeExecucao(docs).filter((p) => p.tipo === "vigencia" || p.tipo === "execucao");
    const prazo = prazos.find((p) => p.tipo === "execucao") ?? prazos[0];
    const sessao = datasDoCertame(docs).find((d) => d.evento === "sessao" || d.evento === "entrega");
    let achou = 0;
    if (prazo && sessao) {
      const [n, unidade] = prazo.valor.split(" ");
      const ini = sessao.data;
      const fim = new Date(ini);
      if (/^mes/.test(unidade ?? "")) fim.setMonth(fim.getMonth() + Number(n));
      else if (/^ano/.test(unidade ?? "")) fim.setFullYear(fim.getFullYear() + Number(n));
      else fim.setDate(fim.getDate() + Number(n));
      // o nível do contratante pela abertura do documento
      const abertura = normalizarTermo(
        docs[0]?.originais
          .slice(0, 2)
          .map((p) => p.texto)
          .join(" ") ?? "",
      );
      const mun = /prefeitura|municipio de|municipal de|camara municipal/.test(abertura);
      const ger =
        /governo do estado|secretaria (?:de estado|estadual)|ministerio|governo federal|\buniao\b/.test(
          abertura,
        );
      const nivel = mun && !ger ? "municipal" : ger && !mun ? "geral" : null;
      for (const e of ELEICOES) {
        const d = new Date(`${e.data}T12:00:00`);
        if (d < ini || d > fim || (nivel && e.nivel !== nivel)) continue;
        achou++;
        novo("CE17", "em aberto", e.data, {
          nome: `O período de execução pode incluir o primeiro turno das ${e.nome} (${formatarData(d)})`,
          texto: `${prazo.valor} contados, no mais cedo, de ${formatarData(ini)} (data do certame, ${sessao.doc.rotulo}, p. ${sessao.pagina}), até ${formatarData(fim)}; primeiro turno das ${e.nome} em ${formatarData(d)}. Se a execução começar mais tarde, o cruzamento muda. Conta do código.`,
          origem: trecho(prazo.loc),
          pergunta: `Solicita-se informar se há restrições de agenda, de eventos públicos ou de divulgação no período eleitoral (primeiro turno em ${formatarData(d)}) que afetem as atividades previstas.`,
        });
      }
    }
    estado(
      "CE17",
      achou,
      prazo ? "período de execução que cruza data de eleição" : "prazo de execução em número",
    );
  }

  // ---------- contraditório: o mesmo prazo com valores diferentes ----------
  {
    const porTipo = new Map<string, ReturnType<typeof prazosDeExecucao>>();
    for (const p of prazosDeExecucao(docs)) {
      if (p.tipo === "inicio") continue;
      porTipo.set(p.tipo, [...(porTipo.get(p.tipo) ?? []), p]);
    }
    let achou = 0;
    for (const [tipo, lista] of porTipo) {
      const valores = [...new Map(lista.map((p) => [p.valor, p])).values()];
      if (valores.length < 2) continue;
      const [a, b] = valores;
      if (!a || !b) continue;
      achou++;
      const nome = NOME_PRAZO_EXECUCAO[tipo as keyof typeof NOME_PRAZO_EXECUCAO];
      novo("prazo-divergente", "contraditório", tipo, {
        nome: `${nome} com valores diferentes: ${valores.map((v) => v.valor).join(" × ")}`,
        texto: `${valores.map((v) => `${v.valor} (${v.loc.doc.rotulo}, p. ${v.loc.pagina})`).join("; ")}. Pode ser o prazo de coisas diferentes (o contrato, a ata, um anexo): conferir no documento.`,
        origem: trecho(a.loc),
        campos: { "Outro trecho": `p. ${b.loc.pagina}: ${b.loc.frase}` },
        pergunta: `O documento traz ${nome.toLowerCase()} de ${a.valor} (p. ${a.loc.pagina}) e de ${b.valor} (p. ${b.loc.pagina}). Solicita-se confirmar qual prevalece${valores.length > 2 ? " e a que se refere cada um" : ""}.`,
      });
    }
    estado("prazo-divergente", achou, "o mesmo prazo com valores diferentes");
  }

  // ---------- contraditório: o mesmo evento do certame com datas diferentes ----------
  {
    const datas = datasDoCertame(docs).filter((d) => d.evento === "sessao" && !d.marco);
    const distintas = [...new Map(datas.map((d) => [formatarData(d.data), d])).values()];
    const [a, b] = distintas;
    if (a && b) {
      const loc: Localizado = { doc: a.doc, pagina: a.pagina, posicao: a.posicao, termo: "", frase: a.frase };
      novo("data-divergente", "contraditório", "sessao", {
        nome: `${NOME_EVENTO.sessao} com datas diferentes: ${distintas.map((d) => formatarData(d.data)).join(" × ")}`,
        texto: distintas.map((d) => `${formatarData(d.data)} (${d.doc.rotulo}, p. ${d.pagina})`).join("; "),
        origem: trecho(loc),
        campos: { "Outro trecho": `p. ${b.pagina}: ${b.frase}` },
        pergunta: `O documento traz datas diferentes para a sessão pública (${formatarData(a.data)} na p. ${a.pagina} e ${formatarData(b.data)} na p. ${b.pagina}). Solicita-se confirmar a data válida.`,
      });
    }
    estado("data-divergente", a && b ? 1 : 0, "o mesmo evento do certame com datas diferentes");
  }

  // ---------- transfere responsabilidade: custo de logística a cargo da contratada, sem quantidade ----------
  {
    const RE =
      /\b(?:despesas|custos?|onus|gastos)\b[^.;]{0,80}\b(?:deslocamento|hospedagem|alimentacao|transporte|passage(?:m|ns)|diarias|locacao|impressao|material(?:is)? (?:grafico|didatico)|insumos)\b[^.;]{0,120}\b(?:contratada|licitante|proponente|vencedora)\b|\b(?:a cargo|por conta|as expensas|sob (?:a )?responsabilidade)\s+da\s+(?:contratada|licitante)\b[^.;]{0,120}\b(?:deslocamento|hospedagem|alimentacao|transporte|passage(?:m|ns)|diarias|locacao|impressao|insumos)\b/;
    let achou = 0;
    for (const l of localizarTodos(docs, RE)) {
      // com quantidade (número de viagens, eventos, diárias), dá para dimensionar: não é brecha
      if (/\d/.test(l.frase.replace(/^\d+(?:\.\d+)*\.?\s/, ""))) continue;
      achou++;
      novo("encargo-logistica", "transfere responsabilidade", `${l.pagina}:${l.posicao}`, {
        nome: "Custo de logística ou insumo a cargo da contratada, sem quantidade",
        texto: `O trecho põe o custo na contratada sem dizer quanto (número de viagens, diárias, eventos ou locais). A regra não verifica se a quantidade está em outro trecho ou na planilha.`,
        origem: trecho(l),
        pergunta: `Solicita-se informar a quantidade estimada (deslocamentos, diárias, eventos ou locais) dos custos postos a cargo da contratada no item da p. ${l.pagina}, para o dimensionamento do preço.`,
      });
      if (achou >= 3) break;
    }
    estado("encargo-logistica", achou, "custo de logística a cargo da contratada");
  }

  // ---------- vagos: padrões de texto, fora das seções de procedimento do certame ----------
  {
    const faixas = faixasDoTema(
      mapa,
      "objeto",
      "escopo",
      "obrigacoes",
      "pagamento",
      "recebimento",
      "vigencia",
      "fiscalizacao",
      "propriedade",
      "dados",
      "subcontratacao",
    );
    let achou = 0;
    for (const padrao of PADROES_VAGO) {
      const ocorrencias = localizarTodos(docs, padrao.re, faixas);
      const porPagina = new Map<string, Localizado>();
      for (const o of ocorrencias) {
        const chave = `${o.doc.id}:${o.pagina}`;
        if (!porPagina.has(chave)) porPagina.set(chave, o);
      }
      const lista = [...porPagina.values()];
      for (const o of lista.slice(0, 3)) {
        achou++;
        novo("vago", "vago", `${padrao.id}:${o.doc.id}:${o.pagina}`, {
          nome: `"${o.termo}" sem ${padrao.falta} verificável`,
          texto: `Trecho que não dá para conferir: falta ${padrao.falta}.${
            lista.length > 3 && o === lista[2]
              ? ` Também nas p. ${lista
                  .slice(3)
                  .map((x) => x.pagina)
                  .join(", ")}.`
              : ""
          }`,
          origem: trecho(o),
          campos: { Padrão: padrao.id },
          pergunta: perguntaDoVago(padrao.falta, o),
        });
      }
    }
    estado("vago", achou, "trechos vagos por padrão de texto");
  }

  return { itens, regras };
}

/** Modelo de texto da pergunta de esclarecimento de um trecho vago. */
export function perguntaDoVago(falta: string, o: Localizado): string {
  const t = o.frase.length > 160 ? `${o.frase.slice(0, 160).replace(/\s+\S*$/, "")}…` : o.frase;
  switch (falta) {
    case "prazo":
      return `Solicita-se informar o prazo (data, dias contados de um marco ou frequência) do trecho "${t}" (p. ${o.pagina}).`;
    case "quantidade":
      return `Solicita-se informar a quantidade estimada ou máxima do trecho "${t}" (p. ${o.pagina}), para o dimensionamento da proposta.`;
    case "responsável":
      return `Solicita-se informar quem é o responsável pelo trecho "${t}" (p. ${o.pagina}).`;
    default:
      return `Solicita-se informar o critério que será usado no trecho "${t}" (p. ${o.pagina}).`;
  }
}
