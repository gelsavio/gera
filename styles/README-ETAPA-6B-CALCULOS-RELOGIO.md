# GERA v3.15.05 — Etapa 6B — Cálculos puros do relógio musical

Esta versão parte integralmente da versão validada v3.15.04 e executa somente a extração dos cálculos determinísticos do relógio musical para `js/transport/clock.js`.

Foram externalizados a normalização do BPM, a duração da batida em milissegundos, a duração do passo em segundos, a duração matemática do compasso, as conversões entre BPM e duração, as conversões entre passos e segundos e o cálculo matemático da próxima fronteira. O identificador global `normalizedBpm` permanece disponível para o código legado.

O adaptador `barDuration()` continua no núcleo porque ainda seleciona o número de tempos a partir do padrão de bateria e do ritmo de violão ativos. Somente a multiplicação determinística foi encaminhada ao novo arquivo. O scheduler continua no `index.html` e apenas consulta a duração pura do passo.

Não foram movidos ou alterados timers, lookahead, polling, `AudioContext.currentTime`, bateria, sequência, trocas entre sequências, eventos do DOM, painel compacto, contadores, áudio, timbres, envelopes, dados persistidos, cálculos musicais, padrões ou aparência.

O cálculo da próxima fronteira foi disponibilizado para testes e para uma extração futura, mas não foi conectado ao scheduler nesta etapa.

O cache foi atualizado para `gera-pwa-v3.15.05`. O único recurso novo carregado pelo navegador e acrescentado ao `PRECACHE_URLS` é `./js/transport/clock.js`. O evento `activate` continua removendo todos os caches anteriores com os prefixos `gera-pwa-` e `teclado-virtual-pwa-`, preservando somente o cache atual.

Para executar os testes automatizados, use NODE.JS no diretório do aplicativo:

```bash
for test_file in tests/*.test.js; do node "$test_file"; done
```

