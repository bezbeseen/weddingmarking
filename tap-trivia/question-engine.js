(function(global){
  const CACHE_KEY='tapTriviaQuestionEngineV1';
  const CATEGORIES=[{id:9,name:'General Knowledge'},{id:10,name:'Entertainment: Books'},{id:11,name:'Entertainment: Film'},{id:12,name:'Entertainment: Music'},{id:13,name:'Entertainment: Musicals & Theatres'},{id:14,name:'Entertainment: Television'},{id:15,name:'Entertainment: Video Games'},{id:16,name:'Entertainment: Board Games'},{id:17,name:'Science & Nature'},{id:18,name:'Science: Computers'},{id:19,name:'Science: Mathematics'},{id:20,name:'Mythology'},{id:21,name:'Sports'},{id:22,name:'Geography'},{id:23,name:'History'},{id:24,name:'Politics'},{id:25,name:'Art'},{id:26,name:'Celebrities'},{id:27,name:'Animals'},{id:28,name:'Vehicles'},{id:29,name:'Entertainment: Comics'},{id:30,name:'Science: Gadgets'},{id:31,name:'Entertainment: Japanese Anime & Manga'},{id:32,name:'Entertainment: Cartoon & Animations'}];
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const decode=value=>{const t=document.createElement('textarea');t.innerHTML=value;return t.value};
  const shuffle=items=>{const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const fingerprint=q=>[(q.sourceQuestion||q.question||''),q.answer||'',q.category||'',q.difficulty||''].join('|').toLowerCase();
  function readCache(){try{return JSON.parse(localStorage.getItem(CACHE_KEY)||'[]')}catch(_){return[]}}
  function writeCache(items){try{const merged=new Map(readCache().map(q=>[fingerprint(q),q]));items.forEach(q=>merged.set(fingerprint(q),q));localStorage.setItem(CACHE_KEY,JSON.stringify([...merged.values()]));return merged.size}catch(_){return readCache().length}}
  function formatQuestion(raw,categoryId){
    const category=decode(raw.category),sourceQuestion=decode(raw.question),answer=decode(raw.correct_answer),incorrect=(raw.incorrect_answers||[]).map(decode);
    const type=raw.type;
    const options=type==='boolean'?['True','False']:shuffle([answer,...incorrect]);
    let question='['+category+'] ';
    if(type==='boolean') question+='True or False: '+sourceQuestion;
    else if(type==='multiple') question+=sourceQuestion+'\n'+options.map((opt,i)=>String.fromCharCode(65+i)+'. '+opt).join('\n');
    else question+=sourceQuestion;
    return {question,sourceQuestion,answer,category,categoryId:String(categoryId),difficulty:raw.difficulty,type,options,incorrectAnswers:incorrect,source:'OpenTDB'};
  }
  async function fetchJson(url,label,onStatus){
    for(let attempt=1;attempt<=5;attempt++){
      try{
        const r=await fetch(url,{method:'GET',mode:'cors',credentials:'omit',cache:'no-store'});
        if(r.status===429){if(attempt===5)throw new Error('OpenTDB is still rate limiting '+label+'.');onStatus&&onStatus('OpenTDB rate limit — waiting before retrying '+label+'...');await wait(6500);continue}
        if(!r.ok)throw new Error('OpenTDB request failed for '+label+' (HTTP '+r.status+').');
        const data=await r.json();
        if(data.response_code===5){if(attempt===5)throw new Error('OpenTDB rate limit persisted for '+label+'.');onStatus&&onStatus('OpenTDB asked us to wait before retrying '+label+'...');await wait(6500);continue}
        return data;
      }catch(err){
        if(attempt===5)throw err;
        onStatus&&onStatus('Network retry '+attempt+' for '+label+'...');
        await wait(6500);
      }
    }
  }
  async function requestCategory(cat,difficulty,position,total,onStatus){
    const amounts=[50,40,30,25,20,15,10,5,1];
    for(let i=0;i<amounts.length;i++){
      const amount=amounts[i];
      onStatus&&onStatus('Loading '+cat.name+' ('+position+' of '+total+') — asking for '+amount+'...');
      const url='https://opentdb.com/api.php?amount='+amount+'&category='+encodeURIComponent(cat.id)+'&difficulty='+encodeURIComponent(difficulty);
      const data=await fetchJson(url,cat.name,onStatus);
      if(data.response_code===1){if(i<amounts.length-1){onStatus&&onStatus(cat.name+' has fewer than '+amount+' '+difficulty+' questions. Trying a smaller batch...');await wait(5500);continue}return[]}
      if(data.response_code!==0)throw new Error('OpenTDB response code '+data.response_code+' for '+cat.name+'.');
      return (data.results||[]).map(q=>formatQuestion(q,cat.id));
    }
    return[];
  }
  async function load({categoryIds,difficulty,onStatus}){
    if(!difficulty)throw new Error('Choose a difficulty.');
    const selected=CATEGORIES.filter(c=>categoryIds.map(String).includes(String(c.id)));
    if(!selected.length)throw new Error('Select at least one category.');
    const cache=readCache(),all=[];
    for(let i=0;i<selected.length;i++){
      const cat=selected[i];
      const cached=cache.filter(q=>q.categoryId===String(cat.id)&&q.difficulty===difficulty);
      all.push(...cached);
      if(i>0){for(let s=6;s>0;s--){onStatus&&onStatus('Waiting '+s+'s before '+cat.name+'...');await wait(1000)}}
      try{
        const fresh=await requestCategory(cat,difficulty,i+1,selected.length,onStatus);
        if(fresh.length){writeCache(fresh);all.push(...fresh)}
      }catch(err){
        if(!cached.length)throw err;
        onStatus&&onStatus('Using cached '+cat.name+' questions because OpenTDB could not be reached.');
      }
    }
    const unique=[...new Map(all.map(q=>[fingerprint(q),q])).values()];
    if(!unique.length)throw new Error('No questions are available for those selections.');
    return shuffle(unique);
  }
  global.TapTriviaQuestionEngine={version:1,categories:CATEGORIES,load,readCache,cacheSize:()=>readCache().length};
})(window);
