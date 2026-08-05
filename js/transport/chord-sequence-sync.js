/*
 * Integração da sequência de acordes com as fronteiras do transporte mestre.
 *
 * Este módulo somente consome passos e instantes já emitidos pelo transporte.
 * Conteúdo dos itens, áudio, instrumentos, acompanhamento, baixo, sustain,
 * liberação, transições entre sequências, bateria e DOM permanecem no núcleo
 * legado e são acessados exclusivamente por callbacks injetados.
 */
'use strict';

(function(global){
 function createConsumer(options){
  function advanceBoundary(step,boundaryAudioTime){
   if(!options.isPlaying())return false;
   const isBarStart=step===0;
   if(options.isStartQueued()){
    if(!isBarStart)return false;
    options.setStartQueued(false);
    options.setIndex(-1);
    options.setUnitsRemaining(0);
    options.setContinuousItem(false);
    const started=options.loadItem(0,boundaryAudioTime);
    options.onStarted();
    return started;
   }
   if(options.getIndex()<0){
    if(isBarStart)return options.loadItem(0,boundaryAudioTime);
    return false;
   }
   const remaining=options.getUnitsRemaining()-1;
   options.setUnitsRemaining(remaining);
   if(remaining<=0)return options.loadItem(options.getIndex()+1,boundaryAudioTime);
   return false;
  }

  function consumeBoundary(step,boundaryAudioTime){
   let itemStarted=false;
   if(options.isPlaying())itemStarted=advanceBoundary(step,boundaryAudioTime);
   if(!options.isPlaying())return Object.freeze({handled:false,itemStarted:itemStarted});
   if(!options.hasLatchedChord())return Object.freeze({handled:true,itemStarted:itemStarted});

   const item=options.getCurrentItem();
   if(!item)return Object.freeze({handled:true,itemStarted:itemStarted});
   const duration=options.getBarDuration();
   const meterSteps=options.getMeterSteps();
   const boundaryDuration=duration/options.getBoundaryUnits();

   if(itemStarted){
    const start=step*duration/meterSteps;
    const fraction=Number(item.fraction);
    if(
     fraction>=1&&
     start>0&&
     options.getRhythmPattern()==='whole'&&
     !options.isPause(item)&&
     !options.isNote(item)
    ){
     options.clearSchedule();
     options.setContinuousItem(true);
     options.playContinuous(Math.max(220,duration*.94));
     return Object.freeze({handled:true,itemStarted:itemStarted});
    }

    const end=Math.min(duration,start+duration*fraction);
    options.clearSchedule();
    options.executeSegment(start,end);
    return Object.freeze({handled:true,itemStarted:itemStarted});
   }

   if(step===0&&options.getUnitsRemaining()>0){
    if(options.isContinuousItem())return Object.freeze({handled:true,itemStarted:itemStarted});
    const continuationEnd=Math.min(duration,options.getUnitsRemaining()*boundaryDuration);
    options.clearSchedule();
    options.executeSegment(0,continuationEnd);
   }
   return Object.freeze({handled:true,itemStarted:itemStarted});
  }

  return Object.freeze({
   advanceBoundary:advanceBoundary,
   consumeBoundary:consumeBoundary
  });
 }

 Object.defineProperty(global,'GeraTransportChordSequenceSync',{
  configurable:false,
  enumerable:true,
  writable:false,
  value:Object.freeze({createConsumer:createConsumer})
 });
})(typeof window!=='undefined'?window:globalThis);
