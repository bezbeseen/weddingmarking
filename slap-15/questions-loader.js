(async()=>{
  const root=document.getElementById('slap15');
  const qtext=root.querySelector('#qtext'),showQuestion=root.querySelector('#showQuestion'),showAnswer=root.querySelector('#showAnswer');
  try{
    if(!('DecompressionStream' in window)) throw new Error('Question data cannot be opened in this browser.');
    const binary=atob(window.SLAP15_DATA||'');
    const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const pool=JSON.parse(await new Response(stream).text());
    if(root.__setQuestionPool) root.__setQuestionPool(pool);
  }catch(err){
    qtext.textContent=err.message; showQuestion.disabled=true; showAnswer.disabled=true;
  }
})();
