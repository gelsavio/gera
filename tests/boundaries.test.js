'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const test=require('node:test');

const root=path.resolve(__dirname,'..');
const baselineRoot=path.resolve(root,'..','GERA-PWA-v3.15.06-etapa-6C-scheduler');
const validatedRoot=path.resolve(root,'..','GERA-PWA-v3.15.07-etapa-6D-fronteiras-compasso');
const source=fs.readFileSync(path.join(root,'js/transport/boundaries.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

function loadApi(timerCalls){
 const context={
  setTimeout:function(callback,delay){
   timerCalls.push({callback:callback,delay:delay});
   return timerCalls.length;
  }
 };
 vm.createContext(context);
 vm.runInContext(source,context,{filename:'boundaries.js'});
 return context.GeraTransportBoundaries;
}

function createHarness(currentTime){
 const timerCalls=[];
 const delivered=[];
 const tracked=[];
 const api=loadApi(timerCalls);
 const emitter=api.createBoundaryEmitter({
  currentTime:function(){return currentTime},
  onBoundary:function(step,when,description){delivered.push({step:step,when:when,description:description})},
  trackEvent:function(event){tracked.push(event)}
 });
 return {api:api,emitter:emitter,timerCalls:timerCalls,delivered:delivered,tracked:tracked};
}

test('carregar e criar o emissor não inicia áudio nem temporizadores',function(){
 const harness=createHarness(10);
 assert.equal(harness.timerCalls.length,0);
 assert.equal(harness.delivered.length,0);
});

test('descreve início, passo interno e último passo de 4/4',function(){
 const harness=createHarness(10);
 const start=harness.api.describeStep(0,16,2);
 const middle=harness.api.describeStep(7,16,2);
 const end=harness.api.describeStep(15,16,2);
 assert.deepEqual([start.step,start.isBoundary,start.isBarStart,start.isBarEnd],[0,true,true,false]);
 assert.deepEqual([middle.step,middle.isBoundary,middle.isBarStart,middle.isBarEnd],[7,false,false,false]);
 assert.deepEqual([end.step,end.isBoundary,end.isBarStart,end.isBarEnd],[15,false,false,true]);
});

test('preserva as oito fronteiras pares do compasso 4/4',function(){
 const harness=createHarness(20);
 for(let step=0;step<16;step++)harness.emitter.emit(step,20+step*.01,16,2);
 assert.equal(harness.timerCalls.length,8);
 harness.timerCalls.forEach(function(timer){timer.callback()});
 assert.deepEqual(harness.delivered.map(function(item){return item.step}),[0,2,4,6,8,10,12,14]);
});

test('preserva as doze fronteiras do compasso 3/4',function(){
 const harness=createHarness(20);
 for(let step=0;step<12;step++)harness.emitter.emit(step,20+step*.01,12,1);
 harness.timerCalls.forEach(function(timer){timer.callback()});
 assert.deepEqual(harness.delivered.map(function(item){return item.step}),[0,1,2,3,4,5,6,7,8,9,10,11]);
 assert.equal(harness.delivered[11].description.isBarEnd,true);
});

test('preserva a antecipação calculada contra AudioContext.currentTime',function(){
 const harness=createHarness(10);
 harness.emitter.emit(0,10.08,16,2);
 assert.ok(Math.abs(harness.timerCalls[0].delay-80)<1e-9);
 assert.deepEqual(harness.tracked,[1]);
});

test('fronteira atrasada continua entregue com atraso zero',function(){
 const harness=createHarness(10.5);
 harness.emitter.emit(2,10.4,16,2);
 assert.equal(harness.timerCalls[0].delay,0);
});

test('passo que não é fronteira não cria evento nem callback tardio',function(){
 const harness=createHarness(10);
 const description=harness.emitter.emit(3,10.1,16,2);
 assert.equal(description.isBoundary,false);
 assert.equal(harness.timerCalls.length,0);
 assert.equal(harness.tracked.length,0);
});

test('execução prolongada mantém uma única emissão por fronteira',function(){
 const harness=createHarness(0);
 for(let bar=0;bar<200;bar++){
  for(let step=0;step<16;step++)harness.emitter.emit(step,bar+step/100,16,2);
 }
 assert.equal(harness.timerCalls.length,1600);
 assert.equal(new Set(harness.tracked).size,1600);
});

test('o consumidor legado permanece no núcleo e recebe step e when',function(){
 assert.ok(index.includes('function handleTransportBoundary(step,boundaryAudioTime){'));
 assert.ok(index.includes('onBoundary:handleTransportBoundary'));
 assert.ok(index.includes('transportBoundaryEmitter.emit(step,when,meterSteps,transportBoundaryStride());'));
});

test('o módulo não contém decisões de bateria, sequência, BPM, parada ou DOM',function(){
 assert.doesNotMatch(source,/scheduleDrumStep|drumPattern|sequencePlaying|pendingBpm|finishAccompaniments|document\.|querySelector|setInterval|requestAnimationFrame/);
 assert.match(source,/Math\.max\(0,\(when-options\.currentTime\(\)\)\*1000\)/);
});

test('preserva byte a byte o módulo de fronteiras da versão validada 3.15.07',function(){
 assert.equal(source,fs.readFileSync(path.join(validatedRoot,'js/transport/boundaries.js'),'utf8'));
 assert.ok(index.includes('transportBoundaryEmitter.emit(step,when,meterSteps,transportBoundaryStride());'));
});

test('preserva a integração das fronteiras no SERVICE WORKER e no manifesto',function(){
 const currentSw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.ok(currentSw.includes('    "./js/transport/boundaries.js",'));
 const currentManifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
 assert.equal(currentManifest.version,'3.15.54');
});

test('todos os demais recursos funcionais permanecem byte a byte iguais',function(){
 const files=['offline.html','manual-gera.html','js/chords.js','js/state.js','js/transport/clock.js','js/transport/scheduler.js','js/audio/core.js','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'];
 files.forEach(function(file){
  assert.deepEqual(fs.readFileSync(path.join(root,file)),fs.readFileSync(path.join(baselineRoot,file)),file);
 });
});
