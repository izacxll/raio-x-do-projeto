// Rodadas da segunda instância no teste externo (decisões 0059 e 0060): o que o vigia faz depois de importar a
// conferência de um passo e depois de importar uma resposta do passo. Funções puras, sem arquivo nem processo: o vigia
// (fora do Git) lê o conferencia-*.md e o decisoes-do-gp.json, chama estas funções e faz o que elas mandam.
//
// Regras:
// - Achado alto ou médio na rodada: o vigia não exporta o próximo passo sem a decisão do GP. Com achado alto, "seguir"
//   (segue com os achados) ou corrigir (salvar a resposta corrigida); com achado médio, "corrigir" ou "seguir".
// - Rodada 1: a resposta corrigida vai a uma nova conferência (rodada 2), salvo quando a rodada 1 só teve achados
//   baixos (ou nenhum): aí o padrão é "seguir com correção", sem rodada 2 (decisão 0071). Para conferir de novo
//   mesmo assim, "rodada2ComBaixos" (true, ou a lista dos passos) no decisoes-do-gp.json.
// - Da rodada 2 em diante, a reentrega não abre rodada nova: com o passo em "seguir" ou "corrigir", ela segue direto
//   para o próximo passo, que sai com a versão nova, e o conferencia-*.md registra "GP seguiu com correção". Com achado
//   ainda pendente e sem decisão, o vigia para; "maisUmaRodada" (salvo depois da última conferência) abre outra.

