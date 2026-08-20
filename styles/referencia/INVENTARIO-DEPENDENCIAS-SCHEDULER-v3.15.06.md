# Inventário de dependências do scheduler — GERA v3.15.06

Data: 4 de agosto de 2026

## Contrato extraído

| Componente | Lê | Modifica ou produz | Dependências diretas |
|---|---|---|---|
| `GeraTransportScheduler.createScheduler(options)` | objeto de adaptadores | função fechada `scheduler` | somente ambiente JAVASCRIPT clássico |
| `scheduler()` | `isRunning`, `isBlocked`, `getNextTime`, `currentTime`, `getStep` | pulsos `onPulse(step, when)`, `setNextTime`, `setStep`, `setTimer` | callbacks injetados e `setTimeout` |
| `transportScheduler()` legado | nenhuma lógica própria | encaminha para `runTransportScheduler()` | `GeraTransportScheduler` |
| `handleTransportSchedulerPulse(step, when)` | estados legados de BPM, bateria, ações e fronteiras | decisões e agendamentos já existentes | núcleo inline, sem importação pelo novo arquivo |

## Adaptadores do núcleo legado

| Adaptador | Origem do valor ou efeito | Modificador real |
|---|---|---|
| `isRunning()` | `transportRunning` | `ensureMasterTransport` e `stopMasterTransport` permanecem no legado |
| `isBlocked()` | `accompanimentStopEventScheduled` | fluxo legado de parada conjunta |
| `ensureAudio()` | `js/audio/core.js` | criação/retomada somente quando o scheduler é efetivamente chamado |
| `currentTime()` | `audioCtx.currentTime` | somente o `AudioContext` |
| `getStep()` / `setStep()` | `transportStep` | scheduler extraído, com valor inicial e reset ainda no legado |
| `getNextTime()` / `setNextTime()` | `transportNextTime` | scheduler extraído; início e reset ainda no legado |
| `setTimer()` | `transportTimer` | scheduler extraído; limpeza ainda em `stopMasterTransport` e `ensureMasterTransport` |
| `onPulse()` | `handleTransportSchedulerPulse` | consumidor legado de cada pulso |

## Ordem efetiva de uma inspeção

1. `scheduler()` verifica `transportRunning`.
2. Verifica `accompanimentStopEventScheduled`.
3. Chama `ensureAudio()`.
4. Enquanto `transportNextTime < audioCtx.currentTime + 0.12`, captura `transportStep` e `transportNextTime`.
5. Encaminha `step` e `when` a `handleTransportSchedulerPulse`.
6. Se o consumidor devolver `null`, encerra sem avançar e sem rearmar.
7. Caso contrário, soma `stepDuration` a `transportNextTime` e avança `transportStep` módulo `meterSteps`.
8. Fora da janela, agenda a próxima inspeção com `setTimeout(scheduler, 25)` e grava a referência em `transportTimer`.

## Estados preservados fora do módulo

`transportRunning`, `transportStep`, `transportNextTime`, `transportTimer`, `transportEvents`, `transportBar`, `accompanimentStopEventScheduled`, `transportTempoBpm`, `pendingBpm`, todos os estados de bateria, todos os estados de sequência e todos os estados visuais continuam declarados e administrados nos mesmos locais da versão 3.15.05.

## Ausência de dependência circular

`js/transport/scheduler.js` não importa nem referencia bateria, sequência, fronteiras, BPM, DOM, painel ou áudio do aplicativo. Essas dependências são fornecidas somente por callbacks do núcleo. O fluxo é unidirecional: núcleo legado cria os adaptadores, scheduler emite o pulso e o núcleo legado o consome. Consumidores não importam o scheduler nem o novo arquivo chama `ensureMasterTransport` ou `stopMasterTransport`.

## Identificadores globais preservados

Permanecem disponíveis `transportScheduler`, `transportTimer`, `transportStep`, `transportNextTime`, `ensureMasterTransport`, `stopMasterTransport` e os identificadores legados não ativos `drumTimer`, `drumNextTime` e `sequenceTimer`. Foi acrescentado apenas `GeraTransportScheduler` como API do novo arquivo.
