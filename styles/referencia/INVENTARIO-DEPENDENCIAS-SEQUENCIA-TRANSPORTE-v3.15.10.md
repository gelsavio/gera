# Inventário de dependências — Etapa 6G

## Escopo extraído

`js/transport/chord-sequence-sync.js` expõe `GeraTransportChordSequenceSync.createConsumer(options)`. O consumidor não importa outros arquivos, não cria relógio nem temporizador e não conhece o DOM. Ele recebe `step` e `boundaryAudioTime` do núcleo por meio de `handleTransportBoundary`.

O método `advanceBoundary(step, boundaryAudioTime)` preserva a integração antes contida em `advanceSequenceBoundary`. O método `consumeBoundary(step, boundaryAudioTime)` preserva exclusivamente a decisão temporal entre iniciar um item, executar o segmento correspondente, manter uma continuação no compasso seguinte ou devolver o pulso ao acompanhamento legado.

## Contrato de estado

| Estado legado | Leitura | Escrita |
|---|---|---|
| `sequencePlaying` | `isPlaying` | permanece sob comandos legados e `loadSequenceItem` |
| `sequenceStartQueued` | `isStartQueued` | `setStartQueued` |
| `sequenceIndex` | `getIndex` | `setIndex` e `loadSequenceItem` |
| `sequenceEighthUnitsRemaining` | `getUnitsRemaining` | `setUnitsRemaining` e `loadSequenceItem` |
| `sequenceContinuousItem` | `isContinuousItem` | `setContinuousItem` |
| acorde ativo | `hasLatchedChord` | permanece no núcleo |

## Dependências injetadas pelo núcleo

| Grupo | Adaptadores |
|---|---|
| Execução e fila | `isPlaying`, `isStartQueued`, `setStartQueued`, `onStarted` |
| Posição | `getIndex`, `setIndex`, `getUnitsRemaining`, `setUnitsRemaining` |
| Continuidade | `isContinuousItem`, `setContinuousItem` |
| Item | `loadItem`, `getCurrentItem`, `isPause`, `isNote` |
| Relógio já calculado | `getBarDuration`, `getMeterSteps`, `getBoundaryUnits` |
| Acompanhamento | `hasLatchedChord`, `getRhythmPattern`, `clearSchedule`, `playContinuous`, `executeSegment` |

## Ordem completa das chamadas

O comando legado `playChordSequence()` valida a seção, mantém `sequencePlaying = true`, define `sequenceStartQueued = true` e chama `ensureMasterTransport()`. O scheduler mestre emite `step` e `when`; o emissor de fronteiras converte o instante antecipado em callback no momento sonoro e chama `handleTransportBoundary(step, boundaryAudioTime)`. Após as decisões legadas de início do compasso e bateria, o núcleo chama `sequenceTransportConsumer.consumeBoundary(step, boundaryAudioTime)`.

Se a sequência aguarda entrada e o passo não é zero, nada é carregado. No passo zero, `advanceBoundary` limpa a fila, restaura índice e unidades e chama `loadSequenceItem(0, boundaryAudioTime)`. Durante a execução, cada fronteira válida reduz uma unidade. Quando o restante chega a zero, `loadSequenceItem(sequenceIndex + 1, boundaryAudioTime)` recebe o mesmo instante da versão 3.15.09.

Depois do carregamento, o consumidor não toca áudio diretamente. Ele chama `clearAccompanimentSchedule` e um dos adaptadores `playContinuous` ou `executeSegment`. Esses adaptadores mantêm `playRhythmHit`, `executeBarSegment`, `setLatchedChord`, `createVoice`, baixo, sustain, liberação e envelopes no núcleo.

## Durações preservadas

`loadSequenceItem` continua definindo `sequenceEighthUnitsRemaining` por `Math.max(1, Math.round(Number(item.fraction) * transportBoundaryUnits()))`. Em 4/4, os valores permanecem 8 unidades para um compasso, 6 para ¾, 4 para ½, 2 para ¼ e 1 para ⅛. Nenhuma fração, arredondamento ou cálculo musical foi alterado.

Itens que atravessam a fronteira de compasso continuam executando uma continuação limitada por `sequenceEighthUnitsRemaining * boundaryDuration`. Um item de um compasso iniciado no meio do compasso anterior, com ritmo inteiro, continua sendo marcado como `sequenceContinuousItem` e não sofre novo ataque no passo zero seguinte.

## Dependências preservadas no núcleo legado

`normalizeSequenceItem`, `loadSequenceItem`, `stopChordSequence`, `playChordSequence`, `prepareSectionDrumTransition`, `scheduleSequenceDrumOverlay`, `scheduleSequenceEndDrumAction`, `setLatchedChord`, `executeBarSegment`, `playRhythmHit`, `createVoice`, `sequenceBassRoot`, voicings, instrumento da seção, oitava, inversão, baixo automático, sustain e liberação permanecem no `index.html`.

`activeSequenceSection`, `queuedSequenceSection`, `sequencePendingTransition`, `sequenceHoldLoop`, `sequenceAuto`, `sequenceAutoEnd`, `currentSectionRepetition`, seleção manual e todas as regras entre estrofe, pré-refrão, refrão e demais partes não foram extraídas. A bateria continua sob `drum-sync.js`; a coordenação entre os dois consumidores não foi centralizada nesta subetapa.

## Ausência de dependência circular

O módulo não importa scheduler, fronteiras, BPM, bateria, áudio, sequência interna, transições ou interface. A direção efetiva é `scheduler → boundaries → núcleo legado → chord-sequence-sync → callbacks do núcleo`. Os callbacks não importam o módulo; são referências fornecidas na criação do consumidor. Não existe segundo relógio, timer concorrente ou fonte duplicada de estado.

## Arquivos funcionais alterados

`index.html`, `manifest.json` e `sw.js` foram alterados somente para carregar e conectar o novo consumidor e atualizar versão/cache. `js/transport/chord-sequence-sync.js` é o único novo arquivo funcional carregado pelo navegador. Nenhum arquivo de bateria, áudio, teoria musical, estado, estilo, ícone, manual ou página offline foi modificado.
