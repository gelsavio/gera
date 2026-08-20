/**
 * Consumidor visual do estado do transporte do GERA.
 * Não mantém estado musical, não agenda pulsos e não recria elementos do DOM.
 */
(function(global){
 'use strict';

 function createConsumer(options){
  const getElement=options.getElement;
  const getSnapshot=options.getSnapshot;
  const syncListControls=options.syncListControls||function(){};
  const renderCarousel=options.renderCarousel||function(){};

  function element(id){return getElement(id)}
  function snapshot(){return getSnapshot()}

  function sequenceItemUnits(item){
   const fraction=Number(item&&item.fraction);
   if(!Number.isFinite(fraction)||fraction<=0)return 8;
   return Math.max(1,Math.round(fraction*8));
  }
  function sequenceTotalUnits(section,state){
   const current=state||snapshot();
   const items=Array.isArray(current.sequenceSections[section])?current.sequenceSections[section]:[];
   return items.reduce(function(total,item){return total+sequenceItemUnits(item)},0);
  }
  function sequenceRemainingUnits(section,state){
   const current=state||snapshot();
   const items=Array.isArray(current.sequenceSections[section])?current.sequenceSections[section]:[];
   const total=sequenceTotalUnits(section,current);
   if(!current.sequencePlaying||section!==current.activeSequenceSection)return total;
   if(current.sequenceIndex<0)return total;
   let remaining=Math.max(0,Number(current.sequenceEighthUnitsRemaining)||0);
   for(let index=current.sequenceIndex+1;index<items.length;index++)remaining+=sequenceItemUnits(items[index]);
   if(current.sequenceHoldLoop)return remaining;
   const configured=Math.max(1,current.sectionRepeatValue(section));
   const remainingPasses=Math.max(0,configured-current.currentSectionRepetition);
   return remaining+(remainingPasses*total);
  }
  function formatSequenceCountdown(units,state){
   const current=state||snapshot();
   const seconds=Math.max(0,Math.ceil((units*current.barDuration())/8000));
   const minutes=Math.floor(seconds/60);
   const remainder=seconds%60;
   return String(minutes).padStart(2,'0')+':'+String(remainder).padStart(2,'0');
  }
  function syncCompactControls(){
   const state=snapshot();
   const capo=element('compact-capo-value');
   const oct=element('compact-octave-value');
   const loop=element('compact-loop');
   const play=element('compact-play');
   const sequenceOnly=element('compact-sequence-only');
   const drum=element('compact-drum-only');
   const current=element('compact-current-song');
   const selectedSong=element('compact-selected-song');
   if(capo)capo.textContent=state.capoSemitones>0?'+'+state.capoSemitones:String(state.capoSemitones);
   if(oct)oct.textContent=state.octave>0?'+'+state.octave:String(state.octave);
   if(loop){
    loop.classList.toggle('active',state.sequenceHoldLoop);
    loop.textContent=state.sequenceHoldLoop?'🔁 Sequência em loop':'🔁 Sequência atual';
   }
   const musicActive=state.sequencePlaying||state.sequenceStartQueued;
   const drumsActive=state.drumRunning||state.drumStartQueued;
   const anyTransportActive=musicActive||drumsActive;
   if(play){
    play.classList.toggle('active',anyTransportActive);
    play.setAttribute('aria-pressed',String(anyTransportActive));
    play.textContent=anyTransportActive?'■ Parar Música + Bateria':'▶ Música + Bateria';
   }
   if(sequenceOnly){
    sequenceOnly.classList.toggle('active',musicActive);
    sequenceOnly.setAttribute('aria-pressed',String(musicActive));
    sequenceOnly.textContent=musicActive?'■ Parar Música':'🎼 Só Música';
   }
   if(drum){
    drum.classList.toggle('active',drumsActive);
    drum.setAttribute('aria-pressed',String(drumsActive));
    drum.textContent=drumsActive?'■ Parar Bateria':'🥁 Só Bateria';
   }
   if(selectedSong)selectedSong.textContent=state.currentSongName||'Nenhuma música selecionada';
   if(current){
    current.textContent=state.currentSongName
     ?state.sectionLabels[state.activeSequenceSection]+' · '+state.bpm+' BPM'
     :'Nenhuma música carregada';
   }
   syncListControls();
   renderCarousel();
  }
  function updateReadouts(){
   const state=snapshot();
   const songName=element('redesign-song-name');
   const bpmTop=element('redesign-bpm-readout');
   const bpmBottom=element('redesign-mixer-bpm');
   const play=element('redesign-play');
   const playLoop=element('redesign-play-loop');
   const currentLoop=element('redesign-current-loop');
   const statusTarget=element('redesign-status');
   const voices=element('redesign-voices-volume');
   const drums=element('redesign-drums-volume');
   if(songName)songName.textContent=String(state.currentSongName||'Nenhuma música');
   if(bpmTop)bpmTop.textContent=String(state.bpm);
   if(bpmBottom)bpmBottom.textContent=String(state.bpm);
   if(play){
    play.textContent='▶';
    play.classList.toggle('active',state.sequencePlaying);
    play.setAttribute('aria-pressed',String(state.sequencePlaying));
    play.title=state.sequencePlaying?'Música em execução':'Iniciar a música usando a preferência de término atual';
   }
   if(playLoop){
    playLoop.textContent='↻';
    playLoop.classList.toggle('active',state.sequenceAuto&&!state.sequenceAutoEnd);
    playLoop.setAttribute('aria-pressed',String(state.sequenceAuto&&!state.sequenceAutoEnd));
    playLoop.title=state.sequenceAuto
     ?'AUTO LOOP ligado: ao final, retorna ao começo. Clique para parar no fim'
     :'AUTO LOOP desligado: ao final, para. Clique para repetir desde o começo';
   }
   if(currentLoop){
    currentLoop.textContent='🔁';
    currentLoop.classList.toggle('active',state.sequenceHoldLoop);
    currentLoop.setAttribute('aria-pressed',String(state.sequenceHoldLoop));
    currentLoop.title=state.sequenceHoldLoop
     ?'Liberar a sequência atual e continuar a progressão'
     :'Manter somente a sequência atual em loop';
   }
   if(voices)voices.value=String(Math.round((state.keyboardVolume+state.chordVolume+state.bassVolume)/3));
   if(drums)drums.value=String(state.drumVolume);
   if(statusTarget)statusTarget.textContent=state.statusText;
  }
  function syncCompactSequenceCountdown(){
   const state=snapshot();
   const countdown=element('compact-seq-countdown');
   const label=element('compact-seq-countdown-label');
   const value=element('compact-seq-countdown-value');
   if(!countdown||!label||!value)return;
   const active=state.sequencePlaying||state.sequenceStartQueued;
   countdown.hidden=!active;
   if(!active)return;
   label.textContent='Restante · '+(state.sectionLabels[state.activeSequenceSection]||('Sequência '+state.activeSequenceSection));
   value.textContent=formatSequenceCountdown(sequenceRemainingUnits(state.activeSequenceSection,state),state);
  }

  return Object.freeze({
   syncCompactControls:syncCompactControls,
   updateReadouts:updateReadouts,
   syncCompactSequenceCountdown:syncCompactSequenceCountdown,
   sequenceItemUnits:sequenceItemUnits,
   sequenceTotalUnits:sequenceTotalUnits,
   sequenceRemainingUnits:sequenceRemainingUnits,
   formatSequenceCountdown:formatSequenceCountdown
  });
 }

 global.GeraTransportStatus=Object.freeze({createConsumer:createConsumer});
})(window);
