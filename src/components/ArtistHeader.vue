<script setup lang="ts">
import CoverArt from './CoverArt.vue'

/**
 * Cabeçalho de perfil. Regras (revisão Paper "Kind wave"):
 * - Exatamente DOIS grupos: identidade (rótulo, nome, meta) e ações. gap-group entre eles, gap-inner-sm/inner dentro.
 * - Nome em text-display, rótulo pequeno acima.
 * - Não repita contadores que já existem nas abas.
 * - Ações (slot) alinhadas à esquerda; só a principal usa variant="primary".
 */
defineProps<{ label?: string; name: string; meta?: string; cover?: string | null }>()
</script>

<template>
  <header class="flex flex-col gap-inner sm:flex-row sm:items-end">
    <CoverArt :src="cover" :alt="name" size="12rem" rounded="squircle" class="max-sm:size-36" />
    <div class="flex min-w-0 flex-col gap-group">
      <div class="flex flex-col gap-inner-sm">
        <div class="flex flex-col">
          <span v-if="label" class="text-body font-medium text-fg-muted">{{ label }}</span>
          <h1 class="truncate text-4xl font-bold leading-none tracking-tight sm:text-display">{{ name }}</h1>
        </div>
        <p v-if="meta" class="text-title text-fg-muted">{{ meta }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-inner-sm"><slot name="actions" /></div>
    </div>
  </header>
</template>
