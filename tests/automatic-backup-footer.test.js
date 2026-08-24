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
 const files=options.files||new Map();
 const storage=options.storage||new Map();
 const permission=options.permission||{state:'granted'};
 const writes=[];
 const reads=[];
 const sizes=[];
 const fileEvents=[];
 const fileHandleRequests=[];
 const returnedFileHandles=[];
 const writableFileHandles=[];
 const parses=[];
 const stringifies=[];
 const timers=[];
 const directory={
  name:'Backups GERA',
  queryPermission:async function(){return permission.state},
  requestPermission:async function(){permission.state=permission.requestState||'granted';return permission.state},
  getFileHandle:async function(name,fileOptions){
   fileHandleRequests.push({name:name,create:!!(fileOptions&&fileOptions.create)});
   if(!files.has(name)&&!(fileOptions&&fileOptions.create)){
    const error=new Error('Arquivo não encontrado');
    error.name='NotFoundError';
    throw error;
   }
   if(!files.has(name))files.set(name,'');
   const fileHandle={
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
     writableFileHandles.push(fileHandle);
     return {
      write:async function(content){files.set(name,String(content));writes.push(name)},
      close:async function(){}
     };
    }
   };
   returnedFileHandles.push(fileHandle);
   return fileHandle;
  }
 };
 function makeElement(){
  const listeners={};
  const classes=new Set();
  const element={
   children:[],
   dataset:{},
   hidden:false,
   open:false,
   classList:{
    toggle:function(name,force){if(force)classes.add(name);else classes.delete(name)},
    contains:function(name){return classes.has(name)}
   },
   addEventListener:function(type,callback){(listeners[type]||(listeners[type]=[])).push(callback)},
   setAttribute:function(name,value){this[name]=String(value)},
   getAttribute:function(name){return this[name]},
   appendChild:function(child){this.children.push(child);return child},
   click:function(){
    let result=this.onclick?this.onclick():undefined;
    (listeners.click||[]).forEach(function(callback){result=callback({target:element})});
    return result;
   },
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
 const backButtons=[];
 if(options.recoveryDom||options.wizardDom){
  ['backup-wizard','backup-wizard-title','backup-wizard-message','backup-wizard-progress','backup-wizard-close','backup-wizard-recover','backup-wizard-empty','backup-wizard-use-known','backup-wizard-choose-source','backup-wizard-authorize','backup-wizard-authorize-other','backup-wizard-choose-folder','backup-wizard-search','backup-wizard-connected-other','backup-wizard-results','backup-wizard-results-other','backup-wizard-not-found-other','backup-wizard-not-found-empty','backup-wizard-start-empty','backup-wizard-enter','backup-wizard-file'].concat(['welcome','source','authorize','folder-guide','connected','searching','results','not-found','restored','empty-confirm'].map(function(step){return 'backup-wizard-step-'+step})).forEach(function(id){elements[id]=makeElement()});
  for(let index=0;index<4;index++)elements['backup-wizard-progress'].appendChild(makeElement());
  for(let index=0;index<6;index++)backButtons.push(makeElement());
 }
 const document={
  getElementById:function(id){return elements[id]||null},
  createElement:function(){return makeElement()},
  querySelectorAll:function(selector){return selector==='[data-backup-wizard-back]'?backButtons:[]}
 };
 let storedDirectory=options.rememberDirectory?directory:null;
 const indexedDB={open:function(){
  const db={
   objectStoreNames:{contains:function(){return true}},
   createObjectStore:function(){},
   close:function(){},
   transaction:function(name,mode){
    const transaction={
     objectStore:function(){return {
      get:function(){const request={};Promise.resolve().then(function(){request.result=storedDirectory;if(request.onsuccess)request.onsuccess()});return request},
      put:function(value){storedDirectory=value;Promise.resolve().then(function(){if(transaction.oncomplete)transaction.oncomplete()})}
     }}
    };
    return transaction;
   }
  };
  const request={result:db};
  Promise.resolve().then(function(){if(request.onsuccess)request.onsuccess()});
  return request;
 }};
 const fakeUrl={createObjectURL:function(){return 'blob:backup'},revokeObjectURL:function(){}};
 const window={
  document:document,
  indexedDB:(options.rememberDirectory||options.useIndexedDb)?indexedDB:null,
  localStorage:{
   getItem:function(key){return storage.has(key)?storage.get(key):null},
   setItem:function(key,value){storage.set(key,String(value))},
   removeItem:function(key){storage.delete(key)}
  },
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
 return {api:window.GeraFolderBackup,directory:directory,elements:elements,files:files,storage:storage,permission:permission,reads:reads,writes:writes,sizes:sizes,fileEvents:fileEvents,fileHandleRequests:fileHandleRequests,returnedFileHandles:returnedFileHandles,writableFileHandles:writableFileHandles,parses:parses,stringifies:stringifies,timers:timers};
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
 harness.fileHandleRequests.length=0;
 harness.returnedFileHandles.length=0;
 harness.writableFileHandles.length=0;

 harness.api.schedule(data(['A']));
 assert.equal(harness.timers.at(-1).delay,3000);
 assert.equal(await harness.api.runNow(),true);

 assert.equal(confirmationCount,1);
 assert.deepEqual(harness.fileHandleRequests.map(function(request){return [request.name,request.create]}),[
  ['gera-backup.json',false],
  ['gera-backup-anterior.json',false],
  ['gera-backup-anterior.json',true],
  ['gera-backup.json',false]
 ]);
 assert.deepEqual(harness.writes,['gera-backup-anterior.json','gera-backup.json']);
 assert.equal(harness.writableFileHandles[0],harness.returnedFileHandles[1]);
 assert.equal(harness.writableFileHandles[1],harness.returnedFileHandles[2]);
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
 assert.deepEqual(harness.fileHandleRequests,[]);
 assert.equal(harness.files.has('gera-backup.json'),false);
});

test('biblioteca vazia abre o wizard na tela de boas-vindas',async function(){
 const harness=createHarness({wizardDom:true});
 await harness.api.initialize({data:data([]),notify:function(){},restore:async function(){}});

 assert.equal(harness.elements['backup-wizard'].open,true);
 assert.equal(harness.elements['backup-wizard-title'].textContent,'Bem-vindo ao GERA');
 assert.equal(harness.elements['backup-wizard-message'].textContent,'Como você deseja começar?');
 assert.equal(harness.elements['backup-wizard-step-welcome'].hidden,false);
 assert.equal(harness.elements['backup-wizard-step-source'].hidden,true);
 assert.match(index,/Recuperar minha biblioteca/);
 assert.match(index,/Começar com biblioteca vazia/);
});

test('wizard só procura backup depois da pasta conectada e do comando explícito',async function(){
 const harness=createHarness({wizardDom:true});
 await harness.api.initialize({data:data([]),notify:function(){},restore:async function(){}});
 harness.files.set('gera-backup.json',JSON.stringify(harness.api.makeBackup(data(['A']),'main')));

 harness.elements['backup-wizard-recover'].click();
 harness.elements['backup-wizard-choose-source'].click();
 assert.equal(harness.elements['backup-wizard-title'].textContent,'Escolha uma pasta');
 harness.elements['backup-wizard-choose-folder'].click();
 await new Promise(function(resolve){setImmediate(resolve)});
 assert.equal(harness.elements['backup-wizard-title'].textContent,'Pasta conectada');
 assert.deepEqual(harness.reads,[]);
 assert.deepEqual(harness.writes,[]);
 assert.deepEqual(harness.parses,[]);
 assert.deepEqual(harness.stringifies,[]);
 assert.deepEqual(harness.fileHandleRequests,[]);

 assert.equal(await harness.elements['backup-wizard-search'].click(),true);
 assert.deepEqual(harness.reads,['gera-backup.json']);
 assert.equal(harness.parses.length,1);
 assert.equal(harness.elements['backup-wizard-title'].textContent,'Backup encontrado');
});

test('pasta conhecida sem permissão abre a etapa de autorização',async function(){
 const permission={state:'granted',requestState:'granted'};
 const harness=createHarness({wizardDom:true,permission:permission});
 await harness.api.initialize({data:data(['LOCAL']),notify:function(){},restore:async function(){}});
 assert.equal(await harness.api.chooseFolder(),true);
 permission.state='prompt';

 assert.equal(await harness.api.openRecovery(),true);
 assert.equal(await harness.elements['backup-wizard-use-known'].click(),false);
 assert.equal(harness.elements['backup-wizard-title'].textContent,'Autorizar acesso à pasta');
 assert.deepEqual(harness.reads,[]);
 assert.equal(await harness.elements['backup-wizard-authorize'].click(),true);
 assert.equal(harness.elements['backup-wizard-title'].textContent,'Pasta conectada');
});

test('nenhum backup encontrado oferece começar com biblioteca vazia',async function(){
 const harness=createHarness({wizardDom:true});
 await harness.api.initialize({data:data(['LOCAL']),notify:function(){},restore:async function(){}});
 assert.equal(await harness.api.chooseFolder(),true);
 assert.equal(await harness.api.openRecovery(),true);
 assert.equal(await harness.elements['backup-wizard-use-known'].click(),true);

 assert.equal(await harness.elements['backup-wizard-search'].click(),true);
 assert.equal(harness.elements['backup-wizard-title'].textContent,'Nenhum backup encontrado');
 assert.equal(harness.elements['backup-wizard-step-not-found'].hidden,false);
 assert.match(index,/id="backup-wizard-not-found-empty"[^>]*>Começar com biblioteca vazia</);
});

test('começar vazio é não destrutivo e não repete o wizard no reload normal',async function(){
 const storage=new Map();
 const files=new Map([['gera-backup.json','BACKUP_EXISTENTE']]);
 const first=createHarness({wizardDom:true,storage:storage,files:files});
 await first.api.initialize({data:data([]),notify:function(){},restore:async function(){}});

 first.elements['backup-wizard-empty'].click();
 assert.equal(first.elements['backup-wizard-title'].textContent,'Começar uma nova biblioteca');
 first.elements['backup-wizard-start-empty'].click();
 assert.equal(first.elements['backup-wizard'].open,false);
 assert.equal(files.get('gera-backup.json'),'BACKUP_EXISTENTE');
 assert.deepEqual(first.writes,[]);
 assert.deepEqual(first.stringifies,[]);
 assert.equal(storage.get('geraBackupWelcomeDismissedV1'),'1');

 const reload=createHarness({wizardDom:true,storage:storage,files:files});
 await reload.api.initialize({data:data([]),notify:function(){},restore:async function(){}});
 assert.equal(reload.elements['backup-wizard'].open,false);
 assert.equal(files.get('gera-backup.json'),'BACKUP_EXISTENTE');
 assert.deepEqual(reload.writes,[]);
});

test('initialize não lê o backup principal apenas para exibir status',async function(){
 const harness=createHarness({rememberDirectory:true});
 harness.files.set('gera-backup.json',JSON.stringify({format:'gera-folder-backup',data:data(['A'])}));

 await harness.api.initialize({data:data(['LOCAL']),notify:function(){},restore:async function(){}});
 assert.deepEqual(harness.reads,[]);
 assert.deepEqual(harness.parses,[]);
 assert.deepEqual(harness.fileHandleRequests,[]);
 assert.equal(harness.timers.at(-1).delay,1200);
});

test('escrita abre arquivo existente sem create true e reutiliza o handle retornado',async function(){
 const harness=createHarness();
 await harness.api.initialize({data:data(['A']),notify:function(){},restore:async function(){}});
 assert.equal(await harness.api.chooseFolder(),true);
 harness.files.set('gera-backup.json',JSON.stringify(harness.api.makeBackup(data(['A']),'main')));

 assert.equal(await harness.api.runNow(),true);
 assert.deepEqual(harness.fileHandleRequests.map(function(request){return request.create}),[false,false]);
 assert.equal(harness.fileHandleRequests.some(function(request){return request.create}),false);
 assert.equal(harness.writableFileHandles.length,1);
 assert.equal(harness.writableFileHandles[0],harness.returnedFileHandles[1]);
});

test('escrita usa create true somente depois de NotFoundError',async function(){
 const harness=createHarness();
 await harness.api.initialize({data:data(['A']),notify:function(){},restore:async function(){}});
 assert.equal(await harness.api.chooseFolder(),true);

 assert.equal(await harness.api.runNow(),true);
 assert.deepEqual(harness.fileHandleRequests.map(function(request){return request.create}),[false,false,true]);
 assert.equal(harness.writableFileHandles.length,1);
 assert.equal(harness.writableFileHandles[0],harness.returnedFileHandles[0]);
 assert.equal(harness.files.has('gera-backup.json'),true);
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
 const harness=createHarness({wizardDom:true});
 await harness.api.initialize({
  data:data(['LOCAL']),
  notify:function(){},
  restore:async function(value,sourceInfo){restored.push({value:value,sourceInfo:sourceInfo});return true}
 });
 assert.equal(await harness.api.chooseFolder(),true);
 harness.files.set('gera-backup.json',JSON.stringify(harness.api.makeBackup(data(['MAIN_SENTINEL']),'main')));
 harness.files.set('gera-backup-anterior.json',JSON.stringify(harness.api.makeBackup(data(['PREVIOUS_SENTINEL']),'before-reduction')));

 assert.equal(await harness.api.openRecovery(),true);
 assert.deepEqual(harness.reads,[]);
 assert.equal(await harness.elements['backup-wizard-use-known'].click(),true);
 assert.deepEqual(harness.reads,[]);
 assert.equal(await harness.elements['backup-wizard-search'].click(),true);
 assert.deepEqual(harness.reads,['gera-backup.json','gera-backup-anterior.json']);
 assert.equal(harness.parses.length,2);
 assert.deepEqual(harness.fileEvents,[
  'size:gera-backup.json','text:gera-backup.json','parse',
  'size:gera-backup-anterior.json','text:gera-backup-anterior.json','parse'
 ]);

 const buttons=harness.elements['backup-wizard-results'].children;
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
 assert.equal(harness.elements['backup-wizard-title'].textContent,'Biblioteca recuperada');
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
 assert.match(source,/geraBackupWelcomeDismissedV1/);
 assert.doesNotMatch(source,/localStorage\.(?:getItem|setItem)\((?:MAIN_FILE|PREVIOUS_FILE)/);
});

test('salvamentos do acervo alimentam o backup em pasta e a interface oferece recuperação',function(){
 assert.match(index,/function saveSongsStore\(\)[\s\S]*scheduleAutomaticBackup\(\)/);
 assert.match(index,/function saveSongLists\(\)[\s\S]*scheduleAutomaticBackup\(\)/);
 assert.match(index,/function saveDrumPatternLibrary\(\)[\s\S]*scheduleAutomaticBackup\(\)/);
 assert.match(index,/GeraFolderBackup\.initialize/);
 assert.match(index,/GeraStorage\.automaticBackup\.restore\(data\)/);
 ['folder-backup-choose','folder-backup-now','folder-backup-reactivate','folder-backup-restore','backup-wizard'].forEach(function(id){
  assert.match(index,new RegExp('id="'+id+'"'));
 });
 assert.equal((index.match(/<dialog id="backup-wizard"/g)||[]).length,1);
 assert.doesNotMatch(index,/folder-backup-recovery-dialog/);
 assert.equal((sw.match(/"\.\/js\/folder-backup\.js"/g)||[]).length,1);
});

test('rodapé institucional identifica o GERA e preserva espaço para o mixer',function(){
 assert.match(index,/<footer class="app-copyright-footer" aria-label="Direitos autorais">/);
 assert.match(index,/© 2026 GERA — Gerador de Acompanhamentos\./);
 assert.match(index,/Todos os direitos reservados\./);
 assert.match(css,/\.app-copyright-footer\{/);
 assert.match(css,/margin:22px auto 96px/);
});
