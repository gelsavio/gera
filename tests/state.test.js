/*
 * Testes do estado compartilhado inicial. Não dependem de DOM nem de áudio.
 */
'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function loadState(){
 const window={};
 const context=vm.createContext({window:window});
 const source=fs.readFileSync(path.join(__dirname,'..','js','state.js'),'utf8');
 vm.runInContext(source,context,{filename:'state.js'});
 return window;
}

test('inicializa os três valores de andamento com os valores legados',function(){
 const window=loadState();
 assert.equal(window.bpm,100);
 assert.equal(window.transportTempoBpm,100);
 assert.equal(window.pendingBpm,null);
});

test('os nomes globais legados leem a fonte única',function(){
 const window=loadState();
 window.GeraState.tempo.bpm=126;
 window.GeraState.tempo.transportTempoBpm=124;
 window.GeraState.tempo.pendingBpm=120;
 assert.equal(window.bpm,126);
 assert.equal(window.transportTempoBpm,124);
 assert.equal(window.pendingBpm,120);
});

test('as escritas pelos nomes legados atualizam a fonte única sem coerção',function(){
 const window=loadState();
 window.bpm='88';
 window.transportTempoBpm=91.5;
 window.pendingBpm=null;
 assert.equal(window.GeraState.tempo.bpm,'88');
 assert.equal(window.GeraState.tempo.transportTempoBpm,91.5);
 assert.equal(window.GeraState.tempo.pendingBpm,null);
});

test('os identificadores globais usados pelos scripts clássicos continuam ativos',function(){
 const sandbox={};
 const context=vm.createContext(sandbox);
 context.window=context;
 const source=fs.readFileSync(path.join(__dirname,'..','js','state.js'),'utf8');
 vm.runInContext(source,context,{filename:'state.js'});
 assert.equal(vm.runInContext('bpm',context),100);
 vm.runInContext('bpm=132; transportTempoBpm=128; pendingBpm=126',context);
 assert.equal(context.GeraState.tempo.bpm,132);
 assert.equal(context.GeraState.tempo.transportTempoBpm,128);
 assert.equal(context.GeraState.tempo.pendingBpm,126);
});
