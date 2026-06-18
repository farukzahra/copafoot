/** Estado do jogo + save/load (localStorage). */

import { getSelecaoPorId, calcularCaixaInicial } from "./data.js";

const SAVE_KEY = "copafoot_save";

export function criarEstadoInicial(selecaoId, selecoes) {
  const sel = getSelecaoPorId(selecaoId);
  if (!sel) throw new Error("Seleção inválida");

  const playerOwner = {};
  for (const s of selecoes) {
    for (const j of s.jogadores) {
      playerOwner[j.id] = s.id;
    }
  }

  const elencoIds = sel.jogadores.map((j) => j.id);
  const formacao = "442";
  const lineup = autoEscalar(elencoIds, formacao, sel.jogadores);

  return {
    versao: 1,
    selecaoId,
    caixa: calcularCaixaInicial(sel.pote),
    playerOwner,
    elencoIds,
    formacao,
    lineup,
    duracaoPartidaMs: 60_000,
    torneio: null,
    convitePendente: null,
    conviteCarreiraOferecido: false,
    faseCarreira: sel.pote,
    historico: [],
  };
}

/** Escala automaticamente os melhores por posição. */
export function autoEscalar(elencoIds, formacao, jogadoresLista) {
  const slots = getSlotsFormacao(formacao);
  const pool = jogadoresLista.filter((j) => elencoIds.includes(j.id));
  const lineup = [];
  for (const [pos, qtd] of Object.entries(slots)) {
    const candidatos = pool
      .filter((j) => j.posicao === pos && !lineup.includes(j.id))
      .sort((a, b) => b.forca - a.forca)
      .slice(0, qtd);
    for (const c of candidatos) lineup.push(c.id);
  }
  return lineup;
}

export function getSlotsFormacao(formacao) {
  const map = {
    "442": { GOL: 1, DEF: 4, MEI: 4, ATA: 2 },
    "433": { GOL: 1, DEF: 4, MEI: 3, ATA: 3 },
    "352": { GOL: 1, DEF: 3, MEI: 5, ATA: 2 },
    "532": { GOL: 1, DEF: 5, MEI: 3, ATA: 2 },
    "343": { GOL: 1, DEF: 3, MEI: 4, ATA: 3 },
  };
  return map[formacao] ?? map["442"];
}

let estado = null;

export function getEstado() {
  return estado;
}

export function setEstado(novo) {
  estado = novo;
}

export function salvar() {
  if (!estado) return;
  localStorage.setItem(SAVE_KEY, JSON.stringify(estado));
}

export function carregarSave() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function temSave() {
  return !!localStorage.getItem(SAVE_KEY);
}

export function limparSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function sincronizarElenco() {
  if (!estado?.playerOwner) return;
  estado.elencoIds = Object.entries(estado.playerOwner)
    .filter(([, owner]) => owner === estado.selecaoId)
    .map(([id]) => id);
}

export function adicionarJogadorElenco(jogadorId, selecaoId) {
  if (!estado.playerOwner) estado.playerOwner = {};
  estado.playerOwner[jogadorId] = selecaoId ?? estado.selecaoId;
  sincronizarElenco();
}

export function removerJogadorElenco(jogadorId, selecaoOrigem) {
  if (estado.playerOwner && selecaoOrigem) {
    estado.playerOwner[jogadorId] = selecaoOrigem;
  }
  estado.lineup = estado.lineup.filter((id) => id !== jogadorId);
  sincronizarElenco();
}

export function trocarSelecao(novaSelecaoId) {
  const sel = getSelecaoPorId(novaSelecaoId);
  const antiga = estado.selecaoId;
  for (const [id, owner] of Object.entries(estado.playerOwner ?? {})) {
    if (owner === antiga) estado.playerOwner[id] = novaSelecaoId;
  }
  estado.selecaoId = novaSelecaoId;
  estado.faseCarreira = sel.pote;
  sincronizarElenco();
  salvar();
}
