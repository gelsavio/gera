# Inventário de dependências — Etapa 6I — GERA v3.15.12

## Novo módulo

`js/transport/sequence-transitions.js` expõe `window.GeraSequenceTransitions.resolveEnd(state)`. A função recebe um retrato de valores já existentes e retorna um objeto imutável que descreve a decisão de progressão. Não lê variáveis globais do aplicativo e não produz efeitos colaterais.

## Entradas

| Entrada | Origem legada | Finalidade |
| --- | --- | --- |
| `currentRepetition` | `currentSectionRepetition` | Repetição concluída da seção ativa |
| `holdLoop` | `sequenceHoldLoop` | Prioridade do loop manual da seção |
| `queuedSection` | `queuedSequenceSection` | Escolha manual aguardando entrada |
| `targetPasses` | `sectionTargetPasses()` | Quantidade de execuções antes da escolha manual |
| `configuredNext` | `configuredNextSequence()` | Campo `proxima`, inclusive `stop` |
| `configuredTarget` | `sectionTargetPasses()` | Quantidade de execuções antes de `proxima` |
| `configuredNextIsValid` | `SEQUENCE_SECTION_LABELS` | Validação legada da seção configurada |
| `auto` e `autoEnd` | `sequenceAuto` e `sequenceAutoEnd` | Modos automáticos vigentes |
| `autoTarget` | `sectionRepeatValue()` | Repetições da seção no modo automático |
| `automaticNext` | `nextAutomaticSection*()` | Próxima seção já resolvida pelo núcleo |
| `automaticNextTarget` | `sectionRepeatValue()` | Repetições da próxima seção |

## Saídas

As ações possíveis são `repeat-hold`, `repeat-before-manual`, `switch-manual`, `repeat-before-configured`, `stop-configured`, `switch-configured`, `repeat-auto`, `stop-auto-end`, `stop-auto-empty`, `switch-auto` e `repeat-continuous`.

## Adaptador no núcleo

`loadSequenceItem()` chama o planejador somente quando o índice ultrapassa o fim da seção e depois dos tratamentos já existentes de prévia, encerramento, virada e parada programada. O núcleo interpreta a ação e conserva a ordem das chamadas a `renderChordSequence`, `syncSequenceSectionButtons`, `saveChordSequence`, `applySectionDrumConfig`, `syncSectionDrumControls`, `stopDrums`, `stopChordSequence` e `setStatus`.

## Dependências preservadas fora do módulo

Permaneceram no núcleo a normalização das seções, a lista de rótulos, cálculo de repetições, seleção automática, conteúdo dos itens, áudio, bateria, overlays, Valsa, viradas, encerramentos, texto sincronizado, carrossel, DOM, persistência, painel compacto e transições entre músicas.

## Ausência de ciclos

O novo módulo não referencia `GeraTransportChordSequenceSync`, `GeraTransportCoordinator` ou qualquer outro módulo. O núcleo é o único ponto que fornece os valores e aplica a resposta.
