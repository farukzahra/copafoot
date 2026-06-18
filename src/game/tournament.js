/** Torneio: grupos de 4, turno único, mata-mata (2 por grupo). */

function embaralhar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Quantos grupos de 4 times cabem no campeonato. */
export function calcularNumGrupos(totalSelecoes) {
  return Math.max(1, Math.floor(totalSelecoes / 4));
}

export function calcularClassificados(numGrupos) {
  return numGrupos * 2;
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

function criarGrupos(selecaoIds, timeJogadorId) {
  const numGrupos = calcularNumGrupos(selecaoIds.length);
  const ids = embaralhar(selecaoIds);
  const idx = ids.indexOf(timeJogadorId);
  if (idx > 0) [ids[0], ids[idx]] = [ids[idx], ids[0]];

  const grupos = [];
  for (let g = 0; g < numGrupos; g++) {
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

function cloneJogo(j) {
  return { ...j };
}

function registrarNoHistorico(torneio, entrada) {
  if (!torneio.historico) torneio.historico = [];
  const idx = torneio.historico.findIndex(
    (h) =>
      h.fase === entrada.fase &&
      h.id === entrada.id &&
      (h.grupo ?? "") === (entrada.grupo ?? "") &&
      h.mandante === entrada.mandante
  );
  const registro = { ...entrada, jogado: true };
  if (idx >= 0) torneio.historico[idx] = registro;
  else torneio.historico.push(registro);
}

/** Reconstrói chaveKO / historico em saves antigos. */
export function hidratarTorneio(torneio) {
  if (!torneio) return;

  if (!torneio.historico) {
    torneio.historico = [];
    for (const grupo of torneio.grupos ?? []) {
      for (const j of grupo.jogos) {
        if (!j.jogado) continue;
        registrarNoHistorico(torneio, {
          fase: "grupos",
          grupo: grupo.nome,
          rodada: j.rodada,
          id: j.id,
          mandante: j.mandante,
          visitante: j.visitante,
          golsMandante: j.golsMandante,
          golsVisitante: j.golsVisitante,
          simulado: true,
        });
      }
    }
  }

  if (torneio.fase !== "grupos" && !torneio.chaveKO?.length && torneio.mataMata) {
    torneio.chaveKO = [{ nome: torneio.mataMata.nome, jogos: torneio.mataMata.jogos.map(cloneJogo) }];
  }

  if (torneio.fase === "grupos") {
    sincronizarRodadaGrupos(torneio);
  }
}

export function iniciarTorneio(selecaoIds, timeJogadorId) {
  const grupos = criarGrupos(selecaoIds, timeJogadorId);
  return {
    fase: "grupos",
    rodadaAtual: 1,
    grupos,
    mataMata: null,
    chaveKO: [],
    historico: [],
    campeao: null,
  };
}

export function getProximoJogo(torneio, timeJogadorId) {
  if (timeEliminado(torneio, timeJogadorId)) return null;

  if (torneio.fase === "grupos") {
    sincronizarRodadaGrupos(torneio);
    const rodada = torneio.rodadaAtual ?? 1;
    for (const grupo of torneio.grupos) {
      for (const jogo of grupo.jogos) {
        if (jogo.rodada !== rodada) continue;
        if (!jogo.jogado && (jogo.mandante === timeJogadorId || jogo.visitante === timeJogadorId)) {
          return { jogo, grupo: grupo.nome, fase: "grupos", rodada };
        }
      }
    }
    return null;
  }

  if (torneio.fase === "mata-mata") {
    const buscar = (fase) => {
      if (!fase?.jogos) return null;
      for (const jogo of fase.jogos) {
        if (!jogo.jogado && (jogo.mandante === timeJogadorId || jogo.visitante === timeJogadorId)) {
          return { jogo, fase: "mata-mata", faseNome: fase.nome };
        }
      }
      return null;
    };

    const atual = buscar(torneio.mataMata);
    if (atual) return atual;

    for (const fase of torneio.chaveKO ?? []) {
      const encontrado = buscar(fase);
      if (encontrado) {
        torneio.mataMata = fase;
        return encontrado;
      }
    }
  }
  return null;
}

/** Outros jogos da mesma rodada/fase KO (exceto o do jogador). */
export function listarOutrosJogosRodada(torneio, timeJogadorId) {
  if (!torneio) return [];

  const lista = [];

  if (torneio.fase === "grupos") {
    const rodada = torneio.rodadaAtual ?? 1;
    for (const grupo of torneio.grupos) {
      for (const jogo of grupo.jogos) {
        if (jogo.jogado) continue;
        if (jogo.rodada !== rodada) continue;
        if (jogo.mandante === timeJogadorId || jogo.visitante === timeJogadorId) continue;
        lista.push({ jogo, grupo: grupo.nome, fase: "grupos", rodada });
      }
    }
  } else if (torneio.fase === "mata-mata" && torneio.mataMata) {
    for (const jogo of torneio.mataMata.jogos) {
      if (jogo.jogado) continue;
      if (jogo.mandante === timeJogadorId || jogo.visitante === timeJogadorId) continue;
      lista.push({ jogo, fase: "mata-mata", faseNome: torneio.mataMata.nome });
    }
  }

  return lista;
}

export function resolverJogo(torneio, ref) {
  if (!ref || !torneio) return null;

  if (ref.fase === "mata-mata" || (!ref.grupo && ref.fase !== "grupos")) {
    const jogo = torneio.mataMata?.jogos.find(
      (j) => j.id === ref.id || (j.mandante === ref.mandante && j.visitante === ref.visitante)
    );
    return jogo ? { jogo, fase: "mata-mata" } : null;
  }

  const grupo = torneio.grupos.find((g) => g.nome === ref.grupo);
  if (!grupo) return null;

  const jogo = grupo.jogos.find(
    (j) => j.id === ref.id && j.mandante === ref.mandante && j.visitante === ref.visitante
  );
  return jogo ? { jogo, grupo: grupo.nome, fase: "grupos" } : null;
}

export function rodadaGruposConcluida(torneio, rodada) {
  return torneio.grupos.every((g) =>
    g.jogos.filter((j) => j.rodada === rodada).every((j) => j.jogado)
  );
}

export function avancarRodadaGruposSePronto(torneio) {
  if (torneio.fase !== "grupos") return false;
  const rodada = torneio.rodadaAtual ?? 1;
  if (!rodadaGruposConcluida(torneio, rodada)) return false;
  if (rodada >= 3) return false;
  torneio.rodadaAtual = rodada + 1;
  return true;
}

export function simularRodadaIA(torneio, timeJogadorId, simularPartidaFn) {
  if (torneio.fase !== "grupos") return;

  const rodada = torneio.rodadaAtual ?? 1;

  for (const grupo of torneio.grupos) {
    for (const jogo of grupo.jogos) {
      if (jogo.jogado) continue;
      if (jogo.rodada !== rodada) continue;
      if (jogo.mandante === timeJogadorId || jogo.visitante === timeJogadorId) continue;
      const res = simularPartidaFn(jogo.mandante, jogo.visitante);
      registrarResultadoGrupoComHistorico(
        torneio,
        grupo,
        jogo,
        res.golsMandante,
        res.golsVisitante,
        { simulado: true }
      );
    }
  }
}

/** Simula jogos do mata-mata corrente que não envolvem o jogador (mesma rodada). */
export function simularRodadaMataMataIA(torneio, timeJogadorId, simularPartidaFn) {
  if (torneio.fase !== "mata-mata" || !torneio.mataMata) return;

  for (const jogo of [...torneio.mataMata.jogos]) {
    if (jogo.jogado) continue;
    if (jogo.mandante === timeJogadorId || jogo.visitante === timeJogadorId) continue;
    const res = simularPartidaFn(jogo.mandante, jogo.visitante);
    registrarResultadoMataMata(torneio, jogo.id, res.golsMandante, res.golsVisitante, { simulado: true });
  }
}

export function sincronizarRodadaGrupos(torneio) {
  if (torneio.fase !== "grupos") return;
  for (let r = 1; r <= 3; r++) {
    if (!rodadaGruposConcluida(torneio, r)) {
      torneio.rodadaAtual = r;
      return;
    }
  }
  torneio.rodadaAtual = 3;
}

export function registrarResultadoGrupo(grupo, jogo, golsMandante, golsVisitante) {
  jogo.golsMandante = golsMandante;
  jogo.golsVisitante = golsVisitante;
  jogo.jogado = true;

  atualizarClassificacao(grupo.classificacao, jogo.mandante, golsMandante, golsVisitante);
  atualizarClassificacao(grupo.classificacao, jogo.visitante, golsVisitante, golsMandante);
  grupo.classificacao.sort((a, b) => b.pts - a.pts || b.sg - a.sg || b.gp - a.gp);

  return {
    fase: "grupos",
    grupo: grupo.nome,
    rodada: jogo.rodada,
    id: jogo.id,
    mandante: jogo.mandante,
    visitante: jogo.visitante,
    golsMandante,
    golsVisitante,
  };
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

/** 1º de um grupo x 2º de outro (A1×B2, C1×D2, B1×A2, D1×C2…). */
function montarQuartas(classificados, numGrupos) {
  const primeiro = [];
  const segundo = [];
  for (let g = 0; g < numGrupos; g++) {
    primeiro.push(classificados[g * 2]);
    segundo.push(classificados[g * 2 + 1]);
  }

  const jogos = [];
  for (let i = 0; i < numGrupos; i++) {
    const opp = numGrupos - 1 - i;
    jogos.push({
      id: `QF${i + 1}`,
      mandante: primeiro[i],
      visitante: segundo[opp],
      golsMandante: null,
      golsVisitante: null,
      jogado: false,
    });
  }
  return jogos;
}

export function iniciarMataMata(torneio) {
  const numGrupos = torneio.grupos.length;
  const classificados = [];
  for (const g of torneio.grupos) {
    classificados.push(g.classificacao[0].id, g.classificacao[1].id);
  }

  const jogos = montarQuartas(classificados, numGrupos);
  const nome = jogos.length >= 4 ? "Quartas de final" : jogos.length === 2 ? "Semifinal" : "Final";

  torneio.fase = "mata-mata";
  torneio.chaveKO = [{ nome, jogos: jogos.map(cloneJogo) }];
  torneio.mataMata = torneio.chaveKO[0];
}

export function avancarMataMata(torneio) {
  const mm = torneio.mataMata;
  if (!mm?.jogos.every((j) => j.jogado)) return false;

  const vencedores = mm.jogos.map((j) =>
    j.golsMandante > j.golsVisitante ? j.mandante : j.visitante
  );

  if (vencedores.length === 1) {
    torneio.campeao = vencedores[0];
    torneio.fase = "fim";
    torneio.mataMata = null;
    return true;
  }

  const nomes = { 4: "Semifinal", 2: "Final" };
  const jogos = [];
  for (let i = 0; i < vencedores.length; i += 2) {
    jogos.push({
      id: `KO${mm.rodada ?? 0}-${i}`,
      mandante: vencedores[i],
      visitante: vencedores[i + 1],
      golsMandante: null,
      golsVisitante: null,
      jogado: false,
    });
  }

  const fase = {
    nome: nomes[vencedores.length] ?? "Mata-mata",
    rodada: (mm.rodada ?? 0) + 1,
    jogos,
  };

  if (!torneio.chaveKO) torneio.chaveKO = [];
  torneio.chaveKO.push({ nome: fase.nome, jogos: fase.jogos.map(cloneJogo) });
  torneio.mataMata = fase;
  return false;
}

export function registrarResultadoMataMata(torneio, jogoId, golsMandante, golsVisitante, opts = {}) {
  const jogo = torneio.mataMata?.jogos.find((j) => j.id === jogoId);
  if (!jogo) return null;

  let gm = golsMandante;
  let gv = golsVisitante;
  if (gm === gv) {
    if (Math.random() < 0.5) gm++;
    else gv++;
  }

  jogo.golsMandante = gm;
  jogo.golsVisitante = gv;
  jogo.jogado = true;

  syncJogoNaChave(torneio, jogo);

  const entrada = {
    fase: "mata-mata",
    faseNome: torneio.mataMata.nome,
    rodada: torneio.mataMata.rodada ?? 0,
    id: jogo.id,
    mandante: jogo.mandante,
    visitante: jogo.visitante,
    golsMandante: gm,
    golsVisitante: gv,
    simulado: opts.simulado ?? false,
  };
  registrarNoHistorico(torneio, entrada);

  if (torneio.mataMata.jogos.every((j) => j.jogado)) {
    avancarMataMata(torneio);
  }

  return entrada;
}

function syncJogoNaChave(torneio, jogo) {
  if (!torneio.chaveKO?.length) return;
  for (const fase of torneio.chaveKO) {
    const ref = fase.jogos.find((j) => j.id === jogo.id);
    if (ref) {
      ref.golsMandante = jogo.golsMandante;
      ref.golsVisitante = jogo.golsVisitante;
      ref.jogado = jogo.jogado;
      break;
    }
  }
}

export function registrarResultadoGrupoComHistorico(torneio, grupo, jogo, gm, gv, opts = {}) {
  const base = registrarResultadoGrupo(grupo, jogo, gm, gv);
  registrarNoHistorico(torneio, { ...base, simulado: opts.simulado ?? false });
  return base;
}

/** Time eliminado no mata-mata (não tem jogo pendente). */
export function timeEliminado(torneio, timeId) {
  if (!torneio || torneio.fase === "grupos") return false;
  if (torneio.campeao === timeId) return false;
  if (torneio.fase === "fim") return torneio.campeao !== timeId;

  for (const fase of torneio.chaveKO ?? []) {
    for (const j of fase.jogos) {
      if (!j.jogado && (j.mandante === timeId || j.visitante === timeId)) return false;
    }
  }

  if (torneio.mataMata?.jogos.some(
    (j) => !j.jogado && (j.mandante === timeId || j.visitante === timeId)
  )) {
    return false;
  }

  const jogouMata = torneio.historico?.some(
    (h) => h.fase === "mata-mata" && (h.mandante === timeId || h.visitante === timeId)
  );
  return !!jogouMata;
}

function timeClassificouMataMata(torneio, timeId) {
  for (const g of torneio.grupos ?? []) {
    const ids = g.classificacao.slice(0, 2).map((r) => r.id);
    if (ids.includes(timeId)) return true;
  }
  return false;
}

/** Seleção ainda participa do torneio (grupos ou mata-mata em andamento). */
export function timeAtivoNoTorneio(torneio, timeId) {
  if (!torneio || !timeId) return false;

  if (torneio.fase === "grupos") {
    const grupo = getGrupoDoTime(torneio, timeId);
    if (!grupo) return false;
    return grupo.jogos.some(
      (j) => !j.jogado && (j.mandante === timeId || j.visitante === timeId)
    );
  }

  if (torneio.fase === "fim") {
    return torneio.campeao === timeId;
  }

  if (!timeClassificouMataMata(torneio, timeId)) return false;
  return !timeEliminado(torneio, timeId);
}

export function encontrarJogoMataMata(torneio, meta) {
  if (!torneio || !meta) return null;
  for (const fase of torneio.chaveKO ?? []) {
    const jogo = fase.jogos.find(
      (j) =>
        j.id === meta.jogoId &&
        j.mandante === meta.mandante &&
        j.visitante === meta.visitante
    );
    if (jogo) return { fase, jogo };
  }
  if (torneio.mataMata) {
    const jogo = torneio.mataMata.jogos.find(
      (j) =>
        j.id === meta.jogoId &&
        j.mandante === meta.mandante &&
        j.visitante === meta.visitante
    );
    if (jogo) return { fase: torneio.mataMata, jogo };
  }
  return null;
}

/** Preenche jogos pendentes da rodada (fallback) e avança fase de grupos. */
export function completarRodadaTorneio(torneio, timeJogadorId, simularPartidaFn) {
  if (torneio.fase === "grupos") {
    simularRodadaIA(torneio, timeJogadorId, simularPartidaFn);
    while (avancarRodadaGruposSePronto(torneio)) {
      /* avança enquanto a rodada global estiver completa */
    }
    sincronizarRodadaGrupos(torneio);
  } else if (torneio.fase === "mata-mata") {
    simularRodadaMataMataIA(torneio, timeJogadorId, simularPartidaFn);
  }
}

/** Seções do histórico de um grupo (por rodada). */
export function getSecoesHistorico(torneio, opts = {}) {
  if (!torneio) return [];

  const { timeJogadorId, grupoNome } = opts;
  let grupos = torneio.grupos ?? [];

  if (grupoNome) {
    const g = grupos.find((x) => x.nome === grupoNome);
    grupos = g ? [g] : [];
  } else if (timeJogadorId) {
    const meuGrupo = getGrupoDoTime(torneio, timeJogadorId);
    grupos = meuGrupo ? [meuGrupo] : grupos;
  }

  const secoes = [];

  for (let r = 1; r <= 3; r++) {
    const jogos = [];
    for (const grupo of grupos) {
      for (const j of grupo.jogos) {
        if (j.rodada === r) {
          jogos.push({
            ...j,
            fase: "grupos",
            grupo: grupo.nome,
            rodada: r,
          });
        }
      }
    }
    if (jogos.length) {
      const nomeGrupo = grupos.length === 1 ? grupos[0].nome : null;
      const titulo = nomeGrupo ? `Rodada ${r}` : `Fase de grupos — Rodada ${r}`;
      secoes.push({ titulo, jogos });
    }
  }

  return secoes;
}

export function getGrupoPorNome(torneio, nome) {
  return torneio?.grupos?.find((g) => g.nome === nome) ?? null;
}

export function getGrupoDoTime(torneio, timeId) {
  return torneio.grupos.find((g) => g.times.includes(timeId));
}

export function simularTodosJogosPendentes(torneio, simularPartidaFn) {
  for (const grupo of torneio.grupos) {
    for (const jogo of grupo.jogos) {
      if (jogo.jogado) continue;
      const res = simularPartidaFn(jogo.mandante, jogo.visitante);
      registrarResultadoGrupoComHistorico(torneio, grupo, jogo, res.golsMandante, res.golsVisitante, {
        simulado: true,
      });
    }
  }
}
