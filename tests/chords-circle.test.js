'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'js/ui/chords-circle.js'),'utf8');

function load(windowExtras){
 const window=Object.assign({document:null},windowExtras||{});
 vm.runInNewContext(source,{window:window,setTimeout:setTimeout,globalThis:window},{filename:'chords-circle.js'});
 return window.GeraChordsCircle;
}

function fakeElement(tag,id){
 const listeners={};
 const classes=new Set();
 const element={
  tagName:String(tag||'DIV').toUpperCase(),id:id||'',dataset:{},children:[],parentElement:null,
  innerHTML:'',textContent:'',title:'',type:'',open:false,listeners:listeners,
  style:{values:{},setProperty:function(name,value){this.values[name]=value}},
  appendChild:function(child){child.parentElement=this;this.children.push(child);return child},
  addEventListener:function(type,handler){listeners[type]=handler},
  setAttribute:function(name,value){this[name]=String(value)},
  removeAttribute:function(name){
   if(name.indexOf('data-')===0){
    const key=name.slice(5).replace(/-([a-z])/g,function(match,letter){return letter.toUpperCase()});
    delete this.dataset[key];
   }else delete this[name];
  },
  closest:function(selector){return selector==='#minor-chords'&&this.parentElement&&this.parentElement.id==='minor-chords'?this.parentElement:null},
  showModal:function(){this.open=true},close:function(){this.open=false}
 };
 Object.defineProperty(element,'className',{
  get:function(){return Array.from(classes).join(' ')},
  set:function(value){classes.clear();String(value||'').split(/\s+/).filter(Boolean).forEach(function(name){classes.add(name)})}
 });
 element.classList={
  add:function(){Array.from(arguments).forEach(function(name){classes.add(name)})},
  remove:function(){Array.from(arguments).forEach(function(name){classes.delete(name)})},
  toggle:function(name,force){
   const active=force===undefined?!classes.has(name):Boolean(force);
   if(active)classes.add(name);else classes.delete(name);
   return active;
  },
  contains:function(name){return classes.has(name)}
 };
 return element;
}

function fixture(){
 const ids=['major-chords','minor-chords','normal-chord-group','circle-main-wrap','circle-main-chords',
  'secondary-dominants-wrap','secondary-dominants','circle-toggle','circle-dialog','circle-note-grid','circle-close','redesign-dial'];
 const elements={};
 ids.forEach(function(id){elements[id]=fakeElement(id.indexOf('dialog')>=0?'dialog':'div',id)});
 const document={
  createElement:function(tag){return fakeElement(tag)},
  querySelectorAll:function(selector){
   if(selector==='#major-chords .chord, #minor-chords .chord')return elements['major-chords'].children.concat(elements['minor-chords'].children);
   return [];
  }
 };
 let enabled=false;
 let rootValue=null;
 const calls=[];
 const chordNames=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
 const circleDegrees=[
  {step:0,type:'major'},{step:2,type:'minor'},{step:4,type:'minor'},
  {step:5,type:'major'},{step:7,type:'major'},{step:9,type:'minor'},{step:11,type:'diminished'}
 ];
 const secondaryDominants=[{targetStep:2,targetType:'minor',degree:'V/ii'},{targetStep:7,targetType:'major',degree:'V/V'}];
 const controller=load({document:document}).createController({
  document:document,getElement:function(id){return elements[id]},chordNames:chordNames,
  circleDegrees:circleDegrees,secondaryDominants:secondaryDominants,
  chordLabel:function(root,type){return chordNames[root]+(type==='minor'?'m':type==='dominant7'?'7':type==='diminished'?'°':'')},
  handleChordButton:function(root,type,button,pointerId){calls.push(['chord',root,type,button,pointerId])},
  setStatus:function(message){calls.push(['status',message])},
  getCircleEnabled:function(){return enabled},getCircleRoot:function(){return rootValue},
  setCircleState:function(nextEnabled,nextRoot){enabled=nextEnabled;rootValue=nextRoot}
 });
 return{
  controller:controller,elements:elements,calls:calls,
  state:function(){return{enabled:enabled,root:rootValue}},
  setState:function(nextEnabled,nextRoot){enabled=nextEnabled;rootValue=nextRoot}
 };
}

