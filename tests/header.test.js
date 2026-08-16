'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'js/ui/header.js'),'utf8');

function load(){
 const window={setTimeout:function(){}};
 vm.runInNewContext(source,{window:window},{filename:'header.js'});
 return window.GeraHeader;
}

test('módulo expõe somente a fábrica do controlador do cabeçalho',function(){
 const api=load();
 assert.deepEqual(Object.keys(api),['createController']);
 assert.equal(Object.isFrozen(api),true);
});

test('bind preserva os cinco comandos existentes do cabeçalho',function(){
 const clicks=[];
 const scheduled=[];
 const elements={};
 ['redesign-theme','redesign-manual','redesign-compact','redesign-fullscreen','redesign-song-pill','theme-cycle','manual-btn','compact-mode-toggle','fullscreen'].forEach(function(id){
  elements[id]={click:function(){clicks.push(id)}};
 });
 let songs=0;
 let readouts=0;
 const controller=load().createController({
  getElement:function(id){return elements[id]||null},
  activateSongs:function(){songs++},
  updateReadouts:function(){readouts++},
  schedule:function(callback,delay){scheduled.push({callback:callback,delay:delay})}
 });
 controller.bind();

 elements['redesign-theme'].onclick();
 elements['redesign-manual'].onclick();
 elements['redesign-compact'].onclick();
 elements['redesign-fullscreen'].onclick();
 elements['redesign-song-pill'].onclick();

 assert.deepEqual(clicks,['theme-cycle','manual-btn','compact-mode-toggle','fullscreen']);
 assert.equal(songs,1);
 assert.equal(scheduled.length,1);
 assert.equal(scheduled[0].delay,20);
 assert.equal(readouts,0);
 scheduled[0].callback();
 assert.equal(readouts,1);
});

test('bind tolera controles legados ausentes como o código anterior',function(){
 const visible={};
 ['redesign-theme','redesign-manual','redesign-compact','redesign-fullscreen','redesign-song-pill'].forEach(function(id){visible[id]={}});
 const controller=load().createController({
  getElement:function(id){return visible[id]||null},
  activateSongs:function(){},
  schedule:function(){}
 });
 controller.bind();
 assert.doesNotThrow(function(){visible['redesign-theme'].onclick()});
 assert.doesNotThrow(function(){visible['redesign-manual'].onclick()});
 assert.doesNotThrow(function(){visible['redesign-compact'].onclick()});
 assert.doesNotThrow(function(){visible['redesign-fullscreen'].onclick()});
});

test('HTML carrega o cabeçalho antes do bloco de montagem e remove listeners duplicados do núcleo',function(){
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const moduleTag='<script src="./js/ui/header.js"></script>';
 const init='GeraHeader.createController({';
 assert.ok(html.includes(moduleTag));
 assert.ok(html.indexOf(moduleTag)<html.indexOf(init));
 assert.equal(html.includes("byId('redesign-theme').onclick="),false);
 assert.equal(html.includes("byId('redesign-manual').onclick="),false);
 assert.equal(html.includes("byId('redesign-compact').onclick="),false);
 assert.equal(html.includes("byId('redesign-fullscreen').onclick="),false);
 assert.equal(html.includes("byId('redesign-song-pill').onclick="),false);
});

test('SERVICE WORKER mantém o módulo do cabeçalho no pré-cache 3.15.42',function(){
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.42';"));
 assert.equal((sw.match(/\.\/js\/ui\/header\.js/g)||[]).length,1);
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')).version,'3.15.42');
});

test('reversão exclusiva da 8A recompõe a versão 3.15.20 byte a byte',function(){
 const previous=path.resolve(root,'..','GERA-PWA-v3.15.20-etapa-7F-backup-restauracao');
 const stage8A=path.resolve(root,'..','GERA-PWA-v3.15.21-etapa-8A-cabecalho');
 const currentIndex=fs.readFileSync(path.join(stage8A,'index.html'),'utf8');
 const currentInit=" assemble();bindSequenceRecordDialog();bind();GeraHeader.createController({\n  getElement:byId,\n  activateSongs:function(){activateTab('musicas')},\n  updateReadouts:updateReadouts\n }).bind();restoreRedesignRailState();buildDial();setupMovableMute();";
 const legacyListeners="  byId('redesign-theme').onclick=function(){byId('theme-cycle')?.click();setTimeout(updateReadouts,20)};\n  byId('redesign-manual').onclick=function(){byId('manual-btn')?.click()};\n  byId('redesign-compact').onclick=function(){byId('compact-mode-toggle')?.click()};\n  byId('redesign-fullscreen').onclick=function(){byId('fullscreen')?.click()};\n  byId('redesign-song-pill').onclick=function(){activateTab('musicas')};\n";
 const reconstructedIndex=currentIndex
  .replaceAll('3.15.21','3.15.20')
  .replace('<script src="./js/ui/header.js"></script>\n','')
  .replace("  byId('redesign-open-organizer').onclick=function(){byId('sequence-organize-open')?.click()};\n","  byId('redesign-open-organizer').onclick=function(){byId('sequence-organize-open')?.click()};\n"+legacyListeners)
  .replace(currentInit,' assemble();bindSequenceRecordDialog();bind();restoreRedesignRailState();buildDial();setupMovableMute();');
 const reconstructedSw=fs.readFileSync(path.join(stage8A,'sw.js'),'utf8')
  .replace("'v3.15.21'","'v3.15.20'")
  .replace('    "./js/ui/header.js",\n','');
 const reconstructedManifest=fs.readFileSync(path.join(stage8A,'manifest.json'),'utf8').replace('"3.15.21"','"3.15.20"');
 assert.equal(reconstructedIndex,fs.readFileSync(path.join(previous,'index.html'),'utf8'));
 assert.equal(reconstructedSw,fs.readFileSync(path.join(previous,'sw.js'),'utf8'));
 assert.equal(reconstructedManifest,fs.readFileSync(path.join(previous,'manifest.json'),'utf8'));
});
