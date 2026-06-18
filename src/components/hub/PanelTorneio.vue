<script setup>
import { computed, ref, watch } from "vue";
import { store, setHubPanel } from "../../stores/gameStore.js";
import { getSelecaoPorId, getSelecoes } from "../../game/data.js";
import {
  getProximoJogo,
  getGrupoDoTime,
  getGrupoPorNome,
  getSecoesHistorico,
  calcularNumGrupos,
} from "../../game/tournament.js";
import {
  validarAntesDeJogar,
  iniciarPartidaAoVivo,
  temPartidaPausada,
  labelBotaoPartida,
  getPartidaSalva,
  contextoDeJogo,
  reiniciarCampeonato,
  usuarioEliminado,
} from "../../composables/usePartida.js";
import { OPCOES_DURACAO_PARTIDA } from "../../game/data.js";
import { toast, salvar } from "../../stores/gameStore.js";
import Bandeira from "../Bandeira.vue";
import PlacarHistorico from "../PlacarHistorico.vue";

const estado = computed(() => store.estado);
const torneio = computed(() => store.estado?.torneio);
const prox = computed(() =>
  torneio.value ? getProximoJogo(torneio.value, estado.value.selecaoId) : null
);
const meuGrupo = computed(() =>
  torneio.value ? getGrupoDoTime(torneio.value, estado.value.selecaoId) : null
);

const abaTorneio = ref(null);

const emMataMata = computed(() => {
  const f = torneio.value?.fase;
  return f === "mata-mata" || f === "fim";
});

watch(
  () => torneio.value?.fase,
  (fase, faseAnt) => {
    const t = torneio.value;
    if (!t?.grupos?.length) {
      abaTorneio.value = null;
      return;
    }
    if (fase === "mata-mata" || fase === "fim") {
      if (faseAnt === "grupos" || faseAnt == null) {
        abaTorneio.value = "mata-mata";
      }
    } else if (fase === "grupos" && (faseAnt !== "grupos" || abaTorneio.value == null)) {
      const meu = getGrupoDoTime(t, estado.value.selecaoId);
      abaTorneio.value = meu?.nome ?? t.grupos[0].nome;
    }
  },
  { immediate: true }
);

const grupoAtivo = computed(() => {
  if (!torneio.value || abaTorneio.value === "mata-mata" || !abaTorneio.value) return null;
  return getGrupoPorNome(torneio.value, abaTorneio.value) ?? meuGrupo.value;
});

const eliminado = computed(() => usuarioEliminado());
const secoesHistorico = computed(() =>
  torneio.value && grupoAtivo.value
    ? getSecoesHistorico(torneio.value, { grupoNome: grupoAtivo.value.nome })
    : []
);


const numGrupos = computed(() => {
  const n = torneio.value?.grupos?.length ?? 0;
  return n || calcularNumGrupos(getSelecoes().length);
});

const tituloFase = computed(() => {
  if (!torneio.value) return "";
  if (torneio.value.fase === "grupos") {
    const r = torneio.value.rodadaAtual ?? 1;
    return `Fase de Grupos — Rodada ${r}/3 (${numGrupos.value} grupos)`;
  }
  if (torneio.value.fase === "fim") return "Campeonato encerrado";
  return torneio.value.mataMata?.nome ?? "Mata-mata";
});

const jogoAtual = computed(() => contextoDeJogo(prox.value));
const partidaPausada = computed(() => temPartidaPausada());
const textoBotao = computed(() => labelBotaoPartida());
const infoPausa = computed(() => {
  const s = getPartidaSalva();
  if (!partidaPausada.value || !s) return "";
  return `Partida pausada no ${s.minuto}' — placar ${s.placar.gm} x ${s.placar.gv}`;
});

const opcoesDuracao = OPCOES_DURACAO_PARTIDA;

const duracaoPartida = computed({
  get: () => estado.value?.duracaoPartidaMs ?? 20_000,
  set(ms) {
    if (store.partida?.ativa) return;
    if (temPartidaPausada()) {
      toast("Termine ou reinicie a partida pausada antes de mudar a duração.");
      return;
    }
    store.estado.duracaoPartidaMs = ms;
    salvar();
  },
});

function jogar() {
  const v = validarAntesDeJogar();
  if (!v.ok) {
    toast(v.msg);
    if (v.msg.includes("Escale")) setHubPanel("escalacao");
    return;
  }
  iniciarPartidaAoVivo();
}

function nomeTime(id) {
  return getSelecaoPorId(id);
}

function reiniciar() {
  const ok = confirm(
    "Reiniciar o campeonato?\n\nMantém seu elenco, caixa e escalação. Zera jogos, tabela e partida em andamento."
  );
  if (ok) reiniciarCampeonato();
}

function faseAtualChave(nomeFase) {
  return torneio.value?.mataMata?.nome === nomeFase;
}

function selecionarAba(aba) {
  abaTorneio.value = aba;
}
</script>

