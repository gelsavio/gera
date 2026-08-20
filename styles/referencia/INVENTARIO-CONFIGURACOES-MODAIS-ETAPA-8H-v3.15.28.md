# Inventário — Etapa 8H: configurações e modais

Data: 5 de agosto de 2026  
Base: GERA v3.15.27 — Etapa 8G  
Resultado: GERA v3.15.28 — Etapa 8H

## Superfícies incluídas

- Campos de liberação, ataque, intervalo do arpejo e volumes geral, teclado, acordes, baixo e bateria.
- Campo de BPM, validação visual, confirmação por alteração, perda de foco e tecla Enter.
- Botões de ajuste fino associados aos campos numéricos.
- Instrumento, oitava, capotraste, sustain, execução conjunta ou em arpejo, padrão do arpejo, inversão e ritmo dos acordes.
- Divisão do teclado, instrumento da região grave, toque sensível, glissando, acompanhamento contínuo e baixo automático.
- Seleção do tempo de troca de acorde e da duração de pausa.
- Preparação, salvamento e recuperação das seis memórias.
- Painel avançado, tela cheia, parada do acompanhamento, mute global e bloqueio do menu de contexto sobre teclas e acordes.
- Diálogo compartilhado `#app-confirm-dialog`, incluindo confirmação, cancelamento e interceptação da tecla Escape.

## Responsabilidades preservadas no núcleo

- Variáveis e normalização do estado musical.
- Criação, liberação e roteamento de vozes de áudio.
- Transporte, sincronização, compassos e agendamento.
- Aplicação, persistência e descrição das memórias.
- Regras de bloqueio de troca de instrumento.
- Mensagens de estado e decisões de início, parada ou alteração no próximo compasso.

## Arquivos funcionais alterados

- `index.html`
- `sw.js`
- `manifest.json`
- `js/ui/settings-modals.js` — novo

## Paridade estática

- `setInterval`: 2
- `setTimeout`: 42
- `addEventListener`: 59
- `requestAnimationFrame`: 2
- Blocos JAVASCRIPT inline: 5
- Arquivos JAVASCRIPT externos: 21
- Entradas do pré-cache: 47, sem duplicidade

O HTML estrutural, os estilos e os controles permaneceram em suas posições anteriores. A etapa não converteu scripts para ES Modules e não alterou áudio, transporte, bateria, sequências, músicas, biblioteca ou persistência.
