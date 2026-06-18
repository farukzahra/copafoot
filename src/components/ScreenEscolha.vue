<script setup>
import { getSelecoesCarreira, formatDivisao } from "../game/data.js";
import { iniciarNovoJogo, irPara } from "../stores/gameStore.js";
import Bandeira from "./Bandeira.vue";

const selecoes = getSelecoesCarreira();

function escolher(id) {
  iniciarNovoJogo(id);
}
</script>

<template>
  <section class="screen active">
    <h2>Escolha sua seleção</h2>
    <p class="hint">Carreira: comece numa seleção da <strong>3º Divisão</strong> (mais fraca).</p>
    <div class="grid-selecoes">
      <div
        v-for="s in selecoes"
        :key="s.id"
        class="card-selecao"
        @click="escolher(s.id)"
      >
        <Bandeira :id="s.id" size="lg" />
        <strong>{{ s.nome }}</strong>
        <div class="divisao">{{ formatDivisao(s.pote) }} · Força média {{ s.forcaMedia }}</div>
      </div>
    </div>
    <button type="button" class="btn-voltar" @click="irPara('menu')">← Voltar</button>
  </section>
</template>
