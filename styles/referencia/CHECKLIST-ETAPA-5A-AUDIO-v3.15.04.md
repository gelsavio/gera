# Checklist manual — GERA v3.15.04

Execute este checklist com o aplicativo servido por HTTP/HTTPS. Não use abertura direta por `file://`.

## Preparação

- [ ] Manter a pasta `kit-acustico-selecionado/` na raiz, com todos os arquivos referenciados pelo `sw.js`.
- [ ] Fazer backup dos dados do GERA antes de substituir a versão instalada.
- [ ] Abrir o aplicativo e confirmar a identificação `v3.15.04`.
- [ ] Antes do primeiro toque, confirmar que não surge solicitação ou erro de áudio e que nenhum som inicia automaticamente.
- [ ] No primeiro toque em uma tecla, confirmar que o áudio é liberado por interação do usuário.
- [ ] Alternar para outro aplicativo ou bloquear a tela, retornar ao GERA e confirmar que um novo toque retoma o áudio.

## Instrumentos — repetir em computador, tablet e celular

Em cada instrumento, toque notas graves, médias e agudas; mantenha uma nota pressionada; solte-a; toque duas a quatro notas simultaneamente; e toque um acorde.

- [ ] Piano.
- [ ] Clavinete.
- [ ] Metais.
- [ ] Teclado Strings 3.
- [ ] Violão.
- [ ] Harpa.
- [ ] Órgão de Igreja.
- [ ] Flauta.
- [ ] Sino / Glockenspiel.
- [ ] Pad Synth.
- [ ] Baixo Elétrico.
- [ ] Contrabaixo Acústico.

Em todos os instrumentos:

- [ ] Timbre e volume permanecem equivalentes à versão 3.15.03.
- [ ] Ataque, sustain e tempo de liberação permanecem equivalentes.
- [ ] Não há estalos, cortes prematuros, notas presas ou duplicação de vozes.
- [ ] As quatro formas de toque simultâneo continuam funcionando no dispositivo tátil.

## Grafo e funções críticas

- [ ] O controle `Volume geral` altera todo o áudio.
- [ ] O silenciamento global reduz e restaura o áudio sem recriar o contexto.
- [ ] O controle `Volume da bateria` altera somente a bateria.
- [ ] A bateria sintética inicia e para normalmente.
- [ ] A bateria por samples inicia e para normalmente.
- [ ] O metrônomo funciona e respeita o BPM.
- [ ] O baixo automático mantém definição, volume e separação dos acordes.
- [ ] Sustain `Enquanto pressionado` mantém a liberação configurada.
- [ ] Sustain `Até o próximo acorde` encerra o acorde anterior com a liberação configurada.
- [ ] Acordes juntos e arpejados mantêm seus volumes e envelopes.
- [ ] Sequência e bateria continuam sincronizadas no início do compasso.
- [ ] Mudança de BPM durante a execução continua sendo aplicada na fronteira prevista.

## Dispositivos e navegadores

- [ ] Computador: testar em CHROME ou EDGE atualizado.
- [ ] Tablet: testar toque simples, multitoque e retomada após segundo plano.
- [ ] Celular: testar toque, retomada após bloqueio e reprodução pelo alto-falante.
- [ ] Em IOS/IPADOS, testar no SAFARI e na instalação adicionada à tela inicial.
- [ ] Em ANDROID, testar no CHROME e na instalação PWA.

## PWA e modo offline

- [ ] Atualizar a instalação anterior e confirmar que os dados existentes foram preservados.
- [ ] Confirmar que o cache ativo é o da versão 3.15.04 e que o cache anterior foi removido.
- [ ] Instalar ou atualizar o PWA com conexão disponível.
- [ ] Fechar completamente o aplicativo.
- [ ] Desativar a conexão e abrir novamente.
- [ ] Confirmar carregamento do CSS, `js/chords.js`, `js/state.js` e `js/audio/core.js` offline.
- [ ] Tocar todos os instrumentos sem conexão.
- [ ] Iniciar bateria por samples sem conexão.
- [ ] Confirmar que listas, músicas, configurações e sequências anteriores permanecem disponíveis.

## Critério de aprovação

Não avançar para criação de vozes ou instrumentos se qualquer item apresentar diferença em relação à versão 3.15.03. Registrar dispositivo, navegador, ação exata e resultado observado.
