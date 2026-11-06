#!/usr/bin/env node
/**
 * Gerador de tokens do design system.
 *
 * Entrada: tokens.config.json. Saídas:
 *   1. as regiões `@tokens:begin NOME … @tokens:end NOME` de src/styles/tokens.css (escalas φ, accent-50…900,
 *      hover/foco/texto do acento por tema, comentários de contraste);
 *   2. o espelho do feedback-layer (fallback-tokens.generated.ts), lido do tokens.css já resolvido.
 *
 * O que fica à mão no tokens.css (decisão de design): superfícies, fg*, border, mark*, success, danger,
 * --spacing-touch, --radius-pill, --spacing-floating, fontes e @font-face.
 *
 * Uso:
 *   npm run tokens                 valida, escreve tokens.css e o arquivo do feedback-layer
 *   npm run tokens:check           valida e compara com o disco; sai 1 se algo diverge (não escreve)
 *   --dry                          só valida (não escreve nem compara)
 *   --verbose                      imprime as medições de contraste
 *   --primary #hex                 troca a primária só nesta execução (com --dry, para testar cores)
 *   --fl-out caminho | --no-fl     troca o destino do arquivo do feedback-layer | não gera o espelho
 *   --config caminho               outro tokens.config.json
 * Sem dependências. Falhas de validação saem com código 1 e não escrevem nada.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CSS_PATH = resolve(ROOT, 'src/styles/tokens.css')
const THEMES = ['dark', 'light']
const SURFACES = ['bg', 'bg-raised', 'surface', 'surface-2']
const GAMUT_SHRINK = 0.95 // fator de redução do croma até caber no gamut sRGB (detalhe numérico, não de design)
const GAMUT_TRIES = 60

// ---------- argumentos ----------
const argv = process.argv.slice(2)
const flag = (n) => argv.includes(n)
const opt = (n) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : undefined)
const MODE_CHECK = flag('--check')
const MODE_DRY = flag('--dry')
const VERBOSE = flag('--verbose')

const errors = []
const warnings = []
const die = (msg) => {
  console.error(msg)
  process.exit(1)
}

// ---------- cor (OKLab/OKLCH, sRGB) ----------
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
const isHex6 = (h) => /^#[0-9a-f]{6}$/i.test(h)
const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
function toOklab([r, g, b]) {
  r = lin(r); g = lin(g); b = lin(b)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
}
function fromOklab([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
}
const inGamut = (rgb) => rgb.every((c) => c >= -1e-4 && c <= 1 + 1e-4)
const clamp01 = (v) => Math.min(1, Math.max(0, v))
function oklch2hex(L, C, h) {
  let c = C
  for (let i = 0; i < GAMUT_TRIES; i++) {
    const rgb = fromOklab([L, c * Math.cos(h), c * Math.sin(h)])
    if (inGamut(rgb)) return '#' + rgb.map((v) => Math.round(gam(clamp01(v)) * 255).toString(16).padStart(2, '0')).join('')
    c *= GAMUT_SHRINK
  }
  return '#000000'
}
const lum = (hex) => { const [r, g, b] = hex2rgb(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
const lch = (hex) => { const [L, A, B] = toOklab(hex2rgb(hex)); return { L, C: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 } }
const hueDelta = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d }

// ---------- formatação (pt-BR, igual ao que já está no tokens.css) ----------
const pt = (n, d) => n.toFixed(d).replace('.', ',')
const pt1 = (n) => pt(n, 1)
const pt2 = (n) => pt(n, 2)
const remStr = (n) => `${+n.toFixed(4)}rem`
function frac(x) {
  for (const den of [1, 2, 3, 4, 5, 6, 8]) {
    const num = x * den
    if (Math.abs(num - Math.round(num)) < 1e-9) return den === 1 ? `${Math.round(num)}` : `${Math.round(num)}/${den}`
  }
  return String(x)
}
const expLabel = (n, den) => (n === 0 ? 'φ^0' : `φ^(${n < 0 ? '-' : '+'}${Math.abs(n)}/${den})`)
const DEN_WORD = { 2: 'meios', 4: 'quartos' }

// ---------- arquivos ----------
function readNorm(path) {
  const raw = readFileSync(path, 'utf8')
  return { text: raw.replace(/\r\n/g, '\n'), eol: raw.includes('\r\n') ? '\r\n' : '\n' }
}
const withEol = (text, eol) => (eol === '\n' ? text : text.replace(/\n/g, eol))

// ---------- parser do tokens.css (blocos planos) ----------
function parseBlocks(source) {
  const clean = source.replace(/\/\*[\s\S]*?\*\//g, '')
  const out = []
  for (const m of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const vars = {}
    for (const d of m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[d[1].slice(2)] = d[2].trim()
    if (Object.keys(vars).length) out.push({ selector: m[1].trim().replace(/\s+/g, ' '), vars })
  }
  return out
}
function themeSets(source, cfg) {
  const all = parseBlocks(source)
  const pick = (test) => Object.assign({}, ...all.filter((b) => test(b.selector)).map((b) => b.vars))
  const rootVars = pick((s) => s.startsWith(':root'))
  const lightVars = pick((s) => s === "[data-theme='light']")
  const themeVars = pick((s) => s === '@theme')
  const visibleVars = pick((s) => s === cfg.flVisibleSelector)
  return {
    rootVars, lightVars, themeVars, visibleVars,
    dark: { ...rootVars },
    light: { ...rootVars, ...lightVars },
    shared: { ...themeVars, ...visibleVars },
  }
}
function resolveVar(name, vars) {
  let v = vars[name]
  if (v === undefined) throw new Error(`token --${name} ausente no tokens.css`)
  for (let i = 0; i < 6; i++) {
    const m = v.match(/^var\(--([\w-]+)\)$/)
    if (!m) return v
    v = vars[m[1]]
    if (v === undefined) throw new Error(`token --${m[1]} ausente no tokens.css (referenciado por --${name})`)
  }
  throw new Error(`var() em ciclo em --${name}`)
}

// ---------- config ----------
function loadConfig() {
  const path = resolve(opt('--config') ?? resolve(ROOT, 'tokens.config.json'))
  if (!existsSync(path)) die(`FALHA: config não encontrada: ${path}`)
  const cfg = JSON.parse(readFileSync(path, 'utf8'))
  if (opt('--primary')) cfg.primary = opt('--primary')
  if (!isHex6(cfg.primary)) die(`FALHA: "primary" deve ser #rrggbb (veio ${JSON.stringify(cfg.primary)}).`)
  cfg.primary = cfg.primary.toLowerCase()
  cfg.phiValue = cfg.phi === 'golden' ? (1 + Math.sqrt(5)) / 2 : Number(cfg.phi)
  if (!(cfg.phiValue > 1)) die('FALHA: "phi" deve ser "golden" ou um número > 1.')
  return cfg
}

// ---------- escala do accent ----------
function buildScale(cfg) {
  const phi = cfg.phiValue
  const { L: L0, C: C0, h } = lch(cfg.primary)
  const H = (h * Math.PI) / 180
  const scale = {}
  for (const [k, e] of Object.entries(cfg.accentSteps)) {
    if (Number(k) === cfg.accentStep) { scale[k] = cfg.primary; continue }
    let L, C
    if (e < 0) { // claros: fecham φ^e da distância restante até L = 1
      L = 1 - (1 - L0) * phi ** e
      C = C0 * phi ** (e / 2)
    } else { // escuros: L × φ^-e
      L = L0 * phi ** -e
      C = C0 * Math.min(cfg.chromaShade.cap, phi ** (-e / 2) * cfg.chromaShade.boost)
    }
    scale[k] = oklch2hex(L, C, H)
  }
  return scale
}

// ---------- validação ----------
function validate(cfg, scale, sets) {
  const steps = Object.keys(cfg.accentSteps).map(Number).sort((a, b) => a - b)
  const near = (cur, list) => [...list].sort((a, b) => Math.abs(steps.indexOf(a) - steps.indexOf(cur)) - Math.abs(steps.indexOf(b) - steps.indexOf(cur)) || a - b)
  const measures = { primary: cfg.primary, theme: {} }
  const min = cfg.contrast

  if (cfg.accentSteps[cfg.accentStep] !== 0) errors.push(`FALHA: accentSteps["${cfg.accentStep}"] deve ser 0 (o degrau accentStep é a própria primária).`)

  // texto sobre o acento
  const cands = cfg.accentFgCandidates
  let fg = cfg.accentFg
  if (fg === 'auto') {
    const ranked = cands.map((c) => ({ c, r: contrast(c, cfg.primary) })).sort((a, b) => b.r - a.r)
    if (ranked[0].r < min.fgOnAccent) {
      errors.push(`FALHA: nenhum texto serve sobre esta primária (${cfg.primary}): ${ranked.map((x) => `${x.c} = ${pt2(x.r)}:1`).join(', ')}, mínimo ${pt1(min.fgOnAccent)}:1. Troque a primária.`)
      return { fg: null, measures }
    }
    fg = ranked[0].c
  } else if (!isHex6(fg)) {
    errors.push(`FALHA: accentFg deve ser "auto" ou #rrggbb (veio ${JSON.stringify(fg)}).`)
    return { fg: null, measures }
  }
  fg = fg.toLowerCase()
  measures.fg = fg

  for (const theme of THEMES) {
    const vars = sets[theme]
    const surf = SURFACES.map((n) => ({ n, hex: resolveVar(n, vars).toLowerCase() }))
    const bad = surf.find((s) => !isHex6(s.hex))
    if (bad) { errors.push(`FALHA (${theme}): --${bad.n} = ${bad.hex} não é #rrggbb; o gerador não mede contraste dele.`); continue }
    const hoverStep = cfg.hover[theme], focusStep = cfg.focus[theme]
    const m = (measures.theme[theme] = { hoverStep, focusStep })

    if (!(hoverStep in scale)) { errors.push(`FALHA (${theme}): hover.${theme} = ${hoverStep} não existe em accentSteps.`); continue }
    if (!(focusStep in scale)) { errors.push(`FALHA (${theme}): focus.${theme} = ${focusStep} não existe em accentSteps.`); continue }
    const accent = scale[cfg.accentStep], hover = scale[hoverStep], focus = scale[focusStep]

    // accent-fg × accent
    m.fgOnAccent = contrast(fg, accent)
    if (m.fgOnAccent < min.fgOnAccent) errors.push(`FALHA (${theme}): accent-fg (${fg}) × accent (${accent}) = ${pt2(m.fgOnAccent)}:1, mínimo ${pt1(min.fgOnAccent)}:1. Troque accentFg ou a primária.`)

    // hover: outro degrau e texto legível
    m.fgOnHover = contrast(fg, hover)
    if (hoverStep === cfg.accentStep) {
      errors.push(`FALHA (${theme}): hover.${theme} = ${hoverStep} é o próprio accent; o hover precisa ser outro degrau.`)
    } else if (m.fgOnHover < min.fgOnAccent) {
      const ok = near(hoverStep, steps.filter((s) => s !== cfg.accentStep && contrast(fg, scale[s]) >= min.fgOnAccent))
      errors.push(
        `FALHA (${theme}): hover (${hoverStep}, ${hover}) × accent-fg (${fg}) = ${pt2(m.fgOnHover)}:1, mínimo ${pt1(min.fgOnAccent)}:1. ` +
          (ok.length
            ? `Degraus que passam, do mais próximo: ${ok.slice(0, 4).map((s) => `${s} (${pt2(contrast(fg, scale[s]))}:1)`).join(', ')}. Edite hover.${theme} em tokens.config.json (o script não troca sozinho).`
            : 'Nenhum degrau da escala passa com este accent-fg. Troque a primária ou o accentFg.'),
      )
    }

    // foco × 4 superfícies
    const rs = surf.map((s) => ({ ...s, r: contrast(focus, s.hex) }))
    const worst = rs.reduce((a, b) => (b.r < a.r ? b : a))
    m.focusWorst = worst.r
    m.focusWorstOn = worst.n
    if (worst.r < min.focus) {
      const ok = near(focusStep, steps.filter((s) => SURFACES.every((_, i) => contrast(scale[s], surf[i].hex) >= min.focus)))
      errors.push(
        `FALHA (${theme}): focus-ring (${focusStep}, ${focus}) contra --${worst.n} (${worst.hex}) = ${pt2(worst.r)}:1, mínimo ${pt1(min.focus)}:1 (pior das 4 superfícies). ` +
          (ok.length
            ? `Degraus que passam nas 4, do mais próximo: ${ok.slice(0, 4).map((s) => `${s} (${pt2(Math.min(...surf.map((x) => contrast(scale[s], x.hex))))}:1)`).join(', ')}. Edite focus.${theme} em tokens.config.json (o script não troca sozinho).`
            : 'Nenhum degrau da escala passa nas 4 superfícies. Troque a primária.'),
      )
    }

    // avisos de matiz (mark, success, danger)
    const prim = lch(cfg.primary)
    m.hue = {}
    if (prim.C >= cfg.primaryLimits.minChroma) {
      for (const [name, limit] of Object.entries(cfg.hueWarn)) {
        const hex = resolveVar(name, vars).toLowerCase()
        if (!isHex6(hex)) continue
        const d = hueDelta(prim.h, lch(hex).h)
        m.hue[name] = d
        if (d < limit) warnings.push(`AVISO (${theme}): --${name} (${hex}) está a ${pt1(d)}° de matiz da primária (limite ${limit}°). Revise --${name} à mão no tokens.css: ele pode ser confundido com a ação principal.`)
      }
    }
  }
  return { fg, measures }
}

// ---------- regiões do tokens.css ----------
function renderRegions(cfg, scale, fg) {
  const phi = cfg.phiValue
  const HEX = cfg.primary.toUpperCase()
  const fgWord = lum(fg) < 0.5 ? 'escuro' : 'claro'
  const alt = cfg.accentFgCandidates.find((c) => c.toLowerCase() !== fg)
  const accent = scale[cfg.accentStep]
  const sets = cfg._sets
  const bg = { dark: resolveVar('bg', sets.dark).toLowerCase(), light: resolveVar('bg', sets.light).toLowerCase() }
  const rFg = contrast(fg, accent)
  const R = {}

  // cabeçalho
  const ty = cfg.type, sp = cfg.space, ra = cfg.radius
  const unit = Math.min(...Object.values(cfg.accentSteps).map((v, i, a) => (i ? Math.abs(v - a[i - 1]) : Infinity)))
  const lines = [
    '/*',
    ` * PROPORÇÃO ÁUREA (φ = ${phi.toFixed(10).replace('.', ',')}). Todas as escalas saem dela:`,
    ` *   tipografia: passo = φ^(1/${ty.den}) (×${pt(phi ** (1 / ty.den), 3)}; ${ty.den} passos = ×φ), base 1rem`,
  ]
  if (sp.den === ra.den) lines.push(` *   espaçamento e raios: passo = φ^(1/${sp.den}) (×${pt(phi ** (1 / sp.den), 3)}; ${sp.den} passos = ×φ), base 1rem`)
  else {
    lines.push(` *   espaçamento: passo = φ^(1/${sp.den}) (×${pt(phi ** (1 / sp.den), 3)}; ${sp.den} passos = ×φ), base 1rem`)
    lines.push(` *   raios: passo = φ^(1/${ra.den}) (×${pt(phi ** (1 / ra.den), 3)}; ${ra.den} passos = ×φ), base 1rem`)
  }
  lines.push(
    ` *   cor primária (accent-50…900): ${cfg.accentStep} = ${HEX}; claros fecham a distância até o branco por φ^(-${frac(unit)}) a cada passo`,
    ` *   (em OKLCH), escuros multiplicam a luminosidade por φ^(-${frac(unit)}) a cada passo. Croma limitado ao gamut sRGB.`,
    ' * Valores em rem estão calculados e arredondados em 4 casas; o expoente fica no comentário de cada token.',
    ' */',
  )
  R['header-scales'] = lines

  // escala do accent
  R['accent-scale'] = Object.entries(scale).map(([k, v]) => `--accent-${k}: ${v};${Number(k) === cfg.accentStep ? ' /* primária */' : ''}`)

  // estados por tema
  for (const theme of THEMES) {
    const hs = cfg.hover[theme], fs = cfg.focus[theme]
    const hover = scale[hs], focus = scale[fs]
    const rHover = contrast(fg, hover)
    if (theme === 'dark') {
      const rAltOnAccent = alt ? contrast(alt, accent) : null
      const first = `/* Acento (cor primária ${HEX}): SOMENTE a ação principal da tela (ver AGENTS.md).`
      let second = `   Texto sobre o acento é ${fgWord} (--accent-fg): ${pt1(rFg)}:1 sobre ${HEX}.`
      if (alt) second += ` ${alt.toLowerCase() === '#ffffff' ? 'Branco' : alt} daria ${pt1(rAltOnAccent)}:1${rAltOnAccent < cfg.contrast.fgOnAccent ? ' e não pode ser usado' : ''}.`
      second += ' */'
      const dir = lum(hover) > lum(accent) ? 'claro' : 'escuro'
      R['accent-dark'] = [
        first, second,
        `--accent: var(--accent-${cfg.accentStep});`,
        `--accent-hover: var(--accent-${hs}); /* ${dir}: ${pt1(rHover)}:1 com --accent-fg; ${pt1(contrast(accent, bg.dark))}:1 do acento contra --bg */`,
        `--accent-fg: ${fg};`,
      ]
      R['focus-dark'] = [`--focus-ring: var(--accent-${fs}); /* ${pt1(contrast(focus, bg.dark))}:1 contra --bg */`]
    } else {
      const rOnBg = contrast(accent, bg.light)
      const accentNote = rOnBg < 3
        ? `${HEX} sobre ${bg.light} dá só ${pt1(rOnBg)}:1: o botão se separa do fundo pelo texto ${fgWord} (${pt1(rFg)}:1) e pelo anel de foco`
        : `${HEX} sobre ${bg.light} dá ${pt1(rOnBg)}:1`
      R['accent-light'] = [
        `--accent: var(--accent-${cfg.accentStep}); /* ${accentNote} */`,
        `--accent-hover: var(--accent-${hs}); /* ${pt1(rHover)}:1 com --accent-fg */`,
        `--accent-fg: ${fg};`,
      ]
      R['focus-light'] = [`--focus-ring: var(--accent-${fs}); /* ${pt1(contrast(focus, bg.light))}:1 contra ${bg.light} */`]
    }
  }

  // escalas φ
  const px = (n, den, e) => (e === 0 ? `${cfg.basePx}` : pt1(phi ** (e / den) * cfg.basePx))
  const scaleLines = (spec, prefix, notes = {}) =>
    Object.entries(spec.steps).map(([name, e]) => {
      const v = phi ** (e / spec.den)
      return `--${prefix}-${name}: ${remStr(v)}; /* ${expLabel(e, spec.den)} = ${px(v, spec.den, e)}px${notes[name] ? `: ${notes[name]}` : ''} */`
    })
  const denWord = (den) => DEN_WORD[den] ?? `1/${den}`
  R['type-scale'] = [
    `/* Escala tipográfica áurea: n ${denWord(ty.den)} de passo = 1rem × φ^(n/${ty.den}). ${ty.den} passos = ×φ. */`,
    ...scaleLines(ty, 'text'),
  ]
  R['space-scale'] = [
    `/* Espaçamento áureo: 1rem × φ^(n/${sp.den}). Cabeçalhos têm DOIS grupos: use inner dentro do grupo e group entre grupos. */`,
    ...scaleLines(sp, 'spacing', sp.notes),
  ]
  R['radius-scale'] = [`/* Raios áureos: 1rem × φ^(n/${ra.den}) */`, ...scaleLines(ra, 'radius')]
  return R
}

