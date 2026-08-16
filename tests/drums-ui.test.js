'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'js/ui/drums.js'),'utf8');

function fakeElement(id,dataset){
 const classes=new Set();
 const listeners={};
 return{
  id:id||'',dataset:dataset||{},textContent:'',title:'',value:'',disabled:false,
  listeners:listeners,attributes:{},
  classList:{
   add:function(name){classes.add(name)},remove:function(name){classes.delete(name)},
   toggle:function(name,force){const active=force===undefined?!classes.has(name):Boolean(force);if(active)classes.add(name);else classes.delete(name);return active},
   contains:function(name){return classes.has(name)}
  },
  addEventListener:function(type,handler,options){listeners[type]={handler:handler,options:options}},
  setAttribute:function(name,value){this.attributes[name]=String(value)}
 };
}

function harness(){
 const ids=['drum-status','drum-fill','drum-ending','drum-pattern-select','drum-stop','drum-toggle','drum-panel',
  'drum-manual','manual-drum-stage','normal-chord-group','circle-main-wrap','secondary-dominants-wrap','drum-engine','metronome-toggle'];
 const elements={};
 ids.forEach(function(id){elements[id]=fakeElement(id)});
 const patterns=[fakeElement('',{pattern:'rock'}),fakeElement('',{pattern:'forro'})];
 const manualPads=[fakeElement('',{drum:'kick'}),fakeElement('',{drum:'snare'})];
 const layers=[fakeElement('',{layer:'kick'}),fakeElement('',{layer:'hat'})];
 const chordSection=fakeElement('chord-section');
 const document={
  querySelectorAll:function(selector){
   if(selector==='.drum-pattern')return patterns;
   if(selector==='.manual-drum-pad')return manualPads;
   if(selector==='[data-layer]')return layers;
   return [];
  },
  querySelector:function(selector){return selector==='.chord-section'?chordSection:null}
 };
 const calls=[];
 let layerEnabled=false;
 const window={document:document};
 vm.runInNewContext(source,{window:window,globalThis:window},{filename:'drums.js'});
 const controller=window.GeraDrumsUI.createController({
  document:document,getElement:function(id){return elements[id]},
  togglePanel:function(){calls.push(['panel'])},
  playManualDrum:function(piece){calls.push(['play',piece])},
  toggleLayer:function(name){layerEnabled=!layerEnabled;calls.push(['layer',name]);return layerEnabled},
  startPattern:function(pattern){calls.push(['pattern',pattern])},
  requestAction:function(action){calls.push(['action',action])},
  stopDrums:function(){calls.push(['stop'])},
  toggleManual:function(){calls.push(['manual'])},
  toggleMetronome:function(){calls.push(['metronome'])},
  changeEngine:function(engine){calls.push(['engine',engine])}
 });
 return{controller:controller,elements:elements,patterns:patterns,manualPads:manualPads,layers:layers,
  chordSection:chordSection,calls:calls,api:window.GeraDrumsUI};
}

test('módulo expõe somente a fábrica do controlador da bateria',function(){
 const h=harness();
 assert.deepEqual(Object.keys(h.api),['createController']);
 assert.equal(Object.isFrozen(h.api),true);
});

test('sincroniza virada e encerramento, inclusive bloqueio em 3/4',function(){
 const h=harness();
 h.controller.syncActionButtons({blocked:false,fillActive:true,endingActive:false});
 assert.equal(h.elements['drum-fill'].classList.contains('active'),true);
 assert.equal(h.elements['drum-ending'].classList.contains('active'),false);
 h.controller.syncActionButtons({blocked:true,fillActive:true,endingActive:true});
 assert.equal(h.elements['drum-fill'].disabled,true);
 assert.match(h.elements['drum-fill'].title,/3\/4/);
 assert.equal(h.elements['drum-ending'].classList.contains('active'),false);
});

