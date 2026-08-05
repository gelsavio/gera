# Diagnóstico para futura modularização do GERA v3.14.97

Data da análise: 3 de agosto de 2026  
Base examinada: `GERA-PWA-v3.14.97-painel-compacto-estavel.zip`  
Escopo: diagnóstico estático, sem alteração dos arquivos do aplicativo

## 1. Resultado executivo

O GERA v3.14.97 é um PWA estático cujo núcleo está concentrado em `index.html`, com 12.913 linhas e 545.299 bytes. O arquivo contém um único bloco CSS inline, com 4.018 linhas, e cinco blocos JAVASCRIPT clássicos. O segundo bloco JAVASCRIPT, entre as linhas 4.824 e 11.382, é o núcleo real do aplicativo: reúne teoria musical, WEB AUDIO API, instrumentos, acordes, bateria, transporte, sequenciador, músicas, listas, painel compacto, persistência e inicialização.

A análise sintática encontrou 622 declarações no escopo global desse bloco principal: 256 variáveis ou constantes e 366 funções. O quarto bloco, responsável pelo redesenho visual, pela montagem da interface, por parte do painel compacto e pelo modal de gravação, usa diretamente 69 símbolos definidos no núcleo. O quinto bloco, responsável pelo editor de ritmos, usa diretamente 25 símbolos do núcleo. Essa dependência explica por que uma conversão imediata do bloco principal para `<script type="module">` seria arriscada: declarações de um ES Module não ficam disponíveis no escopo global clássico consumido pelos blocos seguintes.

A divisão proposta por outra IA é conceitualmente útil, mas a ordem efetiva deve ser alterada. Antes de criar ES Modules, é mais seguro externalizar os blocos existentes como scripts clássicos, na mesma posição e ordem, e somente depois criar contratos explícitos entre as áreas. O transporte, a bateria e o sequenciador não podem ser separados em uma única etapa, pois compartilham estado e se chamam mutuamente no mesmo ciclo de agendamento.

Nenhum arquivo do GERA foi alterado durante esta etapa.

## 2. Integridade e composição do pacote

O ZIP foi testado e não apresenta erro de compactação. O `manifest.json` é um JSON válido. Os cinco blocos JAVASCRIPT foram analisados sintaticamente com ECMASCRIPT 2024 sem erro de parse.

| Item | Resultado |
|---|---|
| SHA-256 do ZIP | `2b7330907e326de097469830a2f46d6f71806801cc118049e201ab5848a29f9e` |
| SHA-256 de `index.html` | `c3cf6adbec9a35ed2866a655e77bef0dcadf40aaf51d86adebf0378cf96d0a1f` |
| SHA-256 de `sw.js` | `aea9a0c4a5b8b94b22f7a5b5fda395d4e4c22aa8f48783422dd3e01d93bc6d00` |
| SHA-256 de `manifest.json` | `b58d8ce07484b126550c07fea6f38327f39b7b3daa550cfac5eddd2acb700c1b` |
| IDs estáticos no HTML | 293, todos únicos |
| Blocos `<style>` | 1 |
| Blocos `<script>` | 5 |
| Arquivos no ZIP, incluindo diretórios | 11 entradas |

### Dependência externa ausente no ZIP examinado

O `sw.js` inclui no `PRECACHE_URLS` o arquivo `kit-acustico-selecionado/MAPEAMENTO.txt` e 16 samples WAV. O `index.html` também referencia esses WAV em `DRUM_SAMPLE_FILES`. Entretanto, a pasta `kit-acustico-selecionado/` não está dentro do ZIP 3.14.97 examinado.

Se o ZIP for aplicado sobre uma instalação que já possua a pasta, a dependência pode ser satisfeita. Se ele for publicado isoladamente, `cache.addAll(PRECACHE_URLS)` rejeitará a instalação do SERVICE WORKER quando encontrar o primeiro recurso ausente, porque a operação é integral. Em execução on-line, o motor acústico tentará carregar os samples e recorrerá à bateria sintética quando falhar. Esse ponto deve ser tratado na futura linha de base, sem ser misturado à extração de CSS ou JAVASCRIPT.

## 3. Blocos CSS

Existe um único `<style>`, das linhas 33 a 4.052. A cascata contém camadas históricas e várias regras posteriores que substituem regras anteriores. Não é seguro reorganizar seletores, agrupar temas ou remover duplicações durante a primeira extração.

