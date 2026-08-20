# Inventário do áudio extraído — GERA v3.15.04

## Escopo extraído

| Identificador | Criação/modificação estrutural | Leitores e usos legados preservados |
| --- | --- | --- |
| `audioCtx` | `ensureAudio()` cria uma vez e chama `resume()` somente quando o estado é `suspended` | vozes, instrumentos, analisador, metrônomo, transporte, bateria sintética, samples e editor de ritmos consultam tempo ou criam nós |
| `masterGain` | criado e conectado ao limiter por `ensureAudio()`; ganho inicial vem de `master-volume` | recebe vozes, metrônomo, compressor da bateria e compressor do baixo; controle de volume atualiza o ganho |
| `limiter` | criado, configurado e conectado ao ganho de silenciamento por `ensureAudio()` | não há modificadores posteriores no legado |
| `appMuteGain` | criado e conectado ao destino por `ensureAudio()`; ganho inicial respeita `globalAudioMuted` | rotina global de silenciamento altera seu ganho durante a execução |
| `drumBus` | criado, recebe o volume inicial e é ligado ao compressor da bateria por `ensureAudio()` | samples e síntese da bateria enviam sinal ao barramento; controle de volume atualiza o ganho |
| `drumCompressor` | criado, configurado e ligado ao ganho mestre por `ensureAudio()` | não há modificadores posteriores no legado |
| `bassBus` | criado e ligado ao filtro passa-altas por `ensureAudio()` | criação de vozes seleciona este destino para o baixo automático |
| `bassHighpass` | criado e configurado por `ensureAudio()` | integra a cadeia exclusiva do baixo |
| `bassLowShelf` | criado e configurado por `ensureAudio()` | integra a cadeia exclusiva do baixo |
| `bassPresence` | criado e configurado por `ensureAudio()` | integra a cadeia exclusiva do baixo |
| `bassCompressor` | criado, configurado e ligado ao ganho mestre por `ensureAudio()` | integra a cadeia exclusiva do baixo |

## Ordem do grafo preservada

`drumBus → drumCompressor → masterGain`

`bassBus → bassHighpass → bassLowShelf → bassPresence → bassCompressor → masterGain`

`masterGain → limiter → appMuteGain → audioCtx.destination`

## Contrato de compatibilidade

`js/audio/core.js` é um script clássico e é carregado depois de `js/state.js` e antes do bloco JAVASCRIPT principal. Os onze identificadores e `ensureAudio()` permanecem acessíveis aos scripts clássicos posteriores. Não existe uma segunda declaração desses símbolos no `index.html`.

A função não é executada durante o carregamento do arquivo. A leitura de `$`, `globalAudioMuted`, `master-volume` e `drum-volume` ocorre apenas quando uma ação existente chama `ensureAudio()`.

## Elementos deliberadamente não extraídos

Permanecem no monólito `freq`, `vol`, `osc`, `createVoice`, envelopes, osciladores, instrumentos, analisador de intensidade, liberação de vozes, baixo automático, síntese de bateria, carregamento e reprodução de samples, transporte e sincronização.
