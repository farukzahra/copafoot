/** CopaFoot — controle de telas e fluxo principal. */

import { carregarBase, getSelecoes, getSelecoesCarreira, getSelecaoPorId, FORMACOES, calcularPreco, calcularRendaMandante, formatDivisao } from "./data.js";
import {
  criarEstadoInicial,
  getEstado,
  setEstado,
  salvar,
  carregarSave,
  autoEscalar,
  getSlotsFormacao,
  sincronizarElenco,
  trocarSelecao,
} from "./state.js";
import {
  iniciarTorneio,
  getProximoJogo,
  simularRodadaIA,
  registrarResultadoGrupo,
  gruposConcluidos,
  iniciarMataMata,
  registrarResultadoMataMata,
  getGrupoDoTime,
  simularTodosJogosPendentes,
  timeAtivoNoTorneio,
} from "./tournament.js";
import { jogarPartidaAoVivo, simularPartidaRapida, buildElencoMap } from "./match.js";
import { listarMercado, listarMeuElenco, comprarJogador, venderJogador, getPrecoVenda } from "./market.js";

let elencoMap = null;
let partidaContexto = null;

const screens = {
  menu: document.getElementById("screen-menu"),
  escolha: document.getElementById("screen-escolha"),
  hub: document.getElementById("screen-hub"),
  partida: document.getElementById("screen-partida"),
  convite: document.getElementById("screen-convite"),
  fim: document.getElementById("screen-fim"),
};

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name]?.classList.add("active");
}

function fmtMoney(n) {
  return `$${n.toLocaleString("pt-BR")}`;
}

async function init() {
  await carregarBase();
  elencoMap = buildElencoMap(getSelecoes());
  bindMenu();
  bindEscolha();
  bindHub();
  bindPartida();
  bindConvite();
}

function bindMenu() {
  document.querySelector("#screen-menu").addEventListener("click", (e) => {
    const action = e.target.dataset?.action;
    if (action === "novo-jogo") {
      renderEscolha();
      showScreen("escolha");
    }
    if (action === "continuar") {
      const save = carregarSave();
      if (!save) {
        alert("Nenhum save encontrado.");
        return;
      }
      setEstado(save);
      if (!save.playerOwner) {
        save.playerOwner = {};
        for (const sel of getSelecoes()) {
          for (const j of sel.jogadores) {
            save.playerOwner[j.id] = sel.id;
          }
        }
        for (const id of save.elencoIds ?? []) {
          save.playerOwner[id] = save.selecaoId;
        }
      }
      sincronizarElenco();
      entrarHub();
    }
    if (action === "voltar-menu") showScreen("menu");
  });
}

function bindEscolha() {
  document.querySelector("#screen-escolha .btn-voltar").addEventListener("click", () => showScreen("menu"));
}

function renderEscolha() {
  const container = document.getElementById("lista-selecoes");
  const carreira = getSelecoesCarreira();
  container.innerHTML = carreira
    .map(
      (s) => `
    <div class="card-selecao" data-id="${s.id}">
      <div class="bandeira">${s.bandeira}</div>
      <strong>${s.nome}</strong>
      <div class="divisao">${formatDivisao(s.pote)} · Força média ${s.forcaMedia}</div>
    </div>`
    )
    .join("");

  container.querySelectorAll(".card-selecao").forEach((card) => {
    card.addEventListener("click", () => {
      iniciarNovoJogo(card.dataset.id);
    });
  });
}

function iniciarNovoJogo(selecaoId) {
  const selecoes = getSelecoes();
  const estado = criarEstadoInicial(selecaoId, selecoes);
  estado.torneio = iniciarTorneio(selecoes.map((s) => s.id), selecaoId);
  setEstado(estado);
  salvar();
  entrarHub();
}

function entrarHub() {
  renderHubHeader();
  renderHubPanel("torneio");
  showScreen("hub");
}

function bindHub() {
  document.querySelector(".hub-nav").addEventListener("click", (e) => {
    const panel = e.target.dataset?.hub;
    if (panel) renderHubPanel(panel);
  });
}

