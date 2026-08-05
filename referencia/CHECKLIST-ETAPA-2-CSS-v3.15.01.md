# Checklist manual — Etapa 2 do GERA v3.15.01

Execute o teste por HTTP ou HTTPS, inicialmente on-line e depois offline. Antes da validação, confirme que a pasta `kit-acustico-selecionado/` está no mesmo nível do `index.html`.

## Carregamento e integridade

- [ ] A página abre sem erro e sem conteúdo sem estilo.
- [ ] `styles/inline-style-01.css` responde corretamente.
- [ ] O console não registra erro de carregamento da folha de estilos.
- [ ] O aplicativo indica a versão 3.15.01.
- [ ] Dados existentes do `localStorage` continuam disponíveis.

## Cabeçalho e responsividade

- [ ] O cabeçalho preserva dimensões, alinhamento e ações em tela larga.
- [ ] O cabeçalho preserva dimensões, quebras e ações em tela estreita.
- [ ] A `redesign-rail` mantém posição, largura, rolagem e estados.
- [ ] A orientação horizontal e a vertical mantêm o comportamento anterior.

## Painel compacto

- [ ] O painel abre e fecha sem deslocamentos inesperados.
- [ ] Contador regressivo e área de letras mantêm o espaço reservado.
- [ ] O carrossel não pisca nem é visualmente reconstruído ao tocar ou parar.
- [ ] Música, bateria e os três modos de transporte mantêm os estados corretos.
- [ ] A seleção de uma lista carrega a primeira música sem iniciar a execução.

## Componentes visuais

- [ ] Teclado, sustenidos, oitavas e controles preservam disposição e cores.
- [ ] Acordes, círculo harmônico, inversões e sustain preservam o visual.
- [ ] Bateria, pads, seletores e editor de ritmos preservam o layout.
- [ ] Sequências, seções, itens, durações e controles preservam o layout.
- [ ] Painéis normal, compacto e avançado preservam tamanhos e espaçamentos.
- [ ] Todos os modais abrem, centralizam, rolam e fecham como antes.

## Temas

- [ ] Tema neutro preservado.
- [ ] Tema claro preservado.
- [ ] Tema escuro preservado.
- [ ] Temas oceano, floresta e violeta preservados.
- [ ] A abertura no tema salvo não produz clarão visual indevido.

## PWA e funcionamento offline

- [ ] O SERVICE WORKER instala usando o cache `gera-pwa-v3.15.01`.
- [ ] O novo CSS aparece entre os recursos pré-armazenados.
- [ ] O cache antigo `gera-pwa-v3.14.97` é removido após a ativação.
- [ ] O aplicativo pode ser instalado ou atualizado.
- [ ] Após uma abertura on-line completa, o aplicativo reabre offline com estilos.
- [ ] Ícones, manual, página offline e samples continuam acessíveis.

## Funções críticas de regressão

- [ ] Notas, acordes e instrumentos produzem áudio.
- [ ] Sustain e tempo de liberação mantêm o comportamento anterior.
- [ ] Bateria e música iniciam separadamente e em conjunto.
- [ ] A sincronização no início do compasso permanece correta.
- [ ] BPM, troca de sequência e painel compacto permanecem sincronizados.

Não avance para a extração do JAVASCRIPT enquanto este checklist não estiver confirmado no navegador e no dispositivo real.
