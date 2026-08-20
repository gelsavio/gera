/*
 * Acesso centralizado ao localStorage do GERA.
 *
 * Etapas 7A a 7F: preferências visuais, tema, configurações musicais,
 * músicas, listas, sequências, padrões de bateria, memórias e JSON portátil.
 * As chaves, os valores e os formatos continuam idênticos aos legados.
 */
(function(global){
 'use strict';

 const keys=Object.freeze({
  theme:'geraTheme',
  redesignTab:'geraRedesignTab',
  globalMutePosition:'geraGlobalMutePositionV1',
  redesignRailCollapsed:'geraRedesignRailCollapsed',
  drumEngine:'tecladoVirtualDrumEngine',
  songs:'tecladoVirtualSongs',
  songLists:'geraSongListsV1',
  playlistSettings:'geraPlaylistSettingsV1',
  sequences:'tecladoVirtualSongSections',
  legacyChordSequence:'tecladoVirtualChordSequence',
  drumPatternLibrary:'geraDrumPatternLibraryV1',
  automaticBackup:'geraAutomaticBackupV1',
  automaticBackupPrevious:'geraAutomaticBackupPreviousV1',
  memoryPrefix:'tecladoVirtualMemory'
 });

 function storage(){return global.localStorage}
 function read(key,fallback){
  try{
   const value=storage().getItem(key);
   return value===null?fallback:value;
  }catch(error){return fallback}
 }
 function write(key,value){
  try{storage().setItem(key,value);return true}catch(error){return false}
 }
 function readJson(key,fallback){
  const raw=read(key,null);
  if(raw===null||raw==='')return fallback;
  try{return JSON.parse(raw)}catch(error){return fallback}
 }
 function writeJson(key,value){
  try{return write(key,JSON.stringify(value))}catch(error){return false}
 }

 const preferences=Object.freeze({
  getTheme:function(){return read(keys.theme,null)},
  setTheme:function(value){return write(keys.theme,value)},
  getRedesignTab:function(){return read(keys.redesignTab,null)},
  setRedesignTab:function(value){return write(keys.redesignTab,value)},
  getGlobalMutePosition:function(){return readJson(keys.globalMutePosition,null)},
  setGlobalMutePosition:function(value){return writeJson(keys.globalMutePosition,value)},
  getRedesignRailCollapsed:function(){return read(keys.redesignRailCollapsed,null)},
  setRedesignRailCollapsed:function(value){return write(keys.redesignRailCollapsed,value)}
 });

 const musicalSettings=Object.freeze({
  getDrumEngine:function(){return read(keys.drumEngine,null)},
  setDrumEngine:function(value){return write(keys.drumEngine,value)}
 });

 const musicLibrary=Object.freeze({
  getSongsStore:function(){return readJson(keys.songs,null)},
  setSongsStore:function(value){return writeJson(keys.songs,value)},
  getSongListsStore:function(){return readJson(keys.songLists,null)},
  setSongListsStore:function(value){return writeJson(keys.songLists,value)},
  getPlaylistSettings:function(){return readJson(keys.playlistSettings,null)},
  setPlaylistSettings:function(value){return writeJson(keys.playlistSettings,value)}
 });

 const sequences=Object.freeze({
  getStore:function(){return readJson(keys.sequences,null)},
  setStore:function(value){storage().setItem(keys.sequences,JSON.stringify(value));return true},
  getLegacyChordSequence:function(){return readJson(keys.legacyChordSequence,[])},
  removeStores:function(){
   try{
    storage().removeItem(keys.sequences);
    storage().removeItem(keys.legacyChordSequence);
    return true;
   }catch(error){return false}
  }
 });

 const drumPatterns=Object.freeze({
  getLibrary:function(){return readJson(keys.drumPatternLibrary,null)},
  setLibrary:function(value){return writeJson(keys.drumPatternLibrary,value)}
 });

 function memoryKey(position){return keys.memoryPrefix+String(position)}
 const memories=Object.freeze({
  getRaw:function(position){return read(memoryKey(position),null)},
  has:function(position){return read(memoryKey(position),null)!==null},
  set:function(position,value){return writeJson(memoryKey(position),value)}
 });

 const backup=Object.freeze({
  stringify:function(value){return JSON.stringify(value,null,2)},
  parse:function(text){return JSON.parse(text)}
 });

 const automaticBackup=Object.freeze({
  getMain:function(){return readJson(keys.automaticBackup,null)},
  getPrevious:function(){return readJson(keys.automaticBackupPrevious,null)},
  setMain:function(value){return writeJson(keys.automaticBackup,value)},
  setPrevious:function(value){return writeJson(keys.automaticBackupPrevious,value)},
  capture:function(){
   return {
    songsStore:musicLibrary.getSongsStore(),
    songListsStore:musicLibrary.getSongListsStore(),
    playlistSettings:musicLibrary.getPlaylistSettings(),
    drumPatternLibrary:drumPatterns.getLibrary()
   };
  },
  restore:function(value){
   const data=value&&value.data&&typeof value.data==='object'?value.data:value;
   if(!data||typeof data!=='object'||!data.songsStore||typeof data.songsStore!=='object')return false;
   let restored=writeJson(keys.songs,data.songsStore);
   if(data.songListsStore&&typeof data.songListsStore==='object')restored=writeJson(keys.songLists,data.songListsStore)&&restored;
   if(data.playlistSettings&&typeof data.playlistSettings==='object')restored=writeJson(keys.playlistSettings,data.playlistSettings)&&restored;
   if(data.drumPatternLibrary&&typeof data.drumPatternLibrary==='object')restored=writeJson(keys.drumPatternLibrary,data.drumPatternLibrary)&&restored;
   return restored;
  }
 });

 global.GeraStorage=Object.freeze({
  keys:keys,
  preferences:preferences,
  musicalSettings:musicalSettings,
  musicLibrary:musicLibrary,
  sequences:sequences,
  drumPatterns:drumPatterns,
  memories:memories,
  backup:backup,
  automaticBackup:automaticBackup
 });
})(typeof window!=='undefined'?window:this);
