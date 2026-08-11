'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const phase8Base=path.resolve(root,'..','GERA-PWA-v3.15.20-etapa-7F-backup-restauracao');
const previous=path.resolve(root,'..','GERA-PWA-v3.15.30-correcao-testar-1x');
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

test('melhorias do editor alteram somente os recursos autorizados sobre a versão 3.15.30',function(){
 ['index.html','js/ui/sequencer.js','sw.js','manifest.json'].forEach(function(file){
  assert.notDeepEqual(read(file),read(file,previous),file);
 });
 ['offline.html','manual-gera.html','js/storage.js','js/chords.js','js/state.js','js/audio/core.js'].forEach(function(file){
  assert.deepEqual(read(file),read(file,previous),file);
 });
 walk(path.join(root,'js')).forEach(function(file){
  const relative=path.relative(root,file);
  if(relative===path.join('js','ui','sequencer.js'))return;
  assert.deepEqual(fs.readFileSync(file),read(relative,previous),relative);
 });
});

test('sete módulos da interface permanecem byte a byte iguais à versão em que foram extraídos',function(){
 uiStages.forEach(function(item){
  if(item[0]==='sequencer.js')return;
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

test('DOM possui 303 identificadores únicos após o seletor de oitavas',function(){
 const ids=Array.from(index.matchAll(/\bid=["']([^"']+)["']/g),function(match){return match[1]});
 assert.equal(ids.length,303);
 assert.equal(new Set(ids).size,303);
});

test('timers permanecem iguais e há somente um novo listener para fechar o diálogo de colagem',function(){
 const before=functionalSource(phase8Base);
 const after=functionalSource(root);
 [/setInterval\s*\(/g,/setTimeout\s*\(/g,/requestAnimationFrame\s*\(/g].forEach(function(pattern){
  assert.equal(count(after,pattern),count(before,pattern),pattern.toString());
 });
 assert.equal(count(after,/setInterval\s*\(/g),2);
 assert.equal(count(after,/setTimeout\s*\(/g),42);
 assert.equal(count(after,/addEventListener\s*\(/g),60);
 assert.equal(count(after,/requestAnimationFrame\s*\(/g),2);
});

test('núcleo fora do editor e seus estilos permanece byte a byte preservado',function(){
 const preserved=['js/storage.js','js/chords.js','js/state.js','js/audio/core.js','manual-gera.html','offline.html'];
 walk(path.join(phase8Base,'js','transport')).forEach(function(file){preserved.push(path.relative(phase8Base,file))});
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

test('manifesto e identificação visual usam somente a versão 3.15.33',function(){
 assert.equal(manifest.version,'3.15.33');
 assert.equal(count(index,/3\.15\.33/g),3);
 assert.equal(count(index,/3\.15\.30/g),0);
 assert.equal(count(index,/3\.15\.29/g),0);
 assert.equal(count(index,/3\.15\.28/g),0);
 assert.ok(sw.includes("const CACHE_NAME = CACHE_PREFIX + 'v3.15.33';"));
 assert.equal(count(sw,/v3\.15\.33/g),1);
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