test('seleção e parada preservam botões, seletor e texto de estado',function(){
 const h=harness();
 h.controller.selectPattern('forro','Forró · aguardando');
 assert.equal(h.patterns[0].classList.contains('active'),false);
 assert.equal(h.patterns[1].classList.contains('active'),true);
 assert.equal(h.elements['drum-pattern-select'].value,'forro');
 assert.equal(h.elements['drum-status'].textContent,'Forró · aguardando');
 h.elements['drum-stop'].classList.add('active');
 h.controller.clearPatternSelection('Bateria parada.');
 assert.equal(h.patterns[1].classList.contains('active'),false);
 assert.equal(h.elements['drum-stop'].classList.contains('active'),false);
 assert.equal(h.elements['drum-status'].textContent,'Bateria parada.');
});

test('modo manual preserva pads, acordes e círculo harmônico',function(){
 const h=harness();
 h.controller.setManualMode(true,true);
 assert.equal(h.elements['drum-manual'].textContent,'L');
 assert.equal(h.elements['manual-drum-stage'].classList.contains('visible'),true);
 assert.equal(h.chordSection.classList.contains('manual-drums'),true);
 assert.equal(h.elements['normal-chord-group'].classList.contains('hidden'),true);
 assert.equal(h.elements['circle-main-wrap'].classList.contains('visible'),false);
 h.controller.setManualMode(false,true);
 assert.equal(h.elements['drum-manual'].textContent,'M');
 assert.equal(h.elements['circle-main-wrap'].classList.contains('visible'),true);
});

test('metrônomo preserva texto, título, classe e atributos ARIA',function(){
 const h=harness();
 h.controller.syncMetronome(true);
 assert.equal(h.elements['metronome-toggle'].classList.contains('active'),true);
 assert.equal(h.elements['metronome-toggle'].textContent,'■ Parar');
 assert.equal(h.elements['metronome-toggle'].attributes['aria-pressed'],'true');
 h.controller.syncMetronome(false);
 assert.equal(h.elements['metronome-toggle'].textContent,'▶ Iniciar');
 assert.equal(h.elements['metronome-toggle'].title,'Iniciar metrônomo');
});

test('liga painel, pads, camadas, ritmos, ações e motor sem decidir áudio',function(){
 const h=harness();
 h.controller.bindControls();
 h.elements['drum-toggle'].onclick();
 h.manualPads[0].listeners.pointerdown.handler({preventDefault:function(){}});
 assert.equal(h.manualPads[0].listeners.pointerdown.options.passive,false);
 h.layers[0].onclick();
 h.patterns[1].onclick();
 h.elements['drum-fill'].onclick();
 h.elements['drum-ending'].onclick();
 h.elements['drum-stop'].onclick();
 h.elements['drum-manual'].onclick();
 h.elements['drum-engine'].onchange({target:{value:'synth'}});
 h.elements['metronome-toggle'].onclick();
 assert.deepEqual(h.calls,[['panel'],['play','kick'],['layer','kick'],['pattern','forro'],['action','fill'],['action','ending'],['stop'],['manual'],['engine','synth'],['metronome']]);
 assert.equal(h.layers[0].classList.contains('layer-on'),true);
});

