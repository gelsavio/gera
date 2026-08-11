'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'js/ui/compact-panel.js'),'utf8');

function load(){
 const window={};
 vm.runInNewContext(source,{window:window},{filename:'compact-panel.js'});
 return window.GeraCompactPanel;
}

test('módulo expõe somente a fábrica do controlador do painel compacto',function(){
 const api=load();
 assert.deepEqual(Object.keys(api),['createController']);
 assert.equal(Object.isFrozen(api),true);
});

test('bind preserva todos os comandos e valores do painel compacto',function(){
 const ids=[
  'compact-mode-toggle','compact-mode-close','compact-songs-open','compact-play',
  'compact-sequence-only','compact-loop','compact-drum-only','compact-drum-fill',
  'compact-drum-ending','compact-capo-down','compact-capo-up','compact-octave-down',
  'compact-octave-up','compact-circle-root','compact-list-select','compact-prev-song',
  'compact-next-song','compact-transition-mode','compact-next-start-mode',
  'compact-list-end-mode','compact-carousel-prev','compact-carousel-next'
 ];
 const elements={};
 ids.forEach(function(id){elements[id]={value:id+'-value'}});
 const calls=[];
 function action(name){return function(value){calls.push([name,value])}}
 const controller=load().createController({
  getElement:function(id){return elements[id]||null},
  toggleMode:action('toggleMode'),closeMode:action('closeMode'),openSongs:action('openSongs'),
  playStandard:action('playStandard'),playSequenceOnly:action('playSequenceOnly'),
  toggleLoop:action('toggleLoop'),toggleDrums:action('toggleDrums'),
  requestDrumAction:action('requestDrumAction'),adjustCapo:action('adjustCapo'),
  adjustOctave:action('adjustOctave'),changeCircleRoot:action('changeCircleRoot'),
  changeList:action('changeList'),goRelative:action('goRelative'),
  changeTransitionMode:action('changeTransitionMode'),
  changeNextStartMode:action('changeNextStartMode'),
  changeListEndMode:action('changeListEndMode'),scrollCarousel:action('scrollCarousel')
 });
 controller.bind();

 ids.slice(0,13).forEach(function(id){elements[id].onclick()});
 elements['compact-circle-root'].onchange();
 elements['compact-list-select'].onchange();
 elements['compact-prev-song'].onclick();
 elements['compact-next-song'].onclick();
 elements['compact-transition-mode'].onchange();
 elements['compact-next-start-mode'].onchange();
 elements['compact-list-end-mode'].onchange();
 elements['compact-carousel-prev'].onclick();
 elements['compact-carousel-next'].onclick();

 assert.deepEqual(calls,[
  ['toggleMode',undefined],['closeMode',undefined],['openSongs',undefined],
  ['playStandard',undefined],['playSequenceOnly',undefined],['toggleLoop',undefined],
  ['toggleDrums',undefined],['requestDrumAction','fill'],['requestDrumAction','ending'],
  ['adjustCapo',-1],['adjustCapo',1],['adjustOctave',-1],['adjustOctave',1],
  ['changeCircleRoot','compact-circle-root-value'],['changeList','compact-list-select-value'],
  ['goRelative',-1],['goRelative',1],
  ['changeTransitionMode','compact-transition-mode-value'],
  ['changeNextStartMode','compact-next-start-mode-value'],
  ['changeListEndMode','compact-list-end-mode-value'],
  ['scrollCarousel',-1],['scrollCarousel',1]
 ]);
});

test('bind tolera controles ausentes como o código anterior',function(){
 const controller=load().createController({
  getElement:function(){return null}
 });
 assert.doesNotThrow(function(){controller.bind()});
});

test('HTML carrega o painel antes do núcleo e remove a ligação direta anterior',function(){
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const moduleTag='<script src="./js/ui/compact-panel.js"></script>';
 assert.ok(html.includes(moduleTag));
 assert.ok(html.indexOf(moduleTag)<html.indexOf('GeraCompactPanel.createController({'));
 assert.equal(html.includes("const compactModeToggle=$('compact-mode-toggle');"),false);
 assert.equal(html.includes('if(compactModeToggle)compactModeToggle.onclick='),false);
 assert.equal(html.includes('if(compactListSelect)compactListSelect.onchange='),false);
 assert.equal(html.includes('if(compactCarouselNext)compactCarouselNext.onclick='),false);
});

test('SERVICE WORKER mantém o painel compacto no pré-cache 3.15.33',function(){
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.33';"));
 assert.equal((sw.match(/\.\/js\/ui\/compact-panel\.js/g)||[]).length,1);
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')).version,'3.15.33');
});

test('reversão exclusiva da 8B recompõe a versão 3.15.21 byte a byte',function(){
 const previous=path.resolve(root,'..','GERA-PWA-v3.15.21-etapa-8A-cabecalho');
 const stage8B=path.resolve(root,'..','GERA-PWA-v3.15.22-etapa-8B-painel-compacto');
 const currentIndex=fs.readFileSync(path.join(stage8B,'index.html'),'utf8');
 const previousIndex=fs.readFileSync(path.join(previous,'index.html'),'utf8');
 const oldStart=previousIndex.indexOf("const compactModeToggle=$('compact-mode-toggle');");
 const oldEnd=previousIndex.indexOf('syncGlobalMuteUI();',oldStart);
 const newStart=currentIndex.indexOf('GeraCompactPanel.createController({');
 const newEnd=currentIndex.indexOf('syncGlobalMuteUI();',newStart);
 const reconstructedIndex=(
  currentIndex.slice(0,newStart)+previousIndex.slice(oldStart,oldEnd)+currentIndex.slice(newEnd)
 ).replaceAll('3.15.22','3.15.21').replace('<script src="./js/ui/compact-panel.js"></script>\n','');
 const reconstructedSw=fs.readFileSync(path.join(stage8B,'sw.js'),'utf8')
  .replace("'v3.15.22'","'v3.15.21'")
  .replace('    "./js/ui/compact-panel.js",\n','');
 const reconstructedManifest=fs.readFileSync(path.join(stage8B,'manifest.json'),'utf8')
  .replace('"3.15.22"','"3.15.21"');
 assert.equal(reconstructedIndex,previousIndex);
 assert.equal(reconstructedSw,fs.readFileSync(path.join(previous,'sw.js'),'utf8'));
 assert.equal(reconstructedManifest,fs.readFileSync(path.join(previous,'manifest.json'),'utf8'));
});
