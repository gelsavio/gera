# GERA v3.15.33 — correção crítica do áudio contínuo

Correção concluída em 10 de agosto de 2026, partindo da versão validada 3.15.32.

## Falhas corrigidas

O transporte chamava diretamente `renderSequenceRecordExisting()` e `finishSequenceRecordPreview()`, embora essas rotinas estivessem no escopo privado da interface redesenhada. A exceção interrompia o avanço da sequência e impedia a conclusão normal da prévia.

`releaseVoice()` aceitava valores não finitos no tempo de liberação e no ganho corrente. A chamada inválida a `exponentialRampToValueAtTime()` lançava uma exceção antes de `source.stop()`. Vozes com fontes contínuas, inclusive ruído em loop usado por determinados timbres, podiam então permanecer ligadas após Parar, Silenciar ou trocar de música.

## Correções aplicadas

- Criada uma ponte explícita entre o núcleo do transporte e a interface privada do editor de sequências.
- Eliminadas as chamadas globais a funções privadas do editor.
- Normalizados o instante de áudio, o tempo de liberação, a escala e o ganho antes do agendamento do envelope.
- Protegida a automação de ganho para que uma falha não impeça a parada física das fontes.
- Reforçada `releaseAll()` para isolar vozes defeituosas e continuar encerrando as demais.
- Preservada a idempotência da liberação por meio de `voice.releaseCompleted`.
- Atualizados identificação visual, manifesto e cache para 3.15.33.

Não foram alterados timbres, volumes, padrões de bateria, cálculos musicais, sincronização, dados persistidos ou estrutura do DOM.

## Validação

A suíte cumulativa aprovou 279 de 279 testes automatizados. Cinco blocos JAVASCRIPT inline, 21 arquivos JAVASCRIPT externos e o SERVICE WORKER passaram na verificação sintática. O pré-cache permanece com 47 entradas sem duplicidade.

Os testes sonoros em navegador e dispositivos reais permanecem manuais. A pasta `kit-acustico-selecionado` continua ausente da base recebida.
