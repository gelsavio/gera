'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const preTransport=path.resolve(root,'..','GERA-PWA-v3.15.04-audio-contexto-barramentos');
const previous=path.resolve(root,'..','GERA-PWA-v3.15.13-etapa-6J-painel-compacto-contadores');
const audited=path.resolve(root,'..','GERA-PWA-v3.15.14-etapa-6K-auditoria-paridade');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

function jsFiles(directory){
 const result=[];
 const start=path.join(directory,'js');
 function walk(current){
  if(!fs.existsSync(current))return;
  fs.readdirSync(current).forEach(function(name){
   const file=path.join(current,name);
   if(fs.statSync(file).isDirectory())walk(file);
   else if(file.endsWith('.js'))result.push(file);
  });
 }
 walk(start);
 return result.sort();
}
function functionalSource(directory){
 let source=fs.readFileSync(path.join(directory,'index.html'),'utf8');
 jsFiles(directory).forEach(function(file){source+='\n'+fs.readFileSync(file,'utf8')});
 return source;
}
function count(source,pattern){return (source.match(pattern)||[]).length}

const before=functionalSource(preTransport);
const after=functionalSource(root);

test('relógio preserva duração do passo, compassos e atraso inicial',function(){
 assert.ok(index.includes('const stepDur=GeraTransportClock.stepDurationSeconds(transportTempoBpm);'));
 assert.ok(index.includes('transportNextTime=audioCtx.currentTime+.08'));
 assert.ok(index.includes("function drumPatternMeterSteps(pattern){\n return isThreeQuarterPattern(pattern)?12:16;\n}"));
 assert.ok(index.includes('if([12,16].indexOf(steps)>=0)return steps;'));
});

