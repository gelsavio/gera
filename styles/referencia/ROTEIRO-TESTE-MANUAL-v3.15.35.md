# Roteiro de teste manual — v3.15.35

1. Inicie uma música e, durante uma sequência intermediária, ligue e desligue `↻`. Confirme que a reprodução não reinicia, não para e não muda de compasso ou sequência.
2. Com AUTO LOOP desligado, execute até o final e confirme a parada após a última sequência.
3. Com AUTO LOOP ligado, execute até o final e confirme o retorno à primeira sequência.
4. Organize A, B e C com uma execução cada. Em B, configure Próxima sequência A e Retornos 3. Confirme o percurso `A → B → A → B → A → B → A → B → C`.
5. Pare e inicie novamente. Confirme que os três retornos são executados outra vez.
6. Ative AUTO LOOP e confirme que, no novo ciclo geral, o contador de retornos também recomeça.
7. Combine retorno limitado com repetição individual de B e confirme que B conclui suas repetições antes de cada retorno.
8. Combine retorno limitado com um grupo A–B e confirme que o grupo continua tendo prioridade enquanto estiver ativo.
9. Salve, recarregue e exporte a música. Confirme a preservação do número de Retornos.
10. Importe um JSON anterior, sem `proximaVezes` ou `nextCount`, e confirme o valor padrão 1.
11. Verifique o cartão Repetir conjunto em tela larga e estreita, inclusive temas neutro, claro e escuro.

