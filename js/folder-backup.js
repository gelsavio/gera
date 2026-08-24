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
 const WELCOME_DISMISSED_KEY='geraBackupWelcomeDismissedV1';
 const BACKUP_DELAY_MS=3000;
 const REDUCTION_LIMIT=.75;
 const APP_VERSION='3.15.46';

 let directoryHandle=null;
 let backupTimer=null;
 let latestData=null;
 let initialized=false;
 let bound=false;
 let operationInProgress=false;
 let wizardStep='';
 let wizardHistory=[];
 let wizardRequired=false;
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
 function welcomeDismissed(){
  try{return !!(global.localStorage&&global.localStorage.getItem(WELCOME_DISMISSED_KEY)==='1')}
  catch(error){return false}
 }
 function dismissWelcome(){
  try{if(global.localStorage)global.localStorage.setItem(WELCOME_DISMISSED_KEY,'1')}
  catch(error){if(global.console)global.console.warn('Não foi possível lembrar a escolha inicial:',error)}
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
 function getFileSize(file){
  const size=file&&file.size;
  return typeof size==='number'&&Number.isFinite(size)&&size>=0?size:null;
 }
 async function readJsonFile(name){
  if(!directoryHandle)return null;
  try{
   const handle=await directoryHandle.getFileHandle(name);
   const file=await handle.getFile();
   const size=getFileSize(file);
   let text=await file.text();
   const value=/\S/.test(text)?JSON.parse(text):null;
   text=null;
   return {value:value,size:size};
  }catch(error){
   if(error&&error.name==='NotFoundError')return null;
   throw error;
  }
 }
 async function writeJsonFile(name,value){
  if(!directoryHandle)throw new Error('A pasta de backup não foi configurada.');
  let handle;
  try{handle=await directoryHandle.getFileHandle(name)}
  catch(error){
   if(!error||error.name!=='NotFoundError')throw error;
   handle=await directoryHandle.getFileHandle(name,{create:true});
  }
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
   const loaded=await readJsonFile(MAIN_FILE);
   const raw=loaded&&loaded.value;
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
    const input=byId(forRecovery?'backup-wizard-file':'folder-backup-file');
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
   if(forRecovery)showWizardStep('connected');
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
    const metadata=await readBackupMetadata(definition);
    if(metadata)result.push(metadata);
   }catch(error){if(global.console)global.console.warn('Backup ignorado:',definition.name,error)}
  }
  return result;
 }
 async function readBackupMetadata(definition){
  const loaded=await readJsonFile(definition.name);
  if(!loaded||!loaded.value)return null;
  const backup=validateBackup(loaded.value);
  const info=backup.summary||summary(backup.data);
  return {
   name:definition.name,
   label:definition.label,
   updatedAt:backup.updatedAt||null,
   summary:{songs:info.songs,lists:info.lists,patterns:info.patterns},
   size:loaded.size
  };
 }
 const WIZARD_STEPS=['welcome','source','authorize','folder-guide','connected','searching','results','not-found','restored','empty-confirm'];
 function wizardDialog(){return byId('backup-wizard')}
 function wizardCopy(step){
  const appName=callbacks.appName||'GERA';
  const copy={
   welcome:{title:'Bem-vindo ao '+appName,message:'Como você deseja começar?'},
   source:{title:'Onde está seu backup?',message:'Escolha uma pasta compartilhada ou um arquivo JSON.'},
   authorize:{title:'Autorizar acesso à pasta',message:'O '+appName+' reconheceu a pasta usada anteriormente, mas o navegador precisa de sua autorização para acessá-la novamente.'},
   'folder-guide':{title:'Escolha uma pasta',message:'Na próxima tela, escolha ou crie a pasta onde seus backups serão mantidos. Depois toque em “Usar esta pasta”.'},
   connected:{title:'Pasta conectada',message:'A pasta foi configurada com sucesso.'},
   searching:{title:'Procurando backup',message:'Aguarde enquanto verificamos a pasta selecionada.'},
   results:{title:'Backup encontrado',message:'Escolha a cópia que deseja restaurar.'},
   'not-found':{title:'Nenhum backup encontrado',message:'Não encontramos um backup do '+appName+' nesta pasta.'},
   restored:{title:'Biblioteca recuperada',message:'Seu backup foi restaurado com sucesso.'},
   'empty-confirm':{title:'Começar uma nova biblioteca',message:'O '+appName+' será iniciado sem músicas.'}
  };
  return copy[step]||copy.source;
 }
 function wizardProgressStep(step){
  if(step==='welcome'||step==='empty-confirm')return 1;
  if(step==='source'||step==='authorize'||step==='folder-guide')return 2;
  if(step==='connected'||step==='searching'||step==='results'||step==='not-found')return 3;
  return 4;
 }
 function updateWizardSource(){
  const known=byId('backup-wizard-use-known');
  const choose=byId('backup-wizard-choose-source');
  if(known)known.hidden=!directoryHandle;
  if(choose)choose.textContent=directoryHandle?'Escolher outra pasta':'Escolher pasta';
 }
 function showWizardStep(step,options){
  const dialog=wizardDialog();
  if(!dialog)return false;
  options=options||{};
  if(options.reset){wizardHistory=[];wizardStep=''}
  if(options.push!==false&&wizardStep&&wizardStep!==step)wizardHistory.push(wizardStep);
  wizardStep=step;
  WIZARD_STEPS.forEach(function(name){
   const panel=byId('backup-wizard-step-'+name);
   if(panel)panel.hidden=name!==step;
  });
  const copy=wizardCopy(step);
  const title=byId('backup-wizard-title');
  const message=byId('backup-wizard-message');
  if(title)title.textContent=copy.title;
  if(message)message.textContent=copy.message;
  const progress=byId('backup-wizard-progress');
  const progressStep=wizardProgressStep(step);
  if(progress){
   progress.setAttribute('aria-label','Etapa '+progressStep+' de 4');
   Array.prototype.forEach.call(progress.children,function(dot,index){dot.classList.toggle('is-active',index===progressStep-1)});
  }
  const close=byId('backup-wizard-close');
  if(close)close.hidden=wizardRequired;
  if(step==='source')updateWizardSource();
  if(!dialog.open)dialog.showModal();
  return true;
 }
 function openWizard(step,required){
  wizardRequired=!!required;
  return showWizardStep(step,{reset:true,push:false});
 }
 function closeRecovery(){
  if(wizardRequired)return false;
  const dialog=wizardDialog();
  if(dialog&&dialog.open)dialog.close();
  wizardStep='';
  wizardHistory=[];
  return true;
 }
 function wizardBack(){
  const previous=wizardHistory.pop();
  if(previous)return showWizardStep(previous,{push:false});
  if(wizardRequired&&wizardStep!=='welcome')return showWizardStep('welcome',{push:false});
  return closeRecovery();
 }
 async function restoreBackup(backup,source){
  const label=source&&source.label?source.label:String(source||'backup');
  const size=source&&typeof source.size==='number'?source.size:null;
  const info=backup.summary||summary(backup.data);
  const accepted=await confirmAction(
   'Restaurar '+info.songs+(info.songs===1?' música':' músicas')+' de '+label+' e substituir o acervo atual?',
   'Restaurar backup do GERA',
   'Restaurar'
  );
  if(!accepted)return false;
  if(!callbacks.restore||!(await callbacks.restore(backup.data,{label:label,size:size}))){
   notify('Não foi possível restaurar o backup.');
   return false;
  }
  notify('Backup restaurado com sucesso.');
  wizardRequired=true;
  showWizardStep('restored');
  return true;
 }
 async function restoreFileOperation(name){
  try{
   const loaded=await readJsonFile(name);
   const backup=validateBackup(loaded&&loaded.value);
   return restoreBackup(backup,{label:name,size:loaded&&loaded.size});
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
 function formatFileSize(size){
  if(typeof size!=='number')return '';
  if(size<1024)return size+' B';
  if(size<1048576)return (size/1024).toFixed(1)+' KB';
  return (size/1048576).toFixed(1)+' MB';
 }
 function recoveryButtonAction(name){
  return function(){return restoreFile(name)};
 }
 function renderRecoveryList(backups){
  const list=byId('backup-wizard-results');
  if(!list)return;
  list.innerHTML='';
  if(!backups.length){
   const empty=global.document.createElement('div');
   empty.className='backup-wizard-empty';
   empty.textContent='Nenhum backup válido foi encontrado nesta pasta.';
   list.appendChild(empty);
   return;
  }
  backups.forEach(function(item){
   const name=item.name;
   const info=item.summary;
   const sizeText=typeof item.size==='number'?' · '+formatFileSize(item.size):'';
   const button=global.document.createElement('button');
   button.type='button';
   button.className='backup-wizard-option';
   button.innerHTML='<strong>'+item.label+'</strong><span>'+formatDate(item.updatedAt)+'</span><span>'+info.songs+' músicas · '+info.lists+' listas · '+info.patterns+' ritmos'+sizeText+'</span><em>Restaurar este backup</em>';
   button.onclick=recoveryButtonAction(name);
   list.appendChild(button);
  });
 }
 async function openRecoveryOperation(hasLocalData){
  return openWizard('source',false);
 }
 async function openRecovery(hasLocalData){
  if(operationInProgress)return false;
  await openRecoveryOperation(hasLocalData);
  return true;
 }
 async function useKnownFolder(){
  if(!directoryHandle){showWizardStep('source');return false}
  if(!(await checkPermission(directoryHandle,false))){showWizardStep('authorize');return false}
  setStatus('Pasta de backup disponível','active');
  showWizardStep('connected');
  return true;
 }
 async function authorizeKnownFolder(){
  if(!directoryHandle){showWizardStep('folder-guide');return false}
  if(!(await checkPermission(directoryHandle,true))){
   setStatus('Backup requer autorização','warning');
   notify('A autorização da pasta não foi concedida.');
   return false;
  }
  setStatus('Pasta de backup disponível','active');
  showWizardStep('connected');
  return true;
 }
 async function searchWizardBackupsOperation(){
  showWizardStep('searching');
  if(!directoryHandle){showWizardStep('source',{push:false});return false}
  if(!(await checkPermission(directoryHandle,false))){showWizardStep('authorize',{push:false});return false}
  const backups=await availableBackups();
  if(!backups.length){showWizardStep('not-found',{push:false});return true}
  renderRecoveryList(backups);
  showWizardStep('results',{push:false});
  return true;
 }
 async function searchWizardBackups(){
  if(operationInProgress)return false;
  operationInProgress=true;
  try{return await searchWizardBackupsOperation()}
  catch(error){
   if(global.console)global.console.error('Erro ao procurar backups:',error);
   showWizardStep('not-found',{push:false});
   return false;
  }finally{operationInProgress=false}
 }
 function startEmptyLibrary(){
  dismissWelcome();
  wizardRequired=false;
  return closeRecovery();
 }
 function enterGera(){
  wizardRequired=false;
  closeRecovery();
  global.location.reload();
 }
 async function selectManualFileOperation(input){
  const file=input&&input.files?input.files[0]:null;
  if(!file)return false;
  try{
   const size=getFileSize(file);
   let text=await file.text();
   let value=JSON.parse(text);
   text=null;
   const backup=validateBackup(value);
   value=null;
   return await restoreBackup(backup,{label:file.name,size:size});
  }
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
   'backup-wizard-close':closeRecovery,
   'backup-wizard-recover':function(){showWizardStep('source')},
   'backup-wizard-empty':function(){showWizardStep('empty-confirm')},
   'backup-wizard-use-known':useKnownFolder,
   'backup-wizard-choose-source':function(){showWizardStep('folder-guide')},
   'backup-wizard-authorize':authorizeKnownFolder,
   'backup-wizard-authorize-other':function(){showWizardStep('folder-guide')},
   'backup-wizard-choose-folder':function(){chooseFolder(true)},
   'backup-wizard-search':searchWizardBackups,
   'backup-wizard-connected-other':function(){showWizardStep('folder-guide')},
   'backup-wizard-results-other':function(){showWizardStep('folder-guide')},
   'backup-wizard-not-found-other':function(){showWizardStep('folder-guide')},
   'backup-wizard-not-found-empty':function(){showWizardStep('empty-confirm')},
   'backup-wizard-start-empty':startEmptyLibrary,
   'backup-wizard-enter':enterGera
  };
  Object.keys(actions).forEach(function(id){const element=byId(id);if(element)element.addEventListener('click',actions[id])});
  Array.prototype.forEach.call(global.document.querySelectorAll('[data-backup-wizard-back]'),function(element){element.addEventListener('click',wizardBack)});
  const dialog=wizardDialog();
  if(dialog)dialog.addEventListener('cancel',function(event){if(wizardRequired)event.preventDefault();else closeRecovery()});
  const input=byId('folder-backup-file');
  if(input)input.addEventListener('change',function(){selectManualFile(input)});
  const wizardInput=byId('backup-wizard-file');
  if(wizardInput)wizardInput.addEventListener('change',function(){selectManualFile(wizardInput)});
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
  let folderAvailable=false;
  if(directoryHandle){
   if(await checkPermission(directoryHandle,false)){
    folderAvailable=true;
    setStatus('Pasta de backup disponível','active');
   }else setStatus('Backup requer autorização','warning');
  }else setStatus('Backup automático em pasta não configurado','warning');
  if(!hasRealData(latestData)){
   if(!welcomeDismissed())openWizard('welcome',true);
   return;
  }
  if(folderAvailable){
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
