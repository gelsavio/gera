# Resultados dos testes — Etapa 6E — GERA v3.15.08

Data: 4 de agosto de 2026

## Resultado automatizado

- 70 verificações executadas;
- 70 aprovadas;
- 0 falhas;
- 0 cancelamentos;
- 18 testes específicos de `tempo.js`;
- todos os testes herdados de estado, relógio, scheduler, fronteiras, áudio, teoria musical e inventário aprovados.

## Cobertura específica

Os testes confirmaram aplicação imediata com transporte parado, distinção entre BPM selecionado, efetivo e pendente, cancelamento pelo BPM selecionado, prevalência do último pedido, consumo exclusivo no passo zero, antecipação temporal de 80 ms no cenário simulado, atraso zero para fronteira vencida, ausência de evento duplicado, aplicação na parada, reinicialização do transporte, normalização legada e fonte única em `js/state.js`.

## Paridade estrutural

A reversão automática remove `tempo.js`, restaura os blocos legados autorizados, reverte a versão e reconstrói `index.html`, `sw.js` e `manifest.json` da versão 3.15.07 byte a byte. Os demais recursos funcionais comparados permanecem idênticos à base.

## Sintaxe e disponibilidade

- cinco blocos JAVASCRIPT inline válidos;
- sete scripts externos válidos;
- SERVICE WORKER válido;
- `manifest.json` válido;
- `index.html`, `tempo.js`, estado, relógio, scheduler, fronteiras, áudio, manifesto e SERVICE WORKER responderam por HTTP com status 200.

## Cache

A simulação do evento `activate` confirmou a exclusão dos caches anteriores `gera-pwa-*` e `teclado-virtual-pwa-*`, a preservação do cache atual `gera-pwa-v3.15.08` e a preservação de caches alheios.

## Testes não executados automaticamente

Fidelidade sonora, alteração no começo, meio e fim de um compasso real, políticas de temporização em segundo plano e comportamento tátil em computador, tablet e celular permanecem pendentes e devem seguir o roteiro manual reproduzível.
