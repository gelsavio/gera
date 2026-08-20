/*
 * Ciclo temporal do transporte mestre do GERA.
 *
 * Este arquivo somente percorre a janela de agendamento, emite os pulsos
 * legados e rearma a inspeção. As decisões de BPM, bateria, sequência,
 * fronteiras de compasso e interface permanecem no núcleo legado.
 */
'use strict';

(function(global){
 function createScheduler(options){
  function scheduler(){
   if(!options.isRunning())return;
   if(options.isBlocked())return;
   options.ensureAudio();
   const lookAhead=.12;
   while(options.getNextTime()<options.currentTime()+lookAhead){
    const step=options.getStep();
    const when=options.getNextTime();
    const pulse=options.onPulse(step,when);
    if(!pulse)return;
    options.setNextTime(options.getNextTime()+pulse.stepDuration);
    options.setStep((options.getStep()+1)%pulse.meterSteps);
   }
   options.setTimer(setTimeout(scheduler,25));
  }
  return scheduler;
 }

 Object.defineProperty(global,'GeraTransportScheduler',{
  configurable:false,
  enumerable:true,
  writable:false,
  value:Object.freeze({createScheduler:createScheduler})
 });
})(typeof window!=='undefined'?window:globalThis);
