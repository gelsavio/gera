# Roteiro manual reproduzível — Etapa 6H — GERA v3.15.11

## Preparação

Abra o GERA e confirme a versão 3.15.11. Abra o console do navegador e confirme a ausência de erros. Sem iniciar bateria, sequência ou acorde sustentado, confirme que nenhum som e nenhum transporte começam automaticamente.

Use a mesma música, seção, BPM, ritmo, instrumento, modo de sustain e liberação usados na comparação com a versão 3.15.10. Registre navegador, sistema operacional, dispositivo e horário do teste.

## Bateria isolada

Inicie somente a bateria e confirme que ela aguarda a mesma fronteira da versão anterior. Mantenha por pelo menos três minutos. Pare e confirme que o transporte encerra. Repita iniciar e parar cinco vezes e confirme pelo console que não existem timers ou batidas duplicadas.

## Sequência isolada

Inicie somente a sequência e confirme entrada, compassos, subdivisões, pausas e continuidade. Mantenha por pelo menos três minutos. Pare e confirme que o transporte encerra. Repita cinco vezes e confirme ausência de duplicação.

## Coordenação entre consumidores

Inicie a bateria e, durante sua execução, inicie a sequência. Confirme que a sequência entra na mesma fronteira prevista e que a bateria não reinicia nem duplica o scheduler. Pare apenas a bateria e confirme que a sequência continua. Reinicie a bateria e confirme a espera pela fronteira vigente. Depois pare apenas a sequência e confirme que a bateria continua.

Repita na ordem inversa: sequência primeiro, bateria depois. Compare com a versão 3.15.10 e registre qualquer diferença de início, primeiro bumbo, troca de acorde ou parada.

## Estados que mantêm o transporte ativo

Teste acompanhamento manual sustentado, acorde pendente para o próximo compasso, virada, encerramento, transição entre seções e parada conjunta no fim do compasso. Em cada cenário, confirme que o transporte não encerra enquanto o estado ainda estiver pendente e encerra quando todos os estados ficam inativos.

## Pausa, retomada e segundo plano

Durante bateria e sequência conjuntas, alterne entre aba ativa e segundo plano, pause e retome pelos controles existentes, pare e inicie novamente. Não avalie como correção eventuais imperfeições já conhecidas; compare somente a paridade com a versão 3.15.10.

## Computador e dispositivo móvel

Repita os cenários em computador e em celular ou tablet. Use fones ou volume moderado. Confirme ausência de sons sobrepostos, timers duplicados, travamentos ou início automático.

## Atualização e funcionamento offline

Com uma versão anterior instalada, carregue a 3.15.11, permita a atualização e reabra o aplicativo. Confirme a versão nova e a remoção de caches antigos. Após uma carga completa, coloque o dispositivo offline e confirme o carregamento de `coordinator.js`. A pasta de samples referenciada pelo SERVICE WORKER continua ausente do pacote-base; a validação offline integral dos samples depende da reposição externa da pasta validada.

## Critério de aprovação

A etapa é aprovada somente se todos os comportamentos coincidirem com a versão 3.15.10. Em caso de divergência, registre data, dispositivo, navegador, música, seção, BPM, estado de bateria, estado da sequência, ação realizada, resultado esperado e resultado observado. Não avance para a subetapa seguinte.
