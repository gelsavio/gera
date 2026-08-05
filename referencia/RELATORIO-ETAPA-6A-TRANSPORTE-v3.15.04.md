# GERA v3.15.04 — Etapa 6A — Inventário operacional do transporte

Data da auditoria: 4 de agosto de 2026  
Base examinada: `GERA-PWA-v3.15.04-audio-contexto-barramentos`  
Natureza da etapa: diagnóstico estático, sem extração ou alteração funcional

## 1. Resultado de integridade

Nenhum arquivo carregado pelo navegador foi modificado. `index.html`, `styles/inline-style-01.css`, `js/chords.js`, `js/state.js`, `js/audio/core.js`, `manifest.json`, `sw.js`, `offline.html`, `manual-gera.html` e os ícones permanecem idênticos à v3.15.04. Não houve mudança da versão do aplicativo, do cache `gera-pwa-v3.15.04` ou de `PRECACHE_URLS`, pois os arquivos acrescentados nesta auditoria ficam somente em `referencia/` e `tests/` e não são carregados pelo navegador.

O `activate` do SERVICE WORKER continua removendo qualquer cache cujo nome seja diferente de `gera-pwa-v3.15.04`. A remoção de caches antigos foi confirmada por inspeção e teste estático, não por instalação real em navegador.

## 2. Resumo executivo do transporte real

O GERA possui um transporte mestre único para bateria, sequência e acompanhamento contínuo. Ele é dirigido por `transportScheduler()`, que acorda a cada 25 ms e agenda até 120 ms adiante na linha temporal do `AudioContext`. O passo musical é uma semicolcheia: `15 / transportTempoBpm` segundos, equivalente a um quarto de uma batida de semínima. O transporte percorre 16 passos em 4/4 ou 12 passos em 3/4.

O áudio da bateria é entregue antecipadamente diretamente à linha temporal do `AudioContext`. As fronteiras lógicas são convertidas em `setTimeout` para executar `handleTransportBoundary()` aproximadamente no instante de áudio correspondente. A sequência não possui scheduler próprio ativo: ela avança como consumidora dessas fronteiras. Os identificadores `sequenceTimer`, `drumTimer` e `drumNextTime` permanecem no estado legado, mas não iniciam nenhum ciclo nesta versão.

O metrônomo é independente: usa `setTimeout` recursivo com `60000 / normalizedBpm(bpm)` e quatro pulsos. Ele não consome `transportStep`, `transportNextTime` ou `transportTempoBpm`.

## 3. Unidades, fórmulas e fronteiras

| Elemento | Unidade e fórmula efetiva |
|---|---|
| Linha temporal principal | segundos de `AudioContext.currentTime` |
| `transportNextTime` | segundos do `AudioContext`; instante absoluto do próximo passo a agendar |
| Janela de lookahead | `0.12` segundo |
| Frequência de inspeção | `setTimeout(transportScheduler, 25)`, em milissegundos |
| Duração do passo | `stepDur = 15 / transportTempoBpm` segundos |
| Passos 4/4 | 16 |
| Passos 3/4 | 12 |
| Fronteira lógica 4/4 | a cada 2 passos; 8 unidades por compasso |
| Fronteira lógica 3/4 | a cada 1 passo; 12 unidades por compasso |
| Duração de compasso para acordes | `barDuration()` em milissegundos: `60000 / bpm × 4`, `× 3` em padrão 3/4 ou `× beats` em ritmo de violão |
| Linha textual | milissegundos monotônicos de `performance.now()` |
| Atualização de texto | `setInterval(..., 100)` |
| Atualização de painel/redesign | `setInterval(..., 250)` |

O início inicial é fixado em `audioCtx.currentTime + 0.08`. Não existe uma função isolada denominada “próximo compasso”. A fronteira é representada pela próxima ocorrência de `transportStep === 0` dentro do ciclo modular. Se `transportStep` é o próximo passo ainda não agendado e `N = activeTransportSteps()`, a distância matemática até o próximo passo zero é `((N - transportStep) % N) × (15 / transportTempoBpm)`; quando o resultado modular é zero, o próximo item a agendar já é a fronteira. Na prática, `transportNextTime` já contém o instante absoluto desse próximo passo e é incrementado a cada iteração.

O valor de `activeTransportSteps()` vem primeiro de `activePlaybackDrumData().main.steps`, se for 12 ou 16; caso contrário, vem de `drumPatternMeterSteps(drumPattern)`. Portanto, o medidor do transporte depende da configuração da bateria mesmo quando a sequência é a consumidora de interesse.

