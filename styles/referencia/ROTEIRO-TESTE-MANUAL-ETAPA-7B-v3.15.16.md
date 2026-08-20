# Roteiro de teste manual — Etapa 7B

Data: **4 de agosto de 2026**

## Preparação

1. Instalar ou atualizar o GERA para a versão 3.15.16 sem limpar os dados do site.
2. Confirmar que músicas, listas, sequências, memórias e padrões personalizados existentes continuam presentes.

## Motor da bateria

1. Abrir o aplicativo com `tecladoVirtualDrumEngine` já salvo como `acoustic` e confirmar a seleção correspondente.
2. Repetir com o valor legado alternativo usado pelo aplicativo e confirmar a seleção correspondente.
3. Alterar o motor pelo seletor, recarregar a página e confirmar a permanência do valor.
4. Remover somente a chave em ambiente de teste e confirmar a inicialização em `acoustic`.
5. Bloquear o armazenamento em ambiente de teste e confirmar que o aplicativo abre sem erro e usa `acoustic`.

## Memórias

1. Aplicar uma memória que contenha motor próprio e confirmar que esse valor prevalece.
2. Aplicar uma memória legada sem `drumEngine` e confirmar que a configuração global é usada.
3. Confirmar que salvar, substituir e recuperar as seis memórias não mudou.

## Regressão musical

1. Tocar bateria sintetizada e acústica, se os samples estiverem disponíveis.
2. Executar somente bateria, somente sequência e ambas simultaneamente.
3. Confirmar início no compasso, pausa, retomada, parada, virada e encerramento.
4. Confirmar que BPM, compassos 3/4 e 4/4, volumes e painel compacto permanecem inalterados.

## PWA

1. Recarregar on-line e confirmar a versão 3.15.16.
2. Fechar, reabrir off-line e confirmar a inicialização.
3. Confirmar que caches anteriores foram removidos sem perda de dados do `localStorage`.

Os testes devem ser executados em computador, tablet e celular quando possível.