<template>
  <div>
    <div class="torneio-acoes">
      <h3>Torneio — {{ tituloFase }}</h3>
      <button type="button" class="btn-danger" @click="reiniciar">↺ Reiniciar campeonato</button>
    </div>

    <div class="config-partida">
      <label>
        Duração da partida:
        <select v-model.number="duracaoPartida" :disabled="partidaPausada">
          <option v-for="op in opcoesDuracao" :key="op.ms" :value="op.ms">
            {{ op.label }}
          </option>
        </select>
      </label>
    </div>

    <div v-if="jogoAtual" class="proximo-jogo">
      <strong>Próximo jogo<span v-if="prox?.faseNome"> — {{ prox.faseNome }}</span>:</strong>
      <Bandeira :id="jogoAtual.mandante" />
      {{ nomeTime(jogoAtual.mandante)?.nome }}
      x
      <Bandeira :id="jogoAtual.visitante" />
      {{ nomeTime(jogoAtual.visitante)?.nome }}
      <span v-if="jogoAtual.mandante === estado.selecaoId"> (MANDANTE — +renda)</span>
      <br />
      <p v-if="partidaPausada" class="hint pausa-partida">{{ infoPausa }}</p>
      <button type="button" @click="jogar">{{ textoBotao }}</button>
    </div>

    <p v-else-if="torneio?.fase === 'fim'">
      🏆 Campeão: <Bandeira :id="torneio.campeao" /> {{ nomeTime(torneio.campeao)?.nome }}
    </p>
    <p v-else-if="eliminado" class="hint eliminado-msg">
      Eliminado do mata-mata. Acompanhe a chave na aba Mata-mata ou consulte os grupos.
    </p>
    <p v-else class="hint">Aguardando próxima fase...</p>

    <div v-if="torneio?.grupos?.length" class="torneio-grupos">
      <nav class="torneio-grupos-nav" aria-label="Fases do campeonato">
        <button
          v-if="emMataMata"
          type="button"
          class="torneio-grupo-tab torneio-grupo-tab--mata-mata"
          :class="{ active: abaTorneio === 'mata-mata' }"
          @click="selecionarAba('mata-mata')"
        >
          Mata-mata
        </button>
        <button
          v-for="g in torneio.grupos"
          :key="g.nome"
          type="button"
          class="torneio-grupo-tab"
          :class="{
            active: abaTorneio === g.nome,
            'torneio-grupo-tab--meu': meuGrupo?.nome === g.nome,
          }"
          @click="selecionarAba(g.nome)"
        >
          Grupo {{ g.nome }}
          <span v-if="meuGrupo?.nome === g.nome" class="torneio-grupo-meu"> (você)</span>
        </button>
      </nav>

      <div v-if="abaTorneio === 'mata-mata' && torneio.chaveKO?.length" class="torneio-grupo-painel">
        <div class="chave-ko chave-ko--aba">
          <section
            v-for="fase in torneio.chaveKO"
            :key="fase.nome"
            class="chave-fase"
            :class="{ 'chave-fase-atual': faseAtualChave(fase.nome) }"
          >
            <h5>{{ fase.nome }}</h5>
            <ul class="lista-jogos">
              <li v-for="j in fase.jogos" :key="j.id">
                <PlacarHistorico
                  v-if="nomeTime(j.mandante) && nomeTime(j.visitante)"
                  :mand="nomeTime(j.mandante)"
                  :vis="nomeTime(j.visitante)"
                  :gm="j.golsMandante"
                  :gv="j.golsVisitante"
                  :jogado="j.jogado"
                />
              </li>
            </ul>
          </section>
        </div>
      </div>

      <div v-else-if="grupoAtivo" class="torneio-grupo-painel">
        <div class="classificacao-grupo">
          <h4>Classificação — Grupo {{ grupoAtivo.nome }}</h4>
          <table>
            <thead>
              <tr><th>#</th><th>Seleção</th><th>Pts</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr>
            </thead>
            <tbody>
              <tr
                v-for="(r, i) in grupoAtivo.classificacao"
                :key="r.id"
                :class="{ 'linha-meu-time': r.id === estado.selecaoId }"
              >
                <td>{{ i + 1 }}</td>
                <td><Bandeira :id="r.id" /> {{ nomeTime(r.id)?.nome }}</td>
                <td>{{ r.pts }}</td>
                <td>{{ r.j }}</td>
                <td>{{ r.v }}</td>
                <td>{{ r.e }}</td>
                <td>{{ r.d }}</td>
                <td>{{ r.gp }}</td>
                <td>{{ r.gc }}</td>
                <td>{{ r.sg }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="secoesHistorico.length" class="historico-torneio">
          <section v-for="sec in secoesHistorico" :key="sec.titulo" class="historico-secao">
            <h5>{{ sec.titulo }}</h5>
            <ul class="lista-jogos">
              <li v-for="j in sec.jogos" :key="`${sec.titulo}-${j.id}-${j.mandante}`">
                <PlacarHistorico
                  v-if="nomeTime(j.mandante) && nomeTime(j.visitante)"
                  :mand="nomeTime(j.mandante)"
                  :vis="nomeTime(j.visitante)"
                  :gm="j.golsMandante"
                  :gv="j.golsVisitante"
                  :jogado="j.jogado"
                />
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
