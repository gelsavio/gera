# GERA v3.15.15 — Etapa 7A: preferências e tema

Data: **4 de agosto de 2026**

Esta versão inicia a Etapa 7 de forma incremental. O acesso às preferências visuais simples foi centralizado em `js/storage.js`, preservando as chaves, os tipos e os valores gravados pelas versões anteriores.

Foram migradas somente as chaves `geraTheme`, `geraRedesignTab`, `geraGlobalMutePositionV1` e `geraRedesignRailCollapsed`. O tema continua sendo lido no `head`, antes da folha de estilos. A posição do botão de áudio continua no mesmo JSON `{left, top}`. A aba e o estado do trilho continuam armazenados como strings.

Não foram migradas configurações musicais, memórias, músicas, listas, sequências, biblioteca de padrões personalizados de bateria, backup ou restauração. Nenhum dado existente é convertido, renomeado, copiado ou apagado.

O SERVICE WORKER usa o cache `gera-pwa-v3.15.15` e inclui `js/storage.js` no pré-cache. A exclusão de caches antigos não afeta `localStorage`.

Os testes automatizados e o roteiro manual estão em `tests/` e `referencia/`.
