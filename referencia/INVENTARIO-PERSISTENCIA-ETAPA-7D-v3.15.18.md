# Inventário da persistência — Etapa 7D

Data: **4 de agosto de 2026**

## Chaves migradas

| Chave literal | Formato legado | Leitura ausente ou inválida | Escrita e remoção | Consumidores |
| --- | --- | --- | --- | --- |
| `tecladoVirtualSongSections` | JSON com `sections`, `active`, `loop`, `auto`, `autoEnd`, `autoV2`, `repeats`, `ordemSecoes`, `bateria`, `drumEngine` e `visible` | `null`; o consumidor consulta a chave legada | mesmo objeto JSON; remoção antes da chave legada | gravação, carregamento, edição, organização, importação e troca de música |
| `tecladoVirtualChordSequence` | JSON em vetor de itens | vetor vazio | não recebe novas gravações; removida depois da chave principal | fallback de compatibilidade para a antiga sequência única |

## Contrato preservado

- Nenhuma chave foi renomeada.
- A leitura não converte, normaliza nem regrava o conteúdo persistido.
- A normalização dos itens continua no consumidor legado, depois da leitura.
- A chave legada somente é consultada quando o objeto principal não contém `sections` utilizável.
- A gravação conserva o mesmo invólucro e a mesma ordem de propriedades.
- Falha de serialização ou escrita da sequência principal conserva a propagação do comportamento anterior.
- A limpeza tenta primeiro `tecladoVirtualSongSections`; se essa remoção falhar, não tenta a segunda, como na rotina anterior.
- A bateria incorporada em `bateria` permanece parte opaca do estado da sequência.

## Grupos não migrados

- Memórias `tecladoVirtualMemory*`.
- Padrões personalizados `geraDrumPatternLibraryV1`.
- Backup e restauração.

## Arquivos funcionais alterados

- `index.html`
- `js/storage.js`
- `manifest.json`
- `sw.js`

Os demais arquivos funcionais permanecem byte a byte iguais à versão 3.15.17.
