/** Simulação de partida com narração minuto a minuto. */

import { getSelecaoPorId } from "./data.js";
import { getEstado } from "./state.js";
import { getElencoDoTime } from "./market.js";
import {
  narrarInicio,
  narrarIntervalo,
  narrarFim,
  narrarLanceNeutro,
  narrarChance,
  narrarGol,
} from "./narrator.js";

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
 * @param {function} opts.onEvento - ({ minuto, texto, tipo })
 * @param {function} opts.onFim - ({ golsMandante, golsVisitante })
 */
export function jogarPartidaAoVivo(mandanteId, visitanteId, elencoMap, opts) {
  const mandante = getSelecaoPorId(mandanteId);
  const visitante = getSelecaoPorId(visitanteId);
  const fm = forcaTime(mandanteId, elencoMap);
  const fv = forcaTime(visitanteId, elencoMap);
  const duracao = getEstado()?.duracaoPartidaMs ?? 60_000;
  const msPorMinuto = duracao / 90;

  let gm = 0;
  let gv = 0;
  let minuto = 0;
  let intervaloFeito = false;

  opts.onEvento({ minuto: 0, texto: narrarInicio(), tipo: "info" });

  const tick = () => {
    minuto++;
    if (minuto > 90) {
      opts.onEvento({
        minuto: 90,
        texto: narrarFim(mandante.nome, visitante.nome, gm, gv),
        tipo: "fim",
      });
      opts.onFim({ golsMandante: gm, golsVisitante: gv });
      return;
    }

    if (minuto === 45 && !intervaloFeito) {
      intervaloFeito = true;
      opts.onEvento({
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
      opts.onEvento({
        minuto,
        texto: narrarGol(art, mandante.nome),
        tipo: "gol",
        placar: { gm, gv },
      });
    } else if (r < ataqueM * 0.35 + ataqueV * 0.35) {
      const art = escolherArtilheiro(visitanteId, elencoMap);
      gv++;
      opts.onEvento({
        minuto,
        texto: narrarGol(art, visitante.nome),
        tipo: "gol",
        placar: { gm, gv },
      });
    } else if (r < 0.55) {
      const time = Math.random() < fm / (fm + fv) ? mandante : visitante;
      if (Math.random() < 0.4) {
        const art = escolherArtilheiro(time.id, elencoMap);
        opts.onEvento({
          minuto,
          texto: narrarChance(art, time.nome),
          tipo: "chance",
        });
      } else {
        opts.onEvento({
          minuto,
          texto: `${minuto}' — ${narrarLanceNeutro(time.nome)}`,
          tipo: "lance",
        });
      }
    }

    setTimeout(tick, msPorMinuto);
  };

  setTimeout(tick, msPorMinuto);
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