function applyRegions(text, regions) {
  let out = text
  for (const [name, lines] of Object.entries(regions)) {
    const re = new RegExp(`^([ \\t]*)/\\* @tokens:begin ${name} \\*/\\n[\\s\\S]*?\\n[ \\t]*/\\* @tokens:end ${name} \\*/`, 'm')
    const m = out.match(re)
    if (!m) { errors.push(`FALHA: região "${name}" ausente em src/styles/tokens.css (faltam os marcadores @tokens:begin/@tokens:end ${name}).`); continue }
    const ind = m[1]
    const body = lines.map((l) => (l ? ind + l : l)).join('\n')
    out = out.replace(re, () => `${ind}/* @tokens:begin ${name} */\n${body}\n${ind}/* @tokens:end ${name} */`)
  }
  return out
}

// ---------- espelho do feedback-layer ----------
function renderFl(cfg, finalCss, sets) {
  const mirror = cfg.flMirror
  const known = new Set([...Object.keys(sets.rootVars), ...Object.keys(sets.lightVars), ...Object.keys(sets.themeVars)])
  const mirrored = new Set([...mirror.colors, ...Object.values(mirror.shared), ...cfg.flIgnore])
  const orphan = [...known].filter((n) => !mirrored.has(n)).sort()
  if (orphan.length) errors.push(`FALHA: tokens do tokens.css sem destino no feedback-layer: ${orphan.map((n) => `--${n}`).join(', ')}. Inclua cada um em flMirror ou flIgnore em tokens.config.json (decisão consciente).`)
  const q = (s) => (s.includes("'") ? JSON.stringify(s) : `'${s}'`)
  const key = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : `'${k}'`)
  try {
    const color = (name, vars) => {
      const v = resolveVar(name, vars).toLowerCase()
      if (!/^#[0-9a-f]{6}([0-9a-f]{2})?$/.test(v)) throw new Error(`--${name} = ${v} não é um hex; o espelho do feedback-layer espera hex nas cores.`)
      return v
    }
    const dark = mirror.colors.map((n) => `  ${key(n)}: ${q(color(n, sets.dark))},`)
    const light = mirror.colors.map((n) => `  ${key(n)}: ${q(color(n, sets.light))},`)
    const shared = Object.entries(mirror.shared).map(([k, host]) => `  ${key(k)}: { host: ${q(host)}, value: ${q(resolveVar(host, sets.shared))} },`)
    const hash = createHash('sha256').update(finalCss).digest('hex')
    return [
      '/**',
      ' * GERADO por design-system-vue/scripts/tokens.mjs a partir de src/styles/tokens.css. NÃO EDITE À MÃO.',
      ` * sha256 do tokens.css (quebras de linha LF): ${hash}`,
      ' * Para mudar um valor: edite tokens.config.json (ou o tokens.css, nas partes à mão) no design-system-vue,',
      ' * rode `npm run tokens` lá e commite os dois repositórios com o mesmo nome de branch. Merge: feedback-layer primeiro.',
      ' * Cores resolvidas (var() expandido), tema dark = `:root`, light = `[data-theme=\'light\']`; compartilhados = `@theme`.',
      ' */',
      '',
      '/** Cores, tema dark. Nome do token do DS = nome da variável do host. */',
      'export const COLORS_DARK = {',
      ...dark,
      '} as const',
      '',
      '/** Cores, tema light. */',
      'export const COLORS_LIGHT: Record<keyof typeof COLORS_DARK, string> = {',
      ...light,
      '}',
      '',
      '/** Tokens iguais nos dois temas: nome `--fl-*` -> variável do host + fallback. */',
      'export const SHARED: Record<string, { host: string; value: string }> = {',
      ...shared,
      '}',
      '',
    ].join('\n')
  } catch (e) {
    errors.push(`FALHA: ${e.message}`)
    return null
  }
}

