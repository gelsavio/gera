# GERA v3.15.17 — Etapa 7C: músicas e listas

Data: **4 de agosto de 2026**

Esta versão dá continuidade à migração incremental da persistência. Foram centralizados em `js/storage.js` somente os acessos às músicas salvas, às listas de músicas e às preferências de reprodução das listas.

As chaves `tecladoVirtualSongs`, `geraSongListsV1` e `geraPlaylistSettingsV1` continuam usando os mesmos nomes e os mesmos formatos JSON. Dados existentes são lidos sem conversão, cópia, renomeação ou regravação automática. O campo de sequência eventualmente contido no objeto de uma música é preservado como dado opaco da música; a persistência própria das sequências não foi migrada nesta etapa.

Sequências globais, padrões personalizados de bateria, memórias de ajustes, backup e restauração permaneceram no núcleo legado.

O SERVICE WORKER usa o cache `gera-pwa-v3.15.17`. Nenhum novo recurso foi acrescentado ao pré-cache, pois `js/storage.js` já integrava o pacote desde a Etapa 7A.

Os testes automatizados e o roteiro manual estão em `tests/` e `referencia/`.
