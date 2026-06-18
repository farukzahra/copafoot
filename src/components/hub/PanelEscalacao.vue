<script setup>
import { computed } from "vue";
import { store, salvar, autoEscalar } from "../../stores/gameStore.js";
import { FORMACOES } from "../../game/data.js";
import { getSlotsFormacao } from "../../game/state.js";
import { listarMeuElenco } from "../../game/market.js";

const formacoes = Object.keys(FORMACOES);
const elenco = computed(() => listarMeuElenco());
const slots = computed(() => getSlotsFormacao(store.estado.formacao));

const slotList = computed(() => {
  const list = [];
  for (const [pos, qtd] of Object.entries(slots.value)) {
    for (let i = 0; i < qtd; i++) list.push({ pos, idx: i });
  }
  return list;
});

function jogadoresPos(pos) {
  return elenco.value.filter((j) => j.posicao === pos);
}

function mudarFormacao(e) {
  store.estado.formacao = e.target.value;
  store.estado.lineup = autoEscalar(
    store.estado.elencoIds,
    store.estado.formacao,
    listarMeuElenco()
  );
  salvar();
}

function autoEscalarClick() {
  store.estado.lineup = autoEscalar(
    store.estado.elencoIds,
    store.estado.formacao,
    listarMeuElenco()
  );
  salvar();
}
</script>

<template>
  <div>
    <h3>Escalação</h3>
    <div class="formacao-select">
      Formação:
      <select :value="store.estado.formacao" @change="mudarFormacao">
        <option v-for="f in formacoes" :key="f" :value="f">{{ f }}</option>
      </select>
      <button type="button" @click="autoEscalarClick">Auto-escalar</button>
    </div>
    <p class="hint">Titulares escalados: {{ store.estado.lineup.length }}/11</p>
    <ul>
      <li v-for="id in store.estado.lineup" :key="id">
        {{ elenco.find((j) => j.id === id)?.nome ?? id }}
        ({{ elenco.find((j) => j.id === id)?.posicao }})
      </li>
    </ul>
    <p class="hint">Use Auto-escalar para montar os 11 melhores pela formação {{ store.estado.formacao }}.</p>
  </div>
</template>
