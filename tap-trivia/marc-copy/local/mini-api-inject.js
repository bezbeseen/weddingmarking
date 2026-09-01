  root.__miniQuestionsCompleted = 0;
  root.__lastScorerIndex = null;
  root.__firstPlaceIncumbent = null;

  function updateFirstPlaceIncumbent() {
    if (!state.scores.length) { root.__firstPlaceIncumbent = null; return; }
    const high = Math.max(...state.scores);
    const leaders = state.scores.map((score,index)=>score===high?index:-1).filter(index=>index>=0);
    if (leaders.length === 1) { root.__firstPlaceIncumbent = leaders[0]; return; }
    if (Number.isInteger(root.__firstPlaceIncumbent) && leaders.includes(root.__firstPlaceIncumbent)) return;
    root.__firstPlaceIncumbent = leaders[0] ?? 0;
  }

  const miniOriginalCorrect = correct;
  correct = function (i) {
    const before = state.scores[i] || 0;
    miniOriginalCorrect(i);
    if ((state.scores[i] || 0) > before) { root.__lastScorerIndex = i; updateFirstPlaceIncumbent(); }
  };

  const miniAdvanceQuestion = advanceQuestion;
  advanceQuestion = function () {
    miniAdvanceQuestion();
    root.__miniQuestionsCompleted += 1;
    if (root.__miniQuestionsCompleted % 3 === 0 && !state.winner) {
      setTimeout(() => { if (typeof root.__launchMiniGame === "function") root.__launchMiniGame(); }, 150);
    }
  };

  buildChoices = function (question) {
    const clean = value => String(value == null ? "" : value).trim();
    const norm = value => clean(value).toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();
    const correct = clean(question.answer);
    const correctKey = norm(correct);
    const qText = clean(question.question);

    const unique = items => {
      const seen = new Set([correctKey]);
      const out = [];
      for (const item of items) {
        const text = clean(item), key = norm(text);
        if (!key || seen.has(key)) continue;
        seen.add(key); out.push(text);
      }
      return out;
    };

    // Use authored database choices first when they exist.
    let authored = [];
    if (Array.isArray(question.distractors)) authored.push(...question.distractors);
    if (Array.isArray(question.incorrect_answers)) authored.push(...question.incorrect_answers);
    if (Array.isArray(question.options)) authored.push(...question.options);
    authored.push(question.option_a, question.option_b, question.option_c, question.option_d);
    authored = unique(authored);
    if (authored.length >= 3) {
      return seededShuffle([{text:correct,correct:true}].concat(authored.slice(0,3).map(text=>({text,correct:false}))),hashSeed(qText+correct+"authored-mc"));
    }

    // Most-specific semantic families come first. These are intentionally narrow
    // so every distractor could reasonably answer the actual question.
    const FAMILIES = [
      {re:/\bhow long\b.*\b(swimming pool|pool|track|field|court|race|course)\b|\b(length of|long is)\b.*\b(pool|track|field|court)\b/i, values:['25 meters','50 meters','75 meters','100 meters']},
      {re:/\bhow (tall|high)\b|\bheight of\b/i, values:['10 meters','20 meters','30 meters','50 meters','100 meters']},
      {re:/\bhow wide\b|\bwidth of\b/i, values:['10 meters','20 meters','25 meters','50 meters','100 meters']},
      {re:/\bbrain\b.*\b(balance|coordination|motor control|movement)\b|\bpart of the brain\b/i, values:['Cerebellum','Cerebrum','Brainstem','Medulla oblongata','Thalamus','Hypothalamus']},
      {re:/\b(hardest|hardness)\b.*\b(natural|naturally occurring|mineral|substance|material)\b/i, values:['Diamond','Corundum','Topaz','Quartz','Silicon carbide','Graphite']},
      {re:/\b(chemical symbol|symbol for)\b/i, values:['H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca','Fe','Co','Ni','Cu','Zn','Ag','Sn','I','Au','Hg','Pb','U']},
      {re:/\b(element|elements|periodic table|abundant element)\b/i, values:['Hydrogen','Helium','Oxygen','Carbon','Nitrogen','Neon','Iron','Silicon','Magnesium','Sulfur','Calcium','Sodium','Potassium','Aluminum']},
      {re:/\b(golf|under par|over par|stroke under|stroke over)\b/i, values:['Birdie','Eagle','Albatross','Par','Bogey','Double bogey','Hole-in-one']},
      {re:/\b(english colony|colony in north america|colonial settlement|settlement in north america)\b/i, values:['Jamestown','Plymouth','Roanoke','Massachusetts Bay','Maryland Colony','Virginia Colony','Pennsylvania Colony']},
      {re:/\b(planet|solar system)\b/i, values:['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune']},
      {re:/\b(ocean|sea)\b/i, values:['Pacific Ocean','Atlantic Ocean','Indian Ocean','Arctic Ocean','Southern Ocean','Mediterranean Sea','Caribbean Sea']},
      {re:/\b(instrument|musical instrument)\b/i, values:['Piano','Violin','Guitar','Trumpet','Cello','Flute','Clarinet','Saxophone','Drums','Harp']},
      {re:/\b(state capital|capital of .* state|u s capital)\b/i, values:['Sacramento','Austin','Albany','Denver','Phoenix','Atlanta','Boston','Madison','Nashville','Olympia','Salem','Columbus']},
      {re:/\b(capital of|capital city)\b/i, values:['Paris','London','Rome','Berlin','Madrid','Lisbon','Athens','Vienna','Prague','Tokyo','Ottawa','Canberra','Cairo','Seoul']},
      {re:/\b(u s state|which state|what state|state is)\b/i, values:['California','Texas','Florida','New York','Arizona','Nevada','Ohio','Georgia','Virginia','Colorado','Oregon','Washington']},
      {re:/\b(country|nation|nationality)\b/i, values:['France','Germany','Italy','Spain','Canada','Brazil','Japan','India','Mexico','Australia','Egypt','Greece','Portugal','Argentina']},
      {re:/\b(city|cities)\b/i, values:['London','Paris','Berlin','Madrid','Rome','Barcelona','Chicago','Boston','Seattle','Miami','Toronto','Tokyo','Sydney','Dublin']},
      {re:/\b(author|wrote|written by|novelist|playwright)\b/i, values:['F. Scott Fitzgerald','Ernest Hemingway','John Steinbeck','Mark Twain','Jane Austen','Charles Dickens','George Orwell','Harper Lee','William Shakespeare','Toni Morrison']},
      {re:/\b(directed|director)\b/i, values:['Steven Spielberg','Martin Scorsese','Francis Ford Coppola','Christopher Nolan','Quentin Tarantino','Ridley Scott','James Cameron','Spike Lee','Greta Gerwig']},
      {re:/\b(actor|actress|played|portrayed|starred)\b/i, values:['Tom Hanks','Meryl Streep','Denzel Washington','Leonardo DiCaprio','Viola Davis','Robert De Niro','Sandra Bullock','Morgan Freeman','Jodie Foster']},
      {re:/\b(animal|mammal|bird|reptile|fish)\b/i, values:['Lion','Tiger','Elephant','Giraffe','Dolphin','Whale','Eagle','Falcon','Crocodile','Komodo dragon','Shark','Penguin']},
      {re:/\b(body organ|organ in the human body|human organ)\b/i, values:['Heart','Liver','Kidney','Lungs','Pancreas','Spleen','Brain','Stomach','Gallbladder']},
      {re:/\b(movie|film)\b/i, values:['The Godfather','Jaws','Rocky','Titanic','Casablanca','Goodfellas','Pulp Fiction','Jurassic Park','The Matrix','Gladiator']}
    ];

    const family = FAMILIES.find(f => f.re.test(qText));
    if (family) {
      const familyChoices = unique(family.values);
      if (familyChoices.length >= 3) {
        return seededShuffle([{text:correct,correct:true}].concat(seededShuffle(familyChoices,hashSeed(qText+"family")).slice(0,3).map(text=>({text,correct:false}))),hashSeed(qText+correct+"family-final"));
      }
    }

    const intent = text => {
      const t = norm(text);
      if (/\b(who wrote|which author|author of|written by|novelist|playwright)\b/.test(t)) return 'author';
      if (/\b(who directed|director of|directed by)\b/.test(t)) return 'director';
      if (/\b(who played|who portrayed|actor|actress|starred)\b/.test(t)) return 'actor';
      if (/\b(what year|which year|in what year|when did|when was|when were)\b/.test(t)) return 'year';
      if (/\b(capital of|capital city)\b/.test(t)) return 'capital';
      if (/\b(which|what|in what) (u s )?state\b|\bstate is\b/.test(t)) return 'state';
      if (/\b(which|what|in what) country\b|\bnationality\b/.test(t)) return 'country';
      if (/\b(which|what|in what) city\b|\bcity is\b/.test(t)) return 'city';
      if (/\bchemical symbol\b|\bsymbol for\b/.test(t)) return 'chemical-symbol';
      if (/\bhow many\b|\bhow much\b|\bnumber of\b/.test(t)) return 'number';
      if (/^who\b/.test(t)) return 'person';
      return 'general';
    };
    const shape = text => {
      const s=clean(text);
      if (/^-?\d{3,4}$/.test(s) && Number(s)>=1000 && Number(s)<=2100) return 'year';
      if (/^-?\d+(?:[.,]\d+)?(?:\s?(?:%|percent|degrees?|meters?|metres?|miles?|feet|ft|inches?|lbs?|pounds?|kg|kilograms?))?$/i.test(s)) return 'number';
      if (/^[A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+){1,5}$/.test(s)) return 'proper-name';
      if (/^[A-Z][a-zA-Z.'-]+$/.test(s)) return 'proper-word';
      return 'text';
    };
    const stop = new Set(['what','which','when','where','who','whose','this','that','from','with','into','over','under','called','name','first','most','does','did','was','were','are','the','and','for','one','how']);
    const keywords = text => new Set(norm(text).split(' ').filter(w=>w.length>=4&&!stop.has(w)));
    const wantedWords = keywords(qText);
    const wantedIntent = intent(qText);
    const wantedShape = shape(correct);
    const prefixCategory = ((qText.match(/^\s*\[([^\]]+)\]/)||[])[1]||'').toLowerCase();
    const scored=[];
    const pool=seededShuffle(questionPool,hashSeed(qText+(question.order||0)+'semantic-mc'));

    for(const item of pool){
      const text=clean(item.answer); if(!text||norm(text)===correctKey)continue;
      const otherQ=clean(item.question||'');
      const otherIntent=intent(otherQ), otherShape=shape(text);
      if(wantedIntent==='year'&&otherShape!=='year')continue;
      if(wantedIntent==='number'&&otherShape!=='number')continue;
      if(['author','director','actor','person'].includes(wantedIntent)&&!['proper-name','proper-word'].includes(otherShape))continue;
      if(['capital','state','country','city'].includes(wantedIntent)&&!['proper-name','proper-word'].includes(otherShape))continue;
      if(wantedIntent==='chemical-symbol'&&!/^[A-Z][a-z]?$/.test(text))continue;
      const otherWords=keywords(otherQ);
      const overlap=[...wantedWords].filter(w=>otherWords.has(w)).length;
      const otherPrefix=((otherQ.match(/^\s*\[([^\]]+)\]/)||[])[1]||'').toLowerCase();
      let score=overlap*7;
      if(wantedIntent!=='general'&&otherIntent===wantedIntent)score+=14;
      if(prefixCategory&&otherPrefix===prefixCategory)score+=8;
      if(otherShape===wantedShape)score+=3;
      scored.push({text,score});
    }
    scored.sort((a,b)=>b.score-a.score);
    let distractors=unique(authored.concat(scored.filter(x=>x.score>=12).map(x=>x.text))).slice(0,3);
    if(distractors.length<3)distractors=unique(distractors.concat(scored.filter(x=>x.score>=7).map(x=>x.text))).slice(0,3);
    if(distractors.length<3)distractors=unique(distractors.concat(scored.filter(x=>x.score>=3).map(x=>x.text))).slice(0,3);
    if(distractors.length<3)distractors=unique(distractors.concat(pool.map(x=>clean(x.answer)).filter(x=>x&&shape(x)===wantedShape))).slice(0,3);
    while(distractors.length<3)distractors.push('None of these');

    return seededShuffle([{text:correct,correct:true}].concat(distractors.map(text=>({text,correct:false}))),hashSeed(qText+correct+'semantic-final'));
  };

  root.__miniGameAPI = {
    getPlayers: () => names.map((name,index)=>({index,name,avatar:avatars[index]||AVATARS[index%AVATARS.length],score:state.scores[index]||0})),
    getLastScorerIndex: () => Number.isInteger(root.__lastScorerIndex) ? root.__lastScorerIndex : 0,
    getFirstPlaceStarterIndex: () => { updateFirstPlaceIncumbent(); return Number.isInteger(root.__firstPlaceIncumbent)?root.__firstPlaceIncumbent:0; },
    addPoints: (index,points) => {
      if(index<0||index>=state.scores.length)return;
      snapshot(); state.scores[index]=(state.scores[index]||0)+points;
      if(points>0)root.__lastScorerIndex=index; updateFirstPlaceIncumbent();
      if(state.scores[index]>=winTarget){state.winner={index};playWinSound();status.textContent=names[index]+' wins from the mini game!';}
      render();
    },
    setScore: (index,value) => {
      if(index<0||index>=state.scores.length)return;
      snapshot(); const old=state.scores[index]||0; state.scores[index]=value;
      if(value>old)root.__lastScorerIndex=index; updateFirstPlaceIncumbent();
      if(state.scores[index]>=winTarget){state.winner={index};playWinSound();status.textContent=names[index]+' wins from the mini game!';}
      render();
    },
    getLeaderScore: () => state.scores.length?Math.max(...state.scores):0,
    getLastPlaceIndexes: () => {
      if(!state.scores.length)return[]; const low=Math.min(...state.scores);
      return state.scores.map((score,index)=>score===low?index:-1).filter(index=>index>=0);
    }
  };

  const miniResetButton=root.querySelector('#reset');
  if(miniResetButton){miniResetButton.addEventListener('click',()=>{root.__miniQuestionsCompleted=0;root.__lastScorerIndex=null;root.__firstPlaceIncumbent=null;});}
