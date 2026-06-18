<script setup>
import { computed } from "vue";
import { store, temSave } from "./stores/gameStore.js";
import ScreenMenu from "./components/ScreenMenu.vue";
import ScreenEscolha from "./components/ScreenEscolha.vue";
import ScreenHub from "./components/ScreenHub.vue";
import ScreenPartida from "./components/ScreenPartida.vue";
import ScreenConvite from "./components/ScreenConvite.vue";
import ScreenFim from "./components/ScreenFim.vue";

const temPartidaSalva = computed(() => temSave() && !!store.estado);
</script>

<template>
  <div id="copafoot-app">
    <div v-if="store.ui.toast" class="toast">{{ store.ui.toast }}</div>

    <ScreenMenu v-if="store.ui.tela === 'menu'" :tem-save="temPartidaSalva" />
    <ScreenEscolha v-else-if="store.ui.tela === 'escolha'" />
    <ScreenHub v-else-if="store.ui.tela === 'hub'" />
    <ScreenPartida v-else-if="store.ui.tela === 'partida'" />
    <ScreenConvite v-else-if="store.ui.tela === 'convite'" />
    <ScreenFim v-else-if="store.ui.tela === 'fim'" />

    <p v-if="store.estado && store.ui.tela !== 'menu'" class="autosave-hint">
      Progresso e partida salvos automaticamente · F5 continua de onde parou
    </p>
  </div>
</template>
