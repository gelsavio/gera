'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const baselineRoot=path.resolve(root,'..','GERA-PWA-v3.15.19-etapa-7E-padroes-personalizados-bateria');
const stage7Root=path.resolve(root,'..','GERA-PWA-v3.15.20-etapa-7F-backup-restauracao');
const source=fs.readFileSync(path.join(root,'js','storage.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

function load(initial,throws){
 const values=Object.assign({},initial||{});
 const operations=[];
 const localStorage={
  getItem:function(key){
   operations.push(['get',key]);
   if(throws==='get')throw new Error('bloqueado');
   return Object.prototype.hasOwnProperty.call(values,key)?values[key]:null;
  },
  setItem:function(key,value){
   operations.push(['set',key,value]);
   if(throws==='set')throw new Error('bloqueado');
   values[key]=String(value);
  },
  removeItem:function(key){
   operations.push(['remove',key]);
   if(throws==='remove')throw new Error('bloqueado');
   delete values[key];
  }
 };
 const window={localStorage:localStorage};
 const context=vm.createContext({window:window});
 vm.runInContext(source,context,{filename:'storage.js'});
 return{api:window.GeraStorage,values:values,operations:operations};
}

test('preserva literalmente as chaves legadas dos grupos 7A a 7F',function(){
 const loaded=load();
 assert.deepEqual(Object.assign({},loaded.api.keys),{
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
});

test('lê valores existentes sem conversão, normalização ou regravação',function(){
 const loaded=load({
  geraTheme:'ocean',
  geraRedesignTab:'sequencias',
  geraRedesignRailCollapsed:'1'
 });
 assert.equal(loaded.api.preferences.getTheme(),'ocean');
 assert.equal(loaded.api.preferences.getRedesignTab(),'sequencias');
 assert.equal(loaded.api.preferences.getRedesignRailCollapsed(),'1');
 assert.equal(loaded.operations.filter(function(item){return item[0]==='set'}).length,0);
});

test('mantém null para preferências inexistentes',function(){
 const preferences=load().api.preferences;
 assert.equal(preferences.getTheme(),null);
 assert.equal(preferences.getRedesignTab(),null);
 assert.equal(preferences.getGlobalMutePosition(),null);
 assert.equal(preferences.getRedesignRailCollapsed(),null);
});

test('preserva o formato JSON legado da posição do botão',function(){
 const raw='{"left":147,"top":28.5}';
 const loaded=load({geraGlobalMutePositionV1:raw});
 const position=loaded.api.preferences.getGlobalMutePosition();
 assert.equal(position.left,147);
 assert.equal(position.top,28.5);
 loaded.api.preferences.setGlobalMutePosition({left:22,top:9});
 assert.equal(loaded.values.geraGlobalMutePositionV1,'{"left":22,"top":9}');
});

test('grava os mesmos valores escalares usados pelo código legado',function(){
 const loaded=load();
 loaded.api.preferences.setTheme('violet');
 loaded.api.preferences.setRedesignTab('bateria');
 loaded.api.preferences.setRedesignRailCollapsed('0');
 assert.equal(loaded.values.geraTheme,'violet');
 assert.equal(loaded.values.geraRedesignTab,'bateria');
 assert.equal(loaded.values.geraRedesignRailCollapsed,'0');
});

test('falhas de acesso continuam silenciosas e retornam o fallback legado',function(){
 assert.equal(load({},'get').api.preferences.getTheme(),null);
 assert.equal(load({},'set').api.preferences.setTheme('dark'),false);
});

test('lê e grava o motor da bateria como string sem conversão',function(){
 const loaded=load({tecladoVirtualDrumEngine:'synth'});
 assert.equal(loaded.api.musicalSettings.getDrumEngine(),'synth');
 assert.equal(loaded.operations.filter(function(item){return item[0]==='set'}).length,0);
 assert.equal(loaded.api.musicalSettings.setDrumEngine('acoustic'),true);
 assert.equal(loaded.values.tecladoVirtualDrumEngine,'acoustic');
});

test('mantém null para motor inexistente e deixa o fallback acoustic no consumidor',function(){
 const loaded=load();
 assert.equal(loaded.api.musicalSettings.getDrumEngine(),null);
 assert.match(index,/GeraStorage\.musicalSettings\.getDrumEngine\(\)\|\|'acoustic'/);
 assert.equal(loaded.operations.filter(function(item){return item[0]==='set'}).length,0);
});

test('lê músicas e listas existentes sem conversão ou regravação',function(){
 const songsRaw='{"songs":{"Canção":{"bpm":92}},"lastSong":"Canção"}';
 const listsRaw='{"version":1,"lists":{"lista-1":{"id":"lista-1","name":"Celebração","songNames":["Canção"]}}}';
 const settingsRaw='{"activeListId":"lista-1","currentIndex":0,"transitionMode":"auto","nextStartMode":"play","endMode":"loop"}';
 const loaded=load({
  tecladoVirtualSongs:songsRaw,
  geraSongListsV1:listsRaw,
  geraPlaylistSettingsV1:settingsRaw
 });
 assert.equal(loaded.api.musicLibrary.getSongsStore().songs['Canção'].bpm,92);
 assert.deepEqual(Array.from(loaded.api.musicLibrary.getSongListsStore().lists['lista-1'].songNames),['Canção']);
 assert.equal(loaded.api.musicLibrary.getPlaylistSettings().transitionMode,'auto');
 assert.equal(loaded.operations.filter(function(item){return item[0]==='set'}).length,0);
});

test('grava os formatos JSON legados de músicas, listas e preferências da lista',function(){
 const loaded=load();
 loaded.api.musicLibrary.setSongsStore({songs:{Hino:{bpm:100}},lastSong:'Hino'});
 loaded.api.musicLibrary.setSongListsStore({version:1,lists:{l:{id:'l',name:'Culto',songNames:['Hino']}}});
 loaded.api.musicLibrary.setPlaylistSettings({activeListId:'l',currentIndex:0,transitionMode:'manual',nextStartMode:'wait',endMode:'stop'});
 assert.equal(loaded.values.tecladoVirtualSongs,'{"songs":{"Hino":{"bpm":100}},"lastSong":"Hino"}');
 assert.equal(loaded.values.geraSongListsV1,'{"version":1,"lists":{"l":{"id":"l","name":"Culto","songNames":["Hino"]}}}');
 assert.equal(loaded.values.geraPlaylistSettingsV1,'{"activeListId":"l","currentIndex":0,"transitionMode":"manual","nextStartMode":"wait","endMode":"stop"}');
});

test('dados JSON ausentes ou inválidos mantêm o fallback null sem escrita',function(){
 const loaded=load({tecladoVirtualSongs:'{inválido',geraSongListsV1:'',geraPlaylistSettingsV1:'null'});
 assert.equal(loaded.api.musicLibrary.getSongsStore(),null);
 assert.equal(loaded.api.musicLibrary.getSongListsStore(),null);
 assert.equal(loaded.api.musicLibrary.getPlaylistSettings(),null);
 assert.equal(loaded.operations.filter(function(item){return item[0]==='set'}).length,0);
});

test('lê a sequência principal sem converter nem regravar dados existentes',function(){
 const raw='{"sections":{"verse":[{"root":0,"type":"major","fraction":0.5}]},"active":"verse","loop":true,"auto":false,"autoEnd":true,"autoV2":true,"repeats":{"verse":2},"ordemSecoes":["verse"],"bateria":{"verse":{"padrao":"rock"}},"drumEngine":"acoustic","visible":false}';
 const loaded=load({tecladoVirtualSongSections:raw});
 const saved=loaded.api.sequences.getStore();
 assert.equal(saved.sections.verse[0].fraction,0.5);
 assert.equal(saved.autoEnd,true);
 assert.equal(saved.bateria.verse.padrao,'rock');
 assert.equal(loaded.operations.filter(function(item){return item[0]==='set'}).length,0);
});

test('grava exatamente o invólucro legado da sequência',function(){
 const loaded=load();
 const state={sections:{verse:[{pause:true,fraction:0.25}]},active:'verse',loop:true,auto:true,autoEnd:false,autoV2:true,repeats:{verse:1},ordemSecoes:['verse'],bateria:{verse:{padrao:'rock'}},drumEngine:'acoustic',visible:true};
 assert.equal(loaded.api.sequences.setStore(state),true);
 assert.equal(loaded.values.tecladoVirtualSongSections,JSON.stringify(state));
});

test('mantém a leitura da sequência legada como vetor e o fallback vazio',function(){
 const raw='[{"root":9,"type":"minor","fraction":1}]';
 const loaded=load({tecladoVirtualChordSequence:raw});
 assert.deepEqual(JSON.parse(JSON.stringify(loaded.api.sequences.getLegacyChordSequence())),[{root:9,type:'minor',fraction:1}]);
 assert.deepEqual(Array.from(load().api.sequences.getLegacyChordSequence()),[]);
 assert.deepEqual(Array.from(load({tecladoVirtualChordSequence:'{inválido'}).api.sequences.getLegacyChordSequence()),[]);
});

test('remove as duas chaves na ordem legada e interrompe após falha da primeira',function(){
 const loaded=load({tecladoVirtualSongSections:'{}',tecladoVirtualChordSequence:'[]'});
 assert.equal(loaded.api.sequences.removeStores(),true);
 assert.deepEqual(loaded.operations.filter(function(item){return item[0]==='remove'}),[
  ['remove','tecladoVirtualSongSections'],['remove','tecladoVirtualChordSequence']
 ]);
 const blocked=load({tecladoVirtualSongSections:'{}',tecladoVirtualChordSequence:'[]'},'remove');
 assert.equal(blocked.api.sequences.removeStores(),false);
 assert.deepEqual(blocked.operations.filter(function(item){return item[0]==='remove'}),[['remove','tecladoVirtualSongSections']]);
});

test('lê a biblioteca de bateria existente sem converter nem regravar',function(){
 const raw='{"version":1,"patterns":{"meu-rock":{"id":"meu-rock","name":"Meu Rock","builtin":false,"parts":{"main":{"steps":16,"events":[]}}}}}';
 const loaded=load({geraDrumPatternLibraryV1:raw});
 const library=loaded.api.drumPatterns.getLibrary();
 assert.equal(library.version,1);
 assert.equal(library.patterns['meu-rock'].name,'Meu Rock');
 assert.equal(library.patterns['meu-rock'].parts.main.steps,16);
 assert.equal(loaded.operations.filter(function(item){return item[0]==='set'}).length,0);
});

test('grava exatamente o invólucro legado da biblioteca de bateria',function(){
 const loaded=load();
 const library={version:1,patterns:{valsa:{id:'valsa',name:'Valsa',builtin:true,parts:{main:{steps:12,events:[]}}}}};
 assert.equal(loaded.api.drumPatterns.setLibrary(library),true);
 assert.equal(loaded.values.geraDrumPatternLibraryV1,JSON.stringify(library));
});

test('biblioteca ausente ou inválida mantém fallback null e falhas permanecem silenciosas',function(){
 assert.equal(load().api.drumPatterns.getLibrary(),null);
 assert.equal(load({geraDrumPatternLibraryV1:'{inválido'}).api.drumPatterns.getLibrary(),null);
 assert.equal(load({},'get').api.drumPatterns.getLibrary(),null);
 assert.equal(load({},'set').api.drumPatterns.setLibrary({version:1,patterns:{}}),false);
});

test('somente storage.js acessa localStorage',function(){
 ['geraTheme','geraRedesignTab','geraGlobalMutePositionV1','geraRedesignRailCollapsed','tecladoVirtualDrumEngine','tecladoVirtualSongs','geraSongListsV1','geraPlaylistSettingsV1','geraDrumPatternLibraryV1'].forEach(function(key){
  const escaped=key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  assert.doesNotMatch(index,new RegExp('localStorage\\.(?:getItem|setItem|removeItem)\\([^\\n]*[\"\\\']'+escaped+'[\"\\\']'));
 });
 assert.ok(index.includes('<script src="./js/storage.js"></script>'));
 assert.ok(index.indexOf('<script src="./js/storage.js"></script>')<index.indexOf('GeraStorage.preferences.getTheme()'));
 assert.doesNotMatch(index,/localStorage\.(?:getItem|setItem|removeItem)/);
});

test('memórias mantêm as seis chaves parametrizadas e o JSON legado',function(){
 const raw='{"instrument":"organ","bpm":72,"values":{"master":"62"}}';
 const loaded=load({tecladoVirtualMemory3:raw});
 assert.equal(loaded.api.memories.has(3),true);
 assert.equal(loaded.api.memories.getRaw(3),raw);
 assert.equal(loaded.api.memories.has(4),false);
 assert.equal(loaded.api.memories.set(4,{instrument:'piano',bpm:100}),true);
 assert.equal(loaded.values.tecladoVirtualMemory4,'{"instrument":"piano","bpm":100}');
 assert.equal(loaded.operations.filter(function(item){return item[0]==='set'}).length,1);
});

test('backup e restauração conservam JSON identado e erros de análise',function(){
 const backup=load().api.backup;
 const payload={format:'gera-song',formatVersion:5,sections:{verse:[]}};
 assert.equal(backup.stringify(payload),JSON.stringify(payload,null,2));
 assert.deepEqual(JSON.parse(JSON.stringify(backup.parse('{"format":"gera-drum-set","patterns":{}}'))),{format:'gera-drum-set',patterns:{}});
 assert.throws(function(){backup.parse('{inválido')},function(error){return error&&error.name==='SyntaxError'});
 assert.match(index,/GeraStorage\.backup\.stringify\(payload\)/);
 assert.match(index,/GeraStorage\.backup\.parse\(text\)/);
 assert.match(index,/GeraStorage\.backup\.parse\(await file\.text\(\)\)/);
});

test('backup automático captura o acervo e mantém duas cópias independentes',function(){
 const loaded=load({
  tecladoVirtualSongs:'{"songs":{"Hino":{"bpm":96}},"lastSong":"Hino"}',
  geraSongListsV1:'{"version":1,"lists":{}}',
  geraPlaylistSettingsV1:'{"transitionMode":"manual"}',
  geraDrumPatternLibraryV1:'{"version":1,"patterns":{}}'
 });
 const automatic=loaded.api.automaticBackup;
 const data=automatic.capture();
 assert.equal(data.songsStore.songs.Hino.bpm,96);
 assert.equal(data.playlistSettings.transitionMode,'manual');

 const first={format:'gera-automatic-backup',data:data};
 const second={format:'gera-automatic-backup',data:{songsStore:{songs:{Outro:{bpm:110}}}}};
 assert.equal(automatic.setMain(first),true);
 assert.equal(automatic.setPrevious(second),true);
 assert.equal(automatic.getMain().data.songsStore.songs.Hino.bpm,96);
 assert.equal(automatic.getPrevious().data.songsStore.songs.Outro.bpm,110);
});

test('restauração automática recompõe músicas, listas, execução e ritmos',function(){
 const loaded=load();
 const backup={data:{
  songsStore:{songs:{Glória:{bpm:140}},lastSong:null},
  songListsStore:{version:1,lists:{missa:{id:'missa',name:'Missa',songNames:['Glória']}}},
  playlistSettings:{activeListId:'missa',transitionMode:'auto'},
  drumPatternLibrary:{version:1,patterns:{rock:{id:'rock',name:'Rock'}}}
 }};
 assert.equal(loaded.api.automaticBackup.restore(backup),true);
 assert.equal(JSON.parse(loaded.values.tecladoVirtualSongs).songs.Glória.bpm,140);
 assert.equal(JSON.parse(loaded.values.geraSongListsV1).lists.missa.name,'Missa');
 assert.equal(JSON.parse(loaded.values.geraPlaylistSettingsV1).transitionMode,'auto');
 assert.equal(JSON.parse(loaded.values.geraDrumPatternLibraryV1).patterns.rock.name,'Rock');
 assert.equal(loaded.api.automaticBackup.restore({data:{}}),false);
});

test('reversão exclusiva da 7F recompõe a versão 3.15.19 byte a byte',function(){
 const stage7Index=fs.readFileSync(path.join(stage7Root,'index.html'),'utf8');
 const stage7Source=fs.readFileSync(path.join(stage7Root,'js','storage.js'),'utf8');
 const reconstructedIndex=stage7Index
  .replaceAll('3.15.20','3.15.19')
  .replaceAll('GeraStorage.backup.stringify(payload)','JSON.stringify(payload,null,2)')
  .replace('GeraStorage.backup.parse(await file.text())','JSON.parse(await file.text())')
  .replace('GeraStorage.backup.parse(text)','JSON.parse(text)')
  .replace("const FACTORY_SETTINGS=","const MEMORY_PREFIX='tecladoVirtualMemory';\nconst FACTORY_SETTINGS=")
  .replace('function memoryOnOff(value)',"function memoryKey(n){return MEMORY_PREFIX+n}\nfunction memoryOnOff(value)")
  .replace('const n=b.dataset.memory,custom=GeraStorage.memories.has(n),preset=',"const n=b.dataset.memory,custom=localStorage.getItem(memoryKey(n))!==null,preset=")
  .replace('const replacing=GeraStorage.memories.has(n);','const replacing=localStorage.getItem(memoryKey(n))!==null;')
  .replace('GeraStorage.memories.set(n,current);','localStorage.setItem(memoryKey(n),JSON.stringify(current));')
  .replace('const raw=GeraStorage.memories.getRaw(n);','const raw=localStorage.getItem(memoryKey(n));');
 const reconstructedSw=fs.readFileSync(path.join(stage7Root,'sw.js'),'utf8')
  .replace("'v3.15.20'","'v3.15.19'");
 const reconstructedManifest=fs.readFileSync(path.join(stage7Root,'manifest.json'),'utf8').replace('"3.15.20"','"3.15.19"');
 const reconstructedStorage=stage7Source
  .replace(' * Etapas 7A a 7F: preferências visuais, tema, configurações musicais,\n * músicas, listas, sequências, padrões de bateria, memórias e JSON portátil.\n * As chaves, os valores e os formatos continuam idênticos aos legados.',' * Etapas 7A, 7B, 7C, 7D e 7E: preferências visuais, tema, configurações\n * musicais globais simples, músicas, listas, sequências e padrões de bateria.\n * As chaves e os valores persistidos continuam idênticos aos da versão legada.')
  .replace(",\n  drumPatternLibrary:'geraDrumPatternLibraryV1',\n  memoryPrefix:'tecladoVirtualMemory'",",\n  drumPatternLibrary:'geraDrumPatternLibraryV1'")
  .replace("\n function memoryKey(position){return keys.memoryPrefix+String(position)}\n const memories=Object.freeze({\n  getRaw:function(position){return read(memoryKey(position),null)},\n  has:function(position){return read(memoryKey(position),null)!==null},\n  set:function(position,value){return writeJson(memoryKey(position),value)}\n });\n\n const backup=Object.freeze({\n  stringify:function(value){return JSON.stringify(value,null,2)},\n  parse:function(text){return JSON.parse(text)}\n });\n",'')
  .replace(',\n  memories:memories,\n  backup:backup','');
 assert.equal(reconstructedIndex,fs.readFileSync(path.join(baselineRoot,'index.html'),'utf8'));
 assert.equal(reconstructedSw,fs.readFileSync(path.join(baselineRoot,'sw.js'),'utf8'));
 assert.equal(reconstructedManifest,fs.readFileSync(path.join(baselineRoot,'manifest.json'),'utf8'));
 assert.equal(reconstructedStorage,fs.readFileSync(path.join(baselineRoot,'js','storage.js'),'utf8'));
});

test('arquivos funcionais fora do fluxo atualizado permanecem byte a byte iguais',function(){
 ['offline.html','manual-gera.html','js/chords.js','js/state.js','js/audio/core.js','js/transport/clock.js','js/transport/scheduler.js','js/transport/boundaries.js','js/transport/tempo.js','js/transport/drum-sync.js','js/transport/chord-sequence-sync.js','js/transport/coordinator.js'].forEach(function(file){
  assert.deepEqual(fs.readFileSync(path.join(root,file)),fs.readFileSync(path.join(baselineRoot,file)),file);
 });
});
