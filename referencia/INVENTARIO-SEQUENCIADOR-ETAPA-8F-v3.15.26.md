# Inventário do sequenciador — Etapa 8F — v3.15.26

Data: 5 de agosto de 2026.

## Superfícies incluídas

- Barra principal `#sequence-panel` e comando `#sequence-toggle`.
- Dezesseis seções A–P em `[data-sequence-section]`.
- Controles de repetição em `[data-repeat-adjust]` e `[data-section-repeat-display]`.
- Comandos `#sequence-play`, `#sequence-hold-loop`, `#sequence-stop-drums`, `#sequence-auto` e `#sequence-auto-end`.
- Pausa `#sequence-rest`, exclusão do último item e limpeza integral da seção.
- Configuração por seção de instrumento, próxima sequência, padrão, entrada, saída e final da bateria.
- Editor de item `#sequence-editor-dialog`.
- Organizador `#sequence-organize-dialog`.
- Editor redesenhado de gravação `#sequence-record-dialog`, inclusive seções, frações, pausa, prévia, desfazer, limpeza, conclusão e cancelamento.

## Responsabilidades transferidas

- Ligação dos eventos de clique, mudança, fechamento, cancelamento e ponteiro.
- Encaminhamento dos comandos do sequenciador às rotinas existentes do núcleo.
- Estados visuais de seção ativa, próxima seção em fila e presença de conteúdo.
- Estados visuais de reprodução, bateria, gravação, loop, AUTO e AUTO FIM.
- Textos, títulos, classes e atributos ARIA dos controles principais.
- Atualização dos valores exibidos de repetição e da visibilidade da barra.

## Responsabilidades preservadas no núcleo

- Estruturas A–P, acordes, notas, pausas, oitavas, instrumentos e durações.
- Regras de repetição, AUTO, AUTO FIM, próxima sequência e fila manual.
- Transporte, scheduler, fronteiras, sincronização e contadores temporais.
- Reprodução sonora, voicings, sustain, liberação, baixo automático e bateria.
- Regras de virada, meia virada, encerramento e final sem virada.
- Validações, confirmações e decisões de edição e reorganização.
- Persistência, importação, exportação e formatos JSON.
- Renderização detalhada da faixa, da linha do tempo e dos teclados do gravador.

## Paridade estrutural

- `setInterval`: 2.
- `setTimeout`: 42.
- `addEventListener`: 59.
- `requestAnimationFrame`: 2.
- Blocos JAVASCRIPT inline: 5.
- Arquivos JAVASCRIPT externos: 19.
- Entradas no pré-cache: 45, todas únicas.
