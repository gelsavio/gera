# Resultados dos testes automatizados — Etapa 6B — v3.15.05

Data da execução: 4 de agosto de 2026.

Foram executadas as suítes de teoria musical, estado de BPM, contexto e barramentos de áudio, inventário do transporte e cálculos puros do relógio.

A suíte específica de `clock.js` compara a normalização e os cálculos da v3.15.04 com a versão extraída para todos os BPM inteiros permitidos, de 40 a 220. Também cobre valores decimais, entradas inválidas, limites, duração da batida, duração do passo, compassos de três e quatro tempos, conversões entre BPM e tempo, conversões entre passos e segundos, fronteiras de 12 e 16 passos e valores exatamente situados sobre a fronteira.

As conversões inversas usam tolerância inferior a `1e-12` somente nas verificações de ida e volta, em razão da representação binária de números decimais do JAVASCRIPT. Nenhum arredondamento novo foi introduzido no aplicativo.

As verificações estruturais confirmam ausência de DOM, áudio e temporizadores em `clock.js`, preservação do lookahead de 120 ms, polling de 25 ms, atraso inicial de 80 ms, filas de entrada no passo zero, aplicação pendente de BPM, parada no compasso, linha textual, painel compacto e limpeza de caches antigos.

Resultado final: 39 de 39 testes aprovados, distribuídos em 6 testes de teoria musical, 4 de estado de BPM, 4 de contexto e barramentos de áudio, 14 verificações do inventário do transporte e 11 testes específicos do relógio musical.

Também foram aprovadas a análise sintática dos nove blocos inline encontrados no HTML, a análise sintática dos cinco arquivos JAVASCRIPT externos carregados pelo aplicativo e a validação do manifesto. A reconstrução automática da v3.15.04, revertendo somente a versão e os pontos autorizados da extração, produziu `index.html` e `sw.js` byte a byte idênticos à base. A simulação do evento `activate` confirmou a exclusão de caches antigos do GERA e a preservação do cache v3.15.05 e de caches alheios.

Os testes manuais, sonoros, táteis e em dispositivos reais não foram declarados como executados.
