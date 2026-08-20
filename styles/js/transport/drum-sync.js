/*
 * Integração da bateria com os pulsos do transporte mestre do GERA.
 *
 * Este módulo somente consome passos e instantes já produzidos pelo
 * scheduler. Padrões, instrumentos, samples, volumes, choke, motor sonoro,
 * sequência de acordes, DOM e coordenação permanecem no núcleo legado.
 */
'use strict';

(function(global){
 function createConsumer(options){
  function activateAtBoundary(step){
   if(step!==0||!options.isStartQueued())return false;
   options.setStartQueued(false);
   options.setRunning(true);
   options.resetStep();
   options.onStarted();
   return true;
  }

  function completeAtBoundary(step){
   if(step!==0)return null;
   const completed=options.getCompletedAction();
   if(!completed)return null;
   options.setCompletedAction('');
   options.syncActionButtons();
   if(completed==='ending'){
    options.stopDrums();
    options.setStatus('Encerramento concluído');
    return Object.freeze({action:completed,stopBoundary:true});
   }
   options.setStatus('Virada concluída');
   return Object.freeze({action:completed,stopBoundary:false});
  }

  function consumePulse(step,when){
   const startsDrums=step===0&&options.isStartQueued();
   let scheduledAction=options.getActiveAction();
   if(step===0&&options.getQueuedAction()&&!scheduledAction){
    scheduledAction=options.getQueuedAction();
    options.setActiveAction(scheduledAction);
    options.setQueuedAction('');
    options.syncActionButtons();
   }
   const actionMutesNormal=
    options.getActionMuteUntil()>options.getActionMuteFrom()&&
    when>=options.getActionMuteFrom()&&
    when<options.getActionMuteUntil();
   const stopsDrumsForSequence=step===0&&options.shouldStopAtAlignedSequenceStart();
   if((options.isRunning()||startsDrums)&&!actionMutesNormal&&!stopsDrumsForSequence){
    options.scheduleStep(step,when,scheduledAction);
   }
   const meterSteps=options.getMeterSteps();
   if(scheduledAction&&step===meterSteps-1){
    options.setCompletedAction(scheduledAction);
    options.setActiveAction('');
   }
   return Object.freeze({meterSteps:meterSteps});
  }

  return Object.freeze({
   activateAtBoundary:activateAtBoundary,
   completeAtBoundary:completeAtBoundary,
   consumePulse:consumePulse
  });
 }

 Object.defineProperty(global,'GeraTransportDrumSync',{
  configurable:false,
  enumerable:true,
  writable:false,
  value:Object.freeze({createConsumer:createConsumer})
 });
})(typeof window!=='undefined'?window:globalThis);
