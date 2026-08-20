# Resultados dos testes — Etapa 8B — v3.15.22

Data: 4 de agosto de 2026.

## Automação

- 193 de 193 testes aprovados;
- controlador do painel carregado sem iniciar áudio, transporte ou temporizadores;
- 22 controles associados aos mesmos comandos e valores;
- tolerância a elementos ausentes preservada;
- ligações diretas anteriores removidas do núcleo;
- módulo carregado antes do bloco de montagem;
- `js/ui/compact-panel.js` incluído uma única vez no pré-cache;
- cinco blocos JAVASCRIPT inline e quinze arquivos JAVASCRIPT externos sintaticamente válidos;
- manifesto válido e pré-cache com 40 entradas sem duplicidade;
- `index.html`, `js/ui/compact-panel.js`, `sw.js` e `manifest.json` responderam por HTTP com status 200;
- reversão exclusiva da 8B para 3.15.21 aprovada byte a byte;
- reversão histórica da 8A para 3.15.20 preservada;
- contagens de temporizadores, listeners e animações inalteradas.

## Pendências manuais

Os testes visuais, sonoros, de importação, de atualização do PWA e em dispositivos reais continuam pendentes. A ausência herdada da pasta de samples impede validar integralmente a bateria acústica e a instalação offline completa.
