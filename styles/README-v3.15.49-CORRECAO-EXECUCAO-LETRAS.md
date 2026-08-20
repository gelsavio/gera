# GERA v3.15.49 — Correção da execução no editor de letras

Versão concluída em 19 de agosto de 2026.

## Problema corrigido

O botão **Executar sequência**, no modal **Letras da sequência**, podia iniciar o transporte com o canal geral do aplicativo ainda bloqueado. Nesse estado, o botão aparentava não funcionar porque nenhum som era ouvido e a mensagem de preparação ficava somente na tela principal, encoberta pelo modal.

## Novo comportamento

O clique em **Executar sequência** agora:

- cria ou retoma o contexto de áudio a partir da interação direta do usuário;
- libera o canal geral de áudio antes de iniciar a sequência;
- executa uma única passagem da sequência selecionada, sem bateria;
- mantém os cronômetros progressivos sincronizados com cada item;
- apresenta no próprio modal os estados **Preparando execução**, **Executando item**, **Execução concluída** ou a mensagem de erro;
- permite interromper a prévia pelo mesmo botão.

O desbloqueio do áudio ocorre apenas quando o usuário solicita explicitamente a execução. A abertura do aplicativo e do modal continua sem iniciar som automaticamente.

## Compatibilidade

Não houve alteração na estrutura persistente das músicas. O formato interno permanece 27, e o formato portátil `gera-song` permanece 10. Músicas e backups da versão anterior continuam compatíveis.

## Arquivos principais

- `index.html`
- `js/ui/lyrics-editor.js`
- `styles/inline-style-01.css`
- `manifest.json`
- `sw.js`
- `tests/lyrics-by-passage.test.js`

## Validação

```text
node --check js/lyrics.js
node --check js/ui/lyrics-editor.js
node --test
```

Resultado: **323 testes aprovados, 0 falhas**.
