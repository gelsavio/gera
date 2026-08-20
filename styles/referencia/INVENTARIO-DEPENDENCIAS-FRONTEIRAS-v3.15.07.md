# Inventário de dependências das fronteiras — GERA v3.15.07

Data: 4 de agosto de 2026

## Contrato extraído

| Componente | Lê | Produz | Dependências diretas |
|---|---|---|---|
| `GeraTransportBoundaries.describeStep()` | `step`, `meterSteps`, `boundaryStride` | descrição imutável do passo | nenhuma |
| `GeraTransportBoundaries.createBoundaryEmitter()` | callbacks injetados | emissor fechado `emit()` | `setTimeout` do navegador |
| `emit()` | passo, instante de áudio, medidor, stride e tempo atual | evento temporizado e descrição do passo | adaptadores do núcleo legado |
| `handleTransportBoundary()` | `step` e `boundaryAudioTime` | decisões musicais legadas | permanece integralmente no `index.html` |

## Descrição mínima do passo

| Campo | Definição preservada |
|---|---|
| `step` | índice recebido do scheduler |
| `meterSteps` | 16 em 4/4 ou 12 em 3/4, conforme o legado |
| `boundaryStride` | 2 em 4/4 ou 1 em 3/4 |
| `isBoundary` | `step % boundaryStride === 0` |
| `isBarStart` | `step === 0` |
| `isBarEnd` | `step === meterSteps - 1` |

`isBarEnd` apenas identifica o último passo. A emissão continua condicionada a `isBoundary`. Portanto, o passo 15 do 4/4 não passou a disparar um consumidor novo.

## Adaptadores do núcleo legado

| Adaptador | Origem ou destino real |
|---|---|
| `currentTime()` | lê `audioCtx.currentTime` no instante da emissão |
| `onBoundary()` | encaminha para `handleTransportBoundary(step, boundaryAudioTime)` |
| `trackEvent()` | acrescenta a referência do timer a `transportEvents` |
| `activeTransportSteps()` | permanece no núcleo e fornece `meterSteps` |
| `transportBoundaryStride()` | permanece no núcleo e fornece o stride |

## Ordem efetiva de uma fronteira

1. `GeraTransportScheduler` entrega `step` e `when` ao consumidor legado.
2. O consumidor processa BPM pendente, parada, bateria e ações exatamente na ordem anterior.
3. O núcleo calcula `meterSteps` pela função legada.
4. `transportBoundaryEmitter.emit()` descreve o passo.
5. Se o passo não for fronteira, nenhum timer ou callback é criado.
6. Se for fronteira, o atraso continua sendo a diferença entre `when` e `audioCtx.currentTime`, convertida em milissegundos e limitada ao mínimo zero.
7. A referência do `setTimeout` é inserida em `transportEvents`.
8. No instante previsto, o mesmo consumidor legado recebe os mesmos `step` e `when`.

## Estados preservados fora do módulo

`transportRunning`, `transportStep`, `transportNextTime`, `transportTimer`, `transportEvents`, `transportBar`, `transportTempoBpm`, `pendingBpm`, `accompanimentStopQueued`, `accompanimentStopEventScheduled`, todos os estados da bateria, todos os estados da sequência e todos os estados visuais permanecem nos locais anteriores.

## Ausência de dependência circular

`boundaries.js` não importa nem referencia scheduler, relógio, bateria, sequência, BPM, áudio do aplicativo, DOM ou interface. O núcleo fornece valores e callbacks ao criar o emissor. O fluxo permanece unidirecional: scheduler emite o pulso, núcleo realiza as decisões anteriores, módulo agenda a fronteira e núcleo consome o callback.

## Identificadores globais

Foi acrescentada apenas a API imutável `GeraTransportBoundaries`. Permanecem disponíveis `handleTransportBoundary`, `transportBoundaryStride`, `activeTransportSteps`, `transportEvents` e todos os identificadores globais legados das etapas anteriores.
