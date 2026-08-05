# Roteiro manual — Etapa 7A

Data: **4 de agosto de 2026**

## Preparação

Executar o aplicativo por HTTP ou HTTPS com um perfil que já tenha dados da versão 3.15.14. Antes do teste, registrar o conteúdo das quatro chaves migradas e não apagar o armazenamento do site.

## Tema

Abrir o aplicativo e confirmar que o tema salvo aparece antes da renderização da interface, sem lampejo do tema neutro. Alternar por todos os temas, recarregar a página e confirmar a restauração do último tema. Repetir com `geraTheme` ausente e confirmar o tema neutro.

## Aba do redesign

Selecionar cada aba, recarregar a página e confirmar que a última aba válida volta ativa. Repetir com a chave ausente e confirmar a aba Acordes.

## Trilho lateral

Recolher e expandir o trilho, recarregando após cada estado. Em tela estreita, remover somente `geraRedesignRailCollapsed` e confirmar a regra responsiva anterior. Verificar que `1` e `0` permanecem strings.

## Botão flutuante de áudio

Arrastar o botão, recarregar e confirmar a posição. Redimensionar a janela e confirmar que a posição é ajustada aos limites da tela. Verificar que o valor continua sendo um JSON com `left` e `top`.

## Não regressão dos grupos posteriores

Confirmar que músicas e listas existentes continuam disponíveis. Reproduzir uma sequência salva. Carregar uma memória de ajustes. Selecionar o motor de bateria. Abrir um padrão personalizado. Exportar e importar uma música sem executar restauração destrutiva.

## PWA

Atualizar a instalação, recarregar em modo offline e confirmar que `js/storage.js` foi disponibilizado. Confirmar que a atualização do cache não removeu nenhuma chave de `localStorage`.
