/** Simulação de partida com narração minuto a minuto. */



import { getSelecaoPorId, DURACAO_PARTIDA_PADRAO_MS, densidadeNarracao } from "./data.js";

import { getEstado } from "./state.js";

import { getElencoDoTime } from "./market.js";

import {

  narrarIntervalo,

  narrarFim,

  narrarLanceNeutro,

  narrarChance,

  narrarGol,

} from "./narrator.js";

import { criarControleNarracao } from "./narracaoPacing.js";



function forcaTime(timeId, elencoMap) {

  const estado = getEstado();

  let jogadores;



  if (timeId === estado.selecaoId) {

    const ids = estado.lineup.length >= 11 ? estado.lineup : estado.elencoIds.slice(0, 11);

    jogadores = ids.map((id) => elencoMap.get(id)).filter(Boolean);

  } else {

    jogadores = getElencoDoTime(timeId)

      .sort((a, b) => b.forca - a.forca)

      .slice(0, 11);

  }



  const sel = getSelecaoPorId(timeId);

  if (!jogadores.length) return sel?.forcaMedia ?? 70;

  return jogadores.reduce((s, j) => s + j.forca, 0) / jogadores.length;

}



function escolherArtilheiro(timeId, elencoMap) {

  const estado = getEstado();

  let pool;



  if (timeId === estado.selecaoId) {

    pool = estado.lineup

      .map((id) => elencoMap.get(id))

      .filter((j) => j && (j.posicao === "ATA" || j.posicao === "MEI"));

    if (!pool.length) pool = estado.lineup.map((id) => elencoMap.get(id)).filter(Boolean);

  } else {

    pool = getElencoDoTime(timeId).filter((j) => j.posicao === "ATA" || j.posicao === "MEI");

  }



  if (!pool.length) return { nome: "Jogador", forca: 70 };

  pool.sort((a, b) => b.forca - a.forca);

  const top = pool.slice(0, 3);

  return top[Math.floor(Math.random() * top.length)];

}



/** Simulação instantânea (IA vs IA). */

export function simularPartidaRapida(mandanteId, visitanteId, elencoMap) {

  const fm = forcaTime(mandanteId, elencoMap);

  const fv = forcaTime(visitanteId, elencoMap);

  let gm = 0;

  let gv = 0;

  for (let m = 1; m <= 90; m++) {

    const ataqueM = (fm / 100) * (0.02 + Math.random() * 0.03);

    const ataqueV = (fv / 100) * (0.02 + Math.random() * 0.03);

    if (Math.random() < ataqueM) gm++;

    if (Math.random() < ataqueV) gv++;

  }

  return { golsMandante: gm, golsVisitante: gv };

}



/**

 * Partida com narração ao vivo.

 * @param {object} opts

 * @param {function} opts.onEvento - ({ minuto, texto, tipo, placar })

 * @param {function} opts.onFim - ({ golsMandante, golsVisitante })

 * @param {object} [resume] - retomar de partida salva

 * @returns {{ cancel: () => void }}

 */

export function jogarPartidaAoVivo(mandanteId, visitanteId, elencoMap, opts, resume = null) {

  const mandante = getSelecaoPorId(mandanteId);

  const visitante = getSelecaoPorId(visitanteId);

  const fm = forcaTime(mandanteId, elencoMap);

  const fv = forcaTime(visitanteId, elencoMap);

  const duracao = getEstado()?.duracaoPartidaMs ?? DURACAO_PARTIDA_PADRAO_MS;

  const msPorMinuto = Math.max(40, duracao / 90);

  const densidade = densidadeNarracao(duracao);



  let gm = resume?.placar?.gm ?? 0;

  let gv = resume?.placar?.gv ?? 0;

  let minuto = resume?.minuto ?? 0;

  let intervaloFeito = resume?.intervaloFeito ?? false;

  let cancelled = false;

  let tickTimer = null;

  const pacing = criarControleNarracao(duracao, resume);



  function agendarProximoTick() {

    if (cancelled || minuto > 90) return;

    tickTimer = setTimeout(tick, msPorMinuto);

  }



  function emitir(ev) {

    if (ev.texto && !pacing.podeEmitir(ev.tipo)) {

      if (pacing.ehPrioritaria(ev.tipo)) {

        setTimeout(() => emitir(ev), pacing.msAtePoderFalar());

      } else {

        opts.onEvento({

          minuto: ev.minuto,

          intervaloFeito: ev.intervaloFeito,

          tipo: "tick",

          placar: ev.placar,

        });

      }

      return;

    }

    opts.onEvento(ev);

    if (ev.texto) pacing.registrar(ev.tipo);

  }



  const tick = () => {

    if (cancelled) return;



    try {

      minuto++;



      if (minuto > 90) {

        emitir({

          minuto: 90,

          texto: narrarFim(mandante.nome, visitante.nome, gm, gv),

          tipo: "fim",

        });

        opts.onFim({ golsMandante: gm, golsVisitante: gv });

        return;

      }



      if (minuto === 45 && !intervaloFeito) {

        intervaloFeito = true;

        emitir({

          minuto: 45,

          texto: narrarIntervalo(mandante.nome, visitante.nome, gm, gv),

          tipo: "intervalo",

        });

      }



      const ataqueM = (fm / 100) * (0.025 + Math.random() * 0.04);

      const ataqueV = (fv / 100) * (0.025 + Math.random() * 0.04);

      const r = Math.random();



      if (r < ataqueM * 0.35) {

        const art = escolherArtilheiro(mandanteId, elencoMap);

        gm++;

        emitir({

          minuto,

          texto: narrarGol(art, mandante.nome),

          tipo: "gol",

          timeId: mandanteId,

          timeNome: mandante.nome,

          placar: { gm, gv },

          intervaloFeito,

        });

      } else if (r < ataqueM * 0.35 + ataqueV * 0.35) {

        const art = escolherArtilheiro(visitanteId, elencoMap);

        gv++;

        emitir({

          minuto,

          texto: narrarGol(art, visitante.nome),

          tipo: "gol",

          timeId: visitanteId,

          timeNome: visitante.nome,

          placar: { gm, gv },

          intervaloFeito,

        });

      } else if (r < 0.4 * densidade) {

        const time = Math.random() < fm / (fm + fv) ? mandante : visitante;

        if (Math.random() < 0.4) {

          const art = escolherArtilheiro(time.id, elencoMap);

          emitir({

            minuto,

            texto: narrarChance(art, time.nome),

            tipo: "chance",

            intervaloFeito,

          });

        } else {

          emitir({

            minuto,

            texto: narrarLanceNeutro(time.nome),

            tipo: "lance",

            intervaloFeito,

          });

        }

      } else {

        opts.onEvento({ minuto, intervaloFeito, tipo: "tick" });

      }

    } catch (err) {

      console.error("CopaFoot: erro no tick da partida", err);

    } finally {

      agendarProximoTick();

    }

  };



  agendarProximoTick();



  return {

    cancel: () => {

      cancelled = true;

      if (tickTimer) clearTimeout(tickTimer);

    },

  };

}



