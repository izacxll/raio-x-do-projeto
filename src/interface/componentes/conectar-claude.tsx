// Tela "Conectar ao Claude" (seção 8; decisão 0003). Campo da chave, "Testar", "só nesta sessão" e o botão
// "Esquecer a chave" sempre visível. "Lembrar neste navegador" aparece desativado, com o motivo.
// A chave fica só no sessionStorage desta aba: nunca no dossiê, nos exportados nem em logs.
import { useState, useSyncExternalStore } from "react";
import { MODELOS, type IdModelo } from "../../config/modelo";
import {
  aoMudarChave,
  esquecerChave,
  FORMATO_CHAVE,
  guardarChave,
  lerChave,
  mascararChave,
} from "../../pmo/chave";

export function useChave(): string | null {
  return useSyncExternalStore(aoMudarChave, lerChave, () => null);
}

export function ConectarClaude({ modelo }: { modelo: IdModelo }) {
  const chave = useChave();
  const [digitada, setDigitada] = useState("");
  // o resultado vale só para a chave testada: trocar ou esquecer a chave apaga o resultado da tela
  const [resultado, setTeste] = useState<{ chave: string; ok: boolean; mensagem: string } | null>(null);
  const teste = resultado && resultado.chave === chave ? resultado : null;
  const [testando, setTestando] = useState(false);

  async function testar(alvo: string) {
    setTestando(true);
    setTeste(null);
    try {
      const { testarChave } = await import("../../pmo/cliente");
      setTeste({ chave: alvo, ...(await testarChave(alvo, modelo)) });
    } finally {
      setTestando(false);
    }
  }

  return (
    <div className="cartao cartao__corpo conectar" data-testid="conectar-claude">
      <span className="lb">Conectar ao Claude</span>
      {chave ? (
        <p className="texto-apoio">
          Chave em uso nesta aba: <code>{mascararChave(chave)}</code>. Ela some ao fechar a aba.
        </p>
      ) : (
        <>
          <p className="texto-apoio">
            Esta etapa usa o PMO pela API do Claude, com a sua chave.{" "}
            <b>O login do claude.ai não é a chave da API.</b> Para ter uma:
          </p>
          <ol className="texto-apoio passos-chave">
            <li>
              Peça ao administrador do Claude da FGV uma chave da API na organização da FGV (Claude Console).
            </li>
            <li>Copie a chave inteira (começa com sk-ant-) e cole abaixo.</li>
            <li>Clique em “Testar”. O teste faz uma chamada mínima, de custo desprezível.</li>
          </ol>
          <div className="acoes-exportar">
            <input
              type="password"
              autoComplete="off"
              spellCheck={false}
              aria-label="Chave da API"
              placeholder="Chave da API (sk-ant-…)"
              value={digitada}
              onChange={(e) => setDigitada(e.target.value)}
              style={{ flex: 1, minWidth: 260 }}
            />
            <button
              className="botao botao--cheio"
              type="button"
              disabled={!digitada.trim()}
              onClick={() => {
                guardarChave(digitada);
                setDigitada("");
              }}
            >
              Usar esta chave
            </button>
          </div>
          {digitada.trim() && !FORMATO_CHAVE.test(digitada.trim()) && (
            <p className="envio__obs">A chave não parece completa: confira se copiou até o fim.</p>
          )}
        </>
      )}
      <div className="acoes-exportar" style={{ marginTop: 8 }}>
        <label className="envio__obs">
          <input type="radio" checked readOnly /> Só nesta sessão (a chave some ao fechar a aba)
        </label>
        <label
          className="envio__obs"
          title="Desativado: no GitHub Pages, este endereço é compartilhado com outros sites da mesma conta."
        >
          <input type="radio" disabled /> Lembrar neste navegador — desativado: este endereço é compartilhado
          com outros sites da mesma conta no GitHub Pages
        </label>
      </div>
      <div className="acoes-exportar">
        {chave && (
          <button className="botao" type="button" disabled={testando} onClick={() => void testar(chave)}>
            {testando ? "Testando…" : `Testar com o ${MODELOS[modelo].nome}`}
          </button>
        )}
        <button
          className="botao botao--discreto"
          type="button"
          onClick={esquecerChave}
          data-testid="esquecer-chave"
        >
          Esquecer a chave
        </button>
        {teste && (
          <span role="status" className="envio__obs" style={{ color: teste.ok ? undefined : "var(--vinho)" }}>
            {teste.mensagem}
          </span>
        )}
      </div>
      <p className="envio__obs">
        Use o app numa aba só dele e esqueça a chave ao terminar. A chave nunca vai para o dossiê, para os
        documentos exportados nem para registros.
      </p>
    </div>
  );
}
