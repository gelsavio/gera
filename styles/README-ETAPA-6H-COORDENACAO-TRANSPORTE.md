# GERA v3.15.11 — Etapa 6H

Concluída em 4 de agosto de 2026.

Esta subetapa centraliza exclusivamente a decisão de iniciar, manter ou encerrar o transporte mestre conforme a atividade dos consumidores já existentes. O novo arquivo `js/transport/coordinator.js` recebe estado e operações por injeção e não importa bateria, sequência, scheduler, áudio, interface ou persistência.

Os identificadores globais `transportNeeded()`, `maybeStopMasterTransport()` e `ensureMasterTransport()` permanecem disponíveis como adaptadores do código legado. O corpo de inicialização foi preservado em `startMasterTransport()`, ainda com atraso inicial de 80 ms, passo zero, contador de compasso zerado, BPM efetivo reinicializado e uma única cadeia do scheduler.

Não foram alteradas regras de sincronização, Valsa, entradas, atrasos, contadores, transições, cálculos musicais, padrões, timbres, envelopes, dados persistidos, DOM ou aparência. Bateria e sequência permanecem consumidores independentes dos mesmos pulsos extraídos nas etapas anteriores.

A versão passou a 3.15.11, o cache passou a `gera-pwa-v3.15.11` e somente `js/transport/coordinator.js` foi acrescentado ao `PRECACHE_URLS`. O evento `activate` continua removendo caches antigos do GERA e preservando o cache atual e caches alheios.

A subetapa seguinte não foi iniciada.