/** Lê o conferencia-*.md: a rodada e quantos achados de gravidade alta e média. */
export function lerConferencia(texto) {
  const rodada = Number(/rodada (\d+)/.exec(texto)?.[1] ?? "1");
  const altas = Number(/\(alta: (\d+)/.exec(texto)?.[1] ?? "0");
  const doResumo = /\(alta: \d+, média: (\d+)\)/.exec(texto)?.[1];
  // conferências gravadas antes da contagem de médios no resumo: conta as linhas de achado médio
  const medias = doResumo !== undefined ? Number(doResumo) : (texto.match(/^- \*\*média\*\*/gm) ?? []).length;
  return { rodada, altas, medias };
}

const pendente = (c) => c.altas > 0 || c.medias > 0;
const achadosEmTexto = (c) =>
  [c.altas ? `${c.altas} de gravidade alta` : "", c.medias ? `${c.medias} de gravidade média` : ""]
    .filter(Boolean)
    .join(" e ");

/**
 * Depois de importar a conferência do passo. conf: { rodada, altas, medias }; decisao: { seguir, corrigir } (o passo
 * está na lista). Devolve { acao: "proximo" } (exporta o próximo passo), com o registro quando o GP seguiu com achados,
 * ou { acao: "parar", motivo }.
 */
export function depoisDaConferencia(conf, decisao, nomes) {
  if (!pendente(conf)) return { acao: "proximo" };
  if (decisao.seguir)
    return {
      acao: "proximo",
      registro: `O GP seguiu com os achados da rodada ${conf.rodada} (${achadosEmTexto(conf)}), sem corrigir a resposta.`,
    };
  return { acao: "parar", motivo: textoDaDecisao(conf, nomes, decisao.corrigir) };
}

/**
 * Depois de importar uma resposta do passo (etapas 1 a 4). conf: a última conferência do passo, ou undefined;
 * mudou: a resposta é diferente da que foi conferida; decisao: { seguir, corrigir, maisUmaRodada, decisaoNova,
 * rodada2ComBaixos } (decisaoNova: o decisoes-do-gp.json foi salvo depois da última conferência; rodada2ComBaixos: o
 * GP quer a rodada 2 mesmo com só achados baixos na rodada 1). Devolve { acao: "conferir" } (exporta a
 * segunda instância), { acao: "proximo", registro } ou { acao: "parar", motivo }.
 */
export function depoisDaResposta(conf, mudou, decisao, nomes) {
  if (!conf) return { acao: "conferir" };
  const comCorrecao = mudou ? "com correção" : "sem corrigir a resposta";
  // a resposta conferida não mudou: só a decisão do GP faz andar
  if (!mudou) {
    if (decisao.seguir || !pendente(conf))
      return {
        acao: "proximo",
        registro: `O GP seguiu ${comCorrecao} depois da rodada ${conf.rodada}${pendente(conf) ? ` (${achadosEmTexto(conf)})` : ""}: sem nova conferência.`,
      };
    return { acao: "parar", motivo: textoDaDecisao(conf, nomes, decisao.corrigir) };
  }
  if (decisao.maisUmaRodada && decisao.decisaoNova) return { acao: "conferir" };
  // rodada 1: a correção vai a uma nova conferência, salvo o "seguir" de um achado alto (decisão 0059)
  if (conf.rodada < 2) {
    if (decisao.seguir && conf.altas > 0)
      return {
        acao: "proximo",
        registro: `GP seguiu com correção: resposta corrigida depois da rodada ${conf.rodada} (${achadosEmTexto(conf)}), sem nova conferência.`,
      };
    // só achados baixos (ou nenhum) na rodada 1: segue com a correção, sem rodada 2 (decisão 0071)
    if (!pendente(conf) && !decisao.rodada2ComBaixos)
      return {
        acao: "proximo",
        registro: `GP seguiu com correção: a rodada ${conf.rodada} só teve achados de gravidade baixa (ou nenhum), e o padrão é seguir sem rodada 2 (decisão 0071; para conferir de novo, "rodada2ComBaixos" no decisoes-do-gp.json).`,
      };
    return { acao: "conferir" };
  }
  // da rodada 2 em diante, a reentrega não abre rodada nova
  if (decisao.seguir || decisao.corrigir || !pendente(conf))
    return {
      acao: "proximo",
      registro: `GP seguiu com correção: resposta corrigida depois da rodada ${conf.rodada}${pendente(conf) ? ` (${achadosEmTexto(conf)})` : ""}, sem nova conferência; o próximo passo sai com a versão nova.`,
    };
  return { acao: "parar", motivo: textoDaDecisao(conf, nomes) };
}

/** O que o PARADO.md pede ao GP. nomes: { chave ("2:eap"), conferencia, resposta } (nomes de arquivo). */
export function textoDaDecisao(conf, nomes, aguardandoCorrecao = false) {
  const { chave, conferencia, resposta } = nomes;
  const cab = `Rodada ${conf.rodada} da segunda instância (${chave}): ${achadosEmTexto(conf)} (veja \`${conferencia}\`).`;
  if (aguardandoCorrecao)
    return `${cab}\n\nO passo está em "corrigir": o vigia espera a resposta corrigida em \`${resposta}\`. ${
      conf.rodada < 2
        ? `Ela vai à rodada ${conf.rodada + 1}.`
        : "Ela segue direto para o próximo passo, sem rodada nova."
    }`;
  if (conf.rodada < 2)
    return `${cab} **Decisão do GP**, no decisoes-do-gp.json:\n\n- **corrigir:** salve a resposta corrigida do passo em \`${resposta}\` (se quiser, ponha "${chave}" na lista "corrigir"); o vigia exporta a rodada ${conf.rodada + 1}.\n- **seguir:** ponha "${chave}" na lista "seguir" e salve de novo a resposta do passo (\`${resposta}\`), corrigida ou não; o vigia segue direto para o próximo passo, com a versão salva.\n\nSem uma das duas, o vigia não exporta o próximo passo.`;
  return `${cab} **Decisão do GP**, no decisoes-do-gp.json (limite de 2 rodadas):\n\n- **seguir** ou **corrigir:** ponha "${chave}" na lista "seguir" (ou "corrigir") e salve a resposta mais recente do passo, corrigida ou não, em \`${resposta}\`; o vigia segue direto para o próximo passo, com a versão salva, sem rodada nova, e registra no \`${conferencia}\` que o GP seguiu.\n- **mais uma rodada:** ponha "${chave}" na lista "maisUmaRodada" e salve a resposta corrigida do passo; o vigia exporta a rodada ${conf.rodada + 1}.\n\nSem uma das decisões, o vigia não exporta outra conferência nem o próximo passo.`;
}
