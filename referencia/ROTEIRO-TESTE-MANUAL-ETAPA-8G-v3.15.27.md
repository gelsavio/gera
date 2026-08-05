# Roteiro de teste manual — Etapa 8G — v3.15.27

Data: 5 de agosto de 2026.

## Biblioteca clássica

1. Abrir a biblioteca pela barra de sequências e pelo painel compacto e confirmar nome e BPM da música atual.
2. Salvar uma música nova, recarregá-la e confirmar sequências, repetições, bateria, ordem, capotraste e BPM.
3. Tentar salvar sem nome e confirmar a mensagem; depois tentar substituir uma música existente e testar Cancelar e Confirmar.
4. Criar uma música em branco, cancelar a confirmação e repetir confirmando a limpeza das seções A–P.
5. Excluir uma música, cancelar a confirmação e repetir confirmando a exclusão e a atualização do nome exibido.

## Listas e editor

1. Criar uma lista, confirmar abertura automática do editor e testar nome vazio.
2. Marcar e desmarcar músicas, mover cada item para cima e para baixo e remover itens do rascunho.
3. Salvar a lista, reabri-la e confirmar nome, associação e ordem.
4. Usar a lista no modo compacto e confirmar posição atual, próxima música e navegação anterior e seguinte.
5. Excluir uma lista e confirmar que as músicas associadas permanecem na biblioteca.
6. Excluir uma música presente em várias listas e confirmar a remoção apenas das referências inválidas.

## Biblioteca redesenhada

1. Abrir a aba Músicas e confirmar cartões, destaque da música atual, BPM e seção inicial.
2. Pesquisar por nome completo e parcial, inclusive com nenhuma correspondência.
3. Carregar uma música por seu cartão e confirmar a atualização da linha do tempo e dos indicadores.
4. Abrir o diálogo de BPM, testar valor inválido, limites 40 e 220, botão Salvar, tecla Enter e Cancelar.
5. Usar os atalhos Gerenciar, Nova, Importar e Exportar e confirmar equivalência com a biblioteca clássica.

## Importação, exportação e integração

1. Exportar uma música com conteúdo e confirmar nome do arquivo, JSON e ritmos incorporados.
2. Tentar exportar uma música vazia e confirmar o bloqueio.
3. Importar arquivos `gera-song` e `teclado-virtual-song`, inclusive com nome já existente.
4. Testar JSON inválido, arquivo incompatível e arquivo superior a 5 MB.
5. Confirmar que um espaço musical com conteúdo é preservado como rascunho antes da importação.
6. Recarregar o aplicativo e confirmar músicas, listas, associações e preferências da lista compacta.
7. Repetir em computador, tablet e celular e verificar abertura, rolagem, foco, botões e diálogos.
8. Instalar e abrir o PWA offline após a restauração dos samples na Etapa 13.
