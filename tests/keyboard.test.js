'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'js/ui/keyboard.js'),'utf8');

function load(windowExtras){
 const window=Object.assign({addEventListener:function(){}},windowExtras||{});
 vm.runInNewContext(source,{window:window,Map:Map},{filename:'keyboard.js'});
 return window.GeraKeyboard;
}

function fakeElement(tag){
 const listeners={};
 return{
  tagName:String(tag||'DIV').toUpperCase(),dataset:{},className:'',innerHTML:'',children:[],
  classList:{remove:function(){}},
  appendChild:function(child){this.children.push(child);return child},
  addEventListener:function(type,handler,options){listeners[type]={handler:handler,options:options}},
  contains:function(child){return child&&child.inside!==false},
  setPointerCapture:function(){},hasPointerCapture:function(){return false},releasePointerCapture:function(){},
  closest:function(selector){return selector==='.key'&&this.isKey?this:null},
  listeners:listeners
 };
}

function fixture(){
 const keyboard=fakeElement('section');
 const sharpRow=fakeElement('div');
 const naturalRow=fakeElement('div');
 const elements={keyboard:keyboard,'sharp-row':sharpRow,'natural-row':naturalRow};
 const documentListeners={};
 const document={
  createElement:function(tag){return fakeElement(tag)},
  elementFromPoint:function(){return null},
  addEventListener:function(type,handler){documentListeners[type]=handler}
 };
 const windowListeners={};
 const calls=[];
 const pointerLastKey=new Map();
 const pressedKeys=new Map();
 const controller=load({
  document:document,
  addEventListener:function(type,handler){windowListeners[type]=(windowListeners[type]||[]).concat(handler)}
 }).createController({
  document:document,getElement:function(id){return elements[id]||null},
  naturalNotes:[0,2],sharpNotes:[1,null],naturalHints:['a','s'],sharpHints:['q',null],
  keyMap:new Map([['a',0]]),pointerLastKey:pointerLastKey,pressedKeys:pressedKeys,
  maxSimultaneousTouches:4,normalizedNoteName:function(semi){return semi===0?'C':'D'},
  velocityFromEvent:function(){return .75},
  noteDown:function(semi,id,velocity,source){calls.push(['down',semi,id,velocity,source]);return true},
  noteUp:function(semi,id,source){calls.push(['up',semi,id,source])},
  releaseAll:function(){calls.push(['releaseAll'])},setStatus:function(message){calls.push(['status',message])},
  getGlissEnabled:function(){return true}
 });
 return{controller:controller,keyboard:keyboard,sharpRow:sharpRow,naturalRow:naturalRow,
  documentListeners:documentListeners,windowListeners:windowListeners,calls:calls,
  pointerLastKey:pointerLastKey,pressedKeys:pressedKeys};
}

test('módulo expõe somente a fábrica do controlador do teclado',function(){
 const api=load();
 assert.deepEqual(Object.keys(api),['createController']);
 assert.equal(Object.isFrozen(api),true);
});

test('render preserva linhas, notas, classes, oitavas e dicas visuais',function(){
 const state=fixture();
 state.controller.render();
 assert.equal(state.sharpRow.children.length,2);
 assert.equal(state.naturalRow.children.length,2);
 assert.equal(state.sharpRow.children[0].children[0].className,'key sharp');
 assert.equal(state.sharpRow.children[0].children[0].dataset.note,1);
 assert.match(state.sharpRow.children[0].children[0].innerHTML,/Q/);
 assert.equal(state.sharpRow.children[1].children.length,0);
 assert.equal(state.naturalRow.children[0].children[0].className,'key natural');
 assert.match(state.naturalRow.children[0].children[0].innerHTML,/C4/);
});

test('superfície preserva ponteiro, glissando, soltura e opções passivas',function(){
 const state=fixture();
 state.controller.bindSurface();
 const key=fakeElement('div');key.isKey=true;key.dataset.note='2';
 state.keyboard.listeners.pointerdown.handler({pointerType:'mouse',target:key,pointerId:7,clientX:1,clientY:1,preventDefault:function(){}});
 assert.deepEqual(state.calls[0],['down',2,7,.75,undefined]);
 assert.equal(state.pointerLastKey.get(7),2);
 state.keyboard.listeners.pointerup.handler({pointerType:'mouse',pointerId:7});
 assert.deepEqual(state.calls[1],['up',2,7,undefined]);
 assert.equal(state.pointerLastKey.has(7),false);
 assert.equal(state.keyboard.listeners.pointerdown.options.passive,false);
 assert.equal(state.keyboard.listeners.touchstart.options.passive,false);
 assert.deepEqual(Object.keys(state.keyboard.listeners).sort(),[
  'contextmenu','lostpointercapture','pointercancel','pointerdown','pointermove','pointerup',
  'touchcancel','touchend','touchmove','touchstart'
 ].sort());
});

