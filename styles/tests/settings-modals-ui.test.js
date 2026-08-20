'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const previous=path.resolve(root,'..','GERA-PWA-v3.15.27-etapa-8G-musicas-biblioteca');
const source=fs.readFileSync(path.join(root,'js/ui/settings-modals.js'),'utf8');

function fakeElement(id){
 const classes=new Set();
 const listeners={};
 return{
  id:id,value:'',defaultValue:'',min:'0',max:'100',step:'1',textContent:'',dataset:{},options:[{textContent:'Opção'}],selectedIndex:0,
  listeners:listeners,onclick:null,onchange:null,blurCalls:0,dispatched:[],
  classList:{toggle:function(name){if(classes.has(name))classes.delete(name);else classes.add(name)},contains:function(name){return classes.has(name)}},
  addEventListener:function(type,handler){listeners[type]=handler},
  dispatchEvent:function(event){this.dispatched.push(event);if(listeners[event.type])listeners[event.type].call(this,event)},
  select:function(){},blur:function(){this.blurCalls++},closest:function(){return null}
 };
}

function harness(){
 const ids=['release','attack','arp-interval','master-volume','drum-volume','keyboard-volume','chord-volume','bass-volume','bpm','bpm-value',
  'instrument','oct-down','oct-up','capo-down','capo-label','capo-up','sustain-pressed','sustain-hold','sustain-next','chord-together','chord-arpeggio',
  'arpeggio-pattern','inversion','rhythm-pattern','split-toggle','split-instrument','velocity-toggle','gliss-toggle','latch-toggle','bass-toggle',
  'change-zero','change-eighth','change-quarter','change-half','change-three-quarter','change-full','save-settings','advanced-toggle','fullscreen',
  'stop-accompaniments','global-mute-float','app-confirm-ok','app-confirm-cancel','app-confirm-dialog'];
 const elements={};ids.forEach(function(id){elements[id]=fakeElement(id)});
 elements.bpm.value='100';elements.bpm.min='40';elements.bpm.max='220';
 const fine=fakeElement('fine');fine.dataset={stepTarget:'release',direction:'1'};elements.release.value='650';elements.release.max='5000';elements.release.step='20';
 const memory=fakeElement('memory');memory.dataset.memory='2';
 const document={
  querySelectorAll:function(selector){if(selector==='.fine-btn')return[fine];if(selector==='.memory-button')return[memory];return[]},
  addEventListener:function(type,handler){this[type]=handler}
 };
 const calls=[];
 const action=function(name){return function(){calls.push([name].concat(Array.prototype.slice.call(arguments)))}};
 const options={document:document,getElement:function(id){return elements[id]},getBpm:function(){return 100},requestBpmChange:action('bpm'),updateRanges:action('ranges'),
  changeInstrument:action('instrument'),adjustOctave:action('octave'),adjustCapo:action('capo'),resetCapo:action('capo-zero'),selectSustainMode:action('sustain'),
  selectChordMode:action('chord-mode'),changeArpeggioPattern:action('arpeggio'),changeInversion:action('inversion'),changeRhythmPattern:action('rhythm'),
  toggleSplit:action('split'),changeSplitInstrument:action('split-instrument'),toggleVelocity:action('velocity'),toggleGlissando:action('gliss'),toggleLatch:action('latch'),
  toggleBass:action('bass'),selectChordChangeMode:action('change-mode'),toggleSaveMode:action('save-mode'),handleMemoryButton:action('memory'),toggleAdvanced:action('advanced'),
  toggleFullscreen:action('fullscreen'),stopAccompaniments:action('stop'),toggleGlobalMute:action('mute'),closeConfirm:action('confirm')};
 function FakeEvent(type,init){this.type=type;this.bubbles=init&&init.bubbles}
 const window={document:document,Event:FakeEvent};
 vm.runInNewContext(source,{window:window,globalThis:window},{filename:'settings-modals.js'});
 return{api:window.GeraSettingsModalsUI,controller:window.GeraSettingsModalsUI.createController(options),elements:elements,fine:fine,memory:memory,document:document,calls:calls};
}

test('módulo expõe somente a fábrica do controlador de configurações e modais',function(){
 const h=harness();assert.deepEqual(Object.keys(h.api),['createController']);assert.equal(Object.isFrozen(h.api),true);
});

