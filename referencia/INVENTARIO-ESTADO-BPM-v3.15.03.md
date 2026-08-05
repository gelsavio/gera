# Inventário do estado compartilhado de BPM — GERA v3.15.03

## Escopo desta subdivisão

Esta versão centraliza somente o armazenamento dos três valores relacionados
ao andamento. Nenhuma função de execução, normalização, transporte, bateria,
sequenciamento, áudio ou interface foi transferida.

| Estado | Valor inicial | Significado |
| --- | ---: | --- |
| `bpm` | 100 | Andamento selecionado e exibido pelo aplicativo |
| `transportTempoBpm` | 100 | Andamento efetivamente usado pelo relógio durante o agendamento |
| `pendingBpm` | `null` | Novo andamento aguardando aplicação na fronteira segura |

Os três valores residem exclusivamente em `GeraState.tempo`, definido por
`js/state.js`. Os nomes globais antigos continuam disponíveis como
propriedades de acesso e apontam diretamente para essa fonte. Portanto, o
código legado não conserva uma segunda cópia.

## Leitores

### `bpm`

- Interface e mensagens: `updateBpmDisplay`, `applyPendingBpmAtBoundary`,
  `updateDrumPanel`, `syncSettingsUI`, `syncRedesignState`,
  painel compacto, diálogo e lista de músicas.
- Metrônomo: `scheduleMetronomePulse` e alternância do metrônomo.
- Cálculos musicais e temporais: duração de compasso, acompanhamento,
  pré-escuta da sequência, duração de notas, reggae e textos temporizados.
- Persistência e intercâmbio: snapshots de sequência, exportação, importação,
  músicas salvas e memórias de ajustes.
- Transporte: inicialização e solicitação de troca de BPM.

### `transportTempoBpm`

- `transportScheduler`, para calcular a duração de cada passo do relógio.
- Aplicação de mudanças quantizadas na fronteira do transporte.

### `pendingBpm`

- `refreshBpmDisplay`, para indicar alteração aguardando o próximo compasso.
- `requestBpmChange`, para decidir entre mudança imediata ou agendada.
- `transportScheduler`, para programar a aplicação na fronteira segura.
- Inicialização e encerramento do transporte, para limpar o valor pendente.

## Modificadores

### `bpm`

- `requestBpmChange`: aplica mudança imediata quando o transporte não exige
  espera.
- `applyPendingBpmAtBoundary`: aplica andamento normalizado e sincroniza a
  interface.
- Importação e carregamento de dados: restaura o BPM salvo.
- `applySettings`: aplica o BPM de uma memória de ajustes.

### `transportTempoBpm`

- `requestBpmChange` e `applyPendingBpmAtBoundary`: sincronizam o relógio
  em mudança imediata ou já programada.
- `ensureMasterTransport`: captura o BPM vigente ao iniciar o transporte.
- `transportScheduler`: aplica o BPM pendente no limite previsto.
- `stopMasterTransport`: retorna ao BPM selecionado.

### `pendingBpm`

- `requestBpmChange`: registra ou cancela uma alteração pendente.
- `applyPendingBpmAtBoundary`: limpa a alteração já aplicada.
- `ensureMasterTransport`: inicia o transporte sem pendência anterior.
- `transportScheduler`: consome e limpa a pendência ao programá-la.

## Dependências preservadas

`js/state.js` é carregado como script clássico depois de `js/chords.js` e
antes do bloco principal legado. Isso preserva a visibilidade dos três nomes
globais para os blocos tardios de interface. Nenhum ES Module foi introduzido.

As funções continuam responsáveis por validar e normalizar valores. O módulo
de estado não converte, limita, agenda nem emite eventos, evitando mudança
funcional nesta etapa.

## Estados ainda não extraídos

Padrão e camadas de bateria, sequência ativa, transporte além dos valores de
andamento, instrumento, configurações de áudio, configurações musicais e
estado visual permanecem integralmente no monólito. Eles devem ser
centralizados em versões independentes, após validação desta entrega.
