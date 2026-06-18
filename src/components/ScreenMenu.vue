<script setup>
import { store, temSave, irPara } from "../stores/gameStore.js";
</script>

<template>
  <section class="screen active">
    <pre class="logo">╔══════════════════════════════════╗
║         C O P A F O O T          ║
║    Copa do Mundo 2026 — Web      ║
╚══════════════════════════════════╝</pre>
    <p class="subtitle">Clone do clássico Elifoot · Gerencie sua seleção · Compre craques · Seja campeão</p>
    <nav class="menu-buttons">
      <button type="button" @click="irPara('escolha')">▶ Novo Jogo</button>
      <button type="button" :disabled="!temSave()" @click="irPara('hub')">↻ Continuar</button>
    </nav>
    <p class="hint">Modo carreira: comece numa seleção fraca e suba via convites.</p>
    <p v-if="store.estado" class="hint save-detectado">
      Partida em andamento — ao dar F5 você volta ao hub com todo o progresso salvo.
    </p>
  </section>
</template>
