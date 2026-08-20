# GERA v3.15.48 — Prévia e cronômetro das letras

Versão concluída em 19 de agosto de 2026.

## Execução dentro do editor

O modal **Letras da sequência** possui agora o botão **Executar sequência**. O botão reproduz uma vez a sequência selecionada, sem bateria, mantendo o modal aberto para a conferência e o ajuste das entradas vocais.

A execução utiliza o transporte real do GERA. Ela respeita o BPM, a duração de cada acorde, o instrumento e o modo de execução configurados na sequência. Durante a preparação, os cronômetros permanecem em zero. A contagem começa quando o primeiro acorde efetivamente entra.

O botão muda para **Parar execução** enquanto a prévia estiver ativa. A execução também é interrompida ao salvar, cancelar ou fechar o modal.

## Cronômetro por acorde

Cada cartão de acorde, nota ou pausa apresenta:

- o tempo progressivo do item ativo, com precisão de décimos de segundo;
- uma barra de progresso correspondente à duração do acorde;
- uma marca visual no instante configurado para a entrada da letra;
- a indicação textual do atraso cadastrado;
- destaque quando o instante da entrada vocal é alcançado.

Somente o item em execução avança. Os itens anteriores permanecem com sua duração final exibida, e os itens seguintes permanecem em `0,0 s`. Dessa forma, é possível ouvir a sequência, observar o cronômetro do acorde e registrar diretamente o instante em que a voz deve começar.

Os campos de texto e atraso permanecem editáveis durante a execução. Assim, a marca de entrada pode ser reposicionada enquanto o acorde está tocando. A seleção de outra sequência ou passagem fica temporariamente bloqueada para impedir que o cronômetro perca sua referência.

Quando o atraso ultrapassa a duração do acorde, o cartão informa que a entrada ocorrerá após aquele acorde. A execução da letra continua obedecendo à linha do tempo real implementada na versão 3.15.47.

## Passagem selecionada

A prévia usa a passagem atualmente aberta no editor. Se estiver selecionado **Texto padrão**, a apresentação e a marca de entrada utilizam especificamente o texto e o atraso padrão.

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

Resultado: **322 testes aprovados, 0 falhas**.
