'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const chords=require('../js/chords.js');

test('preserva nomes, intervalos, graus e dominantes secundários',function(){
 assert.deepEqual(chords.CHORD_NAMES,["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]);
 assert.deepEqual(chords.CHORD_INTERVALS.dominant7,[0,4,7,10]);
 assert.deepEqual(chords.CIRCLE_DEGREES,[{step:0,type:'major'},{step:2,type:'minor'},{step:4,type:'minor'},{step:5,type:'major'},{step:7,type:'major'},{step:9,type:'minor'},{step:11,type:'diminished'}]);
 assert.deepEqual(chords.SECONDARY_DOMINANTS,[{targetStep:2,targetType:'minor',degree:'V/ii'},{targetStep:4,targetType:'minor',degree:'V/iii'},{targetStep:5,targetType:'major',degree:'V/IV'},{targetStep:7,targetType:'major',degree:'V/V'},{targetStep:9,targetType:'minor',degree:'V/vi'}]);
});

test('forma acordes e inversões sem alterar as entradas',function(){
 assert.deepEqual(chords.basicChordNotes(0,'major',0),[0,4,7]);
 assert.deepEqual(chords.basicChordNotes(0,'major',1),[4,7,12]);
 assert.deepEqual(chords.basicChordNotes(9,'minor7',2),[16,19,21,24]);
});

test('mantém os rótulos dos acordes e nomes normalizados das notas',function(){
 assert.equal(chords.chordLabel(1,'dominant7'),'C#7');
 assert.equal(chords.chordLabel(10,'diminished'),'A#°');
 assert.equal(chords.chordLabel(9,'minor'),'Am');
 assert.equal(chords.normalizedNoteName(-1),'Si');
 assert.equal(chords.normalizedNoteName(12),'Dó');
});

test('limita oitavas e ajusta notas à extensão do teclado de 61 teclas',function(){
 assert.equal(chords.clampSequenceOctave(8),3);
 assert.equal(chords.clampSequenceOctave(-8),-2);
 assert.equal(chords.clampSequenceNoteOctave(11,3),2);
 assert.deepEqual(chords.fitChordNotesToKeyboard61([9,13,16],3),[21,25,28]);
 assert.deepEqual(chords.fitChordNotesToKeyboard61([],2),[]);
 assert.equal(chords.sequenceOctaveLabel(2),'+2');
});

test('preserva voicings ascendentes e formas de violão',function(){
 assert.deepEqual(chords.ascendingVoicing([7,4,0]),[7,16,24]);
 assert.deepEqual(chords.guitarChordNotes(4,'major'),[-20,-13,-8,-4,-1,4]);
 assert.deepEqual(chords.guitarChordNotes(9,'minor'),[-15,-8,-3,0,4]);
});

test('calcula voicing próximo para dominante secundário',function(){
 assert.deepEqual(chords.nearestSecondaryVoicing(9,2,'minor',0),[4,7,9,13]);
 assert.deepEqual(chords.nearestSecondaryVoicing(4,9,'minor',1),[14,16,20,23]);
});
