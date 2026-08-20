/**
 * Controlador dos comandos do painel compacto do GERA.
 * Preserva o DOM existente e encaminha cada ação ao núcleo responsável.
 */
(function(global){
 'use strict';

 function createController(options){
  const getElement=options.getElement;

  function element(id){return getElement(id)}
  function bindClick(id,handler){
   const control=element(id);
   if(control)control.onclick=handler;
  }
  function bindChange(id,handler){
   const control=element(id);
   if(control)control.onchange=function(){handler(this.value,this)};
  }
  function bind(){
   bindClick('compact-mode-toggle',options.toggleMode);
   bindClick('compact-mode-close',options.closeMode);
   bindClick('compact-songs-open',options.openSongs);
   bindClick('compact-play',options.playStandard);
   bindClick('compact-sequence-only',options.playSequenceOnly);
   bindClick('compact-loop',options.toggleLoop);
   bindClick('compact-drum-only',options.toggleDrums);
   bindClick('compact-drum-fill',function(){options.requestDrumAction('fill')});
   bindClick('compact-drum-ending',function(){options.requestDrumAction('ending')});
   bindClick('compact-capo-down',function(){options.adjustCapo(-1)});
   bindClick('compact-capo-up',function(){options.adjustCapo(1)});
   bindClick('compact-octave-down',function(){options.adjustOctave(-1)});
   bindClick('compact-octave-up',function(){options.adjustOctave(1)});
   bindChange('compact-circle-root',options.changeCircleRoot);
   bindChange('compact-list-select',options.changeList);
   bindClick('compact-prev-song',function(){options.goRelative(-1)});
   bindClick('compact-next-song',function(){options.goRelative(1)});
   bindChange('compact-transition-mode',options.changeTransitionMode);
   bindChange('compact-next-start-mode',options.changeNextStartMode);
   bindChange('compact-list-end-mode',options.changeListEndMode);
   bindClick('compact-carousel-prev',function(){options.scrollCarousel(-1)});
   bindClick('compact-carousel-next',function(){options.scrollCarousel(1)});
  }

  return Object.freeze({bind:bind});
 }

 global.GeraCompactPanel=Object.freeze({createController:createController});
})(window);
