'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const baseline=path.resolve(root,'..','GERA-PWA-v3.15.04-etapa-6A-inventario-transporte');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scheduler=fs.readFileSync(path.join(root,'js/transport/scheduler.js'),'utf8');
const boundaries=fs.readFileSync(path.join(root,'js/transport/boundaries.js'),'utf8');
const tempo=fs.readFileSync(path.join(root,'js/transport/tempo.js'),'utf8');
const drumSync=fs.readFileSync(path.join(root,'js/transport/drum-sync.js'),'utf8');
const chordSequenceSync=fs.readFileSync(path.join(root,'js/transport/chord-sequence-sync.js'),'utf8');
const transportSources=index+'\n'+scheduler+'\n'+boundaries+'\n'+tempo+'\n'+drumSync+'\n'+chordSequenceSync;
const state=fs.readFileSync(path.join(root,'js/state.js'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');

let passed=0;
function test(name,fn){
 fn();
 passed++;
 process.stdout.write('ok '+passed+' - '+name+'\n');
}
function hash(file){
 return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
function has(fragment){assert.ok(transportSources.includes(fragment),'Trecho ausente: '+fragment)}

test('arquivos funcionais fora do escopo 6B permanecem byte a byte iguais à base',function(){
 const files=['offline.html','manual-gera.html','js/chords.js','js/state.js','js/audio/core.js','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'];
 files.forEach(function(file){
  assert.equal(hash(path.join(root,file)),hash(path.join(baseline,file)),file);
 });
});

test('BPM selecionado, efetivo e pendente continuam na fonte única',function(){
 ['bpm:100','transportTempoBpm:100','pendingBpm:null'].forEach(function(fragment){assert.ok(state.includes(fragment),fragment)});
});

test('scheduler mantém lookahead de 120 ms e polling de 25 ms',function(){
 has('const lookAhead=.12;');
 has('options.setTimer(setTimeout(scheduler,25));');
});

test('passo mantém duração de 15 dividido pelo BPM efetivo pelo cálculo puro',function(){
 has('const stepDur=GeraTransportClock.stepDurationSeconds(transportTempoBpm);');
});

test('transporte mantém 16 passos em 4/4 e 12 em 3/4',function(){
 has("return isThreeQuarterPattern(pattern)?12:16;");
 has("if([12,16].indexOf(steps)>=0)return steps;");
});

test('fronteiras mantêm stride 2 em 4/4 e 1 em 3/4',function(){
 has("return isThreeQuarterPattern(drumPattern)?1:2;");
 has('if(step%boundaryStride!==0)return;');
});

test('início do transporte mantém atraso de 80 ms no AudioContext',function(){
 has('transportNextTime=audioCtx.currentTime+.08;');
});

test('bateria e sequência mantêm fila de entrada no passo zero',function(){
 has('const startsDrums=step===0&&options.isStartQueued();');
 has('if(options.isStartQueued()){');
 has('if(!isBarStart)return false;');
});

test('mudança pendente de BPM continua capturada no passo zero',function(){
 has('if(step!==0||tempo.pendingBpm===null)return null;');
 has('tempo.transportTempoBpm=nextBpm;');
 has('options.onBoundaryApply(nextBpm);');
});

test('parada conjunta continua agendada no passo zero',function(){
 has('if(step===0&&accompanimentStopQueued){');
 has('const stopEvent=setTimeout(finishAccompanimentsAtBarEnd,delay);');
});

test('linha textual mantém performance.now e intervalo de 100 ms',function(){
 has('sequenceTextTimelineStartedAt=performance.now();');
 has('sequenceTextCountdownTimer=setInterval(updateSequenceTextTimelineDisplay,100);');
});

test('painel e contadores mantêm atualização de 250 ms',function(){
 assert.match(index,/setInterval\(function\(\)\{\s*refreshLibraryIfNeeded\(\);\s*renderRedesignSequenceTimeline\(\);\s*syncCompactSequenceCountdown\(\);\s*updateReadouts\(\);\s*syncSequenceRecordPreviewButton\(\);\s*\},250\);/);
});

test('SERVICE WORKER atualiza o cache e mantém a limpeza de versões antigas',function(){
 assert.ok(sw.includes("const CACHE_PREFIX = 'gera-pwa-';"));
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.41';"));
 assert.match(sw,/caches\.keys\(\).*cacheName !== CACHE_NAME.*caches\.delete\(cacheName\)/s);
});

test('somente os arquivos funcionais das etapas 6B a 6J entraram no PRECACHE_URLS',function(){
 assert.ok(sw.includes('"./js/transport/clock.js"'));
 assert.ok(sw.includes('"./js/transport/scheduler.js"'));
 assert.ok(sw.includes('"./js/transport/boundaries.js"'));
 assert.ok(sw.includes('"./js/ui/transport-status.js"'));
 assert.ok(sw.includes('"./js/transport/tempo.js"'));
 assert.ok(sw.includes('"./js/transport/drum-sync.js"'));
 assert.ok(sw.includes('"./js/transport/chord-sequence-sync.js"'));
 assert.ok(sw.includes('"./js/transport/coordinator.js"'));
 assert.ok(sw.includes('"./js/transport/sequence-transitions.js"'));
 assert.ok(!sw.includes('RELATORIO-ETAPA-6A'));
 assert.ok(!sw.includes('transport-inventory.test.js'));
});

process.stdout.write('# '+passed+' testes aprovados\n');
