# Resultados dos testes — Etapa 8F — v3.15.26

Data: 5 de agosto de 2026.

## Resultado automatizado

- 230 testes executados.
- 230 testes aprovados.
- Nenhuma falha, cancelamento, teste ignorado ou pendência.
- Reversão exclusiva para v3.15.25 aprovada byte a byte.

## Auditoria estrutural

- Cinco blocos JAVASCRIPT inline sintaticamente válidos.
- Dezenove arquivos JAVASCRIPT externos sintaticamente válidos.
- `manifest.json` válido e na versão 3.15.26.
- SERVICE WORKER com 45 entradas únicas no pré-cache.
- `js/ui/sequencer.js` presente exatamente uma vez no HTML e no pré-cache.
- `index.html`, `js/ui/sequencer.js`, `sw.js` e `manifest.json` responderam com HTTP 200.
- Contagens de timers, listeners e animações idênticas à versão 3.15.25.

## Limites da validação

Não foram realizados testes auditivos, multitoque em hardware, instalação offline completa ou testes em computador, tablet e celular. A pasta de samples já estava ausente na base 3.15.25.
