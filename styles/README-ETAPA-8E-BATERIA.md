# GERA v3.15.25 — Etapa 8E: bateria

Concluída em 5 de agosto de 2026.

Esta etapa extraiu para `js/ui/drums.js` a camada de interface da bateria. O módulo liga os padrões, as camadas, os pads manuais, a virada, o encerramento, a parada, a seleção do motor e o metrônomo. Também mantém a seleção visual dos ritmos, os estados dos botões, o painel manual e as mensagens locais da bateria.

O módulo não contém padrões musicais, samples, síntese, `AudioContext`, cálculo de compassos, scheduler, transporte, persistência ou decisões da sequência. Essas responsabilidades permanecem no núcleo e são apenas acionadas pelas mesmas funções e nos mesmos momentos da versão 3.15.24.

O editor global e a biblioteca de ritmos continuam no núcleo para a etapa específica de biblioteca e modais. Os controles de bateria próprios de cada sequência também permanecem no núcleo para a etapa do sequenciador.

O SERVICE WORKER usa o cache `gera-pwa-v3.15.25`, inclui `js/ui/drums.js` uma única vez e mantém 44 entradas sem duplicidade. A pasta `kit-acustico-selecionado`, ausente na base recebida, permanece pendente para a Etapa 13.

A reversão exclusiva desta etapa recompõe a versão 3.15.24 byte a byte.
