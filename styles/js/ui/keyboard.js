/**
 * Controlador da interface do teclado musical principal do GERA.
 * Preserva o DOM existente e encaminha a execução sonora ao núcleo.
 */
(function(global){
 'use strict';

 function createController(options){
  const documentRef=options.document||global.document;
  const getElement=options.getElement;
  const naturalNotes=options.naturalNotes;
  const sharpNotes=options.sharpNotes;
  const naturalHints=options.naturalHints;
  const sharpHints=options.sharpHints;
  const keyMap=options.keyMap;
  const pointerLastKey=options.pointerLastKey;
  const pressedKeys=options.pressedKeys;
  const maxSimultaneousTouches=options.maxSimultaneousTouches;
  const activeTouches=new Map();

  function element(id){return getElement(id)}
  function closestKey(target){
   return target&&typeof target.closest==='function'?target.closest('.key'):null;
  }
  function makeKey(semi,hint,sharp,showOctave){
   const key=documentRef.createElement('div');
   const pitchClass=((semi%12)+12)%12;
   key.className='key '+(sharp?'sharp':'natural');
   key.dataset.note=semi;
   key.dataset.pitchClass=String(pitchClass);
   const noteName=options.normalizedNoteName(semi);
   const octaveText=showOctave?String(4+Math.floor(semi/12)):'';
   const hintText=hint?String(hint).toUpperCase():'';
   key.innerHTML='<span>'+noteName+octaveText+'</span><span class="hint">'+hintText+'</span><span class="velocity">●</span>';
   return key;
  }
  function render(){
   const sharpRow=element('sharp-row');
   const naturalRow=element('natural-row');
   sharpRow.innerHTML='';
   naturalRow.innerHTML='';
   element('keyboard').classList.remove('sino-three-octaves');

   for(let index=0;index<naturalNotes.length;index++){
    const sharpCell=documentRef.createElement('div');
    sharpCell.className='key-cell sharp-cell';
    const sharpHint=sharpHints[index]||'';
    if(sharpNotes[index]!=null)sharpCell.appendChild(makeKey(sharpNotes[index],sharpHint,true,true));
    sharpRow.appendChild(sharpCell);

    const naturalCell=documentRef.createElement('div');
    naturalCell.className='key-cell';
    const naturalHint=naturalHints[index]||'';
    naturalCell.appendChild(makeKey(naturalNotes[index],naturalHint,false,true));
    naturalRow.appendChild(naturalCell);
   }
  }
  function keyAtPointer(event,keyboard){
   const direct=closestKey(event.target);
   if(direct&&keyboard.contains(direct))return direct;
   const found=closestKey(documentRef.elementFromPoint(event.clientX,event.clientY));
   return found&&keyboard.contains(found)?found:null;
  }
  function finishKeyboardPointer(event,keyboard){
   const last=pointerLastKey.get(event.pointerId);
   if(last==null)return;
   pointerLastKey.delete(event.pointerId);
   options.noteUp(last,event.pointerId);
   try{
    if(typeof keyboard.hasPointerCapture==='function'&&keyboard.hasPointerCapture(event.pointerId)){
     keyboard.releasePointerCapture(event.pointerId);
    }
   }catch(error){}
  }
  function keyAtTouch(touch,keyboard){
   const found=closestKey(documentRef.elementFromPoint(touch.clientX,touch.clientY));
   return found&&keyboard.contains(found)?found:null;
  }
  function startTouch(touch,keyboard){
   if(activeTouches.has(touch.identifier))return;
   if(activeTouches.size>=maxSimultaneousTouches){
    options.setStatus('Limite de quatro teclas simultâneas');
    return;
   }
   const key=keyAtTouch(touch,keyboard);
   if(!key)return;
   const semi=Number(key.dataset.note);
   const id='touch-'+touch.identifier;
   const fakeEvent={clientY:touch.clientY};
   if(options.noteDown(semi,id,options.velocityFromEvent(fakeEvent,key))){
    activeTouches.set(touch.identifier,{semi:semi,id:id});
    pointerLastKey.set(id,semi);
   }
  }
  function moveTouch(touch,keyboard){
   const state=activeTouches.get(touch.identifier);
   if(!state||!options.getGlissEnabled())return;
   const key=keyAtTouch(touch,keyboard);
   if(!key)return;
   const semi=Number(key.dataset.note);
   if(semi===state.semi)return;
   options.noteUp(state.semi,state.id);
   pointerLastKey.delete(state.id);
   const fakeEvent={clientY:touch.clientY};
   if(options.noteDown(semi,state.id,options.velocityFromEvent(fakeEvent,key))){
    state.semi=semi;
    pointerLastKey.set(state.id,semi);
   }else{
    activeTouches.delete(touch.identifier);
   }
  }
  function endTouch(touch){
   const state=activeTouches.get(touch.identifier);
   if(!state)return;
   options.noteUp(state.semi,state.id);
   pointerLastKey.delete(state.id);
   activeTouches.delete(touch.identifier);
  }
  function bindSurface(){
   const keyboard=element('keyboard');
   keyboard.addEventListener('pointerdown',function(event){
    if(event.pointerType==='touch')return;
    const key=keyAtPointer(event,keyboard);
    if(!key)return;
    event.preventDefault();
    if(pointerLastKey.has(event.pointerId))return;
    if(pointerLastKey.size>=maxSimultaneousTouches){
     options.setStatus('Limite de quatro teclas simultâneas');
     return;
    }
    const semi=Number(key.dataset.note);
    if(options.noteDown(semi,event.pointerId,options.velocityFromEvent(event,key))){
     pointerLastKey.set(event.pointerId,semi);
     try{keyboard.setPointerCapture(event.pointerId)}catch(error){}
    }
   },{passive:false});
   keyboard.addEventListener('pointermove',function(event){
    if(event.pointerType==='touch')return;
    if(!options.getGlissEnabled()||!pointerLastKey.has(event.pointerId))return;
    event.preventDefault();
    const key=keyAtPointer(event,keyboard);
    if(!key)return;
    const semi=Number(key.dataset.note);
    const last=pointerLastKey.get(event.pointerId);
    if(semi===last)return;
    options.noteUp(last,event.pointerId);
    pointerLastKey.delete(event.pointerId);
    if(options.noteDown(semi,event.pointerId,options.velocityFromEvent(event,key))){
     pointerLastKey.set(event.pointerId,semi);
    }
   },{passive:false});
   keyboard.addEventListener('pointerup',function(event){
    if(event.pointerType!=='touch')finishKeyboardPointer(event,keyboard);
   });
   keyboard.addEventListener('pointercancel',function(event){
    if(event.pointerType!=='touch')finishKeyboardPointer(event,keyboard);
   });
   keyboard.addEventListener('lostpointercapture',function(event){
    if(event.pointerType!=='touch')finishKeyboardPointer(event,keyboard);
   });
   keyboard.addEventListener('touchstart',function(event){
    event.preventDefault();
    for(const touch of event.changedTouches)startTouch(touch,keyboard);
   },{passive:false});
   keyboard.addEventListener('touchmove',function(event){
    event.preventDefault();
    for(const touch of event.changedTouches)moveTouch(touch,keyboard);
   },{passive:false});
   keyboard.addEventListener('touchend',function(event){
    event.preventDefault();
    for(const touch of event.changedTouches)endTouch(touch);
   },{passive:false});
   keyboard.addEventListener('touchcancel',function(event){
    event.preventDefault();
    for(const touch of event.changedTouches)endTouch(touch);
   },{passive:false});
   keyboard.addEventListener('contextmenu',function(event){event.preventDefault()});
   global.addEventListener('blur',function(){
    [...pointerLastKey.keys()].forEach(function(id){
     finishKeyboardPointer({pointerId:id},keyboard);
    });
   });
  }
  function bindPhysicalKeyboard(){
   documentRef.addEventListener('keydown',function(event){
    if(['INPUT','SELECT','BUTTON'].includes(event.target.tagName))return;
    const key=event.key.toLowerCase();
    if(pressedKeys.has(key)||!keyMap.has(key))return;
    options.noteDown(keyMap.get(key),key,1,'keyboard');
   });
   documentRef.addEventListener('keyup',function(event){
    const key=event.key.toLowerCase();
    if(keyMap.has(key))options.noteUp(keyMap.get(key),key,'keyboard');
   });
   global.addEventListener('blur',options.releaseAll);
  }

  return Object.freeze({render:render,bindSurface:bindSurface,bindPhysicalKeyboard:bindPhysicalKeyboard});
 }

 global.GeraKeyboard=Object.freeze({createController:createController});
})(window);
