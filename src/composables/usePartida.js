/** Lógica de partida ao vivo, pausa (F5) e retomada. */
import { getSelecaoPorId, calcularRendaMandante } from "../game/data.js";
import { getEstado } from "../game/state.js";
import {
  getProximoJogo,
  listarOutrosJogosRodada,
  avancarRodadaGruposSePronto,
  registrarResultadoGrupoComHistorico,
  gruposConcluidos,
  iniciarMataMata,
  registrarResultadoMataMata,
  getGrupoDoTime,
  getGrupoPorNome,
  resolverJogo,
  iniciarTorneio,
  timeEliminado,
  timeAtivoNoTorneio,
  encontrarJogoMataMata,
  completarRodadaTorneio,
  sincronizarRodadaGrupos,
} from "../game/tournament.js";
import { jogarPartidaAoVivo, iniciarPartidasParalelas, completarPlacaresParalelos, simularPartidaRapida } from "../game/match.js";
import { DURACAO_PARTIDA_PADRAO_MS } from "../game/data.js";
import { narrarInicio } from "../game/narrator.js";
import { listarMeuElenco } from "../game/market.js";
import { store, salvar, salvarImediato, irPara, toast, setHubPanel } from "../stores/gameStore.js";
import { getSelecoes } from "../game/data.js";

let partidaController = null;
let paralelasController = null;

/** Converte retorno de getProximoJogo ou save em objeto plano para persistência. */
export function contextoDeJogo(proxOuCtx) {
  if (!proxOuCtx) return null;
  const j = proxOuCtx.jogo ?? proxOuCtx;
  return {
    id: j.id,
    mandante: j.mandante,
    visitante: j.visitante,
    grupo: proxOuCtx.grupo ?? j.grupo,
    fase: proxOuCtx.fase ?? j.fase ?? "grupos",
    faseNome: proxOuCtx.faseNome,
  };
}

export function chaveJogo(proxOuCtx) {
  const c = contextoDeJogo(proxOuCtx);
  if (!c) return "";
  return `${c.fase}-${c.grupo ?? ""}-${c.id}-${c.mandante}-${c.visitante}`;
}

export function getProximoJogoUsuario() {
  const estado = getEstado();
  if (!estado?.torneio) return null;
  return getProximoJogo(estado.torneio, estado.selecaoId);
}

export function getPartidaSalva() {
  return getEstado()?.partidaSalva ?? null;
}

export function temPartidaPausada() {
  const salva = getPartidaSalva();
  const prox = getProximoJogoUsuario();
  if (!salva || salva.finalizada) return false;
  return salva.jogoKey === chaveJogo(prox);
}

export function labelBotaoPartida() {
  return temPartidaPausada() ? "▶ Continuar partida" : "▶ Jogar agora";
}

export function validarAntesDeJogar() {
  const estado = getEstado();
  const prox = getProximoJogoUsuario();
  if (!prox && !temPartidaPausada()) return { ok: false, msg: "Nenhum jogo pendente." };
  if (estado.lineup.length < 11) {
    return { ok: false, msg: "Escale pelo menos 11 jogadores antes de jogar!" };
  }
  return { ok: true, prox };
}

function pararPartidaAoVivo() {
  partidaController?.cancel?.();
  partidaController = null;
  paralelasController?.cancel?.();
  paralelasController = null;
}

function chaveJogoParalelo(item) {
  const j = item.jogo;
  return `${item.fase}-${item.grupo ?? ""}-${j.id}-${j.mandante}-${j.visitante}`;
}

function montarSpecsParalelas(torneio, timeJogadorId) {
  return listarOutrosJogosRodada(torneio, timeJogadorId).map((item) => ({
    key: chaveJogoParalelo(item),
    mandanteId: item.jogo.mandante,
    visitanteId: item.jogo.visitante,
    meta: {
      fase: item.fase,
      grupo: item.grupo ?? null,
      jogoId: item.jogo.id,
      mandante: item.jogo.mandante,
      visitante: item.jogo.visitante,
    },
  }));
}

function montarOutrosPlacaresUI(specs, salvaOutros = null) {
  const mapa = salvaOutros
    ? Object.fromEntries(salvaOutros.map((o) => [o.key, o]))
    : {};
  return specs.map((spec) => {
    const s = mapa[spec.key];
    return {
      key: spec.key,
      mand: getSelecaoPorId(spec.mandanteId),
      vis: getSelecaoPorId(spec.visitanteId),
      gm: s?.gm ?? 0,
      gv: s?.gv ?? 0,
      minuto: s?.minuto ?? 0,
      intervaloFeito: s?.intervaloFeito ?? false,
      finalizada: s?.finalizada ?? false,
      meta: spec.meta,
    };
  });
}

