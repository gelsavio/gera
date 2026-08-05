/*
 * Núcleo fixo do áudio do GERA.
 * Responsabilidade: criar/retomar o AudioContext e montar, uma única vez,
 * os barramentos, ganhos, compressores, filtros e limiter já usados pelo legado.
 * Não cria vozes, instrumentos ou samples e não inicia áudio no carregamento.
 */
'use strict';

let audioCtx;
let masterGain;
let limiter;
let appMuteGain;
let drumBus;
let drumCompressor;
let bassBus;
let bassCompressor;
let bassHighpass;
let bassLowShelf;
let bassPresence;

function ensureAudio(){
 if(!audioCtx){
  audioCtx=new(AudioContext||webkitAudioContext)({latencyHint:'interactive'});
  masterGain=audioCtx.createGain();
  limiter=audioCtx.createDynamicsCompressor();

  drumBus=audioCtx.createGain();
  drumCompressor=audioCtx.createDynamicsCompressor();
  drumCompressor.threshold.value=-18;
  drumCompressor.knee.value=18;
  drumCompressor.ratio.value=4;
  drumCompressor.attack.value=.006;
  drumCompressor.release.value=.16;
  drumBus.gain.value=Number($('drum-volume').value)/100;
  drumBus.connect(drumCompressor);
  drumCompressor.connect(masterGain);

  /*
   Barramento exclusivo do baixo automático.
   O baixo não passa pela normalização RMS dos acordes.
  */
  bassBus=audioCtx.createGain();
  bassHighpass=audioCtx.createBiquadFilter();
  bassLowShelf=audioCtx.createBiquadFilter();
  bassPresence=audioCtx.createBiquadFilter();
  bassCompressor=audioCtx.createDynamicsCompressor();

  bassBus.gain.value=1.26;
  bassHighpass.type='highpass';
  bassHighpass.frequency.value=34;
  bassHighpass.Q.value=.7;

  bassLowShelf.type='lowshelf';
  bassLowShelf.frequency.value=125;
  bassLowShelf.gain.value=5.5;

  bassPresence.type='peaking';
  bassPresence.frequency.value=820;
  bassPresence.Q.value=1.05;
  bassPresence.gain.value=5.5;

  bassCompressor.threshold.value=-24;
  bassCompressor.knee.value=14;
  bassCompressor.ratio.value=4;
  bassCompressor.attack.value=.006;
  bassCompressor.release.value=.2;

  bassBus.connect(bassHighpass);
  bassHighpass.connect(bassLowShelf);
  bassLowShelf.connect(bassPresence);
  bassPresence.connect(bassCompressor);
  bassCompressor.connect(masterGain);

  limiter.threshold.value=-10;
  limiter.knee.value=10;
  limiter.ratio.value=12;
  limiter.attack.value=.003;
  limiter.release.value=.18;

  masterGain.gain.value=+$('master-volume').value/100;
  appMuteGain=audioCtx.createGain();
  appMuteGain.gain.value=globalAudioMuted?0:1;
  masterGain.connect(limiter);
  limiter.connect(appMuteGain);
  appMuteGain.connect(audioCtx.destination);
 }
 if(audioCtx.state==='suspended')audioCtx.resume();
}
