# Resultados dos testes — Etapa 6H — GERA v3.15.11

Execução realizada em 4 de agosto de 2026.

## Resultado automatizado

Comando: `node --test tests/*.test.js`

Resultado: 117 testes aprovados, nenhuma falha, nenhum cancelamento e nenhum teste ignorado.

Os 103 testes cumulativos anteriores foram preservados e 14 testes específicos do coordenador foram acrescentados. A suíte específica verifica ausência de inicialização automática, todos os dez estados que mantêm o transporte ativo, início único, ingresso do segundo consumidor sem novo scheduler, parada isolada de bateria e sequência, encerramento somente após inatividade total, ausência de timers e relógios no módulo, ordem de carregamento, preservação dos adaptadores, independência de domínio, pré-cache e reconstrução da versão anterior.

## Comparação com a base

A reversão automatizada dos pontos autorizados recompôs `index.html`, `manifest.json` e `sw.js` da versão 3.15.10 byte a byte. Todos os demais arquivos funcionais foram comparados diretamente com a base e permaneceram idênticos. O novo módulo é o único recurso funcional acrescentado.

## SERVICE WORKER

O cache vigente é `gera-pwa-v3.15.11`. Somente `./js/transport/coordinator.js` foi acrescentado ao `PRECACHE_URLS`. A simulação do evento `activate` confirmou a exclusão dos caches anteriores do GERA e do prefixo legado, preservando o cache vigente e caches alheios.

## Limites da validação

Os testes sonoros, a alternância real entre primeiro e segundo plano, o comportamento do navegador móvel e a validação em computador, celular e tablet dependem do roteiro manual. A pasta de samples continua ausente, como já estava na base 3.15.10, e não foi reconstruída nesta subetapa.