function sincronizarOutrosPlacares(snapshot) {
  const mapa = Object.fromEntries(snapshot.map((s) => [s.key, s]));
  for (const p of store.partida.outrosPlacares ?? []) {
    const s = mapa[p.key];
    if (!s) continue;
    p.gm = s.gm;
    p.gv = s.gv;
    p.minuto = s.minuto;
    p.intervaloFeito = s.intervaloFeito;
    p.finalizada = s.finalizada;
  }
}

function iniciarParalelas(contexto, resumeOutros = null) {
  const estado = getEstado();
  const specs = montarSpecsParalelas(estado.torneio, estado.selecaoId);
  if (!specs.length) {
    store.partida.outrosPlacares = [];
    return;
  }

  store.partida.outrosPlacares = montarOutrosPlacaresUI(specs, resumeOutros);

  const duracao = estado.duracaoPartidaMs ?? DURACAO_PARTIDA_PADRAO_MS;
  const msPorMinuto = Math.max(40, duracao / 90);
  const resumeMap = resumeOutros
    ? Object.fromEntries(resumeOutros.map((o) => [o.key, o]))
    : null;

  paralelasController = iniciarPartidasParalelas(
    specs,
    store.elencoMap,
    msPorMinuto,
    (snapshot) => {
      sincronizarOutrosPlacares(snapshot);
      persistirPartidaSalva(false);
    },
    resumeMap
  );
}

function registrarOutrosPlacares(torneio) {
  for (const p of store.partida.outrosPlacares ?? []) {
    const { meta } = p;
    if (meta.fase === "grupos") {
      const grupo = torneio.grupos.find((g) => g.nome === meta.grupo);
      const jogo = grupo?.jogos.find(
        (j) => j.id === meta.jogoId && j.mandante === meta.mandante && j.visitante === meta.visitante
      );
      if (jogo && !jogo.jogado) {
        registrarResultadoGrupoComHistorico(torneio, grupo, jogo, p.gm, p.gv, { simulado: true });
      }
    } else {
      const encontrado = encontrarJogoMataMata(torneio, meta);
      if (!encontrado?.jogo || encontrado.jogo.jogado) continue;
      const faseAtual = torneio.mataMata;
      torneio.mataMata = encontrado.fase;
      registrarResultadoMataMata(torneio, meta.jogoId, p.gm, p.gv, { simulado: true });
      if (!torneio.mataMata && faseAtual) {
        /* campeonato encerrado */
      } else if (!torneio.chaveKO?.some((f) => f === torneio.mataMata) && faseAtual) {
        torneio.mataMata = faseAtual;
      }
    }
  }
}

function simularFn() {
  return (m, v) => simularPartidaRapida(m, v, store.elencoMap);
}

function fecharRodadaTorneio(torneio, timeJogadorId) {
  registrarOutrosPlacares(torneio);
  completarRodadaTorneio(torneio, timeJogadorId, simularFn());
}

function serializarOutrosPlacares(placares = []) {
  return placares.map((o) => ({
    key: o.key,
    mandanteId: o.mand?.id ?? o.mandanteId,
    visitanteId: o.vis?.id ?? o.visitanteId,
    gm: o.gm,
    gv: o.gv,
    minuto: o.minuto,
    intervaloFeito: o.intervaloFeito ?? false,
    finalizada: o.finalizada ?? false,
    meta: o.meta,
  }));
}

function restaurarOutrosPlacaresSalvos(salvos = []) {
  return salvos.map((o) => ({
    key: o.key,
    mand: getSelecaoPorId(o.mandanteId ?? o.mand?.id),
    vis: getSelecaoPorId(o.visitanteId ?? o.vis?.id),
    gm: o.gm ?? 0,
    gv: o.gv ?? 0,
    minuto: o.minuto ?? 0,
    intervaloFeito: o.intervaloFeito ?? false,
    finalizada: o.finalizada ?? false,
    meta: o.meta,
  }));
}

function montarStorePartida(contexto, salva = null) {
  const mand = getSelecaoPorId(contexto.mandante);
  const vis = getSelecaoPorId(contexto.visitante);
  store.partida = {
    ativa: true,
    contexto,
    mand,
    vis,
    placar: salva ? { ...salva.placar } : { gm: 0, gv: 0 },
    minuto: salva?.minuto ?? 0,
    linhas: salva
      ? [...salva.linhas]
      : [{ minuto: 0, texto: narrarInicio(), tipo: "info" }],
    finalizada: false,
    intervaloFeito: salva?.intervaloFeito ?? false,
    outrosPlacares: salva?.outrosPlacares
      ? restaurarOutrosPlacaresSalvos(salva.outrosPlacares)
      : [],
  };
}

