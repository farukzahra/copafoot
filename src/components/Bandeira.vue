<script setup>
import { computed } from "vue";
import { codigoBandeira } from "../game/bandeiras.js";

const props = defineProps({
  id: { type: String, required: true },
  size: { type: String, default: "md" },
});

const classe = computed(() => `fi fi-${codigoBandeira(props.id)}`);
</script>

<template>
  <span class="bandeira-ico" :class="[classe, `bandeira-ico--${size}`]" aria-hidden="true" />
</template>
