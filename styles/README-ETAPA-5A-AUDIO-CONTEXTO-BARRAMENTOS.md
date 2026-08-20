# GERA v3.15.04 — Etapa 5A

Esta versão extrai exclusivamente a criação e a retomada do `AudioContext` e a montagem do grafo fixo de áudio para `js/audio/core.js`.

O novo arquivo conserva literalmente a função `ensureAudio()` da versão 3.15.03 e mantém globais os identificadores exigidos pelo código legado. O arquivo é carregado como script clássico antes do núcleo inline. Ele não cria o contexto durante o carregamento: `ensureAudio()` continua sendo chamada nos mesmos pontos vinculados às ações do usuário.

Foram transferidos somente o ganho mestre, o ganho de silenciamento do aplicativo, o limiter, o barramento e compressor da bateria e o barramento exclusivo do baixo com seus filtros e compressor. Não foram transferidas ou alteradas funções de vozes, instrumentos, envelopes, baixo automático, samples, bateria, sustain, normalização ou transporte.

O cache do PWA passou para `gera-pwa-v3.15.04` e inclui `js/audio/core.js`. A pasta `kit-acustico-selecionado/` continua referenciada e é considerada presente na instalação, conforme informado pelo usuário.

Os testes automatizados podem ser executados, a partir da raiz do pacote, com:

```text
node --test tests/*.test.js
```

A aprovação desta versão depende também do checklist manual em computador, tablet e celular.
