# GERA v3.15.42 — correção das repetições do roteiro

Versão de 16 de agosto de 2026.

## Problema corrigido

Quando a Estrutura geral da música estava ativa, a regra legada de AUTO FIM ainda podia reconhecer a última letra presente no roteiro como o final da música. Em um roteiro `A–B ×2`, com `B ×2`, essa regra preparava o encerramento ao concluir a segunda passagem interna de B no primeiro ciclo e impedia o retorno a A para o segundo ciclo do bloco.

## Comportamento atual

Durante um roteiro ativo, somente o roteiro decide quando avançar, repetir ou encerrar. AUTO FIM e o encerramento automático legado ficam isolados até o roteiro terminar.

O caso `A–B ×2`, com `A ×1` e `B ×2`, passa a executar:

`A → B → B → A → B → B → parar`

AUTO LOOP, quando ativado, continua apenas definindo que o roteiro completo deve voltar ao início depois da última execução.

## Validação

Foram adicionados testes para impedir a interferência de AUTO FIM durante o roteiro e para validar a expansão completa de `A–B ×2` com a repetição interna de B.