test('BPM digitado preserva validação, limites, Enter e comando do núcleo',function(){
 const h=harness();h.controller.bindBpmControl();
 h.elements.bpm.value='245';h.elements.bpm.listeners.input.call(h.elements.bpm);assert.equal(h.elements['bpm-value'].textContent,'245 BPM');
 h.elements.bpm.listeners.keydown.call(h.elements.bpm,{key:'Enter',preventDefault:function(){}});
 assert.deepEqual(h.calls,[['bpm',220]]);assert.equal(h.elements.bpm.value,'220');assert.equal(h.elements.bpm.blurCalls,1);
});

test('ajustes finos e faixas preservam passos, limites e atualização visual',function(){
 const h=harness();h.controller.bindRangeControls();h.controller.bindFineButtons();
 h.fine.listeners.click();assert.equal(h.elements.release.value,670);assert.equal(h.elements.release.dispatched[0].type,'input');
 h.elements.attack.listeners.input();assert.equal(h.calls.length,2);assert.equal(h.calls[0][0],'ranges');assert.equal(h.calls[1][0],'ranges');
});

test('controles musicais encaminham os mesmos valores sem decidir estado',function(){
 const h=harness();h.controller.bindSettingsControls();
 h.elements['oct-down'].onclick();h.elements['capo-up'].onclick();h.elements['sustain-next'].onclick();h.elements['chord-arpeggio'].onclick();
 h.elements['change-three-quarter'].onclick();h.elements.instrument.onchange({target:h.elements.instrument});
 assert.deepEqual(h.calls,[['octave',-1],['capo',1],['sustain','next'],['chord-mode','arpeggio'],['change-mode','threeQuarterBar'],['instrument',{target:h.elements.instrument}]]);
});

test('memórias preservam modo de salvamento e posição selecionada',function(){
 const h=harness();h.controller.bindMemoryControls();h.elements['save-settings'].onclick();h.memory.onclick();
 assert.deepEqual(h.calls,[['save-mode'],['memory',h.memory]]);
});

test('controles gerais preservam painel, tela cheia, parada, mute e menu de contexto',function(){
 const h=harness();h.controller.bindGeneralControls();
 h.elements['advanced-toggle'].onclick();h.elements.fullscreen.onclick();h.elements['stop-accompaniments'].onclick();h.elements['global-mute-float'].onclick();
 let prevented=false;h.document.contextmenu({target:{closest:function(){return{}}},preventDefault:function(){prevented=true}});
 assert.deepEqual(h.calls,[['advanced'],['fullscreen'],['stop'],['mute']]);assert.equal(prevented,true);
});

test('modal geral preserva confirmação, cancelamento e bloqueio do Escape nativo',function(){
 const h=harness();h.controller.bindConfirmDialog();h.elements['app-confirm-ok'].onclick();h.elements['app-confirm-cancel'].onclick();
 let prevented=false;h.elements['app-confirm-dialog'].listeners.cancel({preventDefault:function(){prevented=true}});
 assert.deepEqual(h.calls,[['confirm',true],['confirm',false],['confirm',false]]);assert.equal(prevented,true);
});

test('arquivo extraído não contém persistência, áudio, transporte ou estado musical',function(){
 assert.doesNotMatch(source,/localStorage|GeraStorage|AudioContext|sequencePlaying|drumRunning|createVoice|startDrums|playChordSequence|setInterval|requestAnimationFrame/);
});

test('HTML, manifesto e SERVICE WORKER carregam uma vez o módulo da 8H',function(){
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.equal((html.match(/\.\/js\/ui\/settings-modals\.js/g)||[]).length,1);assert.equal((sw.match(/\.\/js\/ui\/settings-modals\.js/g)||[]).length,1);
 assert.ok(html.indexOf('<script src="./js/ui/settings-modals.js"></script>')<html.indexOf('<script src="./js/audio/core.js"></script>'));
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.50';"));assert.equal(JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')).version,'3.15.50');
 const added=fs.readdirSync(path.join(root,'js','ui')).filter(function(file){return file!=='lyrics-editor.js'&&!fs.existsSync(path.join(previous,'js','ui',file))});
 assert.deepEqual(added,['settings-modals.js']);
});

test('recursos funcionais fora do escopo permanecem byte a byte iguais à 3.15.27',function(){
 const files=['offline.html','manual-gera.html','js/chords.js','js/state.js','js/audio/core.js'];
 files.forEach(function(file){assert.deepEqual(fs.readFileSync(path.join(root,file)),fs.readFileSync(path.join(previous,file)),file)});
});
