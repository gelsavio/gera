/*
 * Identificação e emissão das fronteiras de compasso do transporte do GERA.
 *
 * Este arquivo somente descreve o passo atual e agenda a entrega das
 * fronteiras já reconhecidas pelo núcleo legado. As decisões de BPM,
 * parada, bateria, sequência e interface permanecem fora deste módulo.
 */
'use strict';

(function(global){
 function describeStep(step,meterSteps,boundaryStride){
  return Object.freeze({
   step:step,
   meterSteps:meterSteps,
   boundaryStride:boundaryStride,
   isBoundary:step%boundaryStride===0,
   isBarStart:step===0,
   isBarEnd:step===meterSteps-1
  });
 }

 function createBoundaryEmitter(options){
  function emit(step,when,meterSteps,boundaryStride){
   const description=describeStep(step,meterSteps,boundaryStride);
   if(!description.isBoundary)return description;
   const delay=Math.max(0,(when-options.currentTime())*1000);
   const boundaryEvent=setTimeout(function(){
    options.onBoundary(step,when,description);
   },delay);
   options.trackEvent(boundaryEvent);
   return description;
  }
  return Object.freeze({emit:emit});
 }

 Object.defineProperty(global,'GeraTransportBoundaries',{
  configurable:false,
  enumerable:true,
  writable:false,
  value:Object.freeze({
   describeStep:describeStep,
   createBoundaryEmitter:createBoundaryEmitter
  })
 });
})(typeof window!=='undefined'?window:globalThis);
