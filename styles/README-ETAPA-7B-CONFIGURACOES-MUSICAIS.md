# GERA v3.15.16 — Etapa 7B: configurações musicais

Data: **4 de agosto de 2026**

Esta versão dá continuidade à migração incremental da persistência. Foi centralizado em `js/storage.js` somente o acesso à configuração musical global simples armazenada na chave `tecladoVirtualDrumEngine`.

O motor da bateria continua sendo armazenado como string. Dados existentes são lidos sem conversão, cópia, renomeação ou regravação automática. Quando a chave não existe ou não pode ser lida, o consumidor conserva o valor-padrão legado `acoustic`.

As memórias de ajustes permanecem no núcleo porque armazenam presets completos. Músicas, listas, sequências, padrões personalizados de bateria, backup e restauração também não foram migrados.

O SERVICE WORKER usa o cache `gera-pwa-v3.15.16`. Nenhum novo recurso foi acrescentado ao pré-cache, pois `js/storage.js` já integrava o pacote desde a Etapa 7A.

Os testes automatizados e o roteiro manual estão em `tests/` e `referencia/`.
