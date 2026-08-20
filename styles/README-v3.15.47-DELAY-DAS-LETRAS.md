# GERA v3.15.47 — Atraso individual das letras

Versão concluída em 19 de agosto de 2026.

## Finalidade

Uma letra vinculada a um acorde nem sempre começa junto com ele. A voz pode entrar no meio do acorde, enquanto o acompanhamento já está em execução. Nesta versão, cada letra cadastrada recebe um atraso próprio, contado a partir do início do acorde ao qual ela pertence.

O atraso também participa do contador de entrada vocal. Se a letra estiver configurada com atraso de 1,4 segundo, ela somente será apresentada depois desse intervalo, e o painel indicará o tempo restante até a entrada real da voz.

## Cadastro

O campo **Atraso da entrada vocal** foi incluído em cada item do modal independente **Letras da sequência**. O valor é informado em segundos, com precisão de décimos.

- `0`: a letra começa junto com o acorde;
- `0,5`: a letra começa meio segundo depois do acorde;
- `1,4`: a letra começa um segundo e quatro décimos depois do acorde.

O campo fica desabilitado enquanto o item não possuir texto na passagem selecionada. Ao apagar a letra, seu atraso também é removido. A ação **Duplicar anterior** copia o texto e o atraso da passagem anterior.

O texto padrão também pode possuir seu próprio atraso. Quando ele for utilizado como reserva para uma passagem sem texto específico, o atraso padrão será aplicado juntamente com o texto.

## Execução e contador

A linha do tempo soma o atraso ao instante inicial do acorde. O contador regressivo e a apresentação da letra usam esse instante calculado, tanto na interface principal quanto no painel compacto.

Quando o atraso desloca a entrada para dentro do acorde seguinte, as letras são reordenadas pelo instante real de apresentação. Isso impede que o contador anuncie uma letra posterior antes de outra que efetivamente deva entrar primeiro.

## Estrutura do JSON

O atraso é armazenado em milissegundos dentro da própria passagem:

```json
{
  "lyrics": [
    {
      "passage": 1,
      "text": "Glória a Deus nas alturas",
      "delayMs": 1200
    },
    {
      "passage": 2,
      "text": "E paz na terra",
      "delayMs": 600
    }
  ],
  "lyricDefault": "Texto de reserva",
  "lyricDefaultDelayMs": 400
}
```

A interface aceita atrasos entre 0 e 60 segundos. Valores iguais a zero não são gravados, mantendo o JSON compacto.

O formato interno da música passou para 27, e o formato portátil `gera-song` passou para 10. Músicas das versões anteriores permanecem compatíveis e recebem atraso zero quando o campo não existir.

## Arquivos principais

- `index.html`
- `js/lyrics.js`
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

Resultado: **319 testes aprovados, 0 falhas**.
