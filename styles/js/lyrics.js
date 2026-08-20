/* Modelo de letras por passagem do GERA. */
(function(global){
 'use strict';

 const MAX_PASSAGE=99;
 const MAX_TEXT_LENGTH=180;
 const MAX_DELAY_MS=60000;

 function cleanText(value){
  return typeof value==='string'?value.trim().slice(0,MAX_TEXT_LENGTH):'';
 }
 function cleanPassage(value){
  const number=Math.round(Number(value));
  if(!Number.isFinite(number))return 0;
  return Math.max(1,Math.min(MAX_PASSAGE,number));
 }
 function cleanDelayMs(value){
  const number=Math.round(Number(value));
  if(!Number.isFinite(number))return 0;
  return Math.max(0,Math.min(MAX_DELAY_MS,number));
 }
 function normalizeEntries(value){
  const source=Array.isArray(value)?value:[];
  const byPassage={};
  source.forEach(function(entry){
   if(!entry||typeof entry!=='object')return;
   const passage=cleanPassage(entry.passage);
   const text=cleanText(entry.text);
   const delayMs=cleanDelayMs(entry.delayMs);
   if(passage&&text)byPassage[passage]={text:text,delayMs:delayMs};
  });
  return Object.keys(byPassage).map(Number).sort(function(a,b){return a-b}).map(function(passage){
   const entry={passage:passage,text:byPassage[passage].text};
   if(byPassage[passage].delayMs)entry.delayMs=byPassage[passage].delayMs;
   return entry;
  });
 }
 function normalizedData(item){
  const source=item&&typeof item==='object'?item:{};
  const entries=normalizeEntries(source.lyrics);
  let defaultText=cleanText(source.lyricDefault);
  let defaultDelayMs=defaultText?cleanDelayMs(source.lyricDefaultDelayMs):0;
  const legacyText=cleanText(source.text);
  const legacyDelayMs=cleanDelayMs(source.textDelayMs);

  if(legacyText){
   if(source.textRepeat==='always'){
    if(!defaultText){defaultText=legacyText;defaultDelayMs=legacyDelayMs}
   }else{
    const legacyPassage=cleanPassage(source.textRepeat||1);
    if(!entries.some(function(entry){return entry.passage===legacyPassage})){
     const entry={passage:legacyPassage,text:legacyText};
     if(legacyDelayMs)entry.delayMs=legacyDelayMs;
     entries.push(entry);
     entries.sort(function(a,b){return a.passage-b.passage});
    }
   }
  }
  return {entries:entries,defaultText:defaultText,defaultDelayMs:defaultDelayMs};
 }
 function writeData(target,data){
  delete target.text;
  delete target.textRepeat;
  delete target.textDelayMs;
  delete target.lyrics;
  delete target.lyricDefault;
  delete target.lyricDefaultDelayMs;
  if(data.entries.length)target.lyrics=data.entries;
  if(data.defaultText)target.lyricDefault=data.defaultText;
  if(data.defaultText&&data.defaultDelayMs)target.lyricDefaultDelayMs=data.defaultDelayMs;
  return target;
 }
 function applyToItem(target,source){
  const data=normalizedData(source);
  writeData(target,data);
  return target;
 }
 function copyToItem(target,source){
  return applyToItem(target,source);
 }
 function textForPassage(item,passage){
  return timingForPassage(item,passage).text;
 }
 function timingForPassage(item,passage){
  const data=normalizedData(item);
  const number=cleanPassage(passage||1);
  const exact=data.entries.find(function(entry){return entry.passage===number});
  return exact
   ?{text:exact.text,delayMs:cleanDelayMs(exact.delayMs)}
   :{text:data.defaultText,delayMs:data.defaultText?data.defaultDelayMs:0};
 }
 function delayMsForPassage(item,passage){
  return timingForPassage(item,passage).delayMs;
 }
 function textForEditor(item,passage){
  const data=normalizedData(item);
  if(passage==='default')return data.defaultText;
  const number=cleanPassage(passage||1);
  const exact=data.entries.find(function(entry){return entry.passage===number});
  return exact?exact.text:'';
 }
 function delayMsForEditor(item,passage){
  const data=normalizedData(item);
  if(passage==='default')return data.defaultText?data.defaultDelayMs:0;
  const number=cleanPassage(passage||1);
  const exact=data.entries.find(function(entry){return entry.passage===number});
  return exact?cleanDelayMs(exact.delayMs):0;
 }
 function setText(item,passage,value){
  const data=normalizedData(item);
  const text=cleanText(value);
  if(passage==='default'){
   data.defaultText=text;
   if(!text)data.defaultDelayMs=0;
  }else{
   const number=cleanPassage(passage||1);
   const previous=data.entries.find(function(entry){return entry.passage===number});
   data.entries=data.entries.filter(function(entry){return entry.passage!==number});
   if(text){
    const entry={passage:number,text:text};
    const previousDelay=previous?cleanDelayMs(previous.delayMs):0;
    if(previousDelay)entry.delayMs=previousDelay;
    data.entries.push(entry);
   }
   data.entries.sort(function(a,b){return a.passage-b.passage});
  }
  return writeData(item,data);
 }
 function setDelayMs(item,passage,value){
  const data=normalizedData(item);
  const delayMs=cleanDelayMs(value);
  if(passage==='default'){
   if(!data.defaultText)return writeData(item,data);
   data.defaultDelayMs=delayMs;
  }else{
   const number=cleanPassage(passage||1);
   const entry=data.entries.find(function(candidate){return candidate.passage===number});
   if(!entry)return writeData(item,data);
   if(delayMs)entry.delayMs=delayMs;
   else delete entry.delayMs;
  }
  return writeData(item,data);
 }
 function removePassage(item,passage){
  return setText(item,passage,'');
 }
 function maxPassage(item){
  const entries=normalizedData(item).entries;
  return entries.length?entries[entries.length-1].passage:0;
 }
 function hasLyrics(item){
  const data=normalizedData(item);
  return data.entries.length>0||!!data.defaultText;
 }

 global.GeraLyrics=Object.freeze({
  MAX_PASSAGE:MAX_PASSAGE,
  MAX_TEXT_LENGTH:MAX_TEXT_LENGTH,
  MAX_DELAY_MS:MAX_DELAY_MS,
  normalizeEntries:normalizeEntries,
  normalizedData:normalizedData,
  applyToItem:applyToItem,
  copyToItem:copyToItem,
  textForPassage:textForPassage,
  timingForPassage:timingForPassage,
  delayMsForPassage:delayMsForPassage,
  textForEditor:textForEditor,
  delayMsForEditor:delayMsForEditor,
  setText:setText,
  setDelayMs:setDelayMs,
  removePassage:removePassage,
  maxPassage:maxPassage,
  hasLyrics:hasLyrics
 });
})(typeof window!=='undefined'?window:globalThis);
