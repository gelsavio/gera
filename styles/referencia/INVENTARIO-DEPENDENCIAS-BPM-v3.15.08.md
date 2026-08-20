# Inventário de dependências das mudanças de BPM — GERA v3.15.08

Data: 4 de agosto de 2026

## Fonte única do estado

`js/state.js` permanece como o único armazenamento dos três valores do andamento:

| Valor | Função preservada |
|---|---|
| `bpm` | BPM selecionado, exibido e persistido |
| `transportTempoBpm` | BPM efetivo usado para calcular a duração dos próximos passos agendados |
| `pendingBpm` | último BPM solicitado enquanto o transporte está ativo e ainda não consumido pelo passo zero |

Os acessos globais legados continuam sendo propriedades de encaminhamento para `GeraState.tempo`. O novo módulo mantém apenas uma referência ao mesmo objeto canônico e não declara armazenamento paralelo.

## Contrato de `js/transport/tempo.js`

| Operação | Entrada | Efeito preservado | Dependências recebidas |
|---|---|---|---|
| `requestChange` | valor e estado de execução | aplica imediatamente ou registra/cancela `pendingBpm` | `normalize` |
| `applyAtBoundary` | BPM a efetivar | sincroniza selecionado, efetivo e pendente | `normalize` |
| `schedulePendingAtStep` | `step` e `when` | no passo zero, atualiza o efetivo e agenda a aplicação selecionada | `currentTime`, `onBoundaryApply`, `trackEvent` |
| `settleOnStop` | nenhuma | aplica pendência ou sincroniza o efetivo | `onBoundaryApply` |
| `resetForStart` | nenhuma | sincroniza o efetivo e elimina pendência | nenhuma externa |

## Ordem de carregamento

1. `js/chords.js`;
2. `js/state.js`;
3. `js/transport/clock.js`;
4. `js/transport/scheduler.js`;
5. `js/transport/boundaries.js`;
6. `js/transport/tempo.js`;
7. `js/audio/core.js`;
8. núcleo inline legado.

`tempo.js` depende somente da existência prévia de `GeraState.tempo`. A normalização e os adaptadores que tocam a interface são injetados pelo núcleo, evitando importação do scheduler, das fronteiras, da bateria ou da sequência.

## Fluxo da solicitação à aplicação

`requestBpmChange(value)` continua sendo o adaptador de interface. Ele chama `transportTempoController.requestChange(value, transportRunning)`, atualiza o campo numérico e chama `updateBpmDisplay()`.

Quando o transporte está parado, o controlador normaliza o valor e sincroniza `bpm` e `transportTempoBpm`. Quando está ativo, mantém `bpm` e `transportTempoBpm` e registra o último valor diferente em `pendingBpm`.

No pulso do scheduler, `handleTransportSchedulerPulse(step, when)` chama `schedulePendingAtStep(step, when)`. Fora do passo zero, nada acontece. No passo zero, o controlador normaliza e consome `pendingBpm`, atualiza `transportTempoBpm`, calcula o mesmo atraso legado contra `audioCtx.currentTime`, agenda `applyPendingBpmAtBoundary(nextBpm)` e registra o identificador em `transportEvents`.

No instante da fronteira, o adaptador `applyPendingBpmAtBoundary()` chama `applyAtBoundary()`, atualiza o campo de BPM, a legenda e o status da bateria. Essas ações visuais não foram movidas para o módulo.

## Leitores preservados

- `GeraTransportClock.stepDurationSeconds(transportTempoBpm)` lê o BPM efetivo;
- metrônomo, cálculos musicais, salvamento, seleção de música, memórias e interface continuam lendo `bpm`;
- `updateBpmDisplay()` continua lendo `pendingBpm` para indicar “próximo compasso”.

## Escritores preservados fora do fluxo do transporte

Importação de configurações, carregamento de memória, restauração de ajustes e seleção de músicas continuam usando os mesmos adaptadores e propriedades globais. Nenhum formato persistido foi alterado.

## Risco de dependência circular

O módulo não importa scheduler, fronteiras, bateria, sequência, áudio ou interface. O núcleo cria o controlador e injeta callbacks mínimos. Assim, o fluxo é `estado → controlador de BPM → adaptador legado`, sem retorno estrutural do módulo para os demais componentes. A extração não acrescenta dependência circular.

## Fora do escopo

Não foram corrigidos Valsa, mudanças de compasso, sincronização, atrasos, contadores, transições, padrões, metrônomo ou possíveis imperfeições legadas.
