'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'js/ui/sequencer.js'),'utf8');

function fakeElement(id,dataset){
 const classes=new Set();
 const listeners={};
 return{
  id:id||'',dataset:dataset||{},textContent:'',title:'',value:'',disabled:false,open:true,
  attributes:{},listeners:listeners,closeCalls:0,
  classList:{
   add:function(name){classes.add(name)},remove:function(name){classes.delete(name)},
   toggle:function(name,force){const active=force===undefined?!classes.has(name):Boolean(force);if(active)classes.add(name);else classes.delete(name);return active},
   contains:function(name){return classes.has(name)}
  },
  setAttribute:function(name,value){this.attributes[name]=String(value)},
  addEventListener:function(type,handler){listeners[type]=handler},
  close:function(){this.open=false;this.closeCalls++}
 };
}

function harness(){
 const ids=['sequence-hold-loop','sequence-auto','sequence-auto-end','sequence-panel','sequence-toggle','sequence-record','sequence-rest',
  'sequence-play','sequence-stop-drums','section-instrument','section-next','section-drum-pattern','section-drum-entry','section-drum-exit',
  'section-drum-final','sequence-clear','sequence-clear-all','sequence-edit-kind','sequence-edit-before','sequence-edit-replace',
  'sequence-edit-after','sequence-edit-delete','sequence-edit-cancel','sequence-edit-close','sequence-editor-dialog','sequence-organize-open',
  'sequence-organize-close','sequence-organize-done','sequence-order-reset','sequence-organize-dialog','sequence-record-dialog',
  'sequence-record-close','sequence-record-cancel','sequence-record-done','sequence-record-play','sequence-record-section-select',
  'sequence-record-pause','sequence-record-undo','sequence-record-clear-all'];
 const elements={};
 ids.forEach(function(id){elements[id]=fakeElement(id)});
 const sectionButtons=[fakeElement('',{sequenceSection:'verse'}),fakeElement('',{sequenceSection:'chorus'})];
 const repeatButtons=[fakeElement('',{repeatAdjust:'verse',delta:'-1'}),fakeElement('',{repeatAdjust:'verse',delta:'1'})];
 const repeatDisplays=[fakeElement('',{sectionRepeatDisplay:'verse'}),fakeElement('',{sectionRepeatDisplay:'chorus'})];
 const sectionControls=[fakeElement('',{sectionControl:'verse'}),fakeElement('',{sectionControl:'chorus'})];
 const fractions=[fakeElement('',{recordFraction:'0.25'}),fakeElement('',{recordFraction:'1'})];
 const document={
  querySelectorAll:function(selector){
   if(selector==='[data-sequence-section]')return sectionButtons;
   if(selector==='[data-repeat-adjust]')return repeatButtons;
   if(selector==='[data-section-repeat-display]')return repeatDisplays;
   if(selector==='[data-section-control]')return sectionControls;
   if(selector==='[data-record-fraction]')return fractions;
   return [];
  }
 };
 const calls=[];
 const action=function(name){return function(){calls.push([name].concat(Array.prototype.slice.call(arguments)))}};
 const options={
  document:document,getElement:function(id){return elements[id]},selectSection:action('select'),adjustRepeat:action('repeat'),
  addPause:action('pause'),togglePlayback:action('play'),toggleHoldLoop:action('loop'),saveSectionControls:action('section-controls'),
  changeSectionPattern:action('pattern'),toggleDrums:action('drums'),toggleAuto:action('auto'),toggleAutoEnd:action('auto-end'),
  deleteLast:action('delete-last'),clearAll:action('clear-all'),togglePanel:action('panel'),syncEditorKind:action('editor-kind'),
  commitEditor:action('editor-commit'),closeEditor:action('editor-close'),confirmDelete:function(){calls.push(['confirm-delete']);return Promise.resolve(true)},
  openOrganizer:action('organizer-open'),resetOrder:action('organizer-reset'),organizerDone:action('organizer-done'),
  openRecordDialog:action('record-open'),cancelRecordDialog:action('record-cancel'),finishRecordDialog:action('record-done'),
  toggleRecordPreview:action('record-preview'),selectRecordSection:action('record-section'),selectRecordFraction:action('record-fraction'),
  addRecordPause:action('record-pause'),undoRecordItem:action('record-undo'),clearRecordItems:action('record-clear'),
  recordDialogClosed:action('record-closed'),finishRecordPointer:action('record-pointer'),refreshRecordAfterEditor:action('record-refresh')
 };
 const window={document:document};
 vm.runInNewContext(source,{window:window,globalThis:window},{filename:'sequencer.js'});
 const controller=window.GeraSequencerUI.createController(options);
 return{api:window.GeraSequencerUI,controller:controller,elements:elements,sectionButtons:sectionButtons,repeatButtons:repeatButtons,
  repeatDisplays:repeatDisplays,sectionControls:sectionControls,fractions:fractions,calls:calls};
}

