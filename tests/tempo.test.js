'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const test=require('node:test');

const root=path.resolve(__dirname,'..');
const baselineRoot=path.resolve(root,'..','GERA-PWA-v3.15.07-etapa-6D-fronteiras-compasso');
const validatedRoot=path.resolve(root,'..','GERA-PWA-v3.15.08-etapa-6E-mudancas-bpm');
const source=fs.readFileSync(path.join(root,'js/transport/tempo.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

function legacyNormalizedBpm(value){
 let number=Math.round(Number(value));
 if(!Number.isFinite(number))number=100;
 if(number<40)number=40;
 if(number>220)number=220;
 return number;
}

function createHarness(initial){
 const timers=[];
 const tracked=[];
 const applied=[];
 let currentTime=10;
 const context={
  setTimeout:function(callback,delay){
   timers.push({callback:callback,delay:delay});
   return timers.length;
  }
 };
 context.window=context;
 vm.createContext(context);
 vm.runInContext(fs.readFileSync(path.join(root,'js/state.js'),'utf8'),context,{filename:'state.js'});
 vm.runInContext(source,context,{filename:'tempo.js'});
 if(initial){
  Object.keys(initial).forEach(function(key){context.GeraState.tempo[key]=initial[key]});
 }
 let controller;
 controller=context.GeraTransportTempo.createController({
  normalize:legacyNormalizedBpm,
  currentTime:function(){return currentTime},
  onBoundaryApply:function(value){applied.push(value);controller.applyAtBoundary(value)},
  trackEvent:function(event){tracked.push(event)}
 });
 return {
  context:context,
  controller:controller,
  tempo:context.GeraState.tempo,
  timers:timers,
  tracked:tracked,
  applied:applied,
  setCurrentTime:function(value){currentTime=value}
 };
}

test('carregar e criar o controlador não inicia áudio nem temporizadores',function(){
 const harness=createHarness();
 assert.equal(harness.timers.length,0);
 assert.deepEqual(harness.applied,[]);
});

test('aplica imediatamente a mudança quando o transporte está parado',function(){
 const harness=createHarness();
 const requested=harness.controller.requestChange(128,false);
 assert.equal(requested,128);
 assert.deepEqual([harness.tempo.bpm,harness.tempo.transportTempoBpm,harness.tempo.pendingBpm],[128,128,null]);
});

test('mantém selecionado, efetivo e pendente distintos durante a execução',function(){
 const harness=createHarness({bpm:100,transportTempoBpm:100,pendingBpm:null});
 harness.controller.requestChange(132,true);
 assert.deepEqual([harness.tempo.bpm,harness.tempo.transportTempoBpm,harness.tempo.pendingBpm],[100,100,132]);
});

test('pedir novamente o BPM selecionado cancela o valor pendente',function(){
 const harness=createHarness({bpm:100,transportTempoBpm:100,pendingBpm:132});
 harness.controller.requestChange(100,true);
 assert.equal(harness.tempo.pendingBpm,null);
});

test('várias mudanças antes da fronteira preservam o último pedido',function(){
 const harness=createHarness();
 [120,144,88,137].forEach(function(value){harness.controller.requestChange(value,true)});
 assert.equal(harness.tempo.pendingBpm,137);
 assert.equal(harness.tempo.bpm,100);
 assert.equal(harness.tempo.transportTempoBpm,100);
});

test('passos diferentes de zero não consomem o BPM pendente',function(){
 const harness=createHarness({pendingBpm:140});
 assert.equal(harness.controller.schedulePendingAtStep(15,10.08),null);
 assert.equal(harness.tempo.pendingBpm,140);
 assert.equal(harness.timers.length,0);
});

test('passo zero aplica primeiro o BPM efetivo e agenda o selecionado no instante de áudio',function(){
 const harness=createHarness({bpm:100,transportTempoBpm:100,pendingBpm:140});
 const result=harness.controller.schedulePendingAtStep(0,10.08);
 assert.equal(result,140);
 assert.deepEqual([harness.tempo.bpm,harness.tempo.transportTempoBpm,harness.tempo.pendingBpm],[100,140,null]);
 assert.ok(Math.abs(harness.timers[0].delay-80)<1e-9);
 assert.deepEqual(harness.tracked,[1]);
 assert.deepEqual(harness.applied,[]);
});

test('callback da fronteira torna o BPM selecionado igual ao efetivo',function(){
 const harness=createHarness({bpm:100,transportTempoBpm:100,pendingBpm:140});
 harness.controller.schedulePendingAtStep(0,10.08);
 harness.timers[0].callback();
 assert.deepEqual(harness.applied,[140]);
 assert.deepEqual([harness.tempo.bpm,harness.tempo.transportTempoBpm,harness.tempo.pendingBpm],[140,140,null]);
});

test('fronteira já atrasada mantém atraso zero',function(){
 const harness=createHarness({pendingBpm:90});
 harness.setCurrentTime(10.2);
 harness.controller.schedulePendingAtStep(0,10.1);
 assert.equal(harness.timers[0].delay,0);
});

test('BPM consumido não cria um segundo evento no mesmo passo zero',function(){
 const harness=createHarness({pendingBpm:110});
 harness.controller.schedulePendingAtStep(0,10.08);
 harness.controller.schedulePendingAtStep(0,10.08);
 assert.equal(harness.timers.length,1);
});

test('parada aplica imediatamente o BPM ainda pendente',function(){
 const harness=createHarness({bpm:100,transportTempoBpm:100,pendingBpm:155});
 harness.controller.settleOnStop();
 assert.deepEqual(harness.applied,[155]);
 assert.deepEqual([harness.tempo.bpm,harness.tempo.transportTempoBpm,harness.tempo.pendingBpm],[155,155,null]);
});

test('parada sem pendência apenas sincroniza o BPM efetivo',function(){
 const harness=createHarness({bpm:122,transportTempoBpm:118,pendingBpm:null});
 harness.controller.settleOnStop();
 assert.deepEqual(harness.applied,[]);
 assert.equal(harness.tempo.transportTempoBpm,122);
});

test('novo início sincroniza o BPM efetivo e elimina pendência legada',function(){
 const harness=createHarness({bpm:126,transportTempoBpm:90,pendingBpm:150});
 harness.controller.resetForStart();
 assert.deepEqual([harness.tempo.bpm,harness.tempo.transportTempoBpm,harness.tempo.pendingBpm],[126,126,null]);
});

test('normalização preserva limites, decimais e padrão legados',function(){
 const harness=createHarness();
 [39,40,72.4,72.5,100,219.5,220,221,NaN,Infinity,''].forEach(function(value){
  const result=harness.controller.requestChange(value,false);
  assert.equal(result,legacyNormalizedBpm(value),String(value));
 });
});

test('usa exclusivamente GeraState.tempo como armazenamento dos três valores',function(){
 assert.match(source,/const tempo=global\.GeraState\.tempo;/);
 assert.doesNotMatch(source,/\b(?:let|var|const)\s+(?:bpm|transportTempoBpm|pendingBpm)\b/);
 assert.doesNotMatch(source,/document\.|querySelector|localStorage|scheduleDrumStep|sequencePlaying|requestAnimationFrame|setInterval/);
 assert.ok(index.includes('<script src="./js/state.js"></script>\n<script src="./js/transport/clock.js"></script>'));
 assert.ok(index.includes('<script src="./js/transport/tempo.js"></script>'));
});

test('preserva byte a byte o módulo de BPM da versão validada 3.15.08',function(){
 assert.equal(source,fs.readFileSync(path.join(validatedRoot,'js/transport/tempo.js'),'utf8'));
 assert.ok(index.includes('<script src="./js/transport/tempo.js"></script>'));
});

test('a integração de BPM permanece presente no núcleo após a etapa 6F',function(){
 const currentRequest="function requestBpmChange(value){\n const requested=transportTempoController.requestChange(value,transportRunning);\n const input=$('bpm');\n if(input)input.value=String(requested);\n updateBpmDisplay();\n markCurrentSongDirty();\n}";
 const legacyRequest="function requestBpmChange(value){\n const requested=normalizedBpm(value);\n const input=$('bpm');\n if(input)input.value=String(requested);\n\n if(transportRunning){\n  if(requested===bpm){\n   pendingBpm=null;\n  }else{\n   pendingBpm=requested;\n  }\n  updateBpmDisplay();\n  return;\n }\n\n bpm=requested;\n transportTempoBpm=bpm;\n pendingBpm=null;\n updateBpmDisplay();\n}";
 const controllerBlock="const transportTempoController=GeraTransportTempo.createController({\n normalize:normalizedBpm,\n currentTime:function(){return audioCtx.currentTime},\n onBoundaryApply:applyPendingBpmAtBoundary,\n trackEvent:function(tempoEvent){transportEvents.push(tempoEvent)}\n});\n";
 const currentApply="function applyPendingBpmAtBoundary(value){\n transportTempoController.applyAtBoundary(value);";
 const legacyApply="function applyPendingBpmAtBoundary(value){\n bpm=normalizedBpm(value);\n transportTempoBpm=bpm;\n pendingBpm=null;";
 const legacyTempoPulse="if(step===0&&pendingBpm!==null){\n    const nextBpm=normalizedBpm(pendingBpm);\n    pendingBpm=null;\n    transportTempoBpm=nextBpm;\n    const tempoDelay=Math.max(0,(when-audioCtx.currentTime)*1000);\n    const tempoEvent=setTimeout(function(){\n     applyPendingBpmAtBoundary(nextBpm);\n    },tempoDelay);\n    transportEvents.push(tempoEvent);\n   }";
 assert.ok(index.includes(currentRequest));
 assert.ok(index.includes(controllerBlock));
 assert.ok(index.includes(currentApply));
 assert.ok(index.includes('transportTempoController.settleOnStop();'));
 assert.ok(index.includes('transportTempoController.resetForStart();'));
 assert.ok(index.includes('transportTempoController.schedulePendingAtStep(step,when);'));
 assert.ok(legacyRequest.length>currentRequest.length);
 assert.ok(legacyApply.length>currentApply.length);
 assert.ok(legacyTempoPulse.includes('pendingBpm'));
});

test('preserva o arquivo de BPM no SERVICE WORKER e atualiza somente a versão vigente',function(){
 const currentSw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.ok(currentSw.includes('    "./js/transport/tempo.js",'));
 const currentManifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
 assert.equal(currentManifest.version,'3.15.41');
});

test('todos os demais recursos funcionais permanecem byte a byte iguais',function(){
 const files=['offline.html','manual-gera.html','js/chords.js','js/state.js','js/transport/clock.js','js/transport/scheduler.js','js/transport/boundaries.js','js/audio/core.js','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'];
 files.forEach(function(file){
  assert.deepEqual(fs.readFileSync(path.join(root,file)),fs.readFileSync(path.join(baselineRoot,file)),file);
 });
});
