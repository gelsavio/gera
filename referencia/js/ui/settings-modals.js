/*
 * GERA — interface de configurações e modais gerais.
 * Etapa 8H: concentra ligações visuais sem decidir áudio, transporte ou persistência.
 */
(function(global){
 'use strict';

 function createController(options){
  const documentRef=options.document||global.document;
  const element=options.getElement;
  let bpmEditingValue=String(options.getBpm());

  function clampFineInput(input){
   const min=Number(input.min),max=Number(input.max);
   let value=Number(input.value);
   if(!Number.isFinite(value))value=Number(input.defaultValue||min||0);
   value=Math.min(max,Math.max(min,value));
   input.value=value;
   return value;
  }

  function commitTypedBpm(){
   const input=element('bpm');
   const raw=input.value.trim();
   let value=Number(raw);
   if(raw===''||!Number.isFinite(value))value=Number(bpmEditingValue);
   if(!Number.isFinite(value))value=options.getBpm();
   value=Math.round(Math.min(220,Math.max(40,value)));
   input.value=String(value);
   bpmEditingValue=String(value);
   options.requestBpmChange(value);
  }

  function bindRangeControls(){
   const ids=['release','attack','arp-interval','master-volume','drum-volume','keyboard-volume','chord-volume','bass-volume'];
   ids.forEach(function(id){element(id).addEventListener('input',options.updateRanges)});
   ids.forEach(function(id){
    const input=element(id);
    input.addEventListener('change',function(){clampFineInput(input);options.updateRanges()});
    input.addEventListener('blur',function(){clampFineInput(input);options.updateRanges()});
   });
  }

  function bindBpmControl(){
   const input=element('bpm');
   if(!input)return;
   input.addEventListener('focus',function(){
    bpmEditingValue=this.value;
    try{this.select()}catch(error){}
   });
   input.addEventListener('input',function(){
    const raw=this.value.trim();
    if(raw===''){element('bpm-value').textContent='Digite o BPM';return}
    if(!/^\d{1,3}$/.test(raw)){element('bpm-value').textContent='BPM inválido';return}
    element('bpm-value').textContent=Number(raw)+' BPM';
   });
   input.addEventListener('change',commitTypedBpm);
   input.addEventListener('blur',commitTypedBpm);
   input.addEventListener('keydown',function(event){
    if(event.key==='Enter'){
     event.preventDefault();
     commitTypedBpm();
     this.blur();
    }
   });
  }

  function bindFineButtons(){
   documentRef.querySelectorAll('.fine-btn').forEach(function(button){
    button.addEventListener('click',function(){
     const input=element(button.dataset.stepTarget);
     if(!input)return;
     const step=Number(input.step)||1;
     const direction=Number(button.dataset.direction)||1;
     if(input.id==='bpm'){
      let current=Number(input.value);
      if(!Number.isFinite(current))current=options.getBpm();
      current=Math.round(Math.min(220,Math.max(40,current+step*direction)));
      input.value=String(current);
      bpmEditingValue=String(current);
      options.requestBpmChange(current);
      return;
     }
     clampFineInput(input);
     input.value=Number(input.value)+step*direction;
     clampFineInput(input);
     input.dispatchEvent(new global.Event('input',{bubbles:true}));
    });
   });
  }

  function bindSettingsControls(){
   element('instrument').onchange=function(event){options.changeInstrument(event)};
   element('oct-down').onclick=function(){options.adjustOctave(-1)};
   element('oct-up').onclick=function(){options.adjustOctave(1)};
   element('capo-down').onclick=function(){options.adjustCapo(-1)};
   element('capo-label').onclick=function(){options.resetCapo()};
   element('capo-up').onclick=function(){options.adjustCapo(1)};
   element('sustain-pressed').onclick=function(){options.selectSustainMode('pressed')};
   element('sustain-hold').onclick=function(){options.selectSustainMode('hold')};
   element('sustain-next').onclick=function(){options.selectSustainMode('next')};
   element('chord-together').onclick=function(){options.selectChordMode('together')};
   element('chord-arpeggio').onclick=function(){options.selectChordMode('arpeggio')};
   element('arpeggio-pattern').onchange=function(){options.changeArpeggioPattern(this)};
   element('inversion').onchange=function(){options.changeInversion(this)};
   element('rhythm-pattern').onchange=function(){options.changeRhythmPattern(this)};
   element('split-toggle').onclick=function(){options.toggleSplit()};
   element('split-instrument').onchange=function(){options.changeSplitInstrument(this)};
   element('velocity-toggle').onclick=function(){options.toggleVelocity()};
   element('gliss-toggle').onclick=function(){options.toggleGlissando()};
   element('latch-toggle').onclick=function(){options.toggleLatch()};
   element('bass-toggle').onclick=function(){options.toggleBass()};
   element('change-zero').onclick=function(){options.selectChordChangeMode('immediate')};
   element('change-eighth').onclick=function(){options.selectChordChangeMode('eighthBar')};
   element('change-quarter').onclick=function(){options.selectChordChangeMode('quarterBar')};
   element('change-half').onclick=function(){options.selectChordChangeMode('halfBar')};
   element('change-three-quarter').onclick=function(){options.selectChordChangeMode('threeQuarterBar')};
   element('change-full').onclick=function(){options.selectChordChangeMode('nextBar')};
  }

  function bindMemoryControls(){
   element('save-settings').onclick=function(){options.toggleSaveMode()};
   documentRef.querySelectorAll('.memory-button').forEach(function(button){
    button.onclick=function(){options.handleMemoryButton(button)};
   });
  }

  function bindGeneralControls(){
   element('advanced-toggle').onclick=function(){options.toggleAdvanced()};
   element('fullscreen').onclick=function(){options.toggleFullscreen()};
   element('stop-accompaniments').onclick=function(){options.stopAccompaniments()};
   documentRef.addEventListener('contextmenu',function(event){
    if(event.target.closest('.key,.chord'))event.preventDefault();
   });
   const mute=element('global-mute-float');
   if(mute)mute.onclick=function(){options.toggleGlobalMute()};
  }

  function bindConfirmDialog(){
   const ok=element('app-confirm-ok');
   const cancel=element('app-confirm-cancel');
   const dialog=element('app-confirm-dialog');
   if(ok)ok.onclick=function(){options.closeConfirm(true)};
   if(cancel)cancel.onclick=function(){options.closeConfirm(false)};
   if(dialog)dialog.addEventListener('cancel',function(event){event.preventDefault();options.closeConfirm(false)});
  }

  function bind(){
   bindRangeControls();
   bindBpmControl();
   bindFineButtons();
   bindSettingsControls();
   bindMemoryControls();
   bindGeneralControls();
   bindConfirmDialog();
  }

  return Object.freeze({
   clampFineInput:clampFineInput,
   commitTypedBpm:commitTypedBpm,
   bindRangeControls:bindRangeControls,
   bindBpmControl:bindBpmControl,
   bindFineButtons:bindFineButtons,
   bindSettingsControls:bindSettingsControls,
   bindMemoryControls:bindMemoryControls,
   bindGeneralControls:bindGeneralControls,
   bindConfirmDialog:bindConfirmDialog,
   bind:bind
  });
 }

 global.GeraSettingsModalsUI=Object.freeze({createController:createController});
})(typeof window!=='undefined'?window:globalThis);
