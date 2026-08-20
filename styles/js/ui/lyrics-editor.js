/* Interface independente para cadastrar letras por passagem. */
(function(global){
 'use strict';

 function createController(options){
  const documentRef=options.document||global.document;
  const element=function(id){return documentRef.getElementById(id)};
  let draft=null;
  let passageLimits={};
  let selectedSection='verse';
  let selectedPassage=1;
  let previewTimer=null;
  let previewActive=false;
  let previewLastState=null;

  function clone(value){return JSON.parse(JSON.stringify(value))}
  function ordinal(value){return value+'ª passagem'}
  function sections(){return draft||{}}
  function currentItems(){return Array.isArray(sections()[selectedSection])?sections()[selectedSection]:[]}
  function sectionLabel(section){return options.sectionLabels[section]||section}
  function itemLabel(item,index){return options.itemLabel?options.itemLabel(item,index):String(index+1)}
  function itemDuration(item){return options.itemDuration?options.itemDuration(item):''}
  function itemDurationMs(item){return Math.max(1,Number(options.itemDurationMs?options.itemDurationMs(item):0)||1)}
  function formatCounter(milliseconds){return (Math.max(0,Number(milliseconds)||0)/1000).toFixed(1).replace('.',',')+' s'}
  function highestPassage(section){
   return (sections()[section]||[]).reduce(function(max,item){return Math.max(max,global.GeraLyrics.maxPassage(item))},0);
  }
  function initialLimit(section){
   const target=options.targetPasses?options.targetPasses(section):1;
   return Math.max(1,highestPassage(section),Math.round(Number(target)||1));
  }
  function ensureLimits(){
   Object.keys(options.sectionLabels).forEach(function(section){
    passageLimits[section]=Math.min(global.GeraLyrics.MAX_PASSAGE,initialLimit(section));
   });
  }
  function renderSectionSelect(){
   const select=element('sequence-lyrics-section');
   if(!select)return;
   select.innerHTML='';
   const order=options.sectionOrder?options.sectionOrder():Object.keys(options.sectionLabels);
   order.forEach(function(section){
    const option=documentRef.createElement('option');
    option.value=section;
    option.textContent=sectionLabel(section)+' · '+(sections()[section]||[]).length+' itens';
    select.appendChild(option);
   });
   select.value=selectedSection;
  }
  function renderPassageSelect(){
   const select=element('sequence-lyrics-passage');
   if(!select)return;
   select.innerHTML='';
   const fallback=documentRef.createElement('option');
   fallback.value='default';
   fallback.textContent='Texto padrão';
   select.appendChild(fallback);
   const limit=passageLimits[selectedSection]||1;
   for(let passage=1;passage<=limit;passage++){
    const option=documentRef.createElement('option');
    option.value=String(passage);
    option.textContent=ordinal(passage);
    select.appendChild(option);
   }
   select.value=String(selectedPassage);
   const remove=element('sequence-lyrics-remove-passage');
   if(remove)remove.disabled=selectedPassage==='default'||limit<=1;
   const duplicate=element('sequence-lyrics-duplicate-previous');
   if(duplicate)duplicate.disabled=selectedPassage==='default'||Number(selectedPassage)<=1;
  }
  function renderTitle(){
   const title=element('sequence-lyrics-section-title');
   const hint=element('sequence-lyrics-passage-hint');
   if(title)title.textContent='Sequência '+sectionLabel(selectedSection);
   if(hint){
   hint.textContent=selectedPassage==='default'
     ?'O texto padrão aparece somente quando não houver texto específico. O atraso é contado desde o início do acorde.'
     :'Cadastre o texto e o atraso da voz na '+ordinal(selectedPassage)+'. Zero inicia junto com o acorde.';
   }
  }
  function renderItems(){
   const container=element('sequence-lyrics-items');
   if(!container)return;
   container.innerHTML='';
   const items=currentItems();
   if(!items.length){
    const empty=documentRef.createElement('div');
    empty.className='sequence-lyrics-empty';
    empty.textContent='A sequência '+sectionLabel(selectedSection)+' está vazia. Grave os acordes antes de cadastrar a letra.';
    container.appendChild(empty);
    return;
   }
   items.forEach(function(item,index){
    const card=documentRef.createElement('div');
    card.className='sequence-lyrics-item';
    const head=documentRef.createElement('span');
    head.className='sequence-lyrics-item-head';
    const position=documentRef.createElement('i');
    position.textContent=String(index+1);
    const name=documentRef.createElement('strong');
    name.textContent=itemLabel(item,index);
    const duration=documentRef.createElement('small');
    duration.textContent=itemDuration(item);
    head.append(position,name,duration);
    const input=documentRef.createElement('textarea');
    input.rows=2;
    input.maxLength=global.GeraLyrics.MAX_TEXT_LENGTH;
    input.placeholder=selectedPassage==='default'?'Texto usado como padrão':'Letra desta passagem';
    input.value=global.GeraLyrics.textForEditor(item,selectedPassage);
    input.dataset.lyricsItemIndex=String(index);
    input.setAttribute('aria-label','Letra de '+itemLabel(item,index));

    const timing=documentRef.createElement('div');
    timing.className='sequence-lyrics-timing';
    const delayLabel=documentRef.createElement('label');
    delayLabel.textContent='Atraso da entrada vocal';
    const delayField=documentRef.createElement('span');
    delayField.className='sequence-lyrics-delay-field';
    const delayInput=documentRef.createElement('input');
    delayInput.type='number';
    delayInput.min='0';
    delayInput.max=String(global.GeraLyrics.MAX_DELAY_MS/1000);
    delayInput.step='0.1';
    delayInput.inputMode='decimal';
    delayInput.value=String(global.GeraLyrics.delayMsForEditor(item,selectedPassage)/1000);
    delayInput.disabled=!input.value;
    delayInput.dataset.lyricsDelayIndex=String(index);
    delayInput.setAttribute('aria-label','Atraso em segundos de '+itemLabel(item,index));
    const delayUnit=documentRef.createElement('span');
    delayUnit.textContent='s';
    delayField.append(delayInput,delayUnit);
    delayLabel.appendChild(delayField);
    const delayHint=documentRef.createElement('small');
    delayHint.textContent='0 = início do acorde';
    timing.append(delayLabel,delayHint);

    const counter=documentRef.createElement('div');
    counter.className='sequence-lyrics-counter';
    counter.dataset.lyricsCounterIndex=String(index);
    const counterHead=documentRef.createElement('div');
    const counterLabel=documentRef.createElement('span');
    counterLabel.textContent='Tempo deste acorde';
    const counterValue=documentRef.createElement('output');
    counterValue.textContent='0,0 s';
    counterValue.dataset.lyricsCounterValue=String(index);
    counterHead.append(counterLabel,counterValue);
    const counterTrack=documentRef.createElement('div');
    counterTrack.className='sequence-lyrics-counter-track';
    const counterFill=documentRef.createElement('span');
    counterFill.className='sequence-lyrics-counter-fill';
    const counterMarker=documentRef.createElement('i');
    counterMarker.className='sequence-lyrics-counter-marker';
    counterTrack.append(counterFill,counterMarker);
    const counterEntry=documentRef.createElement('small');
    counterEntry.dataset.lyricsCounterEntry=String(index);
    counter.append(counterHead,counterTrack,counterEntry);

    input.addEventListener('input',function(){
     global.GeraLyrics.setText(item,selectedPassage,input.value);
     const hasText=!!global.GeraLyrics.textForEditor(item,selectedPassage);
     delayInput.disabled=!hasText;
     if(!hasText)delayInput.value='0';
     syncSummary();
     updateCounterCards(previewLastState);
    });
    delayInput.addEventListener('input',function(){
     const seconds=Number(String(delayInput.value).replace(',','.'));
     global.GeraLyrics.setDelayMs(item,selectedPassage,Number.isFinite(seconds)?seconds*1000:0);
     updateCounterCards(previewLastState);
    });
    card.append(head,input,timing,counter);
    container.appendChild(card);
   });
   updateCounterCards(previewLastState);
  }
  function updateCounterCards(state){
   const items=currentItems();
   const matching=state&&state.section===selectedSection;
   items.forEach(function(item,index){
    const counter=documentRef.querySelector('[data-lyrics-counter-index="'+index+'"]');
    if(!counter)return;
    const value=counter.querySelector('[data-lyrics-counter-value]');
    const entry=counter.querySelector('[data-lyrics-counter-entry]');
    const fill=counter.querySelector('.sequence-lyrics-counter-fill');
    const marker=counter.querySelector('.sequence-lyrics-counter-marker');
    const card=counter.closest('.sequence-lyrics-item');
    const duration=itemDurationMs(item);
    let elapsed=0;
    if(matching){
     if(index<state.index)elapsed=duration;
     else if(index===state.index)elapsed=Math.max(0,Math.min(duration,Number(state.itemElapsedMs)||0));
    }
    const delay=global.GeraLyrics.delayMsForEditor(item,selectedPassage);
    const hasText=!!global.GeraLyrics.textForEditor(item,selectedPassage);
    const progress=Math.max(0,Math.min(100,(elapsed/duration)*100));
    const markerPosition=Math.max(0,Math.min(100,(delay/duration)*100));
    const active=!!(previewActive&&matching&&index===state.index);
    const reached=!!(active&&hasText&&elapsed>=delay);
    if(value)value.textContent=formatCounter(elapsed);
    if(fill)fill.style.width=progress+'%';
    if(marker){marker.style.left=markerPosition+'%';marker.hidden=!hasText}
    if(entry){
     entry.textContent=hasText
      ?'Entrada da letra: '+formatCounter(delay)+(delay>duration?' · após este acorde':'')
      :'Sem letra nesta passagem';
    }
    counter.classList.toggle('delay-beyond',hasText&&delay>duration);
    counter.classList.toggle('entry-reached',reached);
    if(card){
     card.classList.toggle('preview-active',active);
     card.classList.toggle('preview-complete',!!(matching&&index<state.index));
    }
   });
  }
  function lockPreviewSelectors(locked){
   ['sequence-lyrics-section','sequence-lyrics-passage','sequence-lyrics-add-passage','sequence-lyrics-duplicate-previous','sequence-lyrics-remove-passage'].forEach(function(id){
    const control=element(id);
    if(control)control.disabled=!!locked;
   });
  }
  function syncPreviewButton(){
   const button=element('sequence-lyrics-play');
   if(!button)return;
   button.textContent=previewActive?'■ Parar execução':'▶ Executar sequência';
   button.classList.toggle('active',previewActive);
   button.title=previewActive?'Interromper a execução da sequência':'Executar uma vez a sequência selecionada, sem bateria';
  }
  function setPreviewStatus(message,state){
   const status=element('sequence-lyrics-preview-status');
   if(!status)return;
   status.textContent=message||'Pronto para executar';
   status.classList.toggle('playing',state==='playing');
   status.classList.toggle('error',state==='error');
  }
  function updatePreview(){
   if(!previewActive)return;
   const state=options.previewState?options.previewState():null;
   if(!state||!state.active){finishPreview('',false);return}
   previewLastState=state;
   updateCounterCards(state);
   if(state.index<0)setPreviewStatus('Preparando execução…','playing');
   else setPreviewStatus('Executando item '+(state.index+1)+' de '+currentItems().length+' · '+formatCounter(state.itemElapsedMs),'playing');
  }
  function startPreview(){
   if(previewActive){
    if(options.stopPreview)options.stopPreview('Execução interrompida no editor de letras');
    else finishPreview('',false);
    return;
   }
   if(!currentItems().length){
    if(options.emptyPreview)options.emptyPreview(selectedSection);
    setPreviewStatus('A sequência selecionada está vazia','error');
    return;
   }
   previewLastState={section:selectedSection,index:-1,itemElapsedMs:0};
   updateCounterCards(previewLastState);
   setPreviewStatus('Preparando execução…','playing');
   let started=false;
   try{
    started=options.startPreview?options.startPreview(selectedSection,selectedPassage):false;
   }catch(error){
    if(options.previewError)options.previewError(error);
    setPreviewStatus('Não foi possível iniciar a execução','error');
    return;
   }
   if(started===false){setPreviewStatus('A execução não pôde ser iniciada','error');return}
   previewActive=true;
   lockPreviewSelectors(true);
   syncPreviewButton();
   clearInterval(previewTimer);
   previewTimer=setInterval(updatePreview,50);
   updatePreview();
  }
  function finishPreview(message,completed){
   clearInterval(previewTimer);
   previewTimer=null;
   if(completed){
    previewLastState={section:selectedSection,index:currentItems().length,itemElapsedMs:0};
   }
   previewActive=false;
   lockPreviewSelectors(false);
   syncPreviewButton();
   updateCounterCards(previewLastState);
   setPreviewStatus(completed?'Execução concluída':(message?'Execução interrompida':'Pronto para executar'),completed?'':'');
   if(options.previewEnded)options.previewEnded();
  }
  function syncSummary(){
   const summary=element('sequence-lyrics-summary');
   if(!summary)return;
   const items=currentItems();
   const filled=items.filter(function(item){return !!global.GeraLyrics.textForEditor(item,selectedPassage)}).length;
   summary.textContent=selectedPassage==='default'
    ?filled+' de '+items.length+' itens com texto padrão'
    :filled+' de '+items.length+' itens preenchidos na '+ordinal(selectedPassage);
  }
  function render(){
   renderSectionSelect();
   renderPassageSelect();
   renderTitle();
   renderItems();
   syncSummary();
   syncPreviewButton();
  }
  function open(section){
   if(options.canEdit&&!options.canEdit())return false;
   draft=clone(options.getSections());
   selectedSection=options.sectionLabels[section]?section:(options.sectionLabels[options.activeSection()]?options.activeSection():'verse');
   selectedPassage=1;
   passageLimits={};
   ensureLimits();
   render();
   setPreviewStatus('Pronto para executar','');
   const dialog=element('sequence-lyrics-dialog');
   if(dialog&&!dialog.open)dialog.showModal();
   return true;
  }
  function close(){
   if(previewActive&&options.stopPreview)options.stopPreview('Execução interrompida ao fechar as letras');
   clearInterval(previewTimer);
   previewTimer=null;
   previewActive=false;
   draft=null;
   const dialog=element('sequence-lyrics-dialog');
   if(dialog&&dialog.open)dialog.close();
  }
  function save(){
   if(!draft)return;
   if(previewActive&&options.stopPreview)options.stopPreview('Execução interrompida para salvar as letras');
   options.commit(clone(draft));
   close();
  }
  function selectSection(value){
   if(!options.sectionLabels[value])return;
   selectedSection=value;
   selectedPassage=1;
   render();
  }
  function selectPassage(value){
   selectedPassage=value==='default'?'default':Math.max(1,Math.min(global.GeraLyrics.MAX_PASSAGE,Math.round(Number(value)||1)));
   renderPassageSelect();renderTitle();renderItems();syncSummary();
  }
  function addPassage(){
   const next=Math.min(global.GeraLyrics.MAX_PASSAGE,(passageLimits[selectedSection]||1)+1);
   passageLimits[selectedSection]=next;
   selectedPassage=next;
   render();
  }
  async function removePassage(){
   if(selectedPassage==='default')return;
   const passage=Number(selectedPassage);
   const accepted=options.confirmRemove?await options.confirmRemove(passage,sectionLabel(selectedSection)):true;
   if(!accepted)return;
   currentItems().forEach(function(item){global.GeraLyrics.removePassage(item,passage)});
   const limit=Math.max(1,highestPassage(selectedSection),Math.min((passageLimits[selectedSection]||1)-1,passage-1));
   passageLimits[selectedSection]=limit;
   selectedPassage=Math.min(passage,limit);
   render();
  }
  function duplicatePrevious(){
   if(selectedPassage==='default'||Number(selectedPassage)<=1)return;
   const passage=Number(selectedPassage);
   currentItems().forEach(function(item){
    const previousText=global.GeraLyrics.textForEditor(item,passage-1);
    const previousDelay=global.GeraLyrics.delayMsForEditor(item,passage-1);
    global.GeraLyrics.setText(item,passage,previousText);
    global.GeraLyrics.setDelayMs(item,passage,previousDelay);
   });
   renderItems();syncSummary();
  }
  function bind(){
   const openMain=element('sequence-lyrics-open');
   const openRedesign=element('redesign-open-lyrics');
   if(openMain)openMain.onclick=function(){open(options.activeSection())};
   if(openRedesign)openRedesign.onclick=function(){open(options.activeSection())};
   const section=element('sequence-lyrics-section');
   const passage=element('sequence-lyrics-passage');
   const add=element('sequence-lyrics-add-passage');
   const remove=element('sequence-lyrics-remove-passage');
   const duplicate=element('sequence-lyrics-duplicate-previous');
   const play=element('sequence-lyrics-play');
   const saveButton=element('sequence-lyrics-save');
   const cancel=element('sequence-lyrics-cancel');
   const closeButton=element('sequence-lyrics-close');
   const dialog=element('sequence-lyrics-dialog');
   if(section)section.onchange=function(){selectSection(section.value)};
   if(passage)passage.onchange=function(){selectPassage(passage.value)};
   if(add)add.onclick=addPassage;
   if(remove)remove.onclick=removePassage;
   if(duplicate)duplicate.onclick=duplicatePrevious;
   if(play)play.onclick=startPreview;
   if(saveButton)saveButton.onclick=save;
   if(cancel)cancel.onclick=close;
   if(closeButton)closeButton.onclick=close;
   if(dialog)dialog.addEventListener('cancel',function(event){event.preventDefault();close()});
  }

  return Object.freeze({open:open,close:close,bind:bind,finishPreview:finishPreview});
 }

 global.GeraLyricsEditor=Object.freeze({createController:createController});
})(typeof window!=='undefined'?window:globalThis);
