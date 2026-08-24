/*
 * Backup automático externo do GERA.
 *
 * Grava o acervo em uma pasta escolhida pelo usuário por meio da File System
 * Access API. O identificador da pasta é preservado no IndexedDB; os dados do
 * acervo não são duplicados no banco interno deste módulo.
 */
(function(global){
 'use strict';

 const DB_NAME='gera_backup_local';
 const DB_VERSION=1;
 const STORE_NAME='configuracoes';
 const HANDLE_KEY='diretorioBackup';
 const MAIN_FILE='gera-backup.json';
 const PREVIOUS_FILE='gera-backup-anterior.json';
 const BACKUP_DELAY_MS=3000;
 const REDUCTION_LIMIT=.75;
 const APP_VERSION='3.15.46';

 let directoryHandle=null;
 let backupTimer=null;
 let latestData=null;
 let initialized=false;
 let bound=false;
 let operationInProgress=false;
 let refusedReductionSignature='';
 let callbacks={};

 function byId(id){return global.document?global.document.getElementById(id):null}
 function songMap(data){
  const source=data&&data.data&&typeof data.data==='object'?data.data:data;
  const store=source&&source.songsStore&&typeof source.songsStore==='object'?source.songsStore:null;
  return store&&store.songs&&typeof store.songs==='object'?store.songs:{};
 }
 function countSongs(data){return Object.keys(songMap(data)).length}
 function countLists(data){
  const source=data&&data.data&&typeof data.data==='object'?data.data:data;
  const store=source&&source.songListsStore&&typeof source.songListsStore==='object'?source.songListsStore:null;
  return store&&store.lists&&typeof store.lists==='object'?Object.keys(store.lists).length:0;
 }
 function countPatterns(data){
  const source=data&&data.data&&typeof data.data==='object'?data.data:data;
  const store=source&&source.drumPatternLibrary&&typeof source.drumPatternLibrary==='object'?source.drumPatternLibrary:null;
  return store&&store.patterns&&typeof store.patterns==='object'?Object.keys(store.patterns).length:0;
 }
 function hasRealData(data){return countSongs(data)>0}
 function summary(data){
  return {songs:countSongs(data),lists:countLists(data),patterns:countPatterns(data)};
 }
 function makeBackup(data,type){
  return {
   app:'GERA — Gerador de Acompanhamentos',
   format:'gera-folder-backup',
   formatVersion:1,
   appVersion:APP_VERSION,
   backupType:type||'main',
   updatedAt:new Date().toISOString(),
   summary:summary(data),
   data:data
  };
 }
 function validateBackup(value){
  if(!value||typeof value!=='object')throw new Error('O arquivo não contém um objeto JSON válido.');
  const data=value.format==='gera-folder-backup'?value.data:value;
  if(!data||typeof data!=='object'||!data.songsStore||typeof data.songsStore!=='object'){
   throw new Error('O arquivo não contém a estrutura de dados do GERA.');
  }
  if(!hasRealData(data))throw new Error('O arquivo de backup não contém músicas para recuperar.');
  if(value.format==='gera-folder-backup')return value;
  return makeBackup(data,'imported-legacy');
 }
 function formatDate(value){
  const date=new Date(value||'');
  if(Number.isNaN(date.getTime()))return 'Data não informada';
  return date.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
 }
 function notify(message){
  if(callbacks.notify)callbacks.notify(message);
  else if(global.console)global.console.log(message);
 }
 function setStatus(message,state){
  const status=byId('folder-backup-status');
  const details=byId('folder-backup-details');
  if(status){
   status.textContent=message;
   status.dataset.state=state||'';
  }
  if(details){
   details.textContent=directoryHandle?'Pasta: '+(directoryHandle.name||'selecionada'):'Nenhuma pasta selecionada';
  }
 }
 function setLastBackup(backup){
  const element=byId('folder-backup-last');
  if(!element)return;
  if(!backup){element.textContent='Último backup: —';return}
  const info=backup.summary||summary(backup.data);
  element.textContent='Último backup: '+formatDate(backup.updatedAt)+' · '+info.songs+(info.songs===1?' música':' músicas');
 }
 function openDatabase(){
  return new Promise(function(resolve,reject){
   if(!global.indexedDB){resolve(null);return}
   const request=global.indexedDB.open(DB_NAME,DB_VERSION);
   request.onupgradeneeded=function(){
    const db=request.result;
    if(!db.objectStoreNames.contains(STORE_NAME))db.createObjectStore(STORE_NAME);
   };
   request.onsuccess=function(){resolve(request.result)};
   request.onerror=function(){reject(request.error)};
  });
 }
 async function saveHandle(handle){
  const db=await openDatabase();
  if(!db)return false;
  await new Promise(function(resolve,reject){
   const transaction=db.transaction(STORE_NAME,'readwrite');
   transaction.objectStore(STORE_NAME).put(handle,HANDLE_KEY);
   transaction.oncomplete=function(){resolve()};
   transaction.onerror=function(){reject(transaction.error)};
  });
  db.close();
  return true;
 }
 async function loadHandle(){
  const db=await openDatabase();
  if(!db)return null;
  const handle=await new Promise(function(resolve,reject){
   const transaction=db.transaction(STORE_NAME,'readonly');
   const request=transaction.objectStore(STORE_NAME).get(HANDLE_KEY);
   request.onsuccess=function(){resolve(request.result||null)};
   request.onerror=function(){reject(request.error)};
  });
  db.close();
  return handle;
 }
 async function checkPermission(handle,requestAccess){
  if(!handle)return false;
  const options={mode:'readwrite'};
  if(typeof handle.queryPermission!=='function')return true;
  let state=await handle.queryPermission(options);
  if(state==='granted')return true;
  if(requestAccess&&typeof handle.requestPermission==='function'){
   state=await handle.requestPermission(options);
   return state==='granted';
  }
  return false;
 }
 async function readJsonFile(name){
  if(!directoryHandle)return null;
  try{
   const handle=await directoryHandle.getFileHandle(name);
   const file=await handle.getFile();
   const text=await file.text();
   return text.trim()?JSON.parse(text):null;
  }catch(error){
   if(error&&error.name==='NotFoundError')return null;
   throw error;
  }
 }
 async function writeJsonFile(name,value){
  if(!directoryHandle)throw new Error('A pasta de backup não foi configurada.');
  const handle=await directoryHandle.getFileHandle(name,{create:true});
  const writable=await handle.createWritable();
  try{await writable.write(JSON.stringify(value,null,2))}
  finally{await writable.close()}
 }
 function calculateReduction(previousTotal,currentTotal){
  if(previousTotal<=0||currentTotal>=previousTotal)return 0;
  return (previousTotal-currentTotal)/previousTotal;
 }
 async function confirmAction(message,title,okLabel){
  if(callbacks.confirm)return !!(await callbacks.confirm(message,title,okLabel));
  return global.confirm?global.confirm(message):false;
 }
 function downloadManual(){
  if(!hasRealData(latestData)){notify('Não existem músicas para incluir no backup.');return false}
  const backup=makeBackup(latestData,'manual');
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const link=global.document.createElement('a');
  link.href=url;
  link.download=MAIN_FILE;
  link.click();
  global.setTimeout(function(){URL.revokeObjectURL(url)},1000);
  return true;
 }
 async function runBackupOperation(data,options){
  const backupData=data||latestData||{};
  latestData=backupData;
  const currentTotal=countSongs(backupData);
  if(currentTotal===0){
   setStatus('Backup protegido: não há músicas locais','warning');
   if(initialized)await openRecoveryOperation(false);
   return false;
  }
  if(!directoryHandle){setStatus('Alterações locais; backup não configurado','warning');return false}
  if(!(await checkPermission(directoryHandle,false))){setStatus('Backup requer autorização','warning');return false}
  try{
   let currentBackup=null;
   const raw=await readJsonFile(MAIN_FILE);
   if(raw){
    try{currentBackup=validateBackup(raw)}
    catch(error){
     setStatus('Backup existente inválido; arquivo preservado','error');
     notify('O backup existente parece inválido e não foi sobrescrito.');
     return false;
    }
   }
   if(currentBackup){
    const previousTotal=countSongs(currentBackup.data);
    const reduction=calculateReduction(previousTotal,currentTotal);
    const signature=previousTotal+':'+currentTotal;
    if(reduction>REDUCTION_LIMIT){
     if(refusedReductionSignature===signature&&!(options&&options.manual)){
      setStatus('Backup protegido: redução não confirmada','warning');
      return false;
     }
     const accepted=await confirmAction(
      'O acervo local foi reduzido em mais de 75% em relação ao backup protegido ('+
      previousTotal+' → '+currentTotal+' músicas).\n\n'+
      'Deseja atualizar o backup? A cópia atual será preservada em '+PREVIOUS_FILE+'.',
      'Proteção do backup em pasta',
      'Atualizar backup'
     );
     if(!accepted){
      refusedReductionSignature=signature;
      setStatus('Backup anterior preservado; redução não confirmada','warning');
      notify('O backup existente foi mantido sem alterações.');
      return false;
     }
     const previous=currentBackup;
     previous.backupType='before-reduction';
     previous.preservedAt=new Date().toISOString();
     previous.reason='Redução superior a 75% confirmada pelo usuário';
     await writeJsonFile(PREVIOUS_FILE,previous);
    }
   }
   const next=makeBackup(backupData,'main');
   await writeJsonFile(MAIN_FILE,next);
   setLastBackup(next);
   setStatus('Backup automático em pasta atualizado','active');
   refusedReductionSignature='';
   if(options&&options.manual)notify('Backup em pasta atualizado.');
   return true;
  }catch(error){
   if(global.console)global.console.error('Erro no backup em pasta:',error);
   setStatus('Falha ao gravar o backup','error');
   if(options&&options.manual)notify('Não foi possível gravar o backup em pasta.');
   return false;
  }
 }
 async function runBackup(data,options){
  if(operationInProgress)return false;
  operationInProgress=true;
  try{return await runBackupOperation(data,options)}
  finally{operationInProgress=false}
 }
 function schedule(data){
  latestData=data||{};
  global.clearTimeout(backupTimer);
  if(!hasRealData(latestData)){
   setStatus('Backup protegido: não há músicas locais','warning');
   return;
  }
  if(!directoryHandle){setStatus('Alterações locais; backup não configurado','warning');return}
  setStatus('Alterações aguardando backup...','pending');
  backupTimer=global.setTimeout(function(){runBackup(latestData,{manual:false})},BACKUP_DELAY_MS);
 }
 async function chooseFolder(forRecovery){
  if(typeof global.showDirectoryPicker!=='function'){
   if(forRecovery||!hasRealData(latestData)){
    notify('Este navegador não permite procurar a pasta automaticamente. Selecione o arquivo de backup.');
    const input=byId('folder-backup-file');
    if(input)input.click();
   }else{
    downloadManual();
    notify('O navegador não permite backup automático em pasta. Foi gerado um backup manual.');
   }
   return false;
  }
  try{
   directoryHandle=await global.showDirectoryPicker({mode:'readwrite'});
   try{await saveHandle(directoryHandle)}catch(error){
    if(global.console)global.console.warn('A pasta funcionará nesta sessão, mas não pôde ser lembrada:',error);
   }
   setStatus('Pasta de backup configurada','active');
   return true;
  }catch(error){
   if(!error||error.name!=='AbortError'){
    if(global.console)global.console.error('Erro ao selecionar pasta de backup:',error);
    notify('Não foi possível acessar a pasta de backup.');
   }
   return false;
  }
 }
 async function reactivate(){
  if(!directoryHandle)return chooseFolder(!hasRealData(latestData));
  if(!(await checkPermission(directoryHandle,true))){
   setStatus('Backup requer autorização','warning');
   notify('A autorização da pasta não foi concedida.');
   return false;
  }
  setStatus('Backup automático em pasta ativo','active');
  if(!hasRealData(latestData))await openRecovery(false);
  else await runBackup(latestData,{manual:true});
  return true;
 }
 async function backupNow(){
  if(!directoryHandle)return chooseFolder(false);
  if(!(await checkPermission(directoryHandle,true))){setStatus('Backup requer autorização','warning');return false}
  global.clearTimeout(backupTimer);
  return runBackup(latestData,{manual:true});
 }
 async function availableBackups(){
  const result=[];
  const definitions=[
   {name:MAIN_FILE,label:'Backup principal'},
   {name:PREVIOUS_FILE,label:'Backup anterior à redução'}
  ];
  for(const definition of definitions){
   try{
    const raw=await readJsonFile(definition.name);
    if(!raw)continue;
    result.push({name:definition.name,label:definition.label,backup:validateBackup(raw)});
   }catch(error){if(global.console)global.console.warn('Backup ignorado:',definition.name,error)}
  }
  return result;
 }
 function recoveryDialog(){return byId('folder-backup-recovery-dialog')}
 function closeRecovery(){const dialog=recoveryDialog();if(dialog&&dialog.open)dialog.close()}
 async function restoreBackup(backup,label){
  const info=backup.summary||summary(backup.data);
  const accepted=await confirmAction(
   'Restaurar '+info.songs+(info.songs===1?' música':' músicas')+' de '+label+' e substituir o acervo atual?',
   'Restaurar backup do GERA',
   'Restaurar'
  );
  if(!accepted)return false;
  if(!callbacks.restore||!(await callbacks.restore(backup.data))){
   notify('Não foi possível restaurar o backup.');
   return false;
  }
  notify('Backup restaurado. Reabrindo o GERA...');
  closeRecovery();
  global.setTimeout(function(){global.location.reload()},350);
  return true;
 }
 async function restoreFileOperation(name){
  try{
   const backup=validateBackup(await readJsonFile(name));
   return restoreBackup(backup,name);
  }catch(error){
   if(global.console)global.console.error('Erro ao restaurar backup:',error);
   notify('O backup não pôde ser restaurado: '+error.message);
   return false;
  }
 }
 async function restoreFile(name){
  if(operationInProgress)return false;
  operationInProgress=true;
  try{return await restoreFileOperation(name)}
  finally{operationInProgress=false}
 }
 function renderRecoveryList(backups){
  const list=byId('folder-backup-recovery-list');
  if(!list)return;
  list.innerHTML='';
  if(!backups.length){
   const empty=global.document.createElement('div');
   empty.className='folder-backup-empty';
   empty.textContent='Nenhum backup válido foi encontrado nesta pasta.';
   list.appendChild(empty);
   return;
  }
  backups.forEach(function(item){
   const info=item.backup.summary||summary(item.backup.data);
   const button=global.document.createElement('button');
   button.type='button';
   button.className='folder-backup-option';
   button.innerHTML='<strong>'+item.label+'</strong><span>'+formatDate(item.backup.updatedAt)+'</span><span>'+info.songs+' músicas · '+info.lists+' listas · '+info.patterns+' ritmos</span>';
   button.onclick=function(){restoreFile(item.name)};
   list.appendChild(button);
  });
 }
 async function openRecoveryOperation(hasLocalData){
  const dialog=recoveryDialog();
  const title=byId('folder-backup-recovery-title');
  const message=byId('folder-backup-recovery-message');
  const list=byId('folder-backup-recovery-list');
  if(title)title.textContent=hasLocalData?'Restaurar backup em pasta':'Biblioteca local vazia';
  if(message){
   message.textContent=hasLocalData
    ?'Escolha uma cópia para substituir o acervo atual.'
    :'Não há músicas salvas neste dispositivo. Localize a pasta do backup ou selecione um arquivo JSON.';
  }
  if(dialog&&!dialog.open)dialog.showModal();
  if(list)list.innerHTML='<div class="folder-backup-empty">Procurando backups...</div>';
  if(!directoryHandle){
   if(list)list.innerHTML='<div class="folder-backup-empty">A pasta de backup ainda não foi selecionada.</div>';
   return;
  }
  if(!(await checkPermission(directoryHandle,false))){
   if(list)list.innerHTML='<div class="folder-backup-empty">A pasta conhecida precisa de nova autorização.</div>';
   return;
  }
  renderRecoveryList(await availableBackups());
 }
 async function openRecovery(hasLocalData){
  if(operationInProgress)return false;
  operationInProgress=true;
  try{await openRecoveryOperation(hasLocalData);return true}
  finally{operationInProgress=false}
 }
 async function selectManualFileOperation(input){
  const file=input&&input.files?input.files[0]:null;
  if(!file)return false;
  try{return await restoreBackup(validateBackup(JSON.parse(await file.text())),file.name)}
  catch(error){
   if(global.console)global.console.error('Arquivo de backup inválido:',error);
   notify('O arquivo selecionado não é um backup válido do GERA.');
   return false;
  }finally{input.value=''}
 }
 async function selectManualFile(input){
  if(operationInProgress)return false;
  operationInProgress=true;
  try{return await selectManualFileOperation(input)}
  finally{operationInProgress=false}
 }
 function bind(){
  if(bound||!global.document)return;
  bound=true;
  const actions={
   'folder-backup-choose':function(){chooseFolder(false)},
   'folder-backup-now':backupNow,
   'folder-backup-reactivate':reactivate,
   'folder-backup-restore':function(){openRecovery(hasRealData(latestData))},
   'folder-backup-recovery-choose':function(){chooseFolder(true)},
   'folder-backup-recovery-reactivate':reactivate,
   'folder-backup-recovery-close':closeRecovery
  };
  Object.keys(actions).forEach(function(id){const element=byId(id);if(element)element.addEventListener('click',actions[id])});
  const input=byId('folder-backup-file');
  if(input)input.addEventListener('change',function(){selectManualFile(input)});
  const recoveryInput=byId('folder-backup-recovery-file');
  if(recoveryInput)recoveryInput.addEventListener('change',function(){selectManualFile(recoveryInput)});
 }
 async function initialize(options){
  callbacks=options||{};
  latestData=callbacks.data||{};
  bind();
  try{directoryHandle=await loadHandle()}
  catch(error){
   if(global.console)global.console.warn('Não foi possível carregar a pasta de backup:',error);
   directoryHandle=null;
  }
  initialized=true;
  if(directoryHandle){
   if(await checkPermission(directoryHandle,false)){
    setStatus('Backup automático em pasta ativo','active');
    try{
     const raw=await readJsonFile(MAIN_FILE);
     if(raw)setLastBackup(validateBackup(raw));
    }catch(error){setStatus('Backup existente precisa de verificação','error')}
   }else setStatus('Backup requer autorização','warning');
  }else setStatus('Backup automático em pasta não configurado','warning');
  if(!hasRealData(latestData)){await openRecovery(false);return}
  if(directoryHandle&&await checkPermission(directoryHandle,false)){
   global.setTimeout(function(){runBackup(latestData,{manual:false})},1200);
  }
 }

 global.GeraFolderBackup=Object.freeze({
  initialize:initialize,
  schedule:schedule,
  runNow:backupNow,
  chooseFolder:function(){return chooseFolder(false)},
  reactivate:reactivate,
  openRecovery:function(){return openRecovery(hasRealData(latestData))},
  closeRecovery:closeRecovery,
  downloadManual:downloadManual,
  selectManualFile:selectManualFile,
  validateBackup:validateBackup,
  makeBackup:makeBackup,
  calculateReduction:calculateReduction,
  constants:Object.freeze({mainFile:MAIN_FILE,previousFile:PREVIOUS_FILE,delay:BACKUP_DELAY_MS,reductionLimit:REDUCTION_LIMIT})
 });
})(typeof window!=='undefined'?window:this);
