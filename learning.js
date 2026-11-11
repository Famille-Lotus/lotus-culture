(()=>{
'use strict';
const banks=window.LOTUS_BANKS,el=id=>document.getElementById(id),key='lotus_quiz_revision_v1';
let progress={};try{const x=JSON.parse(localStorage.getItem(key)||'{}');if(x&&typeof x==='object'&&!Array.isArray(x))progress=x;}catch{}
let selected=null,index=0,mode='quiz',locked=false,completed=new Set();
function persist(){try{localStorage.setItem(key,JSON.stringify(progress));}catch{el('learningStatus').textContent='Enregistrement indisponible dans ce navigateur.';}}
function catalogue(){for(const kind of ['culture','scolaire','universitaire']){
 const target=el('banks-'+kind);target.replaceChildren();banks.filter(b=>b.kind===kind).forEach(b=>{
 const button=document.createElement('button');button.type='button';button.className='collection';
 const title=document.createElement('strong');title.textContent=b.title;const subtitle=document.createElement('span');
 const n=Array.isArray(progress[b.id])?new Set(progress[b.id].filter(i=>Number.isInteger(i)&&i>=0&&i<b.items.length)).size:0;
 subtitle.textContent=b.items.length+' questions · '+n+(n===1?' réussie':' réussies');button.append(title,subtitle);
 button.onclick=()=>open(b.id);target.append(button);
 });}}
function open(id){selected=banks.find(b=>b.id===id);if(!selected)return;index=0;completed=new Set();mode='quiz';el('learningPanel').classList.remove('hidden');draw();el('learningPanel').scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
function draw(){locked=false;const item=selected.items[index],isCard=mode==='cards';
 el('learningTitle').textContent=selected.title;el('learningCounter').textContent=(isCard?'Fiche ':'Question ')+(index+1)+' / '+selected.items.length;
 el('learningQuestion').textContent=item.q;el('learningFeedback').textContent='';el('learningOptions').replaceChildren();el('learningNote').textContent='';
 el('learningReveal').hidden=!isCard;el('learningReveal').textContent='Lire la fiche';el('learningNext').disabled=!isCard;
 el('learningNext').textContent=index===selected.items.length-1?'Terminer la séance':'Suivant →';
 el('learningQuiz').setAttribute('aria-pressed',String(!isCard));el('learningCards').setAttribute('aria-pressed',String(isCard));
 if(!isCard){const order=item.opts.map((_,i)=>i);for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
 order.forEach(i=>{const button=document.createElement('button');button.type='button';button.textContent=item.opts[i];button.onclick=()=>{
 if(locked)return;if(i!==item.correct){button.disabled=true;button.classList.add('wrong');el('learningFeedback').textContent='Ce n’est pas la bonne réponse. Essaie une autre proposition.';return;}
 locked=true;button.classList.add('correct');Array.from(el('learningOptions').children).forEach(x=>x.disabled=true);completed.add(index);
 const saved=new Set(Array.isArray(progress[selected.id])?progress[selected.id]:[]);saved.add(index);progress[selected.id]=Array.from(saved);persist();catalogue();el('learningFeedback').textContent='Bonne réponse !';el('learningNext').disabled=false;
 };el('learningOptions').append(button);});}}
el('learningReveal').onclick=()=>{el('learningNote').textContent=selected.items[index].note;el('learningReveal').hidden=true;};
el('learningQuiz').onclick=()=>{mode='quiz';index=0;completed.clear();draw();};
el('learningCards').onclick=()=>{mode='cards';index=0;draw();};
el('learningNext').onclick=()=>{if(index<selected.items.length-1){index++;draw();}else{el('learningQuestion').textContent='Séance terminée 🌸';el('learningOptions').replaceChildren();el('learningNote').textContent='';el('learningReveal').hidden=true;el('learningFeedback').textContent=mode==='quiz'?completed.size+' questions réussies sur '+selected.items.length+'. Recommence pour consolider tes acquis.':'Tu as parcouru '+selected.items.length+' fiches. Passe au quiz pour t’entraîner.';el('learningNext').disabled=true;}};
el('learningClose').onclick=()=>{el('learningPanel').classList.add('hidden');el('learningCatalogue').scrollIntoView({block:'start'});};
window.lotusLearning={exportProgress:()=>progress,importProgress(value){const safe={};if(value&&typeof value==='object'&&!Array.isArray(value))for(const b of banks)if(Array.isArray(value[b.id]))safe[b.id]=[...new Set(value[b.id].filter(i=>Number.isInteger(i)&&i>=0&&i<b.items.length))];progress=safe;persist();catalogue();el('learningPanel').classList.add('hidden');}};
catalogue();
})();
