'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const phase8Base=path.resolve(root,'..','GERA-PWA-v3.15.20-etapa-7F-backup-restauracao');
const previous=path.resolve(root,'..','GERA-PWA-v3.15.34-grupos-e-salvamento-automatico');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));

const uiStages=[
 ['header.js','GERA-PWA-v3.15.21-etapa-8A-cabecalho'],
 ['compact-panel.js','GERA-PWA-v3.15.22-etapa-8B-painel-compacto'],
 ['keyboard.js','GERA-PWA-v3.15.23-etapa-8C-teclado'],
 ['chords-circle.js','GERA-PWA-v3.15.24-etapa-8D-acordes-circulo-harmonico'],
 ['drums.js','GERA-PWA-v3.15.25-etapa-8E-bateria'],
 ['sequencer.js','GERA-PWA-v3.15.26-etapa-8F-sequenciador'],
 ['songs-library.js','GERA-PWA-v3.15.27-etapa-8G-musicas-biblioteca'],
 ['settings-modals.js','GERA-PWA-v3.15.28-etapa-8H-configuracoes-modais']
];

function read(relative,base){return fs.readFileSync(path.join(base||root,relative))}
function text(relative,base){return read(relative,base).toString('utf8')}
function count(source,pattern){return (source.match(pattern)||[]).length}
function walk(directory){
 const output=[];
 if(!fs.existsSync(directory))return output;
 fs.readdirSync(directory).sort().forEach(function(name){
  const absolute=path.join(directory,name);
  if(fs.statSync(absolute).isDirectory())output.push.apply(output,walk(absolute));
  else output.push(absolute);
 });
 return output;
}
function functionalSource(base){
 let source=text('index.html',base);
 walk(path.join(base,'js')).filter(function(file){return file.endsWith('.js')}).forEach(function(file){source+='\n'+fs.readFileSync(file,'utf8')});
 return source;
}
function precacheUrls(){
 const body=(sw.match(/const PRECACHE_URLS = \[([\s\S]*?)\];/)||[])[1];
 assert.ok(body,'lista de pré-cache ausente');
 return JSON.parse('['+body+']');
}

test('fluxo e interface alteram somente os recursos autorizados sobre a versão 3.15.34',function(){
 ['index.html','styles/inline-style-01.css','js/ui/sequencer.js','js/ui/transport-status.js','js/transport/sequence-transitions.js','sw.js','manifest.json'].forEach(function(file){
  assert.notDeepEqual(read(file),read(file,previous),file);
 });
 ['offline.html','manual-gera.html','js/storage.js','js/chords.js','js/state.js','js/audio/core.js'].forEach(function(file){
  assert.deepEqual(read(file),read(file,previous),file);
 });
 walk(path.join(root,'js')).forEach(function(file){
  const relative=path.relative(root,file);
  if([path.join('js','ui','sequencer.js'),path.join('js','ui','transport-status.js'),path.join('js','transport','sequence-transitions.js')].indexOf(relative)>=0)return;
  assert.deepEqual(fs.readFileSync(file),read(relative,previous),relative);
 });
});

test('módulos da interface fora da biblioteca permanecem byte a byte iguais às versões de extração',function(){
 uiStages.forEach(function(item){
  if(item[0]==='sequencer.js'||item[0]==='songs-library.js')return;
  const introduced=path.resolve(root,'..',item[1]);
  assert.deepEqual(read(path.join('js','ui',item[0])),read(path.join('js','ui',item[0]),introduced),item[0]);
 });
});

test('os oito diffs funcionais e as oito provas específicas de reversão permanecem no pacote',function(){
 const letters=['A','B','C','D','E','F','G','H'];
 letters.forEach(function(letter,indexLetter){
  const version=21+indexLetter;
  assert.ok(fs.existsSync(path.join(root,'referencia','DIFF-FUNCIONAL-ETAPA-8'+letter+'-v3.15.'+version+'.patch')),'diff 8'+letter);
 });
 ['header','compact-panel','keyboard','chords-circle','drums-ui','sequencer-ui','songs-library-ui','settings-modals-ui'].forEach(function(name){
  assert.ok(fs.existsSync(path.join(root,'tests',name+'.test.js')),name);
 });
});

