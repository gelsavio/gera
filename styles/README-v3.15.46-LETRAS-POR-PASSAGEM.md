# GERA v3.15.46 — Letras por passagem

## Entrega

O texto cantado deixou de pertencer somente à primeira execução de um acorde. Cada item da sequência — acorde, nota ou pausa — pode agora ter um texto diferente para cada passagem real da música.

O cadastro foi retirado do modal **Editar item**, preservando seu tamanho e sua finalidade. A edição das letras ocorre em um modal próprio, aberto pelo botão **✎ Letras** nos controles da sequência e também no cabeçalho da sequência selecionada da interface redesenhada.

## Editor de letras

O novo modal permite:

- escolher a sequência e a passagem que será editada;
- cadastrar até 99 passagens;
- escrever o texto de cada item da sequência;
- definir um **Texto padrão**, usado quando a passagem atual não tiver texto específico;
- criar uma nova passagem;
- duplicar os textos da passagem anterior;
- remover uma passagem inteira;
- salvar todas as alterações de uma vez ou cancelar sem modificar a música.

Passagens sem texto específico e sem texto padrão permanecem vazias. Isso evita repetir automaticamente a letra da primeira passagem quando a letra cantada é diferente.

## Contagem durante a execução

A passagem é incrementada quando a execução entra novamente no primeiro item de uma sequência. A contagem acompanha o roteiro compilado, e não apenas a repetição local do acorde.

Exemplo: no roteiro **A–B ×3** seguido de **B–C ×2** com aproveitamento do B compartilhado, as ocorrências de B são numeradas como 1, 2, 3 e 4. O B de ligação não é executado duas vezes artificialmente.

No loop da sequência atual, as letras disponíveis dessa sequência são percorridas a cada retorno. No loop de conjunto ou de bloco, cada sequência mantém sua própria contagem de passagens. No AUTO LOOP da música completa, as contagens são reiniciadas quando a música volta ao início.

## Formato e compatibilidade

Os itens usam a estrutura:

```json
{
  "lyrics": [
    { "passage": 1, "text": "Glória a Deus" },
    { "passage": 2, "text": "Paz na terra" }
  ],
  "lyricDefault": "Texto opcional de reserva"
}
```

O formato interno da música passou para 26, e o formato portátil `gera-song` passou para 9. Arquivos antigos continuam aceitos. Os campos anteriores `text` e `textRepeat` são migrados automaticamente durante a normalização e deixam de ser gravados no novo formato.

## Arquivos principais

- `index.html`
- `js/lyrics.js`
- `js/ui/lyrics-editor.js`
- `styles/inline-style-01.css`
- `sw.js`
- `manifest.json`
- `tests/lyrics-by-passage.test.js`

## Validação

Comandos executados:

```text
node --check js/lyrics.js
node --check js/ui/lyrics-editor.js
node --test
```

Resultado: **317 testes aprovados, 0 falhas**.
