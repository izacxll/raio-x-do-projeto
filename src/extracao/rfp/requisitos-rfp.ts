// Requisitos numerados da RFP (etapa 1, passo 3): produtos e entregáveis, equipe mínima, quantidades e local.
// Cada um ganha um número (R01, R02…) que acompanha o projeto até a conferência (etapa 5).
// Requisitos técnicos e funcionais em texto corrido ficam para o GP incluir: o código não os separa nesta versão.
import { normalizarTermo } from "../../regras/busca";
import { limparEspacos, MARCA_DE_ITEM } from "../../texto/frase";
import { tirarAcentos } from "../../texto/normalizar";
import { extrairRequisitos, type Requisito } from "../requisitos";
import type { DocumentoRfp } from "./item";
import { localizarTodos } from "./localizar";
import { faixasDoTema, type MapaRfp } from "./mapa";

const PAPEIS =
  "coordenador(?:\\(?a\\)?)?(?: geral| tecnico| de campo| executivo)?|gestor(?:a)? (?:de projeto|do projeto|tecnico)|gerente(?: de projeto| do projeto)?|consultor(?:a)?(?: senior| pleno| junior)?|especialista|analista|pesquisador(?:a)?|assistente social|assistente|tecnico(?:a)?|supervisor(?:a)?|facilitador(?:a)?|assessor(?:a)?|engenheir[oa]|arquitet[oa]|advogad[oa]|economista|estatistic[oa]|psicolog[oa]|sociolog[oa]|pedagog[oa]|antropolog[oa]|cientista de dados|desenvolvedor(?:a)?|designer|jornalista|profissional de nivel superior|profissional";
const RE_PAPEL = new RegExp(`^(?:(\\d{1,2})\\s*(?:\\([a-z ]+\\)\\s*)?)?(${PAPEIS})\\b`);
const RE_QUALIFICACAO =
  /graduac|formacao|nivel superior|superior completo|experiencia|pos-graduac|especializac|mestrad|doutorad|registro no|anos de atuacao|curso superior|bacharel|licenciatura/;
const RE_PAGINA_DE_EQUIPE =
  /equipe[ -](?:tecnica|minima|chave|de trabalho|profissional|executora)|qualificacao (?:tecnica|profissional)|perfil profissional|perfis profissionais|profissionais (?:exigidos|minimos)/;

function equipe(docs: DocumentoRfp[]): Omit<Requisito, "numero">[] {
  const out: Omit<Requisito, "numero">[] = [];
  const vistos = new Set<string>();
  for (const doc of docs) {
    for (const p of doc.paginas) {
      if (p.origem === "nao-verificavel" || !RE_PAGINA_DE_EQUIPE.test(normalizarTermo(p.texto))) continue;
      const linhas = p.texto.split("\n");
      linhas.forEach((original, i) => {
        const limpa = limparEspacos(original.replace(/\t+/g, " "))
          .replace(/^(?:\d{1,2}(?:\.\d{1,2})*\.?|[a-z]\)|[IVX]{1,4}\s*[-–.)])\s*/, "")
          .replace(MARCA_DE_ITEM, "");
        const n = normalizarTermo(limpa);
        const m = RE_PAPEL.exec(n);
        if (!m?.[2] || limpa.length > 400) return;
        const junto = normalizarTermo(`${limpa} ${linhas[i + 1] ?? ""} ${linhas[i + 2] ?? ""}`);
        // "1 (um) Coordenador(a) Geral" (com a quantidade) vale sozinho; sem ela, precisa da qualificação perto
        if (!m[1] && !RE_QUALIFICACAO.test(junto)) return;
        // o nome do papel: sem a quantidade na frente e sem a qualificação que vem depois
        const papel =
          limpa
            .replace(/^\d{1,2}\s*(?:\([^)]*\)\s*)?/, "")
            .split(/[:;,–—]|\s-\s|\s(?=formação|Formação|FORMAÇÃO|experiência|Experiência|com\s|que\s)/)[0]
            ?.trim()
            // até 80 caracteres, sem cortar palavra
            .replace(/^(.{0,80})(?:\s.*)?$/, "$1") || m[2];
        const chave = normalizarTermo(papel).replace(/[^a-z]/g, "");
        // o mesmo papel em outra tabela ("Coordenador(a) Geral trado", com a coluna vizinha colada) é repetição
        if ([...vistos].some((v) => v.startsWith(chave) || chave.startsWith(v))) return;
        vistos.add(chave);
        const seguinte = linhas[i + 1]?.trim() ?? "";
        const continua = /\w$|,$/.test(limpa) && seguinte && !RE_PAPEL.test(normalizarTermo(seguinte));
        const descricao = limparEspacos(`${limpa}${continua ? ` ${seguinte}` : ""}`).slice(0, 300);
        out.push({
          rotulo: `Equipe: ${papel.charAt(0).toUpperCase()}${papel.slice(1)}`,
          descricao,
          pagina: p.numero,
          trecho: descricao,
          origem: "codigo",
          tipo: "equipe",
          documento: doc.rotulo,
        });
      });
    }
  }
  return out.slice(0, 20);
}