## 4. BPM selecionado, efetivo e pendente

Os três valores estão centralizados em `js/state.js` e expostos por propriedades globais legadas.

| Estado | Significado | Leitores principais | Modificadores principais |
|---|---|---|---|
| `bpm` | valor selecionado e exibido; usado também por `barDuration()`, ritmos, notas, contagens e metrônomo | `barDuration`, `executeBarSegment`, `reggaePocketSeconds`, `sequenceItemDurationMs`, `buildSequenceTextTimeline`, `formatSequenceCountdown`, status e persistência | `requestBpmChange` quando parado, `applyPendingBpmAtBoundary`, importação/aplicação de ajustes antes de chamar `requestBpmChange` |
| `transportTempoBpm` | andamento efetivo usado exclusivamente para calcular o passo do scheduler | `transportScheduler` | `ensureMasterTransport`, `requestBpmChange` quando parado, `applyPendingBpmAtBoundary`, captura antecipada de `pendingBpm` no scheduler |
| `pendingBpm` | alteração aguardando `step === 0` | `updateBpmDisplay`, `transportScheduler`, `stopMasterTransport` | `requestBpmChange`, `ensureMasterTransport`, `transportScheduler`, `applyPendingBpmAtBoundary` |

Fluxo durante transporte ativo: `requestBpmChange()` normaliza e guarda o pedido em `pendingBpm`, mantendo `bpm` inalterado. Quando o scheduler encontra um passo zero dentro da janela de 120 ms, ele copia o pedido, limpa `pendingBpm` e altera imediatamente `transportTempoBpm`, de modo que o incremento desse passo já usa o novo andamento. Em paralelo, cria um `setTimeout` para o instante `when`; só nesse callback `applyPendingBpmAtBoundary()` atualiza `bpm`, o campo e o status. Se o transporte for encerrado antes, `stopMasterTransport()` aplica o pendente imediatamente por meio da mesma função.

Há, portanto, duas bases temporais coexistentes por desenho legado: o scheduler usa `transportTempoBpm`, enquanto `barDuration()` e vários cálculos de acordes e interface usam `bpm`. Esta auditoria apenas registra essa relação e não a corrige.

## 5. Estados do relógio e scheduler

| Estado | Inicial | Leitura | Modificação |
|---|---:|---|---|
| `transportRunning` | `false` | `transportScheduler`, `requestBpmChange`, `ensureMasterTransport` | `ensureMasterTransport=true`; `stopMasterTransport=false` |
| `transportStep` | `0` | `transportScheduler` | zerado ao iniciar/parar; incrementado módulo `meterSteps` no scheduler |
| `transportNextTime` | `0` | condição do `while` e instante `when` | `currentTime + .08` ao iniciar; soma `stepDur`; zera ao parar |
| `transportTimer` | `null` | apenas para cancelamento | recebe `setTimeout(...,25)`; limpo ao iniciar novamente e ao parar |
| `transportEvents` | `[]` | `clearTransportEvents` | recebe timers de BPM, parada e fronteiras; limpo ao iniciar/parar |
| `transportBar` | `0` | humanização da bateria | zerado ao iniciar/parar; incrementado em `handleTransportBoundary` no passo zero |
| `accompanimentStopQueued` | `false` | `transportNeeded`, scheduler e interface | `requestAccompanimentStop`, `finishAccompanimentsAtBarEnd`, `stopEverything` |
| `accompanimentStopEventScheduled` | `false` | trava o scheduler | marcado no scheduler; limpo no cancelamento, finalização e parada mestre |

`ensureMasterTransport()` é o único iniciador do timer mestre. Ele chama `ensureAudio()`, evita duplicação se `transportRunning` já for verdadeiro, zera passo e compasso, copia `bpm` para `transportTempoBpm`, elimina BPM pendente, define a latência inicial de 80 ms, cancela timer e callbacks antigos e chama imediatamente `transportScheduler()`.

`transportScheduler()` é o único que rearma `transportTimer`. `stopMasterTransport()` é o encerrador direto; `maybeStopMasterTransport()` o chama somente se `transportNeeded()` for falso. Não existe “pausa” genérica do transporte: consumidores são desligados e o relógio é encerrado quando nenhum requisito permanece. A sequência também não possui uma operação interna de retomada; um novo comando de tocar reinicializa seus estados e aguarda nova fronteira.

