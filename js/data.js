/** Carrega e expõe a base de seleções/jogadores. */

let base = null;

export async function carregarBase() {
  if (base) return base;
  const res = await fetch("data/selecoes.json");
  if (!res.ok) throw new Error("Não foi possível carregar data/selecoes.json");
  base = await res.json();
  return base;
}

export function getSelecoes() {
  return base?.selecoes ?? [];
}

export function getSelecaoPorId(id) {
  return getSelecoes().find((s) => s.id === id) ?? null;
}

export function getJogadorPorId(jogadorId) {
  for (const sel of getSelecoes()) {
    const j = sel.jogadores.find((p) => p.id === jogadorId);
    if (j) return { ...j, selecaoOrigem: sel.id, selecaoNome: sel.nome };
  }
  return null;
}

export function getTodosJogadores() {
  const lista = [];
  for (const sel of getSelecoes()) {
    for (const j of sel.jogadores) {
      lista.push({ ...j, selecaoOrigem: sel.id, selecaoNome: sel.nome });
    }
  }
  return lista;
}

/** Seleções da divisão 3 — início da carreira. */
export function getSelecoesCarreira() {
  return getSelecoes().filter((s) => s.pote === 3);
}

/** Rótulo exibido na UI (ex.: "2º Divisão"). */
export function formatDivisao(pote) {
  return `${pote}º Divisão`;
}

export const FORMACOES = {
  "442": { GOL: 1, DEF: 4, MEI: 4, ATA: 2 },
  "433": { GOL: 1, DEF: 4, MEI: 3, ATA: 3 },
  "352": { GOL: 1, DEF: 3, MEI: 5, ATA: 2 },
  "532": { GOL: 1, DEF: 5, MEI: 3, ATA: 2 },
  "343": { GOL: 1, DEF: 3, MEI: 4, ATA: 3 },
};

export function calcularPreco(forca) {
  return forca * 150_000;
}

export function calcularCaixaInicial(pote) {
  const map = { 1: 8_000_000, 2: 5_000_000, 3: 3_000_000, 4: 1_500_000 };
  return map[pote] ?? 2_000_000;
}

export function calcularRendaMandante(forcaMedia) {
  return Math.round(200_000 + forcaMedia * 15_000);
}