const UNIDADES =
  "oficinas?|capacitac(?:ao|oes)|encontros?|turmas?|reunioes|reuniao|eventos?|seminarios?|workshops?|cursos?|palestras?|visitas?(?: tecnicas?)?|entrevistas?|questionarios|horas(?:-aula| aula)|participantes|municipios|relatorios|audiencias(?: publicas)?|pessoas|vagas|atendimentos|cadernos(?: tematicos)?|publicacoes|videos|diagnosticos|estudos|pesquisas|grupos focais|rodas de conversa|servidores|profissionais|familias|criancas|adolescentes|mulheres|jovens";
const RE_QUANTIDADE = new RegExp(`\\b(\\d{1,5})\\s*(?:\\(\\s*[a-z -]{2,40}\\)\\s*)?(${UNIDADES})\\b`, "g");

function quantidades(docs: DocumentoRfp[], mapa: MapaRfp): Omit<Requisito, "numero">[] {
  const faixas = faixasDoTema(mapa, "escopo", "objeto");
  if (!faixas) return [];
  const out: Omit<Requisito, "numero">[] = [];
  const vistos = new Set<string>();
  for (const l of localizarTodos(docs, RE_QUANTIDADE, faixas)) {
    const m = new RegExp(RE_QUANTIDADE.source).exec(l.termo);
    if (!m?.[1] || !m[2]) continue;
    const n = Number(m[1]);
    if (!n) continue;
    const antes = tirarAcentos(
      l.doc.paginas.find((p) => p.numero === l.pagina)?.texto.slice(Math.max(0, l.posicao - 12), l.posicao) ??
        "",
    );
    if (/(?:art\.?|§|lei|n[º°o.]|item|anexo|inciso)\s*$/.test(antes)) continue;
    // "01 Capacitação…" no começo da linha é número do item da tabela, não quantidade
    const pagina = l.doc.paginas.find((p) => p.numero === l.pagina)?.texto ?? "";
    const inicioDaLinha = pagina.lastIndexOf("\n", l.posicao - 1) + 1;
    if (m[1].startsWith("0") && !pagina.slice(inicioDaLinha, l.posicao).trim()) continue;
    const chave = `${n} ${m[2]}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    out.push({
      rotulo: `Quantidade: ${chave}`,
      descricao: l.frase,
      pagina: l.pagina,
      trecho: l.frase,
      origem: "codigo",
      tipo: "quantidade",
      documento: l.doc.rotulo,
    });
  }
  return out.slice(0, 25);
}

const RE_LOCAL =
  /\b(?:local|locais) (?:de|da|do|das|dos) (?:execucao|prestacao|realizacao|entrega|atendimento)\b|\b(?:os servicos|as atividades) (?:serao|deverao ser) (?:prestad|executad|realizad)[oa]s (?:n[oa]s?|em)\b/;

function local(docs: DocumentoRfp[]): Omit<Requisito, "numero">[] {
  const out: Omit<Requisito, "numero">[] = [];
  const vistas = new Set<string>();
  for (const l of localizarTodos(docs, RE_LOCAL)) {
    const chave = normalizarTermo(l.frase).slice(0, 80);
    // a vistoria "do local de execução" não diz onde o serviço é prestado
    if (
      vistas.has(chave) ||
      l.frase.length < 25 ||
      /vistoria|avaliacao previa|desconhecimento|preposto/.test(normalizarTermo(l.frase))
    )
      continue;
    vistas.add(chave);
    out.push({
      rotulo: "Local",
      descricao: l.frase,
      pagina: l.pagina,
      trecho: l.frase,
      origem: "codigo",
      tipo: "local",
      documento: l.doc.rotulo,
    });
    if (out.length >= 3) break;
  }
  return out;
}

/** Requisitos da RFP, numerados na ordem: produtos, equipe, quantidades, local. */
export function extrairRequisitosRfp(docs: DocumentoRfp[], mapa: MapaRfp): Requisito[] {
  const produtos = docs.flatMap((d) =>
    extrairRequisitos(d.paginas).map((r) => ({ ...r, documento: d.rotulo, tipo: "produto" as const })),
  );
  // o mesmo produto num anexo e no corpo vira um só
  const vistos = new Set<string>();
  const unicos = produtos.filter((r) => {
    if (vistos.has(r.rotulo)) return false;
    vistos.add(r.rotulo);
    return true;
  });
  const todos = [...unicos, ...equipe(docs), ...quantidades(docs, mapa), ...local(docs)];
  return todos.map((r, i) => ({ ...r, numero: `R${String(i + 1).padStart(2, "0")}` }));
}