## 6. Temporizadores e relógios completos

| Recurso | Quem inicia | Quem encerra | Finalidade |
|---|---|---|---|
| `transportTimer` | `transportScheduler` | `stopMasterTransport`; reinício defensivo em `ensureMasterTransport` | polling de 25 ms do scheduler mestre |
| entradas de `transportEvents` | `transportScheduler` | o próprio callback ao executar; `clearTransportEvents` apenas cancela a coleção | aplicar BPM, parar no compasso e entregar fronteiras no tempo de áudio |
| `metronomeTimer` | `scheduleMetronomePulse` | `stopMetronome`; cada pulso cancela o anterior antes de rearmar | metrônomo independente |
| `accompanimentEvents` | `scheduleInBar` | `clearAccompanimentSchedule` | ataques internos do padrão de acorde dentro do segmento |
| `accompanimentTimer` | ninguém nesta versão | `clearAccompanimentSchedule` | identificador legado preservado |
| `accompanimentHalfTimer` | ninguém nesta versão | `clearAccompanimentSchedule` | identificador legado preservado |
| `sequenceTimer` | ninguém nesta versão | `playChordSequence`, `stopChordSequence`, `finishAccompanimentsAtBarEnd` apenas limpam | identificador legado preservado |
| `drumTimer` e `drumNextTime` | ninguém nesta versão | ninguém | identificadores legados preservados |
| `sequenceTextCountdownTimer` | `startSequenceTextTimeline` | `clearSequenceTextTimers` | atualização textual a cada 100 ms |
| `sequenceTextHoldTimer` | ninguém nesta versão | `clearSequenceTextTimers` | identificador legado preservado |
| intervalo de redesign de 250 ms | inicialização do quinto bloco JAVASCRIPT | não há identificador nem cancelamento | biblioteca, timeline, contador compacto, readouts e botão de prévia |
| timers do editor de bateria | `testDrumEditorPattern` | `stopDrumEditorTest` | prévia isolada do editor, fora do transporte mestre |
| `requestAnimationFrame` | carrossel e timeline visual | execução única | rolagem visual, sem agendamento de áudio |

`Date.now()` não participa do transporte; é usado para gerar identificador de lista. `performance.now()` participa somente da linha textual. `requestAnimationFrame()` não dirige scheduler, bateria ou sequência.

## 7. Bateria: estados e fluxo

| Grupo | Estados | Leitores e modificadores dominantes |
|---|---|---|
| execução | `drumRunning`, `drumStartQueued`, `drumStep`, `drumPattern` | `startDrums`, `handleTransportBoundary`, `scheduleDrumStep`, `stopDrums`, `applySectionDrumConfig` |
| medidor | `drumPattern`, `sequenceDrums`, biblioteca de padrões | `isThreeQuarterPattern`, `activePlaybackDrumData`, `activeTransportSteps`, `transportBoundaryStride` |
| ações | `drumFillQueued`, `drumEndingQueued`, `drumQueuedAction`, `drumActiveAction`, `drumCompletedAction` | `requestDrumAction`, `transportScheduler`, `handleTransportBoundary`, transições e paradas |
| sobreposição | `drumActionMuteFrom`, `drumActionMuteUntil` | `scheduleSequenceDrumOverlay`, scheduler, término/parada |
| alinhamento compacto | `drumStopAtAlignedSequenceStart`, `drumPatternAtAlignedSequenceStart`, `compactSequenceStartKeepsDrumClock` | `compactPlaySequenceOnly`, `applySectionDrumConfig`, scheduler e fronteira |
| camadas | `drumLayers` | botões de camada, `scheduleDrumStep`, overlays |

Ordem do clique em padrão até o áudio: listener de `.drum-pattern` ou seletor → `startDrums(pattern)` → `ensureAudio()` → grava `drumPattern`, zera `drumStep`, marca `drumRunning=false` e `drumStartQueued=true` → `ensureMasterTransport()` → `transportScheduler()` → no passo zero, `startsDrums` permite `scheduleDrumStep(step, when)` antes de a fronteira visual ser entregue → `scheduleDrumStep()` consulta dados/camadas/humanização → `playDrum(track.id, eventTime, velocity)` → sample ou síntese agenda nós em `AudioContext` → `setTimeout` de fronteira → `handleTransportBoundary(0, when)` troca `drumStartQueued` por `drumRunning` e atualiza interface.