test('módulo expõe somente a fábrica do controlador do sequenciador',function(){
 const h=harness();
 assert.deepEqual(Object.keys(h.api),['createController']);
 assert.equal(Object.isFrozen(h.api),true);
});

test('estados visuais preservam repetição, loop, Auto e visibilidade',function(){
 const h=harness();
 h.controller.syncRepeatInputs(function(section){return section==='verse'?2:0});
 h.controller.syncHoldLoop(true);
 h.controller.syncAuto(true,false);
 h.controller.syncPanelVisibility(false);
 assert.equal(h.repeatDisplays[0].textContent,'2');
 assert.equal(h.repeatDisplays[1].title,'Fora do modo Auto');
 assert.equal(h.elements['sequence-hold-loop'].textContent,'🔁 Em Loop');
 assert.equal(h.elements['sequence-auto'].textContent,'Auto ✓');
 assert.equal(h.elements['sequence-auto-end'].classList.contains('active'),false);
 assert.equal(h.elements['sequence-panel'].classList.contains('sequence-hidden'),true);
});

test('botões de gravação, pausa, reprodução e bateria mantêm textos e ARIA',function(){
 const h=harness();
 h.controller.syncRecordButton(true);
 h.controller.syncPauseButton({fraction:.5,fractionLabel:'½',durationLabel:'meio compasso'});
 h.controller.syncPlayButton(true);
 h.controller.syncDrumButton(true);
 assert.equal(h.elements['sequence-record'].textContent,'■ Gravando');
 assert.equal(h.elements['sequence-rest'].textContent,'⏸ Pausa ½');
 assert.equal(h.elements['sequence-play'].attributes['aria-pressed'],'true');
 assert.equal(h.elements['sequence-stop-drums'].attributes['aria-label'],'Parar bateria');
});

test('seções preservam seleção ativa, fila, conteúdo e repetição em execução',function(){
 const h=harness();
 h.controller.syncSectionButtons({labels:{verse:'A',chorus:'C'},activeSection:'verse',queuedSection:'chorus',playing:true,hasContent:function(section){return section==='verse'}});
 assert.equal(h.sectionButtons[0].classList.contains('active-section'),true);
 assert.equal(h.sectionButtons[0].classList.contains('has-content'),true);
 assert.equal(h.sectionButtons[1].classList.contains('queued-section'),true);
 assert.equal(h.sectionButtons[1].attributes['aria-label'],'C — próxima seção');
 assert.equal(h.sectionControls[0].classList.contains('playing-repeat'),true);
});

test('liga os controles principais sem incorporar decisões musicais',function(){
 const h=harness();
 h.controller.bindMainControls();
 h.sectionButtons[1].onclick();
 h.repeatButtons[0].onclick();
 h.elements['sequence-rest'].onclick();
 h.elements['sequence-play'].onclick();
 h.elements['section-drum-pattern'].value='rock';h.elements['section-drum-pattern'].onchange();
 h.elements['sequence-auto'].onclick();
 h.elements['sequence-clear'].onclick();
 h.elements['sequence-toggle'].onclick();
 assert.deepEqual(h.calls,[['select','chorus'],['repeat','verse',-1],['pause'],['play'],['pattern','rock'],['auto'],['delete-last'],['panel']]);
});

test('liga editor de item e organizador, inclusive confirmações e cancelamento',async function(){
 const h=harness();
 h.controller.bindItemEditor();
 h.controller.bindOrganizer();
 h.elements['sequence-edit-before'].onclick();
 await h.elements['sequence-edit-delete'].onclick();
 h.elements['sequence-editor-dialog'].listeners.cancel({preventDefault:function(){}});
 h.elements['sequence-organize-open'].onclick();
 h.elements['sequence-organize-done'].onclick();
 assert.deepEqual(h.calls,[['editor-commit','before'],['editor-close'],['confirm-delete'],['editor-commit','delete'],['editor-close'],['organizer-open'],['organizer-done']]);
 assert.equal(h.elements['sequence-organize-dialog'].closeCalls,1);
});

