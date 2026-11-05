# Lições de revisão (Paper "Kind wave" — Antes e depois)

Origem: revisão do cabeçalho do artista Ambré, 10 mudanças + 2 avisos. Cada linha vira regra no `AGENTS.md`.

| # | Problema (Antes) | Correção (Depois) | Onde está no código |
|---|---|---|---|
| 1 | 5 níveis de espaço (19/17/26/30), salto entre grupos só 1,15x | 2 blocos, ~13/16 dentro e 34 entre (≈2,1x) | `ArtistHeader`, tokens `inner-sm/inner/group` |
| 2 | Nome 26px, "Artist" misturado | Nome 56px, rótulo pequeno acima | `text-display` |
| 3 | Ações centralizadas/sem fundo | Ações à esquerda, Shuffle/Mais com fundo | `BaseButton secondary` |
| 4 | 1 lançamento em grade de 4 colunas | Card horizontal | `AlbumCard layout="horizontal"` |
| 5 | Player e botão de IA cobriam "Queued" | Área reservada no fim da rolagem | `FloatingSafeArea`, `--spacing-floating` |
| 6 | Roxo em plays, gráfico, selos | Roxo só no Play principal | regra do `accent` |
| 7 | "1 release / 15 tracks" repetia as abas | Removido | `ArtistHeader` sem contadores |
| 8 | Mesma capa repetida 5x no Top 5 | Lista numerada | `TrackRow` |
| 9 | Mini player na sidebar + player na barra | Um player só | `PlayerBar` |
| 10 | Breadcrumb + botão voltar | Uma navegação | AGENTS.md regra 4 |
| A | Durações ilustrativas no mock | Vêm dos dados | `TrackRow` (`duration` prop) |
| B | Capas quebradas | Placeholder escuro | `CoverArt` |
