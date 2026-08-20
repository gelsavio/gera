# GERA v3.15.12 — Etapa 6I

## Escopo executado

Esta subetapa extrai exclusivamente a decisão de progressão ao término de uma seção para `js/transport/sequence-transitions.js`. O módulo descreve qual ação legada deve ser aplicada: repetir a seção em loop, aguardar as repetições antes de uma escolha manual, entrar na seção manualmente enfileirada, obedecer `proxima`, obedecer `stop`, repetir ou avançar em `AUTO`, encerrar em `AUTO FIM` ou manter a repetição contínua.

## Preservação funcional

Os efeitos concretos continuam no núcleo legado. Permaneceram no `index.html` as mutações de seção e repetição, carregamento do primeiro item, mensagens, gravação, botões, configuração da bateria, viradas, encerramentos, texto sincronizado, carrossel, áudio e persistência. Não foram modificados relógio, scheduler, fronteiras, BPM, bateria, consumidor da sequência, coordenador, Valsa, cálculos musicais, timbres, envelopes, padrões, dados persistidos, DOM ou aparência.

## Integração

O novo script clássico é carregado depois de `chord-sequence-sync.js` e antes de `coordinator.js`. Não contém importações, timers, acesso ao DOM, WEB AUDIO API ou `localStorage`, evitando dependências circulares.

## Versão e PWA

A versão do aplicativo, do manifesto e do cache foi atualizada de 3.15.11 para 3.15.12. Somente `js/transport/sequence-transitions.js` foi acrescentado ao `PRECACHE_URLS`. A regra do evento `activate` continua excluindo caches anteriores do GERA e o prefixo legado.

## Limites

Esta etapa não corrige qualquer comportamento conhecido e não extrai contadores, texto sincronizado, painel compacto ou transições entre músicas da lista. A subetapa seguinte não foi iniciada.
