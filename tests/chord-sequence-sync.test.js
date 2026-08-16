'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const test=require('node:test');

const root=path.resolve(__dirname,'..');
const baselineRoot=path.resolve(root,'..','GERA-PWA-v3.15.09-etapa-6F-bateria-transporte');
const source=fs.readFileSync(path.join(root,'js/transport/chord-sequence-sync.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

function createHarness(initial){
 const state=Object.assign({
  playing:false,startQueued:false,index:-1,remaining:0,continuous:false,
  latched:true,barDuration:2400,meterSteps:16,boundaryUnits:8,rhythm:'whole',
  items:[{root:0,type:'major',fraction:1}]
 },initial||{});
 const loads=[];
 const segments=[];
 const continuous=[];
 const statuses=[];
 let clears=0;
 const context={};context.window=context;
 vm.createContext(context);
 vm.runInContext(source,context,{filename:'chord-sequence-sync.js'});
 const consumer=context.GeraTransportChordSequenceSync.createConsumer({
  isPlaying:function(){return state.playing},
  isStartQueued:function(){return state.startQueued},
  setStartQueued:function(value){state.startQueued=value},
  getIndex:function(){return state.index},
  setIndex:function(value){state.index=value},
  getUnitsRemaining:function(){return state.remaining},
  setUnitsRemaining:function(value){state.remaining=value},
  isContinuousItem:function(){return state.continuous},
  setContinuousItem:function(value){state.continuous=value},
  loadItem:function(itemIndex,when){
   loads.push({index:itemIndex,when:when});
   if(itemIndex>=state.items.length){state.playing=false;state.index=-1;state.remaining=0;return false}
   state.index=itemIndex;
   state.remaining=Math.max(1,Math.round(Number(state.items[itemIndex].fraction)*state.boundaryUnits));
   state.continuous=false;
   state.latched=!state.items[itemIndex].pause&&state.items[itemIndex].instrument!==null;
   return true;
  },
  onStarted:function(){statuses.push('started')},
  hasLatchedChord:function(){return state.latched},
  getCurrentItem:function(){return state.items[state.index]},
  getBarDuration:function(){return state.barDuration},
  getMeterSteps:function(){return state.meterSteps},
  getBoundaryUnits:function(){return state.boundaryUnits},
  getRhythmPattern:function(){return state.rhythm},
  isPause:function(item){return !!item.pause},
  isNote:function(item){return item.kind==='note'},
  clearSchedule:function(){clears++},
  playContinuous:function(duration){continuous.push(duration)},
  executeSegment:function(start,end){segments.push({start:start,end:end})}
 });
 return {state:state,consumer:consumer,loads:loads,segments:segments,continuous:continuous,statuses:statuses,getClears:function(){return clears}};
}

test('carregar e criar o consumidor não inicia sequência, áudio nem temporizadores',function(){
 const harness=createHarness();
 assert.equal(harness.loads.length,0);
 assert.doesNotMatch(source,/setTimeout|setInterval|requestAnimationFrame|AudioContext|audioCtx|performance\.now|Date\.now/);
});

test('sequência aguardando começa somente no passo zero e conserva o instante recebido',function(){
 const harness=createHarness({playing:true,startQueued:true});
 assert.equal(harness.consumer.advanceBoundary(2,10.1),false);
 assert.equal(harness.loads.length,0);
 assert.equal(harness.consumer.advanceBoundary(0,10.5),true);
 assert.deepEqual(harness.loads,[{index:0,when:10.5}]);
 assert.deepEqual([harness.state.startQueued,harness.state.index,harness.state.remaining],[false,0,8]);
 assert.deepEqual(harness.statuses,['started']);
});

test('item de um compasso avança após oito fronteiras sem alterar sua duração',function(){
 const harness=createHarness({playing:true,startQueued:true,items:[{fraction:1},{fraction:1}]});
 harness.consumer.advanceBoundary(0,1);
 [2,4,6,8,10,12,14].forEach(function(step){harness.consumer.advanceBoundary(step,1+step/10)});
 assert.equal(harness.loads.length,1);
 harness.consumer.advanceBoundary(0,3);
 assert.deepEqual(harness.loads.map(function(load){return load.index}),[0,1]);
});

test('meio compasso e subdivisão de um oitavo preservam as unidades legadas',function(){
 const half=createHarness({playing:true,startQueued:true,items:[{fraction:.5},{fraction:1}]});
 half.consumer.advanceBoundary(0,1);
 [2,4,6].forEach(function(step){half.consumer.advanceBoundary(step,1+step/10)});
 assert.equal(half.loads.length,1);
 half.consumer.advanceBoundary(8,2);
 assert.deepEqual(half.loads.map(function(load){return load.index}),[0,1]);
 const eighth=createHarness({playing:true,startQueued:true,items:[{fraction:.125},{fraction:1}]});
 eighth.consumer.advanceBoundary(0,4);
 eighth.consumer.advanceBoundary(2,4.2);
 assert.deepEqual(eighth.loads.map(function(load){return load.index}),[0,1]);
});

test('pausa consome a duração sem executar segmento sonoro',function(){
 const harness=createHarness({playing:true,startQueued:true,items:[{pause:true,fraction:.25},{fraction:1}]});
 const pulse=harness.consumer.consumeBoundary(0,5);
 assert.equal(pulse.handled,true);
 assert.equal(harness.state.remaining,2);
 assert.equal(harness.segments.length,0);
 assert.equal(harness.continuous.length,0);
});

test('repetição da mesma cifra continua carregando itens distintos na ordem',function(){
 const chord={root:7,type:'major',fraction:.125};
 const harness=createHarness({playing:true,startQueued:true,items:[Object.assign({},chord),Object.assign({},chord)]});
 harness.consumer.advanceBoundary(0,6);
 harness.consumer.advanceBoundary(2,6.2);
 assert.deepEqual(harness.loads.map(function(load){return load.index}),[0,1]);
});

test('segmento iniciado em fronteira interna mantém posição e fração recebidas',function(){
 const harness=createHarness({playing:true,startQueued:false,index:0,remaining:1,items:[{fraction:.5},{fraction:.25}]});
 harness.consumer.consumeBoundary(4,7);
 assert.deepEqual(harness.segments,[{start:600,end:1200}]);
 assert.equal(harness.getClears(),1);
});

test('acorde inteiro iniciado no meio do compasso mantém bloco contínuo sem reataque',function(){
 const harness=createHarness({playing:true,startQueued:false,index:0,remaining:1,items:[{fraction:.125},{fraction:1}],rhythm:'whole'});
 harness.consumer.consumeBoundary(6,8);
 assert.deepEqual(harness.continuous,[2256]);
 assert.equal(harness.state.continuous,true);
 assert.equal(harness.segments.length,0);
});

test('continuação no passo zero respeita as unidades restantes e o item contínuo',function(){
 const normal=createHarness({playing:true,index:0,remaining:3,items:[{fraction:1}],continuous:false});
 normal.consumer.consumeBoundary(0,9);
 assert.deepEqual(normal.segments,[{start:0,end:600}]);
 const continuous=createHarness({playing:true,index:0,remaining:3,items:[{fraction:1}],continuous:true});
 continuous.consumer.consumeBoundary(0,9);
 assert.equal(continuous.segments.length,0);
 assert.equal(continuous.getClears(),0);
});

test('parada produzida pelo carregamento devolve o pulso ao acompanhamento legado',function(){
 const harness=createHarness({playing:true,index:0,remaining:1,items:[{fraction:.125}]});
 const pulse=harness.consumer.consumeBoundary(2,10);
 assert.equal(harness.state.playing,false);
 assert.equal(pulse.handled,false);
});

test('oitava, inversão, instrumento, baixo, sustain e liberação não são reinterpretados',function(){
 const item={root:9,type:'minor7',fraction:.5,octave:2,inversion:1,instrument:'piano',bassNote:4,sustain:'next',releaseMs:900};
 const harness=createHarness({playing:true,startQueued:true,items:[item]});
 harness.consumer.consumeBoundary(0,11);
 assert.equal(harness.state.items[0],item);
 assert.deepEqual(harness.segments,[{start:0,end:1200}]);
});

test('módulo não contém transições, bateria, DOM, áudio, instrumentos ou persistência',function(){
 assert.doesNotMatch(source,/queuedSequenceSection|sequencePendingTransition|drumRunning|drumPattern|document\.|querySelector|createVoice|playRhythmHit|executeBarSegment|localStorage|instrument=|bassEnabled|releaseMs|sustainMode/);
});

test('carregamento ocorre depois da bateria e antes do núcleo de áudio',function(){
 const drum=index.indexOf('<script src="./js/transport/drum-sync.js"></script>');
 const sequence=index.indexOf('<script src="./js/transport/chord-sequence-sync.js"></script>');
 const core=index.indexOf('<script src="./js/audio/core.js"></script>');
 assert.ok(drum>=0&&sequence>drum&&core>sequence);
});

test('recursos funcionais fora dos pontos autorizados permanecem byte a byte iguais',function(){
 const files=['offline.html','manual-gera.html','js/chords.js','js/state.js','js/transport/clock.js','js/transport/scheduler.js','js/transport/boundaries.js','js/transport/tempo.js','js/transport/drum-sync.js','js/audio/core.js','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'];
 files.forEach(function(file){assert.deepEqual(fs.readFileSync(path.join(root,file)),fs.readFileSync(path.join(baselineRoot,file)),file)});
});

test('SERVICE WORKER mantém o módulo da sequência no cache 3.15.42',function(){
 const currentSw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 const baselineSw=fs.readFileSync(path.join(baselineRoot,'sw.js'),'utf8');
 const reconstructed=currentSw.replace("'v3.15.42'","'v3.15.09'")
  .replace('    "./js/storage.js",\n','')
  .replace('    "./js/transport/chord-sequence-sync.js",\n','')
  .replace('    "./js/transport/sequence-transitions.js",\n','')
  .replace('    "./js/transport/coordinator.js",\n','')
  .replace('    "./js/ui/transport-status.js",\n','');
 const restored=reconstructed
  .replace('    "./js/ui/header.js",\n','')
  .replace('    "./js/ui/compact-panel.js",\n','')
  .replace('    "./js/ui/keyboard.js",\n','')
  .replace('    "./js/ui/chords-circle.js",\n','')
  .replace('    "./js/ui/drums.js",\n','')
  .replace('    "./js/ui/sequencer.js",\n','')
  .replace('    "./js/ui/songs-library.js",\n','')
  .replace('    "./js/ui/settings-modals.js",\n','');
 assert.equal(restored,baselineSw);
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')).version,'3.15.42');
});

test('núcleo mantém reprodução interna e transições fora do módulo extraído',function(){
 assert.ok(index.includes('function loadSequenceItem(index,boundaryAudioTime){'));
 assert.ok(index.includes('function prepareSectionDrumTransition(isLastItem){'));
 assert.ok(index.includes('function setLatchedChord(root,type,button){'));
 assert.ok(index.includes('function executeBarSegment(root,type,button,start,end){'));
 assert.ok(index.includes('function stopChordSequence(message='));
});
