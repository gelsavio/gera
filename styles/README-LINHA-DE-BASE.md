# GERA — linha de base da modularização

Versão funcional preservada: **3.14.97**  
Data da linha de base: **3 de agosto de 2026**  
Etapa: **1 — cópia de segurança e linha de base**

Esta entrega preserva sem alteração o aplicativo monolítico diagnosticado na etapa 0. Nenhum CSS ou JAVASCRIPT foi extraído, reorganizado, formatado ou renomeado. O `index.html`, o `sw.js`, o `manifest.json`, o manual, a página offline, as instruções e os ícones são cópias byte a byte da versão 3.14.97 recebida.

## Arquivos de referência acrescentados

- `referencia/index.monolitico-original-v3.14.97.html`: cópia identificada do `index.html` original.
- `referencia/DIAGNOSTICO-MODULARIZACAO-GERA-v3.14.97.md`: diagnóstico técnico da etapa 0.
- `referencia/INVENTARIO-LINHA-DE-BASE-v3.14.97.md`: estrutura do projeto, persistência, PWA e versão do cache.
- `referencia/CHECKLIST-VERSAO-DE-REFERENCIA-v3.14.97.md`: roteiro de validação manual antes da próxima etapa.
- `referencia/SHA256SUMS.txt`: hashes SHA-256 dos arquivos da linha de base.

## Integridade funcional

O arquivo executável continua sendo `index.html`. A cópia existente em `referencia/` não é carregada pelo aplicativo nem pelo SERVICE WORKER. Os documentos de referência também não integram `PRECACHE_URLS` e não alteram o funcionamento do PWA.

## Dependência acústica não incluída na origem

O `sw.js` e o `index.html` referenciam `kit-acustico-selecionado/MAPEAMENTO.txt` e 16 samples WAV. A pasta não estava no pacote 3.14.97 recebido e não foi localizada nos arquivos disponíveis. Por fidelidade à linha de base, nenhum sample substituto foi criado e o código não foi alterado.

Consequência conhecida: quando esta entrega for publicada isoladamente, a instalação integral do cache poderá falhar em `cache.addAll(PRECACHE_URLS)`. Quando usada sobre uma implantação que já contenha a pasta acústica correta, os caminhos permanecem compatíveis. Essa pendência deverá ser resolvida em tarefa própria, sem ser misturada à extração de CSS ou JAVASCRIPT.

## Regra para avanço

A etapa 2 somente deve começar depois que o checklist manual for executado em um ambiente que contenha o kit acústico original ou depois de o kit ser fornecido e incorporado sem alteração do código. A próxima alteração estrutural prevista é a extração literal do único bloco CSS para um único arquivo externo, preservando integralmente a cascata.
