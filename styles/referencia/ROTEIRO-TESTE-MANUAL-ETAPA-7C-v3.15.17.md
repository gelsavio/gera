# Roteiro de teste manual — Etapa 7C

Data: **4 de agosto de 2026**

Use preferencialmente uma instalação que já possua músicas e listas criadas na versão 3.15.16 ou anterior. Antes do teste destrutivo, exporte o backup pelo próprio aplicativo.

## Dados preexistentes

1. Abrir a versão 3.15.17 sem limpar os dados do navegador.
2. Confirmar que todas as músicas antigas aparecem com os mesmos nomes.
3. Abrir músicas com e sem sequência e conferir BPM, acordes, textos e bateria incorporada.
4. Confirmar que todas as listas antigas aparecem com o mesmo nome e na mesma ordem.
5. Selecionar uma lista anteriormente ativa e verificar posição, próxima música, passagem, modo de início e comportamento ao final.

## Operações com músicas

1. Criar e salvar uma música nova.
2. Substituir uma música existente e recarregar a página.
3. Renomear ou importar uma música, quando disponível no fluxo atual.
4. Excluir uma música e confirmar a poda de sua referência nas listas.
5. Fechar e reabrir o aplicativo e verificar a permanência dos dados.

## Operações com listas

1. Criar uma lista e adicionar várias músicas.
2. Alterar o nome da lista.
3. Reordenar músicas e confirmar a ordem após recarregar.
4. Remover uma música da lista sem excluir a música da biblioteca.
5. Excluir a lista e confirmar que as músicas foram preservadas.
6. Testar progressão manual e automática.
7. Testar `Aguardar` e `Iniciar` ao carregar a próxima música.
8. Testar `Parar` e `Voltar à primeira` no final da lista.

## Isolamento e compatibilidade

1. Confirmar que sequências continuam sendo salvas e carregadas como antes.
2. Confirmar que padrões personalizados de bateria continuam disponíveis.
3. Salvar e recuperar as seis memórias de ajustes.
4. Exportar e restaurar um backup completo.
5. Atualizar a instalação PWA e abrir novamente offline.
6. Verificar o funcionamento em tela larga e estreita.

## Critério de aprovação

A etapa é aprovada manualmente quando não houver perda, conversão, reordenação ou regravação inesperada de músicas e listas e quando os grupos não migrados mantiverem o comportamento da versão 3.15.16.