| Faixa aproximada | Responsabilidade predominante |
|---|---|
| 33–401 | Base histórica: variáveis, reset, corpo, cabeçalho, controles, teclado, acordes, bateria, sequência, modais e responsividade inicial |
| 402–777 | Temas escuro, neutro e claro; contraste; cores dos acordes; precedência das cores funcionais do círculo harmônico |
| 778–937 | Cores por classe de altura das teclas, temas do teclado, nome da música, linha de temporização e barra de transporte |
| 938–1.258 | Cabeçalho flexível, memórias, modo compacto inicial e ajustes responsivos |
| 1.259–1.631 | Interface principal redesenhada, barra superior, trilho lateral, cartões, biblioteca, modais, logotipo e piano |
| 1.632–2.252 | Reorganização da interface, contadores, gravação centralizada, navegação lateral, novos temas, contraste de sequências e editor de gravação |
| 2.253–2.448 | Editor de ritmos em grade, biblioteca global de ritmos e reorganização do editor de sequências |
| 2.449–2.752 | Execução única, loop, bateria compacta, teclado rolável, AUTO/AUTO FIM, letras e linha do tempo textual |
| 2.753–3.258 | Listas de músicas, painel compacto, carrossel contínuo, previsões de letra e controle compacto de bateria |
| 3.259–3.590 | Painel de bateria redesenhado e seus controles responsivos |
| 3.591–3.787 | Previsão de repetição/sequência e incorporação de `sequence-strip` ao overview |
| 3.788–4.051 | Integração final do painel compacto com todos os temas e regras de estabilidade visual |

Conclusão para o CSS: a primeira extração deve criar apenas um arquivo externo, por exemplo `styles/gera-v3.14.97.css`, contendo exatamente o texto atual, na mesma ordem. A divisão em `base.css`, `themes.css`, `compact.css` e `redesign.css` só deve ocorrer posteriormente, após um mapa de especificidade e testes visuais comparativos.

## 4. Blocos JAVASCRIPT e ordem de execução

Todos os scripts são clássicos; nenhum utiliza `type="module"`, `src` ou `defer`.

| Bloco | Linhas | Função | Momento e dependências |
|---|---:|---|---|
| 1 | 19–32 | Leitura antecipada do tema | Executa no `<head>`, antes do CSS, lê `geraTheme` e define `data-theme`; evita clarão de tema |
| 2 | 4.824–11.382 | Núcleo completo | Executa depois de quase todo o DOM principal; declara 622 bindings globais, registra eventos, lê persistência e monta o estado inicial |
| 3 | 11.384–11.399 | Registro do SERVICE WORKER | Registra `./sw.js` no evento `load`, somente em HTTP/HTTPS; independente do núcleo |
| 4 | 11.404–12.550 | Redesign, montagem, biblioteca visual, contador compacto e modal de gravação | IIFE; consome 69 símbolos globais do bloco 2; move nós já existentes entre os painéis; inicia intervalo de atualização de 250 ms |
| 5 | 12.594–12.911 | Editor de ritmos | IIFE; vem após o próprio `<dialog>`; consome 25 símbolos do bloco 2 e inicializa o editor |

### Ordem interna do bloco principal

1. Declara o atalho `$`, tema, teoria musical, instrumentos e constantes.
2. Inicializa todo o estado compartilhado em uma declaração extensa na linha 4.971.
3. Define o motor de áudio, vozes, envelopes, barramentos e mute global.
4. Define voicings, acordes, acompanhamento e as primeiras rotinas do transporte.
5. Define persistência de sequências, biblioteca global de ritmos, músicas e listas.
6. Executa `loadDrumPatternLibrary()` na linha 6.471, antes de o restante da interface ser inicializado.
7. Define o sequenciador, texto sincronizado, reprodução e transições.
8. Define samples, bateria sintética/acústica, padrões, scheduler e fronteiras do transporte.
9. Define teclado, acordes, círculo harmônico e painel compacto.
10. A partir da linha 10.751, registra eventos de controles e entradas.
11. Na linha 11.203, executa `initializeGeraTheme()`.
12. Nas linhas 11.282–11.303, executa a inicialização efetiva: sincroniza mute, lê o motor da bateria, renderiza teclado e acordes, vincula bateria, sincroniza controles, carrega músicas e listas, cria uma área de trabalho vazia e tenta bloquear a orientação em paisagem.
13. Nas linhas 11.304–11.381, liga diálogos, listas, organização de sequências e gerenciamento de músicas.
14. Após o núcleo, registra o SERVICE WORKER, monta o redesign e, por último, inicializa o editor de ritmos.

### Efeito importante da ordem atual

O bloco 4 executa `assemble()` e move elementos existentes para novos contêineres, sem recriar a maior parte deles. Depois executa `bindSequenceRecordDialog()`, `bind()`, restaura o trilho, constrói o dial, configura o botão de mute móvel e inicia um `setInterval` de 250 ms. O bloco 5 só pode executar depois que o diálogo do editor de ritmos, inserido entre os blocos 4 e 5, já foi analisado pelo navegador.

## 5. Inventário do estado global

O núcleo possui 256 variáveis ou constantes globais e 366 funções globais. As funções também são bindings globais, mas estão catalogadas por responsabilidade nas seções seguintes. O estado mutável mais crítico está concentrado na declaração da linha 4.971.

### Constantes de plataforma, teoria e configuração

