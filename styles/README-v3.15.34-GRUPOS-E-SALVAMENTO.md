# GERA v3.15.34 — grupos de sequências e salvamento automático

Versão concluída em 15 de agosto de 2026, a partir da versão 3.15.33.

## Repetição de conjunto

A área **Repetir conjunto** permite escolher a primeira sequência, a última sequência, a quantidade de passagens e o destino seguinte. A configuração `A–B ×3 → C` produz:

`A → B → A → B → A → B → C`

As repetições individuais continuam válidas dentro de cada passagem. Se A estiver em `2`, o mesmo conjunto produz:

`A → A → B → A → A → B → A → A → B → C`

Cada sequência conserva instrumento, bateria e métrica próprios. Loop manual e escolha manual de seção prevalecem sobre o conjunto.

## Colagem entre métricas

**Colar ao final** é bloqueado quando origem e destino usam métricas diferentes, como 4/4 e 3/4. O bloqueio evita que frações idênticas sejam interpretadas com durações diferentes. Para preservar a execução, use **Colar substituindo** ou cole o conteúdo em outra sequência e configure um conjunto.

## Salvamento

Alterações de conteúdo, BPM, capotraste, repetição, ordem, bateria, instrumento, transições e conjunto marcam a música como modificada. Uma música já nomeada é atualizada automaticamente após 700 ms sem novas alterações.

Os botões **Salvar** da barra da música e da aba Músicas gravam imediatamente. O indicador apresenta **Alterações não salvas**, **Salvando...**, **Salvo** ou **Erro ao salvar**. Uma música ainda sem nome abre o diálogo para nomeação. A troca de música é bloqueada se houver uma gravação pendente que não possa ser concluída.

## Compatibilidade

Músicas antigas continuam sendo importadas sem grupo ativo. O JSON portátil passa ao `formatVersion: 6`, e o registro interno da música passa ao `formatVersion: 23`.

