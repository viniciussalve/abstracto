<script setup lang="ts">
import { NextIcon, PauseIcon, PlayIcon, PreviousIcon } from '@hugeicons/core-free-icons'
import BaseButton from './BaseButton.vue'
import Icon from './Icon.vue'
import CoverArt from './CoverArt.vue'

/**
 * Player fixo/flutuante. Quem o usar DEVE renderizar <FloatingSafeArea /> no fim do conteúdo rolável.
 * Existe um único player por tela (não duplique na sidebar).
 */
defineProps<{ title: string; artist: string; cover?: string | null; playing?: boolean }>()
defineEmits<{ toggle: []; prev: []; next: [] }>()
</script>

<template>
  <div
    class="fixed inset-x-inner bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-3xl items-center gap-inner rounded-card border border-border bg-bg-raised/95 p-2 backdrop-blur"
    role="region"
    aria-label="Player"
  >
    <CoverArt :src="cover" :alt="title" :size="40" />
    <div class="min-w-0 flex-1">
      <p class="truncate text-body-lg font-semibold">{{ title }}</p>
      <p class="truncate text-body text-fg-muted">{{ artist }}</p>
    </div>
    <BaseButton variant="ghost" icon-only label="Anterior" @click="$emit('prev')"><Icon :icon="PreviousIcon" /></BaseButton>
    <BaseButton variant="primary" icon-only :label="playing ? 'Pausar' : 'Tocar'" @click="$emit('toggle')">
      <Icon :icon="playing ? PauseIcon : PlayIcon" />
    </BaseButton>
    <BaseButton variant="ghost" icon-only label="Próxima" @click="$emit('next')"><Icon :icon="NextIcon" /></BaseButton>
  </div>
</template>