`$`, `GERA_THEME_KEY`, `GERA_THEMES`, `CHORD_NAMES`, `NOTE_NAMES`, `COLORS`, `NAT`, `SHARP`, `NKEY`, `SKEY`, `KEYMAP`, `INSTRUMENT_IDS`, `LEGACY_INSTRUMENT_MAP`, `LABELS`, `CHORD_INTERVALS`, `KEYBOARD_61_MIN_SEMI`, `KEYBOARD_61_MAX_SEMI`, `SEQUENCE_OCTAVE_MIN`, `SEQUENCE_OCTAVE_MAX`, `CIRCLE_DEGREES`, `SECONDARY_DOMINANTS`, `MAX_SIMULTANEOUS_TOUCHES`, `manualChordSessions`, `chordLoudnessCache`, `CHORD_RMS_TARGET`, `sequenceNoteFlashCounts`, `GUITAR_OPEN_STRINGS`, `GUITAR_SHAPES`, `MAX_SEQUENCE_REPEATS`, `MEMORY_PREFIX`, `FACTORY_SETTINGS` e `DEFAULT_PRESETS`.

### Áudio, instrumentos e configuração de execução

`audioCtx`, `masterGain`, `limiter`, `appMuteGain`, `drumBus`, `drumCompressor`, `bassBus`, `bassCompressor`, `bassHighpass`, `bassLowShelf`, `bassPresence`, `openHatVoice`, `instrument`, `octave`, `capoSemitones`, `sustainMode`, `releaseMs`, `attackMs`, `chordMode`, `arpInterval`, `arpPattern`, `chordType`, `inversion`, `bassEnabled`, `latchEnabled`, `splitEnabled`, `splitInstrument`, `velocityEnabled`, `glissEnabled`, `metronomeOn`, `metronomeTimer`, `metronomeBeat`, `bpm`, `rhythmPattern`, `chordChangeMode`, `latchedRoot`, `latchedType`, `pendingRoot`, `pendingType`, `pendingButton`, `latchedButton`, `accompanimentTimer`, `accompanimentEvents`, `accompanimentHalfTimer`, `activeVoices`, `pointerVoices`, `pointerLastKey`, `pressedKeys`, `saveArmed`, `actionToken`, `alternateDirection`, `circleEnabled`, `circleRoot` e `globalAudioMuted`.

### Bateria, samples e editor de ritmos

`drumEngine`, `drumSamplesReady`, `drumSamplesLoading`, `drumSampleBuffers`, `drumRoundRobin`, `drumSamplesLoadedCount`, `drumSamplesTotalCount`, `drumSamplesFailureCount`, `drumMode`, `drumRunning`, `drumPattern`, `drumManual`, `drumStep`, `drumTimer`, `drumNextTime`, `drumFillQueued`, `drumEndingQueued`, `drumQueuedAction`, `drumActiveAction`, `drumCompletedAction`, `drumActionMuteFrom`, `drumActionMuteUntil`, `drumEditorTestTimers`, `drumEditorTestToken`, `drumLayers`, `DRUM_EDITOR_TRACKS`, `DRUM_DATA_PARTS`, `DRUM_LIBRARY_KEY`, `DRUM_SET_FORMAT`, `DRUM_SET_VERSION`, `BUILTIN_DRUM_NAMES`, `drumPatternLibrary`, `ORIGINAL_BUILTIN_DRUM_LIBRARY`, `DRUM_SAMPLE_FILES`, `DRUM_PATTERNS`, `DRUM_VARIATIONS_B` e `DRUM_ACTION_PATTERNS`.

### Sequenciador e texto sincronizado

`sequenceEndActionInProgress`, `sequenceConfiguredActionName`, `sequencePendingEntryAction`, `sequenceRecordPreviewActive`, `sequenceRecording`, `sequencePlaying`, `sequenceTimer`, `sequenceIndex`, `sequenceEighthUnitsRemaining`, `sequenceContinuousItem`, `sequenceStartQueued`, `activeSequenceSection`, `queuedSequenceSection`, `sequenceLoop`, `sequenceAuto`, `sequenceAutoEnd`, `sequenceHoldLoop`, `sequencePanelVisible`, `sequenceSections`, `sequenceRepeats`, `sequenceOrder`, `sequenceDrums`, `currentSectionRepetition`, `sequencePendingTransition`, `sequencePlaybackOriginalChordMode`, `sequenceStopAtEnd`, `sequenceDeleteArmed`, `sequenceDeleteTimer`, `sequenceEditIndex`, `sequenceChordOctaveOverride`, `sequenceTextCountdownTimer`, `sequenceTextHoldTimer`, `sequenceTextCueToken`, `sequenceTextTimeline`, `sequenceTextTimelineDuration`, `sequenceTextTimelineStartedAt`, `sequenceTextTimelineRunning`, `sequenceTextTimelineLoop`, `sequenceTextTimelineLastCueKey`, `sequenceTextTimelineCurrentText`, `sequenceTextTimelineCurrentUntil`, `SEQUENCE_KEY` e `SEQUENCE_SECTION_LABELS`.

### Transporte mestre

