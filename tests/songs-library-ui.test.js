'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'js/ui/songs-library.js'),'utf8');

function fakeElement(tag,id){
 const classes=new Set();
 const listeners={};
 const node={
  tagName:String(tag||'div').toUpperCase(),id:id||'',type:'',className:'',textContent:'',title:'',value:'',checked:false,disabled:false,open:false,
  children:[],attributes:{},listeners:listeners,focusCalls:0,selectCalls:0,clickCalls:0,
  classList:{toggle:function(name,force){const active=force===undefined?!classes.has(name):Boolean(force);if(active)classes.add(name);else classes.delete(name);return active},contains:function(name){return classes.has(name)}},
  appendChild:function(child){this.children.push(child);return child},
  append:function(){for(let i=0;i<arguments.length;i++)this.children.push(arguments[i])},
  setAttribute:function(name,value){this.attributes[name]=String(value)},
  addEventListener:function(type,handler){listeners[type]=handler},
  showModal:function(){this.open=true},close:function(){this.open=false},focus:function(){this.focusCalls++},select:function(){this.selectCalls++},click:function(){this.clickCalls++;if(this.onclick)this.onclick()},
  querySelector:function(selector){
   if(!this._queries)this._queries={};
   if(!this._queries[selector])this._queries[selector]=fakeElement(selector.replace(/[^a-z]/g,''));
   return this._queries[selector];
  }
 };
 Object.defineProperty(node,'innerHTML',{get:function(){return this._html||''},set:function(value){this._html=String(value);this.children=[]}});
 return node;
}

function harness(){
 const ids=['song-current-name','song-lists-list','song-list-editor-title','song-list-available','song-list-order','songs-list',
  'redesign-song-library','redesign-song-search','song-name-input','song-bpm-input','songs-dialog','song-list-editor-name',
  'song-list-editor-dialog','song-bpm-dialog-name','song-bpm-dialog-input','song-bpm-dialog','song-export','song-import',
  'song-import-file','songs-open','songs-close','song-save','song-new','song-list-create','song-list-new-name','song-list-editor-close',
  'song-list-editor-cancel','song-list-editor-save','song-list-delete','redesign-manage-songs','redesign-new-song','redesign-import-song',
  'redesign-export-song','song-bpm-dialog-cancel','song-bpm-dialog-save'];
 const elements={};ids.forEach(function(id){elements[id]=fakeElement('div',id)});
 const document={createElement:function(tag){return fakeElement(tag)},getElementById:function(id){return elements[id]}};
 const calls=[];
 const action=function(name){return function(){calls.push([name].concat(Array.prototype.slice.call(arguments)))}};
 const options={
  document:document,getElement:function(id){return elements[id]},openSongList:action('open-list'),useSongList:action('use-list'),
  toggleDraftSong:action('toggle-draft'),moveDraftSong:action('move-draft'),removeDraftSong:action('remove-draft'),
  loadSong:action('load'),manageSongLists:action('manage-lists'),deleteSong:action('delete'),renderSongs:action('render-songs'),
  exportSong:action('export'),chooseImport:action('choose-import'),importFile:action('import-file'),openSongs:action('open-songs'),
  saveSong:action('save'),newSong:action('new'),createSongList:action('create-list'),closeSongList:action('close-list'),
  saveSongList:action('save-list'),deleteSongList:action('delete-list'),renderRedesignSongs:action('render-redesign'),
  closeSongBpm:action('close-bpm'),saveSongBpm:action('save-bpm'),loadRedesignSong:action('load-redesign'),
  openSongBpm:action('open-bpm'),deleteRedesignSong:action('delete-redesign')
 };
 const window={document:document};
 vm.runInNewContext(source,{window:window,globalThis:window,setTimeout:function(fn){fn()}},{filename:'songs-library.js'});
 return{api:window.GeraSongsLibraryUI,controller:window.GeraSongsLibraryUI.createController(options),elements:elements,calls:calls};
}

test('módulo expõe somente a fábrica do controlador de músicas e biblioteca',function(){
 const h=harness();
 assert.deepEqual(Object.keys(h.api),['createController']);
 assert.equal(Object.isFrozen(h.api),true);
});

test('nome da música preserva texto e título do estado atual e vazio',function(){
 const h=harness();
 h.controller.updateSongNameDisplay('Canção');
 assert.equal(h.elements['song-current-name'].textContent,'🎵 Canção');
 assert.equal(h.elements['song-current-name'].title,'Canção');
 h.controller.updateSongNameDisplay(null);
 assert.equal(h.elements['song-current-name'].textContent,'Nenhuma música selecionada');
});