test('scripts externos carregam uma vez, existem e respeitam a ordem de dependências',function(){
 const scripts=Array.from(index.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g),function(match){return match[1]});
 assert.equal(scripts.length,21);
 assert.equal(new Set(scripts).size,scripts.length);
 scripts.forEach(function(resource){assert.ok(fs.existsSync(path.join(root,resource.replace(/^\.\//,''))),resource)});
 const expectedUi=['./js/ui/transport-status.js'].concat(uiStages.map(function(item){return './js/ui/'+item[0]}));
 assert.deepEqual(scripts.slice(11,20),expectedUi);
 assert.equal(scripts[20],'./js/audio/core.js');
});

test('DOM possui 322 identificadores únicos após seletor de sustain do teclado',function(){
 const ids=Array.from(index.matchAll(/\bid=["']([^"']+)["']/g),function(match){return match[1]});
 assert.equal(ids.length,322);
 assert.equal(new Set(ids).size,322);
});

test('somente autosave e controles de grupo acrescentam temporização e listeners',function(){
 const before=functionalSource(phase8Base);
 const after=functionalSource(root);
 assert.equal(count(after,/setInterval\s*\(/g),count(before,/setInterval\s*\(/g));
 assert.equal(count(after,/setTimeout\s*\(/g),count(before,/setTimeout\s*\(/g)+2);
 assert.equal(count(after,/requestAnimationFrame\s*\(/g),count(before,/requestAnimationFrame\s*\(/g));
 assert.equal(count(after,/setInterval\s*\(/g),2);
 assert.equal(count(after,/setTimeout\s*\(/g),44);
 assert.equal(count(after,/addEventListener\s*\(/g),67);
 assert.equal(count(after,/requestAnimationFrame\s*\(/g),2);
});

test('núcleo fora do editor e seus estilos permanece byte a byte preservado',function(){
 const preserved=['js/storage.js','js/chords.js','js/state.js','js/audio/core.js','manual-gera.html','offline.html'];
 walk(path.join(phase8Base,'js','transport')).forEach(function(file){if(path.basename(file)!=='sequence-transitions.js')preserved.push(path.relative(phase8Base,file))});
 preserved.forEach(function(file){assert.deepEqual(read(file),read(file,phase8Base),file)});
});

test('pré-cache contém 47 entradas únicas e cobre todos os recursos funcionais presentes',function(){
 const urls=precacheUrls();
 assert.equal(urls.length,47);
 assert.equal(new Set(urls).size,47);
 const absentSamples=[];
 urls.forEach(function(resource){
  if(resource==='./')return;
  const relative=resource.replace(/^\.\//,'');
  if(relative.indexOf('kit-acustico-selecionado/')===0){if(!fs.existsSync(path.join(root,relative)))absentSamples.push(relative);return}
  assert.ok(fs.existsSync(path.join(root,relative)),resource);
 });
 assert.equal(absentSamples.length,17);
 assert.ok(absentSamples.every(function(file){return file.indexOf('kit-acustico-selecionado/')===0}));
});

test('HTML e SERVICE WORKER referenciam exatamente os mesmos scripts funcionais',function(){
 const scripts=Array.from(index.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g),function(match){return match[1]});
 const urls=precacheUrls();
 scripts.forEach(function(script){assert.equal(urls.filter(function(url){return url===script}).length,1,script)});
});

test('manifesto e identificação visual usam somente a versão 3.15.42',function(){
 assert.equal(manifest.version,'3.15.42');
 assert.equal(count(index,/3\.15\.42/g),3);
 assert.equal(count(index,/3\.15\.30/g),0);
 assert.equal(count(index,/3\.15\.29/g),0);
 assert.equal(count(index,/3\.15\.28/g),0);
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.42';"));
 assert.equal(count(sw,/v3\.15\.42/g),1);
});

test('SERVICE WORKER mantém instalação, atualização, limpeza e fallback offline',function(){
 assert.ok(sw.includes('cache.addAll(PRECACHE_URLS)'));
 assert.ok(sw.includes('self.skipWaiting()'));
 assert.ok(sw.includes('self.clients.claim()'));
 assert.ok(sw.includes('caches.delete(cacheName)'));
 assert.ok(sw.includes("request.mode === 'navigate'"));
 assert.ok(sw.includes("caches.match('./index.html')"));
 assert.ok(sw.includes('caches.match(OFFLINE_URL)'));
 assert.ok(sw.includes("event.data.type === 'SKIP_WAITING'"));
});

test('código funcional permanece sem operador de coalescência nula',function(){
 assert.doesNotMatch(functionalSource(root),/\?\?/);
});
