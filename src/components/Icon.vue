<script setup lang="ts">
// Formato de cada ícone de @hugeicons/core-free-icons (o pacote não exporta este tipo na raiz).
type IconSvgObject = readonly (readonly [string, Readonly<Record<string, string | number>>])[]

import { HugeiconsIcon, type IconArray } from '@hugeicons/vue'

/**
 * ÚNICO ponto de uso do Hugeicons. Ícone em tela = <Icon :icon="..." />; nunca <svg> solto, emoji ou
 * importar `@hugeicons/vue` fora deste arquivo (ver AGENTS.md).
 *
 * - icon: objeto importado POR NOME, para o bundle levar só o que é usado:
 *     import { PlayIcon } from '@hugeicons/core-free-icons'
 *   Nunca `import * as` nem o pacote inteiro.
 * - size: sm | md | lg => tokens --spacing-icon-* (escala áurea, 16 / 20,4 / 25,9 px). O tamanho vem do CSS
 *   (classe de token); o `size` numérico do Hugeicons só fixa o viewBox de 24.
 * - weight: regular | bold. Muda SOMENTE o strokeWidth do traço (ativo/selecionado usam bold). Nunca troque de
 *   ícone nem use filtro para dar ênfase.
 * - variant: stroke | solid. Só existe stroke (Stroke Rounded, pacote grátis @hugeicons/core-free-icons, MIT).
 *   `solid` ainda renderiza o stroke: o estilo preenchido é da versão Pro (@hugeicons-pro/*, pago, exige token),
 *   que NÃO está instalada. Se a licença Pro for adquirida, é AQUI que `variant="solid"` passa a escolher o
 *   ícone preenchido; as telas não mudam.
 * - Cor: herda `currentColor`. Use classes de token no pai ou na própria tag (text-fg, text-fg-muted...).
 * - label: sem label o ícone é decorativo (aria-hidden). Com label vira role="img" + aria-label.
 *   Botão só com ícone: passe `label` no BaseButton (o ícone fica decorativo).
 */
const props = withDefaults(
  defineProps<{
    icon: IconSvgObject
    size?: 'sm' | 'md' | 'lg'
    variant?: 'stroke' | 'solid'
    weight?: 'regular' | 'bold'
    label?: string
  }>(),
  { size: 'md', variant: 'stroke', weight: 'regular' },
)

const sizeClass = { sm: 'size-icon-sm', md: 'size-icon-md', lg: 'size-icon-lg' } as const
// Traço em unidades do viewBox 24 (padrão do Hugeicons = 1.5).
const strokeWidth = { regular: 1.5, bold: 2.25 } as const
</script>

<template>
  <HugeiconsIcon
    :icon="props.icon as IconArray"
    :size="24"
    :stroke-width="strokeWidth[props.weight]"
    :class="[sizeClass[props.size], 'shrink-0']"
    :aria-hidden="props.label ? undefined : 'true'"
    :role="props.label ? 'img' : undefined"
    :aria-label="props.label"
    focusable="false"
    :data-variant="props.variant"
  />
</template>
