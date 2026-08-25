(() => {
  'use strict';

  const RAPID = {
    Science:[['What planet is known as the Red Planet?','Mars'],['What gas do plants absorb?','Carbon dioxide'],['What is H2O commonly called?','Water'],['What organ pumps blood?','Heart'],['What is the center of an atom called?','Nucleus'],['What force keeps us on Earth?','Gravity'],['What is the closest star to Earth?','The Sun'],['How many planets are in our solar system?','8'],['What is the hardest natural substance?','Diamond'],['What blood cells fight infection?','White blood cells'],['What scale measures acidity?','pH'],['What is the chemical symbol for gold?','Au']],
    Geography:[['What is the capital of France?','Paris'],['What is the largest ocean?','Pacific Ocean'],['What river runs through Egypt?','Nile'],['What country contains Rome?','Italy'],['What is the capital of Japan?','Tokyo'],['What continent is Brazil in?','South America'],['What is the largest country by area?','Russia'],['What desert covers much of North Africa?','Sahara'],['What country is shaped like a boot?','Italy'],['What is the capital of Canada?','Ottawa'],['What mountain range includes Everest?','Himalayas'],['What sea separates Europe and Africa?','Mediterranean Sea']],
    Sports:[['How many points is a touchdown worth?','6'],['How many players are on a basketball team on court?','5'],['What sport uses a puck?','Hockey'],['How many strikes make an out in baseball?','3'],['What sport uses a shuttlecock?','Badminton'],['What country hosted the 2016 Summer Olympics?','Brazil'],['How many holes are in a standard golf round?','18'],['What sport has a scrum?','Rugby'],['What is three goals by one player called?','Hat trick'],['What sport uses love as a score?','Tennis'],['How many bases are on a baseball field?','4'],['What sport is played at Wimbledon?','Tennis']]
  };

  const FALLBACK_NUMERIC = [
    {id:'cw-1',q:'In what year was the Declaration of Independence signed?',v:1776},
    {id:'cw-2',q:'How many feet are in one mile?',v:5280},
    {id:'cw-3',q:'How many minutes are in one day?',v:1440},
    {id:'cw-4',q:'In what year did the first Moon landing occur?',v:1969},
    {id:'cw-5',q:'How many bones are in the adult human body?',v:206},
    {id:'cw-6',q:'How many keys are on a standard piano?',v:88},
    {id:'cw-7',q:'How many cards are in a standard deck without jokers?',v:52},
    {id:'cw-8',q:'In what year did World War II end?',v:1945},
    {id:'cw-9',q:'How many degrees are in a full circle?',v:360},
    {id:'cw-10',q:'How many days are in a leap year?',v:366},
    {id:'cw-11',q:'In what year did the Titanic sink?',v:1912},
    {id:'cw-12',q:'How many senators are in the United States Senate?',v:100},
    {id:'cw-13',q:'How many squares are on a chessboard?',v:64},
    {id:'cw-14',q:'In what year did the Berlin Wall fall?',v:1989},
    {id:'cw-15',q:'How many elements are currently on the periodic table?',v:118},
    {id:'cw-16',q:'How many seats are in the U.S. House of Representatives?',v:435},
    {id:'cw-17',q:'In what year did the United States Constitution take effect?',v:1789},
    {id:'cw-18',q:'How many holes are played in a standard round of golf?',v:18},
    {id:'cw-19',q:'How many weeks are in a typical year?',v:52},
    {id:'cw-20',q:'In what year was the first Super Bowl played?',v:1967}
  ];

  let miniIndex = 0;
  let overlay;
  let cachedNumericBank = null;

  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function api(){ return document.getElementById('slap15')?.__miniGameAPI; }
  function players(){ return api()?.getPlayers?.() || []; }

  function ensure(){
    if (overlay) return overlay;
    const style=document.createElement('style');
    style.textContent=`#tapMiniGame{position:fixed;inset:0;z-index:220;background:#111214;color:#fff;display:none;overflow:auto;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}#tapMiniGame.show{display:block}#tapMiniGame *{box-sizing:border-box}#tapMiniGame .mg-wrap{max-width:920px;margin:0 auto;padding:30px 20px 46px}#tapMiniGame .mg-kicker{text-transform:uppercase;letter-spacing:.14em;font-weight:900;opacity:.7}#tapMiniGame h2{font-size:clamp(46px,8vw,78px);margin:8px 0 12px;line-height:.96}#tapMiniGame .mg-sub{font-size:22px;font-weight:750;opacity:.82;margin-bottom:22px}#tapMiniGame .mg-card{background:#202226;border-radius:22px;padding:24px;margin:16px 0}#tapMiniGame .mg-big{font-size:clamp(28px,5vw,46px);font-weight:900;line-height:1.12}#tapMiniGame .mg-value{font-size:clamp(48px,9vw,82px);font-weight:950;margin:12px 0}#tapMiniGame .mg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}#tapMiniGame button{min-height:66px;border:0;border-radius:16px;padding:12px 16px;font-size:21px;font-weight:900;cursor:pointer}#tapMiniGame .primary{background:#fff;color:#111}#tapMiniGame .good{background:#15803d;color:#fff}#tapMiniGame .bad{background:#b42318;color:#fff}#tapMiniGame .guess-popup{max-width:560px;margin:28px auto 0;background:#f7f7f7;color:#111;border-radius:24px;padding:26px;box-shadow:0 20px 60px rgba(0,0,0,.45)}#tapMiniGame .guess-player{font-size:30px;font-weight:950;margin-bottom:8px}#tapMiniGame .guess-note{font-size:17px;font-weight:700;opacity:.7;margin-bottom:16px}#tapMiniGame input{width:100%;min-height:72px;border-radius:15px;border:2px solid #bbb;background:#fff;color:#111;padding:10px 15px;font-size:32px;font-weight:900;text-align:center}#tapMiniGame .locked-list{display:grid;gap:8px;margin-top:16px}#tapMiniGame .locked{background:#202226;border-radius:13px;padding:10px 14px;font-weight:850}#tapMiniGame .mg-result{font-size:clamp(30px,6vw,52px);font-weight:950;margin:14px 0}#tapMiniGame .winner{font-size:clamp(42px,8vw,68px);font-weight:950;margin:14px 0}#tapMiniGame .guess-results{display:grid;gap:10px;margin-top:18px}#tapMiniGame .guess-result{display:flex;justify-content:space-between;gap:20px;background:#202226;border-radius:14px;padding:12px 15px;font-size:19px;font-weight:850}#tapMiniGame .guess-result.win{outline:3px solid #fff}`;
    document.head.appendChild(style);
    overlay=document.createElement('div');overlay.id='tapMiniGame';document.body.appendChild(overlay);return overlay;
  }

  function shell(title,sub,body){
    ensure().innerHTML=`<div class="mg-wrap"><div class="mg-kicker">Mini game break</div><h2>${esc(title)}</h2><div class="mg-sub">${esc(sub)}</div>${body}</div>`;
    overlay.classList.add('show');
  }
  function close(){ overlay?.classList.remove('show'); }

  async function readyCatalog(){
    if(cachedNumericBank?.length) return cachedNumericBank;
    try{
      if(window.TAP_MINI_NUMERIC_CATALOG_READY) await window.TAP_MINI_NUMERIC_CATALOG_READY;
      const raw=Array.isArray(window.TAP_MINI_NUMERIC_CATALOG)?window.TAP_MINI_NUMERIC_CATALOG:[];
      const loaded=raw.filter(item=>item&&item.q&&Number.isFinite(Number(item.v)));
      if(loaded.length){cachedNumericBank=loaded;return cachedNumericBank;}
    }catch(_){ }
    cachedNumericBank=FALLBACK_NUMERIC.slice();
    return cachedNumericBank;
  }

  async function closestWins(){
    const ps=players();
    if(!ps.length) return;
    shell('Closest Wins','Loading question...',`<div class="mg-card"><div class="mg-big">Preparing the challenge...</div></div>`);
    const bank=await readyCatalog();
    const q=bank[Math.floor(Math.random()*bank.length)];
    const guesses=[];
    let turn=0;

    function lockedMarkup(){
      if(!guesses.length)return '';
      return `<div class="locked-list">${guesses.map(g=>`<div class="locked">✓ ${esc(g.player.avatar||'')} ${esc(g.player.name)} — guess locked</div>`).join('')}</div>`;
    }

    function showQuestion(){
      shell('Closest Wins','Everyone will enter a private guess. Closest answer wins +1 point.',`<div class="mg-card"><div class="mg-big">${esc(q.q)}</div></div><button type="button" class="primary" id="mgBeginGuesses">Enter guesses</button>`);
      overlay.querySelector('#mgBeginGuesses').onclick=showPlayerGuess;
    }

    function showPlayerGuess(){
      if(turn>=ps.length){reveal();return;}
      const p=ps[turn];
      shell('Closest Wins',`Question: ${q.q}`,`${lockedMarkup()}<div class="guess-popup"><div class="guess-player">${esc(p.avatar||'')} ${esc(p.name)}</div><div class="guess-note">Enter your guess, then press Lock in guess. The next player will get a fresh screen.</div><input id="mgGuessInput" type="number" inputmode="decimal" autocomplete="off" placeholder="Enter guess"><button type="button" class="primary" id="mgLockGuess">Lock in guess</button></div>`);
      const input=overlay.querySelector('#mgGuessInput');
      setTimeout(()=>input?.focus(),50);
      const submit=()=>{
        const value=Number(input.value);
        if(!Number.isFinite(value)){
          input.focus();
          return;
        }
        guesses.push({player:p,value});
        turn+=1;
        if(turn<ps.length){
          const next=ps[turn];
          shell('Guess locked',`${p.name}'s guess is saved.`,`<div class="mg-card"><div class="mg-big">Pass the screen to ${esc(next.name)}.</div></div><button type="button" class="primary" id="mgNextGuess">${esc(next.name)}'s turn</button>`);
          overlay.querySelector('#mgNextGuess').onclick=showPlayerGuess;
        }else{
          shell('All guesses locked','Ready to reveal the answer.',`<div class="mg-card"><div class="mg-big">${esc(q.q)}</div></div><button type="button" class="primary" id="mgReveal">Reveal answer</button>`);
          overlay.querySelector('#mgReveal').onclick=reveal;
        }
      };
      overlay.querySelector('#mgLockGuess').onclick=submit;
      input.addEventListener('keydown',e=>{if(e.key==='Enter')submit();});
    }

    function reveal(){
      const answer=Number(q.v);
      const best=Math.min(...guesses.map(g=>Math.abs(g.value-answer)));
      const winners=guesses.filter(g=>Math.abs(g.value-answer)===best);
      winners.forEach(g=>api()?.addPoints?.(g.player.index,1));
      const winnerText=winners.length===1?`${winners[0].player.name} wins!`:`Tie: ${winners.map(g=>g.player.name).join(' & ')} win!`;
      shell('Answer: '+answer.toLocaleString(),winnerText,`<div class="winner">${esc(winnerText)}</div><div class="guess-results">${guesses.map(g=>`<div class="guess-result${winners.includes(g)?' win':''}"><span>${esc(g.player.avatar||'')} ${esc(g.player.name)}</span><span>${Number(g.value).toLocaleString()}</span></div>`).join('')}</div><button type="button" class="primary" id="mgDone">Back to trivia</button>`);
      overlay.querySelector('#mgDone').onclick=close;
    }

    showQuestion();
  }

  function rapidFire(){
    const a=api(), last=a?.getLastPlaceIndexes?.()||[];
    if(!last.length)return;
    const pickPlayer=cb=>{
      if(last.length===1)return cb(last[0]);
      shell('Rock Paper Scissors','Last place is tied. Play RPS, then tap the winner.',`<div class="mg-grid">${last.map(i=>`<button type="button" class="primary" data-rps="${i}">${esc(players()[i]?.name||'Player')}</button>`).join('')}</div>`);
      overlay.querySelectorAll('[data-rps]').forEach(b=>b.onclick=()=>cb(Number(b.dataset.rps)));
    };
    pickPlayer(i=>{
      const cats=Object.keys(RAPID).sort(()=>Math.random()-.5).slice(0,3);
      shell('Rapid Fire',`${players()[i]?.name} is in last place. Choose a category.`,`<div class="mg-grid">${cats.map(c=>`<button type="button" class="primary" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>`);
      overlay.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>runRapid(i,b.dataset.cat));
    });
  }

  function runRapid(i,cat){
    const qs=RAPID[cat].slice().sort(()=>Math.random()-.5);let n=0,correct=0,seconds=60,timer;
    const finish=()=>{clearInterval(timer);const p=players()[i];let label='No score change';if(correct>=11){const newScore=Math.max(p.score+4,(api()?.getLeaderScore?.()||0)-1);api()?.setScore?.(i,newScore);label=`Score moves to ${newScore}`;}else if(correct>=8){api()?.addPoints?.(i,2);label='+2 points';}else if(correct>=4){api()?.addPoints?.(i,1);label='+1 point';}shell('Rapid Fire complete',`${correct} correct.`,`<div class="mg-result">${esc(label)}</div><button type="button" class="primary" id="mgDone">Back to trivia</button>`);overlay.querySelector('#mgDone').onclick=close;};
    const draw=()=>{const q=qs[n%qs.length];shell('Rapid Fire',`${players()[i]?.name} · ${cat} · ${seconds}s · ${correct} correct`,`<div class="mg-card"><div class="mg-big">${esc(q[0])}</div><div class="mg-sub" style="margin-top:16px">Answer: ${esc(q[1])}</div></div><div class="mg-grid"><button type="button" class="good" id="mgCorrect">Correct</button><button type="button" class="bad" id="mgPass">Pass</button><button type="button" class="primary" id="mgFinish">Finish</button></div>`);overlay.querySelector('#mgCorrect').onclick=()=>{correct++;n++;draw()};overlay.querySelector('#mgPass').onclick=()=>{n++;draw()};overlay.querySelector('#mgFinish').onclick=finish;};
    timer=setInterval(()=>{seconds--;if(seconds<=0)finish();else draw();},1000);draw();
  }

  window.addEventListener('DOMContentLoaded',ensure);
  const rootWait=setInterval(()=>{
    const root=document.getElementById('slap15');
    if(!root)return;
    root.__launchMiniGame=()=>{[closestWins,rapidFire][miniIndex++%2]()};
    clearInterval(rootWait);
  },100);
})();