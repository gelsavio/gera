# Inventário de dependências — relógio musical — v3.15.05

## Arquivo extraído

`js/transport/clock.js` é um script clássico autossuficiente. Não importa outros arquivos, não lê estado global, não acessa DOM, não cria eventos, não usa áudio e não inicia temporizadores. Ele é carregado depois de `js/state.js` e antes de `js/audio/core.js` e do núcleo inline.

| Função | Entrada | Saída e unidade | Regra preservada | Consumidor atual |
| --- | --- | --- | --- | --- |
| `normalizedBpm(value)` | valor numérico ou conversível | BPM inteiro | `Math.round(Number(value))`; padrão 100; mínimo 40; máximo 220 | código legado por identificador global |
| `beatDurationMilliseconds(bpmValue)` | BPM | milissegundos | `60000 / bpmValue` | `barDurationMilliseconds` e testes |
| `bpmFromBeatDurationMilliseconds(milliseconds)` | duração da batida em ms | BPM | `60000 / milliseconds` | testes; não conectado ao transporte |
| `stepDurationSeconds(bpmValue)` | BPM efetivo | segundos | `15 / bpmValue` | `transportScheduler()` |
| `barDurationMilliseconds(bpmValue, beats)` | BPM e tempos do compasso | milissegundos | `(60000 / bpmValue) × beats` | adaptador legado `barDuration()` |
| `stepsToSeconds(stepCount, bpmValue)` | passos e BPM | segundos | `stepCount × (15 / bpmValue)` | testes; não conectado ao transporte |
| `secondsToSteps(seconds, bpmValue)` | segundos e BPM | passos | `seconds / (15 / bpmValue)` | testes; não conectado ao transporte |
| `nextBoundaryOffsetSeconds(currentStep, meterSteps, bpmValue)` | passo atual, passos do compasso e BPM | segundos | `((meterSteps - currentStep) % meterSteps) × (15 / bpmValue)` | testes; não conectado ao scheduler |
| `nextBoundaryTimeSeconds(currentTime, currentStep, meterSteps, bpmValue)` | instante absoluto e dados anteriores | segundos absolutos | instante atual mais o deslocamento da fronteira | testes; não conectado ao scheduler |

## Adaptadores e leitores preservados

`normalizedBpm` continua exposta diretamente no escopo global com o mesmo nome esperado pelas funções de BPM, metrônomo, importação de configurações e interface.

`barDuration()` permanece no `index.html`. Ele continua decidindo entre três tempos, quatro tempos ou a quantidade de tempos do ritmo de violão por meio de `isThreeQuarterPattern()`, `isGuitarRhythm()` e `guitarPatternSteps()`. Depois dessa seleção, chama `GeraTransportClock.barDurationMilliseconds()`.

`transportScheduler()` permanece no `index.html`, conserva o lookahead de 120 ms, o polling de 25 ms e todos os estados. Apenas substitui a expressão literal `15 / transportTempoBpm` por `GeraTransportClock.stepDurationSeconds(transportTempoBpm)`.

## Ordem de carregamento

1. `js/chords.js`
2. `js/state.js`
3. `js/transport/clock.js`
4. `js/audio/core.js`
5. núcleo inline legado

O novo arquivo não depende dos anteriores. O núcleo depende de `normalizedBpm` e `GeraTransportClock`. Não existe dependência de retorno de `clock.js` para o núcleo, estado, áudio, bateria, sequência ou interface; portanto, não foi introduzido ciclo de dependências.

## Elementos expressamente não extraídos

Permaneceram no núcleo `transportScheduler`, `ensureMasterTransport`, `stopMasterTransport`, `activeTransportSteps`, `transportBoundaryStride`, `transportBoundaryUnits`, `handleTransportBoundary`, todos os timers e callbacks, alterações de BPM, metrônomo, bateria, sequência, transições, painel compacto e contadores.

