# Inventário de persistência — Etapa 7E

Data: 4 de agosto de 2026  
Versão: 3.15.19  
Base: 3.15.18

## Grupo migrado

| Chave | Operações | Formato preservado | Consumidor |
|---|---|---|---|
| `geraDrumPatternLibraryV1` | leitura e gravação | `{version, patterns}` | biblioteca global e editor de ritmos |

`GeraStorage.drumPatterns.getLibrary()` lê o JSON existente e retorna `null` quando a chave está ausente, vazia, inválida ou inacessível. A leitura não normaliza, converte nem regrava o valor.

`GeraStorage.drumPatterns.setLibrary(value)` grava o mesmo JSON recebido. O núcleo continua fornecendo `{version:1, patterns:drumPatternLibrary}` no mesmo ponto em que a versão anterior persistia a biblioteca.

## Comportamentos preservados

- Os padrões incorporados continuam sendo reconstruídos por `originalBuiltinDrumLibrary()`.
- Um padrão incorporado salvo continua prevalecendo como candidato antes da normalização.
- Padrões personalizados continuam sendo incorporados após os padrões de fábrica.
- A propriedade `builtin` dos padrões personalizados continua sendo forçada para `false`.
- A biblioteca normalizada continua sendo salva ao fim de `loadDrumPatternLibrary()`.
- Falhas de acesso ou serialização continuam silenciosas.
- Nenhuma chave nova, cópia paralela, conversão destrutiva ou remoção foi introduzida.

## Grupos não migrados

- Memórias `tecladoVirtualMemory1` a `tecladoVirtualMemory6`.
- Exportação e importação de conjuntos de bateria.
- Backup e restauração.

A bateria associada às seções permanece no objeto de sequências já centralizado na Etapa 7D e não foi reinterpretada nesta etapa.

