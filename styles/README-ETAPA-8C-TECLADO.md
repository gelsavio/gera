# GERA v3.15.23 — Etapa 8C: teclado

Concluída em 4 de agosto de 2026.

Esta versão extrai para `js/ui/keyboard.js` a renderização e a ligação dos eventos do teclado musical principal já existente. O módulo monta as linhas de teclas naturais e sustenidas, preserva as dicas do teclado físico e concentra mouse, caneta, multitoque, glissando e liberação visual, enquanto o núcleo continua responsável por áudio, vozes, instrumentos, oitava, sustain, intensidade e estado musical.

O DOM estrutural, os IDs, as classes, os textos, a extensão das notas, o limite de quatro toques e os momentos de ataque e liberação não foram alterados. O teclado de gravação do sequenciador e os controles do painel de configurações permaneceram no núcleo.

O SERVICE WORKER usa o cache `gera-pwa-v3.15.23` e inclui `js/ui/keyboard.js` no pré-cache. A pasta `kit-acustico-selecionado`, ausente na base recebida, permanece pendente para a Etapa 13.

A reversão exclusiva desta etapa recompõe a versão 3.15.22 byte a byte.
