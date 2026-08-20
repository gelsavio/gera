# GERA v3.15.24 — Etapa 8D: acordes e círculo harmônico

Concluída em 4 de agosto de 2026.

Esta versão extrai para `js/ui/chords-circle.js` a renderização e a ligação dos eventos da área principal de acordes e do círculo harmônico já existente. O módulo monta as linhas de acordes maiores e menores, os sete graus diatônicos, os dominantes secundários, o diálogo legado de tonalidades e o seletor circular do novo layout.

O módulo recebe por injeção os nomes, graus, dominantes, estado do filtro, rótulos e a função `handleChordButton`. O núcleo continua responsável por voicings, inversões, capotraste, oitavas, sustain, envelopes, instrumento, baixo automático, transporte, gravação de sequências e áudio.

O DOM estrutural, os IDs, as classes, os textos, as cores funcionais e os eventos de ponteiro não foram alterados. O campo harmônico do painel compacto permanece sob a integração da Etapa 8B, e o campo harmônico do diálogo de gravação permanece reservado ao sequenciador.

O SERVICE WORKER usa o cache `gera-pwa-v3.15.24` e inclui `js/ui/chords-circle.js` no pré-cache. A pasta `kit-acustico-selecionado`, ausente na base recebida, permanece pendente para a Etapa 13.

A reversão exclusiva desta etapa recompõe a versão 3.15.23 byte a byte.
