# GERA v3.15.28 — Etapa 8H: configurações e modais

Concluída em 5 de agosto de 2026.

Esta etapa extraiu para `js/ui/settings-modals.js` a camada de ligação dos controles gerais de configuração e dos modais compartilhados ainda mantidos no núcleo. O módulo concentra faixas de volume, BPM digitado, botões de ajuste fino, instrumento, oitava, capotraste, sustain, forma de execução, arpejo, inversão, ritmo, divisão do teclado, sensibilidade, glissando, acompanhamento contínuo, baixo automático, tempo da troca, memórias, modo avançado, tela cheia, parada do acompanhamento, mute global e diálogo geral de confirmação.

O módulo encaminha valores e eventos às funções existentes do núcleo. Estado musical, validação de bloqueio do instrumento, áudio, transporte, persistência, aplicação das memórias, mensagens e decisões de execução continuam no núcleo e são acionados nos mesmos momentos.

O DOM, os IDs, as classes, os textos, os atributos ARIA, os limites dos campos e a ordem de carregamento foram preservados. Nenhum temporizador, estado musical ou listener adicional foi criado.

O SERVICE WORKER usa o cache `gera-pwa-v3.15.28`, inclui `js/ui/settings-modals.js` uma única vez e mantém 47 entradas sem duplicidade. A pasta `kit-acustico-selecionado`, ausente na base recebida, permanece pendente para a Etapa 13.

A reversão exclusiva dos quatro recursos funcionais desta etapa recompõe a versão 3.15.27 byte a byte.
