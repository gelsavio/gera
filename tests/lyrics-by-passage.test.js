'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const modelSource=fs.readFileSync(path.join(root,'js','lyrics.js'),'utf8');
const uiSource=fs.readFileSync(path.join(root,'js','ui','lyrics-editor.js'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');

function model(){
 const window={};window.window=window;window.globalThis=window;
 vm.runInNewContext(modelSource,{window:window,globalThis:window});
 return window.GeraLyrics;
}
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

test('modelo guarda textos e atrasos distintos em até 99 passagens e usa o padrão como fallback',function(){
 const lyrics=model();
 const item={lyricDefault:'Padrão'};
 lyrics.setText(item,1,'Primeira estrofe');
 lyrics.setDelayMs(item,1,1250);
 lyrics.setText(item,2,'Segunda estrofe');
 lyrics.setDelayMs(item,'default',600);
 lyrics.setText(item,120,'Última permitida');
 lyrics.setDelayMs(item,120,90000);

 assert.equal(lyrics.textForPassage(item,1),'Primeira estrofe');
 assert.equal(lyrics.delayMsForPassage(item,1),1250);
 assert.equal(lyrics.textForPassage(item,2),'Segunda estrofe');
 assert.equal(lyrics.delayMsForPassage(item,2),0);
 assert.equal(lyrics.textForPassage(item,3),'Padrão');
 assert.equal(lyrics.delayMsForPassage(item,3),600);
 assert.equal(lyrics.textForPassage(item,99),'Última permitida');
 assert.equal(lyrics.delayMsForPassage(item,99),60000);
 assert.equal(lyrics.maxPassage(item),99);
});

test('apagar uma letra remove seu atraso e editar o texto preserva o atraso existente',function(){
 const lyrics=model();
 const item={};
 lyrics.setText(item,2,'Entrada');
 lyrics.setDelayMs(item,2,1400);
 lyrics.setText(item,2,'Entrada corrigida');
 const timing=lyrics.timingForPassage(item,2);
 assert.equal(timing.text,'Entrada corrigida');
 assert.equal(timing.delayMs,1400);
 lyrics.setText(item,2,'');
 assert.equal(lyrics.textForEditor(item,2),'');
 assert.equal(lyrics.delayMsForEditor(item,2),0);
 assert.equal(item.lyrics,undefined);
});

test('músicas antigas migram texto direcionado e texto sempre sem perder conteúdo',function(){
 const lyrics=model();
 const directed=lyrics.applyToItem({label:'C'},{text:'Verso antigo',textRepeat:2});
 const always=lyrics.applyToItem({label:'G'},{text:'Refrão antigo',textRepeat:'always'});

 assert.equal(lyrics.textForPassage(directed,1),'');
 assert.equal(lyrics.textForPassage(directed,2),'Verso antigo');
 assert.equal(lyrics.textForPassage(always,1),'Refrão antigo');
 assert.equal(lyrics.textForPassage(always,12),'Refrão antigo');
 assert.equal('text' in directed,false);
 assert.equal('textRepeat' in directed,false);
});

test('roteiro conta as passagens reais de B sem duplicar a fronteira aproveitada',function(){
 const context={
  sequenceRecordPreviewActive:false,
  activeSequenceSection:'verse',
  sequenceHoldLoop:false,
  playbackPlanRuntimeActive:true,
  playbackPlanCursor:0,
  playbackPlanQueue:[],
  playbackPlan:{enabled:true},
  sequenceSections:{verse:[{}],prechorus:[{}],chorus:[{}]},
  normalizedPlaybackPlan:function(value){return value},
  compilePlaybackPlanQueue:function(){return [
   {section:'verse'},{section:'prechorus'},
   {section:'verse'},{section:'prechorus'},
   {section:'verse'},{section:'prechorus'},
   {section:'chorus'},{section:'prechorus'},{section:'chorus'}
  ]},
  sectionTargetPasses:function(){return 1},
  normalizedSequenceGroup:function(){return {enabled:false}},
  sequenceGroup:{},sequenceAuto:true,sequenceAutoEnd:false,
  configuredSequenceSections:function(){return []},
  linkedCycleForSection:function(){return null},
  sequenceGroupSections:function(){return []},
  SEQUENCE_SECTION_LABELS:{verse:'A',prechorus:'B',chorus:'C'}
 };
 vm.createContext(context);
 vm.runInContext(extractFunction('sequenceTextPlaybackSections'),context);
 const route=vm.runInContext('sequenceTextPlaybackSections()',context);
 const b=Array.from(route).filter(function(entry){return entry.section==='prechorus'});
 assert.deepEqual(b.map(function(entry){return entry.passage}),[1,2,3,4]);
});

test('linha do tempo desloca e reordena as letras pelo instante real da entrada vocal',function(){
 const lyrics=model();
 const first={fraction:1};
 const second={fraction:1};
 lyrics.setText(first,1,'Primeira letra');
 lyrics.setDelayMs(first,1,2500);
 lyrics.setText(second,1,'Segunda letra');

 const context={
  GeraLyrics:lyrics,
  sequenceHoldLoop:false,
  sequenceRecordPreviewActive:false,
  sequenceAuto:false,
  sequenceAutoEnd:false,
  bpm:120,
  sequenceSections:{verse:[first,second]},
  sequenceTextPlaybackSections:function(){return [{section:'verse',passage:1,repeat:1}]}
 };
 vm.createContext(context);
 vm.runInContext(extractFunction('sequenceTextTimingForCurrentRepeat'),context);
 vm.runInContext(extractFunction('sequenceItemDurationMs'),context);
 vm.runInContext(extractFunction('buildSequenceTextTimeline'),context);
 const built=vm.runInContext('buildSequenceTextTimeline()',context);
 assert.deepEqual(Array.from(built.cues,function(cue){return [cue.text,cue.atMs,cue.delayMs]}),[
  ['Segunda letra',2000,0],
  ['Primeira letra',2500,2500]
 ]);
 assert.equal(built.durationMs,4000);
});

test('cadastro saiu do editor de acordes e ganhou modal e chamadas próprias',function(){
 assert.doesNotMatch(index,/id="sequence-edit-text(?:-repeat)?"/);
 assert.match(index,/id="sequence-lyrics-dialog"/);
 assert.match(index,/id="sequence-lyrics-open"/);
 assert.match(index,/id="redesign-open-lyrics"/);
 assert.match(index,/id="sequence-lyrics-passage"/);
 assert.match(index,/id="sequence-lyrics-items"/);
 assert.match(index,/id="sequence-lyrics-play"/);
 assert.match(index,/id="sequence-lyrics-preview-status"/);
 assert.match(uiSource,/Atraso da entrada vocal/);
 assert.match(uiSource,/dataset\.lyricsDelayIndex/);
 assert.match(uiSource,/setDelayMs/);
 assert.ok(index.indexOf('./js/lyrics.js')<index.indexOf('./js/state.js'));
 assert.ok(index.indexOf('./js/ui/sequencer.js')<index.indexOf('./js/ui/lyrics-editor.js'));
});

test('modal executa uma passagem e apresenta cronômetro progressivo em cada acorde',function(){
 assert.match(uiSource,/sequence-lyrics-counter/);
 assert.match(uiSource,/dataset\.lyricsCounterValue/);
 assert.match(uiSource,/setInterval\(updatePreview,50\)/);
 assert.match(uiSource,/Entrada da letra:/);
 assert.match(uiSource,/Preparando execução/);
 assert.match(index,/function startLyricsSequencePreview\(section,passage\)/);
 assert.match(index,/function lyricsSequencePreviewState\(\)/);
 assert.match(index,/sequencePlaybackItemStartedAtMs\+=Math\.max/);
 assert.match(index,/sequencePreviewOwner==='lyrics'/);
});

test('clique da prévia libera o áudio e usa o mesmo iniciador de Testar 1x',function(){
 const calls=[];
 const context={
  SEQUENCE_SECTION_LABELS:{verse:'A'},
  sequenceSections:{verse:[{}]},
  ensureAudio:function(){calls.push('audio')},
  globalAudioMuted:true,
  setGlobalAudioMuted:function(value,showStatus){calls.push('mute:'+value+':'+showStatus)},
  sequencePlaying:false,
  sequenceStartQueued:false,
  stopChordSequence:function(){calls.push('stop')},
  activeSequenceSection:'verse',
  selectSequenceSection:function(){},
  normalizedLyricsPreviewPassage:function(){return 1},
  sequenceLyricsPreviewPassage:1,
  sequencePreviewOwner:'',
  sequenceRecordPreviewActive:false,
  sequencePlaybackItemStartedAtMs:0,
  sequenceRecordUiBridge:{startPreview:function(owner){calls.push('preview:'+owner);return true}},
  setStatus:function(){},
  GeraLyrics:{MAX_PASSAGE:99}
 };
 vm.createContext(context);
 vm.runInContext(extractFunction('startLyricsSequencePreview'),context);
 const started=vm.runInContext("startLyricsSequencePreview('verse',1)",context);
 assert.equal(started,true);
 assert.deepEqual(calls.slice(0,3),['audio','mute:false:false','preview:lyrics']);
});

test('modal e Testar 1x compartilham o iniciador real de uma passagem',function(){
 assert.match(index,/function startSequencePreviewOnce\(owner\)/);
 assert.match(index,/sequenceRecordUiBridge\.startPreview=startSequencePreviewOnce/);
 assert.match(index,/sequenceRecordUiBridge\.startPreview\('lyrics'\)/);
 assert.match(index,/startSequencePreviewOnce\('record'\)/);
 assert.doesNotMatch(extractFunction('startLyricsSequencePreview'),/playChordSequence\(/);
});

test('estado da prévia informa o tempo progressivo do acorde ativo',function(){
 const context={
  sequencePreviewOwner:'lyrics',
  sequenceRecordPreviewActive:true,
  sequencePlaying:true,
  sequenceStartQueued:false,
  activeSequenceSection:'chorus',
  sequenceIndex:2,
  sequencePlaybackItemStartedAtMs:1000,
  performance:{now:function(){return 1475}}
 };
 vm.createContext(context);
 vm.runInContext(extractFunction('lyricsSequencePreviewState'),context);
 const state=vm.runInContext('lyricsSequencePreviewState()',context);
 assert.equal(state.active,true);
 assert.equal(state.section,'chorus');
 assert.equal(state.index,2);
 assert.equal(state.itemElapsedMs,475);
});

test('término da execução do modal retorna ao controlador de letras',function(){
 let lyricsFinished='';
 let recordFinished='';
 const context={
  sequencePreviewOwner:'lyrics',
  sequenceLyricsUiBridge:{finishPreview:function(message){lyricsFinished=message}},
  sequenceRecordUiBridge:{finishPreview:function(message){recordFinished=message}},
  sequenceRecordPreviewActive:true,
  stopChordSequence:function(){}
 };
 vm.createContext(context);
 vm.runInContext(extractFunction('finishActiveSequenceRecordPreview'),context);
 vm.runInContext("finishActiveSequenceRecordPreview('Concluída')",context);
 assert.equal(lyricsFinished,'Concluída');
 assert.equal(recordFinished,'');
});

test('módulo visual permanece separado de áudio, transporte e persistência',function(){
 assert.match(uiSource,/GeraLyricsEditor=Object\.freeze\(\{createController:createController\}\)/);
 assert.doesNotMatch(uiSource,/AudioContext|playChord|playDrum|localStorage|GeraStorage|transport/);
 assert.equal((sw.match(/"\.\/js\/lyrics\.js"/g)||[]).length,1);
 assert.equal((sw.match(/"\.\/js\/ui\/lyrics-editor\.js"/g)||[]).length,1);
});

test('JSON portátil e estado interno identificam letras com atraso individual',function(){
 assert.match(index,/formatVersion:10/);
 assert.match(index,/formatVersion:27/);
 assert.match(index,/GeraLyrics\.applyToItem\(normalized,item\)/);
 assert.match(index,/GeraLyrics\.copyToItem\(item,sequence\[sequenceEditIndex\]\)/);
 assert.match(index,/atMs:elapsedMs\+timing\.delayMs/);
 assert.match(index,/timeline\.sort\(function\(a,b\)/);
});
