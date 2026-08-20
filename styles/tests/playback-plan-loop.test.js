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

test('editor, persistência e transporte expõem o roteiro de execução',function(){
 ['playback-plan-enabled','playback-plan-add','playback-plan-blocks','playback-plan-summary'].forEach(function(id){
  assert.match(index,new RegExp('id="'+id+'"'));
 });
 assert.match(index,/playbackPlan:normalizedPlaybackPlan\(playbackPlan\)/);
 assert.match(index,/playbackPlan:normalizedPlaybackPlan\(data\.playbackPlan,importedOrder\)/);
 assert.match(index,/plan:planTransition/);
 assert.match(index,/sequenceTransition\.type==='switch-plan'/);
 assert.match(index,/sequenceTransition\.type==='stop-plan'/);
 assert.ok(index.indexOf('class="playback-plan-config"')<index.indexOf('class="sequence-group-legacy"'));
 assert.match(index,/Estrutura geral da música/);
 assert.match(index,/Repetição simples de conjunto <small>modo antigo<\/small>/);
});

test('A–B ×3 seguido de B–C ×2 pode aproveitar o B da fronteira',function(){
 const labels={verse:'A',prechorus:'B',chorus:'C'};
 const context={
  SEQUENCE_SECTION_LABELS:labels,
  MAX_SEQUENCE_REPEATS:99,
  sequenceOrder:['verse','prechorus','chorus'],
  sequenceSections:{verse:[1],prechorus:[1],chorus:[1]},
  normalizedSequenceOrder:function(){return ['verse','prechorus','chorus']}
 };
 vm.createContext(context);
 vm.runInContext([
  'normalizedPlaybackPlanBlock','normalizedPlaybackPlan','playbackPlanBlockSections','compilePlaybackPlanQueue'
 ].map(extractFunction).join('\n'),context);
 const queue=context.compilePlaybackPlanQueue({enabled:true,blocks:[
  {start:'verse',end:'prechorus',repeats:3},
  {start:'prechorus',end:'chorus',repeats:2,reusePrevious:true}
 ]});
 assert.deepEqual(Array.from(queue,function(entry){return labels[entry.section]}),['A','B','A','B','A','B','C','B','C']);
});

test('AUTO FIM não encerra B enquanto o roteiro ainda possui repetições',function(){
 const context={
  playbackPlanRuntimeActive:true,
  sequenceAutoEnd:true,
  currentSectionRepetition:2,
  lastConfiguredSequence:function(){return 'prechorus'},
  sectionRepeatValue:function(){return 2}
 };
 vm.createContext(context);
 vm.runInContext(extractFunction('isFinalAutoEndPass'),context);

 assert.equal(context.isFinalAutoEndPass('prechorus'),false);
 context.playbackPlanRuntimeActive=false;
 assert.equal(context.isFinalAutoEndPass('prechorus'),true);

 assert.match(index,/!playbackPlanRuntimeActive&&\s*isLastItem&&\s*!sequenceEndActionInProgress&&\s*sequenceAutoEnd/);
});

test('A–B ×2 com B ×2 executa A, B, B, A, B, B antes de parar',function(){
 const labels={verse:'A',prechorus:'B'};
 const planContext={
  SEQUENCE_SECTION_LABELS:labels,
  MAX_SEQUENCE_REPEATS:99,
  sequenceOrder:['verse','prechorus'],
  sequenceSections:{verse:[1],prechorus:[1]},
  normalizedSequenceOrder:function(){return ['verse','prechorus']}
 };
 vm.createContext(planContext);
 vm.runInContext([
  'normalizedPlaybackPlanBlock','normalizedPlaybackPlan','playbackPlanBlockSections','compilePlaybackPlanQueue'
 ].map(extractFunction).join('\n'),planContext);

 const queue=planContext.compilePlaybackPlanQueue({enabled:true,blocks:[
  {start:'verse',end:'prechorus',repeats:2,reusePrevious:true}
 ]});
 const expanded=[];
 queue.forEach(function(entry){
  const passes=entry.section==='prechorus'?2:1;
  for(let pass=0;pass<passes;pass++)expanded.push(labels[entry.section]);
 });

 assert.deepEqual(expanded,['A','B','B','A','B','B']);
});

test('loop ligado mantém o ciclo de retorno e desligado libera após o lote corrente',function(){
 const start=index.indexOf('function resetConfiguredReturnCounts(');
 const end=index.indexOf('function automaticSongWraps(',start);
 const context={
  SEQUENCE_SECTION_LABELS:{verse:'A',prechorus:'B'},
  sequenceOrder:['verse','prechorus'],
  sequenceDrums:{verse:{proxima:'',proximaVezes:1},prechorus:{proxima:'verse',proximaVezes:2}},
  sequenceConfiguredReturnCounts:{prechorus:2},
  sequenceHoldLoop:true,
  normalizedSequenceOrder:function(value){return value.slice()},
  normalizeSectionDrum:function(value){return value}
 };
 vm.createContext(context);
 vm.runInContext(index.slice(start,end),context);
 assert.equal(context.configuredNextSequence('prechorus'),'verse');
 context.recordConfiguredReturn('prechorus','verse');
 assert.equal(context.sequenceConfiguredReturnCounts.prechorus,1);
 context.sequenceHoldLoop=false;
 assert.equal(context.configuredNextSequence('prechorus'),'verse');
 context.recordConfiguredReturn('prechorus','verse');
 assert.equal(context.configuredNextSequence('prechorus'),'');
});