`transportRunning`, `transportStep`, `transportNextTime`, `transportTimer`, `transportEvents`, `transportBar`, `transportTempoBpm`, `pendingBpm`, `pendingRhythmPattern`, `drumStartQueued`, `accompanimentStopQueued`, `accompanimentStopEventScheduled`, `compactSequenceStartKeepsDrumClock`, `drumStopAtAlignedSequenceStart` e `drumPatternAtAlignedSequenceStart`.

### Músicas, listas e painel compacto

`SONGS_KEY`, `SONG_LISTS_KEY`, `SONG_LIST_SETTINGS_KEY`, `songs`, `currentSongName`, `songLists`, `activeSongListId`, `songListEditorId`, `songListEditorDraft`, `compactListIndex`, `compactTransitionMode`, `compactNextStartMode`, `compactListEndMode`, `compactAutoAdvanceLock`, `compactCarouselPassSerial`, `compactCarouselActivePassId`, `compactCarouselLastPassSignature`, `compactCarouselPlaybackSession`, `compactCarouselQueuedPassId`, `compactCarouselQueuedSection`, `compactCarouselQueuedRepeat`, `compactCarouselPreviewSignature`, `compactModeActive` e `compactSequenceOnly`.

### Referências globais ao DOM

`keyboardEl`, `bpmInput`, `sequenceClearAllButton`, `compactModeToggle`, `compactModeClose`, `compactSongsOpen`, `compactPlayButton`, `compactSequenceOnlyButton`, `compactLoop`, `compactDrumOnly`, `compactDrumFill`, `compactDrumEnding`, `compactCapoDown`, `compactCapoUp`, `compactOctaveDown`, `compactOctaveUp`, `compactCircleRoot`, `compactListSelect`, `compactPrevSong`, `compactNextSong`, `compactTransitionModeSelect`, `compactNextStartModeSelect`, `compactListEndModeSelect`, `compactCarouselPrev`, `compactCarouselNext`, `globalMuteButton`, `appConfirmOk`, `appConfirmCancel`, `appConfirmDialog`, `sequenceEditKind`, `sequenceEditBefore`, `sequenceEditReplace`, `sequenceEditAfter`, `sequenceEditDelete`, `sequenceEditCancel`, `sequenceEditClose`, `sequenceEditorDialog`, `songListCreateButton`, `songListEditorClose`, `songListEditorCancel`, `songListEditorSave`, `songListDelete`, `songListEditorDialog`, `sequenceOrganizeOpen`, `sequenceOrganizeClose`, `sequenceOrganizeDone`, `sequenceOrderReset` e `sequenceOrganizeDialog`.

### Estado auxiliar restante

`appConfirmResolver` e `bpmEditingValue` completam o conjunto global. O bloco 4 ainda cria estado privado dentro de sua IIFE para gravação de sequência e diálogo de BPM. O bloco 5 cria `editorPart` e `editorPatternId` dentro de sua IIFE.

## 6. Chaves do localStorage

Foram encontradas 12 famílias de chaves efetivas, considerando as seis memórias como uma família parametrizada.

| Chave | Operações | Conteúdo observado | Compatibilidade |
|---|---|---|---|
| `geraTheme` | leitura e gravação | Tema: `dark`, `neutral`, `light`, `ocean`, `forest` ou `violet` | Lida antecipadamente no `<head>` e novamente no núcleo |
| `geraDrumPatternLibraryV1` | leitura e gravação | `{version, patterns}` da biblioteca global de ritmos | Deve preservar padrões incorporados e personalizados |
| `tecladoVirtualSongSections` | leitura, gravação e remoção | `{sections, active, loop, auto, autoEnd, autoV2, repeats, ordemSecoes, bateria, drumEngine, visible}` | Chave principal de sequência, herdada do TECLADO VIRTUAL |
| `tecladoVirtualChordSequence` | leitura e remoção | Array legado de uma sequência | Fallback de migração para `verse` |
| `geraSongListsV1` | leitura e gravação | `{version:1, lists}` | Cada lista normalizada contém `{id, name, songNames}` |
| `geraPlaylistSettingsV1` | leitura e gravação | `{activeListId, currentIndex, transitionMode, nextStartMode, endMode}` | Estado do painel compacto e das listas |
| `tecladoVirtualSongs` | leitura e gravação | `{songs, lastSong}` | A leitura usa `songs`; `lastSong` é salvo, mas o carregamento zera `currentSongName` |
| `tecladoVirtualDrumEngine` | leitura e gravação | `acoustic` ou `synth` | Também pode ser sobrescrito por uma memória aplicada |
| `tecladoVirtualMemory1` a `tecladoVirtualMemory6` | leitura e gravação | Snapshot de `settings()` com instrumento, sustain, BPM, ritmo e volumes | A ausência da chave ativa o preset de fábrica correspondente |
| `geraRedesignTab` | leitura e gravação | Nome da aba do redesign | Padrão `acordes` |
| `geraGlobalMutePositionV1` | leitura e gravação | `{left, top}` | Posição do botão flutuante de mute |
| `geraRedesignRailCollapsed` | leitura e gravação | String `1` ou `0` | Estado recolhido do trilho lateral |

