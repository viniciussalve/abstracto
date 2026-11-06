# AGENTS.md — Design system (Vue 3 + Vite + TS + Tailwind v4)

O **código é a fonte da verdade** do design. Antes de criar qualquer UI:
1. Leia `src/styles/tokens.css` (tokens) e `src/components/` (componentes existentes).
2. Abra `/design-system` (`npm run dev`) e veja o que já existe.
3. Reuse. Só crie algo novo se nada existente servir.

## Regras duras
- **Nada hardcoded.** Sem `#hex`, `rgb()`, `px` solto, `font-size` solto em componentes ou telas. Use classes de token (`bg-surface`, `text-fg-muted`, `gap-group`, `rounded-card`, `text-display`...). Falta um valor? Crie o token em `tokens.css` e adicione-o à página `/design-system`.
- **Dark e light.** Todo token de cor tem valor nos dois temas (`:root` e `[data-theme='light']`). Teste os dois na página `/design-system`.
- **Componente novo ou alterado => atualize `src/views/DesignSystem.vue`** no mesmo commit.
- **Mobile-first.** Um único código responsivo. Alvo de toque >= `min-h-touch` (44px). Teste ~360px de largura e desktop.
- **Acessibilidade.** Botão só com ícone exige `label`. Foco visível (já global). Contraste: texto sobre `bg`/`surface` usa `fg`/`fg-muted`; `fg-subtle` só para informação secundária não essencial.

## Regras de composição (aprendidas na revisão do Paper "Kind wave")
Cada regra vem de uma correção real. Veja `docs/LESSONS.md`.
1. **Espaçamento em poucos níveis.** Agrupe em blocos. Dentro do grupo: `inner-sm`/`inner`. Entre grupos: `group` (>= 2x o maior `inner`). Cabeçalho de perfil = 2 grupos (identidade | ações). Nunca 4–5 espaços diferentes empilhados.
2. **Hierarquia.** Título principal em `text-display`; rótulo de categoria pequeno acima (não na mesma linha de peso).
3. **Acento (amarelo #F5C518) só na ação principal.** `BaseButton variant="primary"` no máximo 1 por tela/seção. Não use `accent` em contadores, gráficos, selos ou links. Ações secundárias usam `secondary` (com fundo visível, nunca texto solto ao lado do primary).
4. **Sem informação repetida.** Contadores ficam nas abas, não também no cabeçalho. Um player só (nada de mini player duplicado). Uma navegação de retorno só (breadcrumb **ou** botão voltar).
5. **Sem a mesma arte repetida.** Lista de faixas = `TrackRow` numerado, não grade de capas iguais.
6. **Flutuantes nunca cobrem conteúdo.** Player, botão de IA, FAB: sempre renderize `<FloatingSafeArea />` no fim do conteúdo rolável. A área reservada (`--spacing-floating`, 9rem) comporta o player (76px) **mais** um botão flutuante de 44px acima dele; posicione o botão a `--spacing-floating − inner − touch` do rodapé.
   - **Elemento flutuante de infraestrutura** (ex.: Feedback Layer) usa o par invertido `bg-fg text-bg`, não `secondary` nem `primary`: `surface` sobre o fundo dá só 1,2–1,3:1 e o botão some. Sem acento, anel de 2px `bg` por fora para separar de qualquer fundo.
   - `mark` (amarelo) é só para marcar anotação (pino, realce, contador). Não é acento: nunca na ação principal. `success`/`danger` sempre com ícone e texto.
7. **Layout se adapta à quantidade de dados.** 1–2 itens => `AlbumCard layout="horizontal"`. Não deixe colunas vazias em grade.
8. **Estados obrigatórios** para todo componente com dados: carregando, vazio, erro, imagem faltando/quebrada (use `CoverArt`), texto longo (truncate), hover, focus, disabled.
9. **Dados reais.** Valores de exemplo (durações, contagens) nunca ficam fixos na implementação: vêm dos dados.

## Antes de dar uma tela por pronta (checklist)
- [ ] Só tokens e componentes do DS (grep por `#`, `px]` em `.vue`).
- [ ] No máximo 1 `primary`; o acento (`accent`) em nenhum outro lugar.
- [ ] Grupos de espaçamento claros; sem info duplicada.
- [ ] Elemento flutuante => `FloatingSafeArea`.
- [ ] Estados: vazio, erro, carregando, imagem quebrada, texto longo.
- [ ] Dark + light, 360px + desktop.
- [ ] `npm run build` passa.

## Tom e marca
Tom direto, curto, em português do Brasil na UI (a menos que o projeto diga o contrário). Sem exclamações gratuitas. Rótulos de botão: verbo curto ("Tocar", "Salvar"). Ajuste aqui quando houver identidade de marca definida.

## Comandos
`npm install` · `npm run dev` · `npm run build` (typecheck + build)

**Feedback Layer (ferramenta de dev, `devDependencies` com `file:`):** o repo `feedback-layer` precisa estar clonado como irmão (`../feedback-layer`) e com o build feito, senão `npm install` e `npm run build` quebram: `cd ../feedback-layer && npm install && npm run build`. Ligado em `npm run dev` ou com `VITE_FEEDBACK=1` no build; sem a flag, o bundle de produção não carrega o pacote. Bridge: `npx feedback-bridge --port 7777 --inbox ./inbox` (em `../feedback-layer/packages/bridge`).