Se o transporte já existe, `ensureMasterTransport()` retorna sem criar timer; a bateria aguarda o próximo `step === 0`. Se tudo estava parado, o transporte começa em passo zero a `currentTime + 80 ms`, portanto o primeiro compasso é também a primeira fronteira.

`stopDrums()` é imediato para o estado e não cancela sons já entregues à linha do `AudioContext`. Em seguida chama `maybeStopMasterTransport()`. A parada global no fim do compasso é diferente: o scheduler, ao pré-agendar um passo zero, cria o callback `finishAccompanimentsAtBarEnd`, marca a trava e deixa de rearmar seu ciclo.

## 8. Sequência de acordes: estados e fluxo

| Grupo | Estados | Leitores e modificadores dominantes |
|---|---|---|
| execução | `sequencePlaying`, `sequenceStartQueued`, `sequenceIndex`, `sequenceEighthUnitsRemaining`, `sequenceContinuousItem` | `playChordSequence`, `advanceSequenceBoundary`, `loadSequenceItem`, `stopChordSequence`, parada global |
| seção | `activeSequenceSection`, `currentSectionRepetition`, `sequenceSections`, `sequenceRepeats`, `sequenceOrder` | seleção, carregamento, `loadSequenceItem`, automação e transições |
| troca | `queuedSequenceSection`, `sequenceStopAtEnd`, `sequenceHoldLoop`, `sequenceAuto`, `sequenceAutoEnd` | `selectSequenceSection`, `toggleStopSequenceAtEnd`, `loadSequenceItem`, controles compactos |
| ação final | `sequenceEndActionInProgress`, `sequenceConfiguredActionName` | preparação e agendamento de virada/encerramento, carregamento e paradas |
| apresentação | timeline textual e estados do carrossel compacto | `startSequenceTextTimeline`, `renderChordSequence`, funções compactas e polling visual |

Ordem do clique em “Tocar sequência” até o áudio: listener `#sequence-play` → `toggleSequencePlayback()` → `playChordSequence()` → valida seção → `applySectionDrumConfig(activeSequenceSection,true)` pode iniciar ou reconfigurar bateria → prepara carrossel → define `sequencePlaying=true`, `sequenceStartQueued=true`, índice `-1` e unidades `0` → `ensureMasterTransport()` → scheduler agenda a fronteira do passo zero → `handleTransportBoundary()` → `advanceSequenceBoundary()` aceita a fila somente em `step===0` → `loadSequenceItem(0,boundaryAudioTime)` atualiza seção, repetição, índice e duração em unidades → para acorde, `setLatchedChord()` → retorno a `handleTransportBoundary()` → `executeBarSegment()`/`playRhythmHit()` → `createVoice()` e seus nós de áudio.

Cada item recebe `sequenceEighthUnitsRemaining = round(fraction × transportBoundaryUnits())`, com mínimo 1. O nome histórico “EighthUnits” corresponde a 8 unidades em 4/4, mas a 12 unidades no caminho 3/4 atual. A cada fronteira aceita, `advanceSequenceBoundary()` decrementa uma unidade e chama `loadSequenceItem(index+1)` ao chegar a zero.

Não há timer próprio para a sequência: `sequenceTimer` é somente limpo. A progressão é inteiramente dirigida por `handleTransportBoundary()`.

## 9. Trocas entre sequências

Uma seleção manual durante execução chama `selectSequenceSection()`. Se a seção for diferente e não vazia, ela apenas escreve `queuedSequenceSection`; não toca no scheduler. `loadSequenceItem()` só consulta essa fila quando o índice ultrapassa o fim da seção atual. Antes da troca, respeita `sectionTargetPasses()`. Na efetivação, altera `activeSequenceSection`, zera `currentSectionRepetition` para 1, carrega a nova sequência e chama `applySectionDrumConfig(nextSection,true)`.

As rotas configuradas por seção usam `configuredNextSequence()`; Auto e Auto Fim usam `nextAutomaticSection()` ou `nextAutomaticSectionWithoutLoop()`. `prepareSectionDrumTransition()` é chamada ao carregar o último item e pode preparar saída, encerramento ou parada. Os overlays de bateria são agendados diretamente em segundos com base em `boundaryAudioTime` e `barDuration()`.

`sequencePendingTransition` e `sequencePendingEntryAction` aparecem como estados legados, mas o mecanismo efetivo de troca manual usa `queuedSequenceSection`, e o de ação usa `sequenceConfiguredActionName`/estados de bateria.

