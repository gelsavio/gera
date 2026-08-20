# GERA v3.15.27 — Etapa 8G: músicas e biblioteca

Concluída em 5 de agosto de 2026.

Esta etapa extraiu para `js/ui/songs-library.js` a camada de interface e de ligação das músicas, listas e bibliotecas. O módulo concentra a biblioteca clássica, o editor de listas, a biblioteca do layout redesenhado, a busca, o diálogo de BPM e os comandos de abrir, fechar, salvar, criar, carregar, excluir, importar e exportar.

O módulo recebe músicas, listas, associações, nomes e metadados do núcleo, cria os mesmos elementos visuais e encaminha as ações às funções existentes. As operações de persistência, os formatos JSON, a normalização, as confirmações e as mudanças do espaço musical continuam no núcleo.

O módulo não contém `GeraStorage`, `localStorage`, dados de sequências, regras de transporte, áudio, sincronização ou decisões de transição entre músicas. Os controles de listas do modo compacto permanecem integrados ao controlador extraído na Etapa 8B.

O SERVICE WORKER usa o cache `gera-pwa-v3.15.27`, inclui `js/ui/songs-library.js` uma única vez e mantém 46 entradas sem duplicidade. A pasta `kit-acustico-selecionado`, ausente na base recebida, permanece pendente para a Etapa 13.

A reversão exclusiva dos quatro recursos funcionais desta etapa recompõe a versão 3.15.26 byte a byte.
