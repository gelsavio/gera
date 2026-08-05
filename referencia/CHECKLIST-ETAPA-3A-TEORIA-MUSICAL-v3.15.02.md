# Checklist manual — Etapa 3A do GERA v3.15.02

Data de referência: **03/08/2026**

## Inicialização e PWA

- [ ] O aplicativo abre por servidor HTTP estático sem erro no console.
- [ ] A interface indica a versão 3.15.02.
- [ ] A folha `styles/inline-style-01.css` continua carregando normalmente.
- [ ] O arquivo `js/chords.js` responde sem erro e é carregado antes do bloco principal.
- [ ] O SERVICE WORKER instala usando o cache `gera-pwa-v3.15.02`.
- [ ] O aplicativo reabre offline depois da instalação e do primeiro carregamento completo.
- [ ] A atualização preserva músicas, sequências, preferências e padrões personalizados salvos.

## Acordes e nomes

- [ ] Os 12 acordes maiores mantêm os mesmos nomes e posições.
- [ ] Os 12 acordes menores mantêm os mesmos nomes e posições.
- [ ] Acordes maiores, menores, com sétima, suspensos e diminutos produzem as mesmas notas.
- [ ] A 1ª e a 2ª inversões mantêm as mesmas notas e a mesma sonoridade.
- [ ] Rótulos como `Am`, `C#7`, `A#°`, `sus2`, `sus4` e `m7` permanecem iguais.
- [ ] Acordes com baixo alternativo continuam mostrando o mesmo rótulo após a barra.

## Círculo harmônico

- [ ] O botão CH abre e fecha o seletor como antes.
- [ ] Cada uma das 12 tonalidades mostra os mesmos sete graus.
- [ ] Tônica, subdominante, dominante e diminuto mantêm cores, títulos e posições.
- [ ] Os cinco dominantes secundários permanecem iguais e resolvem nos mesmos acordes-alvo.
- [ ] O círculo do painel compacto e o seletor da interface redesenhada permanecem sincronizados.

## Voicings e oitavas

- [ ] Piano, órgão, cordas, metais, pad, flauta e sino mantêm os mesmos voicings.
- [ ] Violão e harpa mantêm as mesmas formas e inversões automáticas.
- [ ] O baixo automático continua elevando os acordes nos mesmos instrumentos.
- [ ] A oitava salva em cada item da sequência continua respeitando os limites do teclado de 61 teclas.
- [ ] Notas negativas e transpostas continuam exibindo o mesmo nome normalizado.

## Regressão crítica

- [ ] O teclado toca normalmente com mouse e multitoque.
- [ ] Sustain, liberação, arpejo e acompanhamento contínuo permanecem iguais.
- [ ] A sequência grava, edita, salva, carrega e reproduz acordes normalmente.
- [ ] Bateria isolada e bateria com sequência mantêm os mesmos padrões e sincronização.
- [ ] Troca de BPM, início de compasso e troca de sequência permanecem iguais.
- [ ] O painel compacto preserva cartões, destaques, letras e botões sem reconstruções visuais.
- [ ] Temas, modais e demais painéis mantêm a aparência da versão 3.15.01.

## Teste automatizado

- [x] `node --test tests/chords.test.js`: 6 testes aprovados.
- [x] Comparação exaustiva dos resultados puros entre 3.15.01 e 3.15.02 aprovada.
- [x] Cinco blocos JAVASCRIPT inline sintaticamente válidos.
- [x] `js/chords.js` e `sw.js` sintaticamente válidos.
- [x] Dados de bateria comparados por hash e mantidos integralmente no monólito.
