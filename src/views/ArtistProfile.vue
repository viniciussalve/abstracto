<script setup lang="ts">
import { ref } from 'vue'
import ArtistHeader from '@/components/ArtistHeader.vue'
import { MoreHorizontalIcon, PlayIcon, ShuffleIcon } from '@hugeicons/core-free-icons'
import BaseButton from '@/components/BaseButton.vue'
import Icon from '@/components/Icon.vue'
import TabBar from '@/components/TabBar.vue'
import TrackRow from '@/components/TrackRow.vue'
import AlbumCard from '@/components/AlbumCard.vue'
import PlayerBar from '@/components/PlayerBar.vue'
import FloatingSafeArea from '@/components/FloatingSafeArea.vue'

// Exemplo de tela montada só com componentes e tokens (referência para novas telas).
const tab = ref('profile')
const playing = ref(false)
const tracks = [
  { title: 'Until', album: 'PEYOTE', plays: '3 plays', duration: '3:12' },
  { title: 'She', album: 'PEYOTE', plays: '2 plays', duration: '2:48' },
  { title: 'Folklore', album: 'PEYOTE', plays: '1 play', duration: '3:45' },
]
</script>

<template>
  <main class="mx-auto max-w-5xl px-inner pt-group">
    <ArtistHeader label="Artist" name="Ambré" meta="In your library · 2026 · 36 min">
      <template #actions>
        <BaseButton variant="primary"><Icon :icon="PlayIcon" /> Play</BaseButton>
        <BaseButton variant="secondary" icon-only label="Aleatório"><Icon :icon="ShuffleIcon" /></BaseButton>
        <BaseButton variant="secondary" icon-only label="Mais"><Icon :icon="MoreHorizontalIcon" /></BaseButton>
      </template>
    </ArtistHeader>

    <TabBar
      v-model="tab"
      class="mt-group"
      :tabs="[
        { id: 'profile', label: 'Profile' },
        { id: 'releases', label: 'Releases', count: 1 },
        { id: 'tracks', label: 'Tracks', count: 15 },
      ]"
    />

    <section class="mt-group">
      <h2 class="mb-inner text-heading font-bold">Ambré’s Top 5</h2>
      <ol>
        <TrackRow v-for="(t, i) in tracks" :key="t.title" v-bind="t" :index="i + 1" />
      </ol>
    </section>

    <section class="mt-group">
      <h2 class="mb-inner text-heading font-bold">Discography</h2>
      <AlbumCard layout="horizontal" title="PEYOTE" badge="New" subtitle="2026 · 15 songs" />
    </section>

    <FloatingSafeArea />
  </main>
  <PlayerBar title="Enter The Void" artist="Ambré — PEYOTE" :playing="playing" @toggle="playing = !playing" />
</template>