test('teclado físico preserva filtro, mapeamento e liberação no blur',function(){
 const state=fixture();
 state.controller.bindPhysicalKeyboard();
 state.documentListeners.keydown({target:{tagName:'DIV'},key:'A'});
 state.documentListeners.keyup({target:{tagName:'DIV'},key:'A'});
 state.documentListeners.keydown({target:{tagName:'INPUT'},key:'A'});
 state.windowListeners.blur[0]();
 assert.deepEqual(state.calls,[
  ['down',0,'a',1,'keyboard'],['up',0,'a','keyboard'],['releaseAll']
 ]);
});

test('HTML carrega o teclado antes do núcleo e remove os listeners diretos anteriores',function(){
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const moduleTag='<script src="./js/ui/keyboard.js"></script>';
 assert.ok(html.includes(moduleTag));
 assert.ok(html.indexOf(moduleTag)<html.indexOf('GeraKeyboard.createController({'));
 assert.equal(html.includes("const keyboardEl=$('keyboard');"),false);
 assert.equal(html.includes("document.addEventListener('keydown',e=>"),false);
 assert.equal(html.includes("keyboardEl.addEventListener('touchstart'"),false);
});

test('SERVICE WORKER mantém o teclado no pré-cache 3.15.53',function(){
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.53';"));
 assert.equal((sw.match(/\.\/js\/ui\/keyboard\.js/g)||[]).length,1);
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')).version,'3.15.53');
});

test('reversão exclusiva da 8C recompõe a versão 3.15.22 byte a byte',function(){
 const previous=path.resolve(root,'..','GERA-PWA-v3.15.22-etapa-8B-painel-compacto');
 const stage8c=path.resolve(root,'..','GERA-PWA-v3.15.23-etapa-8C-teclado');
 const currentIndex=fs.readFileSync(path.join(stage8c,'index.html'),'utf8');
 const previousIndex=fs.readFileSync(path.join(previous,'index.html'),'utf8');
 const oldStart=previousIndex.indexOf('function renderKeyboard(){');
 const oldEnd=previousIndex.indexOf('function renderChords(){',oldStart);
 const newStart=currentIndex.indexOf('const keyboardUI=GeraKeyboard.createController({');
 const newEnd=currentIndex.indexOf('function renderChords(){',newStart);
 const oldPhysical="document.addEventListener('keydown',e=>{if(['INPUT','SELECT','BUTTON'].includes(e.target.tagName))return;const k=e.key.toLowerCase();if(pressedKeys.has(k)||!KEYMAP.has(k))return;noteDown(KEYMAP.get(k),k,1,'keyboard')});document.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(KEYMAP.has(k))noteUp(KEYMAP.get(k),k,'keyboard')});window.addEventListener('blur',()=>releaseAll());document.addEventListener('contextmenu',e=>{if(e.target.closest('.key,.chord'))e.preventDefault()});";
 const newPhysical="keyboardUI.bindPhysicalKeyboard();document.addEventListener('contextmenu',e=>{if(e.target.closest('.key,.chord'))e.preventDefault()});";
 const reconstructedIndex=(
  currentIndex.slice(0,newStart)+previousIndex.slice(oldStart,oldEnd)+currentIndex.slice(newEnd)
 ).replace(newPhysical,oldPhysical)
  .replaceAll('3.15.23','3.15.22')
  .replace('<script src="./js/ui/keyboard.js"></script>\n','');
 const reconstructedSw=fs.readFileSync(path.join(stage8c,'sw.js'),'utf8')
  .replace("'v3.15.23'","'v3.15.22'")
  .replace('    "./js/ui/keyboard.js",\n','');
 const reconstructedManifest=fs.readFileSync(path.join(stage8c,'manifest.json'),'utf8')
  .replace('"3.15.23"','"3.15.22"');
 assert.equal(reconstructedIndex,previousIndex);
 assert.equal(reconstructedSw,fs.readFileSync(path.join(previous,'sw.js'),'utf8'));
 assert.equal(reconstructedManifest,fs.readFileSync(path.join(previous,'manifest.json'),'utf8'));
});
