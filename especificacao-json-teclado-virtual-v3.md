# Formato Teclado Virtual Song — versão 3

Arquivo-modelo: `modelo-tempo-perdio-format-v3.json`

## Identificação

- `app`: deve ser `Teclado Virtual`.
- `format`: deve ser `teclado-virtual-song`.
- `formatVersion`: `3`.

## Campos musicais principais

- `name`: nome da música.
- `bpm`: andamento inteiro entre 40 e 220.
- `auto`: modo automático contínuo.
- `autoEnd`: modo automático que encerra na última seção.
- `activeSection`: seção selecionada no momento da exportação.

## Bateria

### `drumEngine`

Valores aceitos:

- `acoustic`
- `synth`

### `ordemSecoes`

Lista explícita da ordem das seções. O consumidor deve percorrer esta lista, em vez de depender da ordem das chaves de objetos JSON.

### `compassos`

Objeto calculado pelo Teclado Virtual. Cada valor é a soma de `fraction` de todos os acordes e pausas daquela seção.

### `bateria`

Configuração por seção:

```json
{
  "padrao": "rock",
  "entrada": "fill",
  "final": null
}
```

`padrao` aceita:

- `rock`
- `forro`
- `bolero`
- `sertanejo`
- `balada`
- `suave`
- `bossa`
- `null`, para seção sem bateria

`entrada` aceita:

- `fill`
- `fillHalf`
- `null`

`final` aceita:

- `ending`
- `endingHalf`
- `null`

## Algoritmo recomendado para o GelCifras

1. Percorrer `ordemSecoes`.
2. Ignorar seções com `repeats[secao] <= 0`.
3. Aplicar `bateria[secao].entrada`, quando houver.
4. Executar `bateria[secao].padrao` por `compassos[secao] × repeats[secao]`.
5. Aplicar `bateria[secao].final`, quando houver.
6. Passar para a próxima seção.
7. `padrao: null` representa silêncio de bateria durante a seção.

## Compatibilidade

Arquivos antigos sem os novos campos continuam válidos. Valores padrão recomendados:

- `drumEngine`: `acoustic`
- `ordemSecoes`: `verse`, `prechorus`, `chorus`, `bridge`, `section5`, `section6`, `section7`, `section8`
- `bateria`: padrão `rock`, sem entrada e sem final
- `compassos`: recalcular a partir de `sections`, quando necessário
