# Roteiro manual reproduzível — Etapa 6C — GERA v3.15.06

Data: 4 de agosto de 2026

## Preparação

Sirva a pasta por HTTP ou HTTPS. Feche outras abas do GERA. Abra as ferramentas do navegador e mantenha o CONSOLE visível para detectar erros. Instale ou atualize o PWA e confirme, após a ativação do novo SERVICE WORKER, que o aplicativo abre novamente sem rede.

Registre dispositivo, sistema operacional, navegador, versão do navegador, horário inicial e resultado de cada item. Repita todo o roteiro uma vez no computador e uma vez no tablet ou celular.

## Execução

1. Abra o GERA e não desbloqueie nem inicie o áudio. Aguarde 30 segundos. Confirme que nenhum som, transporte, contador de execução ou seleção automática começa.
2. Inicie somente o metrônomo. O metrônomo desta versão possui temporizador próprio, portanto deve funcionar sem iniciar bateria ou sequência e sem alterar os passos do transporte mestre. Pare o metrônomo.
3. Inicie somente a bateria ou uma sequência que use o transporte mestre. Confirme que o primeiro evento ocorre no mesmo ponto observado na versão 3.15.05.
4. Mantenha a execução contínua por pelo menos três minutos. Observe falhas audíveis, duplicação de batidas, saltos, aceleração progressiva ou interrupções.
5. Pause pelo controle já existente e aguarde 10 segundos. Retome e confirme o comportamento legado, sem um segundo fluxo sobreposto.
6. Pare completamente. Aguarde 10 segundos e inicie novamente. Repita o ciclo de parar e iniciar cinco vezes.
7. Durante uma execução, alterne para outra aba por 30 segundos e retorne. Repita com a tela bloqueada ou o aplicativo em segundo plano, quando o sistema permitir. Registre a política real do navegador sem interpretar eventual limitação como correção desta etapa.
8. Execute várias inicializações pelos controles normais: clique repetidamente no mesmo comando de início e alterne entre iniciar, pausar, retomar e parar. Confirme auditivamente que não aparecem duas batidas ou dois avanços para o mesmo passo.
9. No painel PERFORMANCE das ferramentas do navegador, grave cerca de 10 segundos durante a execução. Confirme que existe uma única cadeia recorrente do scheduler, com novo timer derivado do anterior, e não duas cadeias paralelas de 25 ms.
10. Pare tudo e aguarde 30 segundos. Confirme que não surgem pulsos tardios, sons, avanços de sequência ou reativações espontâneas.

## Segundo plano

Repita os itens 3 a 10 mantendo a aba ativa por um ciclo e em segundo plano por outro. Como navegadores reduzem temporizadores em segundo plano, compare apenas com o comportamento da versão 3.15.05 no mesmo dispositivo e navegador. Esta etapa não autoriza correção de retomada, atraso ou sincronização.

## Critério de aprovação

A versão é aprovada quando não inicia automaticamente, mantém uma única cadeia de timer, não duplica pulsos após várias inicializações, conserva os momentos de pausa, retomada, parada e reinício da versão anterior e não apresenta erros no CONSOLE. Qualquer divergência deve ser registrada com dispositivo, navegador, horário, ação imediatamente anterior e, se possível, gravação de tela ou PERFORMANCE.
