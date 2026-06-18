<script setup>
import Bandeira from "./Bandeira.vue";

defineProps({
  mand: { type: Object, required: true },
  vis: { type: Object, required: true },
  gm: { type: Number, default: null },
  gv: { type: Number, default: null },
  jogado: { type: Boolean, default: false },
});
</script>

<template>
  <div class="placar-tv placar-tv--historico" aria-label="Resultado do jogo">
    <div class="placar-tv__corpo">
      <div class="placar-tv__lado placar-tv__lado--mand">
        <div class="placar-tv__time-linha">
          <Bandeira :id="mand.id" size="md" />
          <span class="placar-tv__nome">{{ mand.nome }}</span>
        </div>
      </div>

      <div class="placar-tv__centro">
        <span class="placar-tv__gol">{{ jogado ? gm : "—" }}</span>
        <span class="placar-tv__sep">×</span>
        <span class="placar-tv__gol">{{ jogado ? gv : "—" }}</span>
      </div>

      <div class="placar-tv__lado placar-tv__lado--vis">
        <div class="placar-tv__time-linha">
          <span class="placar-tv__nome">{{ vis.nome }}</span>
          <Bandeira :id="vis.id" size="md" />
        </div>
      </div>
    </div>
  </div>
</template>
