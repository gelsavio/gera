/*
 * Decisões de progressão entre seções da sequência do GERA.
 *
 * Este módulo não executa áudio, bateria, DOM, persistência ou temporizadores.
 * Ele apenas descreve a mesma ação que o núcleo legado deve aplicar quando a
 * seção ativa chega ao fim.
 */
'use strict';

(function(global){
 function resolveEnd(state){
  const current=Number(state.currentRepetition);

  if(state.holdLoop){
   return Object.freeze({type:'repeat-hold',repetition:current+1});
  }

  if(state.queuedSection){
   if(current<state.targetPasses){
    return Object.freeze({
     type:'repeat-before-manual',
     repetition:current+1,
     targetPasses:state.targetPasses,
     nextSection:state.queuedSection
    });
   }
   return Object.freeze({
    type:'switch-manual',
    targetPasses:state.targetPasses,
    nextSection:state.queuedSection
   });
  }

  if(state.plan&&state.plan.active){
   if(current<state.targetPasses){
    return Object.freeze({
     type:'repeat-before-plan',
     repetition:current+1,
     targetPasses:state.targetPasses,
     nextSection:state.plan.nextSection
    });
   }
   if(state.plan.nextSection){
    return Object.freeze({
     type:'switch-plan',
     nextSection:state.plan.nextSection,
     planCursor:state.plan.nextCursor,
     blockIndex:state.plan.blockIndex,
     blockPass:state.plan.blockPass,
     blockTarget:state.plan.blockTarget,
     loopedBlock:state.plan.loopedBlock===true,
     loopedSong:state.plan.loopedSong===true
    });
   }
   if(state.plan.stop){
    return Object.freeze({type:'stop-plan',blockTarget:state.plan.blockTarget});
   }
  }

  if(state.group&&state.group.active){
   if(current<state.targetPasses){
    return Object.freeze({
     type:'repeat-before-group',
     repetition:current+1,
     targetPasses:state.targetPasses,
     nextSection:state.group.nextSection
    });
   }
   if(state.group.nextSection){
    return Object.freeze({
     type:state.group.completed?'complete-group':'switch-group',
     nextSection:state.group.nextSection,
     groupPass:state.group.nextPass,
     groupTarget:state.group.targetPasses
    });
   }
   if(state.group.completed){
    return Object.freeze({type:'stop-group',groupTarget:state.group.targetPasses});
   }
  }

  if(state.configuredNext&&current<state.configuredTarget){
   return Object.freeze({
    type:'repeat-before-configured',
    repetition:current+1,
    targetPasses:state.configuredTarget,
    nextSection:state.configuredNext
   });
  }

  if(state.configuredNext==='stop'){
   return Object.freeze({type:'stop-configured',targetPasses:state.configuredTarget});
  }

  if(state.configuredNext&&state.configuredNextIsValid){
   return Object.freeze({
    type:'switch-configured',
    targetPasses:state.configuredTarget,
    nextSection:state.configuredNext
   });
  }

  if(state.auto||state.autoEnd){
   if(state.autoTarget>0&&current<state.autoTarget){
    return Object.freeze({
     type:'repeat-auto',
     repetition:current+1,
     targetPasses:state.autoTarget
    });
   }
   if(!state.automaticNext){
    return Object.freeze({type:state.autoEnd?'stop-auto-end':'stop-auto-empty'});
   }
   return Object.freeze({
    type:'switch-auto',
    nextSection:state.automaticNext,
    targetPasses:state.automaticNextTarget
   });
  }

  return Object.freeze({type:'repeat-continuous',repetition:current+1});
 }

 Object.defineProperty(global,'GeraSequenceTransitions',{
  configurable:false,
  enumerable:true,
  writable:false,
  value:Object.freeze({resolveEnd:resolveEnd})
 });
})(typeof window!=='undefined'?window:globalThis);
