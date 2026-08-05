# Resultados dos testes — Etapa 8A

Data: 4 de agosto de 2026  
Versão: 3.15.21

Foram aprovadas 187 de 187 verificações automatizadas.

- Os cinco comandos do cabeçalho preservam os destinos e o atraso de 20 ms do tema.
- A ausência eventual de um controle histórico continua sendo tolerada.
- O módulo é carregado antes do bloco de montagem da interface.
- As atribuições duplicadas foram removidas do núcleo.
- A reversão exclusiva da Etapa 8A recompõe a versão 3.15.20 byte a byte.
- As quantidades globais permanecem em 2 `setInterval`, 42 `setTimeout`, 59 `addEventListener` e 2 `requestAnimationFrame`.
- O SERVICE WORKER mantém uma única entrada de `js/ui/header.js` no pré-cache.
- Nenhuma divergência foi detectada nos testes cumulativos de áudio, teoria musical, estado, transporte, bateria, sequência, painel ou persistência.

Permanecem pendentes os testes visuais, sonoros, de tela cheia, atualização, abertura offline e dispositivos reais previstos no roteiro manual.
