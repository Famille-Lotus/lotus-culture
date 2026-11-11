(()=>{
'use strict';
const $=id=>document.getElementById(id),levels=['facile','intermediaire','difficile','expert'],labels={facile:'🌱 Facile',intermediaire:'⚡ Intermédiaire',difficile:'🔥 Difficile',expert:'👑 Expert'},key='lotus_quiz_random_v1';
const banks=window.LOTUS_RANDOM_BANKS,pool=[];
for(const b of banks){b.items.forEach((q,i)=>pool.push({...q,id:'r-'+b.id+'-'+i,category:b.id,title:b.title}));
 const old=(window.LOTUS_BANKS||[]).find(x=>x.id===b.id);if(old)old.items.forEach((q,i)=>pool.push({...q,id:'l-'+b.id+'-'+i,category:b.id,title:b.title,difficulty:b.kind==='universitaire'?(i<2?'intermediaire':'difficile'):i<2?'facile':i<4?'intermediaire':'difficile'}));}
const ids=new Set(pool.map(q=>q.id));let progress={},queue=[],current=0,attempted=false,locked=false,successes=0,active=null;
function sanitize(value){const safe={};if(value&&typeof value==='object'&&!Array.isArray(value))for(const id of Object.keys(value))if(ids.has(id)&&value[id]===true)safe[id]=true;return safe;}
try{progress=sanitize(JSON.parse(localStorage.getItem(key)||'{}'));}catch{}
function persist(){try{localStorage.setItem(key,JSON.stringify(progress));}catch{$('randomStatus').textContent='Le navigateur ne permet pas l’enregistrement local. Exporte ta sauvegarde.';}}
function shuffled(a){const out=a.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function matches(q){return ($('randomCategory').value==='all'||q.category===$('randomCategory').value)&&($('randomDifficulty').value==='all'||q.difficulty===$('randomDifficulty').value);}
function update(){const available=pool.filter(matches);$('randomAvailable').textContent=available.length+' questions disponibles · Réussites enregistrées : '+available.filter(q=>progress[q.id]).length+'. Les questions ne se répètent pas pendant une séance.';}
function titleCard(b){const button=document.createElement('button');button.type='button';button.className='collection';const strong=document.createElement('strong');strong.textContent=b.title;const small=document.createElement('span');small.textContent='Questions aléatoires · 4 difficultés';button.append(strong,small);button.onclick=()=>{$('randomCategory').value=b.id;update();$('randomConfig').scrollIntoView({block:'start'});$('randomDifficulty').focus();};return button;}
for(const b of banks){const option=document.createElement('option');option.value=b.id;option.textContent=b.title;$('randomCategory').append(option);if(['general','logique','memoire','musique'].includes(b.id))$('randomUniverses').append(titleCard(b));}
$('randomCategory').onchange=update;$('randomDifficulty').onchange=update;
function draw(){active=queue[current];locked=false;attempted=false;$('randomQuestion').textContent=active.q;$('randomBadge').textContent=active.title+' · '+labels[active.difficulty];$('randomCounter').textContent='Question '+(current+1)+' / '+queue.length;$('randomFeedback').textContent='';$('randomNext').disabled=true;$('randomNext').textContent=current===queue.length-1?'Voir mon bilan':'Question suivante →';$('randomAnswers').replaceChildren();
 shuffled(active.opts.map((_,i)=>i)).forEach(i=>{const b=document.createElement('button');b.type='button';b.textContent=active.opts[i];b.onclick=()=>{if(locked)return;attempted=true;locked=true;const correct=i===active.correct;b.classList.add(correct?'correct':'wrong');Array.from($('randomAnswers').children).forEach(x=>x.disabled=true);if(correct){successes++;progress[active.id]=true;persist();update();$('randomFeedback').textContent='Bonne réponse !';$('randomNext').disabled=false;}else{$('randomFeedback').textContent='Réessaie : la bonne réponse reste masquée.';$('randomNext').textContent='Réessayer ↻';$('randomNext').disabled=false;}};$('randomAnswers').append(b);});
}
function start(){const category=$('randomCategory').value,level=$('randomDifficulty').value;let candidates=pool.filter(matches);const max=Number($('randomCount').value);if(!candidates.length){$('randomStatus').textContent='Aucune question pour cette sélection.';return;}
 // Mixed sessions take turns among shuffled category groups so all universes get a fair chance.
 if(category==='all'){
  const groups=shuffled(banks.map(b=>shuffled(candidates.filter(q=>q.category===b.id))).filter(g=>g.length));const ordered=[];while(groups.some(g=>g.length))for(const g of groups)if(g.length)ordered.push(g.pop());candidates=ordered;
 }else candidates=shuffled(candidates);
 queue=candidates.slice(0,Math.min(max,candidates.length));current=0;successes=0;$('randomPanel').classList.remove('hidden');$('randomReplay').hidden=true;$('randomStatus').textContent='Séance lancée : '+queue.length+' questions. Sans chronomètre.';draw();$('randomPanel').scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
$('randomStart').onclick=start;$('randomNext').onclick=()=>{if(!locked)return;if(!progress[active.id]||$('randomNext').textContent==='Réessayer ↻'){draw();return;}if(current<queue.length-1){current++;draw();}else{$('randomQuestion').textContent='Séance terminée 🌸';$('randomAnswers').replaceChildren();$('randomFeedback').textContent=successes+' questions réussies sur '+queue.length+'. Les tentatives après erreur sont autorisées ; ce bilan compte les questions finalement réussies.';$('randomNext').disabled=true;$('randomReplay').hidden=false;}};
$('randomReplay').onclick=start;$('randomClose').onclick=()=>{$('randomPanel').classList.add('hidden');$('randomConfig').scrollIntoView({block:'start'});};
const legacy=window.lotusLearning;if(legacy){const exportOld=legacy.exportProgress.bind(legacy),importOld=legacy.importProgress.bind(legacy);legacy.exportProgress=()=>({...exportOld(),__random_v1:progress});legacy.importProgress=value=>{importOld(value);progress=sanitize(value?.__random_v1);persist();update();$('randomPanel').classList.add('hidden');};}
update();
})();
