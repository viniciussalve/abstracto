<script setup lang="ts">
import CoverArt from './CoverArt.vue'

/**
 * Card de álbum. `layout="horizontal"` quando há poucos itens (1 a 2):
 * evita grade com colunas vazias. Com 3+ itens use layout="vertical" em grade.
 */
withDefaults(
  defineProps<{ title: string; subtitle?: string; badge?: string; cover?: string | null; layout?: 'horizontal' | 'vertical' }>(),
  { layout: 'vertical' },
)
</script>

<template>
  <article class="flex gap-inner-sm" :class="layout === 'vertical' ? 'w-40 flex-col' : 'items-center'">
    <CoverArt :src="cover" :alt="title" :size="layout === 'vertical' ? '100%' : 96" class="aspect-square" />
    <div class="min-w-0">
      <h3 class="truncate text-body-lg font-semibold">
        {{ title }}
        <span v-if="badge" class="ml-1 text-micro font-bold uppercase tracking-wide text-fg-muted">{{ badge }}</span>
      </h3>
      <p v-if="subtitle" class="truncate text-body text-fg-muted">{{ subtitle }}</p>
    </div>
  </article>
</template>
