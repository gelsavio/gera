# GERA v3.15.03 — Etapa 4A: centralização do estado de BPM

Esta entrega centraliza exclusivamente os valores `bpm`,
`transportTempoBpm` e `pendingBpm` em `js/state.js`.

As funções que leem e modificam esses valores continuam no código legado.
Padrão de bateria, sequência ativa, demais estados de transporte, instrumento,
áudio, configurações musicais e estado visual não foram extraídos.

Consulte `referencia/INVENTARIO-ESTADO-BPM-v3.15.03.md` para o mapa de
leitores e modificadores e
`referencia/CHECKLIST-ETAPA-4A-ESTADO-BPM-v3.15.03.md` para a validação
manual antes da próxima subdivisão.
