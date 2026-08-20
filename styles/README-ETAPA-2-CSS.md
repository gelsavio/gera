# GERA — Etapa 2 da modularização

Versão: **3.15.01**  
Data: **3 de agosto de 2026**

Esta versão realiza exclusivamente a extração literal do único bloco CSS inline do `index.html` para `styles/inline-style-01.css`.

## Alterações funcionais autorizadas

- O conteúdo situado entre `<style>` e `</style>` foi transferido sem reordenação, consolidação, renomeação, formatação ou eliminação de regras.
- O bloco removido foi substituído por um único `<link rel="stylesheet" href="./styles/inline-style-01.css">` na mesma posição lógica do `<head>`.
- Os cinco blocos JAVASCRIPT permanecem inline, na mesma ordem e com conteúdo idêntico ao da versão 3.14.97.
- O cache do SERVICE WORKER foi alterado de `gera-pwa-v3.14.97` para `gera-pwa-v3.15.01`.
- `styles/inline-style-01.css` foi acrescentado ao `PRECACHE_URLS`.
- A versão visual e a versão do manifesto foram atualizadas para 3.15.01.

## Arquivos alterados

- `index.html`
- `sw.js`
- `manifest.json`
- `INSTRUCOES-PWA.txt`

## Arquivos criados

- `styles/inline-style-01.css`
- `README-ETAPA-2-CSS.md`
- `referencia/CHECKLIST-ETAPA-2-CSS-v3.15.01.md`
- `referencia/SHA256SUMS-ETAPA-2-v3.15.01.txt`

## Preservação da referência

`referencia/index.monolitico-original-v3.14.97.html` contém a cópia integral do monólito estável usado na extração. Os documentos da linha de base e do diagnóstico permanecem apenas como referência e não integram o pré-cache.

## Dependência de implantação

A pasta `kit-acustico-selecionado/` não foi duplicada neste pacote porque foi informada como já presente na instalação. Os caminhos existentes no `index.html` e no `sw.js` foram preservados integralmente.

Nenhum JAVASCRIPT foi externalizado ou modularizado nesta etapa.
