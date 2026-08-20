'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const transitions=fs.readFileSync(path.join(root,'js','transport','sequence-transitions.js'),'utf8');

test('interface configura início, fim, repetições e destino do conjunto',function(){
 ['sequence-group-enabled','sequence-group-start','sequence-group-end','sequence-group-repeats','sequence-group-next','sequence-group-summary'].forEach(function(id){
  assert.match(index,new RegExp('id="'+id+'"'));
 });
 assert.match(index,/function updateSequenceGroupFromControls\(\)/);
 assert.match(index,/bindSequenceGroupControls\(\)/);
});

test('estado do conjunto participa do espaço de trabalho, música e JSON portátil',function(){
 assert.match(index,/sequenceGroup:normalizedSequenceGroup\(sequenceGroup\)/);
 assert.match(index,/sequenceGroup:JSON\.parse\(JSON\.stringify\(normalizedSequenceGroup\(sequenceGroup\)\)\)/);
 assert.match(index,/sequenceGroup:normalizedSequenceGroup\(data\.sequenceGroup,importedOrder\)/);
 assert.match(index,/formatVersion:27/);
 assert.match(index,/formatVersion:10/);
});

test('transporte dá prioridade ao conjunto depois de loop e escolha manual',function(){
 const hold=transitions.indexOf('if(state.holdLoop)');
 const manual=transitions.indexOf('if(state.queuedSection)');
 const plan=transitions.indexOf('if(state.plan&&state.plan.active)');
 const group=transitions.indexOf('if(state.group&&state.group.active)');
 const configured=transitions.indexOf('if(state.configuredNext&&current<state.configuredTarget)');
 assert.ok(hold>=0&&manual>hold&&plan>manual&&group>plan&&configured>group);
 assert.match(index,/group:playbackPlanRuntimeActive\?\{active:false\}:sequenceGroupTransitionState\(activeSequenceSection\)/);
 assert.match(index,/sequenceTransition\.type==='switch-group'\|\|sequenceTransition\.type==='complete-group'/);
});

test('salvamento automático atualiza a música nomeada após 700 ms',function(){
 assert.match(index,/songAutosaveTimer=setTimeout\(function\(\)\{flushCurrentSongSave\(false\)\},700\)/);
 assert.match(index,/songs\[currentSongName\]=Object\.assign\(\{\},snapshotCurrentSequence\(\),\{bpm:currentSongBpmForSave\(\)\}\)/);
 assert.match(index,/function saveChordSequence\(\)\{[\s\S]*markCurrentSongDirty\(\)/);
 assert.match(index,/visibilitychange/);
 assert.match(index,/beforeunload/);
});

test('salvamento manual e indicador permanecem visíveis',function(){
 assert.match(index,/id="song-save-now"/);
 assert.match(index,/id="redesign-save-song"/);
 assert.match(index,/id="song-save-state"[^>]*aria-live="polite"/);
 assert.match(index,/saveCurrentSong:saveCurrentSongNow/);
 assert.match(index,/Alterações não salvas/);
 assert.match(index,/Salvando\.\.\./);
 assert.match(index,/Erro ao salvar/);
});

test('troca com conteúdo pendente continua bloqueada quando o salvamento falha',function(){
 assert.match(index,/else if\(!flushCurrentSongSave\(false\)\)\{/);
 assert.match(index,/Salve a música atual antes de carregar outra/);
});
