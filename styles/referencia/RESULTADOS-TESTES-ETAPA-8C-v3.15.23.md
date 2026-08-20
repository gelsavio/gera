# Resultados dos testes — Etapa 8C — v3.15.23

Data: 4 de agosto de 2026.

## Automação

- 200 de 200 testes aprovados;
- controlador do teclado carregado sem iniciar áudio, transporte ou temporizadores;
- linhas naturais e sustenidas renderizadas com notas, classes, oitavas e dicas preservadas;
- ponteiros independentes, soltura, limite multitoque e opções de eventos passivos validados;
- teclado físico, filtro de controles de formulário e liberação no `blur` preservados;
- ligações diretas anteriores removidas do núcleo;
- módulo carregado antes do núcleo de áudio;
- `js/ui/keyboard.js` incluído uma única vez no pré-cache;
- cinco blocos JAVASCRIPT inline e dezesseis arquivos JAVASCRIPT externos sintaticamente válidos;
- manifesto válido e pré-cache com 42 entradas sem duplicidade;
- `index.html`, `js/ui/keyboard.js`, `sw.js` e `manifest.json` responderam por HTTP com status 200;
- reversão exclusiva da 8C para 3.15.22 aprovada byte a byte;
- reversões históricas da 8A e 8B preservadas;
- contagens de temporizadores, listeners e animações inalteradas.

## Pendências manuais

Os testes visuais, sonoros, de multitoque em hardware, teclado físico real, atualização do PWA e dispositivos reais continuam pendentes. A ausência herdada da pasta de samples impede validar integralmente a bateria acústica e a instalação offline completa.
