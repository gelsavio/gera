# GERA v3.15.41 — padrão visual do sustain

Versão concluída em 16 de agosto de 2026, a partir da v3.15.40.

## Sustain no teclado

A tela do teclado de 61 teclas agora apresenta diretamente as opções **Pressionada**, **Liberação** e **Até próxima**. O novo seletor usa o mesmo estado do controle existente nos Ajustes: mudar numa tela atualiza imediatamente a seleção visual da outra e mantém o mesmo comportamento para notas e acordes.

O seletor do teclado reutiliza também as mesmas classes e a mesma paleta visual do componente aprovado: superfície creme, bordas marrons e fundo alaranjado claro com texto e contorno alaranjados na opção ativa. Os demais temas continuam usando seus equivalentes da mesma paleta do aplicativo.

## Organização da interface

O roteiro aparece como **Estrutura geral da música**, antes do recurso antigo de repetição. A configuração selecionada foi dividida em dois cartões: **Execução** (instrumento, próxima sequência e retornos) e **Bateria** (padrão, entrada, saída e final). O roteiro deixou de usar `fieldset/legend`, evitando deformações do cabeçalho e dos campos em larguras intermediárias.

## Carregamento inicial

O aplicativo continua iniciando sem música selecionada. Ao clicar em **Carregar**, uma falsa pendência residual do espaço inicial vazio é descartada, a música escolhida é aplicada e o botão muda para **Selecionada**, sem abrir a Biblioteca e sem depender de uma importação prévia.

Se o espaço sem nome realmente contiver acordes, notas, pausas, blocos de roteiro ou um conjunto ativado, a proteção contra perda de alterações continua funcionando e solicita o salvamento antes da troca.

## Roteiro de execução

O editor de sequências ganhou um roteiro ordenado por blocos. Cada bloco define sequência inicial, sequência final e número de execuções. Os blocos podem ser reordenados, removidos e combinados.

Exemplo: `A–B ×3` seguido de `B–C ×2` gera normalmente `A → B → A → B → A → B → B → C → B → C`. Com **Aproveitar anterior** no segundo bloco, o B que encerrou o primeiro bloco também abre o segundo: `A → B → A → B → A → B → C → B → C`.

Quando o roteiro está ativo, ele substitui o antigo conjunto único e as indicações individuais de próxima sequência durante a execução. As repetições internas de cada sequência continuam sendo respeitadas. O roteiro é salvo no espaço de trabalho, nas músicas e no JSON exportado.

## Loop do ciclo atual

O botão de loop agora identifica o ciclo musical corrente:

- dentro de um bloco do roteiro, repete o bloco completo;
- numa cadeia com retorno configurado, repete todo o ciclo — por exemplo A em 3/4 e B em 4/4, com retorno de B para A;
- sem bloco nem retorno, repete somente a sequência atual.

Desligar o loop não interrompe nem reposiciona a música. O ciclo em andamento termina naturalmente e então a execução segue pelo roteiro ou pela próxima sequência configurada.

## AUTO LOOP

AUTO LOOP permanece independente do loop atual. Ele apenas define o que acontece ao final do roteiro ou da música: ligado volta ao início; desligado encerra. Alterar essa preferência durante a execução não reinicia a música.

## Compatibilidade

O formato interno da música passou para 25 e o formato `gera-song` para 8. Arquivos anteriores continuam aceitos. SERVICE WORKER, manifesto e identificação visual usam a versão 3.15.41.