## 10. Início conjunto e coordenação

As condições compartilhadas são:

- `transportNeeded()` mantém o relógio se existir bateria ativa/em fila, sequência ativa/em fila, acorde contínuo/pendente, parada pendente, transição pendente ou ação de bateria ativa/em fila.
- `startDrums()` sempre coloca a bateria em `drumStartQueued`; a ativação lógica ocorre no passo zero.
- `playChordSequence()` sempre coloca a sequência em `sequenceStartQueued`; `advanceSequenceBoundary()` só libera no passo zero.
- ambos chamam `ensureMasterTransport()`, cuja guarda `transportRunning` impede um segundo timer mestre.
- se a sequência inicia normalmente, `applySectionDrumConfig(...,true)` pode enfileirar a bateria antes de enfileirar a sequência; ambas entram no mesmo passo zero.
- se a bateria já toca e a sequência é iniciada, a sequência aguarda o próximo passo zero do relógio existente.
- se a sequência toca e a bateria é iniciada, a bateria aguarda o próximo passo zero do mesmo relógio.
- no modo compacto “Só Música”, `compactSequenceStartKeepsDrumClock` preserva temporariamente o relógio da bateria; `applySectionDrumConfig()` pode marcar troca de padrão ou parada alinhada para o passo zero.

## 11. Condições de parada, pausa e retomada

`stopDrums()` desativa somente a bateria e tenta encerrar o transporte se nenhum consumidor restar. `stopChordSequence()` limpa sequência, texto, carrossel, acorde contínuo e transições; restaura modo do acorde e tenta encerrar o transporte. `stopAccompaniment()` limpa acorde contínuo e também tenta encerrar. `stopEverything()` chama todas essas funções, `stopMasterTransport()`, `stopMetronome()` e `releaseAll()`.

`requestAccompanimentStop()` agenda parada conjunta para o próximo passo zero. O scheduler cria apenas um callback, marca `accompanimentStopEventScheduled=true` e retorna sem rearmar. `finishAccompanimentsAtBarEnd()` limpa todos os consumidores e chama `stopMasterTransport()`.

“Pausa” na sequência, neste código, também designa item musical de silêncio e não um timer pausado. O item chama `clearChordLatchState()` e continua consumindo fronteiras. O controle de “pausa” usado na gravação adiciona um item com fração. Não há congelamento/retomada de `transportNextTime` nesta versão.

## 12. Painel compacto e contadores

`syncCompactControls()` lê `sequencePlaying || sequenceStartQueued`, `drumRunning || drumStartQueued`, `sequenceHoldLoop`, seção, BPM e música. É chamado diretamente por controles e sincronizadores e também indiretamente pelo intervalo global de 250 ms via `updateReadouts`/funções de renderização.

O contador compacto `syncCompactSequenceCountdown()` usa `sequenceRemainingUnits()`. A função soma `sequenceEighthUnitsRemaining`, as unidades dos itens seguintes e as repetições restantes; `formatSequenceCountdown(units)` converte por `ceil(units × barDuration() / 8000)`. Esse cálculo lê `bpm`, não `transportTempoBpm`.

A timeline do redesign recompõe uma assinatura com seção, quantidade de itens, repetição, unidades restantes, `sequenceIndex` e `currentSectionRepetition`. O intervalo anônimo de 250 ms chama `refreshLibraryIfNeeded`, `renderRedesignSequenceTimeline`, `syncCompactSequenceCountdown`, `updateReadouts` e `syncSequenceRecordPreviewButton`. Como o identificador do intervalo não é guardado, nenhuma função do aplicativo o pausa ou encerra durante a sessão da página; ele termina somente com a destruição do documento.

A linha textual é independente das fronteiras reais depois de iniciada: constrói uma previsão com snapshot de `bpm`, grava `sequenceTextTimelineStartedAt=performance.now()` e atualiza a cada 100 ms. Mudanças posteriores de BPM não reconstruem automaticamente a linha temporal neste fluxo.

## 13. Eventos de usuário relevantes

