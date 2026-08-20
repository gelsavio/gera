'use strict';

(function(global){
 function normalizedBpm(value){
  let number=Math.round(Number(value));
  if(!Number.isFinite(number))number=100;
  if(number<40)number=40;
  if(number>220)number=220;
  return number;
 }

 function beatDurationMilliseconds(bpmValue){
  return 60000/bpmValue;
 }

 function bpmFromBeatDurationMilliseconds(milliseconds){
  return 60000/milliseconds;
 }

 function stepDurationSeconds(bpmValue){
  return 15/bpmValue;
 }

 function barDurationMilliseconds(bpmValue,beats){
  return beatDurationMilliseconds(bpmValue)*beats;
 }

 function stepsToSeconds(stepCount,bpmValue){
  return stepCount*stepDurationSeconds(bpmValue);
 }

 function secondsToSteps(seconds,bpmValue){
  return seconds/stepDurationSeconds(bpmValue);
 }

 function nextBoundaryOffsetSeconds(currentStep,meterSteps,bpmValue){
  return ((meterSteps-currentStep)%meterSteps)*stepDurationSeconds(bpmValue);
 }

 function nextBoundaryTimeSeconds(currentTime,currentStep,meterSteps,bpmValue){
  return currentTime+nextBoundaryOffsetSeconds(currentStep,meterSteps,bpmValue);
 }

 const clock=Object.freeze({
  normalizedBpm:normalizedBpm,
  beatDurationMilliseconds:beatDurationMilliseconds,
  bpmFromBeatDurationMilliseconds:bpmFromBeatDurationMilliseconds,
  stepDurationSeconds:stepDurationSeconds,
  barDurationMilliseconds:barDurationMilliseconds,
  stepsToSeconds:stepsToSeconds,
  secondsToSteps:secondsToSteps,
  nextBoundaryOffsetSeconds:nextBoundaryOffsetSeconds,
  nextBoundaryTimeSeconds:nextBoundaryTimeSeconds
 });

 Object.defineProperty(global,'GeraTransportClock',{
  configurable:false,
  enumerable:true,
  writable:false,
  value:clock
 });

 Object.defineProperty(global,'normalizedBpm',{
  configurable:true,
  enumerable:true,
  writable:true,
  value:normalizedBpm
 });
})(typeof window!=='undefined'?window:globalThis);
