# Inventário de persistência — Etapa 7A

Data: **4 de agosto de 2026**

## Grupo migrado

| Chave legada | Formato preservado | Leitura ausente | API em `GeraStorage.preferences` |
|---|---|---|---|
| `geraTheme` | string: `dark`, `neutral`, `light`, `ocean`, `forest` ou `violet` | `null`, convertido pelo consumidor para `neutral` | `getTheme()` e `setTheme()` |
| `geraRedesignTab` | string com o identificador da aba | `null`, convertido pelo consumidor para `acordes` | `getRedesignTab()` e `setRedesignTab()` |
| `geraGlobalMutePositionV1` | JSON `{left, top}` | `null`, mantendo a posição visual padrão | `getGlobalMutePosition()` e `setGlobalMutePosition()` |
| `geraRedesignRailCollapsed` | string `1` ou `0` | `null`, mantendo a regra responsiva legada | `getRedesignRailCollapsed()` e `setRedesignRailCollapsed()` |

O módulo não valida nem normaliza valores existentes. A normalização visual permanece no mesmo consumidor legado. As falhas de acesso continuam silenciosas.

## Grupos deliberadamente não migrados

| Grupo | Chaves ou famílias preservadas no núcleo |
|---|---|
| Configurações musicais | `tecladoVirtualDrumEngine` e `tecladoVirtualMemory1` a `tecladoVirtualMemory6` |
| Músicas e listas | `tecladoVirtualSongs`, `geraSongListsV1` e `geraPlaylistSettingsV1` |
| Sequências | `tecladoVirtualSongSections` e fallback `tecladoVirtualChordSequence` |
| Padrões personalizados de bateria | `geraDrumPatternLibraryV1` |
| Backup e restauração | fluxos de exportação, importação e recuperação existentes |

Não foi criada chave nova de dados, versão de esquema, migração destrutiva, cópia paralela nem remoção de item.
