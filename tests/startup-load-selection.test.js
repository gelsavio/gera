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
  else if(index[cursor]==='}'&&--depth===0)return index.slice(start,cursor+1);
 }
 throw new Error('função '+name+' incompleta');
}

test('espaço vazio de abertura encerra a inicialização sem falsa alteração pendente',function(){
 const calls=[];
 const noOp=function(){};
 const context={
  sequenceSections:{verse:[1],prechorus:[1]},sequenceRepeats:{verse:2,prechorus:3},
  sequenceIndex:4,sequenceEighthUnitsRemaining:2,sequenceContinuousItem:true,sequenceStartQueued:true,
  sequencePlaying:true,sequenceRecording:true,sequenceStopAtEnd:true,sequenceHoldLoop:true,sequenceAuto:false,
  sequenceGroup:{enabled:true},sequenceGroupPass:3,playbackPlan:{enabled:true},sequenceAutoEnd:true,
  sequenceOrder:['prechorus','verse'],currentSectionRepetition:8,sequencePendingTransition:{},
  sequenceEndActionInProgress:'fill',sequenceConfiguredActionName:'fill',currentSongName:'Anterior',
  songAutosaveTimer:123,songSaveDirty:true,lastSongSavedSignature:'anterior',
  SEQUENCE_SECTION_LABELS:{verse:'A',prechorus:'B'},
  normalizedSequenceGroup:function(){return {enabled:false}},normalizedPlaybackPlan:function(){return {enabled:false,blocks:[]}},
  resetPlaybackPlanRuntime:noOp,GeraStorage:{sequences:{removeStores:function(){calls.push('remove')}}},
  syncSequenceRecordButton:noOp,syncSequenceHoldLoopButton:noOp,syncSequencePlayButton:noOp,
  syncSequenceDrumButton:noOp,syncSequenceRepeatInputs:noOp,syncSequenceSectionButtons:noOp,
  syncSequenceAutoButton:noOp,syncSectionDrumControls:noOp,renderChordSequence:noOp,updateSongNameDisplay:noOp,
  clearTimeout:function(value){calls.push('clear:'+value)},syncSongSaveState:function(value){calls.push('state:'+value)}
 };
 vm.createContext(context);
 vm.runInContext(extractFunction('initializeBlankStartupWorkspace')+';initializeBlankStartupWorkspace();',context);
 assert.equal(context.songSaveDirty,false);
 assert.equal(context.songAutosaveTimer,null);
 assert.equal(context.currentSongName,null);
 assert.equal(context.lastSongSavedSignature,'');
 assert.ok(calls.includes('state:idle'));
});

test('layout usa cartões comuns para roteiro e separa execução de bateria',function(){
 assert.match(index,/class="playback-plan-config"/);
 assert.doesNotMatch(index,/<fieldset class="playback-plan-config"/);
 assert.match(index,/class="sequence-config-group sequence-flow-config"/);
 assert.match(index,/class="sequence-config-group sequence-rhythm-config"/);
});

test('Carregar ignora falsa pendência do espaço inicial vazio e seleciona a música',function(){
 const calls=[];
 const noOp=function(){};
 const context={
  songs:{Alfa:{sections:{}}},currentSongName:null,songSaveDirty:true,songAutosaveTimer:77,
  lastSongSavedSignature:'',songAutosaveSuspended:0,bpm:100,
  sequenceSections:{verse:[],prechorus:[]},playbackPlan:{enabled:false,blocks:[]},sequenceGroup:{enabled:false},
  normalizedPlaybackPlan:function(value){return value},normalizedSequenceGroup:function(value){return value},
  clearTimeout:function(){},syncSongSaveState:noOp,
  flushCurrentSongSave:function(){calls.push('flush');return false},
  prepareSongWorkspaceChange:noOp,applySequenceState:function(){calls.push('apply')},
  currentSongSaveSignature:function(){return 'alfa'},saveSongsStore:noOp,updateSongNameDisplay:noOp,
  renderSongsList:noOp,syncCompactListControls:noOp,setStatus:noOp,syncCompactControls:noOp,
  songsLibraryUI:{openSongsDialog:function(){calls.push('dialog')}},
  $:function(){return null},Number:Number
 };
 vm.createContext(context);
 vm.runInContext(extractFunction('unnamedWorkspaceHasMusicalContent')+'\n'+extractFunction('loadSong')+';loadSong("Alfa");',context);
 assert.equal(context.currentSongName,'Alfa');
 assert.equal(context.songSaveDirty,false);
 assert.ok(calls.includes('apply'));
 assert.equal(calls.includes('flush'),false);
 assert.equal(calls.includes('dialog'),false);
});
