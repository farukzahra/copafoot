<script setup>
import { computed, ref } from "vue";
import { listarMercado, comprarJogador } from "../../game/market.js";
import { calcularPreco } from "../../game/data.js";
import { fmtMoney } from "../../utils/format.js";
import { toast } from "../../stores/gameStore.js";

const filtro = ref("");

const lista = computed(() =>
  listarMercado(filtro.value)
    .sort((a, b) => b.forca - a.forca)
    .slice(0, 50)
);

function comprar(id) {
  const res = comprarJogador(id);
  toast(res.msg);
}
</script>

<template>
  <div>
    <h3>Mercado</h3>
    <p class="hint">Compre jogadores de qualquer seleção. Ex: traga o Mbappé pro Brasil!</p>
    <div class="mercado-filtro">
      <input v-model="filtro" type="text" placeholder="Buscar nome, seleção, posição..." />
    </div>
    <table>
      <thead>
        <tr><th>Nome</th><th>Pos</th><th>Força</th><th>Seleção</th><th>Preço</th><th></th></tr>
      </thead>
      <tbody>
        <tr v-for="j in lista" :key="j.id">
          <td>{{ j.nome }}</td>
          <td :class="'pos-' + j.posicao">{{ j.posicao }}</td>
          <td>{{ j.forca }}</td>
          <td>{{ j.selecaoNome }}</td>
          <td class="preco">{{ fmtMoney(calcularPreco(j.forca)) }}</td>
          <td><button type="button" @click="comprar(j.id)">Comprar</button></td>
        </tr>
      </tbody>
    </table>
    <p v-if="lista.length === 50" class="hint">Mostrando top 50. Use o filtro para refinar.</p>
  </div>
</template>