// ---------- principal ----------
function report() {
  for (const w of warnings) console.warn(w)
  for (const e of errors) console.error(e)
}

const cfg = loadConfig()
const css = readNorm(CSS_PATH)
cfg._sets = themeSets(css.text, cfg)

// primária degenerada
const prim = lch(cfg.primary)
if (prim.L > cfg.primaryLimits.maxLightness) errors.push(`FALHA: primária ${cfg.primary} é clara demais (L = ${pt2(prim.L)} > ${pt2(cfg.primaryLimits.maxLightness)}): a escala fica chapada.`)
else if (prim.L < cfg.primaryLimits.minLightness) errors.push(`FALHA: primária ${cfg.primary} é escura demais (L = ${pt2(prim.L)} < ${pt2(cfg.primaryLimits.minLightness)}): o anel de foco escuro nunca passa no contraste.`)
if (!errors.length && prim.C < cfg.primaryLimits.minChroma) warnings.push(`AVISO: primária ${cfg.primary} sem croma (C = ${pt(prim.C, 3)}): matiz indefinido, aviso do mark pulado.`)
if (errors.length) { report(); process.exit(1) }

const scale = buildScale(cfg)
const { fg, measures } = validate(cfg, scale, cfg._sets)

if (VERBOSE) {
  console.log(`primária ${cfg.primary}  L=${pt(prim.L, 3)} C=${pt(prim.C, 3)} h=${pt1(prim.h)}  accent-fg=${measures.fg ?? '-'}`)
  console.log('  escala: ' + Object.entries(scale).map(([k, v]) => `${k} ${v} (${pt2(contrast(v, '#ffffff'))}:1 s/ branco)`).join(' | '))
  for (const t of THEMES) {
    const m = measures.theme[t]
    if (!m) continue
    console.log(`  ${t}: hover ${m.hoverStep} × fg = ${m.fgOnHover ? pt2(m.fgOnHover) : '-'}  | accent × fg = ${m.fgOnAccent ? pt2(m.fgOnAccent) : '-'}  | foco ${m.focusStep} pior = ${m.focusWorst ? pt2(m.focusWorst) : '-'} (${m.focusWorstOn ?? '-'})  | matiz Δ ${Object.entries(m.hue ?? {}).map(([k, v]) => `${k}=${pt1(v)}°`).join(' ') || '-'}`)
  }
}
if (errors.length) { report(); process.exit(1) }

