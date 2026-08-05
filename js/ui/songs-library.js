/*
 * GERA — interface de músicas e biblioteca.
 * Etapa 8G: concentra renderização e ligações sem decidir persistência ou transporte.
 */
(function(global){
 'use strict';

 function createController(options){
  const documentRef=options.document||global.document;
  const element=options.getElement;

  function updateSongNameDisplay(name){
   const current=element('song-current-name');
   if(!current)return;
   current.textContent=name?'🎵 '+name:'Nenhuma música selecionada';
   current.title=name||'Nenhuma música selecionada';
  }

  function renderSongListsLibrary(lists,currentSongName){
   const box=element('song-lists-list');
   if(!box)return;
   box.innerHTML='';
   const ids=Object.keys(lists).sort(function(a,b){return lists[a].name.localeCompare(lists[b].name,'pt-BR')});
   if(!ids.length){
    box.innerHTML='<span class="songs-empty">Nenhuma lista criada.</span>';
    return;
   }
   ids.forEach(function(id){
    const list=lists[id];
    const row=documentRef.createElement('div');
    row.className='song-list-library-item';
    const open=documentRef.createElement('button');
    open.type='button';
    open.className='secondary song-list-open';
    open.innerHTML='<strong></strong><small></small>';
    open.querySelector('strong').textContent=list.name;
    open.querySelector('small').textContent=list.songNames.length+(list.songNames.length===1?' música':' músicas');
    open.onclick=function(){options.openSongList(id)};
    const use=documentRef.createElement('button');
    use.type='button';
    use.className='secondary';
    use.textContent='Usar';
    use.title='Selecionar esta lista no modo compacto';
    use.onclick=function(){options.useSongList(id,list.songNames.indexOf(currentSongName))};
    row.append(open,use);
    box.appendChild(row);
   });
  }

  function renderSongListEditor(draft,songNames){
   if(!draft)return;
   element('song-list-editor-title').textContent='Editar lista';
   const available=element('song-list-available');
   const order=element('song-list-order');
   available.innerHTML='';
   order.innerHTML='';
   songNames.slice().sort(function(a,b){return a.localeCompare(b,'pt-BR')}).forEach(function(name){
    const label=documentRef.createElement('label');
    label.className='song-list-check';
    const check=documentRef.createElement('input');
    check.type='checkbox';
    check.checked=draft.songNames.indexOf(name)>=0;
    check.onchange=function(){options.toggleDraftSong(name,this.checked)};
    const span=documentRef.createElement('span');
    span.textContent=name;
    label.append(check,span);
    available.appendChild(label);
   });
   if(!draft.songNames.length){
    order.innerHTML='<span class="songs-empty">Nenhuma música adicionada.</span>';
    return;
   }
   draft.songNames.forEach(function(name,index){
    const row=documentRef.createElement('div');
    row.className='song-list-order-item';
    const number=documentRef.createElement('span');
    number.textContent=String(index+1);
    const title=documentRef.createElement('strong');
    title.textContent=name;
    const up=documentRef.createElement('button');
    up.type='button';up.textContent='↑';up.disabled=index===0;
    up.onclick=function(){options.moveDraftSong(index,-1)};
    const down=documentRef.createElement('button');
    down.type='button';down.textContent='↓';down.disabled=index===draft.songNames.length-1;
    down.onclick=function(){options.moveDraftSong(index,1)};
    const remove=documentRef.createElement('button');
    remove.type='button';remove.className='danger';remove.textContent='×';
    remove.onclick=function(){options.removeDraftSong(index)};
    row.append(number,title,up,down,remove);
    order.appendChild(row);
   });
  }

  function renderSongsList(state){
   const box=element('songs-list');
   if(!box)return;
   renderSongListsLibrary(state.songLists,state.currentSongName);
   const names=Object.keys(state.songs).sort(function(a,b){return a.localeCompare(b,'pt-BR')});
   if(!names.length){
    box.innerHTML='<span class="songs-empty">Nenhuma música salva ainda.</span>';
    return;
   }
   box.innerHTML='';
   names.forEach(function(name){
    const row=documentRef.createElement('div');
    row.className='song-item'+(name===state.currentSongName?' song-active':'');
    const info=documentRef.createElement('div');
    info.className='song-library-info';
    const load=documentRef.createElement('button');
    load.type='button';load.className='song-load secondary';load.textContent=name;load.title='Carregar "'+name+'"';
    load.onclick=function(){options.loadSong(name)};
    const memberships=documentRef.createElement('small');
    const listNames=state.memberships(name);
    memberships.textContent=listNames.length?listNames.join(' · '):'Fora de listas';
    info.append(load,memberships);
    const lists=documentRef.createElement('button');
    lists.type='button';lists.className='secondary song-list-membership';lists.textContent='Listas';
    lists.title='Adicionar ou remover esta música das listas';
    lists.onclick=function(){options.manageSongLists(name)};
    const remove=documentRef.createElement('button');
    remove.type='button';remove.className='song-delete danger';remove.textContent='🗑';remove.title='Excluir "'+name+'"';
    remove.setAttribute('aria-label','Excluir '+name);
    remove.onclick=function(){options.deleteSong(name)};
    row.append(info,lists,remove);
    box.appendChild(row);
   });
  }

  function renderRedesignSongs(state){
   const library=element('redesign-song-library');
   if(!library)return;
   const search=String(element('redesign-song-search').value||'').trim().toLocaleLowerCase('pt-BR');
   const names=Object.keys(state.songs).sort(function(a,b){return a.localeCompare(b,'pt-BR')}).filter(function(name){return !search||name.toLocaleLowerCase('pt-BR').includes(search)});
   library.innerHTML='';
   if(!names.length){
    const empty=documentRef.createElement('div');
    empty.className='redesign-song-card';
    empty.textContent=search?'Nenhuma música encontrada.':'Nenhuma música salva.';
    library.appendChild(empty);
    return;
   }
   names.forEach(function(name){
    const data=state.songs[name]||{};
    const card=documentRef.createElement('article');
    card.className='redesign-song-card'+(name===state.currentSongName?' active':'');
    const title=documentRef.createElement('strong');
    title.textContent=name;
    const meta=documentRef.createElement('small');
    const bpmText=Number.isFinite(Number(data.bpm))?data.bpm+' BPM':'BPM atual';
    const order=Array.isArray(data.ordemSecoes)?data.ordemSecoes:state.sequenceOrder;
    const firstSection=order&&order.length?state.sectionLabels[order[0]]:'A';
    meta.textContent=bpmText+' · início: '+firstSection;
    const actions=documentRef.createElement('div');
    actions.className='redesign-song-card-actions';
    const load=documentRef.createElement('button');
    load.type='button';load.textContent=name===state.currentSongName?'Selecionada':'Carregar';
    load.onclick=function(){options.loadRedesignSong(name)};
    const bpmButton=documentRef.createElement('button');
    bpmButton.type='button';bpmButton.className='redesign-song-bpm';bpmButton.textContent='BPM';bpmButton.title='Ajustar o BPM de '+name;
    bpmButton.setAttribute('aria-label','Ajustar BPM de '+name);
    bpmButton.onclick=function(){options.openSongBpm(name)};
    const remove=documentRef.createElement('button');
    remove.type='button';remove.className='redesign-song-delete';remove.textContent='🗑';remove.title='Excluir '+name;
    remove.setAttribute('aria-label','Excluir '+name);
    remove.onclick=function(){options.deleteRedesignSong(name)};
    actions.append(load,bpmButton,remove);
    card.append(title,meta,actions);
    library.appendChild(card);
   });
  }

  function openSongsDialog(name,bpm){
   options.renderSongs();
   element('song-name-input').value=name||'';
   element('song-bpm-input').value=bpm;
   element('songs-dialog').showModal();
  }
  function openSongListDialog(name){
   element('song-list-editor-name').value=name;
   const dialog=element('song-list-editor-dialog');
   if(dialog&&!dialog.open)dialog.showModal();
  }
  function closeSongListDialog(){
   const dialog=element('song-list-editor-dialog');
   if(dialog&&dialog.open)dialog.close();
  }
  function openSongBpmDialog(name,value){
   element('song-bpm-dialog-name').textContent=name;
   const input=element('song-bpm-dialog-input');
   input.value=String(value);
   const dialog=element('song-bpm-dialog');
   if(dialog&&!dialog.open)dialog.showModal();
   setTimeout(function(){input.focus();input.select()},20);
  }
  function closeSongBpmDialog(){
   const dialog=element('song-bpm-dialog');
   if(dialog&&dialog.open)dialog.close();
  }

  function bindMainControls(){
   element('song-export').onclick=function(){options.exportSong()};
   element('song-import').onclick=function(){options.chooseImport()};
   element('song-import-file').onchange=function(event){options.importFile(event)};
   element('songs-open').onclick=function(){options.openSongs()};
   element('songs-close').onclick=function(){element('songs-dialog').close()};
   element('song-save').onclick=function(){options.saveSong()};
   element('song-new').onclick=function(){options.newSong()};
   element('song-list-create').onclick=function(){
    options.createSongList(element('song-list-new-name').value);
    element('song-list-new-name').value='';
   };
   element('song-list-editor-close').onclick=function(){options.closeSongList()};
   element('song-list-editor-cancel').onclick=function(){options.closeSongList()};
   element('song-list-editor-save').onclick=function(){options.saveSongList()};
   element('song-list-delete').onclick=function(){options.deleteSongList()};
   element('song-list-editor-dialog').addEventListener('cancel',function(event){event.preventDefault();options.closeSongList()});
  }

  function bindRedesignControls(){
   element('redesign-song-search').oninput=function(){options.renderRedesignSongs()};
   element('song-bpm-dialog-cancel').onclick=function(){options.closeSongBpm()};
   element('song-bpm-dialog-save').onclick=function(){options.saveSongBpm()};
   element('song-bpm-dialog-input').addEventListener('keydown',function(event){
    if(event.key==='Enter'){event.preventDefault();options.saveSongBpm()}
   });
   element('song-bpm-dialog').addEventListener('cancel',function(event){event.preventDefault();options.closeSongBpm()});
   element('redesign-manage-songs').onclick=function(){element('songs-open').click()};
   element('redesign-new-song').onclick=function(){element('songs-open').click();setTimeout(function(){element('song-new').click()},40)};
   element('redesign-import-song').onclick=function(){element('song-import').click()};
   element('redesign-export-song').onclick=function(){element('song-export').click()};
  }

  return Object.freeze({
   updateSongNameDisplay:updateSongNameDisplay,
   renderSongListsLibrary:renderSongListsLibrary,
   renderSongListEditor:renderSongListEditor,
   renderSongsList:renderSongsList,
   renderRedesignSongs:renderRedesignSongs,
   openSongsDialog:openSongsDialog,
   openSongListDialog:openSongListDialog,
   closeSongListDialog:closeSongListDialog,
   openSongBpmDialog:openSongBpmDialog,
   closeSongBpmDialog:closeSongBpmDialog,
   bindMainControls:bindMainControls,
   bindRedesignControls:bindRedesignControls
  });
 }

 global.GeraSongsLibraryUI=Object.freeze({createController:createController});
})(typeof window!=='undefined'?window:globalThis);
