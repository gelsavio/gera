/*
 * Aplicação das mudanças de BPM no transporte mestre do GERA.
 *
 * Este módulo modifica exclusivamente o estado canônico mantido em
 * GeraState.tempo. A interface, a persistência, o scheduler, as fronteiras,
 * a bateria e a sequência permanecem no núcleo legado.
 */
'use strict';

(function(global){
 function createController(options){
  const tempo=global.GeraState.tempo;

  function requestChange(value,isTransportRunning){
   const requested=options.normalize(value);
   if(isTransportRunning){
    if(requested===tempo.bpm){
     tempo.pendingBpm=null;
    }else{
     tempo.pendingBpm=requested;
    }
    return requested;
   }

   tempo.bpm=requested;
   tempo.transportTempoBpm=tempo.bpm;
   tempo.pendingBpm=null;
   return requested;
  }

  function applyAtBoundary(value){
   tempo.bpm=options.normalize(value);
   tempo.transportTempoBpm=tempo.bpm;
   tempo.pendingBpm=null;
   return tempo.bpm;
  }

  function schedulePendingAtStep(step,when){
   if(step!==0||tempo.pendingBpm===null)return null;
   const nextBpm=options.normalize(tempo.pendingBpm);
   tempo.pendingBpm=null;
   tempo.transportTempoBpm=nextBpm;
   const tempoDelay=Math.max(0,(when-options.currentTime())*1000);
   const tempoEvent=setTimeout(function(){
    options.onBoundaryApply(nextBpm);
   },tempoDelay);
   options.trackEvent(tempoEvent);
   return nextBpm;
  }

  function settleOnStop(){
   if(tempo.pendingBpm!==null){
    options.onBoundaryApply(tempo.pendingBpm);
   }else{
    tempo.transportTempoBpm=tempo.bpm;
   }
  }

  function resetForStart(){
   tempo.transportTempoBpm=tempo.bpm;
   tempo.pendingBpm=null;
  }

  return Object.freeze({
   requestChange:requestChange,
   applyAtBoundary:applyAtBoundary,
   schedulePendingAtStep:schedulePendingAtStep,
   settleOnStop:settleOnStop,
   resetForStart:resetForStart
  });
 }

 Object.defineProperty(global,'GeraTransportTempo',{
  configurable:false,
  enumerable:true,
  writable:false,
  value:Object.freeze({createController:createController})
 });
})(typeof window!=='undefined'?window:globalThis);
