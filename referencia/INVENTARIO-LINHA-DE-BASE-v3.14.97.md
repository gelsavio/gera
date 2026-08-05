# Inventário da linha de base do GERA v3.14.97

Data do registro: **3 de agosto de 2026**

## 1. Identificação

O aplicativo preservado é o **GERA — Gerador de Acompanhamentos v3.14.97**. A linha de base não cria uma nova versão funcional: ela apenas acrescenta documentação e uma cópia identificada do monólito.

O `index.html` possui 12.913 linhas e 545.299 bytes, com um bloco CSS inline de 4.018 linhas e cinco blocos JAVASCRIPT clássicos. Não há framework, bundler, `package.json`, módulo ES ou etapa de compilação.

## 2. Estrutura recebida e preservada

```text
/
├── index.html
├── manifest.json
├── sw.js
├── offline.html
├── manual-gera.html
├── INSTRUCOES-PWA.txt
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── icon-maskable-512.png
```

Arquivos acrescentados somente para referência:

```text
/
├── README-LINHA-DE-BASE.md
└── referencia/
    ├── index.monolitico-original-v3.14.97.html
    ├── DIAGNOSTICO-MODULARIZACAO-GERA-v3.14.97.md
    ├── INVENTARIO-LINHA-DE-BASE-v3.14.97.md
    ├── CHECKLIST-VERSAO-DE-REFERENCIA-v3.14.97.md
    └── SHA256SUMS.txt
```

Dependência exigida pelo código, mas ausente no pacote recebido:

```text
/kit-acustico-selecionado/
├── MAPEAMENTO.txt
├── cymbals/           3 WAV
├── hihat/             4 WAV
├── kick/              3 WAV
├── snare/             3 WAV
└── toms/              3 WAV
```

## 3. Ordem dos blocos internos do `index.html`

| Ordem | Linhas aproximadas | Conteúdo | Regra de preservação |
|---:|---:|---|---|
| 1 | 19–32 | Leitura antecipada de `geraTheme` | Deve continuar no `head`, antes do CSS |
| CSS | 33–4.052 | Único bloco de estilos inline | A ordem da cascata não pode mudar |
| 2 | 4.824–11.382 | Núcleo do aplicativo | Mantém 622 declarações globais |
| 3 | 11.384–11.399 | Registro do SERVICE WORKER | Executa no evento `load`, em HTTP/HTTPS |
| 4 | 11.404–12.550 | Redesign e painel compacto | IIFE dependente de 69 símbolos do núcleo |
| 5 | 12.594–12.911 | Editor de ritmos | IIFE dependente de 25 símbolos do núcleo |

## 4. Persistência no `localStorage`

Foram registradas 12 famílias de chaves. Nenhuma chave ou formato foi alterado nesta etapa.

| Chave ou família | Conteúdo preservado |
|---|---|
| `geraTheme` | Tema `dark`, `neutral`, `light`, `ocean`, `forest` ou `violet` |
| `geraDrumPatternLibraryV1` | `{version, patterns}` da biblioteca de ritmos |
| `tecladoVirtualSongSections` | Seções, repetição, ordem, bateria, motor e visibilidade |
| `tecladoVirtualChordSequence` | Sequência única legada usada como fallback |
| `geraSongListsV1` | `{version:1, lists}` |
| `geraPlaylistSettingsV1` | Lista ativa, índice e regras do painel compacto |
| `tecladoVirtualSongs` | `{songs, lastSong}` |
| `tecladoVirtualDrumEngine` | `acoustic` ou `synth` |
| `tecladoVirtualMemory1` a `tecladoVirtualMemory6` | Seis snapshots de configurações |
| `geraRedesignTab` | Aba ativa do redesign |
| `geraGlobalMutePositionV1` | Posição do botão flutuante de mute |
| `geraRedesignRailCollapsed` | Estado recolhido do trilho lateral, `1` ou `0` |

Não há uso de `sessionStorage`, INDEXEDDB ou backend. O CACHE STORAGE do SERVICE WORKER é independente do `localStorage`; a atualização ou remoção de caches não deve apagar essas chaves.

## 5. PWA e cache

| Item | Valor de referência |
|---|---|
| Versão no `manifest.json` | `3.14.97` |
| Nome do cache | `gera-pwa-v3.14.97` |
| Prefixo atual | `gera-pwa-` |
| Prefixo legado removido no `activate` | `teclado-virtual-pwa-` |
| Página offline | `./offline.html` |
| Registro do SERVICE WORKER | `./sw.js`, apenas em HTTP/HTTPS |
| Instalação | Pré-cache integral por `cache.addAll()` e `skipWaiting()` |
| Ativação | Remove caches antigos dos dois prefixos e chama `clients.claim()` |
| Navegação | Network-first, com fallback para requisição, `index.html` e `offline.html` |
| Áudio, imagem, estilo, script e fonte | Cache-first |
| Demais GETs da mesma origem | Network-first |

### Recursos declarados em `PRECACHE_URLS`

- Raiz `./`.
- Três ícones.
- `index.html`.
- `manifest.json`.
- `manual-gera.html`.
- `offline.html`.
- `kit-acustico-selecionado/MAPEAMENTO.txt`.
- Dezesseis samples WAV do kit acústico.

Os 17 recursos do kit acústico não estão fisicamente presentes nesta linha de base porque não integravam o pacote fornecido.

## 6. Arquivos funcionais que não foram modificados

Os hashes de `index.html`, `sw.js` e `manifest.json` são idênticos aos registrados no diagnóstico da etapa 0. A cópia `referencia/index.monolitico-original-v3.14.97.html` deve possuir exatamente o mesmo hash do `index.html` executável.

Não houve extração de estilos, externalização de scripts, mudança de DOM, renomeação de IDs, alteração de `localStorage`, atualização de `CACHE_NAME`, inclusão em `PRECACHE_URLS` ou modificação de comportamento audível, visual ou temporal.
