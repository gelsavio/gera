# GERA v3.15.31 — melhorias do editor de sequências

Versão concluída em 9 de agosto de 2026, a partir da base auditada v3.15.30.

## Campo harmônico no modal

O seletor linear de tonalidade foi substituído por um círculo em formato de relógio. O círculo serve exclusivamente para selecionar o campo harmônico. Os sete acordes diatônicos e os dominantes secundários ficam em um painel separado à direita, evitando que a tonalidade seja confundida com o acorde inserido.

## Copiar e colar sequência

Os botões **Copiar sequência** e **Colar sequência** ficam no rodapé do Modal de Edição de Sequência, próximos de **Zerar sequência**. A cópia permanece disponível durante a troca de música.

**Colar substituindo** troca os itens do destino e também copia repetição, instrumento, próxima sequência, padrão de bateria, entrada, saída, encerramento e dados incorporados do ritmo. Se o destino tiver conteúdo, a substituição exige confirmação.

**Colar ao final** acrescenta acordes, notas e pausas ao final do destino, com todos os dados próprios de cada item, e preserva as configurações gerais da sequência de destino.

A cópia é independente da origem. Alterações posteriores em uma das sequências não modificam a outra. O botão de colagem permanece desabilitado enquanto a área de transferência estiver vazia. Se o modal for cancelado após uma colagem, itens, repetições e configurações retornam ao estado anterior à abertura.

## Integridade

- Versão visual, manifesto e cache: 3.15.31.
- Pré-cache: 47 entradas, sem duplicidade.
- DOM: 302 identificadores únicos.
- JAVASCRIPT: cinco blocos inline e 21 arquivos externos sintaticamente válidos.
- Suíte cumulativa: 270 testes aprovados.
- Sem operador de coalescência nula.

Os recursos acústicos continuam previstos no pré-cache, mas a pasta `kit-acustico-selecionado` não acompanha a base recebida.
