/**
 * Store Vue 3 — estado reativo + persistência automática (F5 não perde o jogo).
 */
import { reactive, watch, toRaw } from "vue";
import { carregarBase, getSelecoes, getSelecaoPorId, normalizarDuracaoPartida } from "../game/data.js";
import {
  criarEstadoInicial,
  salvar as salvarLegado,
  carregarSave as carregarLegado,
  sincronizarElenco,
  bindEstado,
  autoEscalar,
  trocarSelecao,
} from "../game/state.js";
import { iniciarTorneio, sincronizarRodadaGrupos, hidratarTorneio } from "../game/tournament.js";
import { buildElencoMap } from "../game/match.js";
import { hidratarPartidaSalva } from "../composables/usePartida.js";

const SAVE_KEY = "copafoot_save_v2";
const SAVE_KEY_OLD = "copafoot_save";

export const store = reactive({
  baseLoaded: false,
  elencoMap: null,
  /** UI efêmera da partida (espelha estado.partidaSalva ao retomar). */
  partida: {
    ativa: false,
    contexto: null,
    placar: { gm: 0, gv: 0 },
    minuto: 0,
    linhas: [],
    finalizada: false,
    outrosPlacares: [],
  },
  ui: {
    tela: "menu",
    hubPanel: "torneio",
    filtroMercado: "",
    toast: "",
  },
  estado: null,
});

bindEstado(
  () => store.estado,
  (v) => {
    store.estado = v;
  }
);

let persistTimer = null;

function persistirAgora() {
  if (!store.estado) return;
  const payload = {
    versao: 2,
    ui: {
      tela: store.ui.tela === "partida" ? "hub" : store.ui.tela,
      hubPanel: store.ui.hubPanel,
    },
    estado: toRaw(store.estado),
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
}

/** Grava no localStorage com debounce (evita travar durante a partida). */
function persistir() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(persistirAgora, 200);
}

/** Grava imediatamente (fim de partida, fechar aba). */
export function salvarImediato() {
  clearTimeout(persistTimer);
  persistirAgora();
}

function migrarSaveAntigo() {
  const raw = localStorage.getItem(SAVE_KEY_OLD);
  if (!raw) return null;
  try {
    const estado = JSON.parse(raw);
    localStorage.removeItem(SAVE_KEY_OLD);
    return { ui: { tela: "hub", hubPanel: "torneio" }, estado };
  } catch {
    return null;
  }
}

export function carregarPersistido() {
  let raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    const antigo = migrarSaveAntigo();
    if (antigo) return antigo;
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function restaurarSave(saved) {
  if (!saved?.estado) return false;

  store.estado = saved.estado;

  if (!store.estado.playerOwner) {
    store.estado.playerOwner = {};
    for (const sel of getSelecoes()) {
      for (const j of sel.jogadores) {
        store.estado.playerOwner[j.id] = sel.id;
      }
    }
    for (const id of store.estado.elencoIds ?? []) {
      store.estado.playerOwner[id] = store.estado.selecaoId;
    }
  }

  sincronizarElenco();
  store.estado.duracaoPartidaMs = normalizarDuracaoPartida(store.estado.duracaoPartidaMs);

  if (store.estado.torneio) {
    hidratarTorneio(store.estado.torneio);
  }

  if (saved.ui) {
    store.ui.tela = saved.ui.tela === "partida" ? "hub" : saved.ui.tela ?? "hub";
    store.ui.hubPanel = saved.ui.hubPanel ?? "torneio";
  } else {
    store.ui.tela = "hub";
  }

  hidratarPartidaSalva();

  return true;
}

export function temSave() {
  return !!(localStorage.getItem(SAVE_KEY) || localStorage.getItem(SAVE_KEY_OLD));
}

export function limparSave() {
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(SAVE_KEY_OLD);
  store.estado = null;
  store.ui.tela = "menu";
  store.ui.hubPanel = "torneio";
}

export async function initApp() {
  await carregarBase();
  store.baseLoaded = true;
  store.elencoMap = buildElencoMap(getSelecoes());

  const saved = carregarPersistido();
  if (saved?.estado) {
    restaurarSave(saved);
  }
}

export function iniciarNovoJogo(selecaoId) {
  const selecoes = getSelecoes();
  const estado = criarEstadoInicial(selecaoId, selecoes);
  estado.torneio = iniciarTorneio(
    selecoes.map((s) => s.id),
    selecaoId
  );
  store.estado = estado;
  store.partida = {
    ativa: false,
    contexto: null,
    placar: { gm: 0, gv: 0 },
    minuto: 0,
    linhas: [],
    finalizada: false,
  };
  store.ui.tela = "hub";
  store.ui.hubPanel = "torneio";
  persistir();
}

export function irPara(tela) {
  store.ui.tela = tela;
  persistir();
}

export function setHubPanel(panel) {
  store.ui.hubPanel = panel;
  persistir();
}

export function toast(msg) {
  store.ui.toast = msg;
  setTimeout(() => {
    if (store.ui.toast === msg) store.ui.toast = "";
  }, 3500);
}

export function salvar() {
  persistir();
}

// Auto-save com debounce (não grava 90x por partida)
watch(
  () => store.estado,
  () => persistir(),
  { deep: true }
);

watch(
  () => [store.ui.tela, store.ui.hubPanel],
  () => persistir()
);

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", salvarImediato);
}

export { autoEscalar, trocarSelecao, sincronizarElenco };
