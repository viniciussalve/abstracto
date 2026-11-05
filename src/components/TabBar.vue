<script setup lang="ts">
/** Abas de seção. Contadores aqui são a ÚNICA fonte: não repita no cabeçalho. */
defineProps<{ tabs: { id: string; label: string; count?: number }[]; modelValue: string }>()
defineEmits<{ 'update:modelValue': [id: string] }>()
</script>

<template>
  <div role="tablist" class="flex gap-inner overflow-x-auto border-b border-border">
    <button
      v-for="t in tabs"
      :key="t.id"
      role="tab"
      type="button"
      :aria-selected="t.id === modelValue"
      class="flex min-h-touch items-center gap-2 border-b-2 px-1 text-body-lg font-semibold whitespace-nowrap transition-colors"
      :class="t.id === modelValue ? 'border-fg text-fg' : 'border-transparent text-fg-muted hover:text-fg'"
      @click="$emit('update:modelValue', t.id)"
    >
      {{ t.label }}
      <span v-if="t.count != null" class="rounded-control bg-surface px-1.5 text-caption">{{ t.count }}</span>
    </button>
  </div>
</template>
