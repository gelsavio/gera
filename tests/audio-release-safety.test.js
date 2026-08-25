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

function runRelease(options={}){
 const calls=[];
 const gain={
  value:options.gainValue===undefined?NaN:options.gainValue,
  cancelScheduledValues:function(time){calls.push(['cancel',time]);if(options.throwGain)throw new Error('ganho inválido')},
  setValueAtTime:function(value,time){calls.push(['set',value,time])},
  exponentialRampToValueAtTime:function(value,time){
   if(!Number.isFinite(value)||!Number.isFinite(time))throw new TypeError('valor não finito');
   calls.push(['ramp',value,time]);
  }
 };
 const source={stop:function(time){calls.push(['stop',time])}};
 const voice={out:{gain:gain},sources:[source],releaseScale:options.releaseScale,semi:0,stopped:options.stopped===true};
 const context={
  calls:calls,
  voice:voice,
  releaseMs:options.configuredRelease,
  audioCtx:{currentTime:options.currentTime===undefined?10:options.currentTime},
  activeVoices:new Set([voice]),
  pointerVoices:new Map(),
  pointerLastKey:new Map(),
  pressedKeys:new Map(),
  syncKeyFlash:function(){calls.push(['flash'])},
  setTimeout:function(callback,delay){calls.push(['timer',delay]);callback()},
  Number:Number,
  Array:Array,
  Math:Math
 };
 vm.createContext(context);
 vm.runInContext(extractFunction('releaseVoice')+';releaseVoice(voice,NaN);',context);
 return {calls:calls,voice:voice,activeVoices:context.activeVoices};
}

test('liberação converte ganho e tempo inválidos em valores finitos',function(){
 const result=runRelease({gainValue:NaN,configuredRelease:NaN,releaseScale:NaN});
 const set=result.calls.find(function(call){return call[0]==='set'});
 const ramp=result.calls.find(function(call){return call[0]==='ramp'});
 const stop=result.calls.find(function(call){return call[0]==='stop'});
 assert.deepEqual(set,['set',.001,10]);
 assert.ok(Number.isFinite(ramp[2]));
 assert.ok(Number.isFinite(stop[1]));
 assert.equal(result.activeVoices.size,0);
});

test('uma falha no envelope não impede a parada física da fonte',function(){
 const result=runRelease({throwGain:true,configuredRelease:650,stopped:true});
 assert.ok(result.calls.some(function(call){return call[0]==='stop'}));
 assert.equal(result.voice.out.gain.value,0);
 assert.equal(result.activeVoices.size,0);
});

test('núcleo usa a ponte da interface em vez de chamar funções privadas',function(){
 const load=extractFunction('loadSequenceItem');
 assert.match(load,/finishActiveSequenceRecordPreview\('Prévia concluída · uma execução'\)/);
 assert.match(load,/renderActiveSequenceRecordEditor\(\)/);
 assert.doesNotMatch(load,/finishSequenceRecordPreview\(/);
 assert.doesNotMatch(load,/sequenceRecordPreviewActive\)renderSequenceRecordExisting\(/);
 assert.match(index,/sequenceRecordUiBridge\.render=renderSequenceRecordExisting/);
 assert.match(index,/sequenceRecordUiBridge\.finishPreview=finishSequenceRecordPreview/);
});

test('versão crítica usa cache novo para substituir a cópia defeituosa',function(){
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.54';"));
 assert.equal(manifest.version,'3.15.54');
});
