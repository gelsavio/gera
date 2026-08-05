# Resultados dos testes — Etapa 6F

Data: 4 de agosto de 2026.

Comando principal: `node --test tests/*.test.js`.

Foram aprovadas 87 verificações automatizadas, incluindo 16 testes específicos de `drum-sync.js` e todas as verificações herdadas aplicáveis. Foram confirmados entrada somente no passo zero, preservação literal de `step` e `when`, primeiro evento no passo zero, ausência de duplicação, janela de silêncio das sobreposições, bloqueio do passo zero na parada alinhada, virada, encerramento, ciclos de 16 passos, independência de padrões e motor sonoro, ordem de carregamento, pré-cache e reconstrução byte a byte do `index.html` da versão 3.15.08.

Os arquivos JAVASCRIPT externos e os blocos inline foram submetidos à verificação sintática. Manifesto e SERVICE WORKER foram analisados. A simulação do evento `activate` confirmou a exclusão dos caches antigos do GERA e a preservação do cache `gera-pwa-v3.15.09` e de caches alheios.

Os testes sonoros, de segundo plano, offline integral e em dispositivos reais permanecem pendentes e estão descritos no roteiro manual. A pasta de samples já estava ausente no pacote-base 3.15.08 e não foi reconstruída nesta subetapa.
