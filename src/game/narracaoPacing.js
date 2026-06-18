/**
 * Controla o ritmo das falas do narrador para caber no tempo de leitura humana.
 * Referência: ~2,4s por frase curta; total de falas limitado pela duração da partida.
 */

const MS_POR_FRASE = 2_400;

/** Sempre entram na narração; só respeitam o intervalo mínimo (podem aguardar). */
const TIPOS_PRIORITARIOS = new Set(["info", "intervalo", "fim", "gol"]);

export function calcularLimitesNarracao(duracaoMs) {
  const maxFalasComTexto = Math.max(4, Math.floor(duracaoMs / MS_POR_FRASE));
  return {
    minEntreFalasMs: MS_POR_FRASE,
    maxFalasComTexto,
  };
}

/**
 * @param {number} duracaoMs
 * @param {{ linhas?: Array }} [resume]
 */
export function criarControleNarracao(duracaoMs, resume = null) {
  const { minEntreFalasMs, maxFalasComTexto } = calcularLimitesNarracao(duracaoMs);
  let falasEmitidas = resume?.linhas?.length ?? 0;
  // Partida nova: primeira fala imediata. Retomada: respeita intervalo após F5.
  let ultimaFalaMs = falasEmitidas > 0 ? Date.now() : 0;

  return {
    /** Intervalo mínimo entre qualquer par de falas. */
    msAtePoderFalar() {
      const falta = minEntreFalasMs - (Date.now() - ultimaFalaMs);
      return Math.max(0, falta);
    },

    ehPrioritaria(tipo) {
      return TIPOS_PRIORITARIOS.has(tipo);
    },

    /** Pode enviar agora? Lance/chance também respeitam o teto total. */
    podeEmitir(tipo) {
      if (Date.now() - ultimaFalaMs < minEntreFalasMs) return false;
      if (!TIPOS_PRIORITARIOS.has(tipo) && falasEmitidas >= maxFalasComTexto) return false;
      return true;
    },

    /** Registra fala exibida (não chamar para ticks silenciosos). */
    registrar(tipo) {
      if (tipo === "tick") return;
      ultimaFalaMs = Date.now();
      falasEmitidas++;
    },

    get stats() {
      return { falasEmitidas, maxFalasComTexto, minEntreFalasMs };
    },
  };
}
