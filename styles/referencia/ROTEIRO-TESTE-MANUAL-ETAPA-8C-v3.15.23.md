# Roteiro de teste manual — Etapa 8C — v3.15.23

Data: 4 de agosto de 2026.

1. Abrir `index.html` por servidor HTTP e confirmar a exibição normal da interface.
2. Abrir a aba Teclado e confirmar a mesma quantidade, ordem, rótulos, oitavas, cores e dimensões das teclas da versão 3.15.22.
3. Tocar notas naturais e sustenidas com mouse e confirmar ataque, intensidade visual e liberação.
4. Arrastar entre teclas com o glissando ativado e desativado, comparando o comportamento com a versão 3.15.22.
5. Em tablet, tocar uma, duas, três e quatro teclas simultaneamente e confirmar vozes independentes.
6. Tentar um quinto contato e confirmar a mensagem `Limite de quatro teclas simultâneas` sem interromper os quatro contatos anteriores.
7. Soltar contatos, cancelar um gesto e retirar o foco da janela, confirmando que nenhuma nota fica presa.
8. Testar os modos de sustain Pressionada, Liberação e Até próxima, incluindo o tempo de liberação configurado.
9. Alterar instrumento e oitava e confirmar que o teclado é renderizado novamente e permanece centralizado.
10. Ativar a divisão do teclado, trocar o instrumento grave e verificar a fronteira sonora existente.
11. Ativar e desativar Toque sensível e comparar a intensidade tocando em posições verticais diferentes da tecla.
12. Usar as teclas físicas mapeadas, confirmar que repetição automática não duplica notas e que `keyup` libera a voz correta.
13. Confirmar que digitar em `INPUT`, `SELECT` ou `BUTTON` não toca notas.
14. Confirmar que acordes, círculo harmônico e o teclado de gravação do sequenciador permanecem inalterados.
15. Atualizar a instalação PWA da versão 3.15.22 para 3.15.23 e confirmar a ativação do novo cache.
16. Repetir em computador, tablet e celular.