function onEventoPartida(ev) {
  if (ev.placar) {
    store.partida.placar = { gm: ev.placar.gm, gv: ev.placar.gv };
  }
  if (ev.minuto != null) store.partida.minuto = ev.minuto;
  if (ev.intervaloFeito != null) store.partida.intervaloFeito = ev.intervaloFeito;

  if (ev.texto) {
    store.partida.linhas.push({
      minuto: ev.minuto,
      texto: ev.texto,
      tipo: ev.tipo,
      timeId: ev.timeId,
      timeNome: ev.timeNome,
    });
    persistirPartidaSalva(false);
  } else if (ev.tipo === "tick") {
    persistirPartidaSalva(false);
  }
}

function persistirPartidaSalva(imediato = false) {
  const estado = getEstado();
  const p = store.partida;
  if (!p.contexto || p.finalizada) return;

  estado.partidaSalva = {
    jogoKey: chaveJogo(p.contexto),
    contexto: { ...p.contexto },
    placar: { ...p.placar },
    minuto: p.minuto,
    linhas: [...p.linhas],
    intervaloFeito: p.intervaloFeito ?? false,
    rodadaIASimulada: true,
    finalizada: false,
    outrosPlacares: serializarOutrosPlacares(p.outrosPlacares),
  };

  if (imediato) salvarImediato();
  else salvar();
}

function limparPartidaSalva() {
  const estado = getEstado();
  if (estado) delete estado.partidaSalva;
}

function executarPartida(prox, resume) {
  pararPartidaAoVivo();
  const ctx = contextoDeJogo(prox);
  montarStorePartida(ctx, resume);
  irPara("partida");
  persistirPartidaSalva(true);

  iniciarParalelas(ctx, resume?.outrosPlacares ?? null);

  partidaController = jogarPartidaAoVivo(
    ctx.mandante,
    ctx.visitante,
    store.elencoMap,
    {
      onEvento: onEventoPartida,
      onFim({ golsMandante, golsVisitante }) {
        store.partida.minuto = 90;
        store.partida.finalizada = true;
        store.partida.ativa = false;
        finalizarPartida(golsMandante, golsVisitante);
      },
    },
    resume
      ? {
          placar: resume.placar,
          minuto: resume.minuto,
          intervaloFeito: resume.intervaloFeito,
          linhas: resume.linhas,
        }
      : {
          placar: store.partida.placar,
          minuto: store.partida.minuto,
          intervaloFeito: store.partida.intervaloFeito,
          linhas: store.partida.linhas,
        }
  );
}

/** Inicia partida nova ou retoma a pausada (F5). */
export function iniciarPartidaAoVivo() {
  const estado = getEstado();
  const salva = getPartidaSalva();
  const prox = getProximoJogoUsuario();

  if (salva && !salva.finalizada && salva.jogoKey === chaveJogo(prox)) {
    executarPartida(salva.contexto, salva);
    return;
  }

  if (!prox) return;

  executarPartida(prox, null);
}

function finalizarPartida(gm, gv) {
  try {
    completarPlacaresParalelos(store.partida.outrosPlacares ?? [], store.elencoMap);
    pararPartidaAoVivo();
    const estado = getEstado();
    const ctx = store.partida.contexto;
    const resolved = resolverJogo(estado.torneio, ctx);

    if (!resolved?.jogo) {
      console.error("CopaFoot: jogo não encontrado no torneio", ctx);
      return;
    }

    const souMandante = resolved.jogo.mandante === estado.selecaoId;

    if (resolved.fase === "grupos") {
      const grupo = getGrupoPorNome(estado.torneio, resolved.grupo);
      if (!grupo) throw new Error("Grupo não encontrado");
      registrarResultadoGrupoComHistorico(estado.torneio, grupo, resolved.jogo, gm, gv);
      fecharRodadaTorneio(estado.torneio, estado.selecaoId);

      if (gruposConcluidos(estado.torneio)) {
        iniciarMataMata(estado.torneio);
      }
    } else {
      fecharRodadaTorneio(estado.torneio, estado.selecaoId);
      registrarResultadoMataMata(estado.torneio, resolved.jogo.id, gm, gv);
    }

    if (souMandante) {
      const elenco = listarMeuElenco();
      const media = elenco.reduce((s, j) => s + j.forca, 0) / (elenco.length || 1);
      estado.caixa += calcularRendaMandante(media);
    }

    store.partida.placar = { gm, gv };
    limparPartidaSalva();
    salvarImediato();
  } catch (err) {
    console.error("CopaFoot: erro ao finalizar partida", err);
  } finally {
    store.partida.minuto = 90;
    store.partida.finalizada = true;
    store.partida.ativa = false;
  }
}

