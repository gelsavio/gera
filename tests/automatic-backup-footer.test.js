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
 const reads=[];
 const sizes=[];
 const fileEvents=[];
 const parses=[];
 const stringifies=[];
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
    getFile:async function(){return {
     get size(){sizes.push(name);fileEvents.push('size:'+name);return Buffer.byteLength(files.get(name),'utf8')},
     text:async function(){
      reads.push(name);
      fileEvents.push('text:'+name);
      if(options.beforeRead)await options.beforeRead(name);
      return files.get(name);
     }
    }},
    createWritable:async function(){
     return {
      write:async function(content){files.set(name,String(content));writes.push(name)},
      close:async function(){}
     };
    }
   };
  }
 };
 function makeElement(){
  const element={
   children:[],
   dataset:{},
   open:false,
   appendChild:function(child){this.children.push(child);return child},
   click:function(){return this.onclick?this.onclick():undefined},
   remove:function(){},
   showModal:function(){this.open=true},
   close:function(){this.open=false}
  };
  let html='';
  Object.defineProperty(element,'innerHTML',{
   get:function(){return html},
   set:function(value){html=String(value);element.children.length=0}
  });
  return element;
 }
 const elements={};
 if(options.recoveryDom){
  ['folder-backup-recovery-dialog','folder-backup-recovery-title','folder-backup-recovery-message','folder-backup-recovery-list'].forEach(function(id){elements[id]=makeElement()});
 }
 const document={
  getElementById:function(id){return elements[id]||null},
  createElement:function(){return makeElement()}
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
 const trackedJson={
  parse:function(value){parses.push(value);fileEvents.push('parse');return JSON.parse(value)},
  stringify:function(value,replacer,space){stringifies.push(value);return JSON.stringify(value,replacer,space)}
 };
 vm.runInNewContext(source,{window:window,globalThis:window,console:console,Blob:Blob,URL:fakeUrl,JSON:trackedJson});
 return {api:window.GeraFolderBackup,directory:directory,elements:elements,files:files,reads:reads,writes:writes,sizes:sizes,fileEvents:fileEvents,parses:parses,stringifies:stringifies,timers:timers};
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
 assert.equal(harness.reads.length,0);
 assert.equal(harness.writes.length,0);
 assert.equal(await harness.api.runNow(),true);
 harness.writes.length=0;

 harness.api.schedule(data(['A']));
 assert.equal(harness.timers.at(-1).delay,3000);
 assert.equal(await harness.api.runNow(),true);

 assert.equal(confirmationCount,1);
 assert.deepEqual(harness.writes,['gera-backup-anterior.json','gera-backup.json']);
 assert.equal(Object.keys(JSON.parse(harness.files.get('gera-backup-anterior.json')).data.songsStore.songs).length,5);
 assert.equal(Object.keys(JSON.parse(harness.files.get('gera-backup.json')).data.songsStore.songs).length,1);
});

test('selecionar a pasta apenas salva a configuração, sem ler ou gravar backup',async function(){
 const harness=createHarness();
 await harness.api.initialize({data:data(['A']),notify:function(){},restore:async function(){}});

 assert.equal(await harness.api.chooseFolder(),true);
 assert.deepEqual(harness.reads,[]);
 assert.deepEqual(harness.writes,[]);
 assert.deepEqual(harness.parses,[]);
 assert.deepEqual(harness.stringifies,[]);
 assert.equal(harness.files.has('gera-backup.json'),false);
});

test('trava impede leituras concorrentes de backup',async function(){
 let releaseRead;
 let signalRead;
 const readStarted=new Promise(function(resolve){signalRead=resolve});
 const readGate=new Promise(function(resolve){releaseRead=resolve});
 const harness=createHarness({beforeRead:async function(){signalRead();await readGate}});
 await harness.api.initialize({data:data(['A']),notify:function(){},restore:async function(){}});
 assert.equal(await harness.api.chooseFolder(),true);
 harness.files.set('gera-backup.json',JSON.stringify(harness.api.makeBackup(data(['A']),'main')));

 const first=harness.api.runNow();
 await readStarted;
 assert.equal(await harness.api.runNow(),false);
 let manualReads=0;
 const input={files:[{name:'manual.json',text:async function(){manualReads++;return '{}'}}],value:'manual.json'};
 assert.equal(await harness.api.selectManualFile(input),false);
 assert.equal(manualReads,0);
 assert.equal(harness.reads.length,1);
 releaseRead();
 assert.equal(await first,true);
});

