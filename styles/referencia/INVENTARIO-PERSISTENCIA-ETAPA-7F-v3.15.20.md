# Inventário de persistência — Etapa 7F

Data: 4 de agosto de 2026  
Versão: 3.15.20  
Base: 3.15.19

## Memórias centralizadas

| Família | Operações | Formato preservado | Consumidor |
| --- | --- | --- | --- |
| `tecladoVirtualMemory1` a `tecladoVirtualMemory6` | leitura e gravação | JSON compacto do retorno de `settings()` | painel das seis memórias |

`GeraStorage.memories.getRaw(position)` devolve literalmente a string existente ou `null`. A análise do JSON permanece no consumidor, inclusive a mensagem legada para memória inválida.

`GeraStorage.memories.has(position)` preserva a distinção entre posição personalizada e preset de fábrica. `GeraStorage.memories.set(position,value)` mantém a serialização compacta usada anteriormente.

## Backup e restauração portáteis

`GeraStorage.backup.stringify(value)` produz o mesmo `JSON.stringify(value,null,2)` usado pelos exportadores. `GeraStorage.backup.parse(text)` conserva o mesmo `JSON.parse(text)` usado pelos importadores.

Permanecem inalterados no núcleo:

- `gera-song`, inclusive a compatibilidade com `teclado-virtual-song`;
- `gera-drum-set` versão 1;
- formato completo da música atualmente exportado pelo aplicativo;
- biblioteca portátil de ritmos e bateria incorporada às seções;
- limite de 5 MB para importação de música;
- validações, normalizações, confirmações, mensagens e nomes dos arquivos;
- preservação do espaço de trabalho antes de importar uma música.

## Resultado da centralização

Todos os acessos diretos por `getItem`, `setItem` e `removeItem` estão agora contidos em `js/storage.js`. Nenhuma chave, cópia paralela, conversão destrutiva ou gravação automática adicional foi introduzida.
