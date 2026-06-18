<script setup>
import { computed } from "vue";
import { listarMeuElenco, venderJogador, getPrecoVenda } from "../../game/market.js";
import { fmtMoney } from "../../utils/format.js";
import { toast } from "../../stores/gameStore.js";

const jogadores = computed(() =>
  [...listarMeuElenco()].sort((a, b) => b.forca - a.forca)
);

function vender(id) {
  const res = venderJogador(id);
  toast(res.msg);
}
</script>

<template>
  <div>
    <h3>Elenco</h3>
    <table>
      <thead>
        <tr><th>Nome</th><th>Pos</th><th>Força</th><th>Origem</th><th>Ação</th></tr>
      </thead>
      <tbody>
        <tr v-for="j in jogadores" :key="j.id">
          <td>{{ j.nome }}</td>
          <td :class="'pos-' + j.posicao">{{ j.posicao }}</td>
          <td>{{ j.forca }}</td>
          <td>{{ j.selecaoNome ?? j.selecaoOrigem }}</td>
          <td>
            <button type="button" @click="vender(j.id)">
              Vender ({{ fmtMoney(getPrecoVenda(j.forca)) }})
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
