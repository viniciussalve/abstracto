<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * Capa/imagem com estado de falha: sem src ou erro de carga => placeholder escuro
 * (nunca o ícone de imagem quebrada do navegador).
 */
const props = withDefaults(
  defineProps<{ src?: string | null; alt?: string; size?: number | string; rounded?: 'card' | 'squircle' }>(),
  { alt: '', rounded: 'card' },
)
const failed = ref(!props.src)
watch(
  () => props.src,
  (s) => (failed.value = !s),
)
const dim = () => (typeof props.size === 'number' ? `${props.size}px` : props.size)
</script>

<template>
  <div
    class="shrink-0 overflow-hidden bg-placeholder"
    :class="rounded === 'squircle' ? 'rounded-[28%]' : 'rounded-card'"
    :style="size ? { width: dim(), height: dim() } : undefined"
    role="img"
    :aria-label="alt || undefined"
  >
    <img v-if="!failed && src" :src="src" alt="" class="size-full object-cover" @error="failed = true" />
  </div>
</template>
