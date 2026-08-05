# Roteiro manual reproduzível — linha de base do transporte v3.15.04

Data: 4 de agosto de 2026

Este roteiro não valida uma alteração funcional; registra a referência observável que deverá ser repetida nas subetapas 6B a 6K. Use a mesma música, o mesmo arquivo de dados e o mesmo dispositivo antes e depois de cada futura extração. Registre navegador, sistema operacional, dispositivo e horário.

## Preparação

1. Sirva a pasta por HTTP ou HTTPS; não abra `index.html` por `file://`.
2. Abra o GERA com ferramentas de desenvolvimento e limpe apenas os logs, sem apagar dados persistidos.
3. Confirme que nenhum áudio ou transporte começa antes da primeira interação.
4. Anote o BPM, padrão, seção ativa, modo Auto/Auto Fim, duração dos itens e estado da bateria.
5. Para testes offline, instale/abra uma vez on-line com o kit acústico presente, feche todas as abas, desconecte a rede e reabra o PWA.

## Relógio e timers

1. Inicie somente a bateria em 100 BPM e deixe tocar por três minutos.
2. Pare e inicie cinco vezes; confirme ausência de duplicação de batidas.
3. Alterne a aba para segundo plano por 30 segundos e retorne.
4. Pare somente a bateria e confirme que os indicadores deixam de avançar.
5. Inicie e pare o metrônomo separadamente; confirme que ele não inicia a bateria ou a sequência.

## Fronteiras e início conjunto

1. Com tudo parado, inicie somente bateria e anote o primeiro ataque.
2. Com tudo parado, inicie somente sequência e anote o primeiro acorde.
3. Com bateria ativa, acione a sequência no início, meio e fim aparentes do compasso; confirme em qual próximo início ela entra.
4. Com sequência ativa e sem bateria, inicie bateria nos mesmos três pontos.
5. Inicie música e bateria pelo painel compacto.
6. Com bateria ativa, use “Só Música” e observe a troca/parada alinhada prevista pelo comportamento atual.

## BPM

1. Inicie em 60 BPM e solicite 180 BPM no início, meio e final do compasso.
2. Repita de 180 para 60 BPM.
3. Digite três valores diferentes antes da fronteira e registre qual prevalece.
4. Repita com bateria apenas, sequência apenas e ambos.
5. Observe simultaneamente campo BPM, status da bateria, readout superior e contador compacto.

## Sequência e trocas

1. Use itens de 1, 1/2, 1/4 e 1/8 de compasso e uma pausa.
2. Registre a ordem e o momento de cada avanço.
3. Durante A, selecione B; repita no início, meio e último item de A.
4. Solicite B e depois C antes do fim; registre qual fica em fila.
5. Cancele a seção em fila tocando nela novamente.
6. Teste loop da seção, Auto, Auto Fim e “Próxima sequência: Parar”.

## Paradas

1. Pare somente bateria enquanto a sequência toca.
2. Pare somente sequência enquanto a bateria toca.
3. Use “Parar acompanhamento” no início, meio e fim do compasso.
4. Cancele a parada pendente antes da fronteira.
5. Use o comando de parar do redesign e confirme bateria, sequência, acorde contínuo, metrônomo e vozes.

## Painel compacto e contadores

1. Abra e feche o painel sem reprodução.
2. Execute bateria, sequência e ambos; confira textos e estados dos três botões.
3. Observe contador por pelo menos duas repetições e uma troca de seção.
4. Altere BPM durante a contagem.
5. Alterne tema claro/escuro e tela larga/estreita.
6. Confirme que nenhum contador permanece ativo após a parada.

## Registro mínimo do resultado

Para cada cenário, registre: resultado esperado conforme a própria v3.15.04, resultado observado, diferença, horário aproximado, dispositivo e vídeo ou gravação de tela quando houver dúvida de sincronização.
