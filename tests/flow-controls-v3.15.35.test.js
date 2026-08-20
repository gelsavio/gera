'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles','inline-style-01.css'),'utf8');
const transportStatus=fs.readFileSync(path.join(root,'js','ui','transport-status.js'),'utf8');

function functionBlock(startName,endName){
 const start=index.indexOf('function '+startName+'(');
 const end=index.indexOf('function '+endName+'(',start+1);
 assert.ok(start>=0&&end>start,startName+' não localizado');
 return index.slice(start,end);
}

test('retorno para sequência anterior respeita o limite e depois libera o avanço natural',function(){
 const source=index.slice(
  index.indexOf('function resetConfiguredReturnCounts('),
  index.indexOf('function plannedNextSequenceSection(')
 );
 const context={
  SEQUENCE_SECTION_LABELS:{verse:'A',prechorus:'B',chorus:'C'},
  sequenceOrder:['verse','prechorus','chorus'],
  sequenceDrums:{
   prechorus:{proxima:'verse',proximaVezes:3},
   verse:{proxima:'',proximaVezes:1},
   chorus:{proxima:'',proximaVezes:1}
  },
  sequenceConfiguredReturnCounts:{},
  sequenceAuto:true,
  normalizedSequenceOrder:function(value){return value.slice()},
  normalizeSectionDrum:function(value){return value},
  configuredSequenceSections:function(){return ['verse','prechorus','chorus']}
 };
 vm.createContext(context);
 vm.runInContext(source,context);

 assert.equal(context.isBackwardConfiguredNext('prechorus','verse'),true);
 assert.equal(context.configuredNextSequence('prechorus'),'verse');
 context.recordConfiguredReturn('prechorus','verse');
 context.recordConfiguredReturn('prechorus','verse');
 assert.equal(context.configuredNextSequence('prechorus'),'verse');
 context.recordConfiguredReturn('prechorus','verse');
 assert.equal(context.configuredNextSequence('prechorus'),'');
 assert.equal(context.automaticSongWraps('chorus','verse'),true);
 context.resetConfiguredReturnCounts();
 assert.equal(context.configuredNextSequence('prechorus'),'verse');
});

test('AUTO LOOP altera somente a preferência de término durante a reprodução',function(){
 const source=functionBlock('toggleSequenceAuto','toggleSequenceAutoEnd');
 const context={
  sequenceAuto:false,
  sequenceAutoEnd:true,
  sequencePlaying:true,
  activeSequenceSection:'prechorus',
  currentSectionRepetition:7,
  saved:0,
  synced:0,
  status:'',
  saveChordSequence:function(){context.saved++},
  syncSequenceSectionButtons:function(){context.synced++},
  configuredSequenceSections:function(){return ['verse','prechorus','chorus']},
  SEQUENCE_SECTION_LABELS:{verse:'A',prechorus:'B',chorus:'C'},
  sectionRepeatLabel:function(){return '1'},
  setStatus:function(value){context.status=value}
 };
 vm.createContext(context);
 vm.runInContext(source,context);
 context.toggleSequenceAuto();

 assert.equal(context.sequenceAuto,true);
 assert.equal(context.sequenceAutoEnd,false);
 assert.equal(context.sequencePlaying,true);
 assert.equal(context.activeSequenceSection,'prechorus');
 assert.equal(context.currentSectionRepetition,7);
 assert.equal(context.saved,1);
 assert.doesNotMatch(source,/playChordSequence|stopChordSequence|sequenceIndex|currentSectionRepetition\s*=/);
});

test('controle inferior de AUTO LOOP não chama o início da música',function(){
 assert.match(index,/byId\('redesign-play'\)\.onclick=startRedesignSongPlayback/);
 assert.match(index,/byId\('redesign-play-loop'\)\.onclick=function\(\)\{\s*toggleSequenceAuto\(\)/);
 assert.doesNotMatch(index,/startRedesignSongPlayback\('loop'\)/);
 assert.match(transportStatus,/playLoop\.classList\.toggle\('active',state\.sequenceAuto&&!state\.sequenceAutoEnd\)/);
});

test('interface compacta e JSON preservam o contador de retornos',function(){
 ['section-next-count-wrap','section-next-count','sequence-group-enabled','sequence-group-start','sequence-group-end','sequence-group-repeats','sequence-group-next','sequence-group-summary'].forEach(function(id){
  assert.match(index,new RegExp('id="'+id+'"'));
 });
 assert.match(index,/proximaVezes:proximaVezes/);
 assert.match(index,/nextCount:config\.proximaVezes/);
 assert.match(index,/proximaVezes:assignment\.nextCount/);
 assert.match(index,/formatVersion:27/);
 assert.match(index,/formatVersion:10/);
 assert.match(css,/\.sequence-group-grid\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
});
