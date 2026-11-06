<script setup lang="ts">
/**
 * Variantes:
 * - primary: a ÚNICA ação principal da tela (amarelo #F5C518). Use no máximo 1 por tela/seção.
 * - secondary: ações de apoio, com fundo visível (surface). Nunca "sem fundo" ao lado de um primary.
 * - ghost: ações terciárias.
 * iconOnly: botão quadrado/circular; sempre passe `label` (aria-label).
 */
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    iconOnly?: boolean
    label?: string
    disabled?: boolean
    loading?: boolean
  }>(),
  { variant: 'secondary' },
)
</script>

<template>
  <button
    type="button"
    :aria-label="iconOnly ? label : undefined"
    :aria-busy="loading || undefined"
    :disabled="disabled || loading"
    class="inline-flex min-h-touch items-center justify-center gap-2 rounded-pill font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    :class="[
      iconOnly ? 'aspect-square min-w-touch' : 'px-6',
      variant === 'primary' && 'bg-accent text-accent-fg hover:bg-accent-hover',
      variant === 'secondary' && 'bg-surface text-fg hover:bg-surface-2',
      variant === 'ghost' && 'text-fg-muted hover:bg-surface hover:text-fg',
    ]"
  >
    <slot />
  </button>
</template>
