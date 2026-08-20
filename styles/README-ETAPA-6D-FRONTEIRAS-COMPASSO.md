# GERA v3.15.07 — Etapa 6D — Fronteiras de compasso

Data: 4 de agosto de 2026

## Escopo executado

Foi extraída exclusivamente a identificação e a emissão temporal das fronteiras de compasso para `js/transport/boundaries.js`. O módulo descreve o passo atual, reconhece o início e o último passo do compasso e agenda somente as fronteiras que o código legado já entregava a `handleTransportBoundary(step, boundaryAudioTime)`.

O consumidor `handleTransportBoundary()` permanece integralmente no `index.html`. As decisões de BPM, parada conjunta, bateria, sequência, troca de acordes, ritmo, painel e contadores não foram movidas.

## Contrato preservado

- 4/4: 16 passos, stride 2 e emissão nos passos 0, 2, 4, 6, 8, 10, 12 e 14;
- 3/4: 12 passos, stride 1 e emissão em todos os passos de 0 a 11;
- início de compasso: `step === 0`;
- último passo: `step === meterSteps - 1`;
- atraso do callback: `Math.max(0, (when - audioCtx.currentTime) * 1000)`;
- rastreamento dos eventos: mesma coleção legada `transportEvents`;
- tolerância temporal: nenhuma tolerância ou arredondamento novo foi acrescentado.

Em 4/4, o passo 15 é descrito como último passo, mas continua sem emitir `handleTransportBoundary()`, porque o comportamento anterior emitia somente os passos divisíveis pelo stride 2. Não foi introduzido um callback adicional de fim de compasso.

## Áreas não alteradas

Não foram modificados scheduler, lookahead, polling, `transportStep`, `transportNextTime`, cálculo de BPM, mudança de BPM, bateria, sequência, trocas entre sequências, áudio, timbres, envelopes, sustain, padrões, persistência, DOM, aparência, painel compacto ou contadores.

## PWA

A versão do aplicativo e do manifesto foi atualizada para `3.15.07`, e o cache para `gera-pwa-v3.15.07`. O único recurso novo carregado pelo navegador e acrescentado ao `PRECACHE_URLS` foi `./js/transport/boundaries.js`. O evento `activate` continua removendo caches anteriores do GERA e caches legados do TECLADO VIRTUAL, preservando o cache atual e caches alheios.

## Validação

A reversão automatizada dos pontos autorizados reconstrói `index.html`, `sw.js` e `manifest.json` da versão 3.15.06 byte a byte. Os demais recursos funcionais permanecem idênticos à base. Foram aprovados 52 testes automatizados, dos quais 13 são específicos da subetapa 6D. Pausa, retomada, parada durante o compasso, execução real prolongada e políticas de temporização em segundo plano devem ser conferidas em navegador e dispositivo reais conforme o roteiro manual.