test('arquivo extraído não contém áudio, transporte, padrões ou persistência',function(){
 assert.doesNotMatch(source,/AudioContext|playDrum\(|startDrums\(|DRUM_PATTERNS|scheduleDrumStep|localStorage|GeraStorage|setTimeout|setInterval|requestAnimationFrame/);
});

test('HTML carrega o módulo e delega a interface da bateria',function(){
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const moduleTag='<script src="./js/ui/drums.js"></script>';
 assert.ok(html.includes(moduleTag));
 assert.ok(html.indexOf(moduleTag)<html.indexOf('<script src="./js/audio/core.js"></script>'));
 assert.ok(html.includes('const drumsUI=GeraDrumsUI.createController({'));
 assert.ok(html.includes('drumsUI.bindControls();'));
 assert.equal(html.includes("document.querySelectorAll('.manual-drum-pad').forEach(function(button){"),false);
 assert.equal(html.includes("document.querySelectorAll('[data-layer]').forEach"),false);
});

test('SERVICE WORKER inclui o módulo uma vez e usa a versão 3.15.42',function(){
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.42';"));
 assert.equal((sw.match(/\.\/js\/ui\/drums\.js/g)||[]).length,1);
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')).version,'3.15.42');
});

test('módulo da 8E é a única adição de arquivo funcional sobre a 3.15.24',function(){
 const previous=path.resolve(root,'..','GERA-PWA-v3.15.24-etapa-8D-acordes-circulo-harmonico');
 const stage8E=path.resolve(root,'..','GERA-PWA-v3.15.25-etapa-8E-bateria');
 const currentFiles=fs.readdirSync(path.join(stage8E,'js','ui')).sort();
 const previousFiles=fs.readdirSync(path.join(previous,'js','ui')).sort();
 assert.deepEqual(currentFiles.filter(function(file){return previousFiles.indexOf(file)<0}),['drums.js']);
 assert.equal(fs.existsSync(path.join(previous,'js','ui','drums.js')),false);
});

test('reversão exclusiva da 8E recompõe a versão 3.15.24 byte a byte',function(){
 const previous=path.resolve(root,'..','GERA-PWA-v3.15.24-etapa-8D-acordes-circulo-harmonico');
 const stage8E=path.resolve(root,'..','GERA-PWA-v3.15.25-etapa-8E-bateria');
 const previousIndex=fs.readFileSync(path.join(previous,'index.html'),'utf8');
 let reconstructed=fs.readFileSync(path.join(stage8E,'index.html'),'utf8');

 function replaceRange(current,currentStart,currentEnd,original,originalStart,originalEnd){
  const a=current.indexOf(currentStart);
  const b=current.indexOf(currentEnd,a);
  const c=original.indexOf(originalStart);
  const d=original.indexOf(originalEnd,c);
  assert.ok(a>=0&&b>a&&c>=0&&d>c,currentStart);
  return current.slice(0,a)+original.slice(c,d)+current.slice(b);
 }

 reconstructed=replaceRange(reconstructed,'function applyPendingBpmAtBoundary','const transportTempoController',previousIndex,'function applyPendingBpmAtBoundary','const transportTempoController');
 reconstructed=replaceRange(reconstructed,'function syncMetronomeButton','function playMetronomePulse',previousIndex,'function syncMetronomeButton','function playMetronomePulse');
 reconstructed=replaceRange(reconstructed,'const drumsUI=','function requestDrumAction',previousIndex,'function syncDrumActionButtons','function requestDrumAction');
 reconstructed=replaceRange(reconstructed,'function finishAccompanimentsAtBarEnd','function requestAccompanimentStop',previousIndex,'function finishAccompanimentsAtBarEnd','function requestAccompanimentStop');
 reconstructed=replaceRange(reconstructed,'function handleTransportSchedulerPulse','const transportBoundaryEmitter',previousIndex,'function handleTransportSchedulerPulse','const transportBoundaryEmitter');
 reconstructed=replaceRange(reconstructed,'const drumTransportConsumer','const sequenceTransportConsumer',previousIndex,'const drumTransportConsumer','const sequenceTransportConsumer');
 reconstructed=replaceRange(reconstructed,'function startDrums','function sinoNaturalNotes',previousIndex,'function startDrums','function sinoNaturalNotes');
 reconstructed=reconstructed.replace("$('chord-together').onclick=function(){chordMode='together';syncChordModeButtons()};","$('metronome-toggle').onclick=toggleMetronome;\n$('chord-together').onclick=function(){chordMode='together';syncChordModeButtons()};");
 reconstructed=reconstructed
  .replaceAll('3.15.25','3.15.24')
  .replace('<script src="./js/ui/drums.js"></script>\n','');

 const reconstructedSw=fs.readFileSync(path.join(stage8E,'sw.js'),'utf8')
  .replace("'v3.15.25'","'v3.15.24'")
  .replace('    "./js/ui/drums.js",\n','');
 const reconstructedManifest=fs.readFileSync(path.join(stage8E,'manifest.json'),'utf8')
  .replace('"3.15.25"','"3.15.24"');

 assert.equal(reconstructed,previousIndex);
 assert.equal(reconstructedSw,fs.readFileSync(path.join(previous,'sw.js'),'utf8'));
 assert.equal(reconstructedManifest,fs.readFileSync(path.join(previous,'manifest.json'),'utf8'));
});
