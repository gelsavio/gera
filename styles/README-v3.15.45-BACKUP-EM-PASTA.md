# GERA v3.15.45 — Backup automático em pasta

## Entrega

Esta versão substitui o backup automático interno pelo mesmo modelo de backup externo usado como referência no GELCIFRAS. O usuário escolhe uma pasta do equipamento e o GERA passa a manter nela uma cópia atualizada do acervo.

A pasta também pode estar dentro de uma área sincronizada pelo GOOGLE DRIVE, desde que ela apareça normalmente no seletor de pastas do sistema. Não há acesso direto à conta do GOOGLE DRIVE nem envio por API.

## Como configurar

1. Abra a guia **Músicas**.
2. Na seção **Backup automático em pasta**, pressione **Escolher pasta**.
3. Selecione ou crie a pasta que receberá os backups.
4. Autorize leitura e gravação quando o navegador solicitar.

O navegador preserva a referência da pasta no IndexedDB. Se a permissão não continuar ativa depois de fechar o aplicativo, use **Reativar**.

## Arquivos gerados

- `gera-backup.json`: cópia principal e mais recente.
- `gera-backup-anterior.json`: cópia preservada antes de uma redução crítica confirmada.

O backup contém músicas, listas, preferências de execução das listas e padrões personalizados de bateria capturados pelo armazenamento central do GERA.

## Proteções

- Alterações são agrupadas por um debounce de 3 segundos.
- Um acervo sem músicas nunca substitui um backup válido.
- Se a nova cópia tiver redução superior a 75% na quantidade de músicas, o GERA solicita confirmação.
- Quando a redução é aceita, a cópia principal existente é gravada primeiro em `gera-backup-anterior.json`.
- Se a confirmação for recusada, os arquivos existentes permanecem intactos.
- Ao abrir sem músicas, o aplicativo oferece recuperação por pasta conhecida, escolha de outra pasta ou arquivo JSON.
- A restauração recompõe o acervo e recarrega o aplicativo, sem iniciar automaticamente uma música.

## Compatibilidade e alternativa manual

O backup automático em pasta depende da File System Access API, disponível principalmente em navegadores baseados em Chromium. Quando o seletor de pasta não estiver disponível, o GERA gera `gera-backup.json` por download manual e permite restaurá-lo pelo botão **Selecionar arquivo**.

## Interface e PWA

- O cartão de configuração foi incluído na guia **Músicas**.
- Há ações separadas para escolher a pasta, gravar imediatamente, reativar a autorização e restaurar.
- O diálogo de recuperação mostra a cópia principal e a anterior quando ambas forem válidas.
- `js/folder-backup.js` participa do pré-cache do SERVICE WORKER.
- Cache, manifesto e identificação visual foram atualizados para `3.15.45`.

## Rodapé

Foi preservado o rodapé institucional:

> © 2026 GERA — Gerador de Acompanhamentos. Todos os direitos reservados.

## Arquivos principais alterados

- `index.html`
- `js/folder-backup.js`
- `styles/inline-style-01.css`
- `manifest.json`
- `sw.js`
- testes de backup, restauração, paridade, cache e rodapé

## Validação

Comando executado:

```text
node --check js/folder-backup.js
node --test
```

Resultado: **311 testes aprovados, 0 falhas**.
