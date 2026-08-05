# Inventário de acordes e círculo harmônico — Etapa 8D — v3.15.24

Data: 4 de agosto de 2026.

## Escopo extraído

O arquivo `js/ui/chords-circle.js` passou a centralizar:

- a renderização de `#major-chords` e `#minor-chords`;
- a renderização dos sete graus em `#circle-main-chords`;
- a renderização dos dominantes secundários em `#secondary-dominants`;
- as classes de tônica, subdominante, dominante e sensível/diminuto;
- a abertura, seleção e fechamento de `#circle-dialog`;
- a ativação e desativação visual de `#circle-toggle`;
- a montagem de `#redesign-dial`, com a opção Todos e as doze tonalidades;
- o encaminhamento dos eventos de ponteiro para `handleChordButton`.

## Fronteira preservada

Permanecem no núcleo `handleChordButton`, `playChord`, `startAccompaniment`, `stopAccompaniment`, `chordNotes`, `basicChordNotes`, `nearestSecondaryVoicing`, inversões, capotraste, sustain, liberação, instrumento, baixo automático, transporte, sequências e gravação.

O campo `#compact-harmonic-chords` não foi movido nesta etapa porque integra o painel compacto modularizado na 8B. Os controles `#sequence-record-chords`, `#sequence-record-secondary-chords` e seu círculo próprio não foram alterados porque pertencem ao sequenciador.

## Elementos e comportamentos não alterados

Foram preservadas as doze raízes maiores, as doze menores, a ordem dos graus, a notação do acorde diminuto, os rótulos dos dominantes secundários, as cores funcionais, os títulos, os atributos de dados e os mesmos momentos de atualização do estado visual.

## Invariantes estáticas

- `setInterval`: 2 ocorrências;
- `setTimeout`: 42 ocorrências;
- `addEventListener`: 59 ocorrências;
- `requestAnimationFrame`: 2 ocorrências;
- nenhum acesso novo ao `localStorage`;
- nenhuma regra nova de teoria musical, áudio, transporte ou persistência;
- nenhum operador `??` introduzido.
