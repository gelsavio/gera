# GERA v3.15.10 — Etapa 6G

Em 4 de agosto de 2026, a integração da sequência de acordes com o transporte mestre foi extraída para `js/transport/chord-sequence-sync.js`.

O módulo recebe as mesmas fronteiras `step` e `boundaryAudioTime` anteriormente tratadas no núcleo, preserva a espera pelo passo zero, o desconto de unidades de ⅛ de compasso, o carregamento do próximo item e a divisão dos segmentos que atravessam compassos. O adaptador global legado `advanceSequenceBoundary(step, boundaryAudioTime)` foi preservado.

Permaneceram no núcleo legado o conteúdo e a normalização dos itens, pausas, notas, oitavas, inversões, instrumentos, acompanhamento, voicings, baixo automático, sustain, liberação, áudio, bateria, trocas entre sequências, loop, fila, painel compacto, contadores e DOM.

A versão do aplicativo e do manifesto passou a 3.15.10. O cache passou a `gera-pwa-v3.15.10`, e somente `js/transport/chord-sequence-sync.js` foi acrescentado ao `PRECACHE_URLS`.

A subetapa 6H não foi iniciada.