Não foi encontrada utilização de `sessionStorage`, INDEXEDDB ou backend. O CACHE STORAGE do SERVICE WORKER é separado do `localStorage`.

## 7. Contratos do DOM

O HTML possui 293 IDs estáticos, todos únicos. Os scripts fazem referência literal a 271 IDs por `$()`, `byId()` ou `getElementById()`, além de seletores por classe e `data-*`. Três referências literais não correspondem a um ID estático presente no documento:

- `drum-pattern-select`: acesso defensivo; o controle está ausente no HTML estático atual.
- `section-bars-display`: acesso defensivo; o controle está ausente no HTML estático atual.
- `sequence-play-wait`: acesso defensivo; o controle está ausente no HTML estático atual.

Essas referências não são necessariamente erros em execução porque são protegidas por teste de existência, mas constituem resíduos de interface e devem ser preservadas até uma limpeza posterior específica.

### Grupos principais de IDs funcionais

| Área | IDs e contratos centrais |
|---|---|
| Cabeçalho e tema | `theme-cycle`, `manual-btn`, `advanced-toggle`, `compact-mode-toggle`, `fullscreen`, `global-mute-float` |
| Áudio e ajustes | `instrument`, `oct-down`, `oct-label`, `oct-up`, `capo-down`, `capo-label`, `capo-up`, `sustain-pressed`, `sustain-hold`, `sustain-next`, `release`, `attack`, `bpm`, `rhythm-pattern`, `arpeggio-pattern`, `arp-interval`, `inversion`, `drum-engine`, cinco controles de volume e seus readouts |
| Teclado e acordes | `keyboard`, `sharp-row`, `natural-row`, `major-chords`, `minor-chords`, `circle-main-wrap`, `circle-main-chords`, `secondary-dominants-wrap`, `secondary-dominants`, `normal-chord-group` |
| Bateria | `drum-panel`, `drum-toggle`, `drum-status`, `drum-presets`, `drum-fill`, `drum-ending`, `drum-manual`, `drum-stop`, `drum-metronome-controls`, `manual-drum-stage`, controles `data-layer` e botões `.drum-pattern` |
| Sequenciador | `sequence-panel`, `sequence-play`, `sequence-stop-drums`, `sequence-hold-loop`, `section-instrument`, `section-next`, `section-drum-pattern`, `section-drum-entry`, `section-drum-exit`, `section-drum-final`, botões de fração, `sequence-record`, `sequence-clear`, `sequence-clear-all`, `sequence-strip` e botões `data-sequence-section` |
| Editor de item | `sequence-editor-dialog` e todos os IDs `sequence-edit-*` |
| Gravação de sequência | `sequence-record-dialog` e todos os IDs `sequence-record-*` |
| Músicas e listas | `songs-dialog`, `songs-list`, `song-name-input`, `song-bpm-input`, `song-list-*`, `song-bpm-dialog` e seus controles |
| Painel compacto | IDs `compact-*`, especialmente `compact-sequence-carousel`, `compact-seq-countdown`, áreas de letra, três botões de transporte e seletores de lista/transição |
| Redesign | IDs `redesign-*`; o bloco 4 move os nós originais para slots e atualiza leituras, biblioteca, timeline e mixer |
| Editor de ritmos | `drum-editor-dialog` e todos os IDs `drum-editor-*` |

### Seletores funcionais que não podem ser renomeados

`[data-sequence-section]`, `[data-section-control]`, `[data-section-repeat-display]`, `[data-repeat-adjust]`, `[data-layer]`, `[data-record-fraction]`, `.memory-button`, `.fine-btn`, `.manual-drum-pad`, `.drum-pattern`, `.chord`, `.key`, `.sequence-subgroup`, `.sequence-text-preview`, `.redesign-rail-btn`, `.redesign-tabpanel`, `.drum-editor-cell` e as propriedades `dataset` associadas.

O bloco 4 depende ainda da posição estrutural de `.control`, de `dialog`, dos slots `redesign-*` e da capacidade de mover os mesmos nós com `appendChild`. Uma futura extração de UI não deve clonar esses elementos nem recriá-los, pois isso perderia listeners e estado visual.

## 8. Componentes e dependências

### 8.1 Motor de áudio

O áudio é criado sob demanda por `ensureAudio()`, preservando a exigência de interação do usuário. O grafo principal é:

`AudioContext` → vozes/instrumentos → `masterGain` → `limiter` → `appMuteGain` → destino.

A bateria usa `drumBus` → `drumCompressor` → `masterGain`. O baixo automático usa `bassBus` → high-pass de 34 Hz → low-shelf de 125 Hz → presença em 820 Hz → `bassCompressor` → `masterGain`. O baixo fica fora da normalização RMS dos acordes. `createVoice()` contém, no mesmo corpo, a síntese e os envelopes de todos os instrumentos. `createChordLoudnessSession()` mede RMS e mantém `chordLoudnessCache`.

