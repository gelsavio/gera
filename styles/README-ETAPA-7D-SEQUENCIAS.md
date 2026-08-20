# GERA v3.15.18 — Etapa 7D: sequências

Concluída em **4 de agosto de 2026**.

Esta versão centraliza em `js/storage.js` somente a persistência das sequências. A chave principal `tecladoVirtualSongSections` e a chave de compatibilidade `tecladoVirtualChordSequence` conservam os nomes, os formatos JSON, os fallbacks e os momentos de leitura, gravação e remoção da versão 3.15.17.

Os objetos de bateria incorporados às seções atravessam a camada de armazenamento sem interpretação. A biblioteca global de padrões personalizados, as memórias completas, o backup e a restauração permanecem no núcleo legado.

O SERVICE WORKER usa o cache `gera-pwa-v3.15.18`. Nenhum novo recurso foi acrescentado ao pré-cache, pois `js/storage.js` já integrava o pacote desde a Etapa 7A.
