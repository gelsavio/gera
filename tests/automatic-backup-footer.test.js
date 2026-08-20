'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles','inline-style-01.css'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const source=fs.readFileSync(path.join(root,'js','folder-backup.js'),'utf8');

function data(names){
 const songs={};
 names.forEach(function(name){songs[name]={title:name,sections:[{id:'A'}]}});
 return {
  songsStore:{version:1,songs:songs},
  songListsStore:{version:1,lists:{}},
  playlistSettings:{},
  drumPatternLibrary:{version:1,patterns:{rock:{}}}
 };
}

function createHarness(options){
 options=options||{};
 const files=new Map();
 const writes=[];
 const timers=[];
 const directory={
  name:'Backups GERA',
  queryPermission:async function(){return 'granted'},
  requestPermission:async function(){return 'granted'},
  getFileHandle:async function(name,fileOptions){
   if(!files.has(name)&&!(fileOptions&&fileOptions.create)){
    const error=new Error('Arquivo não encontrado');
    error.name='NotFoundError';
    throw error;
   }
   if(!files.has(name))files.set(name,'');
   return {
    getFile:async function(){return {text:async function(){return files.get(name)}}},
    createWritable:async function(){
     return {
      write:async function(content){files.set(name,String(content));writes.push(name)},
      close:async function(){}
     };
    }
   };
  }
 };
 const document={
  getElementById:function(){return null},
  createElement:function(){return {click:function(){},remove:function(){}}}
 };
 const fakeUrl={createObjectURL:function(){return 'blob:backup'},revokeObjectURL:function(){}};
 const window={
  document:document,
  indexedDB:null,
  showDirectoryPicker:async function(){return directory},
  setTimeout:function(callback,delay){timers.push({callback:callback,delay:delay});return timers.length},
  clearTimeout:function(){},
  confirm:function(){return options.confirmResult!==false},
  location:{reload:function(){}},
  console:console,
  Blob:Blob,
  URL:fakeUrl
 };
 window.window=window;
 window.globalThis=window;
 vm.runInNewContext(source,{window:window,globalThis:window,console:console,Blob:Blob,URL:fakeUrl});
 return {api:window.GeraFolderBackup,directory:directory,files:files,writes:writes,timers:timers};
}

test('módulo calcula a redução crítica e usa os dois arquivos de segurança',function(){
 const harness=createHarness();
 assert.equal(harness.api.constants.mainFile,'gera-backup.json');
 assert.equal(harness.api.constants.previousFile,'gera-backup-anterior.json');
 assert.equal(harness.api.constants.delay,3000);
 assert.equal(harness.api.calculateReduction(4,1),.75);
 assert.equal(harness.api.calculateReduction(5,1),.8);
});

test('redução superior a 75% preserva a cópia anterior antes da principal',async function(){
 const harness=createHarness();
 let confirmationCount=0;
 await harness.api.initialize({
  data:data(['A','B','C','D','E']),
  confirm:async function(){confirmationCount++;return true},
  notify:function(){},
  restore:async function(){}
 });
 assert.equal(await harness.api.chooseFolder(),true);
 harness.writes.length=0;

 harness.api.schedule(data(['A']));
 assert.equal(harness.timers.at(-1).delay,3000);
 assert.equal(await harness.api.runNow(),true);

 assert.equal(confirmationCount,1);
 assert.deepEqual(harness.writes,['gera-backup-anterior.json','gera-backup.json']);
 assert.equal(Object.keys(JSON.parse(harness.files.get('gera-backup-anterior.json')).data.songsStore.songs).length,5);
 assert.equal(Object.keys(JSON.parse(harness.files.get('gera-backup.json')).data.songsStore.songs).length,1);
});

test('acervo vazio nunca substitui o backup em pasta',async function(){
 const harness=createHarness();
 await harness.api.initialize({data:data([]),notify:function(){},restore:async function(){}});
 assert.equal(await harness.api.chooseFolder(),true);
 assert.equal(harness.writes.length,0);
 assert.equal(harness.files.has('gera-backup.json'),false);
});

test('módulo usa seletor de pasta, IndexedDB, escrita segura e fallback manual',function(){
 assert.match(source,/showDirectoryPicker/);
 assert.match(source,/gera_backup_local/);
 assert.match(source,/diretorioBackup/);
 assert.match(source,/createWritable/);
 assert.match(source,/downloadManual/);
 assert.doesNotMatch(source,/localStorage/);
});

test('salvamentos do acervo alimentam o backup em pasta e a interface oferece recuperação',function(){
 assert.match(index,/function saveSongsStore\(\)[\s\S]*scheduleAutomaticBackup\(\)/);
 assert.match(index,/function saveSongLists\(\)[\s\S]*scheduleAutomaticBackup\(\)/);
 assert.match(index,/function saveDrumPatternLibrary\(\)[\s\S]*scheduleAutomaticBackup\(\)/);
 assert.match(index,/GeraFolderBackup\.initialize/);
 assert.match(index,/GeraStorage\.automaticBackup\.restore\(data\)/);
 ['folder-backup-choose','folder-backup-now','folder-backup-reactivate','folder-backup-restore','folder-backup-recovery-dialog'].forEach(function(id){
  assert.match(index,new RegExp('id="'+id+'"'));
 });
 assert.equal((sw.match(/"\.\/js\/folder-backup\.js"/g)||[]).length,1);
});

test('rodapé institucional identifica o GERA e preserva espaço para o mixer',function(){
 assert.match(index,/<footer class="app-copyright-footer" aria-label="Direitos autorais">/);
 assert.match(index,/© 2026 GERA — Gerador de Acompanhamentos\./);
 assert.match(index,/Todos os direitos reservados\./);
 assert.match(css,/\.app-copyright-footer\{/);
 assert.match(css,/margin:22px auto 96px/);
});
