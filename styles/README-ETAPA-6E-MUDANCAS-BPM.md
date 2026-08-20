# GERA v3.15.08 — Etapa 6E — Mudanças de BPM

Data: 4 de agosto de 2026

## Escopo executado

Foi centralizada exclusivamente a aplicação das mudanças de BPM do transporte mestre em `js/transport/tempo.js`. O módulo usa diretamente o objeto canônico `GeraState.tempo`, criado em `js/state.js`, e não mantém cópias próprias de `bpm`, `transportTempoBpm` ou `pendingBpm`.

A interface, os limites de entrada, a normalização, a persistência, o scheduler, as fronteiras, a bateria, a sequência de acordes, as trocas entre sequências, os cálculos musicais e o metrônomo permaneceram nas áreas anteriores.

## Comportamento preservado

- com o transporte parado, o BPM selecionado e o efetivo são alterados imediatamente;
- com o transporte ativo, a alteração é armazenada em `pendingBpm`;
- pedir novamente o BPM selecionado cancela a alteração pendente;
- várias alterações antes da aplicação preservam o último pedido, conforme o comportamento legado;
- somente o pulso `step === 0` consome `pendingBpm`;
- durante o agendamento do passo zero, `transportTempoBpm` recebe o novo valor imediatamente;
- `bpm`, o campo visual e o status da bateria somente são atualizados pelo callback temporizado no instante de áudio da fronteira;
- o atraso continua sendo `Math.max(0, (when - audioCtx.currentTime) * 1000)`;
- uma parada com BPM ainda pendente aplica esse valor imediatamente, como na versão anterior;
- um novo início sincroniza `transportTempoBpm` com `bpm` e elimina pendência anterior.

## Áreas não alteradas

Não foram alterados Valsa, relógio, duração do passo, quantidade de passos, lookahead, polling, cálculo de fronteiras, padrões de bateria, samples, timbres, envelopes, sequência, duração dos itens, transições, DOM, aparência, painel compacto, contadores ou dados persistidos. O metrônomo permanece independente do transporte mestre e continua lendo `bpm` diretamente.

## PWA

A versão do aplicativo e do manifesto foi atualizada para `3.15.08`, e o cache para `gera-pwa-v3.15.08`. O único recurso novo carregado pelo navegador e acrescentado ao `PRECACHE_URLS` foi `./js/transport/tempo.js`. O evento `activate` continua removendo caches anteriores do GERA e caches legados do TECLADO VIRTUAL, preservando o cache atual e caches alheios.

## Validação

Foram aprovadas 70 verificações automatizadas, incluindo 18 testes específicos da Etapa 6E. A reversão automatizada dos pontos autorizados reconstrói `index.html`, `sw.js` e `manifest.json` da versão 3.15.07 byte a byte. Os cinco blocos JAVASCRIPT inline, os sete scripts externos, o SERVICE WORKER e o manifesto foram validados sintaticamente. Os arquivos alterados e suas dependências diretas responderam por HTTP com status 200.

Os testes de fidelidade sonora, alteração real no começo, meio e fim de um compasso, execução prolongada e comportamento em segundo plano devem ser realizados em navegadores e dispositivos reais conforme o roteiro manual.
