'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles','inline-style-01.css'),'utf8');

test('teclado de 61 teclas oferece as três opções de sustain',function(){
 const keyboardTabStart=index.indexOf('id="redesign-tab-teclado"');
 const keyboardTabEnd=index.indexOf('id="redesign-tab-bateria"',keyboardTabStart);
 const keyboardTab=index.slice(keyboardTabStart,keyboardTabEnd);
 ['keyboard-sustain-pressed','keyboard-sustain-hold','keyboard-sustain-next'].forEach(function(id){
  assert.match(keyboardTab,new RegExp('id="'+id+'"'));
 });
 assert.match(keyboardTab,/>Pressionada<\/button>/);
 assert.match(keyboardTab,/>Liberação<\/button>/);
 assert.match(keyboardTab,/>Até próxima<\/button>/);
});

test('seletor do teclado usa o mesmo estado e comando dos Ajustes',function(){
 assert.match(index,/function syncKeyboardSustainControls\(\)/);
 assert.match(index,/button\.onclick=function\(\)\{selectSustainMode\(button\.dataset\.keyboardSustain\)\}/);
 assert.match(index,/syncKeyboardSustainControls\(\);\$\('chord-together'\)/);
 assert.match(css,/\.redesign-keyboard-sustain-options button\.active/);
 assert.match(index,/class="control compact redesign-keyboard-sustain"/);
 assert.match(index,/class="button-triple sustain-modes redesign-keyboard-sustain-options"/);
 assert.match(css,/background:var\(--rd-accent-bg\)!important;color:var\(--rd-accent\)!important/);
});
