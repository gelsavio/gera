# Inventário do teclado — Etapa 8C — v3.15.23

Data: 4 de agosto de 2026.

## Escopo extraído

O arquivo `js/ui/keyboard.js` passou a centralizar a interface do teclado musical principal `#keyboard`:

- renderização das linhas `#sharp-row` e `#natural-row`;
- criação visual de teclas naturais e sustenidas;
- notas, oitavas, dicas das teclas físicas e marcadores de intensidade;
- eventos de ponteiro para mouse e caneta;
- fallback de toque para tablets;
- limite de quatro contatos simultâneos;
- glissando durante o deslocamento;
- liberação por `pointerup`, cancelamento, perda de captura e perda de foco;
- eventos `keydown` e `keyup` do teclado físico.

## Fronteira preservada

O módulo recebe por injeção `noteDown`, `noteUp`, `releaseAll`, `velocityFromEvent`, `normalizedNoteName`, `setStatus` e o estado de glissando. Permanecem no núcleo o WEB AUDIO API, as vozes, envelopes, instrumentos, oitava, sustain, liberação, intensidade, divisão do teclado, gravação de sequência e persistência.

Os controles `instrument`, `oct-down`, `oct-up`, `sustain-pressed`, `sustain-hold`, `sustain-next`, `split-toggle`, `split-instrument`, `velocity-toggle` e `gliss-toggle` não foram extraídos, pois pertencem ao painel geral de configurações. O teclado `#sequence-record-keyboard` não foi alterado, pois pertence ao sequenciador.

## Elementos e comportamentos não alterados

O HTML estrutural do teclado, seus IDs, classes, posição na aba, estilos e extensão musical permanecem idênticos à versão 3.15.22. Acordes, círculo harmônico, bateria, sequenciador, músicas, biblioteca, configurações e modais não foram modularizados nesta etapa.

## Invariantes estáticas

- `setInterval`: 2 ocorrências;
- `setTimeout`: 42 ocorrências;
- `addEventListener`: 59 ocorrências;
- `requestAnimationFrame`: 2 ocorrências;
- nenhum acesso novo ao `localStorage`;
- nenhuma regra nova de áudio, transporte ou persistência;
- nenhum operador `??` introduzido.
