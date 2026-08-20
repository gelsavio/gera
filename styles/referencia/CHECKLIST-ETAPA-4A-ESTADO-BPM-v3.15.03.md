# Checklist manual — Etapa 4A: estado de BPM — GERA v3.15.03

## Inicialização

- [ ] Abrir o aplicativo e confirmar BPM inicial 100 em todos os indicadores.
- [ ] Confirmar que não há erro no console ao carregar `js/state.js`.
- [ ] Confirmar que instrumentos, acordes e bateria continuam disponíveis.

## Alteração de BPM

- [ ] Alterar o BPM pelo campo principal usando digitação.
- [ ] Alterar o BPM pelos botões de incremento e redução.
- [ ] Alterar o BPM pelos controles do redesign e confirmar sincronização.
- [ ] Confirmar limites mínimo 40 e máximo 220.
- [ ] Com transporte parado, confirmar aplicação imediata.
- [ ] Com bateria ou sequência em execução, confirmar aplicação no mesmo
  momento musical da versão 3.15.02.
- [ ] Confirmar a indicação “próximo compasso” quando houver mudança pendente.

## Subsistemas que leem BPM

- [ ] Ligar o metrônomo e testar ao menos três andamentos.
- [ ] Iniciar a bateria e conferir estabilidade do tempo.
- [ ] Iniciar acompanhamento contínuo e sequência automática.
- [ ] Alterar BPM durante bateria e sequência sincronizadas.
- [ ] Testar um padrão ternário sem corrigir ou alterar o comportamento atual.
- [ ] Abrir o painel compacto e conferir o BPM exibido.

## Persistência

- [ ] Salvar música com BPM próprio, trocar o BPM e recarregar a música.
- [ ] Ajustar o BPM de uma música pelo diálogo da biblioteca.
- [ ] Exportar e importar sequência com BPM.
- [ ] Aplicar cada memória de ajustes e conferir o BPM indicado.
- [ ] Reabrir o aplicativo e confirmar as configurações já persistidas.

## PWA

- [ ] Confirmar instalação ou atualização para v3.15.03.
- [ ] Recarregar após ativação do novo SERVICE WORKER.
- [ ] Abrir offline e confirmar carregamento de `js/state.js`.
- [ ] Confirmar que dados do `localStorage` não foram apagados.

## Critério de avanço

Não centralizar outros estados enquanto qualquer item diretamente relacionado
ao BPM apresentar divergência em relação à versão 3.15.02.
