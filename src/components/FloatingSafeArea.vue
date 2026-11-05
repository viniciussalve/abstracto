<script setup lang="ts">
/**
 * Espaçador no FIM do conteúdo rolável. Obrigatório sempre que houver player, FAB, botão de IA
 * ou qualquer elemento flutuante, para que ele nunca cubra conteúdo ("Queued" coberto na revisão).
 * A altura vem de --spacing-floating: 6,5rem normalmente; 9rem quando o Feedback Layer está montado e visível
 * (html[data-feedback-layer='visible']), para caber o botão dele acima do player.
 */
</script>

<template>
  <div aria-hidden="true" class="h-floating" style="padding-bottom: env(safe-area-inset-bottom)" />
</template>
