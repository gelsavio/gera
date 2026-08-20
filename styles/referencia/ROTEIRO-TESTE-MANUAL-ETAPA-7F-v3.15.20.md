# Roteiro de teste manual — Etapa 7F

Data: 4 de agosto de 2026  
Versão: 3.15.20

1. Na versão 3.15.19, salvar ajustes personalizados nas seis memórias e anotar os resumos exibidos.
2. Atualizar para 3.15.20 sem limpar os dados do navegador.
3. Confirmar que cada botão mantém a indicação de memória personalizada e recupera os mesmos ajustes.
4. Substituir uma memória, recarregar o aplicativo e confirmar a permanência do novo conteúdo.
5. Em uma instalação sem memória personalizada, confirmar que as seis posições continuam aplicando os presets de fábrica.
6. Exportar uma música com seções A–P, repetições, pausas, BPM, capotraste, bateria incorporada, entradas, saídas e encerramentos.
7. Comparar o JSON exportado na versão 3.15.20 com o produzido pela 3.15.19, desconsiderando somente `exportedAt`.
8. Importar arquivos válidos `gera-song` e `teclado-virtual-song` e confirmar o mesmo resultado anterior.
9. Tentar importar JSON inválido, formato desconhecido, arquivo sem seções e arquivo acima de 5 MB; conferir as mensagens existentes.
10. Exportar um conjunto completo de bateria, importá-lo nos modos de sobreposição e de adição e verificar as contagens exibidas.
11. Confirmar que temas, músicas, listas, sequências, motor de bateria e padrões personalizados continuam persistidos após recarregar.
12. Testar atualização instalada e abertura offline após a ativação do novo SERVICE WORKER.
13. Repetir os testes em computador, tablet e celular.

Os testes de download, seleção de arquivo e confirmação no navegador real não são substituídos pela suíte automatizada.
