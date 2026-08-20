const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const coreSource=fs.readFileSync(path.join(__dirname,'..','js','audio','core.js'),'utf8');

function audioParam(){return {value:0}}

function audioNode(kind){
 return {
  kind,
  connections:[],
  gain:audioParam(),
  threshold:audioParam(),
  knee:audioParam(),
  ratio:audioParam(),
  attack:audioParam(),
  release:audioParam(),
  frequency:audioParam(),
  Q:audioParam(),
  connect(target){this.connections.push(target);return target}
 };
}

function createHarness(options={}){
 const instances=[];
 class MockAudioContext{
  constructor(config){
   this.config=config;
   this.state=options.state||'suspended';
   this.destination=audioNode('destination');
   this.gains=[];
   this.compressors=[];
   this.filters=[];
   this.resumeCalls=0;
   instances.push(this);
  }
  createGain(){const node=audioNode('gain');this.gains.push(node);return node}
  createDynamicsCompressor(){const node=audioNode('compressor');this.compressors.push(node);return node}
  createBiquadFilter(){const node=audioNode('filter');this.filters.push(node);return node}
  resume(){this.resumeCalls+=1;this.state='running';return Promise.resolve()}
 }
 const controls={
  'drum-volume':{value:String(options.drumVolume===undefined?72:options.drumVolume)},
  'master-volume':{value:String(options.masterVolume===undefined?64:options.masterVolume)}
 };
 const context=vm.createContext({
  AudioContext:MockAudioContext,
  webkitAudioContext:MockAudioContext,
  globalAudioMuted:options.globalAudioMuted===undefined?true:options.globalAudioMuted,
  $:id=>controls[id],
  Number,
  Promise
 });
 vm.runInContext(coreSource,context,{filename:'js/audio/core.js'});
 return {context,instances};
}

function value(context,expression){return vm.runInContext(expression,context)}

test('não cria nem retoma o AudioContext durante o carregamento do script',()=>{
 const harness=createHarness();
 assert.equal(harness.instances.length,0);
 assert.equal(value(harness.context,'typeof ensureAudio'),'function');
 assert.equal(value(harness.context,'audioCtx'),undefined);
});

test('cria uma única instância com latencyHint interactive e retoma contexto suspenso',()=>{
 const harness=createHarness({state:'suspended'});
 vm.runInContext('ensureAudio();ensureAudio();',harness.context);
 assert.equal(harness.instances.length,1);
 assert.equal(harness.instances[0].config.latencyHint,'interactive');
 assert.equal(harness.instances[0].resumeCalls,1);
});

test('preserva parâmetros, volumes e conexões do grafo fixo de áudio',()=>{
 const harness=createHarness({drumVolume:72,masterVolume:64,globalAudioMuted:true});
 vm.runInContext('ensureAudio()',harness.context);
 const audio=harness.instances[0];
 assert.equal(audio.gains.length,4);
 assert.equal(audio.compressors.length,3);
 assert.equal(audio.filters.length,3);
 assert.equal(value(harness.context,'drumBus.gain.value'),.72);
 assert.equal(value(harness.context,'masterGain.gain.value'),.64);
 assert.equal(value(harness.context,'appMuteGain.gain.value'),0);
 assert.deepEqual(Array.from(value(harness.context,'[drumCompressor.threshold.value,drumCompressor.knee.value,drumCompressor.ratio.value,drumCompressor.attack.value,drumCompressor.release.value]')),[-18,18,4,.006,.16]);
 assert.deepEqual(Array.from(value(harness.context,'[bassBus.gain.value,bassHighpass.type,bassHighpass.frequency.value,bassHighpass.Q.value,bassLowShelf.type,bassLowShelf.frequency.value,bassLowShelf.gain.value,bassPresence.type,bassPresence.frequency.value,bassPresence.Q.value,bassPresence.gain.value]')),[1.26,'highpass',34,.7,'lowshelf',125,5.5,'peaking',820,1.05,5.5]);
 assert.deepEqual(Array.from(value(harness.context,'[bassCompressor.threshold.value,bassCompressor.knee.value,bassCompressor.ratio.value,bassCompressor.attack.value,bassCompressor.release.value]')),[-24,14,4,.006,.2]);
 assert.deepEqual(Array.from(value(harness.context,'[limiter.threshold.value,limiter.knee.value,limiter.ratio.value,limiter.attack.value,limiter.release.value]')),[-10,10,12,.003,.18]);
 assert.equal(value(harness.context,'drumBus.connections[0]===drumCompressor'),true);
 assert.equal(value(harness.context,'drumCompressor.connections[0]===masterGain'),true);
 assert.equal(value(harness.context,'bassBus.connections[0]===bassHighpass'),true);
 assert.equal(value(harness.context,'bassHighpass.connections[0]===bassLowShelf'),true);
 assert.equal(value(harness.context,'bassLowShelf.connections[0]===bassPresence'),true);
 assert.equal(value(harness.context,'bassPresence.connections[0]===bassCompressor'),true);
 assert.equal(value(harness.context,'bassCompressor.connections[0]===masterGain'),true);
 assert.equal(value(harness.context,'masterGain.connections[0]===limiter'),true);
 assert.equal(value(harness.context,'limiter.connections[0]===appMuteGain'),true);
 assert.equal(value(harness.context,'appMuteGain.connections[0]===audioCtx.destination'),true);
});

test('não chama resume quando o contexto já está em execução',()=>{
 const harness=createHarness({state:'running',globalAudioMuted:false});
 vm.runInContext('ensureAudio()',harness.context);
 assert.equal(harness.instances[0].resumeCalls,0);
 assert.equal(value(harness.context,'appMuteGain.gain.value'),1);
});
