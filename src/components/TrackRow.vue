<script setup lang="ts">
/**
 * Linha de faixa. Lista numerada (não grade de capas repetidas).
 * `duration` e `plays` vêm dos dados reais da faixa, nunca fixos.
 * Texto longo trunca com ellipsis (title mostra o completo).
 */
defineProps<{ index: number; title: string; album?: string; plays?: string; duration?: string }>()
</script>

<template>
  <li
    class="grid min-h-touch grid-cols-[1.5rem_1fr_auto] items-center gap-x-inner border-b border-border py-2 text-body-lg sm:grid-cols-[1.5rem_1fr_1fr_auto_3rem]"
  >
    <span class="text-fg-subtle tabular-nums">{{ index }}</span>
    <span class="truncate font-semibold" :title="title">{{ title }}</span>
    <span v-if="album" class="hidden truncate text-fg-muted sm:block" :title="album">{{ album }}</span>
    <span v-if="plays" class="hidden text-right text-fg-muted sm:block">{{ plays }}</span>
    <span class="text-right text-fg-muted tabular-nums">{{ duration ?? '–:––' }}</span>
  </li>
</template>
