# GERA v3.15.35 — fluxo e interface

Versão concluída em 15 de agosto de 2026, a partir da v3.15.34.

## AUTO LOOP

O controle `↻` passou a definir exclusivamente o comportamento ao final da música. Ligado, a última sequência retorna à primeira. Desligado, a música termina após a última sequência. A alteração pode ser feita durante a execução sem reiniciar, parar, reposicionar ou zerar os contadores atuais.

O botão `▶` permanece responsável por iniciar a música. O estado visual do `↻` representa a preferência de término mesmo quando a música está parada.

## Próxima sequência com retorno limitado

Quando a próxima sequência escolhida está antes da sequência atual na ordem da música, aparece o campo **Retornos**, de 1 a 99. O valor determina quantas vezes a transição para trás será realizada antes de a sequência seguir naturalmente para a próxima posição.

Exemplo: em B, configurar **Próxima sequência A** e **Retornos 3** produz `A → B → A → B → A → B → A → B → C`.

O contador é reiniciado ao iniciar ou parar a música e quando o AUTO LOOP completa um ciclo geral. Repetições internas, grupos, escolha manual e loop da sequência mantêm suas prioridades anteriores.

O campo `proximaVezes` é persistido no espaço de trabalho e na música. No JSON autossuficiente, o valor também é exportado como `drumSections.<seção>.nextCount`. Arquivos anteriores são aceitos com valor padrão 1.

## Repetir conjunto

O bloco foi reorganizado como cartão compacto, com ativação no cabeçalho, quatro campos em grade e resumo centralizado. Em telas estreitas, a grade passa para duas colunas.

## Compatibilidade

O formato interno da música passou para 24 e o formato `gera-song` para 7. SERVICE WORKER, manifesto e identificação visual usam a versão 3.15.35.

