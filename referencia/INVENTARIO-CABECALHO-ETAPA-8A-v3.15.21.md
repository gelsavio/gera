# Inventário do cabeçalho — Etapa 8A

Data: 4 de agosto de 2026  
Versão: 3.15.21  
Base: 3.15.20

## Estrutura preservada

O cabeçalho visível permanece declarado em `index.html` como `#redesign-topbar`. Nenhum elemento, ID, classe, atributo, texto, ordem ou posição estrutural foi alterado, exceto os três textos de versão.

O cabeçalho histórico `.app-header` continua oculto e presente no DOM. Seus controles são preservados como destinos compatíveis das ações do cabeçalho visível.

## Ações extraídas

| Controle visível | Comando preservado |
| --- | --- |
| `#redesign-theme` | encaminha o clique para `#theme-cycle` e atualiza os readouts após 20 ms |
| `#redesign-manual` | encaminha o clique para `#manual-btn` |
| `#redesign-compact` | encaminha o clique para `#compact-mode-toggle` |
| `#redesign-fullscreen` | encaminha o clique para `#fullscreen` |
| `#redesign-song-pill` | ativa a aba `musicas` |

As cinco atribuições `onclick` foram retiradas do bloco de montagem e ligadas uma única vez por `GeraHeader.createController(...).bind()`.

## Atualização visual preservada

`#redesign-song-name` e `#redesign-bpm-readout` continuam sendo atualizados por `GeraTransportStatus`. `#redesign-header-text-preview` continua consumindo a linha textual já existente. Nenhuma fonte paralela de estado foi criada.

## Temporização e rolagem

Na base 3.15.20, `#redesign-topbar` é `sticky` e não possui rotina de ocultação automática durante a rolagem. A Etapa 8A preserva esse comportamento e não acrescenta temporizador de reaparecimento.

## Limites do módulo

`js/ui/header.js` não cria DOM, não inicia timers no carregamento, não registra `addEventListener`, não acessa áudio ou persistência e não contém regras de BPM, bateria, sequência, transporte ou transição.
