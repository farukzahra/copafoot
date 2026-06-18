<script setup>
import { computed } from "vue";
import { store, setHubPanel } from "../stores/gameStore.js";
import { getSelecaoPorId, formatDivisao } from "../game/data.js";
import { listarMeuElenco } from "../game/market.js";
import { fmtMoney } from "../utils/format.js";
import { validarAntesDeJogar, iniciarPartidaAoVivo, labelBotaoPartida } from "../composables/usePartida.js";
import { toast } from "../stores/gameStore.js";
import PanelElenco from "./hub/PanelElenco.vue";
import PanelEscalacao from "./hub/PanelEscalacao.vue";
import PanelMercado from "./hub/PanelMercado.vue";
import PanelTorneio from "./hub/PanelTorneio.vue";
import Bandeira from "./Bandeira.vue";

const sel = computed(() => getSelecaoPorId(store.estado?.selecaoId));
const elenco = computed(() => listarMeuElenco());
const forcaMedia = computed(() => {
  if (!elenco.value.length) return sel.value?.forcaMedia ?? 0;
  return Math.round(elenco.value.reduce((s, j) => s + j.forca, 0) / elenco.value.length);
});

const panels = {
  elenco: PanelElenco,
  escalacao: PanelEscalacao,
  mercado: PanelMercado,
  torneio: PanelTorneio,
};

const panelAtual = computed(() => panels[store.ui.hubPanel] ?? PanelTorneio);
const textoBotaoJogar = computed(() => labelBotaoPartida().replace(" agora", ""));

function navegar(panel) {
  if (panel === "jogar") {
    const v = validarAntesDeJogar();
    if (!v.ok) {
      toast(v.msg);
      if (v.msg.includes("Escale")) setHubPanel("escalacao");
      return;
    }
    iniciarPartidaAoVivo();
    return;
  }
  setHubPanel(panel);
}
</script>

<template>
  <section class="screen active">
    <header class="hub-header">
      <div v-if="sel">
        <div class="hub-info-linha">
          <strong><Bandeira :id="sel.id" /> {{ sel.nome }}</strong> · {{ formatDivisao(sel.pote) }}
        </div>
        <div class="hub-info-linha">
          Caixa: <strong>{{ fmtMoney(store.estado.caixa) }}</strong>
          · Elenco: {{ elenco.length }} jogadores · Força média: {{ forcaMedia }}
        </div>
        <div class="hub-info-linha">Formação: {{ store.estado.formacao }} · Copa do Mundo 2026</div>
      </div>
      <nav class="hub-nav">
        <button type="button" :class="{ active: store.ui.hubPanel === 'elenco' }" @click="navegar('elenco')">Elenco</button>
        <button type="button" :class="{ active: store.ui.hubPanel === 'escalacao' }" @click="navegar('escalacao')">Escalação</button>
        <button type="button" :class="{ active: store.ui.hubPanel === 'mercado' }" @click="navegar('mercado')">Mercado</button>
        <button type="button" :class="{ active: store.ui.hubPanel === 'torneio' }" @click="navegar('torneio')">Torneio</button>
        <button type="button" class="btn-primary" @click="navegar('jogar')">{{ textoBotaoJogar }}</button>
      </nav>
    </header>
    <div class="hub-conteudo">
      <component :is="panelAtual" />
    </div>
  </section>
</template>
