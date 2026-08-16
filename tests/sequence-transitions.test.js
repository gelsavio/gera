'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const test=require('node:test');

const root=path.resolve(__dirname,'..');
const baselineRoot=path.resolve(root,'..','GERA-PWA-v3.15.11-etapa-6H-coordenacao-transporte');
const source=fs.readFileSync(path.join(root,'js/transport/sequence-transitions.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

const context={};context.window=context;
vm.createContext(context);
vm.runInContext(source,context,{filename:'sequence-transitions.js'});
const resolveEnd=context.GeraSequenceTransitions.resolveEnd;

function state(overrides){
 return Object.assign({
  currentRepetition:1,
  holdLoop:false,
  queuedSection:'',
  plan:{active:false},
  group:{active:false},
  targetPasses:1,
  configuredNext:'',
  configuredTarget:1,
  configuredNextIsValid:false,
  auto:false,
  autoEnd:false,
  autoTarget:0,
  automaticNext:'',
  automaticNextTarget:0
 },overrides||{});
}

test('carregar o planejador não inicia áudio, transporte, DOM nem temporizadores',function(){
 assert.doesNotMatch(source,/AudioContext|audioCtx|createVoice|playDrum|document\.|querySelector|localStorage|setTimeout|setInterval|requestAnimationFrame/);
});

test('loop da seção prevalece sobre filas, configuração e modos automáticos',function(){
 const result=resolveEnd(state({currentRepetition:3,holdLoop:true,queuedSection:'chorus',configuredNext:'stop',autoEnd:true}));
 assert.deepEqual(JSON.parse(JSON.stringify(result)),{type:'repeat-hold',repetition:4});
});

test('troca manual espera todas as repetições e depois seleciona a seção enfileirada',function(){
 assert.deepEqual(JSON.parse(JSON.stringify(resolveEnd(state({currentRepetition:1,queuedSection:'chorus',targetPasses:3})))),{
  type:'repeat-before-manual',repetition:2,targetPasses:3,nextSection:'chorus'
 });
 assert.deepEqual(JSON.parse(JSON.stringify(resolveEnd(state({currentRepetition:3,queuedSection:'chorus',targetPasses:3})))),{
  type:'switch-manual',targetPasses:3,nextSection:'chorus'
 });
});

test('roteiro respeita repetições internas, troca de bloco, loop e parada',function(){
 assert.equal(resolveEnd(state({currentRepetition:1,targetPasses:2,plan:{active:true,nextSection:'prechorus',nextCursor:1,blockIndex:0,blockPass:1,blockTarget:3}})).type,'repeat-before-plan');
 assert.deepEqual(JSON.parse(JSON.stringify(resolveEnd(state({currentRepetition:2,targetPasses:2,plan:{active:true,nextSection:'prechorus',nextCursor:1,blockIndex:0,blockPass:1,blockTarget:3}})))),{
  type:'switch-plan',nextSection:'prechorus',planCursor:1,blockIndex:0,blockPass:1,blockTarget:3,loopedBlock:false,loopedSong:false
 });
 assert.equal(resolveEnd(state({plan:{active:true,nextSection:'verse',nextCursor:0,blockIndex:0,blockPass:1,blockTarget:3,loopedBlock:true}})).loopedBlock,true);
 assert.equal(resolveEnd(state({plan:{active:true,stop:true,blockTarget:2}})).type,'stop-plan');
});

test('conjunto repete A e B três vezes antes de seguir para C',function(){
 assert.equal(resolveEnd(state({currentRepetition:1,targetPasses:2,group:{active:true,nextSection:'prechorus',nextPass:1,targetPasses:3}})).type,'repeat-before-group');
 assert.deepEqual(JSON.parse(JSON.stringify(resolveEnd(state({currentRepetition:2,targetPasses:2,group:{active:true,nextSection:'prechorus',nextPass:1,targetPasses:3}})))),{
  type:'switch-group',nextSection:'prechorus',groupPass:1,groupTarget:3
 });
 assert.deepEqual(JSON.parse(JSON.stringify(resolveEnd(state({group:{active:true,nextSection:'verse',nextPass:2,targetPasses:3}})))),{
  type:'switch-group',nextSection:'verse',groupPass:2,groupTarget:3
 });
 assert.deepEqual(JSON.parse(JSON.stringify(resolveEnd(state({group:{active:true,completed:true,nextSection:'chorus',nextPass:1,targetPasses:3}})))),{
  type:'complete-group',nextSection:'chorus',groupPass:1,groupTarget:3
 });
 assert.equal(resolveEnd(state({group:{active:true,completed:true,nextSection:'',targetPasses:3}})).type,'stop-group');
});

test('loop e troca manual prevalecem sobre o conjunto',function(){
 const group={active:true,nextSection:'verse',nextPass:2,targetPasses:3};
 assert.equal(resolveEnd(state({holdLoop:true,group:group})).type,'repeat-hold');
 assert.equal(resolveEnd(state({queuedSection:'chorus',group:group})).type,'switch-manual');
});

test('próxima seção configurada preserva repetição, parada e troca',function(){
 assert.equal(resolveEnd(state({currentRepetition:1,configuredNext:'prechorus',configuredTarget:2,configuredNextIsValid:true})).type,'repeat-before-configured');
 assert.equal(resolveEnd(state({currentRepetition:2,configuredNext:'stop',configuredTarget:2})).type,'stop-configured');
 const change=resolveEnd(state({currentRepetition:2,configuredNext:'prechorus',configuredTarget:2,configuredNextIsValid:true}));
 assert.equal(change.type,'switch-configured');
 assert.equal(change.nextSection,'prechorus');
});

test('AUTO e AUTO FIM preservam repetições, avanço e encerramento',function(){
 assert.equal(resolveEnd(state({currentRepetition:1,auto:true,autoTarget:2,automaticNext:'chorus',automaticNextTarget:4})).type,'repeat-auto');
 const advance=resolveEnd(state({currentRepetition:2,auto:true,autoTarget:2,automaticNext:'chorus',automaticNextTarget:4}));
 assert.deepEqual(JSON.parse(JSON.stringify(advance)),{type:'switch-auto',nextSection:'chorus',targetPasses:4});
 assert.equal(resolveEnd(state({auto:true})).type,'stop-auto-empty');
 assert.equal(resolveEnd(state({autoEnd:true})).type,'stop-auto-end');
});

test('sem fila nem automação mantém a repetição contínua legada',function(){
 assert.deepEqual(JSON.parse(JSON.stringify(resolveEnd(state({currentRepetition:12})))),{type:'repeat-continuous',repetition:13});
});

test('precedência das decisões coincide com a árvore legada em combinações representativas',function(){
 const cases=[
  state({holdLoop:true,queuedSection:'chorus',configuredNext:'stop',autoEnd:true}),
  state({currentRepetition:1,queuedSection:'chorus',targetPasses:2,configuredNext:'stop',auto:true}),
  state({currentRepetition:2,queuedSection:'chorus',targetPasses:2,configuredNext:'stop',auto:true}),
  state({currentRepetition:1,configuredNext:'stop',configuredTarget:2,auto:true}),
  state({currentRepetition:2,configuredNext:'stop',configuredTarget:2,auto:true}),
  state({currentRepetition:2,configuredNext:'bridge',configuredTarget:2,configuredNextIsValid:true,autoEnd:true}),
  state({currentRepetition:1,auto:true,autoTarget:4,automaticNext:'chorus',automaticNextTarget:2}),
  state({currentRepetition:4,auto:true,autoTarget:4,automaticNext:'chorus',automaticNextTarget:2}),
  state({currentRepetition:4,autoEnd:true,autoTarget:4}),
  state({currentRepetition:9})
 ];
 const expected=['repeat-hold','repeat-before-manual','switch-manual','repeat-before-configured','stop-configured','switch-configured','repeat-auto','switch-auto','stop-auto-end','repeat-continuous'];
 assert.deepEqual(cases.map(function(item){return resolveEnd(item).type}),expected);
});

test('comparação exaustiva preserva a decisão legada em todas as combinações de controle',function(){
 function legacyType(item){
  if(item.holdLoop)return 'repeat-hold';
  if(item.queuedSection){
   if(item.currentRepetition<item.targetPasses)return 'repeat-before-manual';
   return 'switch-manual';
  }
  if(item.configuredNext&&item.currentRepetition<item.configuredTarget)return 'repeat-before-configured';
  if(item.configuredNext==='stop')return 'stop-configured';
  if(item.configuredNext&&item.configuredNextIsValid)return 'switch-configured';
  if(item.auto||item.autoEnd){
   if(item.autoTarget>0&&item.currentRepetition<item.autoTarget)return 'repeat-auto';
   if(!item.automaticNext)return item.autoEnd?'stop-auto-end':'stop-auto-empty';
   return 'switch-auto';
  }
  return 'repeat-continuous';
 }
 let compared=0;
 [0,1,2,3,4].forEach(function(currentRepetition){
  [false,true].forEach(function(holdLoop){
   ['', 'chorus'].forEach(function(queuedSection){
    [1,2,3].forEach(function(targetPasses){
     ['', 'stop', 'bridge', 'invalid'].forEach(function(configuredNext){
      [false,true].forEach(function(configuredNextIsValid){
       [false,true].forEach(function(auto){
        [false,true].forEach(function(autoEnd){
         [0,1,3].forEach(function(autoTarget){
          ['', 'section5'].forEach(function(automaticNext){
           const item=state({currentRepetition:currentRepetition,holdLoop:holdLoop,queuedSection:queuedSection,targetPasses:targetPasses,configuredNext:configuredNext,configuredTarget:targetPasses,configuredNextIsValid:configuredNextIsValid,auto:auto,autoEnd:autoEnd,autoTarget:autoTarget,automaticNext:automaticNext,automaticNextTarget:2});
           assert.equal(resolveEnd(item).type,legacyType(item));
           compared++;
          });
         });
        });
       });
      });
     });
    });
   });
  });
 });
 assert.equal(compared,11520);
});

test('o núcleo conserva todos os efeitos e usa o planejador somente no fim da seção',function(){
 assert.ok(index.includes('const sequenceTransition=GeraSequenceTransitions.resolveEnd({'));
 assert.ok(index.includes("if(sequenceTransition.type==='repeat-hold')"));
 assert.ok(index.includes("}else if(sequenceTransition.type==='switch-manual')"));
 assert.ok(index.includes("}else if(sequenceTransition.type==='switch-configured')"));
 assert.ok(index.includes("}else if(sequenceTransition.type==='switch-auto')"));
 assert.ok(index.includes('applySectionDrumConfig(nextSection,true);'));
 assert.ok(index.includes('saveChordSequence();'));
 assert.ok(index.includes('syncSequenceSectionButtons();'));
 assert.ok(index.includes('scheduleSequenceDrumOverlay(\'entry\''));
});

test('módulo carrega depois do consumidor da sequência e antes do coordenador',function(){
 const consumer=index.indexOf('<script src="./js/transport/chord-sequence-sync.js"></script>');
 const transitions=index.indexOf('<script src="./js/transport/sequence-transitions.js"></script>');
 const coordinator=index.indexOf('<script src="./js/transport/coordinator.js"></script>');
 assert.ok(consumer>=0&&transitions>consumer&&coordinator>transitions);
});

test('reversão exclusiva da 6I recompõe a versão 3.15.11 byte a byte',function(){
 const stage6iRoot=path.resolve(root,'..','GERA-PWA-v3.15.12-etapa-6I-transicoes-sequencias');
 const stage6iIndex=fs.readFileSync(path.join(stage6iRoot,'index.html'),'utf8');
 const baselineIndex=fs.readFileSync(path.join(baselineRoot,'index.html'),'utf8');
 const currentStart=stage6iIndex.indexOf('  const sequenceTransition=GeraSequenceTransitions.resolveEnd({');
 const currentEnd=stage6iIndex.indexOf(' }\n\n sequenceIndex=index;',currentStart);
 const baselineStart=baselineIndex.indexOf('  if(sequenceHoldLoop){');
 const baselineEnd=baselineIndex.indexOf(' }\n\n sequenceIndex=index;',baselineStart);
 assert.ok(currentStart>=0&&currentEnd>currentStart&&baselineStart>=0&&baselineEnd>baselineStart);
 const reconstructedIndex=(stage6iIndex.slice(0,currentStart)+baselineIndex.slice(baselineStart,baselineEnd)+stage6iIndex.slice(currentEnd))
  .replaceAll('3.15.12','3.15.11')
  .replace('<script src="./js/transport/sequence-transitions.js"></script>\n','');
 const reconstructedSw=fs.readFileSync(path.join(stage6iRoot,'sw.js'),'utf8')
  .replace("'v3.15.12'","'v3.15.11'")
  .replace('    "./js/transport/sequence-transitions.js",\n','');
 const reconstructedManifest=fs.readFileSync(path.join(stage6iRoot,'manifest.json'),'utf8').replace('"3.15.12"','"3.15.11"');
 assert.equal(reconstructedIndex,baselineIndex);
 assert.equal(reconstructedSw,fs.readFileSync(path.join(baselineRoot,'sw.js'),'utf8'));
 assert.equal(reconstructedManifest,fs.readFileSync(path.join(baselineRoot,'manifest.json'),'utf8'));
});

test('módulo de transições permanece no pré-cache da versão 3.15.41',function(){
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.ok(sw.includes('    "./js/transport/sequence-transitions.js",'));
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.41';"));
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')).version,'3.15.41');
});
