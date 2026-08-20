'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const test=require('node:test');

const root=path.resolve(__dirname,'..');
const baselineRoot=path.resolve(root,'..','GERA-PWA-v3.15.05-etapa-6B-calculos-relogio');
const source=fs.readFileSync(path.join(root,'js/transport/clock.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const baselineIndex=fs.readFileSync(path.join(baselineRoot,'index.html'),'utf8');
const context={};
vm.createContext(context);
vm.runInContext(source,context,{filename:'clock.js'});
const clock=context.GeraTransportClock;

function legacyNormalizedBpm(value){
 let number=Math.round(Number(value));
 if(!Number.isFinite(number))number=100;
 if(number<40)number=40;
 if(number>220)number=220;
 return number;
}
function legacyBeatDurationMilliseconds(bpmValue){return 60000/bpmValue}
function legacyStepDurationSeconds(bpmValue){return 15/bpmValue}
function legacyBarDurationMilliseconds(bpmValue,beats){return (60000/bpmValue)*beats}
function legacyNextBoundaryOffsetSeconds(currentStep,meterSteps,bpmValue){
 return ((meterSteps-currentStep)%meterSteps)*(15/bpmValue);
}

test('mantém a normalização legada para todos os BPM permitidos',function(){
 for(let bpmValue=40;bpmValue<=220;bpmValue++){
  assert.equal(clock.normalizedBpm(bpmValue),legacyNormalizedBpm(bpmValue),'BPM '+bpmValue);
 }
});

test('preserva arredondamento, limites e padrão para entradas decimais e inválidas',function(){
 const values=[39.49,39.5,40.1,72.4,72.5,99.49,99.5,100.5,219.49,219.5,220.49,220.5,NaN,Infinity,-Infinity,''];
 values.forEach(function(value){
  assert.equal(clock.normalizedBpm(value),legacyNormalizedBpm(value),String(value));
 });
});

test('preserva duração da batida, do passo e dos compassos em todos os BPM permitidos',function(){
 for(let bpmValue=40;bpmValue<=220;bpmValue++){
  assert.equal(clock.beatDurationMilliseconds(bpmValue),legacyBeatDurationMilliseconds(bpmValue),'batida '+bpmValue);
  assert.equal(clock.stepDurationSeconds(bpmValue),legacyStepDurationSeconds(bpmValue),'passo '+bpmValue);
  assert.equal(clock.barDurationMilliseconds(bpmValue,4),legacyBarDurationMilliseconds(bpmValue,4),'4/4 '+bpmValue);
  assert.equal(clock.barDurationMilliseconds(bpmValue,3),legacyBarDurationMilliseconds(bpmValue,3),'3/4 '+bpmValue);
 }
});

test('mantém os resultados nos BPM mínimo, intermediário e máximo',function(){
 [40,100,220].forEach(function(bpmValue){
  assert.equal(clock.beatDurationMilliseconds(bpmValue),60000/bpmValue);
  assert.equal(clock.stepDurationSeconds(bpmValue),15/bpmValue);
  assert.equal(clock.barDurationMilliseconds(bpmValue,4),(60000/bpmValue)*4);
 });
});

test('converte BPM e duração de batida sem arredondamento adicional',function(){
 [40,40.5,72.25,100,137.75,220].forEach(function(bpmValue){
  const milliseconds=clock.beatDurationMilliseconds(bpmValue);
  assert.ok(Math.abs(clock.bpmFromBeatDurationMilliseconds(milliseconds)-bpmValue)<1e-12);
 });
});

test('converte passos e segundos com a mesma aritmética anterior',function(){
 for(let bpmValue=40;bpmValue<=220;bpmValue++){
  [0,1,2,4,6,8,12,16,32].forEach(function(stepCount){
   const seconds=stepCount*legacyStepDurationSeconds(bpmValue);
   assert.equal(clock.stepsToSeconds(stepCount,bpmValue),seconds,'segundos '+bpmValue+'/'+stepCount);
   assert.ok(Math.abs(clock.secondsToSteps(seconds,bpmValue)-stepCount)<1e-12,'passos '+bpmValue+'/'+stepCount);
  });
 }
});

test('calcula a próxima fronteira em 4/4 e 3/4 para todos os BPM permitidos',function(){
 for(let bpmValue=40;bpmValue<=220;bpmValue++){
  [12,16].forEach(function(meterSteps){
   for(let currentStep=0;currentStep<meterSteps;currentStep++){
    const expected=legacyNextBoundaryOffsetSeconds(currentStep,meterSteps,bpmValue);
    assert.equal(clock.nextBoundaryOffsetSeconds(currentStep,meterSteps,bpmValue),expected,bpmValue+'/'+meterSteps+'/'+currentStep);
    assert.equal(clock.nextBoundaryTimeSeconds(10,currentStep,meterSteps,bpmValue),10+expected,bpmValue+'/'+meterSteps+'/'+currentStep);
   }
  });
 }
});

test('considera o passo exatamente sobre a fronteira como deslocamento zero',function(){
 [40,100,220].forEach(function(bpmValue){
  assert.equal(clock.nextBoundaryOffsetSeconds(0,16,bpmValue),0);
  assert.equal(clock.nextBoundaryOffsetSeconds(0,12,bpmValue),0);
  assert.equal(clock.nextBoundaryTimeSeconds(25,0,16,bpmValue),25);
 });
});

test('mantém os adaptadores legados e não inclui timers, áudio, DOM ou interface',function(){
 assert.equal(context.normalizedBpm,clock.normalizedBpm);
 assert.ok(index.includes('<script src="./js/transport/clock.js"></script>'));
 assert.ok(index.includes('GeraTransportClock.barDurationMilliseconds(bpm,3)'));
 assert.ok(index.includes('GeraTransportClock.stepDurationSeconds(transportTempoBpm)'));
 assert.doesNotMatch(source,/setTimeout|setInterval|requestAnimationFrame|AudioContext|audioCtx|document\.|querySelector|localStorage/);
});

test('preserva byte a byte o módulo do relógio da versão validada anterior',function(){
 assert.equal(source,fs.readFileSync(path.join(baselineRoot,'js/transport/clock.js'),'utf8'));
 assert.ok(index.includes('<script src="./js/transport/clock.js"></script>'));
 assert.ok(baselineIndex.includes('<script src="./js/transport/clock.js"></script>'));
});

test('o evento activate remove caches antigos e preserva o cache atual e caches alheios',async function(){
 const listeners={};
 const deleted=[];
 const swContext={
  URL:URL,
  Promise:Promise,
  fetch:function(){return Promise.reject(new Error('não usado'))},
  caches:{
   keys:function(){return Promise.resolve(['gera-pwa-v3.15.04','gera-pwa-v3.15.05','gera-pwa-v3.15.06','gera-pwa-v3.15.07','gera-pwa-v3.15.08','gera-pwa-v3.15.09','gera-pwa-v3.15.10','gera-pwa-v3.15.12','gera-pwa-v3.15.13','gera-pwa-v3.15.16','gera-pwa-v3.15.20','gera-pwa-v3.15.21','gera-pwa-v3.15.22','gera-pwa-v3.15.23','gera-pwa-v3.15.24','gera-pwa-v3.15.25','gera-pwa-v3.15.26','gera-pwa-v3.15.53','teclado-virtual-pwa-v3.14.97','outro-cache'])},
   delete:function(name){deleted.push(name);return Promise.resolve(true)},
   open:function(){return Promise.resolve({})},
   match:function(){return Promise.resolve(undefined)}
  },
  self:{
   location:{origin:'https://gera.test'},
   clients:{claim:function(){return Promise.resolve()}},
   skipWaiting:function(){return Promise.resolve()},
   addEventListener:function(type,handler){listeners[type]=handler}
  }
 };
 vm.createContext(swContext);
 vm.runInContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),swContext,{filename:'sw.js'});
 let activation;
 listeners.activate({waitUntil:function(promise){activation=promise}});
 await activation;
 assert.deepEqual(deleted,['gera-pwa-v3.15.04','gera-pwa-v3.15.05','gera-pwa-v3.15.06','gera-pwa-v3.15.07','gera-pwa-v3.15.08','gera-pwa-v3.15.09','gera-pwa-v3.15.10','gera-pwa-v3.15.12','gera-pwa-v3.15.13','gera-pwa-v3.15.16','gera-pwa-v3.15.20','gera-pwa-v3.15.21','gera-pwa-v3.15.22','gera-pwa-v3.15.23','gera-pwa-v3.15.24','gera-pwa-v3.15.25','gera-pwa-v3.15.26','teclado-virtual-pwa-v3.14.97']);
});