Dependências de entrada: valores do DOM para volumes; estado global de instrumento, oitava, capotraste, ataque, liberação e mute. Dependências de saída: conjuntos de vozes ativas, teclado, acordes, acompanhamento, sequenciador, bateria sintética e editor de ritmos.

### 8.2 Bateria

Há quatro camadas distintas atualmente misturadas:

- dados incorporados: `DRUM_PATTERNS`, `DRUM_VARIATIONS_B`, `DRUM_ACTION_PATTERNS`;
- biblioteca normalizada e persistida: `drumPatternLibrary`, `normalizeDrumPatternData()`, `loadDrumPatternLibrary()` e `saveDrumPatternLibrary()`;
- motor sonoro: samples acústicos, fallback sintético, choke de chimbal e `playDrum()`;
- agendamento: `scheduleDrumStep()` chamado pelo transporte mestre.

As configurações por seção ficam em `sequenceDrums`; portanto, bateria e sequenciador compartilham dados. `activePlaybackDrumData()` escolhe os dados da seção em execução. Viradas e encerramentos compartilham estado com transições de sequência. O editor de ritmos modifica `drumPatternLibrary` e pode reescrever referências inválidas em `sequenceDrums` ao excluir um ritmo personalizado.

### 8.3 Transporte

O relógio mestre usa passos de semicolcheia: `stepDur = 15 / transportTempoBpm`. `transportScheduler()` trabalha com lookahead de 120 ms e agenda novamente a cada 25 ms. O número de passos do compasso vem de `activeTransportSteps()`, podendo ser 12 ou 16. `handleTransportBoundary()` processa inícios de compasso, BPM pendente, ritmo pendente, partida/parada da bateria, avanço da sequência e execução do acompanhamento.

O transporte não é uma camada isolada. Ele lê ou modifica diretamente BPM, padrão da bateria, estado da sequência, acorde travado, mudanças pendentes, ações de bateria, DOM e timers. `ensureMasterTransport()` e `maybeStopMasterTransport()` dependem de `transportNeeded()`, que considera bateria, sequência, metrônomo e acompanhamento.

### 8.4 Sequenciador

O sequenciador contém 16 seções internas: `verse`, `prechorus`, `chorus`, `bridge` e `section5` a `section16`, exibidas como A–P. Os dados principais são `sequenceSections`, `sequenceRepeats`, `sequenceOrder` e `sequenceDrums`. Cada item é normalizado por `normalizeSequenceItem()` e pode representar acorde, nota, pausa, fração, oitava, instrumento, baixo e texto.

`advanceSequenceBoundary()` é chamado pelo transporte. Ele coordena índice, duração restante, repetição, fila de seção, AUTO/AUTO FIM, loop, transições e ações de bateria. `loadSequenceItem()` alimenta o acorde ou nota efetivamente tocado. `renderChordSequence()` atualiza a barra visual e também alimenta partes do painel compacto e do redesign.

O texto sincronizado possui uma linha do tempo própria em milissegundos, mas é derivado das seções, repetições e BPM. Os contadores do painel compacto e do redesign leem diretamente o estado global do sequenciador.

### 8.5 Painel compacto

O painel compacto não é independente. Ele usa músicas/listas, transporte, bateria, sequenciador, círculo harmônico, capotraste, oitava, letras e carrossel. O estado principal inclui modo ativo, índice da lista, regras de transição, sessão do carrossel e previsões de passagem.

O núcleo fornece renderização e controles `compact*`. O bloco 4 acrescenta `syncCompactSequenceCountdown()` e atualiza o contador a cada 250 ms. O mesmo bloco executa `assemble()` e move elementos do DOM. Portanto, a extração do painel compacto exige primeiro um contrato de leitura do estado e comandos explícitos de transporte; não deve ser a primeira UI extraída.

### 8.6 PWA

O `manifest.json` define versão 3.14.97, `start_url` e `id` em `./index.html`, escopo `./`, modo standalone, orientação `any` e três ícones.

O `sw.js` usa `CACHE_NAME = gera-pwa-v3.14.97`. No `install`, faz pré-cache integral e chama `skipWaiting()`. No `activate`, remove caches `gera-pwa-*` e `teclado-virtual-pwa-*` antigos e chama `clients.claim()`. Navegações usam network-first com fallback para cache, `index.html` e `offline.html`. Áudio, imagem, estilo, script e fonte usam cache-first. Demais GETs da mesma origem usam network-first. Mensagens `SKIP_WAITING` também são aceitas.

O registro é feito pelo bloco 3 somente em HTTP ou HTTPS. Não existe SERVICE WORKER em `file://`.

## 9. Mapa de dependências

