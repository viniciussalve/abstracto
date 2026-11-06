# design-system-vue

Repo template. Todo projeto novo (web + mobile responsivo) parte daqui.

```bash
npm install
npm run dev      # / = tela de exemplo, /design-system = página viva do DS
npm run build
```

**Pré-requisito:** o repo `feedback-layer` precisa estar clonado como irmão deste (`../feedback-layer`) e com o build feito, senão `npm install` e `npm run build` quebram (dependência `file:../feedback-layer/...`):

```bash
git clone git@github.com:viniciussalve/feedback-layer.git ../feedback-layer
cd ../feedback-layer && npm install && npm run build
```

## Tokens gerados

`tokens.config.json` é a entrada; `scripts/tokens.mjs` (sem dependências) escreve as regiões `@tokens:begin … @tokens:end` de `src/styles/tokens.css` (escalas áureas, `accent-50…900`, hover/foco/texto do acento por tema, cabeçalho de fórmulas) e o espelho do feedback-layer (`../feedback-layer/packages/core/src/fallback-tokens.generated.ts`). Não edite essas regiões nem o arquivo gerado à mão.

```bash
npm run tokens         # valida, escreve o tokens.css e o arquivo do feedback-layer
npm run tokens:check   # só compara com o disco; sai 1 se algo diverge (usado no CI)
node scripts/tokens.mjs --dry --verbose --primary '#2563eb' --no-fl   # testa uma cor sem escrever nada
```

**Trocar a cor primária ou a base das escalas:**
1. Edite `primary` (ou `basePx`, `accentSteps`, `type`, `space`, `radius`) em `tokens.config.json`.
2. `npm run tokens`. Se falhar, a mensagem diz qual contraste quebrou e quais degraus passam; ajuste `hover`, `focus` ou `accentFg` na config. O script só sugere, nunca troca sozinho.
3. Leia os `AVISO`: `--mark`, `--success` e `--danger` não são gerados (decisão de design) e podem se confundir com a nova primária.
4. Revise à mão os textos que citam a cor (`AGENTS.md`, comentários dos tokens escritos à mão).
5. Faça **dois commits com o mesmo nome de branch**, um aqui e um no `feedback-layer`. Merge: `feedback-layer` primeiro, depois este repo.

Contrastes verificados: `accent-fg` ≥ 4,5:1 sobre `accent` e `accent-hover` em cada tema; `focus-ring` ≥ 3:1 contra as 4 superfícies de cada tema (`bg`, `bg-raised`, `surface`, `surface-2`). Recusa primária com L > 0,97 ou L < 0,15; sem croma (< 0,02) é só aviso.

**A escala `accent-50…900` é ancorada no degrau 500.** Os claros fecham uma fração da distância até o branco e os escuros multiplicam a luminosidade; por isso, com primárias escuras, `accent-50…200` não ficam pálidos (ex.: `#1e3a8a` dá 1,79:1 de `accent-50` contra o branco). O feedback-layer só usa 400, 500, 600 e 700.

Fora do gerador, à mão: superfícies, `fg*`, `border`, `mark*`, `success`, `danger`, `--spacing-touch`, `--radius-pill`, `--spacing-floating`, fontes e `@font-face`.

Para iniciar um projeto: copie o repo (ou "Use this template"), troque o nome no `package.json` e mantenha `AGENTS.md`, `src/styles/tokens.css` e `src/components/`.
Agentes: leiam `AGENTS.md` primeiro.

Mobile nativo (opcional, depois): empacotar com Capacitor sem refazer a UI.
