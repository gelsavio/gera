/*
 * Coordenação do ciclo de vida do transporte mestre do GERA.
 *
 * Este módulo centraliza somente a decisão de manter, iniciar ou encerrar o
 * transporte segundo os consumidores legados. Relógio, scheduler, bateria,
 * sequência, áudio, DOM, persistência e regras musicais permanecem externos e
 * são acessados exclusivamente por callbacks injetados.
 */
'use strict';

(function(global){
 function createCoordinator(options){
  function needed(){
   return !!options.isDrumRunning()||
    !!options.isDrumStartQueued()||
    !!options.isSequencePlaying()||
    !!options.isSequenceStartQueued()||
    !!options.hasLatchedChord()||
    !!options.hasPendingChord()||
    !!options.isStopQueued()||
    !!options.hasSequenceTransition()||
    !!options.hasQueuedDrumAction()||
    !!options.hasActiveDrumAction();
  }

  function ensure(){
   options.ensureAudio();
   if(options.isTransportRunning())return false;
   options.startTransport();
   return true;
  }

  function stopIfIdle(){
   if(needed())return false;
   options.stopTransport();
   return true;
  }

  return Object.freeze({
   needed:needed,
   ensure:ensure,
   stopIfIdle:stopIfIdle
  });
 }

 Object.defineProperty(global,'GeraTransportCoordinator',{
  configurable:false,
  enumerable:true,
  writable:false,
  value:Object.freeze({createCoordinator:createCoordinator})
 });
})(typeof window!=='undefined'?window:globalThis);
