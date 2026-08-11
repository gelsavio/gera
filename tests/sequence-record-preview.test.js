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

test('versão 3.15.33 contém a guarda específica da prévia',function(){
 assert.match(index,/if\(!sequenceRecordPreviewActive&&\(sequenceAuto\|\|sequenceAutoEnd\)&&sectionRepeatValue\(activeSequenceSection\)===0\)/);
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.33';"));
 assert.equal(manifest.version,'3.15.33');
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
