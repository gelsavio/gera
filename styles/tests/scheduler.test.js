'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const test=require('node:test');

const root=path.resolve(__dirname,'..');
const baselineRoot=path.resolve(root,'..','GERA-PWA-v3.15.06-etapa-6C-scheduler');
const source=fs.readFileSync(path.join(root,'js/transport/scheduler.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const baselineIndex=fs.readFileSync(path.join(baselineRoot,'index.html'),'utf8');

function loadScheduler(timerCalls){
 const context={
  setTimeout:function(callback,delay){
   timerCalls.push({callback:callback,delay:delay});
   return timerCalls.length;
  }
 };
 vm.createContext(context);
 vm.runInContext(source,context,{filename:'scheduler.js'});
 return context.GeraTransportScheduler;
}

function createHarness(overrides){
 const timerCalls=[];
 const api=loadScheduler(timerCalls);
 const state={running:true,blocked:false,currentTime:10,step:0,nextTime:10,timer:null,ensures:0,pulses:[]};
 const options={
  isRunning:function(){return state.running},
  isBlocked:function(){return state.blocked},
  ensureAudio:function(){state.ensures++},
  currentTime:function(){return state.currentTime},
  getStep:function(){return state.step},
  setStep:function(value){state.step=value},
  getNextTime:function(){return state.nextTime},
  setNextTime:function(value){state.nextTime=value},
  setTimer:function(value){state.timer=value},
  onPulse:function(step,when){
   state.pulses.push({step:step,when:when});
   return {stepDuration:.05,meterSteps:16};
  }
 };
 Object.assign(options,overrides||{});
 return {scheduler:api.createScheduler(options),state:state,timerCalls:timerCalls};
}

test('carregar e criar o scheduler não inicia áudio, pulsos ou timers',function(){
 const harness=createHarness();
 assert.equal(harness.state.ensures,0);
 assert.equal(harness.state.pulses.length,0);
 assert.equal(harness.timerCalls.length,0);
});

test('não agenda quando o transporte não está em execução',function(){
 const harness=createHarness();
 harness.state.running=false;
 harness.scheduler();
 assert.equal(harness.state.ensures,0);
 assert.equal(harness.state.pulses.length,0);
 assert.equal(harness.timerCalls.length,0);
});

test('não agenda quando a trava de encerramento está ativa',function(){
 const harness=createHarness();
 harness.state.blocked=true;
 harness.scheduler();
 assert.equal(harness.state.ensures,0);
 assert.equal(harness.state.pulses.length,0);
 assert.equal(harness.timerCalls.length,0);
});

test('preserva janela de 0,12 segundo, índices e instantes dos pulsos',function(){
 const harness=createHarness();
 harness.scheduler();
 assert.equal(harness.state.ensures,1);
 assert.deepEqual(harness.state.pulses,[
  {step:0,when:10},
  {step:1,when:10.05},
  {step:2,when:10.100000000000001}
 ]);
 assert.equal(harness.state.step,3);
 assert.equal(harness.state.nextTime,10.150000000000002);
});

test('preserva doze passos em 3/4 e retorno modular ao passo zero',function(){
 let harness;
 harness=createHarness({
  onPulse:function(step,when){
   harness.state.pulses.push({step:step,when:when});
   return {stepDuration:.05,meterSteps:12};
  }
 });
 harness.state.step=11;
 harness.scheduler();
 assert.deepEqual(harness.state.pulses.map(function(pulse){return pulse.step}),[11,0,1]);
 assert.equal(harness.state.step,2);
});

test('rearma exatamente com setTimeout de 25 ms e mantém uma referência de timer',function(){
 const harness=createHarness();
 harness.scheduler();
 assert.equal(harness.timerCalls.length,1);
 assert.equal(harness.timerCalls[0].delay,25);
 assert.equal(harness.timerCalls[0].callback,harness.scheduler);
 assert.equal(harness.state.timer,1);
});

test('várias inicializações protegidas não criam timers concorrentes',function(){
 const harness=createHarness();
 harness.state.running=false;
 function legacyEnsureMasterTransport(){
  if(harness.state.running)return;
  harness.state.running=true;
  harness.scheduler();
 }
 for(let attempt=0;attempt<8;attempt++)legacyEnsureMasterTransport();
 assert.equal(harness.timerCalls.length,1);
 assert.equal(harness.state.ensures,1);
 const coordinator=fs.readFileSync(path.join(root,'js/transport/coordinator.js'),'utf8');
 assert.ok(coordinator.includes('if(options.isTransportRunning())return false;'));
});

test('pulso de encerramento interrompe o ciclo sem avançar nem rearmar',function(){
 const harness=createHarness({onPulse:function(){return null}});
 harness.scheduler();
 assert.equal(harness.state.step,0);
 assert.equal(harness.state.nextTime,10);
 assert.equal(harness.timerCalls.length,0);
});

test('o arquivo extraído não contém bateria, sequência, BPM, fronteiras ou DOM',function(){
 assert.doesNotMatch(source,/scheduleDrumStep|drumPattern|pendingBpm|transportTempoBpm|handleTransportBoundary|sequence|document\.|querySelector|requestAnimationFrame|setInterval/);
 assert.match(source,/const lookAhead=\.12;/);
 assert.match(source,/setTimeout\(scheduler,25\)/);
});

test('mantém transportScheduler como identificador global legado no núcleo',function(){
 assert.ok(index.includes('function transportScheduler(){runTransportScheduler()}'));
 assert.ok(index.includes('clearTimeout(transportTimer);clearTransportEvents();transportScheduler();'));
 assert.ok(index.includes('clearTimeout(transportTimer);'));
});

test('preserva byte a byte o scheduler da versão validada 3.15.06',function(){
 assert.equal(source,fs.readFileSync(path.join(baselineRoot,'js/transport/scheduler.js'),'utf8'));
 assert.ok(index.includes('<script src="./js/transport/scheduler.js"></script>'));
 assert.ok(baselineIndex.includes('<script src="./js/transport/scheduler.js"></script>'));
});

test('preserva a presença do scheduler no SERVICE WORKER e no manifesto',function(){
 const currentSw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 const baselineSw=fs.readFileSync(path.join(baselineRoot,'sw.js'),'utf8');
 assert.ok(currentSw.includes('    "./js/transport/scheduler.js",'));
 assert.ok(baselineSw.includes('    "./js/transport/scheduler.js",'));
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')).name,JSON.parse(fs.readFileSync(path.join(baselineRoot,'manifest.json'),'utf8')).name);
});

test('nenhum recurso anterior carregado pelo navegador mudou fora dos pontos autorizados',function(){
 const files=['offline.html','manual-gera.html','js/chords.js','js/state.js','js/transport/clock.js','js/audio/core.js','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'];
 files.forEach(function(file){
  assert.deepEqual(fs.readFileSync(path.join(root,file)),fs.readFileSync(path.join(baselineRoot,file)),file);
 });
});