// docs que citam a primária
for (const f of cfg.docRefs ?? []) {
  const p = resolve(ROOT, f)
  if (existsSync(p) && !readNorm(p).text.toLowerCase().includes(cfg.primary)) warnings.push(`AVISO: ${f} não cita a primária ${cfg.primary.toUpperCase()}. Revise os textos sobre cor primária, foco e texto do acento.`)
}

const finalCss = applyRegions(css.text, renderRegions(cfg, scale, fg))
if (errors.length) { report(); process.exit(1) }
const finalSets = themeSets(finalCss, cfg)

let flText = null
let flPath = null
if (!flag('--no-fl')) {
  flPath = resolve(ROOT, opt('--fl-out') ?? cfg.flOut)
  flText = renderFl(cfg, finalCss, finalSets)
  if (errors.length) { report(); process.exit(1) }
}

if (MODE_DRY) { report(); console.log('tokens: validação ok (--dry: nada escrito nem comparado).'); process.exit(0) }

// escrever / comparar
const targets = [{ label: 'src/styles/tokens.css', path: CSS_PATH, next: finalCss, cur: css.text, eol: css.eol }]
if (flText !== null) {
  const exists = existsSync(flPath)
  const cur = exists ? readNorm(flPath) : { text: null, eol: '\n' }
  targets.push({ label: flPath, path: flPath, next: flText, cur: cur.text, eol: cur.eol, missing: !exists })
}
const stale = targets.filter((t) => t.cur !== t.next)

