# Resultados dos testes — Etapa 8D — v3.15.24

Data: 4 de agosto de 2026.

## Automação

- 208 de 208 testes aprovados;
- controlador carregado sem iniciar áudio, transporte ou temporizadores;
- doze acordes maiores e doze menores renderizados na ordem legada;
- sete graus diatônicos, funções harmônicas e acorde diminuto validados;
- dominantes secundários, destinos e rótulos preservados;
- diálogo legado, botão CH e seletor circular do novo layout validados;
- eventos de ponteiro encaminhados ao núcleo sem reinterpretar a reprodução;
- rotinas visuais diretas anteriores removidas do núcleo;
- `js/ui/chords-circle.js` incluído uma única vez no pré-cache;
- cinco blocos JAVASCRIPT inline e dezessete arquivos JAVASCRIPT externos sintaticamente válidos;
- manifesto válido e pré-cache com 43 entradas sem duplicidade;
- reversão exclusiva da 8D para 3.15.23 aprovada byte a byte;
- reversões históricas das etapas anteriores preservadas;
- contagens de temporizadores, listeners e animações inalteradas.

## Pendências manuais

Os testes visuais, sonoros, de toque em hardware, atualização do PWA e dispositivos reais continuam pendentes. A ausência herdada da pasta de samples impede validar integralmente a bateria acústica e a instalação offline completa.
