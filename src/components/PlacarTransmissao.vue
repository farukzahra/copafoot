<script setup>
import { computed } from "vue";
import Bandeira from "./Bandeira.vue";

const props = defineProps({
  mand: { type: Object, required: true },
  vis: { type: Object, required: true },
  gm: { type: Number, default: 0 },
  gv: { type: Number, default: 0 },
  minuto: { type: Number, default: 0 },
  intervaloFeito: { type: Boolean, default: false },
  finalizada: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
});

const faseLabel = computed(() => {
  if (props.finalizada) return "FINAL";
  if (props.intervaloFeito && props.minuto === 45) return "INT";
  if (props.minuto > 45) return "2T";
  if (props.minuto > 0) return "1T";
  return "PRE";
});
</script>

<template>
  <div
    class="placar-tv"
    :class="{ 'placar-tv--compact': compact }"
    aria-label="Placar da partida"
  >
    <div v-if="!compact" class="placar-tv__faixa">COPA DO MUNDO 2026</div>
    <div class="placar-tv__corpo">
      <div class="placar-tv__lado">
        <div class="placar-tv__time-linha">
          <Bandeira :id="mand.id" :size="compact ? 'sm' : 'xl'" />
          <span class="placar-tv__nome">{{ mand.nome }}</span>
        </div>
        <span v-if="!compact" class="placar-tv__sigla">{{ mand.id }}</span>
      </div>

      <div class="placar-tv__centro">
        <span class="placar-tv__gol">{{ gm }}</span>
        <span class="placar-tv__sep">×</span>
        <span class="placar-tv__gol">{{ gv }}</span>
      </div>

      <div class="placar-tv__lado">
        <div class="placar-tv__time-linha">
          <Bandeira :id="vis.id" :size="compact ? 'sm' : 'xl'" />
          <span class="placar-tv__nome">{{ vis.nome }}</span>
        </div>
        <span v-if="!compact" class="placar-tv__sigla">{{ vis.id }}</span>
      </div>
    </div>
    <div class="placar-tv__rodape">
      <span class="placar-tv__minuto">{{ minuto }}'</span>
      <span class="placar-tv__fase">{{ faseLabel }}</span>
    </div>
  </div>
</template>
