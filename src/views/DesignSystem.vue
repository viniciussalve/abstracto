<script setup lang="ts">
import { ref } from 'vue'
import ArtistHeader from '@/components/ArtistHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import CoverArt from '@/components/CoverArt.vue'
import TabBar from '@/components/TabBar.vue'
import TrackRow from '@/components/TrackRow.vue'
import AlbumCard from '@/components/AlbumCard.vue'

/**
 * Página viva do design system. Ao criar ou alterar um componente/token, ATUALIZE esta página
 * (regra do AGENTS.md). Agentes devem inspecioná-la antes de criar UI nova.
 */
const theme = ref<'dark' | 'light'>('dark')
function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme.value
}
const tab = ref('a')

const colors = ['bg', 'bg-raised', 'surface', 'surface-2', 'placeholder', 'fg', 'fg-muted', 'fg-subtle', 'accent', 'accent-hover', 'danger']
const texts = [
  ['text-micro', '10px'],
  ['text-caption', '12px'],
  ['text-body', '13px'],
  ['text-body-lg', '14px'],
  ['text-title', '17px'],
  ['text-heading', '18px'],
  ['text-display', '56px'],
] as const
const spaces = [
  ['inner-sm', '13px'],
  ['inner', '16px'],
  ['group', '34px'],
  ['touch', '44px'],
] as const
</script>

<template>
  <main class="mx-auto max-w-5xl space-y-group px-inner py-group">
    <header class="flex items-center justify-between">
      <h1 class="text-heading font-bold">Design system</h1>
      <BaseButton @click="toggleTheme">Tema: {{ theme }}</BaseButton>
    </header>

    <section>
      <h2 class="mb-inner text-heading font-bold">Cores (tokens)</h2>
      <div class="grid grid-cols-2 gap-inner-sm sm:grid-cols-4">
        <div v-for="c in colors" :key="c" class="rounded-card border border-border p-2">
          <div class="h-12 rounded-control border border-border" :style="{ background: `var(--${c})` }" />
          <code class="mt-1 block text-caption text-fg-muted">{{ c }}</code>
        </div>
      </div>
    </section>

    <section>
      <h2 class="mb-inner text-heading font-bold">Tipografia</h2>
      <p v-for="[cls, px] in texts" :key="cls" class="mb-2 truncate" :class="cls">
        {{ cls }} · {{ px }} · Ambré
      </p>
    </section>

    <section>
      <h2 class="mb-inner text-heading font-bold">Espaçamento</h2>
      <div v-for="[n, px] in spaces" :key="n" class="mb-2 flex items-center gap-inner text-body">
        <code class="w-24 text-fg-muted">{{ n }}</code>
        <div class="h-3 rounded-pill bg-accent" :style="{ width: px }" />
        <span class="text-fg-subtle">{{ px }}</span>
      </div>
    </section>

    <section>
      <h2 class="mb-inner text-heading font-bold">BaseButton</h2>
      <div class="flex flex-wrap items-center gap-inner-sm">
        <BaseButton variant="primary">Primary (1 por tela)</BaseButton>
        <BaseButton>Secondary</BaseButton>
        <BaseButton variant="ghost">Ghost</BaseButton>
        <BaseButton icon-only label="Mais">⋯</BaseButton>
        <BaseButton variant="primary" disabled>Disabled</BaseButton>
        <BaseButton variant="primary" loading>Loading</BaseButton>
      </div>
    </section>

    <section>
      <h2 class="mb-inner text-heading font-bold">CoverArt (com e sem imagem, imagem quebrada)</h2>
      <div class="flex gap-inner">
        <CoverArt :size="96" alt="Sem imagem" />
        <CoverArt src="https://invalid.example/x.jpg" :size="96" alt="Imagem quebrada" />
        <CoverArt :size="96" rounded="squircle" alt="Squircle" />
      </div>
    </section>

    <section>
      <h2 class="mb-inner text-heading font-bold">ArtistHeader</h2>
      <ArtistHeader label="Artist" name="Ambré" meta="In your library · 2026 · 36 min">
        <template #actions>
          <BaseButton variant="primary">▶ Play</BaseButton>
          <BaseButton icon-only label="Aleatório">🔀</BaseButton>
        </template>
      </ArtistHeader>
    </section>

    <section>
      <h2 class="mb-inner text-heading font-bold">TabBar · TrackRow · AlbumCard</h2>
      <TabBar v-model="tab" :tabs="[{ id: 'a', label: 'Tracks', count: 15 }, { id: 'b', label: 'History', count: 9 }]" />
      <ol>
        <TrackRow :index="1" title="Until" album="PEYOTE" plays="3 plays" duration="3:12" />
        <TrackRow :index="2" title="Um título de faixa muito, muito longo que precisa truncar com ellipsis sem quebrar o layout" album="PEYOTE" duration="2:48" />
        <TrackRow :index="3" title="Sem duração" />
      </ol>
      <div class="mt-inner flex flex-wrap gap-group">
        <AlbumCard layout="horizontal" title="PEYOTE" badge="New" subtitle="2026 · 15 songs" />
        <AlbumCard title="Vertical" subtitle="Use com 3+ itens" />
      </div>
    </section>
  </main>
</template>