function renderHubHeader() {
  const estado = getEstado();
  const sel = getSelecaoPorId(estado.selecaoId);
  const elenco = listarMeuElenco();
  const forca =
    elenco.length > 0
      ? Math.round(elenco.reduce((s, j) => s + j.forca, 0) / elenco.length)
      : sel.forcaMedia;

  document.getElementById("hub-info").innerHTML = `
    <div class="hub-info-linha"><strong>${sel.bandeira} ${sel.nome}</strong> · ${formatDivisao(sel.pote)}</div>
    <div class="hub-info-linha">Caixa: <strong>${fmtMoney(estado.caixa)}</strong> · Elenco: ${elenco.length} jogadores · Força média: ${forca}</div>
    <div class="hub-info-linha">Formação: ${estado.formacao} · Copa do Mundo 2026</div>
  `;
}

function renderHubPanel(panel) {
  const conteudo = document.getElementById("hub-conteudo");
  switch (panel) {
    case "elenco":
      conteudo.innerHTML = renderElenco();
      bindElenco(conteudo);
      break;
    case "escalacao":
      conteudo.innerHTML = renderEscalacao();
      bindEscalacao(conteudo);
      break;
    case "mercado":
      conteudo.innerHTML = renderMercado();
      bindMercado(conteudo);
      break;
    case "torneio":
      conteudo.innerHTML = renderTorneio();
      break;
    case "jogar":
      iniciarProximaPartida();
      break;
    default:
      conteudo.innerHTML = renderTorneio();
  }
}

function renderElenco() {
  const jogadores = listarMeuElenco().sort((a, b) => b.forca - a.forca);
  return `
    <h3>Elenco</h3>
    <table>
      <thead><tr><th>Nome</th><th>Pos</th><th>Força</th><th>Origem</th><th>Ação</th></tr></thead>
      <tbody>
        ${jogadores
          .map(
            (j) => `
          <tr>
            <td>${j.nome}</td>
            <td class="pos-${j.posicao}">${j.posicao}</td>
            <td>${j.forca}</td>
            <td>${j.selecaoNome ?? j.selecaoOrigem}</td>
            <td><button type="button" data-vender="${j.id}">Vender (${fmtMoney(getPrecoVenda(j.forca))})</button></td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function bindElenco(root) {
  root.querySelectorAll("[data-vender]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const res = venderJogador(btn.dataset.vender);
      alert(res.msg);
      renderHubHeader();
      renderHubPanel("elenco");
    });
  });
}

function renderEscalacao() {
  const estado = getEstado();
  const slots = getSlotsFormacao(estado.formacao);
  const elenco = listarMeuElenco();

  const formOpts = Object.keys(FORMACOES)
    .map((f) => `<option value="${f}" ${f === estado.formacao ? "selected" : ""}>${f}</option>`)
    .join("");

  let html = `
    <h3>Escalação</h3>
    <div class="formacao-select">
      Formação:
      <select id="select-formacao">${formOpts}</select>
      <button type="button" id="btn-auto-escalar">Auto-escalar</button>
    </div>
    <div class="lineup-grid">
  `;

  for (const [pos, qtd] of Object.entries(slots)) {
    for (let i = 0; i < qtd; i++) {
      const idx = estado.lineup.findIndex((id, li) => {
        const j = elenco.find((p) => p.id === id);
        return j?.posicao === pos;
      });
      html += `<div class="slot-lineup" data-pos="${pos}">[${pos}] <select data-slot-pos="${pos}"><option value="">—</option>
        ${elenco
          .filter((j) => j.posicao === pos)
          .map(
            (j) =>
              `<option value="${j.id}" ${estado.lineup.includes(j.id) ? "" : ""}>${j.nome} (${j.forca})</option>`
          )
          .join("")}
      </select></div>`;
    }
  }
  html += `</div><p class="hint">Titulares: ${estado.lineup.length}/11</p>`;
  return html;
}