test('scheduler mantém uma cadeia, lookahead de 120 ms e polling de 25 ms',function(){
 const scheduler=fs.readFileSync(path.join(root,'js/transport/scheduler.js'),'utf8');
 assert.equal(count(scheduler,/setTimeout\s*\(/g),1);
 assert.ok(scheduler.includes('const lookAhead=.12;'));
 assert.ok(scheduler.includes('currentTime()+lookAhead'));
 assert.ok(scheduler.includes('setTimeout(scheduler,25)'));
 assert.equal(count(after,/setTimeout\(scheduler,25\)/g),1);
});

test('fronteiras possuem um único emissor e um único avanço de compasso',function(){
 const boundaries=fs.readFileSync(path.join(root,'js/transport/boundaries.js'),'utf8');
 assert.equal(count(boundaries,/step%boundaryStride===0/g),1);
 assert.equal(count(after,/transportBar\+\+/g),1);
 assert.equal(count(index,/transportBoundaryEmitter\.emit\(/g),1);
});

test('BPM selecionado, efetivo e pendente continuam em uma fonte de estado',function(){
 const state=fs.readFileSync(path.join(root,'js/state.js'),'utf8');
 const other=after.replace(state,'');
 ['bpm','transportTempoBpm','pendingBpm'].forEach(function(name){
  assert.match(state,new RegExp(name+':'));
  assert.doesNotMatch(other,new RegExp('(?:let|var|const)\\s+'+name+'\\b'));
 });
});

test('bateria e sequência continuam consumindo os mesmos pulsos do transporte',function(){
 assert.equal(count(index,/drumTransportConsumer\.consumePulse\(step,when\)/g),1);
 assert.equal(count(index,/sequenceTransportConsumer\.consumeBoundary\(/g),1);
 assert.ok(index.includes('function handleTransportSchedulerPulse(step,when){'));
 assert.ok(index.includes('function handleTransportBoundary(step,boundaryAudioTime){'));
});

test('coordenação conserva um único ponto de início e parada do transporte',function(){
 assert.equal(count(index,/const transportCoordinator=GeraTransportCoordinator\.createCoordinator/g),1);
 assert.equal(count(index,/function ensureMasterTransport\(\)/g),1);
 assert.equal(count(index,/function maybeStopMasterTransport\(\)/g),1);
 assert.equal(count(index,/function stopMasterTransport\(\)/g),1);
});

test('trocas permanecem decididas por um planejador e efetivadas no núcleo',function(){
 assert.equal(count(index,/GeraSequenceTransitions\.resolveEnd\(/g),1);
 assert.ok(index.includes("if(sequenceTransition.type==='repeat-hold')"));
 assert.ok(index.includes("}else if(sequenceTransition.type==='switch-manual')"));
 assert.ok(index.includes("}else if(sequenceTransition.type==='switch-configured')"));
 assert.ok(index.includes("}else if(sequenceTransition.type==='switch-auto')"));
});

test('painel continua consumidor e mantém o único intervalo de 250 ms',function(){
 const status=fs.readFileSync(path.join(root,'js/ui/transport-status.js'),'utf8');
 assert.equal(count(index,/GeraTransportStatus\.createConsumer\(/g),1);
 assert.equal(count(after,/\},250\);/g),1);
 assert.doesNotMatch(status,/setTimeout|setInterval|requestAnimationFrame|addEventListener/);
});

test('salvamento automático e roteiro acrescentam somente os mecanismos previstos',function(){
 assert.equal(count(after,/setInterval\s*\(/g),count(before,/setInterval\s*\(/g));
 assert.equal(count(after,/setTimeout\s*\(/g),count(before,/setTimeout\s*\(/g)+2);
 assert.equal(count(after,/addEventListener\s*\(/g),count(before,/addEventListener\s*\(/g)+8);
 assert.equal(count(after,/requestAnimationFrame\s*\(/g),count(before,/requestAnimationFrame\s*\(/g));
});

test('não existem timers mestres legados concorrentes ativos',function(){
 assert.equal(count(index,/drumTimer=setTimeout/g),0);
 assert.equal(count(index,/sequenceTimer=setTimeout/g),0);
 assert.equal(count(index,/transportTimer=setTimeout/g),0);
 assert.ok(index.includes('let openHatVoice=null,drumEngine='));
 assert.ok(index.includes('drumTimer=null'));
 assert.ok(index.includes('sequenceTimer=null'));
});

test('módulos extraídos não importam uns aos outros nem formam ciclo',function(){
 const modules=jsFiles(root).filter(function(file){return file.includes(path.join('js','transport'))||file.includes(path.join('js','ui','transport-status.js'))});
 const ownApi={
  'clock.js':'GeraTransportClock','scheduler.js':'GeraTransportScheduler','boundaries.js':'GeraTransportBoundaries',
  'tempo.js':'GeraTransportTempo','drum-sync.js':'GeraTransportDrumSync','chord-sequence-sync.js':'GeraTransportChordSequenceSync',
  'sequence-transitions.js':'GeraSequenceTransitions','coordinator.js':'GeraTransportCoordinator','transport-status.js':'GeraTransportStatus'
 };
 modules.forEach(function(file){
  const source=fs.readFileSync(file,'utf8');
  assert.doesNotMatch(source,/import\s|require\s*\(/,file);
  const foreign=['GeraTransportClock','GeraTransportScheduler','GeraTransportBoundaries','GeraTransportTempo','GeraTransportDrumSync','GeraTransportChordSequenceSync','GeraSequenceTransitions','GeraTransportCoordinator','GeraTransportStatus'].filter(function(name){return name!==ownApi[path.basename(file)]});
  foreign.forEach(function(name){assert.doesNotMatch(source,new RegExp('\\b'+name+'\\b'),file+' -> '+name)});
 });
});

test('não há cálculo concorrente de fronteira em execução',function(){
 assert.equal(count(after,/step%boundaryStride===0/g),1);
 assert.equal(count(index,/step%transportBoundaryStride\(\)===0/g),0);
 assert.equal(count(index,/nextBoundary(?:Time|Offset)Seconds\(/g),0);
});

test('auditoria 6K preservada e arquivos fora do fluxo atualizado seguem idênticos',function(){
 const files=['offline.html','manual-gera.html','js/chords.js','js/state.js','js/transport/clock.js','js/transport/scheduler.js','js/transport/boundaries.js','js/transport/tempo.js','js/transport/drum-sync.js','js/transport/chord-sequence-sync.js','js/transport/coordinator.js','js/audio/core.js'];
 files.forEach(function(file){assert.deepEqual(fs.readFileSync(path.join(root,file)),fs.readFileSync(path.join(audited,file)),file)});
 const auditedIndex=fs.readFileSync(path.join(audited,'index.html'),'utf8');
 const restoredIndex=auditedIndex.replaceAll('3.15.14','3.15.13');
 const restoredSw=fs.readFileSync(path.join(audited,'sw.js'),'utf8').replace("'v3.15.14'","'v3.15.13'");
 const restoredManifest=fs.readFileSync(path.join(audited,'manifest.json'),'utf8').replace('"3.15.14"','"3.15.13"');
 assert.equal(restoredIndex,fs.readFileSync(path.join(previous,'index.html'),'utf8'));
 assert.equal(restoredSw,fs.readFileSync(path.join(previous,'sw.js'),'utf8'));
 assert.equal(restoredManifest,fs.readFileSync(path.join(previous,'manifest.json'),'utf8'));
});

test('cache 3.15.42 preserva exatamente os módulos carregados pelo navegador',function(){
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.42';"));
 ['clock','scheduler','boundaries','tempo','drum-sync','chord-sequence-sync','sequence-transitions','coordinator'].forEach(function(name){assert.ok(sw.includes('"./js/transport/'+name+'.js"'))});
 assert.ok(sw.includes('"./js/ui/transport-status.js"'));
 assert.ok(sw.includes('"./js/ui/header.js"'));
 assert.ok(sw.includes('"./js/ui/compact-panel.js"'));
 assert.ok(sw.includes('"./js/ui/keyboard.js"'));
 assert.ok(sw.includes('"./js/ui/chords-circle.js"'));
 assert.ok(sw.includes('"./js/ui/drums.js"'));
});

test('auditoria estática registra somente os mecanismos autorizados da nova versão',function(){
 assert.equal(count(after,/setInterval\s*\(/g),2);
 assert.equal(count(after,/setTimeout\s*\(/g),44);
 assert.equal(count(after,/addEventListener\s*\(/g),67);
 assert.equal(count(after,/requestAnimationFrame\s*\(/g),2);
});
