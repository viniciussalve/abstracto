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

Para iniciar um projeto: copie o repo (ou "Use this template"), troque o nome no `package.json` e mantenha `AGENTS.md`, `src/styles/tokens.css` e `src/components/`.
Agentes: leiam `AGENTS.md` primeiro.

Mobile nativo (opcional, depois): empacotar com Capacitor sem refazer a UI.
