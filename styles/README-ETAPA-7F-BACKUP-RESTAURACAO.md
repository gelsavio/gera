# GERA v3.15.20 — Etapa 7F

Data: 4 de agosto de 2026  
Base: GERA v3.15.19

Esta etapa conclui a centralização da persistência em `js/storage.js`. As seis memórias de ajustes passaram a usar a API `GeraStorage.memories`, mantendo as chaves `tecladoVirtualMemory1` a `tecladoVirtualMemory6` e o mesmo JSON compacto.

Os fluxos portáteis existentes de exportação e importação de músicas e conjuntos de bateria passaram a usar `GeraStorage.backup` exclusivamente para codificar e analisar JSON. Formatos, versões, nomes de arquivo, validações, confirmações, normalização musical e aplicação do conteúdo permanecem no núcleo legado.

Não foi criado banco externo, chave de backup paralela, conversão automática nem rotina destrutiva. A versão e o cache foram atualizados para 3.15.20, sem nova entrada no pré-cache.