export function buildElencoMap(selecoes) {

  const map = new Map();

  for (const sel of selecoes) {

    for (const j of sel.jogadores) {

      map.set(j.id, { ...j, selecaoOrigem: sel.id });

    }

  }

  return map;

}

/** Partidas silenciosas em paralelo (mesmo ritmo da partida ao vivo). */
export function iniciarPartidasParalelas(jogos, elencoMap, msPorMinuto, onUpdate, resumeMap = null) {
  const estados = jogos.map((spec) => {
    const salvo = resumeMap?.[spec.key];
    return {
      key: spec.key,
      mandanteId: spec.mandanteId,
      visitanteId: spec.visitanteId,
      meta: spec.meta,
      fm: forcaTime(spec.mandanteId, elencoMap),
      fv: forcaTime(spec.visitanteId, elencoMap),
      gm: salvo?.gm ?? 0,
      gv: salvo?.gv ?? 0,
      minuto: salvo?.minuto ?? 0,
      intervaloFeito: salvo?.intervaloFeito ?? false,
      finalizada: salvo?.finalizada ?? false,
    };
  });

  let cancelled = false;
  let timer = null;

  function snapshot() {
    return estados.map((p) => ({
      key: p.key,
      gm: p.gm,
      gv: p.gv,
      minuto: p.minuto,
      intervaloFeito: p.intervaloFeito,
      finalizada: p.finalizada,
      meta: p.meta,
    }));
  }

  function tickUm(p) {
    if (p.finalizada) return;
    p.minuto++;
    if (p.minuto === 45 && !p.intervaloFeito) p.intervaloFeito = true;
    if (p.minuto > 90) {
      p.minuto = 90;
      p.finalizada = true;
      return;
    }
    const ataqueM = (p.fm / 100) * (0.025 + Math.random() * 0.04);
    const ataqueV = (p.fv / 100) * (0.025 + Math.random() * 0.04);
    const r = Math.random();
    if (r < ataqueM * 0.35) p.gm++;
    else if (r < ataqueM * 0.35 + ataqueV * 0.35) p.gv++;
  }

  function tick() {
    if (cancelled) return;
    let mudou = false;
    for (const p of estados) {
      if (!p.finalizada) {
        tickUm(p);
        mudou = true;
      }
    }
    if (mudou) onUpdate(snapshot());
    if (estados.every((p) => p.finalizada)) return;
    timer = setTimeout(tick, msPorMinuto);
  }

  timer = setTimeout(tick, msPorMinuto);

  return {
    cancel: () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    },
    getResultados: () =>
      estados.map((p) => ({
        key: p.key,
        golsMandante: p.gm,
        golsVisitante: p.gv,
        meta: p.meta,
      })),
  };
}

function tickPartidaSilenciosa(p) {
  if (p.finalizada) return;
  p.minuto++;
  if (p.minuto === 45 && !p.intervaloFeito) p.intervaloFeito = true;
  if (p.minuto > 90) {
    p.minuto = 90;
    p.finalizada = true;
    return;
  }
  const ataqueM = (p.fm / 100) * (0.025 + Math.random() * 0.04);
  const ataqueV = (p.fv / 100) * (0.025 + Math.random() * 0.04);
  const r = Math.random();
  if (r < ataqueM * 0.35) p.gm++;
  else if (r < ataqueM * 0.35 + ataqueV * 0.35) p.gv++;
}

/** Completa ao vivo os placares paralelos até o apito final. */
export function completarPlacaresParalelos(placares, elencoMap) {
  for (const p of placares) {
    if (p.finalizada) continue;
    const st = {
      gm: p.gm,
      gv: p.gv,
      minuto: p.minuto,
      intervaloFeito: p.intervaloFeito ?? false,
      finalizada: false,
      fm: forcaTime(p.meta?.mandante ?? p.mand?.id, elencoMap),
      fv: forcaTime(p.meta?.visitante ?? p.vis?.id, elencoMap),
    };
    while (st.minuto < 90) tickPartidaSilenciosa(st);
    p.gm = st.gm;
    p.gv = st.gv;
    p.minuto = 90;
    p.intervaloFeito = st.intervaloFeito;
    p.finalizada = true;
  }
}