| Área de origem | Depende de | Fornece para |
|---|---|---|
| Tema antecipado | `localStorage`, `<html>` e meta de tema | CSS e botão de tema |
| Teoria musical | Constantes de notas e intervalos | Teclado, acordes, círculo, sequenciador e painel compacto |
| Áudio | DOM de volumes e estado musical | Teclado, acordes, baixo, metrônomo, bateria e sequenciador |
| Transporte | Áudio, BPM, compasso, bateria, sequência e acorde travado | Fronteiras temporais para todos os acompanhamentos |
| Bateria | Áudio, biblioteca, `sequenceDrums`, transporte e DOM | Som, ações, viradas, encerramentos e estado visual |
| Sequenciador | Teoria, áudio, transporte, bateria, persistência e DOM | Acordes/notas, transições, letras, contadores e painel compacto |
| Músicas e listas | Sequenciador, bateria, BPM e `localStorage` | Biblioteca, painel compacto e importação/exportação |
| Painel compacto | Quase todas as áreas anteriores | Comandos de execução e visualização resumida |
| Redesign | 69 símbolos do núcleo e DOM original | Layout final, mixer, timeline, gravação e atualizações periódicas |
| Editor de ritmos | 25 símbolos do núcleo | Modificação da biblioteca global e de referências de seção |
| PWA | Arquivos físicos e rotas | Instalação, atualização e funcionamento offline |

### Dependências diretas dos blocos tardios

O bloco 4 acessa diretamente, entre outros, `bpm`, `songs`, `currentSongName`, `sequencePlaying`, `sequenceSections`, `sequenceOrder`, `activeSequenceSection`, `currentSectionRepetition`, `queuedSequenceSection`, `stopChordSequence()`, `playChordSequence()`, `stopDrums()`, `stopMasterTransport()`, `requestBpmChange()`, `renderChordSequence()` e `loadSong()`.

O bloco 5 acessa diretamente `drumPatternLibrary`, `DRUM_EDITOR_TRACKS`, `sequenceDrums`, `audioCtx`, `ensureAudio()`, `playDrum()`, `barDuration()`, `drumPatternEvent()`, `normalizeDrumPatternData()`, `saveDrumPatternLibrary()`, `saveChordSequence()` e `syncSectionDrumControls()`.

Esses acessos devem virar interfaces explícitas antes que o núcleo deixe de ser script clássico.

## 10. Riscos principais da modularização

1. Converter apenas o bloco 2 para ES Module quebrará os blocos 4 e 5, porque seus 94 acessos diretos deixarão de resolver no escopo global clássico.
2. Separar transporte, bateria e sequenciador simultaneamente ocultará regressões de compasso, BPM, viradas, AUTO, loop e painel compacto.
3. Extrair CSS já dividido por tema ou componente pode alterar a cascata; há regras históricas e correções posteriores com a mesma especificidade.
4. Mover scripts para o `<head>` com `defer` mudará o momento de execução e pode afetar a montagem realizada por `assemble()`.
5. Recriar elementos em módulos de UI pode remover listeners, referências globais e posições preservadas do carrossel.
6. Centralizar todo o `localStorage` de uma vez pode apagar compatibilidade com chaves do TECLADO VIRTUAL e com memórias existentes.
7. O SERVICE WORKER atual falha na instalação integral se qualquer sample do pré-cache estiver ausente.
8. `createVoice()` mistura infraestrutura, definição de timbre, envelope e roteamento; extraí-lo inteiro em uma única etapa terá diff amplo e risco audível.
9. Há timers de naturezas diferentes: scheduler de 25 ms, lookahead de áudio, `setInterval` visual de 250 ms, timers de texto, timers de sequência e timers de liberação. Eles não devem ser reunidos ou substituídos sem testes temporais.
10. Os IDs ausentes, seletores dinâmicos e atributos `data-*` constituem contratos implícitos que uma limpeza estética poderia romper.

## 11. Divisão mais segura em etapas pequenas

### Fase 0 — concluída: diagnóstico

Manter esta versão sem alterações e usar este documento como mapa. Não corrigir ainda o kit ausente, a Valsa, resíduos de DOM ou variáveis mortas.

### Fase 1 — linha de base reproduzível

Criar uma cópia identificada do monólito, registrar hashes, completar ou declarar formalmente a dependência do kit acústico, registrar a versão do cache e executar um checklist manual. Nenhuma extração.

### Fase 2 — extração literal do CSS para um único arquivo

Mover o conteúdo exato do único `<style>` para `styles/gera-v3.14.97.css`. Manter a folha no mesmo ponto do `<head>`, sem reordenar, dividir, limpar ou formatar. Atualizar cache e testar visualmente.

### Fase 3 — externalização dos scripts independentes, ainda clássicos

Executar uma versão por bloco:

1. externalizar apenas o registro do SERVICE WORKER, mantendo a posição após o núcleo;
2. externalizar apenas o tema antecipado, mantendo execução síncrona antes do CSS;
3. externalizar apenas o editor de ritmos, mantendo-o depois do diálogo;
4. externalizar apenas o bloco de redesign, mantendo-o antes do diálogo do editor.

