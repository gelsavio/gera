# Resultados dos testes — GERA v3.15.33

Data: 10 de agosto de 2026.

Base: GERA v3.15.32.

Resultado cumulativo: 279 de 279 testes automatizados aprovados.

## Provas específicas acrescentadas

- Ganho `NaN` é convertido em valor finito antes de `setValueAtTime()` e `exponentialRampToValueAtTime()`.
- Tempo de liberação `NaN` recebe fallback finito e seguro.
- Falha deliberada na automação do envelope não impede a chamada de `source.stop()`.
- Voz anteriormente marcada como `stopped`, mas sem liberação concluída, ainda pode ser fisicamente interrompida.
- `loadSequenceItem()` utiliza somente a ponte pública do editor.
- O núcleo não chama mais `renderSequenceRecordExisting()` nem `finishSequenceRecordPreview()` fora do escopo em que essas funções existem.
- O cache e o manifesto usam a versão 3.15.33.

## Auditoria cumulativa

- Cinco blocos JAVASCRIPT inline sintaticamente válidos.
- 21 arquivos JAVASCRIPT externos sintaticamente válidos.
- SERVICE WORKER sintaticamente válido.
- Manifesto JSON válido.
- 303 identificadores únicos no DOM.
- 47 entradas únicas no pré-cache.
- Dois `setInterval`, 42 `setTimeout`, 60 `addEventListener` e dois `requestAnimationFrame` no conjunto funcional, exatamente as mesmas contagens da versão 3.15.32.

## Escopo alterado

Somente `index.html`, `sw.js`, `manifest.json`, expectativas de versão dos testes e o novo teste de segurança de liberação foram alterados em relação à versão 3.15.32.

Não foram executados testes sonoros em navegador, instalação PWA real, tablet ou celular.
