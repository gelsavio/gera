# Inventário de dependências — Etapa 6H — GERA v3.15.11

## Contrato extraído

`GeraTransportCoordinator.createCoordinator(options)` cria um coordenador sem estado próprio persistente. Ele expõe `needed()`, `ensure()` e `stopIfIdle()`.

`needed()` lê, por callbacks injetados, os mesmos dez estados da expressão legada: bateria ativa; bateria aguardando entrada; sequência ativa; sequência aguardando entrada; acorde sustentado; acorde pendente; parada conjunta agendada; transição de sequência pendente; ação de bateria enfileirada; ação de bateria ativa.

`ensure()` preserva a ordem anterior: solicita o desbloqueio do áudio, verifica se o transporte já está ativo e, somente quando inativo, chama o início legado. O início continua zerando passo e compasso, aplicando `transportTempoController.resetForStart()`, definindo `transportNextTime` como `AudioContext.currentTime + 0.08`, limpando timers e eventos anteriores e chamando `transportScheduler()`.

`stopIfIdle()` reavalia todos os estados e chama `stopMasterTransport()` somente quando nenhum deles exige o transporte.

## Adaptadores preservados

| Identificador global | Destino na v3.15.11 | Compatibilidade |
| --- | --- | --- |
| `transportNeeded()` | `transportCoordinator.needed()` | Mesmo valor booleano da expressão anterior |
| `ensureMasterTransport()` | `transportCoordinator.ensure()` | Mesmos chamadores e mesma prevenção de inicialização duplicada |
| `maybeStopMasterTransport()` | `transportCoordinator.stopIfIdle()` | Mesmos chamadores e mesma condição de parada |
| `stopMasterTransport()` | Permanece no núcleo | Timer, eventos, estados e limpeza não foram movidos |
| `startMasterTransport()` | Permanece no núcleo | Corpo literal anteriormente contido em `ensureMasterTransport()` |

## Dependências injetadas

O coordenador recebe apenas funções de leitura e três operações: `ensureAudio`, `startTransport` e `stopTransport`. Ele não referencia `GeraTransportScheduler`, `GeraTransportDrumSync`, `GeraTransportChordSequenceSync`, `GeraTransportBoundaries`, `GeraTransportTempo` ou `GeraTransportClock`.

## Ordem de carregamento

O navegador carrega `drum-sync.js`, depois `chord-sequence-sync.js`, depois `coordinator.js` e, em seguida, `audio/core.js` e o núcleo inline. Essa ordem mantém todos os contratos clássicos globais disponíveis antes da criação das instâncias, sem ES MODULES e sem dependência circular.

## Áreas deliberadamente não extraídas

Permaneceram no núcleo o scheduler e seus timers, a emissão de fronteiras, aplicação de BPM, despacho dos pulsos, bateria, sequência, troca de seção, AUTO e AUTO FIM, viradas, encerramentos, Valsa, acompanhamento manual, parada agendada, painel compacto, contadores, DOM, WEB AUDIO API e persistência.

## Grafo acíclico

O núcleo injeta leituras e operações no coordenador. O coordenador não importa consumidores. Bateria e sequência continuam recebendo pulsos do núcleo e não chamam o coordenador concreto. Portanto, não há ciclo `coordenador → consumidor → coordenador`.
