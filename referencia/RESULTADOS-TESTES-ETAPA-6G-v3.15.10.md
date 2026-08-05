# Resultados dos testes — Etapa 6G

Data da execução: 4 de agosto de 2026.

## Resultado geral

Foram aprovadas 103 de 103 verificações automatizadas executadas por `node --test tests/*.test.js`. A suíte reúne os testes herdados das etapas anteriores e 16 testes próprios de `chord-sequence-sync.js`.

Os cinco blocos JAVASCRIPT inline do `index.html` e os nove arquivos JAVASCRIPT externos foram compilados sintaticamente por `vm.Script`, sem erro. `index.html`, `js/transport/chord-sequence-sync.js`, `sw.js` e `manifest.json` responderam por HTTP com status 200.

## Verificações específicas da sequência

Foram confirmados ausência de inicialização automática e de timers no novo módulo, entrada enfileirada somente no passo zero, preservação do instante `boundaryAudioTime`, duração de um compasso, meio compasso e ⅛, pausa sem segmento sonoro, repetição da mesma cifra por índices distintos, início em fronteira interna, acorde contínuo sem reataque, continuação no passo zero, devolução do pulso após parada, ausência de reinterpretação de oitava, inversão, instrumento, baixo, sustain e liberação, ausência de bateria, transições, DOM, áudio e persistência no módulo, ordem de carregamento e permanência das rotinas musicais no núcleo.

## Comparação com a versão validada

Os arquivos funcionais fora do escopo foram comparados byte a byte com a versão 3.15.09. `js/transport/drum-sync.js` permaneceu idêntico. O diff funcional foi aplicado de forma reversa em cópia temporária da versão 3.15.10; `index.html`, `manifest.json` e `sw.js` reconstruíram a versão 3.15.09 byte a byte, e o novo módulo foi removido pela reversão.

## Cache

O `PRECACHE_URLS` acrescentou somente `./js/transport/chord-sequence-sync.js`. A simulação do evento `activate` confirmou a exclusão dos caches 3.15.04 a 3.15.09 e do prefixo legado, preservando `gera-pwa-v3.15.10` e caches alheios ao GERA.

## Limites da validação

Não há navegador gráfico instalado no ambiente. Testes sonoros, segundo plano, computador, tablet, celular e comparação auditiva direta com a versão 3.15.09 permanecem pendentes e estão descritos no roteiro manual. A pasta `kit-acustico-selecionado`, já ausente do pacote-base 3.15.09, não foi reconstruída nesta subetapa.
