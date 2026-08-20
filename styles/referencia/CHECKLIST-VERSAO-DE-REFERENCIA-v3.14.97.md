# Checklist da versão de referência do GERA v3.14.97

Data de preparação: **3 de agosto de 2026**

Use este roteiro para confirmar a linha de base antes da etapa 2. Registre o navegador, o dispositivo, o sistema operacional e a data do teste. Os itens dependentes do kit acústico devem ser executados somente em implantação que contenha a pasta original `kit-acustico-selecionado/`.

## Identificação do teste

- [ ] Data: ____________________
- [ ] Responsável: ____________________
- [ ] Dispositivo e sistema: ____________________
- [ ] Navegador e versão: ____________________
- [ ] Endereço HTTP/HTTPS usado: ____________________
- [ ] Kit acústico original presente: sim / não

## Integridade da entrega

- [ ] O ZIP abre sem erro.
- [ ] `index.html` e `referencia/index.monolitico-original-v3.14.97.html` possuem o mesmo SHA-256.
- [ ] `manifest.json` informa a versão `3.14.97`.
- [ ] `sw.js` usa o cache `gera-pwa-v3.14.97`.
- [ ] Não existem pastas `styles/` ou `js/` criadas pela modularização.
- [ ] O único CSS funcional permanece inline no `index.html`.
- [ ] Os cinco blocos JAVASCRIPT permanecem inline, clássicos e na ordem original.

## Abertura e PWA

- [ ] O aplicativo abre por HTTP ou HTTPS sem erro visível.
- [ ] O tema salvo é aplicado antes da pintura inicial, sem clarão de tema incorreto.
- [ ] O manifesto é reconhecido e o aplicativo pode ser instalado.
- [ ] A atualização do SERVICE WORKER não apaga músicas, listas, sequências, memórias ou padrões personalizados.
- [ ] Com todos os recursos do pré-cache presentes, o aplicativo abre offline após a primeira carga.
- [ ] Sem o kit acústico, a limitação conhecida de instalação do cache foi registrada e não foi confundida com regressão da modularização.

## Persistência e compatibilidade

- [ ] Temas existentes são restaurados por `geraTheme`.
- [ ] Músicas existentes são carregadas por `tecladoVirtualSongs`.
- [ ] Sequências existentes são carregadas por `tecladoVirtualSongSections`.
- [ ] A sequência legada em `tecladoVirtualChordSequence`, quando existente, continua disponível para migração.
- [ ] Listas e preferências do painel compacto são restauradas.
- [ ] Padrões personalizados da bateria são restaurados.
- [ ] As seis memórias continuam sendo lidas e aplicadas.
- [ ] A posição do mute, a aba ativa e o estado do trilho lateral são restaurados.
- [ ] Exportar e importar dados não altera os formatos existentes.

## Áudio e execução musical

- [ ] O AUDIOCONTEXT é desbloqueado após interação do usuário.
- [ ] Todos os instrumentos disponíveis produzem som.
- [ ] Teclas individuais e acordes funcionam por mouse e toque.
- [ ] O limite de multitoque permanece funcional.
- [ ] Sustain enquanto pressionado respeita ataque e liberação.
- [ ] Sustain até o próximo acorde respeita a liberação ao trocar ou repetir o acorde.
- [ ] Inversões, oitavas, capotraste e círculo harmônico mantêm o comportamento.
- [ ] Baixo automático permanece audível e sincronizado.
- [ ] Metrônomo inicia, para e acompanha o BPM.
- [ ] Mudanças de BPM durante a execução respeitam a fronteira temporal prevista.

## Bateria e transporte

- [ ] Motor sintético inicia e para corretamente.
- [ ] Motor acústico carrega e toca quando o kit original está presente.
- [ ] Padrões 4/4 mantêm duração e acentuação.
- [ ] Padrões 3/4 mantêm duração e acentuação.
- [ ] Camadas, volumes e dinâmica conservam os valores salvos.
- [ ] Viradas, meias viradas e encerramentos entram na fronteira correta.
- [ ] Música iniciada com bateria ativa aguarda o próximo início de compasso.
- [ ] Sequência sem bateria encerra a bateria anterior na fronteira alinhada.
- [ ] Música, bateria e música + bateria podem ser iniciadas e interrompidas independentemente no painel compacto.

## Sequenciador, músicas e listas

- [ ] Seções A–P são carregadas e executadas.
- [ ] Repetições, LOOP, AUTO e AUTO FIM mantêm o comportamento.
- [ ] Trocas e filas de seção ocorrem no ponto musical correto.
- [ ] Acordes, notas contínuas, pausas e oitavas específicas são respeitados.
- [ ] Textos sincronizados aparecem e desaparecem no tempo previsto.
- [ ] Salvar, editar, apagar e restaurar sequências preserva os dados.
- [ ] Salvar, carregar, renomear e apagar músicas preserva os dados.
- [ ] Selecionar uma lista no painel compacto carrega a primeira música sem iniciar a reprodução.
- [ ] Avançar e retroceder músicas atualiza nome, posição e próxima música.

## Interface e painel compacto

- [ ] Cabeçalho, trilho lateral e cartões mantêm posições em tela larga.
- [ ] Layout responsivo mantém posições em tablet ou tela estreita.
- [ ] Temas escuro, neutro, claro, oceano, floresta e violeta mantêm cores e contraste.
- [ ] Modais abrem, recebem foco, confirmam e cancelam corretamente.
- [ ] O painel compacto não apresenta clarão ou reconstrução visual ao tocar ou parar.
- [ ] A área do contador regressivo permanece reservada antes da execução.
- [ ] A área das letras permanece com 96 px e não desloca os controles.
- [ ] O marcador de passagem e os botões preservam suas dimensões ao mudar de estado.
- [ ] O carrossel só é reconstruído quando o conteúdo musical realmente muda.

## Aprovação da linha de base

- [ ] Todos os itens aplicáveis foram aprovados.
- [ ] Falhas encontradas foram registradas como comportamento pré-existente ou bloqueio de ambiente.
- [ ] A versão 3.14.97 foi confirmada como referência de retorno.
- [ ] A etapa 2 foi autorizada expressamente.

Observações:  
______________________________________________________________________________  
______________________________________________________________________________  
______________________________________________________________________________
