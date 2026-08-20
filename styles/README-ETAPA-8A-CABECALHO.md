# GERA v3.15.21 — Etapa 8A

Data: 4 de agosto de 2026  
Base: GERA v3.15.20

Esta etapa inicia a modularização da interface com a extração das ações do cabeçalho visível para `js/ui/header.js`.

O módulo recebe por injeção a busca dos elementos, a ativação da aba de músicas e a atualização dos readouts. Ele preserva os cinco comandos existentes: tema, manual, modo compacto, tela cheia e seleção de música. Os botões continuam encaminhando os cliques aos controles históricos já presentes no DOM.

O módulo não cria elementos, não altera a estrutura do cabeçalho, não lê estado musical e não interfere em transporte, áudio, bateria, sequência, persistência ou transições. Nome da música, BPM e textos permanecem atualizados pelo consumidor visual extraído na Etapa 6J.

A versão e o cache foram atualizados para 3.15.21. Somente `js/ui/header.js` foi acrescentado ao pré-cache.
