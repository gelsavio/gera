# GERA v3.15.30 — correção do botão Testar 1x

Correção concluída em 9 de agosto de 2026 sobre a versão auditada 3.15.29.

No Modal de Edição de Sequência, o comando **Testar 1x** passa a reproduzir a sequência atualmente aberta exatamente uma vez, sem bateria, independentemente de o modo AUTO ou AUTO FIM estar ativo e de a repetição da seção estar configurada como zero.

A reprodução normal fora da prévia continua respeitando integralmente AUTO, AUTO FIM, repetições, transições, bateria e demais regras do transporte.

O ajuste funcional limita-se à condição inicial de `playChordSequence()`. Nenhum módulo externo, padrão, timbre, dado persistido, elemento do DOM ou controle visual foi alterado.

