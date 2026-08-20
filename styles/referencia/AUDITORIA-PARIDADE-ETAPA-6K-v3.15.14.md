# Auditoria de paridade da Etapa 6 — GERA v3.15.14

## Escopo e bases comparadas

A versão modularizada 3.15.14 foi comparada com a versão 3.15.04, última base validada anterior às extrações do transporte. Para confirmar que a auditoria não introduziu mudança funcional, a versão 3.15.14 também foi comparada byte a byte com a versão 3.15.13, desconsiderando somente os três textos de versão, a versão do manifesto e o nome do cache.

## Resultado

Nenhuma divergência funcional foi detectada pelas verificações automatizadas e estáticas. Nenhuma correção ou refatoração adicional foi realizada.

| Área | Resultado da auditoria |
| --- | --- |
| Relógio | duração do passo, compassos de 12/16 passos e atraso inicial de 80 ms preservados |
| Scheduler | uma cadeia ativa, lookahead de 120 ms e polling de 25 ms preservados |
| Fronteiras | um emissor, um cálculo ativo de fronteira e um incremento de compasso |
| BPM | `bpm`, `transportTempoBpm` e `pendingBpm` permanecem em `js/state.js` |
| Bateria | um consumidor dos pulsos, sem scheduler próprio concorrente |
| Sequência | um consumidor das fronteiras, sem relógio próprio concorrente |
| Coordenação | um ponto de início, um ponto de parada e prevenção de scheduler duplicado |
| Trocas | um planejador; efeitos e ponto musical permanecem no núcleo |
| Painel | um consumidor visual; intervalo de 250 ms preservado |
| Dependências | nenhuma importação entre módulos extraídos e nenhum ciclo detectado |

## Timers e listeners

As contagens globais da versão 3.15.14 coincidem com as da versão 3.15.04: dois `setInterval`, quarenta e dois `setTimeout`, cinquenta e nove `addEventListener` e dois `requestAnimationFrame`. Os identificadores `drumTimer` e `sequenceTimer` permanecem apenas como compatibilidade legada, sem cadeias próprias de `setTimeout`. O scheduler mestre possui um único rearmamento em 25 ms.

## Fontes de estado

Não foram detectadas declarações concorrentes de `bpm`, `transportTempoBpm` ou `pendingBpm` fora de `js/state.js`. Os estados de transporte, bateria, sequência, seção atual, próxima seção e transição pendente continuam administrados pelo núcleo legado e apenas fotografados pelos adaptadores.

## Cálculos de fronteira

O único teste ativo de fronteira está em `js/transport/boundaries.js`. As funções puras `nextBoundaryOffsetSeconds` e `nextBoundaryTimeSeconds`, mantidas em `clock.js`, não são chamadas pelo caminho de execução e, portanto, não concorrem com o emissor. `transportBar` é incrementado em um único ponto.

## Limites da conclusão

As verificações provam paridade estrutural, contratos isolados e equivalência das rotinas testadas. Não substituem audição, observação de transições reais, execução em segundo plano, mudanças de orientação, navegadores móveis ou sessões prolongadas. Qualquer divergência observada nesses testes deve ser registrada e tratada somente em nova versão autorizada, sem alteração desta auditoria.
