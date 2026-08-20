# GERA v3.15.06 — Etapa 6C — Scheduler e ciclo de agendamento

Data: 4 de agosto de 2026

## Escopo executado

Foi extraído exclusivamente o mecanismo que verifica o transporte, percorre a janela de agendamento, emite pulsos com `step` e `when`, avança os índices já existentes e rearma a inspeção. O novo arquivo é `js/transport/scheduler.js`.

A função global legada `transportScheduler()` permanece no núcleo e encaminha a execução ao scheduler extraído. O consumidor `handleTransportSchedulerPulse(step, when)` conserva no `index.html` todas as decisões relacionadas a BPM pendente, parada alinhada, bateria, ações, fronteiras e sequência.

## Parâmetros preservados

- janela de lookahead: `0.12` segundo;
- ciclo de inspeção: `setTimeout(..., 25)` milissegundos;
- instante do pulso: `transportNextTime`, em segundos do `AudioContext`;
- índice inicial: `transportStep = 0`;
- avanço: um passo por pulso, módulo `meterSteps`;
- medidores recebidos do legado: 16 passos em 4/4 ou 12 passos em 3/4;
- antecipação inicial: `audioCtx.currentTime + 0.08`, ainda definida pelo legado;
- interrupção: retorno sem avanço e sem rearmamento quando o consumidor devolve `null`.

## Áreas não alteradas

Não foram extraídas ou modificadas fronteiras de compasso, mudanças de BPM, bateria, sequência de acordes, trocas entre sequências, painel compacto, contadores, metrônomo, áudio, timbres, envelopes, padrões, persistência, DOM ou aparência. O metrônomo continua com seu temporizador próprio e não consome o scheduler mestre.

## PWA

A versão do aplicativo e do manifesto foi atualizada para `3.15.06`, e o cache para `gera-pwa-v3.15.06`. O único recurso novo carregado pelo navegador e acrescentado ao `PRECACHE_URLS` foi `./js/transport/scheduler.js`. O evento `activate` continua excluindo caches anteriores com os prefixos `gera-pwa-` e `teclado-virtual-pwa-`, preservando o cache atual e caches alheios.

## Validação

A reversão automatizada dos pontos autorizados reconstrói `index.html`, `sw.js` e `manifest.json` da versão 3.15.05 byte a byte. Os demais recursos anteriormente carregados pelo navegador permanecem idênticos à base. A validação sonora, a alternância real entre primeiro e segundo plano e a política de temporizadores de navegadores móveis devem ser conferidas pelo roteiro manual antes de iniciar a subetapa seguinte.
