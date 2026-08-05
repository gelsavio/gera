# Resultados dos testes — Etapa 7A

Data: **4 de agosto de 2026**

- **168 de 168 testes automatizados aprovados**.
- Dez testes específicos de armazenamento aprovados.
- Leitura de dados existentes confirmada sem regravação.
- Ausência de preferências confirmada com os mesmos valores-padrão dos consumidores legados.
- JSON da posição do botão confirmado sem alteração de formato.
- Falhas de leitura e escrita confirmadas como silenciosas.
- Acesso direto às quatro chaves migradas ausente de `index.html`.
- Grupos posteriores confirmados no núcleo legado.
- Reversão exclusiva da 7A recompôs `index.html`, `sw.js` e `manifest.json` da versão 3.15.14 byte a byte.
- Arquivos funcionais fora do escopo comparados byte a byte com a versão 3.15.14.
- Cinco blocos JAVASCRIPT inline e treze arquivos JAVASCRIPT externos verificados sintaticamente.
- Manifesto e lista de pré-cache verificados.
- `index.html`, `js/storage.js`, `sw.js` e `manifest.json` responderam por HTTP com status 200.
- Somente `js/storage.js` foi acrescentado ao pré-cache; nenhum recurso anterior foi removido.

Os testes visuais em navegador e em dispositivo real permanecem no roteiro manual.
