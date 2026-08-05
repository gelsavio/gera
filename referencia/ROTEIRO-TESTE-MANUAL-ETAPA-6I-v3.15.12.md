# Roteiro manual reproduzível — Etapa 6I — GERA v3.15.12

## Preparação

Execute a versão 3.15.11 e a versão 3.15.12 no mesmo navegador e dispositivo, com a mesma música importada, o mesmo BPM, o mesmo padrão de bateria e as mesmas configurações. Limpe ou separe os dados dos dois ambientes para evitar que uma versão altere o estado persistido usado pela outra.

## Abertura

Abra o GERA sem desbloquear o áudio. Confirme que nenhum som, transporte, bateria ou sequência começa automaticamente e que a interface permanece visualmente idêntica.

## Repetição contínua e loop

Execute uma seção sem `AUTO`, `AUTO FIM`, `proxima` ou escolha manual enfileirada. Confirme a repetição contínua. Ative `Pôr em Loop`, aguarde pelo menos três execuções e depois libere a progressão. Confirme que o loop prevalece enquanto ativo e que a liberação conserva o comportamento da versão anterior.

## Escolha manual

Configure uma seção para duas ou três repetições, inicie-a e escolha outra seção durante a execução. Confirme que a nova seção fica enfileirada, que a atual completa exatamente a quantidade prevista e que a entrada ocorre somente ao término da execução atual. Repita cancelando a escolha e escolhendo outra seção antes da troca.

## Campo `proxima`

Teste uma seção com `proxima` apontando para uma seção preenchida e repetições iguais a 1, 2 e 3. Confirme a quantidade de execuções e a troca. Depois configure `proxima` como `stop` e confirme a parada no mesmo ponto da versão 3.15.11. Teste também um destino vazio e preserve o comportamento observado na versão anterior, mesmo que pareça imperfeito.

## AUTO e AUTO FIM

Configure ao menos quatro seções, incluindo uma com repetição zero. No modo `AUTO`, confirme a ordem, a quantidade de repetições, a exclusão das seções com zero e o retorno da última para a primeira. No modo `AUTO FIM`, confirme a mesma progressão sem retorno ao início e a parada final. Repita com bateria ativa, com bateria inativa, com virada configurada e com encerramento configurado.

## Pausas e tipos de item

Repita as trocas usando seções que terminem em acorde inteiro, acorde fracionado, nota e pausa. Confirme que a duração do último item, o instante da troca, o primeiro item da nova seção, oitava, inversão, instrumento, sustain, liberação e baixo automático coincidem com a versão anterior.

## Segundo plano e reinicialização

Mantenha `AUTO` em execução por pelo menos três minutos. Alterne entre aba ativa e segundo plano, pause e retome, pare e inicie novamente e faça várias inicializações. Confirme ausência de timers duplicados, saltos de seção e entradas duplicadas.

## Dispositivos

Repita os cenários principais em computador e dispositivo móvel, preferencialmente tablet e celular, registrando navegador, versão do sistema operacional, dispositivo, música, seção, BPM, modo, resultado esperado e resultado observado.

## Critério de aprovação

A Etapa 6I é aprovada somente se as decisões, os instantes, o áudio, a bateria, as mensagens, os botões, os contadores e a aparência coincidirem com a versão 3.15.11. Não corrija divergências como parte do teste e não avance para a subetapa seguinte antes de registrá-las.
