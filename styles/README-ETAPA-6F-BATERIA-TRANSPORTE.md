# GERA v3.15.09 — Etapa 6F

Em 4 de agosto de 2026, a integração da bateria com o transporte mestre foi extraída para `js/transport/drum-sync.js`.

O módulo recebe os mesmos pares `step` e `when` produzidos pelo scheduler, preserva a espera pelo passo zero, encaminha o agendamento para `scheduleDrumStep`, respeita a janela de silêncio das sobreposições, inicia viradas e encerramentos e marca suas conclusões no mesmo ponto do ciclo anterior.

Permaneceram no núcleo legado os padrões e dados de bateria, a seleção dos eventos, instrumentos, intensidades, camadas, humanização, samples, choke, volumes, síntese sonora, interface, sequência de acordes e coordenação entre bateria e sequência. Os identificadores globais legados continuam preservados.

A versão do aplicativo e do manifesto passou a 3.15.09. O cache passou a `gera-pwa-v3.15.09`, e somente `js/transport/drum-sync.js` foi acrescentado ao `PRECACHE_URLS`.

A subetapa 6G não foi iniciada.
