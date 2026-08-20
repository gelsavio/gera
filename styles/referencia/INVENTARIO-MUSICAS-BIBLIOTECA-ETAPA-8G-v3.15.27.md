# Inventário de músicas e biblioteca — Etapa 8G — v3.15.27

Data: 5 de agosto de 2026.

## Superfícies incluídas

- Barra da música e comandos `#songs-open`, `#song-export`, `#song-import` e `#song-import-file`.
- Biblioteca clássica `#songs-dialog`, com nome, BPM, salvamento e criação de música em branco.
- Biblioteca de listas `#song-lists-list`, criação de lista e comando de seleção para o modo compacto.
- Editor `#song-list-editor-dialog`, com associação, ordenação e exclusão de músicas.
- Biblioteca redesenhada `#redesign-song-library`, busca, carregamento, exclusão e ajuste de BPM.
- Diálogo `#song-bpm-dialog` e atalhos redesenhados para gerenciar, criar, importar e exportar.

## Responsabilidades transferidas

- Criação dos cartões, linhas, botões, textos, classes, títulos e atributos ARIA.
- Ordenação alfabética e filtragem visual pelo texto de busca recebido.
- Exibição das associações de cada música às listas.
- Renderização e interação do rascunho visual do editor de listas.
- Abertura e fechamento dos diálogos de biblioteca, lista e BPM.
- Ligação dos controles clássicos e redesenhados às funções do núcleo.
- Atualização do nome da música exibido na barra principal.

## Responsabilidades preservadas no núcleo

- Objetos `songs`, `songLists`, música atual e preferências da lista compacta.
- Criação, normalização, salvamento, carregamento e exclusão de músicas e listas.
- Persistência por `GeraStorage.musicLibrary` e preservação das chaves legadas.
- Importação, exportação, limite de arquivo e formatos portáteis JSON.
- Confirmações de substituição, exclusão e criação de música em branco.
- Aplicação de sequências, BPM, capotraste, bateria e estado musical.
- Parada do acompanhamento, transições de lista e avanço automático.

## Paridade estrutural

- `setInterval`: 2.
- `setTimeout`: 42.
- `addEventListener`: 59.
- `requestAnimationFrame`: 2.
- Blocos JAVASCRIPT inline: 5.
- Arquivos JAVASCRIPT externos: 20.
- Entradas no pré-cache: 46, todas únicas.
