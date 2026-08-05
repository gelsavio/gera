# Inventário da persistência — Etapa 7C

Data: **4 de agosto de 2026**

## Chaves migradas

| Chave literal | Formato legado | Leitura ausente ou inválida | Escrita | Consumidores |
| --- | --- | --- | --- | --- |
| `tecladoVirtualSongs` | JSON `{songs,lastSong}` | `null` na API; catálogo em memória permanece no estado já inicializado | mesmo objeto JSON | biblioteca, salvar, substituir, excluir, importar e selecionar música |
| `geraSongListsV1` | JSON `{version:1,lists}` | `null` na API; listas permanecem vazias | mesmo objeto JSON | biblioteca de listas, editor, poda e modo compacto |
| `geraPlaylistSettingsV1` | JSON com `activeListId`, `currentIndex`, `transitionMode`, `nextStartMode` e `endMode` | `null` na API; consumidores mantêm os padrões legados | mesmo objeto JSON | seleção e progressão do modo compacto |

## Contrato preservado

- Nenhuma chave foi renomeada.
- Os objetos não são normalizados, convertidos ou regravados durante a leitura.
- JSON vazio, ausente, inválido ou inacessível conserva o fallback legado.
- O catálogo mantém o campo `lastSong` na gravação, embora a inicialização legada continue definindo `currentSongName` como `null`.
- A ordem de `songNames` nas listas é preservada.
- A gravação das preferências da lista só é tentada depois do sucesso da gravação de `geraSongListsV1`, como na rotina anterior.
- Falhas de leitura, serialização ou escrita permanecem silenciosas.
- Objetos internos de músicas, inclusive sequências, configurações, textos, bateria incorporada e BPM, atravessam a API sem interpretação.

## Grupos não migrados

- Memórias `tecladoVirtualMemory*`.
- Sequências `tecladoVirtualSongSections` e chave legada `tecladoVirtualChordSequence`.
- Padrões personalizados `geraDrumPatternLibraryV1`.
- Backup e restauração.

## Arquivos funcionais alterados

- `index.html`
- `js/storage.js`
- `manifest.json`
- `sw.js`

Os demais arquivos funcionais permanecem byte a byte iguais à versão 3.15.16.
