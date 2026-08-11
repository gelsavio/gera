'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles','inline-style-01.css'),'utf8');

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

test('modal oferece seletor de oitavas -2 a +3 junto aos acordes',function(){
 const layout=index.slice(index.indexOf('<div class="sequence-record-chord-stack">'),index.indexOf('<div id="sequence-record-secondary-chords"'));
 assert.match(layout,/id="sequence-record-chord-octave"/);
 [-2,-1,0,1,2,3].forEach(function(value){assert.match(layout,new RegExp('option value="'+value+'"'))});
 assert.ok(layout.indexOf('sequence-record-chord-octave')<layout.indexOf('sequence-record-chords'));
 assert.match(css,/\.sequence-record-chord-tools\{/);
});

test('acorde inserido recebe a oitava própria escolhida no modal',function(){
 const saved=[];
 const section=[];
 const context={
  sequenceRecording:true,
  octave:-1,
  chordMode:'together',
  activeSequenceSection:'verse',
  SEQUENCE_SECTION_LABELS:{verse:'A'},
  chordLabel:function(){return 'C'},
  sequenceEntryDuration:function(){return 1},
  durationLabel:function(){return 'um'},
  clampSequenceOctave:function(value){return Math.max(-2,Math.min(3,Number(value)||0))},
  currentChordSequence:function(){return section},
  saveChordSequence:function(){saved.push('save')},
  renderChordSequence:function(){},
  setStatus:function(){},
  button:{classList:{contains:function(name){return name==='chord'}},dataset:{}}
 };
 vm.createContext(context);
 vm.runInContext(extractFunction('addChordToSequence')+';addChordToSequence(0,"major",button,2);',context);
 assert.equal(section.length,1);
 assert.equal(section[0].octave,2);
 assert.equal(saved.length,1);
});

test('itens antigos continuam usando oitava global quando não há escolha explícita',function(){
 const section=[];
 const context={
  sequenceRecording:true,
  octave:-1,
  chordMode:'together',
  activeSequenceSection:'verse',
  SEQUENCE_SECTION_LABELS:{verse:'A'},
  chordLabel:function(){return 'C'},durationLabel:function(){return 'um'},
  sequenceEntryDuration:function(){return 1},
  clampSequenceOctave:function(value){return Math.max(-2,Math.min(3,Number(value)||0))},
  currentChordSequence:function(){return section},saveChordSequence:function(){},renderChordSequence:function(){},setStatus:function(){},
  button:{classList:{contains:function(){return true}},dataset:{}}
 };
 vm.createContext(context);
 vm.runInContext(extractFunction('addChordToSequence')+';addChordToSequence(0,"major",button);',context);
 assert.equal(section[0].octave,-1);
});

test('pré-escuta do acorde recebe a mesma oitava gravada',function(){
 assert.match(extractFunction('addRecordChord'),/handleChordButton\(root,type,button,pointerId,sequenceRecordChordOctave\)/);
 assert.match(extractFunction('handleChordButton'),/addChordToSequence\(root,type,button,octaveOverride\)/);
 assert.match(extractFunction('handleChordButton'),/playChord\(root,type,button,false,pointerId,octaveOverride\)/);
 assert.match(extractFunction('playChord'),/chordNotes\(root,type,button,octaveOverride\)/);
});
