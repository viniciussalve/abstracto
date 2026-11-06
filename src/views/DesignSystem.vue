<script setup lang="ts">
import { ref } from 'vue'
import ArtistHeader from '@/components/ArtistHeader.vue'
import BaseButton from '@/components/BaseButton.vue'
import CoverArt from '@/components/CoverArt.vue'
import TabBar from '@/components/TabBar.vue'
import TrackRow from '@/components/TrackRow.vue'
import AlbumCard from '@/components/AlbumCard.vue'
import Icon from '@/components/Icon.vue'
import {
  Alert02Icon,
  Home01Icon,
  Message01Icon,
  MoreHorizontalIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PreviousIcon,
  Search01Icon,
  ShuffleIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'

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

const colors = ['bg', 'bg-raised', 'surface', 'surface-2', 'placeholder', 'fg', 'fg-muted', 'fg-subtle', 'accent', 'accent-hover', 'accent-fg', 'mark', 'mark-fg', 'success', 'danger']
const texts = [
  ['text-micro', '9,9px · φ^-1'],
  ['text-caption', '11,2px · φ^-3/4'],
  ['text-body', '12,6px · φ^-1/2'],
  ['text-body-lg', '14,2px · φ^-1/4'],
  ['text-title', '18,0px · φ^1/4'],
  ['text-heading', '20,4px · φ^1/2'],
  ['text-display', '53,3px · φ^5/2'],
] as const
const accentScale = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const
const spaces = [
  ['inner-sm', '12.6px'],
  ['inner', '16px'],
  ['group', '32.9px'],
  ['icon-sm', '16px'],
  ['icon-md', '20.4px'],
  ['icon-lg', '25.9px'],
  ['touch', '44px'],
  ['floating', '104px'],
] as const

// Ícones: só os que o app usa. Cada um importado por nome (ver Icon.vue).
const iconSet = [
  ['PlayIcon', PlayIcon],
  ['PauseIcon', PauseIcon],
  ['PreviousIcon', PreviousIcon],
  ['NextIcon', NextIcon],
  ['ShuffleIcon', ShuffleIcon],
  ['MoreHorizontalIcon', MoreHorizontalIcon],
  ['Tick02Icon', Tick02Icon],
  ['Alert02Icon', Alert02Icon],
  ['Message01Icon', Message01Icon],
] as const
const iconSizes = [
  ['sm', 'icon-sm · 16px · φ^0'],
  ['md', 'icon-md · 20,4px · φ^1/2'],
  ['lg', 'icon-lg · 25,9px · φ^1'],
] as const
const iconColors = ['text-fg', 'text-fg-muted', 'text-fg-subtle', 'text-mark', 'text-success', 'text-danger'] as const
const navItems = [
  { id: 'home', label: 'Início', icon: Home01Icon },
  { id: 'search', label: 'Buscar', icon: Search01Icon },
  { id: 'play', label: 'Tocando', icon: PlayIcon },
] as const
const navSelected = ref<string>('home')
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
      <h2 class="mb-inner text-heading font-bold">Cor primária · escala áurea (#F5C518)</h2>
      <p class="mb-inner text-body text-fg-muted">
        500 é a primária. Cada passo para claro fecha φ^-1/2 da distância até o branco; cada passo para escuro multiplica
        a luminosidade por φ^-1/2 (OKLCH). Texto sobre o acento é sempre <code>accent-fg</code> (escuro).
      </p>
      <div class="grid grid-cols-5 gap-inner-sm sm:grid-cols-10">
        <div v-for="n in accentScale" :key="n" class="rounded-card border border-border p-2">
          <div class="h-12 rounded-control border border-border" :style="{ background: `var(--accent-${n})` }" />
          <code class="mt-1 block text-caption text-fg-muted">{{ n }}</code>
        </div>
      </div>
    </section>

    <section>
      <h2 class="mb-inner text-heading font-bold">Tipografia · Inter 4.1 (variável) · passo φ^(1/4)</h2>
      <p v-for="[cls, px] in texts" :key="cls" class="mb-2 truncate" :class="cls">
        {{ cls }} · {{ px }} · Ambré
      </p>
    </section>

    <section>
      <h2 class="mb-inner text-heading font-bold">Marcação e estados (mark, success, danger)</h2>
      <p class="mb-inner text-body text-fg-muted">
        <code>mark</code> marca anotações (pino, realce, contador); nunca na ação principal. <code>success</code> e
        <code>danger</code> sempre vêm com ícone + texto, nunca só cor.
      </p>
      <div class="flex flex-wrap items-center gap-inner-sm">
        <span class="inline-flex size-6 items-center justify-center rounded-pill bg-mark text-caption font-semibold text-mark-fg">1</span>
        <span class="inline-flex items-center gap-2 rounded-control bg-surface px-3 py-1 text-body font-semibold text-success"><Icon :icon="Tick02Icon" size="sm" /> Enviado</span>
        <span class="inline-flex items-center gap-2 rounded-control bg-surface px-3 py-1 text-body font-semibold text-danger"><Icon :icon="Alert02Icon" size="sm" /> Não foi possível enviar</span>
      </div>
      <pre class="mt-inner overflow-auto rounded-control border border-border bg-bg p-inner-sm font-mono text-caption text-fg-muted">font-mono: # [bug · medium] nota</pre>
    </section>

    <section>
      <h2 class="mb-inner text-heading font-bold">Botão flutuante de infraestrutura (Feedback Layer)</h2>
      <p class="mb-inner text-body text-fg-muted">
        Usa o par invertido <code>bg-fg text-bg</code>, nunca <code>secondary</code> (surface sobre o fundo dá 1,2–1,3:1) nem
        <code>primary</code>. Anel de 2px <code>bg</code> por fora e realce em anel duplo (<code>fg</code> + <code>bg</code>) separam
        o elemento de qualquer fundo do host. Abaixo, sobre fundo escuro e claro, independente do tema da página.
        Com o layer montado e visível (<code>html[data-feedback-layer='visible']</code>), <code>FloatingSafeArea</code> cresce de
        104px para 144px (<code>--spacing-floating</code>).
      </p>
      <div class="grid gap-inner sm:grid-cols-2">
        <div
          v-for="t in ['dark', 'light']"
          :key="t"
          :data-theme="t"
          class="flex items-center gap-group rounded-card border border-border bg-bg p-inner text-fg"
        >
          <button
            type="button"
            aria-label="Abrir Feedback Layer"
            class="grid size-touch place-items-center rounded-pill border border-border bg-fg text-bg ring-2 ring-bg transition-colors hover:bg-fg-muted"
          >
            <Icon :icon="Message01Icon" />
          </button>
          <div class="h-12 w-24 rounded-control bg-mark/15 outline-2 outline-fg ring-4 ring-bg" />
          <code class="text-caption text-fg-muted">host {{ t }}</code>
        </div>
      </div>
    </section>

    <section id="icones" data-ds="icons">
      <h2 class="mb-inner text-heading font-bold">Ícones · Hugeicons Stroke Rounded</h2>
      <p class="mb-inner text-body text-fg-muted">
        Biblioteca padrão: Hugeicons, estilo Stroke Rounded (pacote grátis, MIT). Sempre via <code>&lt;Icon&gt;</code>:
        nada de <code>&lt;svg&gt;</code> solto nem emoji. Herda <code>currentColor</code>. Ênfase muda só a espessura do traço
        (<code>weight="bold"</code>), nunca o ícone. <code>variant="solid"</code> ainda renderiza o stroke: o preenchido é da
        versão Pro (paga) e não está instalado.
      </p>

      <h3 class="mb-inner-sm text-title font-semibold">Em uso no app</h3>
      <div class="mb-group flex flex-wrap gap-inner-sm" data-ds="icons-set">
        <div v-for="[name, ic] in iconSet" :key="name" class="flex w-28 flex-col items-center gap-2 rounded-card border border-border p-2">
          <Icon :icon="ic" size="lg" class="text-fg" />
          <code class="max-w-full truncate text-caption text-fg-muted">{{ name }}</code>
        </div>
      </div>

      <h3 class="mb-inner-sm text-title font-semibold">Tamanhos</h3>
      <div class="mb-group flex flex-wrap items-end gap-group" data-ds="icons-sizes">
        <div v-for="[s, note] in iconSizes" :key="s" class="flex flex-col items-center gap-2">
          <Icon :icon="PlayIcon" :size="s" class="text-fg" />
          <code class="text-caption text-fg-muted">{{ s }}</code>
          <span class="text-caption text-fg-subtle">{{ note }}</span>
        </div>
      </div>

      <h3 class="mb-inner-sm text-title font-semibold">Cores, nos dois temas</h3>
      <div class="mb-group grid gap-inner sm:grid-cols-2" data-ds="icons-colors">
        <div
          v-for="t in ['dark', 'light']"
          :key="t"
          :data-theme="t"
          :data-ds-theme="t"
          class="flex flex-col gap-inner-sm rounded-card border border-border bg-bg p-inner text-fg"
        >
          <code class="text-caption text-fg-muted">tema {{ t }}</code>
          <div class="flex flex-wrap items-center gap-inner">
            <span v-for="c in iconColors" :key="c" class="flex flex-col items-center gap-1" :class="c">
              <Icon :icon="ShuffleIcon" size="lg" />
              <code class="text-caption">{{ c.replace('text-', '') }}</code>
            </span>
          </div>
        </div>
      </div>

      <h3 class="mb-inner-sm text-title font-semibold">Estados: normal, ativo, selecionado</h3>
      <p class="mb-inner text-body text-fg-muted">
        Normal: <code>fg-muted</code>, traço regular. Ativo (hover/foco/pressionado): <code>fg</code>. Selecionado:
        <code>fg</code> + traço <code>bold</code> (e <code>aria-pressed</code> ou <code>aria-current</code>). Nada de acento.
      </p>
      <div class="mb-inner grid gap-inner sm:grid-cols-2" data-ds="icons-states">
        <div
          v-for="t in ['dark', 'light']"
          :key="t"
          :data-theme="t"
          :data-ds-theme="t"
          class="flex flex-wrap items-center gap-group rounded-card border border-border bg-bg p-inner text-fg"
        >
          <span class="flex flex-col items-center gap-1 text-fg-muted" data-state="normal">
            <Icon :icon="Home01Icon" size="lg" />
            <code class="text-caption">normal</code>
          </span>
          <span class="flex flex-col items-center gap-1 text-fg" data-state="active">
            <Icon :icon="Home01Icon" size="lg" />
            <code class="text-caption">ativo</code>
          </span>
          <span class="flex flex-col items-center gap-1 text-fg" data-state="selected">
            <Icon :icon="Home01Icon" size="lg" weight="bold" />
            <code class="text-caption">selecionado</code>
          </span>
        </div>
      </div>
      <nav class="flex gap-inner-sm" aria-label="Exemplo de seleção" data-ds="icons-nav">
        <button
          v-for="n in navItems"
          :key="n.id"
          type="button"
          :aria-label="n.label"
          :aria-pressed="navSelected === n.id"
          class="grid size-touch place-items-center rounded-pill transition-colors hover:bg-surface hover:text-fg"
          :class="navSelected === n.id ? 'bg-surface text-fg' : 'text-fg-muted'"
          @click="navSelected = n.id"
        >
          <Icon :icon="n.icon" :weight="navSelected === n.id ? 'bold' : 'regular'" />
        </button>
      </nav>
    </section>

    <section>
      <h2 class="mb-inner text-heading font-bold">Espaçamento</h2>
      <div v-for="[n, px] in spaces" :key="n" class="mb-2 flex items-center gap-inner text-body">
        <code class="w-24 text-fg-muted">{{ n }}</code>
        <div class="h-3 rounded-pill bg-fg-subtle" :style="{ width: px }" />
        <span class="text-fg-subtle">{{ px }}</span>
      </div>
    </section>

    <section>
      <h2 class="mb-inner text-heading font-bold">BaseButton</h2>
      <div class="flex flex-wrap items-center gap-inner-sm">
        <BaseButton variant="primary">Primary (1 por tela)</BaseButton>
        <BaseButton>Secondary</BaseButton>
        <BaseButton variant="ghost">Ghost</BaseButton>
        <BaseButton icon-only label="Mais"><Icon :icon="MoreHorizontalIcon" /></BaseButton>
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
          <BaseButton variant="primary"><Icon :icon="PlayIcon" /> Play</BaseButton>
          <BaseButton icon-only label="Aleatório"><Icon :icon="ShuffleIcon" /></BaseButton>
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
