<script setup>
import { computed } from "vue";
import { store, irPara } from "../stores/gameStore.js";
import { getSelecaoPorId } from "../game/data.js";
import Bandeira from "./Bandeira.vue";

const campeao = computed(() => {
  const id = store.estado?.torneio?.campeao;
  return id ? getSelecaoPorId(id) : null;
});

const souCampeao = computed(
  () => store.estado?.torneio?.campeao === store.estado?.selecaoId
);
</script>

<template>
  <section class="screen active">
    <div id="fim-texto">
      <template v-if="souCampeao">
        <p>🏆🏆🏆 CAMPEÃO DO MUNDO! 🏆🏆🏆</p>
        <p v-if="campeao"><Bandeira :id="campeao.id" size="lg" /> {{ campeao.nome }}</p>
      </template>
      <template v-else>
        <p>Copa encerrada.</p>
        <p v-if="campeao">Campeão: <Bandeira :id="campeao.id" size="lg" /> {{ campeao.nome }}</p>
      </template>
    </div>
    <button type="button" @click="irPara('menu')">Voltar ao menu</button>
  </section>
</template>