test('recuperação lista somente metadados e relê apenas o arquivo escolhido',async function(){
 const restored=[];
 const harness=createHarness({recoveryDom:true});
 await harness.api.initialize({
  data:data(['LOCAL']),
  notify:function(){},
  restore:async function(value,sourceInfo){restored.push({value:value,sourceInfo:sourceInfo});return true}
 });
 assert.equal(await harness.api.chooseFolder(),true);
 harness.files.set('gera-backup.json',JSON.stringify(harness.api.makeBackup(data(['MAIN_SENTINEL']),'main')));
 harness.files.set('gera-backup-anterior.json',JSON.stringify(harness.api.makeBackup(data(['PREVIOUS_SENTINEL']),'before-reduction')));

 assert.equal(await harness.api.openRecovery(),true);
 assert.deepEqual(harness.reads,['gera-backup.json','gera-backup-anterior.json']);
 assert.equal(harness.parses.length,2);
 assert.deepEqual(harness.fileEvents,[
  'size:gera-backup.json','text:gera-backup.json','parse',
  'size:gera-backup-anterior.json','text:gera-backup-anterior.json','parse'
 ]);

 const buttons=harness.elements['folder-backup-recovery-list'].children;
 assert.equal(buttons.length,2);
 assert.doesNotMatch(buttons[0].innerHTML,/MAIN_SENTINEL/);
 assert.doesNotMatch(buttons[1].innerHTML,/PREVIOUS_SENTINEL/);
 assert.match(buttons[0].onclick.toString(),/restoreFile\(name\)/);
 assert.doesNotMatch(buttons[0].onclick.toString(),/item|backup/);
 assert.doesNotMatch(source.slice(source.indexOf('function renderRecoveryList'),source.indexOf('async function openRecoveryOperation')),/item\.backup/);

 assert.equal(await buttons[0].click(),true);
 assert.equal(harness.reads.filter(function(name){return name==='gera-backup.json'}).length,2);
 assert.equal(harness.reads.filter(function(name){return name==='gera-backup-anterior.json'}).length,1);
 assert.equal(harness.parses.length,3);
 assert.equal(restored.length,1);
 assert.equal(Object.keys(restored[0].value.songsStore.songs)[0],'MAIN_SENTINEL');
 assert.equal(restored[0].sourceInfo.label,'gera-backup.json');
 assert.equal(typeof restored[0].sourceInfo.size,'number');
});

test('importação manual consulta tamanho, lê e interpreta uma única vez',async function(){
 const restored=[];
 const order=[];
 const harness=createHarness();
 await harness.api.initialize({
  data:data(['LOCAL']),
  notify:function(){},
  restore:async function(value,sourceInfo){restored.push({value:value,sourceInfo:sourceInfo});return true}
 });
 const text=JSON.stringify(harness.api.makeBackup(data(['MANUAL']),'main'));
 const file={
  name:'manual.json',
  get size(){order.push('size');return Buffer.byteLength(text,'utf8')},
  text:async function(){order.push('text');return text}
 };
 const input={files:[file],value:'manual.json'};

 assert.equal(await harness.api.selectManualFile(input),true);
 assert.deepEqual(order,['size','text']);
 assert.equal(harness.parses.length,1);
 assert.equal(restored.length,1);
 assert.equal(Object.keys(restored[0].value.songsStore.songs)[0],'MANUAL');
 assert.equal(restored[0].sourceInfo.size,Buffer.byteLength(text,'utf8'));
 assert.equal(input.value,'');
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