Nessa fase, usar `<script src>` clássico, não ES Modules. O objetivo é provar que a separação física não altera escopo nem ordem.

### Fase 4 — externalização literal do núcleo clássico

Mover o bloco 2 inteiro para um único `js/gera-core-legacy.js`, na mesma posição. Não reorganizar funções. Confirmar que os scripts tardios continuam acessando os bindings globais.

### Fase 5 — contratos e estado, sem mover motores

Criar uma fachada explícita, inicialmente clássica, por exemplo `window.GERA_API`, somente com os comandos e leituras usados pelos blocos de redesign e editor de ritmos. Migrar um consumidor por versão. Depois que nenhum bloco tardio depender de bindings implícitos, será possível converter áreas internas para módulos.

Não centralizar todo o estado de uma vez. Começar por leituras sem mutação: tema, BPM atual, seção ativa, estado de execução e biblioteca de músicas. Em seguida, criar comandos explícitos: tocar/parar sequência, iniciar/parar bateria, alterar BPM, carregar música e salvar padrão.

### Fase 6 — dados puros

Extrair separadamente, uma versão por item:

1. constantes e funções puras de teoria musical;
2. dados incorporados dos instrumentos, sem mover `createVoice()`;
3. padrões incorporados de bateria e ações;
4. normalizadores puros de itens de sequência;
5. normalizadores puros de listas e músicas.

Adicionar testes NODE apenas às funções sem DOM, WEB AUDIO API, timers ou `localStorage`.

### Fase 7 — persistência por domínio

Criar `storage.js`, mas migrar uma família por versão: tema; preferências simples; memórias; listas; músicas; biblioteca de ritmos; sequências e legado. Manter os nomes e formatos atuais e testar com um conjunto real de dados antigos antes e depois.

### Fase 8 — áudio em camadas

Separar, em versões independentes: criação/retomada do contexto; grafo de barramentos; mute e volumes; ciclo de vida das vozes; definições de timbre; normalização de acordes; baixo; samples; síntese de bateria. Não alterar valores de filtros, ganhos, envelopes ou limites de vozes durante a extração.

### Fase 9 — transporte por contratos

Primeiro extrair apenas cálculos puros de compasso e duração. Depois extrair o relógio e scheduler mantendo callbacks fornecidos pelo bootstrap. Em versões posteriores, mover aplicação de BPM pendente, fronteiras de compasso e parada agendada. O transporte deve notificar eventos; não deve importar UI.

### Fase 10 — bateria e sequenciador

Somente após o transporte possuir contrato estável, mover `scheduleDrumStep()` e o motor de bateria. Depois mover avanço de item, avanço de seção e transições do sequenciador, cada um em versão própria. Viradas, encerramentos, Valsa, AUTO/AUTO FIM e regras do próximo compasso precisam de testes específicos.

### Fase 11 — interface, começando pelas áreas menos acopladas

Ordem recomendada: tema; modais de confirmação; biblioteca visual de músicas; editor de ritmos; teclado visual; acordes/círculo; painel de bateria; sequenciador; redesign; painel compacto por último. O painel compacto deve ser o último porque agrega o maior número de estados e comandos.

### Fase 12 — conversão final para ES Modules

Somente depois que consumidores não dependerem de bindings globais, converter o bootstrap e os módulos para `type="module"`. Preservar um único `main.js` como coordenador, sem lógica de domínio. Atualizar `PRECACHE_URLS`, versão do cache e documentação. A correção da Valsa e a remoção de código morto devem ocorrer depois da confirmação de paridade, em versões próprias.

## 12. Critério de parada após cada fase

Ao final de cada fase, interromper o trabalho e entregar diff, arquivos alterados, testes automáticos possíveis, checklist manual e riscos observados. A fase seguinte só deve começar após aprovação expressa e teste da versão anterior.

O conjunto crítico de regressão deve cobrir tema antes da pintura inicial, desbloqueio de áudio, todos os instrumentos, sustain e liberação, acordes e inversões, baixo automático, bateria acústica e sintética, 3/4 e 4/4, metrônomo, mudanças de BPM, sequência A–P, repetições, AUTO/AUTO FIM, viradas, encerramentos, textos, painel compacto, listas, importação/exportação, memórias, atualização do PWA e abertura offline.

## 13. Conclusão técnica

A modularização é viável sem framework e sem build obrigatório, mas o primeiro objetivo não deve ser criar a árvore final de módulos. O primeiro objetivo deve ser romper, de forma controlada, a dependência dos blocos 4 e 5 em relação às 622 declarações globais do núcleo.

A sequência mais segura é: linha de base, CSS externo único, scripts clássicos externos preservando posição, núcleo clássico externo, fachada explícita, dados puros, persistência, áudio, transporte, bateria, sequenciador, UI e somente então ES Modules. Essa ordem é determinada pelo código real da versão 3.14.97 e reduz o risco de regressões audíveis, visuais, temporais e de persistência.