test('módulo expõe somente a fábrica do controlador de acordes e círculo',function(){
 const api=load();
 assert.deepEqual(Object.keys(api),['createController']);
 assert.equal(Object.isFrozen(api),true);
});

test('render preserva as doze raízes maiores e menores e encaminha o ponteiro',function(){
 const state=fixture();
 state.controller.renderChords();
 assert.equal(state.elements['major-chords'].children.length,12);
 assert.equal(state.elements['minor-chords'].children.length,12);
 assert.equal(state.elements['major-chords'].children[1].className,'chord sharp-chord');
 assert.equal(state.elements['minor-chords'].children[0].textContent,'Cm');
 const button=state.elements['minor-chords'].children[9];
 button.listeners.pointerdown({preventDefault:function(){},pointerId:4});
 assert.deepEqual(state.calls.at(-1).slice(0,3),['chord',9,'minor']);
});

test('filtro preserva sete graus, cores funcionais e dominantes secundários',function(){
 const state=fixture();
 state.controller.renderChords();
 state.setState(true,0);
 state.controller.applyCircleFilter();
 const degrees=state.elements['circle-main-chords'].children;
 assert.equal(degrees.length,7);
 assert.equal(degrees[0].textContent,'C');
 assert.equal(degrees[1].textContent,'Dm');
 assert.equal(degrees[6].textContent,'B°');
 assert.equal(degrees[0].classList.contains('function-tonic'),true);
 assert.equal(degrees[3].classList.contains('function-subdominant'),true);
 assert.equal(degrees[4].classList.contains('function-dominant'),true);
 assert.equal(degrees[6].classList.contains('function-leading'),true);
 assert.equal(state.elements['secondary-dominants'].children.length,2);
 assert.match(state.elements['secondary-dominants'].children[0].innerHTML,/V\/ii/);
});

test('diálogo legado preserva seleção, botão CH e desligamento do filtro',function(){
 const state=fixture();
 state.controller.renderChords();
 state.controller.bindLegacyControls();
 state.elements['circle-toggle'].onclick();
 assert.equal(state.elements['circle-dialog'].open,true);
 assert.equal(state.elements['circle-note-grid'].children.length,12);
 state.elements['circle-note-grid'].children[7].onclick();
 assert.deepEqual(state.state(),{enabled:true,root:7});
 assert.equal(state.elements['circle-toggle'].textContent,'CH G');
 assert.equal(state.elements['circle-dialog'].open,false);
 state.elements['circle-toggle'].onclick();
 assert.deepEqual(state.state(),{enabled:false,root:null});
 assert.equal(state.elements['circle-toggle'].textContent,'CH');
 assert.deepEqual(state.calls.at(-1),['status','Filtro do círculo harmônico desligado']);
});

test('seletor circular preserva Todos, doze tonalidades e retorno visual',function(){
 const state=fixture();
 state.controller.renderChords();
 let changes=0;
 state.controller.renderDial(function(){changes++});
 const dial=state.elements['redesign-dial'];
 assert.equal(dial.children.length,13);
 assert.equal(dial.children[0].textContent,'Todos');
 assert.equal(dial.children[1].style.values['--a'],'0deg');
 dial.children[6].listeners.click({preventDefault:function(){}});
 assert.deepEqual(state.state(),{enabled:true,root:5});
 assert.equal(changes,1);
 assert.equal(state.elements['circle-toggle'].textContent,'CH F');
});

