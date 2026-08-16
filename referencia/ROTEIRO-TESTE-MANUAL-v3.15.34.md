# Roteiro de teste manual — GERA v3.15.34

## Conjunto A–B

1. Grave conteúdo em A, B e C.
2. Configure A e B com repetição individual igual a 1.
3. Em **Repetir conjunto**, selecione A, B, 3 vezes e depois C.
4. Ative **Auto Fim** e inicie por A.
5. Confirme a ordem `A → B → A → B → A → B → C`.
6. Altere a repetição individual de A para 2 e confirme `A → A → B` em cada passagem.
7. Durante a execução, acione o loop da seção e confirme que o grupo aguarda a liberação.
8. Escolha manualmente outra seção e confirme que a escolha manual prevalece.

## Métricas próprias

1. Configure A como Valsinha 3/4 e B como Sem bateria 4/4.
2. Use instrumentos diferentes em A e B.
3. Execute o conjunto e confirme que a entrada em cada seção aplica sua métrica e seu instrumento.
4. Copie B e tente **Colar ao final** de A.
5. Confirme que a colagem é bloqueada e que A não é modificada.
6. Use **Colar substituindo** em uma seção vazia e confirme que a configuração da origem é preservada.

## Salvamento automático

1. Carregue uma música nomeada.
2. Altere um acorde e confirme **Alterações não salvas**.
3. Aguarde aproximadamente 700 ms e confirme **Salvando...** e depois **Salvo**.
4. Recarregue a música e confirme a alteração.
5. Repita o teste com BPM, capotraste, repetição, instrumento, bateria e conjunto.
6. Faça outra alteração e pressione **Salvar**; confirme gravação imediata.
7. Comece uma música sem nome, altere-a e pressione **Salvar**; confirme a abertura do diálogo de nomeação.
8. Simule indisponibilidade do armazenamento e confirme **Erro ao salvar** e bloqueio da troca de música.

## Regressão

1. Teste **Testar 1x** no editor.
2. Teste AUTO, AUTO FIM, viradas, encerramento e escolha manual.
3. Teste importação e exportação de uma música com grupo ativo.
4. Teste a importação de JSON anterior, sem `sequenceGroup`.
5. Confirme que parar música, bateria e áudio encerra todas as fontes sonoras.