function bindEscalacao(root) {
  const estado = getEstado();

  root.querySelector("#select-formacao")?.addEventListener("change", (e) => {
    estado.formacao = e.target.value;
    estado.lineup = autoEscalar(estado.elencoIds, estado.formacao, listarMeuElenco());
    salvar();
    renderHubPanel("escalacao");
  });

  root.querySelector("#btn-auto-escalar")?.addEventListener("click", () => {
    estado.lineup = autoEscalar(estado.elencoIds, estado.formacao, listarMeuElenco());
    salvar();
    renderHubPanel("escalacao");
  });

  root.querySelectorAll("select[data-slot-pos]").forEach((sel, i) => {
    sel.addEventListener("change", () => {
      rebuildLineupFromSelects(root);
    });
  });
}

function rebuildLineupFromSelects(root) {
  const estado = getEstado();
  const ids = [];
  root.querySelectorAll("select[data-slot-pos]").forEach((sel) => {
    if (sel.value && !ids.includes(sel.value)) ids.push(sel.value);
  });
  if (ids.length <= 11) {
    estado.lineup = ids;
    salvar();
    renderHubHeader();
  }
}

function renderMercado() {
  return `
    <h3>Mercado</h3>
    <p class="hint">Compre jogadores de qualquer seleção. Ex: traga o Mbappé pro Brasil!</p>
    <div class="mercado-filtro">
      <input type="text" id="filtro-mercado" placeholder="Buscar nome, seleção, posição...">
    </div>
    <div id="lista-mercado">${renderListaMercado("")}</div>
  `;
}

