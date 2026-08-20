# Resultados dos testes — Etapa 6A — GERA v3.15.04

Data: 4 de agosto de 2026

Resultado: 28 de 28 testes aprovados.

| Suíte | Aprovados | Falhas |
|---|---:|---:|
| contexto e barramentos de áudio | 4 | 0 |
| teoria musical | 6 | 0 |
| fonte única do estado de BPM | 4 | 0 |
| inventário estático do transporte | 14 | 0 |

As 14 verificações próprias confirmaram igualdade byte a byte dos arquivos funcionais, fonte única dos três estados de BPM, lookahead de 120 ms, polling de 25 ms, duração do passo, medidores de 16/12 passos, stride das fronteiras, latência inicial de 80 ms, filas de bateria e sequência no passo zero, aplicação de BPM pendente, parada conjunta, relógio textual, atualização visual, nome do cache, remoção de caches antigos e ausência dos artefatos de auditoria no pré-cache.

## Hashes funcionais preservados

```text
3639073bafb15cea72d0f650b78803e8a4f00b0c672f118be8214306b936c7d0  index.html
f1f4bb76229f05d4808eb80f80da74592394c9028dd1a17b7041de92187ba25a  sw.js
bae0780e077ecc69c5e067e7349b3f93607e5cce6ec6298abccbdd2d80785713  manifest.json
e5853d53b4a2de0dbda8dd6bc31624c107c21268cfd6fd6f4af4f2459112008f  styles/inline-style-01.css
eadf41914fd8dc7b01832185a5c09021a91b1fc593d2eeab1d2f2a08f90d92c0  js/chords.js
580c32a20393364ead1068fb194280e7c3c47f7f09386552f862fd6032b36c72  js/state.js
1b02b9f16004c2a5acbcb21016630d7ba06a5f09768c09229972ef00b1afd76f  js/audio/core.js
```

Os testes são estáticos e unitários. Não foram declarados como realizados testes auditivos, de toque, de suspensão de aba ou de instalação offline em navegador/dispositivo real.
