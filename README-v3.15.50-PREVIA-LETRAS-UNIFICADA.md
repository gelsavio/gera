# GERA v3.15.50 — Execução unificada no editor de letras

Versão concluída em 19 de agosto de 2026.

## Problema corrigido

O botão **Executar sequência**, no modal **Letras da sequência**, utilizava um caminho paralelo para preparar a reprodução. Embora esse caminho compartilhasse parte do motor com o botão **Testar 1x**, o estado global da prévia continuava sendo atualizado periodicamente pelo editor de gravação. Essa sobreposição permitia que a tentativa de execução das letras fosse considerada inativa e retornasse para **Pronto para executar** sem reproduzir a sequência.

## Execução unificada

Os botões **Testar 1x** e **Executar sequência** agora usam a mesma função de início de prévia. Essa função:

- valida a sequência atualmente selecionada;
- ativa o modo de execução única;
- desliga a bateria para a prévia;
- inicia o mesmo transporte e o mesmo motor de acordes;
- identifica se a execução pertence ao editor de gravação ou ao editor de letras;
- encaminha a conclusão para o modal correto.

O editor de gravação passou a atualizar e limpar somente as prévias identificadas como pertencentes a ele. Sua atualização periódica não interfere mais na execução iniciada pelo modal de letras.

O clique em **Executar sequência** continua liberando o áudio quando necessário e mantém, no próprio modal, o estado da execução e os contadores progressivos de cada item.

## Compatibilidade

Não houve alteração no formato das músicas. O formato interno permanece 27 e o formato portátil `gera-song` permanece 10.

## Validação

Foram acrescentados testes para comprovar que:

- os dois botões usam o mesmo iniciador;
- a prévia das letras ativa o transporte em modo de uma passagem;
- a atualização periódica do editor de gravação não encerra a prévia das letras;
- o áudio é liberado antes da solicitação de execução;
- o término continua retornando ao controlador correto.

Resultado: **326 testes aprovados, 0 falhas**.
