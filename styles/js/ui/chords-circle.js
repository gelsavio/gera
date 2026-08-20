/**
 * Controlador da interface de acordes e do círculo harmônico do GERA.
 * Preserva o DOM existente e encaminha a execução musical ao núcleo.
 */
(function(global){
 'use strict';

 function createController(options){
  const documentRef=options.document||global.document;
  const getElement=options.getElement;
  const chordNames=options.chordNames;
  const circleDegrees=options.circleDegrees;
  const secondaryDominants=options.secondaryDominants;

  function element(id){return getElement(id)}
  function circleEnabled(){return options.getCircleEnabled()}
  function circleRoot(){return options.getCircleRoot()}
  function setCircle(enabled,root){options.setCircleState(enabled,root)}
  function circleButton(){return element('circle-toggle')}
  function syncCircleButton(root){
   const button=circleButton();
   if(root===null){
    button.classList.remove('circle-active');
    button.textContent='CH';
   }else{
    button.classList.add('circle-active');
    button.textContent='CH '+chordNames[root];
   }
  }
  function createChordButton(root,type,bindPointer){
   const sharp=chordNames[root].includes('#');
   const button=documentRef.createElement('button');
   button.className='chord'+(sharp?' sharp-chord':'')+(type==='minor'?' minor-chord':'');
   button.textContent=chordNames[root]+(type==='minor'?'m':'');
   button.dataset.root=root;
   button.dataset.type=type;
   if(bindPointer!==false){
    button.addEventListener('pointerdown',function(event){
     event.preventDefault();
     options.handleChordButton(root,button.dataset.type,button,event.pointerId);
    });
   }
   return button;
  }
  function fillChordRow(id,type){
   const box=element(id);
   box.innerHTML='';
   for(let root=0;root<12;root++)box.appendChild(createChordButton(root,type));
  }
  function renderChords(){
   fillChordRow('major-chords','major');
   fillChordRow('minor-chords','minor');
   applyCircleFilter();
  }
  function renderCircleMainChords(){
   const wrap=element('circle-main-wrap');
   const box=element('circle-main-chords');
   const normal=element('normal-chord-group');
   box.innerHTML='';
   const active=circleEnabled()&&circleRoot()!==null;
   wrap.classList.toggle('visible',active);
   normal.classList.toggle('hidden',active);
   if(!active)return;

   circleDegrees.forEach(function(degreeData,index){
    const root=(circleRoot()+degreeData.step)%12;
    const type=degreeData.type;
    const degree=index+1;
    const button=createChordButton(root,type,false);
    button.dataset.degree=degree;
    button.textContent=chordNames[root]+(type==='minor'?'m':type==='diminished'?'°':'');
    let functionClass='function-tonic';
    let functionName='Tônica';
    if(degree===2||degree===4){functionClass='function-subdominant';functionName='Subdominante'}
    else if(degree===5){functionClass='function-dominant';functionName='Dominante'}
    else if(degree===7){functionClass='function-leading';functionName='Sensível/diminuto'}
    button.classList.add(functionClass);
    button.dataset.function=functionName;
    button.title=degree+'º grau — '+functionName;
    button.addEventListener('pointerdown',function(event){
     event.preventDefault();
     options.handleChordButton(root,button.dataset.type,button,event.pointerId);
    });
    box.appendChild(button);
   });
  }
  function renderSecondaryDominants(){
   const wrap=element('secondary-dominants-wrap');
   const box=element('secondary-dominants');
   box.innerHTML='';
   if(!circleEnabled()||circleRoot()===null){wrap.classList.remove('visible');return}

   secondaryDominants.forEach(function(item){
    const targetRoot=(circleRoot()+item.targetStep)%12;
    const dominantRoot=(targetRoot+7)%12;
    const targetLabel=options.chordLabel(targetRoot,item.targetType);
    const button=documentRef.createElement('button');
    button.className='chord secondary-dominant';
    button.dataset.root=dominantRoot;
    button.dataset.type='dominant7';
    button.dataset.secondary='true';
    button.dataset.targetRoot=targetRoot;
    button.dataset.targetType=item.targetType;
    button.innerHTML=options.chordLabel(dominantRoot,'dominant7')+' → '+targetLabel+'<small>'+item.degree+'</small>';
    button.title=item.degree+': dominante secundário que resolve em '+targetLabel;
    button.addEventListener('pointerdown',function(event){
     event.preventDefault();
     options.handleChordButton(dominantRoot,'dominant7',button,event.pointerId);
    });
    box.appendChild(button);
   });
   wrap.classList.add('visible');
  }
  function resetNormalChordButtons(){
   const buttons=Array.from(documentRef.querySelectorAll('#major-chords .chord, #minor-chords .chord'));
   const functionalClasses=['function-tonic','function-subdominant','function-dominant','function-leading'];
   buttons.forEach(function(button){
    button.classList.remove('filtered-out',...functionalClasses);
    const original=button.closest('#minor-chords')?'minor':'major';
    button.dataset.type=original;
    button.textContent=chordNames[Number(button.dataset.root)]+(original==='minor'?'m':'');
    button.removeAttribute('data-degree');
    button.removeAttribute('data-function');
    button.removeAttribute('title');
   });
  }
  function applyCircleFilter(){
   resetNormalChordButtons();
   renderCircleMainChords();
   renderSecondaryDominants();
   if(!circleEnabled()||circleRoot()===null){options.setStatus('Todos os acordes disponíveis');return}
   options.setStatus('Círculo harmônico de '+chordNames[circleRoot()]+': acordes diatônicos em uma linha e dominantes secundários abaixo');
  }
  function selectFromDialog(root){
   setCircle(true,root);
   syncCircleButton(root);
   applyCircleFilter();
   element('circle-dialog').close();
  }
  function openCircleDialog(){
   const grid=element('circle-note-grid');
   grid.innerHTML='';
   chordNames.forEach(function(name,root){
    const button=documentRef.createElement('button');
    button.textContent=name;
    button.onclick=function(){selectFromDialog(root)};
    grid.appendChild(button);
   });
   element('circle-dialog').showModal();
  }
  function toggleCircle(){
   if(circleEnabled()){
    setCircle(false,null);
    syncCircleButton(null);
    applyCircleFilter();
    options.setStatus('Filtro do círculo harmônico desligado');
   }else openCircleDialog();
  }
  function bindLegacyControls(){
   circleButton().onclick=toggleCircle;
   element('circle-close').onclick=function(){element('circle-dialog').close()};
  }
  function selectFromDial(root,afterSelect){
   if(root===null){
    setCircle(false,null);
    syncCircleButton(null);
   }else{
    setCircle(true,root);
    syncCircleButton(root);
   }
   applyCircleFilter();
   if(typeof afterSelect==='function')afterSelect();
  }
  function renderDial(afterSelect){
   const dial=element('redesign-dial');
   if(!dial)return;
   dial.innerHTML='';

   const allButton=documentRef.createElement('button');
   allButton.type='button';
   allButton.className='redesign-dial-all'+(!circleEnabled()||circleRoot()===null?' active':'');
   allButton.textContent='Todos';
   allButton.title='Mostrar todos os acordes maiores e menores';
   allButton.setAttribute('aria-label','Mostrar todos os acordes');
   allButton.addEventListener('pointerup',function(event){
    event.preventDefault();
    selectFromDial(null,afterSelect);
   });
   allButton.addEventListener('click',function(event){
    event.preventDefault();
    selectFromDial(null,afterSelect);
   });
   dial.appendChild(allButton);

   chordNames.forEach(function(name,index){
    const button=documentRef.createElement('button');
    button.type='button';
    button.className='redesign-dial-key';
    button.style.setProperty('--a',(index*30)+'deg');
    button.textContent=name;
    button.title='Selecionar campo harmônico de '+name+' maior';
    button.setAttribute('aria-label','Campo harmônico de '+name+' maior');

    let pointerHandled=false;
    button.addEventListener('pointerup',function(event){
     event.preventDefault();
     pointerHandled=true;
     selectFromDial(index,afterSelect);
     setTimeout(function(){pointerHandled=false},0);
    });
    button.addEventListener('click',function(event){
     event.preventDefault();
     if(pointerHandled)return;
     selectFromDial(index,afterSelect);
    });
    if(circleEnabled()&&circleRoot()===index)button.classList.add('active');
    dial.appendChild(button);
   });
  }

  return Object.freeze({
   renderChords:renderChords,
   applyCircleFilter:applyCircleFilter,
   openCircleDialog:openCircleDialog,
   bindLegacyControls:bindLegacyControls,
   renderDial:renderDial
  });
 }

 global.GeraChordsCircle=Object.freeze({createController:createController});
})(typeof window!=='undefined'?window:globalThis);
