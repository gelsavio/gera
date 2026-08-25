'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const baselineRoot=path.resolve(root,'..','GERA-PWA-v3.15.12-etapa-6I-transicoes-sequencias');
const auditedRoot=path.resolve(root,'..','GERA-PWA-v3.15.14-etapa-6K-auditoria-paridade');
const source=fs.readFileSync(path.join(root,'js/ui/transport-status.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

function node(){
 const classes=new Set();
 return {
  textContent:'',hidden:false,value:'',title:'',attributes:{},
  classList:{
   toggle:function(name,active){if(active)classes.add(name);else classes.delete(name)},
   contains:function(name){return classes.has(name)}
  },
  setAttribute:function(name,value){this.attributes[name]=value}
 };
}
function baseState(){
 return {
  capoSemitones:0,octave:0,sequenceHoldLoop:false,
  sequencePlaying:false,sequenceStartQueued:false,drumRunning:false,drumStartQueued:false,
  currentSongName:'CANÇÃO',activeSequenceSection:'verse',queuedSequenceSection:null,
  sequencePendingTransition:null,sectionLabels:{verse:'Estrofe',prechorus:'Pré-refrão',chorus:'Refrão'},
  bpm:100,sequenceAuto:true,sequenceAutoEnd:false,
  sequenceSections:{verse:[{fraction:1},{fraction:.5}],prechorus:[],chorus:[]},
  sequenceIndex:-1,sequenceEighthUnitsRemaining:0,currentSectionRepetition:1,
  sectionRepeatValue:function(){return 1},barDuration:function(){return 2400},
  keyboardVolume:100,chordVolume:78,bassVolume:62,drumVolume:70,statusText:'Pronto'
 };
}
function harness(initial){
 const nodes={};
 const state=Object.assign(baseState(),initial||{});
 let listSyncs=0;
 let carouselRenders=0;
 const context={window:{}};
 vm.createContext(context);
 vm.runInContext(source,context,{filename:'transport-status.js'});
 const consumer=context.window.GeraTransportStatus.createConsumer({
  getElement:function(id){if(!nodes[id])nodes[id]=node();return nodes[id]},
  getSnapshot:function(){return state},
  syncListControls:function(){listSyncs++},
  renderCarousel:function(){carouselRenders++}
 });
 return {consumer:consumer,state:state,nodes:nodes,getListSyncs:function(){return listSyncs},getCarouselRenders:function(){return carouselRenders}};
}

test('carregar e criar o consumidor não inicia temporizador, áudio ou transporte',function(){
 let timers=0;
 const context={window:{},setTimeout:function(){timers++},setInterval:function(){timers++},AudioContext:function(){throw new Error('não deve criar áudio')}};
 vm.createContext(context);
 vm.runInContext(source,context,{filename:'transport-status.js'});
 context.window.GeraTransportStatus.createConsumer({getElement:function(){return null},getSnapshot:baseState});
 assert.equal(timers,0);
});

test('painel compacto preserva textos, classes e aria dos três modos',function(){
 const h=harness({sequencePlaying:true,drumRunning:true,capoSemitones:2,octave:-1});
 h.consumer.syncCompactControls();
 assert.equal(h.nodes['compact-capo-value'].textContent,'+2');
 assert.equal(h.nodes['compact-octave-value'].textContent,'-1');
 assert.equal(h.nodes['compact-play'].textContent,'■ Parar Música + Bateria');
 assert.equal(h.nodes['compact-sequence-only'].textContent,'■ Parar Música');
 assert.equal(h.nodes['compact-drum-only'].textContent,'■ Parar Bateria');
 assert.equal(h.nodes['compact-play'].attributes['aria-pressed'],'true');
 assert.equal(h.getListSyncs(),1);
 assert.equal(h.getCarouselRenders(),1);
});

test('somente bateria e somente sequência continuam distintos',function(){
 const drums=harness({drumStartQueued:true});
 drums.consumer.syncCompactControls();
 assert.equal(drums.nodes['compact-drum-only'].attributes['aria-pressed'],'true');
 assert.equal(drums.nodes['compact-sequence-only'].attributes['aria-pressed'],'false');
 const sequence=harness({sequenceStartQueued:true});
 sequence.consumer.syncCompactControls();
 assert.equal(sequence.nodes['compact-drum-only'].attributes['aria-pressed'],'false');
 assert.equal(sequence.nodes['compact-sequence-only'].attributes['aria-pressed'],'true');
});

test('loop, música, seção e BPM mantêm os textos anteriores',function(){
 const h=harness({sequenceHoldLoop:true,bpm:132,activeSequenceSection:'chorus'});
 h.consumer.syncCompactControls();
 assert.equal(h.nodes['compact-loop'].textContent,'🔁 Sequência em loop');
 assert.equal(h.nodes['compact-current-song'].textContent,'Refrão · 132 BPM');
 assert.equal(h.nodes['compact-selected-song'].textContent,'CANÇÃO');
});

test('readouts refletem BPM, modos, volumes e status sem recriar DOM',function(){
 const h=harness({bpm:144,sequencePlaying:true,sequenceAuto:false,sequenceAutoEnd:true,statusText:'Executando'});
 h.consumer.updateReadouts();
 assert.equal(h.nodes['redesign-bpm-readout'].textContent,'144');
 assert.equal(h.nodes['redesign-play'].attributes['aria-pressed'],'true');
 assert.equal(h.nodes['redesign-play-loop'].attributes['aria-pressed'],'false');
 assert.equal(h.nodes['redesign-voices-volume'].value,'80');
 assert.equal(h.nodes['redesign-drums-volume'].value,'70');
 assert.equal(h.nodes['redesign-status'].textContent,'Executando');
});

test('cálculo de unidades preserva compasso, meio, quarto e oitavo',function(){
 const h=harness();
 assert.deepEqual([1,.75,.5,.25,.125].map(function(fraction){return h.consumer.sequenceItemUnits({fraction:fraction})}),[8,6,4,2,1]);
});

test('contador inclui item atual, itens seguintes e repetições restantes',function(){
 const h=harness({sequencePlaying:true,sequenceIndex:0,sequenceEighthUnitsRemaining:3,currentSectionRepetition:1,sectionRepeatValue:function(){return 2}});
 assert.equal(h.consumer.sequenceRemainingUnits('verse'),3+4+12);
});

test('loop atual não soma passagens futuras',function(){
 const h=harness({sequencePlaying:true,sequenceHoldLoop:true,sequenceIndex:0,sequenceEighthUnitsRemaining:3,sectionRepeatValue:function(){return 4}});
 assert.equal(h.consumer.sequenceRemainingUnits('verse'),7);
});

test('contador aparece durante fila e execução e some após parada',function(){
 const h=harness({sequenceStartQueued:true});
 h.consumer.syncCompactSequenceCountdown();
 assert.equal(h.nodes['compact-seq-countdown'].hidden,false);
 assert.equal(h.nodes['compact-seq-countdown-label'].textContent,'Restante · Estrofe');
 h.state.sequenceStartQueued=false;
 h.consumer.syncCompactSequenceCountdown();
 assert.equal(h.nodes['compact-seq-countdown'].hidden,true);
});

test('formatação do contador mantém arredondamento e MM:SS',function(){
 const h=harness({barDuration:function(){return 4000}});
 assert.equal(h.consumer.formatSequenceCountdown(12),'00:06');
});

test('módulo não cria elementos, listeners, scheduler ou regras musicais',function(){
 assert.doesNotMatch(source,/createElement|replaceChildren|innerHTML|addEventListener|setTimeout|setInterval|requestAnimationFrame/);
 assert.doesNotMatch(source,/scheduleDrum|playChord|resolveEnd|transportScheduler|AudioContext/);
});

test('carregamento ocorre após o coordenador e antes do núcleo de áudio',function(){
 const coordinator=index.indexOf('<script src="./js/transport/coordinator.js"></script>');
 const status=index.indexOf('<script src="./js/ui/transport-status.js"></script>');
 const audio=index.indexOf('<script src="./js/audio/core.js"></script>');
 assert.ok(coordinator>=0&&status>coordinator&&audio>status);
});

test('reversão exclusiva da 6J recompõe a versão 3.15.12 byte a byte',function(){
 const baselineIndex=fs.readFileSync(path.join(baselineRoot,'index.html'),'utf8');
 const auditedIndex=fs.readFileSync(path.join(auditedRoot,'index.html'),'utf8');
 function block(text,start,end){return text.slice(text.indexOf(start),text.indexOf(end,text.indexOf(start)))}
 const baselineCompact=block(baselineIndex,'function syncCompactControls(){','function setCompactMode(active){');
 const currentCompact=block(auditedIndex,'const transportStatusConsumer=','function setCompactMode(active){');
 const baselineReadout=block(baselineIndex,' function updateReadouts(){','\n\n let songSignature=');
 const currentReadout=block(auditedIndex,' function updateReadouts(){','\n\n let songSignature=');
 const baselineCounters=block(baselineIndex,' function sequenceItemUnits(item){',' function keepPlayingSequenceCardVisible');
 const currentCounters=block(auditedIndex,' function sequenceItemUnits(item){',' function keepPlayingSequenceCardVisible');
 const reconstructedIndex=auditedIndex
  .replace(currentCompact,baselineCompact)
  .replace(currentReadout,baselineReadout)
  .replace(currentCounters,baselineCounters)
  .replaceAll('3.15.14','3.15.12')
  .replace('<script src="./js/ui/transport-status.js"></script>\n','');
 const reconstructedSw=fs.readFileSync(path.join(auditedRoot,'sw.js'),'utf8')
  .replace("'v3.15.14'","'v3.15.12'")
  .replace('    "./js/ui/transport-status.js",\n','');
 const reconstructedManifest=fs.readFileSync(path.join(auditedRoot,'manifest.json'),'utf8').replace('"3.15.14"','"3.15.12"');
 assert.equal(reconstructedIndex,baselineIndex);
 assert.equal(reconstructedSw,fs.readFileSync(path.join(baselineRoot,'sw.js'),'utf8'));
 assert.equal(reconstructedManifest,fs.readFileSync(path.join(baselineRoot,'manifest.json'),'utf8'));
});

test('módulos de interface extraídos permanecem no pré-cache',function(){
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.ok(sw.includes('    "./js/ui/transport-status.js",'));
 assert.ok(sw.includes('    "./js/ui/compact-panel.js",'));
 assert.ok(sw.includes('    "./js/ui/keyboard.js",'));
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.54';"));
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')).version,'3.15.54');
});