if (MODE_CHECK) {
  report()
  if (stale.length) {
    for (const t of stale) {
      if (t.missing) { console.error(`DIVERGE: ${t.label} não existe.`); continue }
      const a = t.cur.split('\n'), b = t.next.split('\n')
      const i = a.findIndex((l, n) => l !== b[n])
      console.error(`DIVERGE: ${t.label} difere do gerado (primeira diferença na linha ${(i < 0 ? Math.min(a.length, b.length) : i) + 1}).`)
      if (i >= 0) console.error(`  no disco: ${a[i]}\n  gerado:   ${b[i] ?? '(fim)'}`)
    }
    console.error('Rode `npm run tokens` e commite o resultado (não edite regiões geradas à mão).')
    process.exit(1)
  }
  console.log('tokens:check ok (tokens.css e espelho do feedback-layer iguais ao gerado).')
  process.exit(0)
}

for (const t of targets) {
  if (t.missing && !existsSync(dirname(t.path))) die(`FALHA: a pasta de ${t.path} não existe. O feedback-layer precisa estar clonado ao lado (ou use --no-fl / --fl-out).`)
  if (t.cur === t.next) { console.log(`sem mudança: ${t.label}`); continue }
  writeFileSync(t.path, withEol(t.next, t.eol))
  console.log(`escrito: ${t.label}`)
}
report()
if (stale.length) console.log('Lembrete: se a primária, o foco ou o texto do acento mudaram, revise AGENTS.md e README.md (textos sobre cor).')
