# Resultados dos testes — Etapa 6C — GERA v3.15.06

Data: 4 de agosto de 2026

## Automatizados

Foram aprovadas 52 verificações aplicáveis: 39 verificações herdadas das etapas anteriores e 13 verificações específicas do scheduler.

As verificações específicas confirmam ausência de início automático, condições de transporte parado e bloqueado, janela de 0,12 segundo, passos e instantes emitidos, ciclos modulares de 16 e 12 passos, rearmamento de 25 ms, gravação de uma referência de timer, ausência de timers concorrentes após inicializações repetidas, interrupção sem avanço, ausência de dependências de bateria, sequência, BPM, fronteiras e DOM, preservação de `transportScheduler`, reconstrução byte a byte da versão 3.15.05 e integridade dos recursos anteriores.

O evento `activate` foi simulado com os caches `gera-pwa-v3.15.04`, `gera-pwa-v3.15.05`, `gera-pwa-v3.15.06`, `teclado-virtual-pwa-v3.14.97` e `outro-cache`. A simulação excluiu os três caches antigos sujeitos aos prefixos do GERA e preservou `gera-pwa-v3.15.06` e `outro-cache`.

Os blocos JAVASCRIPT inline, os arquivos externos e o SERVICE WORKER foram submetidos a verificação sintática. O recurso novo foi solicitado por servidor HTTP e respondeu com sucesso. O ZIP foi submetido à verificação integral de compactação.

## Não automatizados

Não foram declarados como realizados testes sonoros, táteis, em segundo plano ou em dispositivo físico. A fidelidade temporal percebida, a política de suspensão de timers e a ausência de cadeias duplicadas em navegadores reais devem ser verificadas pelo roteiro manual em computador e dispositivo móvel.

## Limite da conclusão

Os testes comprovam equivalência estrutural e o contrato temporal isolado. Eles não autorizam concluir que imperfeições preexistentes de sincronização, Valsa, atrasos, contadores ou transições foram corrigidas; nenhuma dessas correções integra esta versão.
