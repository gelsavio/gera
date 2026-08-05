# Inventário de dependências — painel compacto e contadores v3.15.13

`js/ui/transport-status.js` expõe `GeraTransportStatus.createConsumer(options)`. O consumidor recebe `getElement`, `getSnapshot`, `syncListControls` e `renderCarousel` por injeção. Não importa os módulos de transporte e não lê variáveis globais do aplicativo.

| Operação | Entradas do retrato | Efeitos preservados |
| --- | --- | --- |
| `syncCompactControls()` | capotraste, oitava, loop, bateria, sequência, música, seção e BPM | textos, classes e `aria-pressed` dos controles compactos |
| `updateReadouts()` | música, BPM, modos de execução, volumes e status | readouts e estados dos botões do redesenho |
| `syncCompactSequenceCountdown()` | seção, fila, execução, índice, duração restante e repetição | visibilidade, rótulo e valor `MM:SS` do contador |
| cálculos de unidades | itens, frações, repetição e duração do compasso | 8, 6, 4, 2 e 1 unidades para compasso, ¾, ½, ¼ e ⅛ |

O adaptador no núcleo entrega também `queuedSequenceSection` e `sequencePendingTransition`, preservando a distinção entre seção atual, próxima seção e transição pendente sem transferir essas fontes de estado para a interface.

Permaneceram no núcleo a criação e a estrutura do painel, o carrossel, a linha do tempo de cartões, os comandos dos botões, os eventos, o intervalo de 250 ms, os estilos e todas as decisões musicais. O módulo não usa `createElement`, `innerHTML`, `replaceChildren`, `addEventListener`, `setTimeout`, `setInterval` ou `requestAnimationFrame`.

Ordem de carregamento: módulos de transporte, `coordinator.js`, `transport-status.js` e `audio/core.js`. Não há dependência circular.
