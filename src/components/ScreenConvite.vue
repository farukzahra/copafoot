<script setup>
import { computed, watch } from "vue";
import { getEstado } from "../game/state.js";
import { getSelecaoPorId, formatDivisao } from "../game/data.js";
import { timeAtivoNoTorneio } from "../game/tournament.js";
import { store, irPara, salvarImediato, trocarSelecao, setHubPanel, toast } from "../stores/gameStore.js";
import { getConviteSelecao } from "../composables/usePartida.js";
import Bandeira from "./Bandeira.vue";

const convite = computed(() => getConviteSelecao());

watch(convite, (c) => {
  if (!c && store.ui.tela === "convite") {
    setHubPanel("torneio");
    irPara("hub");
  }
});

function aceitar() {
  const estado = getEstado();
  const novaSelecao = estado?.convitePendente;
  if (!novaSelecao || !estado?.torneio) return;

  if (!timeAtivoNoTorneio(estado.torneio, novaSelecao)) {
    estado.convitePendente = null;
    salvarImediato();
    toast("Esse convite não vale mais — a seleção já saiu do torneio.");
    setHubPanel("torneio");
    irPara("hub");
    return;
  }

  trocarSelecao(novaSelecao);
  estado.convitePendente = null;
  salvarImediato();
  toast(`Você agora comanda ${getSelecaoPorId(novaSelecao)?.nome ?? "a nova seleção"}!`);
  setHubPanel("torneio");
  irPara("hub");
}

function recusar() {
  const estado = getEstado();
  if (!estado) return;
  estado.convitePendente = null;
  estado.conviteCarreiraOferecido = true;
  salvarImediato();
  setHubPanel("torneio");
  irPara("hub");
}
</script>

<template>
  <section class="screen active">
    <h2>📬 Convite recebido!</h2>
    <div v-if="convite" id="convite-texto">
      <p>Parabéns pelo desempenho na fase de grupos!</p>
      <p>
        A seleção <strong><Bandeira :id="convite.id" /> {{ convite.nome }}</strong>
        ({{ formatDivisao(convite.pote) }}) quer você como técnico!
      </p>
      <p>Você leva seu elenco e caixa atual.</p>
    </div>
    <div class="convite-botoes">
      <button type="button" class="btn-primary" @click="aceitar">Aceitar</button>
      <button type="button" @click="recusar">Recusar</button>
    </div>
  </section>
</template>
