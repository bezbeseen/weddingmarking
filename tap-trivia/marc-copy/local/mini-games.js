(() => {
  const HIGHER_LOWER = [
    ["Eiffel Tower height (ft)",1083],["Empire State Building height (ft)",1454],["Golden Gate Bridge main span (ft)",4200],["Mount Everest height (ft)",29032],["Grand Canyon max depth (ft)",6000],["Statue of Liberty height (ft)",305],["Burj Khalifa height (ft)",2717],["Hoover Dam height (ft)",726]
  ];
  const CLOSEST = [
    ["How many bones are in the adult human body?",206],["How many keys are on a standard piano?",88],["How many elements are currently on the periodic table?",118],["How many minutes are in a day?",1440],["How many feet are in a mile?",5280],["How many squares are on a chessboard?",64]
  ];
  const RAPID = {
    Science:[['What planet is known as the Red Planet?','Mars'],['What gas do plants absorb?','Carbon dioxide'],['What is H2O commonly called?','Water'],['What organ pumps blood?','Heart'],['What is the center of an atom called?','Nucleus'],['What force keeps us on Earth?','Gravity'],['What is the closest star to Earth?','The Sun'],['How many planets are in our solar system?','8'],['What is the hardest natural substance?','Diamond'],['What blood cells fight infection?','White blood cells'],['What scale measures acidity?','pH'],['What is the chemical symbol for gold?','Au']],
    Geography:[['What is the capital of France?','Paris'],['What is the largest ocean?','Pacific Ocean'],['What river runs through Egypt?','Nile'],['What country contains Rome?','Italy'],['What is the capital of Japan?','Tokyo'],['What continent is Brazil in?','South America'],['What is the largest country by area?','Russia'],['What desert covers much of North Africa?','Sahara'],['What country is shaped like a boot?','Italy'],['What is the capital of Canada?','Ottawa'],['What mountain range includes Everest?','Himalayas'],['What sea separates Europe and Africa?','Mediterranean Sea']],
    Sports:[['How many points is a touchdown worth?','6'],['How many players are on a basketball team on court?','5'],['What sport uses a puck?','Hockey'],['How many strikes make an out in baseball?','3'],['What sport uses a shuttlecock?','Badminton'],['What country hosted the 2016 Summer Olympics?','Brazil'],['How many holes are in a standard golf round?','18'],['What sport has a scrum?','Rugby'],['What is three goals by one player called?','Hat trick'],['What sport uses love as a score?','Tennis'],['How many bases are on a baseball field?','4'],['What sport is played at Wimbledon?','Tennis']]
  };

  let miniIndex = 0;
  let overlay;
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function api(){ return document.getElementById('slap15')?.__miniGameAPI; }
  function ensure(){
    if (overlay) return overlay;
    const style=document.createElement('style');
    style.textContent=`#tapMiniGame{position:fixed;inset:0;z-index:200;background:#111214;color:#fff;display:none;overflow:auto;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}#tapMiniGame.show{display:block}#tapMiniGame .mg-wrap{max-width:900px;margin:0 auto;padding:28px 20px 42px}#tapMiniGame .mg-kicker{text-transform:uppercase;letter-spacing:.14em;font-weight:900;opacity:.7}#tapMiniGame h2{font-size:clamp(42px,8vw,76px);margin:8px 0 10px;line-height:.95}#tapMiniGame .mg-sub{font-size:22px;font-weight:750;opacity:.8;margin-bottom:24px}#tapMiniGame .mg-card{background:#202226;border-radius:22px;padding:22px;margin:16px 0}#tapMiniGame .mg-big{font-size:clamp(28px,6vw,48px);font-weight:900;line-height:1.12}#tapMiniGame .mg-value{font-size:clamp(46px,10vw,82px);font-weight:950;margin:12px 0}#tapMiniGame .mg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}#tapMiniGame button{min-height:64px;border:0;border-radius:16px;padding:12px 16px;font-size:20px;font-weight:900;cursor:pointer}#tapMiniGame .primary{background:#fff;color:#111}#tapMiniGame .good{background:#15803d;color:#fff}#tapMiniGame .bad{background:#b42318;color:#fff}#tapMiniGame input{width:100%;min-height:58px;border-radius:14px;border:1px solid #555;background:#fff;color:#111;padding:10px 14px;font-size:22px;font-weight:800}#tapMiniGame .mg-row{display:grid;grid-template-columns:1fr 180px;gap:10px;align-items:center;margin:10px 0}#tapMiniGame .mg-result{font-size:26px;font-weight:900;margin-top:18px}`;
    document.head.appendChild(style);
    overlay=document.createElement('div'); overlay.id='tapMiniGame'; document.body.appendChild(overlay); return overlay;
  }
  function shell(title,sub,body){
    ensure().innerHTML=`<div class="mg-wrap"><div class="mg-kicker">Mini game break</div><h2>${esc(title)}</h2><div class="mg-sub">${esc(sub)}</div>${body}</div>`;
    overlay.classList.add('show');
  }
  function close(){ overlay?.classList.remove('show'); }
  function players(){ return api()?.getPlayers?.() || []; }
  function choosePlayer(next){
    const ps=players();
    shell('Choose a player','This mini game awards +1 point.',`<div class="mg-grid">${ps.map(p=>`<button class="primary" data-p="${p.index}">${esc(p.avatar)} ${esc(p.name)} · ${p.score}</button>`).join('')}</div>`);
    overlay.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>next(Number(b.dataset.p)));
  }
  function higherLower(){
    choosePlayer(i=>{
      const shuffled=HIGHER_LOWER.slice().sort(()=>Math.random()-.5), a=shuffled[0], b=shuffled[1];
      shell('Higher / Lower',`${players()[i]?.name || 'Player'} plays for +1 point.`,`<div class="mg-card"><div class="mg-big">${esc(a[0])}</div><div class="mg-value">${a[1].toLocaleString()}</div></div><div class="mg-card"><div class="mg-big">${esc(b[0])}</div><div class="mg-sub">Is it higher or lower?</div><div class="mg-grid"><button class="primary" id="mgHigher">Higher</button><button class="primary" id="mgLower">Lower</button></div></div>`);
      const resolve=guess=>{const correct=b[1]>a[1]?'higher':'lower';const won=guess===correct;if(won)api().addPoints(i,1);shell(won?'Correct!':'Not this time',`${b[0]}: ${b[1].toLocaleString()}`,`<div class="mg-result">${won?'+1 point':'No score change'}</div><button class="primary" id="mgDone">Back to trivia</button>`);overlay.querySelector('#mgDone').onclick=close;};
      overlay.querySelector('#mgHigher').onclick=()=>resolve('higher'); overlay.querySelector('#mgLower').onclick=()=>resolve('lower');
    });
  }
  function closestWins(){
    const ps=players(), q=CLOSEST[Math.floor(Math.random()*CLOSEST.length)];
    shell('Closest Wins','Every player guesses. Closest answer earns +1 point.',`<div class="mg-card"><div class="mg-big">${esc(q[0])}</div></div>${ps.map(p=>`<div class="mg-row"><strong>${esc(p.avatar)} ${esc(p.name)}</strong><input type="number" data-g="${p.index}" placeholder="Guess"></div>`).join('')}<button class="primary" id="mgReveal">Reveal answer</button>`);
    overlay.querySelector('#mgReveal').onclick=()=>{
      const guesses=[...overlay.querySelectorAll('[data-g]')].map(el=>({i:Number(el.dataset.g),v:Number(el.value)})).filter(x=>Number.isFinite(x.v));
      if(!guesses.length)return;
      const best=Math.min(...guesses.map(x=>Math.abs(x.v-q[1]))); const winners=guesses.filter(x=>Math.abs(x.v-q[1])===best);
      winners.forEach(w=>api().addPoints(w.i,1));
      shell('Answer: '+q[1],winners.length===1?`${players()[winners[0].i]?.name} was closest.`:'Tie — each closest player scores.',`<div class="mg-result">${winners.map(w=>esc(players()[w.i]?.name||'Player')+' +1').join('<br>')}</div><button class="primary" id="mgDone">Back to trivia</button>`); overlay.querySelector('#mgDone').onclick=close;
    };
  }
  function rapidFire(){
    const a=api(), last=a.getLastPlaceIndexes();
    const pickPlayer=cb=>{
      if(last.length===1)return cb(last[0]);
      shell('Rock Paper Scissors','Last place is tied. Play RPS, then tap the winner.',`<div class="mg-grid">${last.map(i=>`<button class="primary" data-rps="${i}">${esc(players()[i]?.name||'Player')}</button>`).join('')}</div>`); overlay.querySelectorAll('[data-rps]').forEach(b=>b.onclick=()=>cb(Number(b.dataset.rps)));
    };
    pickPlayer(i=>{
      const cats=Object.keys(RAPID).sort(()=>Math.random()-.5).slice(0,3);
      shell('Rapid Fire',`${players()[i]?.name} is in last place. Choose a category.`,`<div class="mg-grid">${cats.map(c=>`<button class="primary" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="mg-sub" style="margin-top:20px">4 correct = +1 · 8 correct = +2 · 11 correct = catch-up bonus</div>`);
      overlay.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>runRapid(i,b.dataset.cat));
    });
  }
  function runRapid(i,cat){
    const qs=RAPID[cat].slice().sort(()=>Math.random()-.5); let n=0, correct=0, seconds=60, timer;
    const draw=()=>{
      const q=qs[n%qs.length];
      shell('Rapid Fire',`${players()[i]?.name} · ${cat} · ${seconds}s · ${correct} correct`,`<div class="mg-card"><div class="mg-big">${esc(q[0])}</div><div class="mg-sub" style="margin-top:16px">Answer: ${esc(q[1])}</div></div><div class="mg-grid"><button class="good" id="mgCorrect">Correct</button><button class="bad" id="mgPass">Pass</button><button class="primary" id="mgFinish">Finish</button></div>`);
      overlay.querySelector('#mgCorrect').onclick=()=>{correct++;n++;draw()}; overlay.querySelector('#mgPass').onclick=()=>{n++;draw()}; overlay.querySelector('#mgFinish').onclick=finish;
    };
    const finish=()=>{clearInterval(timer); const p=players()[i]; let newScore=p.score, label='No score change'; if(correct>=11){newScore=Math.max(p.score+4,api().getLeaderScore()-1);api().setScore(i,newScore);label=`Score moves to ${newScore}`;}else if(correct>=8){api().addPoints(i,2);label='+2 points';}else if(correct>=4){api().addPoints(i,1);label='+1 point';} shell('Rapid Fire complete',`${correct} correct.`,`<div class="mg-result">${esc(label)}</div><button class="primary" id="mgDone">Back to trivia</button>`);overlay.querySelector('#mgDone').onclick=close;};
    timer=setInterval(()=>{seconds--;if(seconds<=0)finish();else draw();},1000); draw();
  }
  window.addEventListener('DOMContentLoaded',ensure);
  const rootWait=setInterval(()=>{const root=document.getElementById('slap15');if(!root)return;root.__launchMiniGame=()=>{[higherLower,closestWins,rapidFire][miniIndex++%3]()};clearInterval(rootWait)},100);
})();