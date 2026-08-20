# GERA v3.15.22 — Etapa 8B: painel compacto

Concluída em 4 de agosto de 2026.

Esta versão extrai para `js/ui/compact-panel.js` a ligação dos controles do painel compacto já existente. O módulo conhece os IDs e associa os eventos, enquanto o núcleo continua responsável por música, listas, transporte, sequência, bateria, capotraste, oitava, campo harmônico e mensagens de estado.

O DOM, os textos, as classes, os atributos ARIA, os estados, os valores persistidos e os momentos de execução não foram alterados. Nenhum elemento, temporizador, estado musical ou regra de transporte foi criado pelo módulo.

O SERVICE WORKER usa o cache `gera-pwa-v3.15.22` e inclui `js/ui/compact-panel.js` no pré-cache. A pasta `kit-acustico-selecionado`, ausente na base recebida, permanece pendente para a Etapa 13.

A reversão exclusiva desta etapa recompõe a versão 3.15.21 byte a byte.
