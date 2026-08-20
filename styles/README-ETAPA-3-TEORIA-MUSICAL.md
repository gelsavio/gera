# GERA — Etapa 3A: teoria musical

Versão: **3.15.02**  
Data: **03/08/2026**

## Escopo executado

Esta versão extrai exclusivamente constantes e funções puras relacionadas à teoria musical para `js/chords.js`. Nenhum padrão de bateria, motor de bateria, transporte, áudio, persistência ou componente de interface foi extraído.

Foram transferidos para o novo arquivo os nomes de acordes e notas, os intervalos dos tipos de acorde, os graus do círculo harmônico, os dominantes secundários, os limites de oitava da sequência, as formas de violão e as funções determinísticas de formação, inversão, ajuste de extensão, rotulagem e voicing.

As funções que consultam estado global, instrumento ativo, baixo automático, sequência em execução ou elementos do DOM permaneceram no `index.html`. Adaptadores mínimos preservam os nomes usados pelo código legado, inclusive o valor atual de `inversion` nos pontos em que o monólito dependia dele.

## Compatibilidade

O arquivo `js/chords.js` é carregado como script clássico antes do bloco principal. Ele expõe apenas o objeto global `GeraChords`, sem converter o aplicativo para ES Modules e sem mudar a ordem dos cinco blocos JAVASCRIPT inline existentes.

O SERVICE WORKER utiliza o cache `gera-pwa-v3.15.02` e inclui `./js/chords.js` no pré-cache. A pasta `kit-acustico-selecionado/` continua sendo considerada presente na instalação, conforme informado pelo usuário.

## Testes automatizados

Execute na raiz do aplicativo:

```text
node --test tests/chords.test.js
```

Os testes cobrem somente dados e funções sem DOM, áudio ou estado global. Também foi executada uma comparação exaustiva contra os algoritmos da versão 3.15.01 para todas as raízes, tipos de acorde e inversões suportidas.

## Arquivos funcionais alterados ou criados

- `index.html`
- `js/chords.js`
- `tests/chords.test.js`
- `sw.js`
- `manifest.json`
- `INSTRUCOES-PWA.txt`

O CSS externo da etapa 2 permaneceu inalterado. Os dados e as funções da bateria permaneceram no `index.html`.
