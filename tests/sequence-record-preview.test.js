'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

function extractFunction(name){
 const start=index.indexOf('function '+name+'(');
 assert.ok(start>=0,'função '+name+' ausente');
 const brace=index.indexOf('{',start);
 let depth=0;
 for(let cursor=brace;cursor<index.length;cursor++){
  if(index[cursor]==='{')depth++;
  if(index[cursor]==='}'){
   depth--;
   if(depth===0)return index.slice(start,cursor+1);
  }
 }
 throw new Error('função '+name+' incompleta');
}

function runPreview(previewActive){
 const calls=[];
 const variables=[
  'let sequenceRecordPreviewActive='+previewActive,
  'let sequencePlaying=false',
  'let sequenceStartQueued=false',
  "let activeSequenceSection='verse'",
  'let currentSectionRepetition=7',
  'let sequenceRecording=true',
  'let drumRunning=false',
  'let drumStartQueued=false',
  'let drumFillQueued=true',
  'let drumEndingQueued=true',
  "let sequenceConfiguredActionName='fill'",
  "let sequenceEndActionInProgress='fill'",
  'let drumActionMuteFrom=1',
  'let drumActionMuteUntil=2',
  'let sequenceTimer=null',
  'let queuedSequenceSection=null',
  'let sequenceStopAtEnd=false',
  "let chordMode='together'",
  'let sequencePlaybackOriginalChordMode=null',
  'let sequencePendingTransition=null',
  'let sequenceEighthUnitsRemaining=0',
  'let sequenceIndex=3',
  'let transportRunning=false'
 ].join(';')+';';
 const context={
  calls:calls,
  clearTimeout:function(){},
  stopChordSequence:function(){calls.push('stop')},
  clearSequenceTextPreview:function(){},
  resetSequenceLyricPassages:function(){},
  sequenceAuto:true,
  sequenceAutoEnd:false,
  sectionRepeatValue:function(){calls.push('repeat');return 0},
  configuredSequenceSections:function(){calls.push('configured');return []},
  setStatus:function(message){calls.push('status:'+message)},
  SEQUENCE_SECTION_LABELS:{verse:'A'},
  syncSequenceSectionButtons:function(){},
  renderChordSequence:function(){},
  currentChordSequence:function(){calls.push('items');return[{root:0,type:'major',fraction:1}]},
  syncSequenceRecordButton:function(){},
  stopDrums:function(){},
  stopAccompaniment:function(){calls.push('accompaniment-stop')},
  stopMasterTransport:function(){calls.push('transport-reset')},
  syncDrumActionButtons:function(){},
  syncSequenceDrumButton:function(){},
  applySectionDrumConfig:function(){},
  prepareCompactSequenceCarouselPlayback:function(){},
  clearAccompanimentSchedule:function(){},
  syncSequencePlayButton:function(){},
  syncInstrumentChangeLock:function(){},
  ensureMasterTransport:function(){calls.push('transport')}
 };
 vm.createContext(context);
 vm.runInContext(variables+extractFunction('playChordSequence')+';playChordSequence();calls.push("active:"+activeSequenceSection);calls.push("playing:"+sequencePlaying);',context);
 return calls;
}

test('Testar 1x ignora AUTO com repetição zero e inicia a seção aberta',function(){
 const calls=runPreview(true);
 assert.equal(calls.includes('configured'),false);
 assert.equal(calls.includes('items'),true);
 assert.equal(calls.includes('transport'),true);
 assert.equal(calls.includes('accompaniment-stop'),true);
 assert.equal(calls.includes('transport-reset'),true);
 assert.equal(calls.includes('active:verse'),true);
 assert.equal(calls.includes('playing:true'),true);
});

test('reprodução normal continua respeitando AUTO com repetição zero',function(){
 const calls=runPreview(false);
 assert.equal(calls.includes('configured'),true);
 assert.equal(calls.includes('items'),false);
 assert.equal(calls.includes('transport'),false);
 assert.equal(calls.includes('playing:false'),true);
});

test('versão 3.15.54 contém as guardas da prévia e do roteiro',function(){
 assert.match(index,/if\(!sequenceRecordPreviewActive&&\(typeof playbackPlanRuntimeActive==='undefined'\|\|!playbackPlanRuntimeActive\)&&\(sequenceAuto\|\|sequenceAutoEnd\)&&sectionRepeatValue\(activeSequenceSection\)===0\)/);
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.54';"));
 assert.equal(manifest.version,'3.15.54');
});

