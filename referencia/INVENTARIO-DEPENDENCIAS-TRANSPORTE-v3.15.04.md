# Inventário de dependências do transporte — GERA v3.15.04

Data: 4 de agosto de 2026

## Camadas atuais

| Área lógica | Fornece | Depende diretamente de |
|---|---|---|
| `js/state.js` | `bpm`, `transportTempoBpm`, `pendingBpm` e acessos globais legados | `window` |
| `js/audio/core.js` | `ensureAudio`, `audioCtx`, barramentos globais | DOM de volumes, Web Audio API |
| núcleo inline — clock | `barDuration`, normalização de BPM, medidor | estado de BPM, ritmo de acorde, padrão/dados de bateria |
| núcleo inline — transporte | `ensureMasterTransport`, `stopMasterTransport`, `transportScheduler` | AudioContext, bateria, fronteiras, sequência, UI, estado global |
| núcleo inline — fronteiras | `handleTransportBoundary` | sequência, acompanhamento, bateria, DOM, duração do compasso |
| núcleo inline — bateria | medidor, passos, início/parada, ações | transporte, AudioContext, samples, padrões, sequência, UI |
| núcleo inline — sequência | fila, avanço, itens, troca, overlays | transporte, bateria, vozes, teoria musical, DOM, persistência, painel compacto |
| núcleo inline — painel compacto | comandos, carrossel e estado visual | sequência, bateria, músicas, transporte, DOM |
| quinto bloco inline — redesign | readouts, timeline e contador | 69 símbolos globais do núcleo, DOM, intervalo de 250 ms |

## Funções que formam o núcleo mínimo do ciclo

`ensureMasterTransport → transportScheduler → scheduleDrumStep` e `transportScheduler → handleTransportBoundary → advanceSequenceBoundary → loadSequenceItem → applySectionDrumConfig/startDrums → ensureMasterTransport`.

Outro ciclo é `handleTransportBoundary → executeBarSegment → scheduleInBar/createVoice`, enquanto comandos de acorde chamam `beginAccompaniment → ensureMasterTransport`.

## Contratos necessários antes de qualquer extração

| Contrato | Entradas mínimas | Saídas mínimas | Não deve importar |
|---|---|---|---|
| clock puro | BPM, quantidade de passos | duração do passo/compasso/fronteira | DOM, áudio, bateria, sequência |
| scheduler | relógio do AudioContext, snapshot do medidor, callbacks | pulso agendado e fronteira | implementações de bateria, sequência ou UI |
| coordenador | pedidos de consumidores e snapshot de atividade | iniciar/manter/parar transporte | DOM e áudio de instrumentos |
| consumidor bateria | passo, `when`, padrão/configuração | agendamento de bateria | scheduler concreto e sequência |
| consumidor sequência | fronteira e `when` | avanço/estado do item | scheduler concreto e painel |
| status de UI | snapshot/eventos | atualizações DOM | scheduler e motores de áudio |

## Estados legados que exigem decisão explícita, não remoção automática

`drumTimer`, `drumNextTime`, `sequenceTimer`, `sequencePendingTransition`, `sequencePendingEntryAction`, `accompanimentTimer`, `accompanimentHalfTimer` e `sequenceTextHoldTimer`. A busca estática da v3.15.04 não encontrou iniciadores ativos para esses identificadores, embora alguns sejam limpos ou lidos. Eles devem permanecer até uma etapa específica comprovar que nenhum código externo ou bloco tardio depende de sua presença global.

## Pontos de interface chamados pelo núcleo

`setStatus`, `syncDrumActionButtons`, `syncSequencePlayButton`, `syncSequenceDrumButton`, `syncInstrumentChangeLock`, `syncSequenceSectionButtons`, `syncSectionDrumControls`, `renderChordSequence`, `syncCompactControls`, `resetCompactSequenceCarousel`, `compactCarouselBeginPlaybackPass`, `compactCarouselEnsureUpcomingPass`, `compactHandleNaturalSongEnd` e atualizações diretas de IDs de bateria, BPM e ritmo.

Essas chamadas impedem que transporte, consumidores e interface sejam módulos independentes sem adaptadores ou eventos. A extração mais segura deve preservar inicialmente as funções globais e substituir dependências uma direção por vez.
