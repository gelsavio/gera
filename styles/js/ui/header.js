/**
 * Controlador das ações do cabeçalho visível do GERA.
 * Preserva o DOM existente e encaminha os comandos aos controles legados.
 */
(function(global){
 'use strict';

 function createController(options){
  const getElement=options.getElement;
  const activateSongs=options.activateSongs;
  const updateReadouts=options.updateReadouts||function(){};
  const schedule=options.schedule||function(callback,delay){return global.setTimeout(callback,delay)};

  function element(id){return getElement(id)}
  function clickLegacy(id){
   const target=element(id);
   if(target)target.click();
  }
  function bindClick(id,handler){
   const button=element(id);
   if(button)button.onclick=handler;
  }
  function bind(){
   bindClick('redesign-theme',function(){
    clickLegacy('theme-cycle');
    schedule(updateReadouts,20);
   });
   bindClick('redesign-manual',function(){clickLegacy('manual-btn')});
   bindClick('redesign-compact',function(){clickLegacy('compact-mode-toggle')});
   bindClick('redesign-fullscreen',function(){clickLegacy('fullscreen')});
   bindClick('redesign-song-pill',activateSongs);
  }

  return Object.freeze({bind:bind});
 }

 global.GeraHeader=Object.freeze({createController:createController});
})(window);