test('biblioteca de listas preserva ordem, contagem e comandos Abrir e Usar',function(){
 const h=harness();
 h.controller.renderSongListsLibrary({b:{name:'Banda',songNames:['Dois']},a:{name:'Alfa',songNames:['Um','Dois']}},'Dois');
 const rows=h.elements['song-lists-list'].children;
 assert.equal(rows.length,2);
 assert.equal(rows[0].children[0].querySelector('strong').textContent,'Alfa');
 assert.equal(rows[0].children[0].querySelector('small').textContent,'2 músicas');
 rows[0].children[0].onclick();rows[0].children[1].onclick();
 assert.deepEqual(h.calls,[['open-list','a'],['use-list','a',1]]);
});

test('editor de lista preserva seleção, ordenação e remoção visuais',function(){
 const h=harness();
 const draft={name:'Culto',songNames:['Hino','Salmo']};
 h.controller.renderSongListEditor(draft,['Salmo','Hino','Aleluia']);
 const checks=h.elements['song-list-available'].children;
 checks[0].children[0].checked=true;checks[0].children[0].onchange();
 const order=h.elements['song-list-order'].children;
 order[1].children[2].onclick();order[0].children[4].onclick();
 assert.deepEqual(h.calls,[['toggle-draft','Aleluia',true],['move-draft',1,-1],['remove-draft',0]]);
});

test('lista clássica preserva destaque, associações e ações por música',function(){
 const h=harness();
 h.controller.renderSongsList({songs:{Zeta:{},Alfa:{}},songLists:{},currentSongName:'Alfa',memberships:function(name){return name==='Alfa'?['Celebração']:[]}});
 const rows=h.elements['songs-list'].children;
 assert.equal(rows.length,2);
 assert.equal(rows[0].className,'song-item song-active');
 assert.equal(rows[0].children[0].children[1].textContent,'Celebração');
 rows[0].children[0].children[0].onclick();rows[0].children[1].onclick();rows[0].children[2].onclick();
 assert.deepEqual(h.calls,[['load','Alfa'],['manage-lists','Alfa'],['delete','Alfa']]);
});

test('biblioteca redesenhada preserva busca, metadados e três ações',function(){
 const h=harness();
 h.elements['redesign-song-search'].value='sal';
 h.controller.renderRedesignSongs({songs:{Salmo:{bpm:92,ordemSecoes:['chorus']},Hino:{bpm:100}},currentSongName:'Salmo',sequenceOrder:['verse'],sectionLabels:{verse:'A',chorus:'C'}});
 const cards=h.elements['redesign-song-library'].children;
 assert.equal(cards.length,1);
 assert.equal(cards[0].className,'redesign-song-card active');
 assert.equal(cards[0].children[1].textContent,'92 BPM · início: C');
 cards[0].children[2].children[0].onclick();cards[0].children[2].children[1].onclick();cards[0].children[2].children[2].onclick();
 assert.deepEqual(h.calls,[['load-redesign','Salmo'],['open-bpm','Salmo'],['delete-redesign','Salmo']]);
});

test('liga controles clássicos e redesenhados sem decidir operações',function(){
 const h=harness();
 h.controller.bindMainControls();h.controller.bindRedesignControls();
 h.elements['song-export'].onclick();h.elements['songs-open'].onclick();
 h.elements['song-list-new-name'].value='Domingo';h.elements['song-list-create'].onclick();
 h.elements['redesign-song-search'].oninput();
 h.elements['song-bpm-dialog-input'].listeners.keydown({key:'Enter',preventDefault:function(){}});
 assert.deepEqual(h.calls,[['export'],['open-songs'],['create-list','Domingo'],['render-redesign'],['save-bpm']]);
});

test('arquivo extraído não contém persistência, áudio, transporte ou estado musical',function(){
 assert.doesNotMatch(source,/localStorage|GeraStorage|AudioContext|sequencePlaying|sequenceSections|startDrums|playChordSequence|requestAnimationFrame|setInterval/);
});

test('HTML e SERVICE WORKER carregam uma vez o único módulo novo da 8G',function(){
 const previous=path.resolve(root,'..','GERA-PWA-v3.15.26-etapa-8F-sequenciador');
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.equal((html.match(/\.\/js\/ui\/songs-library\.js/g)||[]).length,1);
 assert.equal((sw.match(/\.\/js\/ui\/songs-library\.js/g)||[]).length,1);
 assert.ok(html.indexOf('<script src="./js/ui/songs-library.js"></script>')<html.indexOf('<script src="./js/audio/core.js"></script>'));
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.41';"));
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')).version,'3.15.41');
 const added=fs.readdirSync(path.join(root,'js','ui')).filter(function(file){return file!=='settings-modals.js'&&!fs.existsSync(path.join(previous,'js','ui',file))});
 assert.deepEqual(added,['songs-library.js']);
});