test('prévia concluída restaura gravação e o botão Testar 1x',function(){
 const calls=[];
 const button={textContent:'■ Parar',title:'',classList:{add:function(){},remove:function(){calls.push('inactive')}}};
 const dialog={open:true};
 const context={
  calls:calls,
  sequenceRecordPreviewActive:true,
  sequencePlaying:false,
  sequenceStartQueued:false,
  sequencePreviewOwner:'record',
  sequenceRecording:false,
  byId:function(id){if(id==='sequence-record-dialog')return dialog;if(id==='sequence-record-play')return button;return null},
  stopChordSequence:function(message){calls.push('stop:'+message)},
  syncSequenceRecordButton:function(){calls.push('record')},
  renderSequenceRecordExisting:function(){calls.push('render')}
 };
 vm.createContext(context);
 vm.runInContext(extractFunction('syncSequenceRecordPreviewButton')+';'+extractFunction('finishSequenceRecordPreview')+';finishSequenceRecordPreview("fim");calls.push("preview:"+sequenceRecordPreviewActive);calls.push("recording:"+sequenceRecording);',context);
 assert.deepEqual(calls,['stop:fim','record','inactive','render','preview:false','recording:true']);
 assert.equal(button.textContent,'▶ Testar 1x');
});

test('atualização periódica do gravador não encerra a prévia pertencente às letras',function(){
 const button={textContent:'■ Parar',title:'',classList:{add:function(){},remove:function(){}}};
 const context={
  sequencePreviewOwner:'lyrics',
  sequenceRecordPreviewActive:true,
  sequencePlaying:false,
  sequenceStartQueued:false,
  sequenceRecording:false,
  byId:function(id){return id==='sequence-record-play'?button:null},
  syncSequenceRecordButton:function(){}
 };
 vm.createContext(context);
 vm.runInContext(extractFunction('syncSequenceRecordPreviewButton')+';syncSequenceRecordPreviewButton()',context);
 assert.equal(context.sequencePreviewOwner,'lyrics');
 assert.equal(context.sequenceRecordPreviewActive,true);
 assert.equal(button.textContent,'▶ Testar 1x');
});

test('iniciador compartilhado ativa o modo de uma passagem para o editor de letras',function(){
 const calls=[];
 const context={
  sequencePreviewOwner:'',
  sequenceRecordPreviewActive:false,
  sequencePlaybackItemStartedAtMs:90,
  sequencePreviewStartIndex:0,
  sequencePlaying:false,
  sequenceStartQueued:false,
  sequenceRecording:true,
  activeSequenceSection:'verse',
  SEQUENCE_SECTION_LABELS:{verse:'A'},
  currentChordSequence:function(){return[{},{},{},{}]},
  setStatus:function(message){calls.push('status:'+message)},
  syncSequenceRecordButton:function(){calls.push('record')},
  syncSequenceRecordPreviewButton:function(){calls.push('button')},
  byId:function(){return null},
  playChordSequence:function(){calls.push('play:'+context.sequencePreviewOwner);context.sequencePlaying=true;context.sequenceStartQueued=true}
 };
 vm.createContext(context);
 vm.runInContext(extractFunction('startSequencePreviewOnce'),context);
 const started=vm.runInContext("startSequencePreviewOnce('lyrics',2)",context);
 assert.equal(started,true);
 assert.equal(context.sequencePreviewOwner,'lyrics');
 assert.equal(context.sequenceRecordPreviewActive,true);
 assert.equal(context.sequencePlaybackItemStartedAtMs,0);
 assert.equal(context.sequencePreviewStartIndex,2);
 assert.equal(context.sequenceRecording,true);
 assert.deepEqual(calls,['play:lyrics']);
});

test('transporte da prévia pode começar diretamente em qualquer item',function(){
 const calls=[];
 const context={
  sequenceRecordPreviewActive:true,
  sequencePreviewStartIndex:3,
  sequenceIndex:-1,
  currentChordSequence:function(){return[{},{},{},{},{}]},
  loadSequenceItem:function(index,time){calls.push([index,time]);context.sequenceIndex=index;return true}
 };
 vm.createContext(context);
 vm.runInContext(extractFunction('loadSequenceTransportItem'),context);
 const started=vm.runInContext('loadSequenceTransportItem(0,1.25)',context);
 assert.equal(started,true);
 assert.deepEqual(calls,[[3,1.25]]);
 assert.equal(context.sequencePreviewStartIndex,0);
 assert.equal(context.sequenceIndex,3);
});
