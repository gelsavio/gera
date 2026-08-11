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
 const marker='function '+name+'(';
 let start=index.indexOf(marker);
 assert.ok(start>=0,'função '+name+' ausente');
 if(index.slice(Math.max(0,start-6),start)==='async ')start-=6;
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

function baseScript(){
 return [
  "let activeSequenceSection='verse'",
  "let currentSongName='Origem'",
  "let sequenceClipboard=null",
  "let sequenceSections={verse:[{root:0,type:'major',label:'C',fraction:.5,playMode:'together',octave:1,text:'Linha',textRepeat:2}],chorus:[{pause:true,label:'Pausa',fraction:1}]} ",
  "let sequenceRepeats={verse:3,chorus:1}",
  "let sequenceDrums={verse:{padrao:'rock',entrada:'fill',saida:'fillHalf',final:'ending',instrumento:'organ',proxima:'chorus'},chorus:{padrao:'reggae',entrada:null,saida:null,final:null,instrumento:'piano',proxima:''}}",
  'let sequenceRecordPreviewActive=false',
  'let sequencePlaying=false',
  'let sequenceStartQueued=false',
  'let sequenceRecording=true',
  'let sequenceRecordStartLength=0',
  'let sequenceRecordLatestIndex=-1',
  'let sequenceIndex=-1',
  'let currentSectionRepetition=1',
  "const SEQUENCE_SECTION_LABELS={verse:'A',chorus:'C'}",
  "function currentChordSequence(){return sequenceSections[activeSequenceSection]||[]}",
  "function sectionRepeatValue(section){return sequenceRepeats[section]||0}",
  "function normalizeSectionDrum(value){return JSON.parse(JSON.stringify(value))}",
  "function normalizeSequenceItem(item){return JSON.parse(JSON.stringify(item))}"
 ].join(';')+';';
}

async function runPaste(mode){
 const calls=[];
 const pasteButton={disabled:true,title:''};
 const context={
  calls:calls,
  result:null,
  JSON:JSON,
  byId:function(id){return id==='sequence-record-paste'?pasteButton:null},
  setStatus:function(message){calls.push('status:'+message)},
  closeSequencePasteDialog:function(){calls.push('close')},
  appConfirm:function(){calls.push('confirm');return Promise.resolve(true)},
  stopChordSequence:function(){calls.push('stop')},
  syncSequenceRecordButton:function(){},syncSequenceRecordPreviewButton:function(){},
  saveChordSequence:function(){calls.push('save')},syncSequenceRepeatInputs:function(){},
  syncSequenceSectionButtons:function(){},syncSectionDrumControls:function(){},renderChordSequence:function(){},
  renderSequenceRecordExisting:function(){},syncSequenceRecordSummary:function(){},renderRedesignSequenceTimeline:function(){}
 };
 vm.createContext(context);
 const source=baseScript()+
  extractFunction('syncSequenceClipboardControls')+';'+
  extractFunction('copyActiveSequenceToClipboard')+';'+
  extractFunction('pasteSequenceFromClipboard')+';'+
  '(async function(){copyActiveSequenceToClipboard();activeSequenceSection="chorus";await pasteSequenceFromClipboard("'+mode+'");'+
  'result={sections:sequenceSections,repeats:sequenceRepeats,drums:sequenceDrums,clipboard:sequenceClipboard,pasteDisabled:'+JSON.stringify(pasteButton.disabled)+'};})();';
 const promise=vm.runInContext(source,context);
 await promise;
 context.result.pasteDisabled=pasteButton.disabled;
 return{result:context.result,calls:calls};
}

test('campo harmônico do editor usa círculo e mantém acordes à direita',function(){
 assert.match(index,/class="sequence-record-roots sequence-record-dial"/);
 assert.match(index,/sequence-record-harmonic-layout[\s\S]*sequence-record-dial-block[\s\S]*sequence-record-chord-stack/);
 assert.match(css,/\.sequence-record-harmonic-layout\{display:grid;grid-template-columns:280px minmax\(0,1fr\)/);
 assert.match(css,/\.sequence-record-roots\.sequence-record-dial button\{[\s\S]*rotate\(var\(--a\)\)/);
 assert.match(index,/button\.style\.setProperty\('--a',\(index\*30\)\+'deg'\)/);
});

test('cópia substituindo clona itens, repetição e configurações da sequência',async function(){
 const run=await runPaste('replace');
 const result=run.result;
 assert.equal(JSON.stringify(result.sections.chorus),JSON.stringify(result.sections.verse));
 assert.notEqual(result.sections.chorus,result.sections.verse);
 assert.equal(result.repeats.chorus,3);
 assert.equal(JSON.stringify(result.drums.chorus),JSON.stringify(result.drums.verse));
 assert.equal(run.calls.includes('confirm'),true);
 assert.equal(result.pasteDisabled,false);
});

test('cópia ao final acrescenta itens e preserva repetição e configurações do destino',async function(){
 const run=await runPaste('append');
 const result=run.result;
 assert.equal(result.sections.chorus.length,2);
 assert.equal(result.sections.chorus[0].pause,true);
 assert.equal(result.sections.chorus[1].text,'Linha');
 assert.equal(result.repeats.chorus,1);
 assert.equal(result.drums.chorus.padrao,'reggae');
 assert.equal(run.calls.includes('confirm'),false);
});

test('interface oferece copiar, colar, substituir e acrescentar perto de Zerar sequência',function(){
 const footer=index.slice(index.indexOf('<div class="sequence-record-footer-actions">'),index.indexOf('</div>',index.indexOf('<div class="sequence-record-footer-actions">')));
 assert.ok(footer.indexOf('sequence-record-copy')<footer.indexOf('sequence-record-clear-all'));
 assert.ok(footer.indexOf('sequence-record-paste')<footer.indexOf('sequence-record-clear-all'));
 assert.match(index,/id="sequence-record-paste"[^>]*disabled/);
 assert.match(index,/id="sequence-paste-replace"[\s\S]*Colar substituindo/);
 assert.match(index,/id="sequence-paste-append"[\s\S]*Colar ao final/);
});

test('área de transferência permanece disponível entre músicas e Cancelar restaura configurações',function(){
 const loadStart=index.indexOf('function loadSong(name){');
 const loadEnd=index.indexOf('let appConfirmResolver=',loadStart);
 const loadSource=index.slice(loadStart,loadEnd);
 assert.doesNotMatch(loadSource,/sequenceClipboard\s*=/);
 assert.match(index,/sequenceRecordSnapshot=\{[\s\S]*repeats:JSON\.parse\(JSON\.stringify\(sequenceRepeats\)\)[\s\S]*drums:JSON\.parse\(JSON\.stringify\(sequenceDrums\)\)/);
 assert.match(index,/sequenceRepeats=JSON\.parse\(JSON\.stringify\(sequenceRecordSnapshot\.repeats\)\)/);
 assert.match(index,/sequenceDrums=JSON\.parse\(JSON\.stringify\(sequenceRecordSnapshot\.drums\)\)/);
});

test('versão, cache e manifesto foram atualizados para 3.15.33',function(){
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
 assert.equal(manifest.version,'3.15.33');
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.33';"));
 assert.equal((index.match(/v3\.15\.33/g)||[]).length,3);
});
