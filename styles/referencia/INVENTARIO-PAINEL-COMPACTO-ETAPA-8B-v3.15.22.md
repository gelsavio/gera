# Inventário do painel compacto — Etapa 8B — v3.15.22

Data: 4 de agosto de 2026.

## Escopo extraído

O arquivo `js/ui/compact-panel.js` passou a centralizar a associação dos eventos dos 22 controles abaixo, sem recriar o DOM:

- abertura e fechamento: `compact-mode-toggle`, `compact-mode-close`;
- biblioteca e navegação: `compact-songs-open`, `compact-list-select`, `compact-prev-song`, `compact-next-song`;
- transporte: `compact-play`, `compact-sequence-only`, `compact-drum-only`, `compact-loop`;
- bateria: `compact-drum-fill`, `compact-drum-ending`;
- ajustes: `compact-capo-down`, `compact-capo-up`, `compact-octave-down`, `compact-octave-up`, `compact-circle-root`;
- opções da lista: `compact-transition-mode`, `compact-next-start-mode`, `compact-list-end-mode`;
- carrossel: `compact-carousel-prev`, `compact-carousel-next`.

## Fronteira preservada

O módulo encaminha ações por callbacks injetados. Permanecem no núcleo as decisões sobre `compactModeActive`, seleção e persistência das listas, início e parada musical, sincronização do transporte, viradas, encerramentos, capotraste, oitava, círculo harmônico, carrossel e mensagens de estado. O consumidor `js/ui/transport-status.js` continua responsável pelos textos, atributos e contadores do painel.

## Elementos não alterados

O HTML do painel, seus IDs, classes, textos, ordem, atributos ARIA e estilos permanecem idênticos à versão 3.15.21. Teclado, acordes, círculo harmônico principal, bateria, sequenciador, músicas, biblioteca, configurações e modais não foram modularizados nesta etapa.

## Invariantes estáticas

- `setInterval`: 2 ocorrências;
- `setTimeout`: 42 ocorrências;
- `addEventListener`: 59 ocorrências;
- `requestAnimationFrame`: 2 ocorrências;
- nenhum acesso novo ao `localStorage`;
- nenhuma regra nova de áudio, transporte ou persistência.
