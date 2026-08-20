/*
 * GERA — teoria musical e formação pura de acordes.
 *
 * Este arquivo não acessa DOM, Web Audio API, localStorage nem estado de
 * execução. A propriedade global GeraChords mantém compatibilidade temporária
 * com os scripts clássicos do aplicativo e permite testes diretos no Node.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.GeraChords=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const CHORD_NAMES=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
 const NOTE_NAMES=["Dó","Dó#","Ré","Ré#","Mi","Fá","Fá#","Sol","Sol#","Lá","Lá#","Si","Dó²","Dó²#","Ré²","Ré²#","Mi²","Fá²","Fá²#","Sol²","Sol²#","Lá²","Lá²#","Si²"];
 const CHORD_INTERVALS={minor:[0,3,7],major:[0,4,7],minor7:[0,3,7,10],dominant7:[0,4,7,10],sus2:[0,2,7],sus4:[0,5,7],diminished:[0,3,6]};
 const KEYBOARD_61_MIN_SEMI=-24;
 const KEYBOARD_61_MAX_SEMI=36;
 const SEQUENCE_OCTAVE_MIN=-2;
 const SEQUENCE_OCTAVE_MAX=3;
 const CIRCLE_DEGREES=[{step:0,type:"major"},{step:2,type:"minor"},{step:4,type:"minor"},{step:5,type:"major"},{step:7,type:"major"},{step:9,type:"minor"},{step:11,type:"diminished"}];
 const SECONDARY_DOMINANTS=[{targetStep:2,targetType:"minor",degree:"V/ii"},{targetStep:4,targetType:"minor",degree:"V/iii"},{targetStep:5,targetType:"major",degree:"V/IV"},{targetStep:7,targetType:"major",degree:"V/V"},{targetStep:9,targetType:"minor",degree:"V/vi"}];
 const GUITAR_OPEN_STRINGS=[-20,-15,-10,-5,-1,4];
 const GUITAR_SHAPES={
  major:{e:[0,2,2,1,0,0],a:[null,0,2,2,2,0]},
  minor:{e:[0,2,2,0,0,0],a:[null,0,2,2,1,0]},
  dominant7:{e:[0,2,0,1,0,0],a:[null,0,2,0,2,0]},
  minor7:{e:[0,2,0,0,0,0],a:[null,0,2,0,1,0]},
  sus2:{e:[0,2,4,4,0,0],a:[null,0,2,2,0,0]},
  sus4:{e:[0,2,2,2,0,0],a:[null,0,2,2,3,0]}
 };

 function clampSequenceOctave(value){
  const number=Math.round(Number(value));
  if(!Number.isFinite(number))return 0;
  return Math.max(SEQUENCE_OCTAVE_MIN,Math.min(SEQUENCE_OCTAVE_MAX,number));
 }
 function clampSequenceNoteOctave(note,value){
  const pitchClass=((Math.round(Number(note))%12)+12)%12;
  let selected=clampSequenceOctave(value);
  let absolute=pitchClass+(selected*12);
  while(absolute<KEYBOARD_61_MIN_SEMI){
   selected++;
   absolute=pitchClass+(selected*12);
  }
  while(absolute>KEYBOARD_61_MAX_SEMI){
   selected--;
   absolute=pitchClass+(selected*12);
  }
  return clampSequenceOctave(selected);
 }
 function fitChordNotesToKeyboard61(notes,octaveValue){
  const source=Array.isArray(notes)?notes.slice():[];
  if(!source.length)return source;
  let shift=clampSequenceOctave(octaveValue)*12;
  let shifted=source.map(function(note){return Number(note)+shift});
  while(Math.max.apply(null,shifted)>KEYBOARD_61_MAX_SEMI){
   shift-=12;
   shifted=source.map(function(note){return Number(note)+shift});
  }
  while(Math.min.apply(null,shifted)<KEYBOARD_61_MIN_SEMI){
   shift+=12;
   shifted=source.map(function(note){return Number(note)+shift});
  }
  return shifted;
 }
 function sequenceOctaveLabel(value){
  const octaveValue=clampSequenceOctave(value);
  if(octaveValue>0)return '+'+octaveValue;
  return String(octaveValue);
 }
 function basicChordNotes(root,type,forcedInversion){
  const selectedType=type===undefined?'major':type;
  const selectedInversion=forcedInversion===undefined?0:forcedInversion;
  let notes=CHORD_INTERVALS[selectedType].map(function(n){return root+n});
  for(let i=0;i<selectedInversion;i++)notes.push(notes.shift()+12);
  return notes;
 }
 function nearestSecondaryVoicing(root,targetRoot,targetType,forcedInversion){
  const selectedInversion=forcedInversion===undefined?0:forcedInversion;
  const target=basicChordNotes(targetRoot,targetType,selectedInversion);
  const targetVoices=[].concat(target,[target[0]+12]).sort(function(a,b){return a-b});
  const base=CHORD_INTERVALS.dominant7.map(function(n){return root+n});
  let best=null,bestScore=Infinity;
  for(let inv=0;inv<4;inv++){
   let voiced=base.slice();
   for(let i=0;i<inv;i++)voiced.push(voiced.shift()+12);
   [-12,0,12].forEach(function(shift){
    const candidate=voiced.map(function(n){return n+shift}).sort(function(a,b){return a-b});
    if(candidate.some(function(n){return n<0||n>27}))return;
    const score=candidate.reduce(function(sum,n,i){return sum+Math.abs(n-targetVoices[i])},0)+Math.abs(candidate[0]-targetVoices[0])*.25;
    if(score<bestScore){bestScore=score;best=candidate}
   });
  }
  return best||base;
 }
 function guitarShapeCandidate(root,type,family){
  const familyShapes=GUITAR_SHAPES[type];
  const shape=familyShapes?familyShapes[family]:null;
  if(!shape)return null;
  const basePc=family==='e'?4:9,fret=(root-basePc+12)%12;
  const frets=shape.map(function(v){return v===null?null:v+fret});
  const sounding=frets.filter(function(v){return v!==null});
  return{notes:frets.map(function(f,i){return f===null?null:GUITAR_OPEN_STRINGS[i]+f}).filter(function(v){return v!==null}),score:Math.max.apply(null,sounding)*2+(Math.max.apply(null,sounding)-Math.min.apply(null,sounding))+(family==='a'?1:0)};
 }
 function genericGuitarVoicing(root,type){
  const pcs=new Set(CHORD_INTERVALS[type].map(function(n){return(root+n)%12}));
  const notes=[];
  let bassFound=false;
  GUITAR_OPEN_STRINGS.forEach(function(open){
   let chosen=null;
   for(let fret=0;fret<=12;fret++){
    const semi=open+fret,pc=((semi%12)+12)%12;
    if(!pcs.has(pc))continue;
    if(!bassFound&&pc!==root)continue;
    chosen=semi;
    break;
   }
   if(chosen===null&&!bassFound){
    for(let fret=0;fret<=12;fret++){
     const semi=open+fret,pc=((semi%12)+12)%12;
     if(pcs.has(pc)){chosen=semi;break}
    }
   }
   if(chosen!==null){notes.push(chosen);bassFound=true}
  });
  return notes.length>=4?notes:basicChordNotes(root,type,0);
 }
 function guitarChordNotes(root,type){
  const selectedType=type===undefined?'major':type;
  const candidates=['e','a'].map(function(f){return guitarShapeCandidate(root,selectedType,f)}).filter(Boolean).sort(function(a,b){return a.score-b.score});
  return candidates.length?candidates[0].notes:genericGuitarVoicing(root,selectedType);
 }
 function ascendingVoicing(notes){
  const result=[];
  (Array.isArray(notes)?notes:[]).forEach(function(note){
   let value=Number(note);
   if(!Number.isFinite(value))return;
   while(result.length&&value<=result[result.length-1])value+=12;
   result.push(value);
  });
  return result;
 }
 function chordLabel(root,type){
  const suffix={minor:"m",diminished:"°",dominant7:"7",minor7:"m7",sus2:"sus2",sus4:"sus4"}[type]||"";
  return CHORD_NAMES[root]+suffix;
 }
 function normalizedNoteName(value){
  const number=((Number(value)%12)+12)%12;
  return NOTE_NAMES[number]||CHORD_NAMES[number]||'C';
 }

 return{
  CHORD_NAMES:CHORD_NAMES,
  NOTE_NAMES:NOTE_NAMES,
  CHORD_INTERVALS:CHORD_INTERVALS,
  KEYBOARD_61_MIN_SEMI:KEYBOARD_61_MIN_SEMI,
  KEYBOARD_61_MAX_SEMI:KEYBOARD_61_MAX_SEMI,
  SEQUENCE_OCTAVE_MIN:SEQUENCE_OCTAVE_MIN,
  SEQUENCE_OCTAVE_MAX:SEQUENCE_OCTAVE_MAX,
  CIRCLE_DEGREES:CIRCLE_DEGREES,
  SECONDARY_DOMINANTS:SECONDARY_DOMINANTS,
  GUITAR_OPEN_STRINGS:GUITAR_OPEN_STRINGS,
  GUITAR_SHAPES:GUITAR_SHAPES,
  clampSequenceOctave:clampSequenceOctave,
  clampSequenceNoteOctave:clampSequenceNoteOctave,
  fitChordNotesToKeyboard61:fitChordNotesToKeyboard61,
  sequenceOctaveLabel:sequenceOctaveLabel,
  basicChordNotes:basicChordNotes,
  nearestSecondaryVoicing:nearestSecondaryVoicing,
  guitarShapeCandidate:guitarShapeCandidate,
  genericGuitarVoicing:genericGuitarVoicing,
  guitarChordNotes:guitarChordNotes,
  ascendingVoicing:ascendingVoicing,
  chordLabel:chordLabel,
  normalizedNoteName:normalizedNoteName
 };
});
