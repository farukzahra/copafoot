<script setup>
import { ref, watch, nextTick, computed } from "vue";
import { store } from "../stores/gameStore.js";
import { continuarAposPartida, debugEncerrarPartida } from "../composables/usePartida.js";
import PlacarTransmissao from "./PlacarTransmissao.vue";
import Bandeira from "./Bandeira.vue";
import { partesTextoGol } from "../utils/narracaoGol.js";

const narracaoEl = ref(null);

const linhasView = computed(() =>
  store.partida.linhas.map((linha) => ({
    linha,
    gol: partesTextoGol(linha),
  }))
);

const mostrarContinuar = computed(
  () => store.partida.finalizada || store.partida.minuto >= 90
);

watch(
  () => store.partida.linhas.length,
  async () => {
    await nextTick();
    if (narracaoEl.value) {
      narracaoEl.value.scrollTop = narracaoEl.value.scrollHeight;
    }
  }
);

function continuar() {
  continuarAposPartida();
}
</script>

<template>
  <section class="screen active screen-partida">
    <div
      v-if="store.partida.outrosPlacares?.length"
      class="placares-paralelos"
      aria-label="Outros jogos ao vivo"
    >
      <p class="placares-paralelos__titulo">OUTROS JOGOS AO VIVO</p>
      <PlacarTransmissao
        v-for="p in store.partida.outrosPlacares"
        :key="p.key"
        v-show="p.mand && p.vis"
        compact
        :mand="p.mand"
        :vis="p.vis"
        :gm="p.gm"
        :gv="p.gv"
        :minuto="p.minuto"
        :intervalo-feito="p.intervaloFeito"
        :finalizada="p.finalizada || store.partida.finalizada"
      />
    </div>

    <PlacarTransmissao
      v-if="store.partida.mand && store.partida.vis"
      :mand="store.partida.mand"
      :vis="store.partida.vis"
      :gm="store.partida.placar.gm"
      :gv="store.partida.placar.gv"
      :minuto="store.partida.minuto"
      :intervalo-feito="store.partida.intervaloFeito"
      :finalizada="store.partida.finalizada"
    />

    <div v-if="!store.partida.finalizada" class="partida-debug">
      <button type="button" class="btn-debug-partida" @click="debugEncerrarPartida">
        DEBUG — encerrar partida
      </button>
    </div>

    <div ref="narracaoEl" class="partida-narracao">
      <div
        v-for="(item, i) in linhasView"
        :key="i"
        class="narracao-linha"
        :class="{ gol: item.linha.tipo === 'gol', intervalo: item.linha.tipo === 'intervalo' }"
      >
        <span v-if="item.linha.minuto" class="narracao-minuto">{{ item.linha.minuto }}' — </span>

        <template v-if="item.gol">
          <span>{{ item.gol.antes }}</span>
          <span class="narracao-gol-time">
            <Bandeira :id="item.linha.timeId" size="sm" />
            <span>{{ item.gol.timeNome }}</span>
          </span>
          <span>{{ item.gol.depois }}</span>
        </template>

        <template v-else>{{ item.linha.texto }}</template>
      </div>
    </div>

    <div v-if="mostrarContinuar" class="partida-controles">
      <button type="button" class="btn-continuar-partida" @click="continuar">Continuar</button>
    </div>
  </section>
</template>