/** DEBUG: encerra partida + jogos paralelos na hora (testes). */
export function debugEncerrarPartida() {
  if (store.partida.finalizada || !store.partida.contexto) return;

  const gm = store.partida.placar?.gm ?? 0;
  const gv = store.partida.placar?.gv ?? 0;

  pararPartidaAoVivo();
  completarPlacaresParalelos(store.partida.outrosPlacares ?? [], store.elencoMap);

  store.partida.minuto = 90;
  store.partida.intervaloFeito = true;
  store.partida.linhas.push({
    minuto: 90,
    texto: "Apito final (debug).",
    tipo: "fim",
  });

  finalizarPartida(gm, gv);
}

export function continuarAposPartida() {
  const estado = getEstado();
  if (estado?.torneio && !getProximoJogo(estado.torneio, estado.selecaoId)) {
    fecharRodadaTorneio(estado.torneio, estado.selecaoId);
    if (estado.torneio.fase === "grupos" && gruposConcluidos(estado.torneio)) {
      iniciarMataMata(estado.torneio);
    }
    sincronizarRodadaGrupos(estado.torneio);
    salvarImediato();
  }

  verificarConvite();
  if (estado?.convitePendente) return;
  if (estado?.torneio?.fase === "fim") {
    irPara("fim");
    return;
  }
  setHubPanel("torneio");
  irPara("hub");
}

function verificarConvite() {
  const estado = getEstado();
  if (!estado?.torneio || estado.convitePendente || estado.conviteCarreiraOferecido) return;

  const sel = getSelecaoPorId(estado.selecaoId);
  if (!sel) return;

  const grupo = getGrupoDoTime(estado.torneio, estado.selecaoId);
  const posicao = grupo?.classificacao.findIndex((r) => r.id === estado.selecaoId) ?? -1;

  if (estado.torneio.fase !== "mata-mata" || sel.pote < 2 || posicao < 0 || posicao > 1) {
    return;
  }

  const koIniciado = (estado.torneio.chaveKO ?? []).some((f) => f.jogos.some((j) => j.jogado));
  if (koIniciado) return;

  estado.conviteCarreiraOferecido = true;

  const candidatas = getSelecoes().filter(
    (s) =>
      s.pote === sel.pote - 1 &&
      s.id !== estado.selecaoId &&
      timeAtivoNoTorneio(estado.torneio, s.id)
  );
  if (!candidatas.length) return;

  estado.convitePendente = candidatas[Math.floor(Math.random() * candidatas.length)].id;
  salvar();
  irPara("convite");
}

function verificarFim() {
  const estado = getEstado();
  if (estado.torneio.fase !== "fim") return;
  irPara("fim");
}

export function getConviteSelecao() {
  const estado = getEstado();
  if (!estado?.convitePendente) return null;
  const sel = getSelecaoPorId(estado.convitePendente);
  if (!sel || !estado.torneio || !timeAtivoNoTorneio(estado.torneio, sel.id)) {
    estado.convitePendente = null;
    salvar();
    return null;
  }
  return sel;
}

export function usuarioEliminado() {
  const estado = getEstado();
  if (!estado?.torneio) return false;
  return timeEliminado(estado.torneio, estado.selecaoId);
}

/** Hidrata store.partida ao restaurar save (para UI do hub). */
export function hidratarPartidaSalva() {
  const salva = getPartidaSalva();
  if (!salva || salva.finalizada) return;
  const prox = getProximoJogoUsuario();
  if (salva.jogoKey !== chaveJogo(prox)) return;
  montarStorePartida(salva.contexto, salva);
  store.partida.ativa = false;
}

/** Reinicia o campeonato mantendo elenco, caixa e escalação. */
export function reiniciarCampeonato() {
  const estado = getEstado();
  if (!estado) return false;

  pararPartidaAoVivo();
  delete estado.partidaSalva;
  estado.convitePendente = null;
  estado.conviteCarreiraOferecido = false;

  estado.torneio = iniciarTorneio(
    getSelecoes().map((s) => s.id),
    estado.selecaoId
  );

  store.partida = {
    ativa: false,
    contexto: null,
    placar: { gm: 0, gv: 0 },
    minuto: 0,
    linhas: [],
    finalizada: false,
    outrosPlacares: [],
  };

  store.ui.tela = "hub";
  store.ui.hubPanel = "torneio";
  salvarImediato();
  toast("Campeonato reiniciado!");
  return true;
}
