# Inventário da persistência — Etapa 7B

Data: **4 de agosto de 2026**

## Chave migrada

| Chave literal | Formato legado | Leitura ausente | Escrita | Consumidores |
| --- | --- | --- | --- | --- |
| `tecladoVirtualDrumEngine` | string | `null` na API e fallback `acoustic` no consumidor | string selecionada | inicialização global, restauração de memória e seletor do motor da bateria |

## Contrato preservado

- A chave não foi renomeada.
- O valor não é normalizado, convertido ou encapsulado em JSON.
- A leitura não provoca escrita.
- A seleção do usuário continua sendo gravada no evento `change`.
- Uma memória com `drumEngine` próprio continua prevalecendo sobre a configuração global.
- Uma memória sem `drumEngine` continua consultando a configuração global e depois o fallback `acoustic`.
- Falhas de acesso ao `localStorage` permanecem silenciosas.

## Grupos não migrados

- Memórias `tecladoVirtualMemory*`.
- Músicas `tecladoVirtualSongs`.
- Listas `geraSongListsV1` e `geraPlaylistSettingsV1`.
- Sequências `tecladoVirtualSongSections` e chave legada `tecladoVirtualChordSequence`.
- Padrões personalizados `geraDrumPatternLibraryV1`.
- Backup e restauração.

O inventário confirmou que as demais configurações musicais não possuem chaves globais simples independentes nesta base: elas integram objetos de memórias, músicas ou sequências e permanecem reservadas aos grupos posteriores.
