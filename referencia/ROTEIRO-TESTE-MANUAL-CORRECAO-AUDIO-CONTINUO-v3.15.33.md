# Roteiro manual — correção do áudio contínuo v3.15.33

Data: 10 de agosto de 2026.

Antes do teste, confirme visualmente a versão 3.15.33. Se ainda aparecer 3.15.32, feche todas as abas do GERA, abra novamente e recarregue para que o novo SERVICE WORKER substitua o cache anterior.

## Teste principal

1. Liberar o áudio geral.
2. Abrir uma música que possua sequências e baixo automático.
3. Iniciar Música + Bateria.
4. Deixar tocar por pelo menos duas sequências ou por aproximadamente 30 segundos.
5. Acionar a parada normal e aguardar o limite musical previsto.
6. Confirmar que nenhum som grave, ruído, oscilador ou sopro permanece.
7. Repetir usando o botão Silenciar para a parada imediata.
8. Bloquear e liberar novamente o áudio geral; confirmar que nenhum som antigo retorna.

## Troca de música

1. Iniciar uma música com acompanhamento e baixo.
2. Trocar para outra música durante a execução.
3. Confirmar que as fontes da música anterior são encerradas conforme a regra de transição.
4. Parar a nova música e confirmar silêncio integral.

## Testar 1x

1. Abrir o Modal de Edição de Sequência.
2. Executar Testar 1x em uma sequência com acordes de oitavas diferentes.
3. Confirmar que o destaque do item avança sem erro no console.
4. Confirmar que a prévia termina depois de uma passagem e o botão volta a exibir Testar 1x.
5. Confirmar a ausência de `renderSequenceRecordExisting is not defined`.

## Liberação e console

1. Testar os modos de sustain Enquanto pressionado, Até soltar e Até a próxima tecla/acorde.
2. Alterar o tempo de Liberação entre os extremos permitidos.
3. Tocar acordes, notas, baixo, flauta e órgão; parar em seguida.
4. Confirmar que não aparece `exponentialRampToValueAtTime` com valor `non-finite`.
5. Confirmar que Parar, Silenciar e troca de música sempre eliminam as fontes remanescentes.

Registrar instrumento, sustain, valor de Liberação, música, sequência e ação imediatamente anterior caso qualquer ruído reapareça.
