(() => {
  'use strict';
  const root=document.getElementById('slap15');
  if(!root)return;

  // Branding.
  document.title='Tap Trivia';
  const h1=root.querySelector('h1');
  if(h1)h1.textContent='Tap Trivia';
  root.querySelectorAll('.brand').forEach(el=>el.textContent='Tap Trivia');

  // Keep the existing game logic intact, but make Host the default mode.
  const mode=root.querySelector('#gameMode');
  const hostName=root.querySelector('#hostName');
  if(mode){
    mode.value='host';
    mode.dispatchEvent(new Event('change',{bubbles:true}));
  }
  if(hostName)hostName.disabled=false;

  // Hide question levels and pin the internal value to Mix so the existing
  // start handler can remain unchanged while our loader supplies ALL questions.
  const level=root.querySelector('#levelSelect');
  if(level){
    level.value='mix';
    const field=level.closest('.setup-field');
    if(field)field.style.display='none';
  }
  const setupText=root.querySelector('#setupPanel .qtext');
  if(setupText)setupText.textContent='Set the players and winning score.';

  // Replace any built-in sample names with Player 1, Player 2, etc.
  function normalizePlayerNames(){
    const inputs=[...root.querySelectorAll('#nameFields input')];
    inputs.forEach((input,i)=>{
      const generic='Player '+(i+1);
      input.value=generic;
      input.placeholder=generic;
    });
  }
  normalizePlayerNames();

  const playerCount=root.querySelector('#playerCount');
  if(playerCount){
    playerCount.addEventListener('change',()=>setTimeout(normalizePlayerNames,0));
  }

  function shuffle(arr){
    const out=arr.slice();
    for(let i=out.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [out[i],out[j]]=[out[j],out[i]];
    }
    return out;
  }

  function normalize(raw){
    const flat=raw.flat();
    return flat.map((q,i)=>{
      if(Array.isArray(q)){
        return {question:q[0],answer:q[1],category:'Uncategorized',subject:'Uncategorized',sourceRow:i};
      }
      return {
        ...q,
        answer:q.answer??q.answers,
        category:q.assigned_category||q.category||'Uncategorized',
        subject:q.subject||q.topic||q.subcategory||q.assigned_category||q.category||'Uncategorized',
        sourceRow:Number.isFinite(Number(q.sourceRow))?Number(q.sourceRow):i
      };
    }).filter(q=>q.question&&q.answer);
  }

  // Build one randomized deck. A candidate may not create three identical
  // subjects in a row, and a repeated category must be >=50 source rows away.
  function buildDeck(source){
    const unique=[...new Map(source.map(q=>[String(q.question).trim().toLowerCase(),q])).values()];
    let best=[];
    for(let attempt=0;attempt<80;attempt++){
      const remaining=shuffle(unique);
      const out=[];
      const lastCategoryRow=new Map();
      while(remaining.length){
        let pick=-1;
        for(let i=0;i<remaining.length;i++){
          const q=remaining[i];
          const n=out.length;
          const threeSame=n>=2&&out[n-1].subject===q.subject&&out[n-2].subject===q.subject;
          const priorRow=lastCategoryRow.get(q.category);
          const categoryGap=priorRow==null||Math.abs(q.sourceRow-priorRow)>=50;
          if(!threeSame&&categoryGap){pick=i;break;}
        }
        if(pick<0)break;
        const q=remaining.splice(pick,1)[0];
        out.push({...q,difficulty:'mix',order:out.length+1});
        lastCategoryRow.set(q.category,q.sourceRow);
      }
      if(out.length>best.length)best=out;
      if(out.length===unique.length)break;
    }
    // If source rows lack enough category diversity, preserve every question
    // and still enforce the no-three-subjects rule rather than failing startup.
    if(best.length<unique.length){
      const used=new Set(best.map(q=>String(q.question).trim().toLowerCase()));
      const rest=shuffle(unique.filter(q=>!used.has(String(q.question).trim().toLowerCase())));
      while(rest.length){
        const n=best.length;
        let i=rest.findIndex(q=>!(n>=2&&best[n-1].subject===q.subject&&best[n-2].subject===q.subject));
        if(i<0)i=0;
        const q=rest.splice(i,1)[0];
        best.push({...q,difficulty:'mix',order:best.length+1});
      }
    }
    return best;
  }

  let allCache=null;
  let allPending=null;
  root.__loadQuestionBanks=async()=>{
    if(allCache)return allCache;
    if(allPending)return allPending;
    allPending=(async()=>{
      if(!('DecompressionStream' in window))throw new Error('This browser cannot open the question database.');
      const encoded=(window.SLAP15_DATA||'').replace(/\s+/g,'');
      if(!encoded)throw new Error('Question database did not load. Refresh the page and try again.');
      const binary=atob(encoded);
      const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
      const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      const raw=JSON.parse(await new Response(stream).text());
      const deck=buildDeck(normalize(raw));
      allCache={mix:deck,easy:deck,medium:deck,hard:deck,smart:deck};
      root.__questionBanks=allCache;
      return allCache;
    })();
    try{return await allPending;}finally{allPending=null;}
  };

  // Each new game starts at a freshly randomized first question instead of
  // continuing a saved level position.
  const start=root.querySelector('#startGame');
  if(start){
    start.addEventListener('click',()=>{
      allCache=null;
      if(window.__slap15QuestionIndexes)window.__slap15QuestionIndexes.mix=0;
      if(level)level.value='mix';
      if(mode)mode.value='host';
    },true);
  }
})();