function renderListaMercado(filtro) {
  const lista = listarMercado(filtro).sort((a, b) => b.forca - a.forca).slice(0, 50);
  return `
    <table>
      <thead><tr><th>Nome</th><th>Pos</th><th>Força</th><th>Seleção</th><th>Preço</th><th></th></tr></thead>
      <tbody>
        ${lista
          .map(
            (j) => `
          <tr>
            <td>${j.nome}</td>
            <td class="pos-${j.posicao}">${j.posicao}</td>
            <td>${j.forca}</td>
            <td>${j.selecaoNome}</td>
            <td class="preco">${fmtMoney(calcularPreco(j.forca))}</td>
            <td><button type="button" data-comprar="${j.id}">Comprar</button></td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
    ${lista.length === 50 ? "<p class='hint'>Mostrando top 50. Use o filtro para refinar.</p>" : ""}
  `;
}

function bindMercado(root) {
  const input = root.querySelector("#filtro-mercado");
  const lista = root.querySelector("#lista-mercado");

  input?.addEventListener("input", () => {
    lista.innerHTML = renderListaMercado(input.value);
    bindComprar(lista);
  });

  bindComprar(lista);
}

function bindComprar(root) {
  root.querySelectorAll("[data-comprar]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const res = comprarJogador(btn.dataset.comprar);
      alert(res.msg);
      renderHubHeader();
      renderHubPanel("mercado");
    });
  });
}

function renderTorneio() {
  const estado = getEstado();
  const sel = getSelecaoPorId(estado.selecaoId);
  const t = estado.torneio;
  const prox = getProximoJogo(t, estado.selecaoId);
  const grupo = getGrupoDoTime(t, estado.selecaoId);

  let html = `<h3>Torneio — ${t.fase === "grupos" ? "Fase de Grupos" : t.mataMata?.nome ?? t.fase}</h3>`;

  if (prox) {
    const mand = getSelecaoPorId(prox.mandante);
    const vis = getSelecaoPorId(prox.visitante);
    html += `
      <div class="proximo-jogo">
        <strong>Próximo jogo:</strong> ${mand.bandeira} ${mand.nome} x ${vis.bandeira} ${vis.nome}
        ${prox.mandante === estado.selecaoId ? " (MANDANTE — +renda)" : ""}
        <br><button type="button" id="btn-jogar-agora">▶ Jogar agora</button>
      </div>`;
  } else if (t.fase === "fim") {
    const campeao = getSelecaoPorId(t.campeao);
    html += `<p>🏆 Campeão: ${campeao?.bandeira} ${campeao?.nome}</p>`;
  } else {
    html += `<p class="hint">Aguardando próxima fase...</p>`;
  }

  if (grupo && t.fase === "grupos") {
    html += `<div class="classificacao-grupo"><h4>Grupo ${grupo.nome}</h4>`;
    html += renderTabelaClassificacao(grupo.classificacao);
    html += `<h4>Jogos</h4><ul>`;
    for (const j of grupo.jogos) {
      const m = getSelecaoPorId(j.mandante);
      const v = getSelecaoPorId(j.visitante);
      const placar = j.jogado ? `${j.golsMandante} x ${j.golsVisitante}` : "—";
      html += `<li>${m.nome} x ${v.nome}: ${placar}</li>`;
    }
    html += `</ul></div>`;
  }

  if (t.fase === "mata-mata" && t.mataMata) {
    html += `<h4>${t.mataMata.nome}</h4><ul>`;
    for (const j of t.mataMata.jogos) {
      const m = getSelecaoPorId(j.mandante);
      const v = getSelecaoPorId(j.visitante);
      const placar = j.jogado ? `${j.golsMandante} x ${j.golsVisitante}` : "—";
      html += `<li>${m.nome} x ${v.nome}: ${placar}</li>`;
    }
    html += `</ul>`;
  }

  setTimeout(() => {
    document.getElementById("btn-jogar-agora")?.addEventListener("click", iniciarProximaPartida);
  }, 0);

  return html;
}

function renderTabelaClassificacao(classificacao) {
  return `
    <table>
      <thead><tr><th>#</th><th>Seleção</th><th>Pts</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr></thead>
      <tbody>
        ${classificacao
          .map((r, i) => {
            const s = getSelecaoPorId(r.id);
            return `<tr><td>${i + 1}</td><td>${s.bandeira} ${s.nome}</td><td>${r.pts}</td><td>${r.j}</td><td>${r.v}</td><td>${r.e}</td><td>${r.d}</td><td>${r.gp}</td><td>${r.gc}</td><td>${r.sg}</td></tr>`;
          })
          .join("")}
      </tbody>
    </table>`;
}

function iniciarProximaPartida() {
  const estado = getEstado();
  const prox = getProximoJogo(estado.torneio, estado.selecaoId);
  if (!prox) {
    alert("Nenhum jogo pendente.");
    return;
  }

  if (estado.lineup.length < 11) {
    alert("Escale pelo menos 11 jogadores antes de jogar!");
    renderHubPanel("escalacao");
    return;
  }

  // Simula outros jogos da rodada (IA)
  simularRodadaIA(estado.torneio, estado.selecaoId, (m, v) =>
    simularPartidaRapida(m, v, elencoMap)
  );

  partidaContexto = prox;
  const mand = getSelecaoPorId(prox.mandante);
  const vis = getSelecaoPorId(prox.visitante);

  document.getElementById("partida-placar").textContent = `${mand.bandeira} ${mand.nome}  0 x 0  ${vis.bandeira} ${vis.nome}`;
  document.getElementById("partida-tempo").textContent = "0'";
  document.getElementById("partida-narracao").innerHTML = "";
  document.getElementById("partida-controles").classList.add("hidden");
  showScreen("partida");

  let gm = 0;
  let gv = 0;

  jogarPartidaAoVivo(prox.mandante, prox.visitante, elencoMap, {
    onEvento({ minuto, texto, tipo, placar }) {
      const div = document.getElementById("partida-narracao");
      const linha = document.createElement("div");
      linha.className = `narracao-linha ${tipo === "gol" ? "gol" : tipo === "intervalo" ? "intervalo" : ""}`;
      linha.textContent = minuto ? `${minuto}' — ${texto}` : texto;
      div.appendChild(linha);
      div.scrollTop = div.scrollHeight;

      document.getElementById("partida-tempo").textContent = `${minuto}'`;

      if (placar) {
        gm = placar.gm;
        gv = placar.gv;
        document.getElementById("partida-placar").textContent =
          `${mand.bandeira} ${mand.nome}  ${gm} x ${gv}  ${vis.bandeira} ${vis.nome}`;
      }
    },
    onFim({ golsMandante, golsVisitante }) {
      gm = golsMandante;
      gv = golsVisitante;
      finalizarPartida(gm, gv);
    },
  });
}

