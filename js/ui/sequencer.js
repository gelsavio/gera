/*
 * GERA — interface do sequenciador.
 * Etapa 8F: concentra ligações e estados visuais sem decidir áudio ou transporte.
 */
(function(global){
 'use strict';

 function createController(options){
  const documentRef=options.document||global.document;
  const element=options.getElement;

  function syncRepeatInputs(repeatValue){
   documentRef.querySelectorAll('[data-section-repeat-display]').forEach(function(display){
    const section=display.dataset.sectionRepeatDisplay;
    const value=repeatValue(section);
    display.textContent=String(value);
    display.title=value===0?'Fora do modo Auto':value+' repetições';
   });
  }
  function syncHoldLoop(active){
   const button=element('sequence-hold-loop');
   if(!button)return;
   button.classList.toggle('active',active);
   button.textContent=active?'🔁 Em Loop':'🔁 Pôr em Loop';
   button.title=active?'Clique para liberar a progressão':'Manter a seção atual em repetição';
  }
  function syncAuto(auto,autoEnd){
   const loopButton=element('sequence-auto');
   const endButton=element('sequence-auto-end');
   if(loopButton){
    loopButton.classList.toggle('active',auto);
    loopButton.textContent=auto?'Auto ✓':'Auto';
    loopButton.title=auto
     ?'Auto contínuo ligado: ao final volta para a primeira sequência'
     :'Ligar execução automática contínua';
   }
   if(endButton){
    endButton.classList.toggle('active',autoEnd);
    endButton.textContent=autoEnd?'Auto Fim ✓':'Auto Fim';
    endButton.title=autoEnd
     ?'Auto Fim ligado: executa uma vez e encerra na última sequência'
     :'Executar a música uma vez e encerrar com virada de bateria';
   }
  }
  function syncPanelVisibility(visible){
   const panel=element('sequence-panel');
   const button=element('sequence-toggle');
   if(!panel||!button)return;
   panel.classList.toggle('sequence-hidden',!visible);
   button.classList.toggle('sequence-toggle-active',visible);
   button.title=visible?'Ocultar barra de sequências':'Mostrar barra de sequências';
  }
  function syncRecordButton(recording){
   const button=element('sequence-record');
   if(!button)return;
   button.classList.toggle('sequence-recording',recording);
   button.textContent=recording?'■ Gravando':'● Gravar';
  }
  function syncPauseButton(state){
   const button=element('sequence-rest');
   if(!button)return;
   button.textContent='⏸ Pausa '+state.fractionLabel;
   button.disabled=state.fraction===0;
   button.title=state.fraction===0
    ?'Selecione um tempo de ⅛ a 1 para adicionar uma pausa'
    :'Adicionar pausa de '+state.durationLabel;
  }
  function syncPlayButton(playing){
   const button=element('sequence-play');
   if(!button)return;
   button.classList.toggle('sequence-play-active',playing);
   button.classList.remove('sequence-stop-pending');
   button.textContent=playing?'⏹ Parar Sequência':'▶ Tocar Sequência';
   button.title=playing?'Parar imediatamente a sequência em execução':'Reproduzir a sequência selecionada';
   button.setAttribute('aria-pressed',String(playing));
  }
  function syncDrumButton(active){
   const button=element('sequence-stop-drums');
   if(!button)return;
   button.classList.toggle('sequence-drums-active',active);
   button.textContent='🥁';
   button.setAttribute('aria-label',active?'Parar bateria':'Iniciar bateria');
   button.setAttribute('aria-pressed',String(active));
   button.title=active?'Parar somente a bateria':'Iniciar a bateria configurada para a sequência selecionada';
  }
  function syncSectionButtons(state){
   documentRef.querySelectorAll('[data-sequence-section]').forEach(function(button){
    const key=button.dataset.sequenceSection;
    button.classList.toggle('active-section',key===state.activeSection);
    button.classList.toggle('queued-section',state.playing&&key===state.queuedSection);
    button.classList.toggle('has-content',state.hasContent(key));
    button.setAttribute('aria-label',state.labels[key]+(state.playing&&key===state.queuedSection?' — próxima seção':''));
   });
   documentRef.querySelectorAll('[data-section-control]').forEach(function(control){
    control.classList.toggle('playing-repeat',state.playing&&control.dataset.sectionControl===state.activeSection);
   });
  }
  function bindMainControls(){
   documentRef.querySelectorAll('[data-sequence-section]').forEach(function(button){
    button.onclick=function(){options.selectSection(button.dataset.sequenceSection)};
   });
   documentRef.querySelectorAll('[data-repeat-adjust]').forEach(function(button){
    button.onclick=function(){options.adjustRepeat(button.dataset.repeatAdjust,Number(button.dataset.delta))};
   });
   element('sequence-rest').onclick=function(){options.addPause()};
   element('sequence-play').onclick=function(){options.togglePlayback()};
   element('sequence-hold-loop').onclick=function(){options.toggleHoldLoop()};
   element('section-instrument').onchange=function(){options.saveSectionControls()};
   element('section-next').onchange=function(){options.saveSectionControls()};
   element('section-drum-pattern').onchange=function(){options.changeSectionPattern(this.value)};
   element('section-drum-entry').onchange=function(){options.saveSectionControls()};
   element('section-drum-exit').onchange=function(){options.saveSectionControls()};
   element('section-drum-final').onchange=function(){options.saveSectionControls()};
   element('sequence-stop-drums').onclick=function(){options.toggleDrums()};
   element('sequence-auto').onclick=function(){options.toggleAuto()};
   element('sequence-auto-end').onclick=function(){options.toggleAutoEnd()};
   element('sequence-clear').onclick=function(){options.deleteLast()};
   const clearAll=element('sequence-clear-all');
   if(clearAll)clearAll.onclick=function(){options.clearAll()};
   element('sequence-toggle').onclick=function(){options.togglePanel()};
  }
  function bindItemEditor(){
   const kind=element('sequence-edit-kind');
   const before=element('sequence-edit-before');
   const replace=element('sequence-edit-replace');
   const after=element('sequence-edit-after');
   const remove=element('sequence-edit-delete');
   const cancel=element('sequence-edit-cancel');
   const close=element('sequence-edit-close');
   const dialog=element('sequence-editor-dialog');
   if(kind)kind.onchange=function(){options.syncEditorKind()};
   if(before)before.onclick=function(){options.commitEditor('before');options.closeEditor()};
   if(replace)replace.onclick=function(){options.commitEditor('replace');options.closeEditor()};
   if(after)after.onclick=function(){options.commitEditor('after');options.closeEditor()};
   if(remove)remove.onclick=async function(){if(await options.confirmDelete())options.commitEditor('delete')};
   if(cancel)cancel.onclick=function(){options.closeEditor()};
   if(close)close.onclick=function(){options.closeEditor()};
   if(dialog)dialog.addEventListener('cancel',function(event){event.preventDefault();options.closeEditor()});
  }
  function bindOrganizer(){
   const open=element('sequence-organize-open');
   const close=element('sequence-organize-close');
   const done=element('sequence-organize-done');
   const reset=element('sequence-order-reset');
   const dialog=element('sequence-organize-dialog');
   if(open)open.onclick=function(){options.openOrganizer()};
   if(close)close.onclick=function(){dialog.close()};
   if(done)done.onclick=function(){dialog.close();options.organizerDone()};
   if(reset)reset.onclick=function(){options.resetOrder()};
   if(dialog)dialog.addEventListener('cancel',function(event){event.preventDefault();dialog.close()});
  }
  function bindRecordDialog(){
   const dialog=element('sequence-record-dialog');
   if(!dialog)return;
   const recordButton=element('sequence-record');
   if(recordButton){
    recordButton.onclick=null;
    recordButton.addEventListener('click',function(event){
     event.preventDefault();
     event.stopPropagation();
     options.openRecordDialog();
    });
   }
   element('sequence-record-close').onclick=function(){options.cancelRecordDialog()};
   element('sequence-record-cancel').onclick=function(){options.cancelRecordDialog()};
   element('sequence-record-done').onclick=function(){options.finishRecordDialog()};
   element('sequence-record-play').onclick=function(){options.toggleRecordPreview()};
   element('sequence-record-section-select').onchange=function(){options.selectRecordSection(this.value)};
   documentRef.querySelectorAll('[data-record-fraction]').forEach(function(button){
    button.onclick=function(){options.selectRecordFraction(Number(button.dataset.recordFraction))};
   });
   element('sequence-record-pause').onclick=function(){options.addRecordPause()};
   element('sequence-record-undo').onclick=function(){options.undoRecordItem()};
   element('sequence-record-clear-all').onclick=function(){options.clearRecordItems()};
   dialog.addEventListener('close',function(){options.recordDialogClosed()});
   dialog.addEventListener('cancel',function(event){event.preventDefault();options.cancelRecordDialog()});
   dialog.addEventListener('pointerup',function(event){options.finishRecordPointer(event)});
   dialog.addEventListener('pointercancel',function(event){options.finishRecordPointer(event)});
   const editorDialog=element('sequence-editor-dialog');
   if(editorDialog&&editorDialog.dataset.recordRefreshBound!=='true'){
    editorDialog.dataset.recordRefreshBound='true';
    editorDialog.addEventListener('close',function(){options.refreshRecordAfterEditor()});
   }
  }

  return Object.freeze({
   bindMainControls:bindMainControls,
   bindItemEditor:bindItemEditor,
   bindOrganizer:bindOrganizer,
   bindRecordDialog:bindRecordDialog,
   syncRepeatInputs:syncRepeatInputs,
   syncHoldLoop:syncHoldLoop,
   syncAuto:syncAuto,
   syncPanelVisibility:syncPanelVisibility,
   syncRecordButton:syncRecordButton,
   syncPauseButton:syncPauseButton,
   syncPlayButton:syncPlayButton,
   syncDrumButton:syncDrumButton,
   syncSectionButtons:syncSectionButtons
  });
 }

 global.GeraSequencerUI=Object.freeze({createController:createController});
})(typeof window!=='undefined'?window:globalThis);