test('liga o diálogo de gravação e mantém ponteiros e atualização após edição',function(){
 const h=harness();
 h.controller.bindRecordDialog();
 let prevented=0;
 h.elements['sequence-record'].listeners.click({preventDefault:function(){prevented++},stopPropagation:function(){prevented++}});
 h.fractions[0].onclick();
 h.elements['sequence-record-pause'].onclick();
 h.elements['sequence-record-dialog'].listeners.pointerup({pointerId:7});
 h.elements['sequence-editor-dialog'].listeners.close();
 assert.equal(prevented,2);
 assert.deepEqual(h.calls,[['record-open'],['record-fraction',.25],['record-pause'],['record-pointer',{pointerId:7}],['record-refresh']]);
});

test('arquivo extraído não contém áudio, transporte, persistência ou estado musical',function(){
 assert.doesNotMatch(source,/AudioContext|playChordSequence|startDrums|localStorage|GeraStorage|sequenceSections|sequencePlaying|sequenceAuto|setTimeout|setInterval|requestAnimationFrame/);
});

test('HTML e SERVICE WORKER carregam o módulo uma única vez na versão 3.15.29',function(){
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 const tag='<script src="./js/ui/sequencer.js"></script>';
 assert.equal((html.match(/\.\/js\/ui\/sequencer\.js/g)||[]).length,1);
 assert.ok(html.indexOf(tag)<html.indexOf('<script src="./js/audio/core.js"></script>'));
 assert.equal((sw.match(/\.\/js\/ui\/sequencer\.js/g)||[]).length,1);
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.29';"));
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')).version,'3.15.29');
});

test('módulo da 8F é a única adição funcional sobre a versão 3.15.25',function(){
 const previous=path.resolve(root,'..','GERA-PWA-v3.15.25-etapa-8E-bateria');
 const stage8F=path.resolve(root,'..','GERA-PWA-v3.15.26-etapa-8F-sequenciador');
 const currentFiles=fs.readdirSync(path.join(stage8F,'js','ui')).sort();
 const previousFiles=fs.readdirSync(path.join(previous,'js','ui')).sort();
 assert.deepEqual(currentFiles.filter(function(file){return previousFiles.indexOf(file)<0}),['sequencer.js']);
});

test('reversão exclusiva da 8F recompõe a versão 3.15.25 byte a byte',function(){
 const previous=path.resolve(root,'..','GERA-PWA-v3.15.25-etapa-8E-bateria');
 const stage8F=path.resolve(root,'..','GERA-PWA-v3.15.26-etapa-8F-sequenciador');
 const previousIndex=fs.readFileSync(path.join(previous,'index.html'),'utf8');
 let reconstructed=fs.readFileSync(path.join(stage8F,'index.html'),'utf8');

 function replaceRange(current,start,end,original){
  const a=current.indexOf(start);const b=current.indexOf(end,a);
  const c=original.indexOf(start);const d=original.indexOf(end,c);
  assert.ok(a>=0&&b>a&&c>=0&&d>c,start);
  return current.slice(0,a)+original.slice(c,d)+current.slice(b);
 }

 reconstructed=replaceRange(reconstructed,'function syncSequenceRepeatInputs(){','function clearChordLatchState',previousIndex);
 reconstructed=replaceRange(reconstructed,'function syncSequencePlayButton(){','function playChordSequence(){',previousIndex);
 reconstructed=replaceRange(reconstructed,"$('change-full').onclick=function(){selectChordChangeMode('nextBar')};","$('advanced-toggle').onclick=",previousIndex);
 reconstructed=replaceRange(reconstructed,"const appConfirmOk=$('app-confirm-ok');","$('songs-open').onclick=",previousIndex);
 reconstructed=replaceRange(reconstructed,' function bindSequenceRecordDialog(){',' function assemble(){',previousIndex);
 reconstructed=reconstructed.replaceAll('3.15.26','3.15.25').replace('<script src="./js/ui/sequencer.js"></script>\n','');

 const reconstructedSw=fs.readFileSync(path.join(stage8F,'sw.js'),'utf8')
  .replace("'v3.15.26'","'v3.15.25'")
  .replace('    "./js/ui/sequencer.js",\n','');
 const reconstructedManifest=fs.readFileSync(path.join(stage8F,'manifest.json'),'utf8').replace('"3.15.26"','"3.15.25"');
 assert.equal(reconstructed,previousIndex);
 assert.equal(reconstructedSw,fs.readFileSync(path.join(previous,'sw.js'),'utf8'));
 assert.equal(reconstructedManifest,fs.readFileSync(path.join(previous,'manifest.json'),'utf8'));
});
