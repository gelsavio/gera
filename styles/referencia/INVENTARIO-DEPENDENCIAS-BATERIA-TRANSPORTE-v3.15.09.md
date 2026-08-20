# Inventário de dependências — Etapa 6F

## Escopo extraído

`js/transport/drum-sync.js` expõe `GeraTransportDrumSync.createConsumer(options)`. O consumidor não importa outros arquivos e não inicia temporizadores. Ele recebe `step` e `when` do núcleo, por meio de `handleTransportSchedulerPulse`, e devolve `meterSteps` para que o scheduler preserve seu avanço modular.

## Contrato de entrada

`activateAtBoundary(step)` efetiva `drumStartQueued` somente no passo zero, altera `drumRunning`, zera `drumStep` e chama o adaptador visual legado.

`consumePulse(step, when)` lê o estado de execução, a fila de entrada, a ação enfileirada e ativa, a janela `drumActionMuteFrom`/`drumActionMuteUntil` e o bloqueio `drumStopAtAlignedSequenceStart`. Quando autorizado, chama `scheduleDrumStep(step, when, mode)` sem modificar o passo ou o instante. Ao último passo, marca `drumCompletedAction` e encerra `drumActiveAction`.

`completeAtBoundary(step)` consome `drumCompletedAction` somente no passo zero. A virada apenas atualiza o estado; o encerramento chama `stopDrums()` e informa ao consumidor legado que a fronteira deve retornar imediatamente, como antes.

## Dependências injetadas pelo núcleo

| Grupo | Adaptadores |
|---|---|
| Entrada e execução | `isStartQueued`, `setStartQueued`, `isRunning`, `setRunning`, `resetStep`, `onStarted` |
| Ações | `getQueuedAction`, `setQueuedAction`, `getActiveAction`, `setActiveAction`, `getCompletedAction`, `setCompletedAction`, `syncActionButtons` |
| Sobreposição | `getActionMuteFrom`, `getActionMuteUntil`, `shouldStopAtAlignedSequenceStart` |
| Agendamento | `scheduleStep`, `getMeterSteps` |
| Conclusão | `stopDrums`, `setStatus` |

## Dependências preservadas no núcleo legado

`DRUM_PATTERNS`, `DRUM_VARIATIONS_B`, `DRUM_ACTION_PATTERNS`, biblioteca incorporada por música, `drumPatternEvent`, `scheduleDrumStep`, `playDrum`, `playSampleDrum`, `playSynthDrum`, `chokeOpenHat`, `drumHumanizeTime`, `drumVelocityAccent`, `drumLayers`, `drumBus`, volumes, carregamento de samples, pads manuais, editor de ritmos e sobreposições da sequência não foram movidos.

`startDrums`, `stopDrums`, `requestDrumAction`, `applySectionDrumConfig`, `scheduleSequenceDrumOverlay`, `scheduleSequenceEndDrumAction`, listeners do DOM e funções da sequência continuam no `index.html`.

## Ordem das chamadas

No início, o comando legado chama `startDrums`, que mantém `drumRunning = false`, define `drumStartQueued = true` e inicia o transporte mestre. O scheduler chama `handleTransportSchedulerPulse(step, when)`, que aplica o BPM pendente e as regras legadas anteriores ao consumidor. Depois, `drumTransportConsumer.consumePulse(step, when)` encaminha o mesmo pulso a `scheduleDrumStep`. O emissor de fronteiras agenda `handleTransportBoundary` para o instante real de áudio. No passo zero, `activateAtBoundary` torna a bateria ativa. A conclusão de virada ou encerramento é consumida por `completeAtBoundary` no mesmo ponto em que ocorria na versão 3.15.08.

## Ausência de dependência circular

O novo módulo não importa scheduler, fronteiras, BPM, bateria sonora, sequência ou interface. Todas as referências externas entram por callbacks. A direção efetiva é `scheduler → núcleo legado → drum-sync → callbacks do núcleo`. Não existe retorno por importação nem criação de outro relógio ou timer.

## Arquivos funcionais alterados

`index.html`, `manifest.json` e `sw.js` foram alterados somente para carregar o novo módulo, conectar os adaptadores e atualizar versão/cache. `js/transport/drum-sync.js` é o único novo arquivo funcional carregado pelo navegador.
