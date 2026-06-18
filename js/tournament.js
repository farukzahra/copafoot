/** Torneio: 4 grupos de 4, turno único, mata-mata com 8 classificados. */

function embaralhar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function criarGrupos(selecaoIds, timeJogadorId) {
  const ids = embaralhar(selecaoIds);
  // Garante que o time do jogador fique no grupo A (índice 0)
  const idx = ids.indexOf(timeJogadorId);
  if (idx > 0) [ids[0], ids[idx]] = [ids[idx], ids[0]];

  const grupos = [];
  for (let g = 0; g < 4; g++) {
    const times = ids.slice(g * 4, g * 4 + 4);
    grupos.push({
      nome: String.fromCharCode(65 + g),
      times,
      jogos: gerarJogosGrupo(times),
      classificacao: times.map((id) => ({
        id,
        pts: 0,
        j: 0,
        v: 0,
        e: 0,
        d: 0,
        gp: 0,
        gc: 0,
        sg: 0,
      })),
    });
  }
  return grupos;
}

function gerarJogosGrupo(times) {
  const pares = [
    [0, 1], [2, 3],
    [0, 2], [1, 3],
    [0, 3], [1, 2],
  ];
  return pares.map(([a, b], i) => ({
    id: `G${i}`,
    mandante: times[a],
    visitante: times[b],
    golsMandante: null,
    golsVisitante: null,
    jogado: false,
    rodada: Math.floor(i / 2) + 1,
  }));
}

export function iniciarTorneio(selecaoIds, timeJogadorId) {
  const grupos = criarGrupos(selecaoIds, timeJogadorId);
  return {
    fase: "grupos",
    rodadaAtual: 1,
    grupos,
    mataMata: null,
    campeao: null,
  };
}

export function getProximoJogo(torneio, timeJogadorId) {
  if (torneio.fase === "grupos") {
    for (const grupo of torneio.grupos) {
      for (const jogo of grupo.jogos) {
        if (!jogo.jogado && (jogo.mandante === timeJogadorId || jogo.visitante === timeJogadorId)) {
          return { ...jogo, grupo: grupo.nome, fase: "grupos" };
        }
      }
    }
    return null;
  }

  if (torneio.fase === "mata-mata" && torneio.mataMata) {
    for (const jogo of torneio.mataMata.jogos) {
      if (!jogo.jogado && (jogo.mandante === timeJogadorId || jogo.visitante === timeJogadorId)) {
        return { ...jogo, fase: "mata-mata", faseNome: torneio.mataMata.nome };
      }
    }
  }
  return null;
}

/** Simula jogos da rodada que não envolvem o jogador. */
export function simularRodadaIA(torneio, timeJogadorId, simularPartidaFn) {
  if (torneio.fase !== "grupos") return;

  for (const grupo of torneio.grupos) {
    for (const jogo of grupo.jogos) {
      if (jogo.jogado) continue;
      if (jogo.mandante === timeJogadorId || jogo.visitante === timeJogadorId) continue;
      const res = simularPartidaFn(jogo.mandante, jogo.visitante, false);
      registrarResultadoGrupo(grupo, jogo, res.golsMandante, res.golsVisitante);
    }
  }
}

export function registrarResultadoGrupo(grupo, jogo, golsMandante, golsVisitante) {
  jogo.golsMandante = golsMandante;
  jogo.golsVisitante = golsVisitante;
  jogo.jogado = true;

  atualizarClassificacao(grupo.classificacao, jogo.mandante, golsMandante, golsVisitante);
  atualizarClassificacao(grupo.classificacao, jogo.visitante, golsVisitante, golsMandante);
  grupo.classificacao.sort((a, b) => b.pts - a.pts || b.sg - a.sg || b.gp - a.gp);
}

function atualizarClassificacao(tab, timeId, gf, gc) {
  const row = tab.find((t) => t.id === timeId);
  if (!row) return;
  row.j++;
  row.gp += gf;
  row.gc += gc;
  row.sg = row.gp - row.gc;
  if (gf > gc) { row.v++; row.pts += 3; }
  else if (gf === gc) { row.e++; row.pts += 1; }
  else row.d++;
}

export function gruposConcluidos(torneio) {
  return torneio.grupos.every((g) => g.jogos.every((j) => j.jogado));
}

export function iniciarMataMata(torneio) {
  const classificados = [];
  for (const g of torneio.grupos) {
    classificados.push(g.classificacao[0].id, g.classificacao[1].id);
  }
  const jogos = [
    { id: "QF1", mandante: classificados[0], visitante: classificados[7], golsMandante: null, golsVisitante: null, jogado: false },
    { id: "QF2", mandante: classificados[3], visitante: classificados[4], golsMandante: null, golsVisitante: null, jogado: false },
    { id: "QF3", mandante: classificados[1], visitante: classificados[6], golsMandante: null, golsVisitante: null, jogado: false },
    { id: "QF4", mandante: classificados[2], visitante: classificados[5], golsMandante: null, golsVisitante: null, jogado: false },
  ];
  torneio.fase = "mata-mata";
  torneio.mataMata = { nome: "Quartas de final", rodada: 0, jogos };
}

export function avancarMataMata(torneio) {
  const mm = torneio.mataMata;
  if (!mm.jogos.every((j) => j.jogado)) return false;

  const vencedores = mm.jogos.map((j) =>
    j.golsMandante > j.golsVisitante ? j.mandante : j.visitante
  );

  if (vencedores.length === 1) {
    torneio.campeao = vencedores[0];
    torneio.fase = "fim";
    return true;
  }

  const nomes = { 4: "Semifinal", 2: "Final" };
  const jogos = [];
  for (let i = 0; i < vencedores.length; i += 2) {
    jogos.push({
      id: `MM${mm.rodada}-${i}`,
      mandante: vencedores[i],
      visitante: vencedores[i + 1],
      golsMandante: null,
      golsVisitante: null,
      jogado: false,
    });
  }
  torneio.mataMata = { nome: nomes[vencedores.length] ?? "Mata-mata", rodada: mm.rodada + 1, jogos };
  return false;
}

export function registrarResultadoMataMata(torneio, jogoId, golsMandante, golsVisitante) {
  const jogo = torneio.mataMata.jogos.find((j) => j.id === jogoId);
  if (!jogo) return;
  // Empate no mata-mata: pênaltis simplificados (sorteio)
  if (golsMandante === golsVisitante) {
    if (Math.random() < 0.5) golsMandante++;
    else golsVisitante++;
  }
  jogo.golsMandante = golsMandante;
  jogo.golsVisitante = golsVisitante;
  jogo.jogado = true;

  if (torneio.mataMata.jogos.every((j) => j.jogado)) {
    avancarMataMata(torneio);
  }
}

export function getGrupoDoTime(torneio, timeId) {
  return torneio.grupos.find((g) => g.times.includes(timeId));
}

export function simularTodosJogosPendentes(torneio, simularPartidaFn) {
  for (const grupo of torneio.grupos) {
    for (const jogo of grupo.jogos) {
      if (jogo.jogado) continue;
      const res = simularPartidaFn(jogo.mandante, jogo.visitante);
      registrarResultadoGrupo(grupo, jogo, res.golsMandante, res.golsVisitante);
    }
  }
}
