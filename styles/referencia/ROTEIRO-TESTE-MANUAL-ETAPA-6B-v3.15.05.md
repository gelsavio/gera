# Roteiro de teste manual reproduzível — Etapa 6B — v3.15.05

## Preparação

1. Servir a pasta por HTTP ou HTTPS, sem abrir o `index.html` diretamente pelo sistema de arquivos.
2. Abrir as ferramentas do navegador, confirmar que `js/transport/clock.js` responde sem erro e recarregar a página.
3. Confirmar que o aplicativo mostra a versão v3.15.05.
4. Confirmar que nenhum áudio, bateria, metrônomo ou sequência começa automaticamente.

## BPM e relógio

1. Definir 40 BPM, iniciar o metrônomo e conferir quatro pulsos regulares.
2. Repetir em 100 BPM e 220 BPM.
3. Digitar 72,4 BPM e sair do campo; confirmar o arredondamento legado para 72 BPM.
4. Digitar 72,5 BPM e sair do campo; confirmar o arredondamento legado para 73 BPM.
5. Informar valor abaixo de 40 e acima de 220; confirmar os limites 40 e 220.
6. Manter o transporte em execução por pelo menos três minutos em 40, 100 e 220 BPM e observar se não há timer duplicado ou interrupção.

## Compassos e consumidores

1. Iniciar somente a bateria em padrão 4/4 e confirmar a posição do primeiro bumbo e a duração aparente dos compassos.
2. Iniciar somente a sequência com itens de um compasso, meio compasso e subdivisões já existentes.
3. Iniciar bateria e sequência juntas e confirmar o mesmo início conjunto da v3.15.04.
4. Iniciar a bateria durante uma sequência ativa e, depois, iniciar uma sequência durante a bateria ativa; confirmar a espera pela fronteira legada.
5. Repetir com um padrão 3/4, sem avaliar nem corrigir imperfeições conhecidas da Valsa.
6. Testar um ritmo de violão de quatro tempos e um de três tempos, confirmando que a duração do compasso não mudou.
7. Alterar o BPM durante a execução no começo, no meio e no fim do compasso; conferir somente a paridade com a v3.15.04.
8. Parar no começo, no meio e no fim do compasso e confirmar o comportamento legado.

## Interface e áudio preservados

1. Conferir teclado, acordes, todos os instrumentos, baixo automático, sustain, bateria, sequência e controles compactos.
2. Abrir e fechar modais, alternar tema claro e escuro e testar tela larga e estreita.
3. Repetir os testes essenciais em computador e em tablet ou celular com interação por toque.

## PWA, cache e offline

1. Com a v3.15.04 previamente aberta, carregar a v3.15.05 e aguardar a ativação do novo SERVICE WORKER.
2. Na área de armazenamento do navegador, confirmar a existência de `gera-pwa-v3.15.05`.
3. Confirmar que `gera-pwa-v3.15.04` e caches anteriores com prefixos `gera-pwa-` ou `teclado-virtual-pwa-` foram removidos após a ativação.
4. Confirmar que `js/transport/clock.js` está no cache atual.
5. Colocar o dispositivo offline, fechar e reabrir o GERA e confirmar a abertura do aplicativo.
6. Executar novamente bateria, sequência e metrônomo offline, considerando presente a pasta `kit-acustico-selecionado`.

Registre navegador, versão do sistema operacional, tipo de dispositivo e qualquer divergência antes de autorizar a subetapa 6C.

