'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const test=require('node:test');

const root=path.resolve(__dirname,'..');
const baselineRoot=path.resolve(root,'..','GERA-PWA-v3.15.08-etapa-6E-mudancas-bpm');
const source=fs.readFileSync(path.join(root,'js/transport/drum-sync.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

function createHarness(initial){
 const state=Object.assign({
  startQueued:false,running:false,step:7,queuedAction:'',activeAction:'',
  completedAction:'',muteFrom:0,muteUntil:0,alignedStop:false,meterSteps:16
 },initial||{});
 const scheduled=[];
 const statuses=[];
 let actionSyncs=0;
 let starts=0;
 let stops=0;
 const context={};
 context.window=context;
 vm.createContext(context);
 vm.runInContext(source,context,{filename:'drum-sync.js'});
 const consumer=context.GeraTransportDrumSync.createConsumer({
  isStartQueued:function(){return state.startQueued},
  setStartQueued:function(value){state.startQueued=value},
  isRunning:function(){return state.running},
  setRunning:function(value){state.running=value},
  resetStep:function(){state.step=0},
  onStarted:function(){starts++},
  getQueuedAction:function(){return state.queuedAction},
  setQueuedAction:function(value){state.queuedAction=value},
  getActiveAction:function(){return state.activeAction},
  setActiveAction:function(value){state.activeAction=value},
  getCompletedAction:function(){return state.completedAction},
  setCompletedAction:function(value){state.completedAction=value},
  getActionMuteFrom:function(){return state.muteFrom},
  getActionMuteUntil:function(){return state.muteUntil},
  shouldStopAtAlignedSequenceStart:function(){return state.alignedStop},
  scheduleStep:function(step,when,mode){scheduled.push({step:step,when:when,mode:mode})},
  getMeterSteps:function(){return state.meterSteps},
  syncActionButtons:function(){actionSyncs++},
  stopDrums:function(){stops++;state.running=false},
  setStatus:function(value){statuses.push(value)}
 });
 return {
  state:state,consumer:consumer,scheduled:scheduled,statuses:statuses,
  getActionSyncs:function(){return actionSyncs},
  getStarts:function(){return starts},getStops:function(){return stops}
 };
}

test('carregar e criar o consumidor não inicia bateria, áudio nem temporizadores',function(){
 const harness=createHarness();
 assert.equal(harness.getStarts(),0);
 assert.equal(harness.scheduled.length,0);
 assert.doesNotMatch(source,/setTimeout|setInterval|requestAnimationFrame|AudioContext|audioCtx/);
});

test('entrada aguardando somente é efetivada na fronteira do passo zero',function(){
 const harness=createHarness({startQueued:true});
 assert.equal(harness.consumer.activateAtBoundary(8),false);
 assert.equal(harness.state.startQueued,true);
 assert.equal(harness.consumer.activateAtBoundary(0),true);
 assert.deepEqual([harness.state.startQueued,harness.state.running,harness.state.step],[false,true,0]);
 assert.equal(harness.getStarts(),1);
});

test('primeiro bumbo conserva o passo zero e o instante recebido do scheduler',function(){
 const harness=createHarness({startQueued:true});
 harness.consumer.consumePulse(0,12.345);
 assert.deepEqual(harness.scheduled,[{step:0,when:12.345,mode:''}]);
});

test('fila de entrada não agenda prematuramente em passo diferente de zero',function(){
 const harness=createHarness({startQueued:true});
 harness.consumer.consumePulse(6,10.2);
 assert.equal(harness.scheduled.length,0);
});

test('bateria ativa consome os mesmos passos e tempos sem duplicação',function(){
 const harness=createHarness({running:true});
 for(let step=0;step<16;step++)harness.consumer.consumePulse(step,20+step*.15);
 assert.equal(harness.scheduled.length,16);
 assert.deepEqual(harness.scheduled.map(function(item){return item.step}),Array.from({length:16},function(_,i){return i}));
 assert.equal(new Set(harness.scheduled.map(function(item){return item.when})).size,16);
});

test('sobreposição de virada da sequência silencia somente a janela legada',function(){
 const harness=createHarness({running:true,muteFrom:10.2,muteUntil:10.6});
 [10.1,10.2,10.4,10.6].forEach(function(when,index){harness.consumer.consumePulse(index,when)});
 assert.deepEqual(harness.scheduled.map(function(item){return item.when}),[10.1,10.6]);
});

test('parada alinhada da sequência bloqueia somente o passo zero previsto',function(){
 const harness=createHarness({running:true,alignedStop:true});
 harness.consumer.consumePulse(0,5);
 harness.consumer.consumePulse(1,5.1);
 assert.deepEqual(harness.scheduled,[{step:1,when:5.1,mode:''}]);
});

test('virada enfileirada começa no passo zero e substitui o modo normal',function(){
 const harness=createHarness({running:true,queuedAction:'fill'});
 harness.consumer.consumePulse(0,8);
 assert.deepEqual(harness.scheduled,[{step:0,when:8,mode:'fill'}]);
 assert.deepEqual([harness.state.queuedAction,harness.state.activeAction],['','fill']);
 assert.equal(harness.getActionSyncs(),1);
});

test('último passo marca a ação para conclusão sem alterar o motor sonoro',function(){
 const harness=createHarness({running:true,activeAction:'fill',meterSteps:16});
 harness.consumer.consumePulse(15,9.5);
 assert.deepEqual([harness.state.activeAction,harness.state.completedAction],['','fill']);
 assert.deepEqual(harness.scheduled,[{step:15,when:9.5,mode:'fill'}]);
});

test('conclusão da virada ocorre somente na próxima fronteira zero',function(){
 const harness=createHarness({running:true,completedAction:'fill'});
 assert.equal(harness.consumer.completeAtBoundary(8),null);
 const result=harness.consumer.completeAtBoundary(0);
 assert.equal(result.action,'fill');
 assert.equal(result.stopBoundary,false);
 assert.deepEqual(harness.statuses,['Virada concluída']);
 assert.equal(harness.getStops(),0);
});

test('encerramento preserva a parada na próxima fronteira zero',function(){
 const harness=createHarness({running:true,completedAction:'ending'});
 const result=harness.consumer.completeAtBoundary(0);
 assert.equal(result.action,'ending');
 assert.equal(result.stopBoundary,true);
 assert.equal(harness.getStops(),1);
 assert.deepEqual(harness.statuses,['Encerramento concluído']);
});

test('consumidor não contém padrões, samples, instrumentos, layers, DOM ou sequência de acordes',function(){
 assert.doesNotMatch(source,/DRUM_PATTERNS|DRUM_ACTION_PATTERNS|playDrum|playSampleDrum|playSynthDrum|drumLayers|document\.|querySelector|sequencePlaying|advanceSequence|localStorage/);
 assert.ok(index.includes('const DRUM_PATTERNS={'));
 assert.ok(index.includes('function playDrum(name,when=null,velocity=1){'));
 assert.ok(index.includes('function scheduleDrumStep(step,time,mode=\'\'){'));
});

test('carregamento ocorre depois do tempo e antes do núcleo inline',function(){
 const tempo=index.indexOf('<script src="./js/transport/tempo.js"></script>');
 const drum=index.indexOf('<script src="./js/transport/drum-sync.js"></script>');
 const core=index.indexOf('<script src="./js/audio/core.js"></script>');
 assert.ok(tempo>=0&&drum>tempo&&core>drum);
});

test('todos os recursos funcionais fora dos pontos autorizados permanecem byte a byte iguais',function(){
 const files=['offline.html','manual-gera.html','js/chords.js','js/state.js','js/transport/clock.js','js/transport/scheduler.js','js/transport/boundaries.js','js/transport/tempo.js','js/audio/core.js','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'];
 files.forEach(function(file){
  assert.deepEqual(fs.readFileSync(path.join(root,file)),fs.readFileSync(path.join(baselineRoot,file)),file);
 });
});

test('módulo da bateria permanece no SERVICE WORKER e no núcleo após a etapa 6G',function(){
 const currentSw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.ok(currentSw.includes('    "./js/transport/drum-sync.js",'));
 assert.ok(index.includes('const drumTransportConsumer=GeraTransportDrumSync.createConsumer({'));
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
 assert.equal(manifest.version,'3.15.50');
});

test('módulo da bateria permanece byte a byte igual à versão validada 3.15.09',function(){
 assert.equal(source,fs.readFileSync(path.join(root,'..','GERA-PWA-v3.15.09-etapa-6F-bateria-transporte','js/transport/drum-sync.js'),'utf8'));
});
