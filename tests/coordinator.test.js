'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const test=require('node:test');

const root=path.resolve(__dirname,'..');
const baselineRoot=path.resolve(root,'..','GERA-PWA-v3.15.11-etapa-6H-coordenacao-transporte');
const source=fs.readFileSync(path.join(root,'js/transport/coordinator.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

function createHarness(initial){
 const state=Object.assign({
  drumRunning:false,drumStartQueued:false,sequencePlaying:false,
  sequenceStartQueued:false,latchedChord:false,pendingChord:false,
  stopQueued:false,sequenceTransition:false,queuedDrumAction:false,
  activeDrumAction:false,transportRunning:false
 },initial||{});
 let audioEnsures=0;
 let starts=0;
 let stops=0;
 const context={};context.window=context;
 vm.createContext(context);
 vm.runInContext(source,context,{filename:'coordinator.js'});
 const coordinator=context.GeraTransportCoordinator.createCoordinator({
  isDrumRunning:function(){return state.drumRunning},
  isDrumStartQueued:function(){return state.drumStartQueued},
  isSequencePlaying:function(){return state.sequencePlaying},
  isSequenceStartQueued:function(){return state.sequenceStartQueued},
  hasLatchedChord:function(){return state.latchedChord},
  hasPendingChord:function(){return state.pendingChord},
  isStopQueued:function(){return state.stopQueued},
  hasSequenceTransition:function(){return state.sequenceTransition},
  hasQueuedDrumAction:function(){return state.queuedDrumAction},
  hasActiveDrumAction:function(){return state.activeDrumAction},
  ensureAudio:function(){audioEnsures++},
  isTransportRunning:function(){return state.transportRunning},
  startTransport:function(){starts++;state.transportRunning=true},
  stopTransport:function(){stops++;state.transportRunning=false}
 });
 return {state:state,coordinator:coordinator,getAudioEnsures:function(){return audioEnsures},getStarts:function(){return starts},getStops:function(){return stops}};
}

test('carregar e criar o coordenador não inicia áudio, transporte nem temporizadores',function(){
 const harness=createHarness();
 assert.equal(harness.getAudioEnsures(),0);
 assert.equal(harness.getStarts(),0);
 assert.equal(harness.getStops(),0);
 assert.doesNotMatch(source,/setTimeout|setInterval|requestAnimationFrame|AudioContext|audioCtx|performance\.now|Date\.now/);
});

test('cada estado legado conserva a necessidade do transporte',function(){
 [
  'drumRunning','drumStartQueued','sequencePlaying','sequenceStartQueued',
  'latchedChord','pendingChord','stopQueued','sequenceTransition',
  'queuedDrumAction','activeDrumAction'
 ].forEach(function(key){
  const initial={};initial[key]=true;
  assert.equal(createHarness(initial).coordinator.needed(),true,key);
 });
 assert.equal(createHarness().coordinator.needed(),false);
});

test('primeiro consumidor desbloqueia áudio e inicia o transporte uma única vez',function(){
 const harness=createHarness({drumStartQueued:true});
 assert.equal(harness.coordinator.ensure(),true);
 assert.equal(harness.coordinator.ensure(),false);
 assert.equal(harness.getAudioEnsures(),2);
 assert.equal(harness.getStarts(),1);
});

test('segundo consumidor utiliza o transporte existente sem criar novo scheduler',function(){
 const harness=createHarness({transportRunning:true,drumRunning:true});
 harness.state.sequenceStartQueued=true;
 assert.equal(harness.coordinator.ensure(),false);
 assert.equal(harness.getStarts(),0);
 assert.equal(harness.state.transportRunning,true);
});

test('parar a bateria mantém o transporte enquanto a sequência continua',function(){
 const harness=createHarness({transportRunning:true,sequencePlaying:true});
 assert.equal(harness.coordinator.stopIfIdle(),false);
 assert.equal(harness.getStops(),0);
});

test('parar a sequência mantém o transporte enquanto a bateria continua',function(){
 const harness=createHarness({transportRunning:true,drumRunning:true});
 assert.equal(harness.coordinator.stopIfIdle(),false);
 assert.equal(harness.getStops(),0);
});

test('transporte encerra somente depois que todos os consumidores ficam inativos',function(){
 const harness=createHarness({transportRunning:true,drumRunning:true,sequencePlaying:true});
 assert.equal(harness.coordinator.stopIfIdle(),false);
 harness.state.drumRunning=false;
 assert.equal(harness.coordinator.stopIfIdle(),false);
 harness.state.sequencePlaying=false;
 assert.equal(harness.coordinator.stopIfIdle(),true);
 assert.equal(harness.getStops(),1);
});

test('acorde, troca pendente, parada conjunta e ações mantêm o transporte vivo',function(){
 ['latchedChord','pendingChord','stopQueued','sequenceTransition','queuedDrumAction','activeDrumAction'].forEach(function(key){
  const initial={transportRunning:true};initial[key]=true;
  const harness=createHarness(initial);
  assert.equal(harness.coordinator.stopIfIdle(),false,key);
  assert.equal(harness.getStops(),0,key);
 });
});

test('módulo não importa consumidores nem contém decisões musicais, DOM ou persistência',function(){
 assert.doesNotMatch(source,/GeraTransportDrumSync|GeraTransportChordSequenceSync|scheduleDrumStep|loadSequenceItem|drumPattern|rhythmPattern|pendingBpm|document\.|querySelector|localStorage|createVoice|playDrum/);
});

test('identificadores globais legados permanecem como adaptadores no núcleo',function(){
 assert.ok(index.includes('function transportNeeded(){return transportCoordinator.needed()}'));
 assert.ok(index.includes('function maybeStopMasterTransport(){transportCoordinator.stopIfIdle()}'));
 assert.ok(index.includes('function ensureMasterTransport(){transportCoordinator.ensure()}'));
 assert.ok(index.includes('function stopMasterTransport(){'));
 assert.ok(index.includes('function startMasterTransport(){'));
});

test('coordenador carrega depois dos consumidores e antes do núcleo de áudio',function(){
 const drum=index.indexOf('<script src="./js/transport/drum-sync.js"></script>');
 const sequence=index.indexOf('<script src="./js/transport/chord-sequence-sync.js"></script>');
 const coordinator=index.indexOf('<script src="./js/transport/coordinator.js"></script>');
 const core=index.indexOf('<script src="./js/audio/core.js"></script>');
 assert.ok(drum>=0&&sequence>drum&&coordinator>sequence&&core>coordinator);
});

test('recursos funcionais fora dos pontos autorizados permanecem byte a byte iguais',function(){
 const files=['offline.html','manual-gera.html','js/chords.js','js/state.js','js/transport/clock.js','js/transport/scheduler.js','js/transport/boundaries.js','js/transport/tempo.js','js/transport/drum-sync.js','js/transport/chord-sequence-sync.js','js/audio/core.js','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'];
 files.forEach(function(file){assert.deepEqual(fs.readFileSync(path.join(root,file)),fs.readFileSync(path.join(baselineRoot,file)),file)});
});

test('coordenador permanece byte a byte igual à versão validada 3.15.11',function(){
 assert.equal(source,fs.readFileSync(path.join(baselineRoot,'js/transport/coordinator.js'),'utf8'));
 assert.ok(index.includes('const transportCoordinator=GeraTransportCoordinator.createCoordinator({'));
});

test('SERVICE WORKER preserva o coordenador e usa o cache 3.15.41',function(){
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.ok(sw.includes('    "./js/transport/coordinator.js",'));
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.41';"));
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')).version,'3.15.41');
});
