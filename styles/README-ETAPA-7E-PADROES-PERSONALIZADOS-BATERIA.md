# GERA v3.15.19 — Etapa 7E

Concluída em 4 de agosto de 2026.

Esta versão centraliza em `js/storage.js` somente o acesso à biblioteca global de padrões de bateria persistida na chave `geraDrumPatternLibraryV1`.

O formato legado `{version, patterns}`, a normalização realizada pelo núcleo, a restauração dos padrões incorporados e a gravação ao fim do carregamento permanecem inalterados. A bateria incorporada às sequências, as memórias de ajustes, a exportação, a importação, o backup e a restauração não foram migrados nesta etapa.

Validação automatizada:

```bash
node --test tests/*.test.js
```

