# Inventário final de dependências da Etapa 6

| Arquivo | Responsabilidade | Dependências recebidas |
| --- | --- | --- |
| `js/transport/clock.js` | cálculos puros de tempo | nenhuma |
| `js/transport/scheduler.js` | ciclo de agendamento | callbacks do núcleo |
| `js/transport/boundaries.js` | descrição e emissão de fronteiras | relógio de áudio e callback do núcleo |
| `js/transport/tempo.js` | aplicação quantizada de BPM | `GeraState.tempo` e callbacks |
| `js/transport/drum-sync.js` | consumo de pulsos pela bateria | estado e callbacks injetados |
| `js/transport/chord-sequence-sync.js` | consumo de fronteiras pela sequência | estado e callbacks injetados |
| `js/transport/sequence-transitions.js` | decisão pura no fim da seção | retrato de estado |
| `js/transport/coordinator.js` | início, manutenção e parada do transporte | retrato e comandos injetados |
| `js/ui/transport-status.js` | atualização visual e contadores | retrato de estado e nós existentes |

O núcleo continua sendo o ponto de composição. Os módulos não importam uns aos outros e não formam ciclo. O fluxo permanece núcleo → módulo por callbacks e módulo → núcleo por retorno ou callback injetado.