test('HTML carrega o módulo antes do núcleo e remove as rotinas visuais diretas',function(){
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const moduleTag='<script src="./js/ui/chords-circle.js"></script>';
 assert.ok(html.includes(moduleTag));
 assert.ok(html.indexOf(moduleTag)<html.indexOf('<script src="./js/audio/core.js"></script>'));
 assert.ok(html.includes('const chordsCircleUI=GeraChordsCircle.createController({'));
 assert.equal(html.includes('function renderCircleMainChords(){'),false);
 assert.equal(html.includes('function renderSecondaryDominants(){'),false);
 assert.equal(html.includes('function selectRedesignCircle(root){'),false);
});

test('SERVICE WORKER inclui o módulo uma vez e usa a versão 3.15.42',function(){
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.42';"));
 assert.equal((sw.match(/\.\/js\/ui\/chords-circle\.js/g)||[]).length,1);
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')).version,'3.15.42');
});

test('reversão exclusiva da 8D recompõe a versão 3.15.23 byte a byte',function(){
 const stage8d=path.resolve(root,'..','GERA-PWA-v3.15.24-etapa-8D-acordes-circulo-harmonico');
 const previous=path.resolve(root,'..','GERA-PWA-v3.15.23-etapa-8C-teclado');
 const previousIndex=fs.readFileSync(path.join(previous,'index.html'),'utf8');
 let reconstructed=fs.readFileSync(path.join(stage8d,'index.html'),'utf8');

 const previousRenderStart=previousIndex.indexOf('function renderChords(){');
 const previousRenderEnd=previousIndex.indexOf('let compactModeActive=false;',previousRenderStart);
 const currentRenderStart=reconstructed.indexOf('const chordsCircleUI=GeraChordsCircle.createController({');
 const currentRenderEnd=reconstructed.indexOf('let compactModeActive=false;',currentRenderStart);
 reconstructed=reconstructed.slice(0,currentRenderStart)+previousIndex.slice(previousRenderStart,previousRenderEnd)+reconstructed.slice(currentRenderEnd);

 const previousFilterStart=previousIndex.indexOf('function applyCircleFilter(){');
 const previousFilterEnd=previousIndex.indexOf('function toggle(id,state',previousFilterStart);
 const currentFilterPoint=reconstructed.indexOf('function toggle(id,state');
 reconstructed=reconstructed.slice(0,currentFilterPoint)+previousIndex.slice(previousFilterStart,previousFilterEnd)+reconstructed.slice(currentFilterPoint);

 const previousLegacy=previousIndex.match(/\$\('circle-toggle'\)\.onclick=.*?\$\('circle-dialog'\)\.close\(\);/)[0];
 reconstructed=reconstructed.replace('chordsCircleUI.bindLegacyControls();',previousLegacy);

 const previousDialStart=previousIndex.indexOf(' function selectRedesignCircle(root){');
 const previousDialEnd=previousIndex.indexOf(' function updateReadouts(){',previousDialStart);
 const currentDialStart=reconstructed.indexOf(' function buildDial(){');
 const currentDialEnd=reconstructed.indexOf(' function updateReadouts(){',currentDialStart);
 reconstructed=reconstructed.slice(0,currentDialStart)+previousIndex.slice(previousDialStart,previousDialEnd)+reconstructed.slice(currentDialEnd);

 reconstructed=reconstructed
  .replaceAll('3.15.24','3.15.23')
  .replace('<script src="./js/ui/chords-circle.js"></script>\n','');

 const reconstructedSw=fs.readFileSync(path.join(stage8d,'sw.js'),'utf8')
  .replace("'v3.15.24'","'v3.15.23'")
  .replace('    "./js/ui/chords-circle.js",\n','');
 const reconstructedManifest=fs.readFileSync(path.join(stage8d,'manifest.json'),'utf8')
  .replace('"3.15.24"','"3.15.23"');

 assert.equal(reconstructed,previousIndex);
 assert.equal(reconstructedSw,fs.readFileSync(path.join(previous,'sw.js'),'utf8'));
 assert.equal(reconstructedManifest,fs.readFileSync(path.join(previous,'manifest.json'),'utf8'));
});