| Origem | Entrada | Cadeia inicial |
|---|---|---|
| `#bpm` | `change`, `blur`, Enter | `commitTypedBpm → requestBpmChange` |
| botões finos de BPM | `click` | ajuste do campo → `requestBpmChange` |
| redesign BPM | `click` | `changeBpm → requestBpmChange` |
| padrão de bateria/seletor | `click`/`change` | `startDrums` |
| `#drum-stop` | `click` | `stopDrums` |
| `#drum-fill`/`#drum-ending` | `click` | `requestDrumAction` |
| `#sequence-play` | `click` | `toggleSequencePlayback → playChordSequence/stopChordSequence` |
| botões de seção | `click` | `selectSequenceSection` |
| `#sequence-stop-drums` | `click` | `toggleSequenceDrums` |
| `#stop-accompaniments` | `click` | `requestAccompanimentStop` |
| compacto principal | `click` | `compactPlayStandard` |
| compacto só música | `click` | `compactPlaySequenceOnly` |
| compacto só bateria | `click` | `compactToggleDrums` |
| redesign tocar/loop | `click` | `startRedesignSongPlayback → click de #sequence-play` |
| redesign parar | `click` | `stopEverything` |
| troca de música/lista | `click` e timers de 80/180 ms | `prepareSongWorkspaceChange`, carregamento e possível `compactPlayStandard` |

## 14. Ordem consolidada de uma iteração do scheduler

1. Verifica `transportRunning` e a trava de parada.
2. Garante o `AudioContext`.
3. Enquanto `transportNextTime < currentTime + 0.12`, captura `step` e `when`.
4. No passo zero, captura eventual `pendingBpm`, altera `transportTempoBpm` e agenda a aplicação visual/selecionada para `when`.
5. Calcula `stepDur = 15 / transportTempoBpm`.
6. No passo zero, se houver parada conjunta, agenda `finishAccompanimentsAtBarEnd`, trava o ciclo e retorna.
7. No passo zero, efetiva eventual padrão de bateria alinhado.
8. Determina início de bateria, ação de fill/ending, mute por overlay e parada alinhada.
9. Agenda os eventos de bateria diretamente em `AudioContext`.
10. Marca conclusão de ação no último passo do medidor.
11. Nas fronteiras aceitas, cria `setTimeout` para `handleTransportBoundary(step, when)`.
12. Soma `stepDur` a `transportNextTime` e avança `transportStep` módulo `meterSteps`.
13. Ao sair da janela, rearma a si próprio para 25 ms.

## 15. Dependências e riscos de importação circular

O corte natural não acompanha as áreas visuais atuais. Os ciclos prováveis, caso as funções sejam movidas diretamente, são:

1. `scheduler → bateria` por `activeTransportSteps`, `transportBoundaryStride` e `scheduleDrumStep`; `bateria → scheduler` por `startDrums`, `stopDrums`, `requestDrumAction` chamarem `ensureMasterTransport`/`maybeStopMasterTransport`.
2. `scheduler → fronteiras` por `handleTransportBoundary`; `fronteiras → scheduler` por leitura de medidor, `barDuration`, estados do relógio e chamadas indiretas de parada.
3. `fronteiras → sequência` por `advanceSequenceBoundary`; `sequência → bateria` por `applySectionDrumConfig`, overlays e ações; `bateria → sequência` por botões/sincronizadores, flags alinhadas e condições de ação.
4. `sequência → transporte` por `playChordSequence`/`stopChordSequence`; `transporte → sequência` pelo avanço em cada fronteira.
5. `transporte/bateria/sequência → interface` por `sync*`, `render*` e `setStatus`; `interface → consumidores` por listeners que chamam funções de execução.
6. `painel compacto → sequência/bateria` por comandos; `sequência/bateria → painel compacto` por chamadas diretas a `syncCompactControls` e carrossel.

Para impedir ciclos nas próximas etapas, o contrato deve ser unidirecional: estado compartilhado sem importar consumidores; clock puro sem estado; scheduler recebe callbacks/consumidores injetados ou um barramento mínimo; consumidores não importam o scheduler concreto, apenas solicitam início/parada por um coordenador; interface assina snapshots/eventos e não é chamada pelo núcleo. Nenhuma dessas alterações foi executada nesta auditoria.

## 16. Limites desta subetapa

Não foram corrigidos sincronização, Valsa, atrasos, contadores, transições, cálculos musicais ou nomes legados. Não foram extraídos relógio, scheduler, fronteiras, bateria, sequência, trocas ou painel compacto. Os testes automatizados são estáticos e comprovam estrutura, fórmulas e integridade dos arquivos; a percepção temporal e sonora exige o roteiro manual em dispositivo real.
