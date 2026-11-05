<script setup lang="ts">
/**
 * Espaçador no FIM do conteúdo rolável. Obrigatório sempre que houver player, FAB, botão de IA
 * ou qualquer elemento flutuante, para que ele nunca cubra conteúdo ("Queued" coberto na revisão).
 */
</script>

<template>
  <div aria-hidden="true" class="h-floating" style="padding-bottom: env(safe-area-inset-bottom)" />
</template>
