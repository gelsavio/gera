/*
 * Estado compartilhado inicial do GERA.
 *
 * Nesta etapa, este arquivo armazena exclusivamente os valores relacionados
 * ao BPM. As regras de execução, normalização, transporte e interface
 * permanecem no código legado.
 */
(function(global){
 'use strict';

 const tempo={
  bpm:100,
  transportTempoBpm:100,
  pendingBpm:null
 };

 const state={
  tempo:tempo
 };

 function exposeLegacyValue(name){
  Object.defineProperty(global,name,{
   configurable:false,
   enumerable:true,
   get:function(){return tempo[name]},
   set:function(value){tempo[name]=value}
  });
 }

 exposeLegacyValue('bpm');
 exposeLegacyValue('transportTempoBpm');
 exposeLegacyValue('pendingBpm');

 Object.defineProperty(global,'GeraState',{
  configurable:false,
  enumerable:true,
  writable:false,
  value:state
 });
})(window);
