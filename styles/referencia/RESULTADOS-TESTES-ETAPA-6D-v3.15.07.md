# Resultados dos testes — Etapa 6D — GERA v3.15.07

Data: 4 de agosto de 2026

## Resultado automatizado

Foram aprovados 52 de 52 testes automatizados. A contagem reúne 39 verificações herdadas das etapas anteriores e 13 verificações próprias da subetapa 6D.

As verificações específicas confirmaram ausência de inicialização automática, contrato de início, passo e último passo, oito fronteiras em 4/4, doze fronteiras em 3/4, atraso calculado contra o relógio do áudio, atraso mínimo zero, ausência de evento em passo não fronteiriço, 200 compassos simulados sem perda ou duplicação, permanência do consumidor legado, ausência de decisões musicais no novo módulo, reconstrução byte a byte da base 3.15.06, reconstrução do SERVICE WORKER e do manifesto e identidade dos demais recursos funcionais.

## Integridade funcional

Ao desfazer somente a versão, o carregamento de `boundaries.js`, a criação do adaptador e a chamada ao emissor, o `index.html` reconstruído coincide byte a byte com a versão 3.15.06. Ao desfazer somente a versão do cache e a entrada nova no pré-cache, o `sw.js` coincide byte a byte com a base. O manifesto também é idêntico após restaurar a versão anterior.

## Limites da validação

Não foram declarados como realizados testes sonoros ou táteis em computador, tablet ou celular. Também permanecem pendentes os cenários reais de pausa, retomada, parada durante o compasso e temporização em segundo plano. Esses testes dependem de navegadores e dispositivos reais e constam no roteiro manual.
