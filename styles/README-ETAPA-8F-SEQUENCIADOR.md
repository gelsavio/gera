# GERA v3.15.26 — Etapa 8F: sequenciador

Concluída em 5 de agosto de 2026.

Esta etapa extraiu para `js/ui/sequencer.js` a camada de interface e de ligação do sequenciador. O módulo concentra os controles das seções A–P, repetições, reprodução, loop da seção, bateria configurada, AUTO, AUTO FIM, pausas, exclusão, visibilidade da barra, editor de itens, organizador e diálogo redesenhado de gravação.

Os estados visuais de gravação, pausa, reprodução, bateria, loop, automação, seleção da seção, fila da próxima seção e contadores de repetição também passam pelo novo controlador. As rotinas do núcleo continuam fornecendo os valores e executando todas as mudanças de estado.

O módulo não contém acordes, notas, durações armazenadas, transições, regras de repetição, decisões de AUTO, síntese, `AudioContext`, scheduler, transporte ou persistência. Reprodução, sincronização, viradas, encerramentos, gravação dos itens e formatos JSON permanecem no núcleo e são acionados nos mesmos momentos da versão 3.15.25.

O SERVICE WORKER usa o cache `gera-pwa-v3.15.26`, inclui `js/ui/sequencer.js` uma única vez e mantém 45 entradas sem duplicidade. A pasta `kit-acustico-selecionado`, ausente na base recebida, permanece pendente para a Etapa 13.

A reversão exclusiva desta etapa recompõe a versão 3.15.25 byte a byte.
