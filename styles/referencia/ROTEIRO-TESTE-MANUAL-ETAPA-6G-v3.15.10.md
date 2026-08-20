# Roteiro de teste manual reproduzível — Etapa 6G

Execute o roteiro em computador e dispositivo móvel, preferencialmente comparando lado a lado com a versão validada 3.15.09. Use a mesma música, BPM, instrumento, padrão de acompanhamento, sustain, liberação e volume nas duas versões. Esta é uma verificação de paridade; não corrija diferenças conhecidas.

## Preparação

Abra o GERA e confirme a versão 3.15.10. Desbloqueie o áudio, abra o console e confirme a ausência de erros. Sem iniciar bateria ou sequência, confirme que nenhum som ou transporte começa automaticamente.

Crie uma sequência de teste que contenha, nesta ordem, um acorde de um compasso, um de meio compasso, um de ¼, um de ⅛, uma pausa, duas repetições da mesma cifra, um acorde em outra oitava e outro com inversão diferente. Salve a música antes da execução.

## Durações e subdivisões

Execute somente a sequência, sem bateria. Confirme que o item de um compasso ocupa exatamente um compasso, o item de meio compasso ocupa metade, o de ¼ ocupa um quarto e o de ⅛ avança na fronteira seguinte já aceita pelo aplicativo. Confirme que a pausa ocupa sua duração e não produz acorde, nota ou baixo. Compare a posição de cada troca com a versão 3.15.09.

Repita o teste com itens que atravessam o início de um compasso. Confirme que a continuação preserva a duração restante. Em ritmo inteiro, confirme que um acorde de um compasso iniciado no meio do compasso anterior não é reatacado no passo zero seguinte.

## Conteúdo musical dos itens

Confirme que duas ocorrências consecutivas da mesma cifra são executadas como itens distintos. Teste oitavas diferentes, inversões diferentes, acorde com baixo configurado e notas isoladas. Confirme instrumento da seção, acompanhamento, voicing, baixo automático e extensão do teclado exatamente como na versão 3.15.09.

Alterne entre execução conjunta e arpejo nos itens existentes. Teste sustain enquanto pressionado e até o próximo acorde, quando aplicável ao estado salvo. Use tempos de liberação curto, intermediário e longo. Confirme que ataque, sustentação e término sonoro permanecem iguais à base validada.

## Relação com o transporte

Com tudo parado, inicie somente a sequência e confirme a entrada no ponto legado. Pare durante um acorde e confirme que a solicitação produz o mesmo encerramento e liberação da versão 3.15.09. Inicie novamente e repita por pelo menos três minutos, observando se índices, subdivisões ou pausas se deslocam.

Inicie a bateria e, durante sua execução, inicie a sequência. Confirme que a sequência aguarda a fronteira já prevista. Pare tudo. Inicie a sequência e depois inicie a bateria. Confirme o comportamento legado, sem avaliar ou alterar a coordenação que pertence à Etapa 6H.

Altere o BPM durante um acorde de um compasso e durante um item subdividido. Faça uma única alteração e depois várias antes da fronteira. Confirme que o item atual, a próxima troca e o valor aplicado permanecem alinhados com a versão 3.15.09.

## Parada, reinício e estabilidade

Solicite parada no começo, meio e fim de itens de durações diferentes. Inicie novamente após cada caso. Alterne entre aba ativa e segundo plano. Confirme que não existem acordes duplicados, reataques adicionais, entradas tardias ou timers concorrentes depois de várias inicializações.

## Preservação fora do escopo

Execute uma seção em loop, selecione manualmente outra seção, use repetição automática e teste estrofe, pré-refrão e refrão. Confirme apenas que o comportamento é idêntico ao da versão 3.15.09; as regras de troca não foram modificadas nesta subetapa. Abra e feche o painel compacto e confirme que aparência, contadores, classes, textos e botões permanecem iguais.

## Atualização e cache

Com uma versão anterior instalada, carregue a 3.15.10, permita a atualização e reabra o aplicativo. Confirme que o novo módulo responde offline após uma carga completa e que caches antigos do GERA foram removidos. A pasta de samples referenciada pelo SERVICE WORKER continua ausente deste pacote, como já estava na base 3.15.09; a validação offline integral dos samples depende da reposição externa da pasta validada.

Registre dispositivo, navegador, data, música, seção, BPM, instrumento, sustain, liberação, cenário, resultado esperado, resultado observado e eventual divergência. Interrompa a validação se houver diferença e não avance para a Etapa 6H.