function finalizarPartida(gm, gv) {
  const estado = getEstado();
  const prox = partidaContexto;
  const souMandante = prox.mandante === estado.selecaoId;

  if (prox.fase === "grupos") {
    const grupo = estado.torneio.grupos.find((g) => g.nome === prox.grupo);
    registrarResultadoGrupo(grupo, prox, gm, gv);

    if (!getProximoJogo(estado.torneio, estado.selecaoId) && !gruposConcluidos(estado.torneio)) {
      simularTodosJogosPendentes(estado.torneio, (m, v) =>
        simularPartidaRapida(m, v, elencoMap)
      );
    }

    if (gruposConcluidos(estado.torneio)) {
      iniciarMataMata(estado.torneio);
    }
  } else {
    registrarResultadoMataMata(estado.torneio, prox.id, gm, gv);
  }

  // Renda de mandante
  if (souMandante) {
    const elenco = listarMeuElenco();
    const media = elenco.reduce((s, j) => s + j.forca, 0) / (elenco.length || 1);
    const renda = calcularRendaMandante(media);
    estado.caixa += renda;
  }

  // Simular outros jogos pendentes do mata-mata (IA)
  if (estado.torneio.fase === "mata-mata" && estado.torneio.mataMata) {
    for (const j of estado.torneio.mataMata.jogos) {
      if (j.jogado) continue;
      if (j.mandante === estado.selecaoId || j.visitante === estado.selecaoId) continue;
      const r = simularPartidaRapida(j.mandante, j.visitante, elencoMap);
      registrarResultadoMataMata(estado.torneio, j.id, r.golsMandante, r.golsVisitante);
    }
  }

  salvar();
  verificarConvite();
  verificarFim();

  document.getElementById("partida-controles").classList.remove("hidden");
}

function bindPartida() {
  document.getElementById("partida-controles").addEventListener("click", (e) => {
    if (e.target.dataset?.action === "pos-partida") {
      renderHubHeader();
      renderHubPanel("torneio");
      showScreen("hub");
    }
  });
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

  const convite = candidatas[Math.floor(Math.random() * candidatas.length)];
  estado.convitePendente = convite.id;
  salvar();
  mostrarConvite(convite);
}

function mostrarConvite(convite) {
  document.getElementById("convite-texto").innerHTML = `
    <p>Parabéns pelo desempenho na fase de grupos!</p>
    <p>A seleção <strong>${convite.bandeira} ${convite.nome}</strong> (${formatDivisao(convite.pote)}) quer você como técnico!</p>
    <p>Você leva seu elenco e caixa atual.</p>
  `;
  showScreen("convite");
}

function bindConvite() {
  document.querySelector("#screen-convite").addEventListener("click", (e) => {
    const estado = getEstado();
    if (e.target.dataset?.action === "aceitar-convite") {
      trocarSelecao(estado.convitePendente);
      estado.convitePendente = null;
      salvar();
      renderHubHeader();
      renderHubPanel("torneio");
      showScreen("hub");
    }
    if (e.target.dataset?.action === "recusar-convite") {
      estado.convitePendente = null;
      salvar();
      renderHubHeader();
      renderHubPanel("torneio");
      showScreen("hub");
    }
  });
}

function verificarFim() {
  const estado = getEstado();
  const t = estado.torneio;
  if (t.fase !== "fim") return;

  const campeao = getSelecaoPorId(t.campeao);
  const souCampeao = t.campeao === estado.selecaoId;

  document.getElementById("fim-texto").innerHTML = souCampeao
    ? `<p>🏆🏆🏆 CAMPEÃO DO MUNDO! 🏆🏆🏆</p><p>${campeao.bandeira} ${campeao.nome}</p>`
    : `<p>Copa encerrada.</p><p>Campeão: ${campeao.bandeira} ${campeao.nome}</p>`;

  showScreen("fim");
}

document.querySelector("#screen-fim button")?.addEventListener("click", () => showScreen("menu"));

init().catch((err) => {
  console.error(err);
  alert("Erro ao iniciar o CopaFoot. Use um servidor local (ex: npx serve).");
});
