/*
 * GERA — interface da bateria.
 * Etapa 8E: concentra ligações e estados visuais sem decidir áudio ou transporte.
 */
(function(global){
 'use strict';

 function createController(options){
  const documentRef=options.document||global.document;
  const element=options.getElement;

  function status(message){
   const output=element('drum-status');
   if(output)output.textContent=message;
  }
  function syncActionButtons(state){
   const fill=element('drum-fill');
   const ending=element('drum-ending');
   const blocked=state.blocked===true;
   if(fill){
    fill.disabled=blocked;
    fill.title=blocked?'Viradas não estão disponíveis em ritmos 3/4':'Virada';
    fill.classList.toggle('active',!blocked&&state.fillActive===true);
   }
   if(ending){
    ending.disabled=blocked;
    ending.title=blocked?'Encerramentos não estão disponíveis em ritmos 3/4':'Encerramento';
    ending.classList.toggle('active',!blocked&&state.endingActive===true);
   }
  }
  function selectPattern(pattern,message){
   documentRef.querySelectorAll('.drum-pattern').forEach(function(button){
    button.classList.toggle('active',button.dataset.pattern===pattern);
   });
   const select=element('drum-pattern-select');
   if(select)select.value=pattern;
   if(message!==undefined)status(message);
  }
  function clearPatternSelection(message){
   documentRef.querySelectorAll('.drum-pattern').forEach(function(button){
    button.classList.remove('active');
   });
   const stop=element('drum-stop');
   if(stop)stop.classList.remove('active');
   if(message!==undefined)status(message);
  }
  function markStarted(message){
   const stop=element('drum-stop');
   if(stop)stop.classList.add('active');
   status(message);
  }
  function syncMetronome(active){
   const button=element('metronome-toggle');
   if(!button)return;
   button.classList.toggle('active',active);
   button.textContent=active?'■ Parar':'▶ Iniciar';
   button.title=active?'Parar metrônomo':'Iniciar metrônomo';
   button.setAttribute('aria-label',button.title);
   button.setAttribute('aria-pressed',String(active));
  }
  function setPanelMode(active){
   const toggle=element('drum-toggle');
   const panel=element('drum-panel');
   toggle.classList.toggle('drum-mode-active',active);
   panel.classList.toggle('visible',active);
   toggle.textContent='🥁';
   toggle.setAttribute('aria-pressed',String(active));
  }
  function setManualMode(active,circleEnabled){
   const manual=element('drum-manual');
   manual.classList.toggle('active',active);
   manual.textContent=active?'L':'M';
   manual.title=active?'Voltar ao modo Loop':'Modo Manual';
   manual.setAttribute('aria-label',manual.title);
   element('manual-drum-stage').classList.toggle('visible',active);
   documentRef.querySelector('.chord-section').classList.toggle('manual-drums',active);
   element('normal-chord-group').classList.toggle('hidden',active||circleEnabled);
   element('circle-main-wrap').classList.toggle('visible',!active&&circleEnabled);
   element('secondary-dominants-wrap').classList.toggle('visible',!active&&circleEnabled);
   status(active?'Modo manual: toque nos pads grandes.':'Modo loop');
  }
  function bindControls(){
   element('drum-toggle').onclick=function(){options.togglePanel()};
   documentRef.querySelectorAll('.manual-drum-pad').forEach(function(button){
    button.addEventListener('pointerdown',function(event){
     event.preventDefault();
     options.playManualDrum(button.dataset.drum);
    },{passive:false});
    button.addEventListener('click',function(event){event.preventDefault()});
   });
   documentRef.querySelectorAll('[data-layer]').forEach(function(button){
    button.onclick=function(){
     const name=button.dataset.layer;
     const enabled=options.toggleLayer(name);
     button.classList.toggle('layer-on',enabled);
     const label=name==='kick'?'Bumbo':name==='snare'?'Caixa':'Chimbal';
     status(label+' programado '+(enabled?'ligado':'silenciado'));
    };
   });
   documentRef.querySelectorAll('.drum-pattern').forEach(function(button){
    button.onclick=function(){options.startPattern(button.dataset.pattern)};
   });
   const patternSelect=element('drum-pattern-select');
   if(patternSelect)patternSelect.onchange=function(){options.startPattern(this.value)};
   element('drum-fill').onclick=function(){options.requestAction('fill')};
   element('drum-ending').onclick=function(){options.requestAction('ending')};
   element('drum-stop').onclick=function(){options.stopDrums()};
   element('drum-manual').onclick=function(){options.toggleManual()};
   element('drum-engine').onchange=function(event){options.changeEngine(event.target.value)};
   element('metronome-toggle').onclick=function(){options.toggleMetronome()};
  }

  return Object.freeze({
   bindControls:bindControls,
   syncActionButtons:syncActionButtons,
   selectPattern:selectPattern,
   clearPatternSelection:clearPatternSelection,
   markStarted:markStarted,
   syncMetronome:syncMetronome,
   setPanelMode:setPanelMode,
   setManualMode:setManualMode,
   setStatus:status
  });
 }

 global.GeraDrumsUI=Object.freeze({createController:createController});
})(typeof window!=='undefined'?window:globalThis);
