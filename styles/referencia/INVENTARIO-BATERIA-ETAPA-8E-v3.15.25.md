# Inventário da bateria — Etapa 8E — v3.15.25

Data: 5 de agosto de 2026.

## Superfícies incluídas

- Painel principal `#drum-panel`.
- Nove botões `.drum-pattern` dos ritmos incorporados.
- Camadas `kick`, `snare` e `hat` em `[data-layer]`.
- Comandos `#drum-fill`, `#drum-ending`, `#drum-stop` e `#drum-manual`.
- Oito pads `.manual-drum-pad`.
- Seletor compatível `#drum-pattern-select`, quando presente.
- Seletor `#drum-engine`.
- Botão `#metronome-toggle` e seu estado visual.
- Estado local `#drum-status`, seleção dos padrões e bloqueio de ações em 3/4.

## Responsabilidades transferidas

- Ligação dos eventos de clique, mudança e ponteiro.
- Encaminhamento dos pads manuais ao núcleo.
- Atualização visual das camadas.
- Seleção, início aguardando, início efetivo e limpeza visual dos padrões.
- Alternância visual do painel e do modo manual.
- Sincronização visual de virada e encerramento.
- Sincronização visual do metrônomo.

## Responsabilidades preservadas no núcleo

- Biblioteca e dados dos padrões.
- Normalização de eventos e compassos 3/4 e 4/4.
- Samples acústicos, síntese e reprodução dos instrumentos.
- Humanização, velocities, choke e barramentos.
- Scheduler, fronteiras, filas, transporte e sincronização com sequências.
- Regras musicais de virada e encerramento.
- Persistência e formatos portáteis.
- Editor em grade e biblioteca global de ritmos.
- Configuração de bateria por sequência.

## Paridade estrutural

- `setInterval`: 2.
- `setTimeout`: 42.
- `addEventListener`: 59.
- `requestAnimationFrame`: 2.
- Blocos JAVASCRIPT inline: 5.
- Arquivos JAVASCRIPT externos: 18.
- Entradas no pré-cache: 44, todas únicas.
