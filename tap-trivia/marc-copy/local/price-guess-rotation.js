(() => {
  'use strict';

  const wait=setInterval(()=>{
    const root=document.getElementById('slap15');
    if(!root||typeof root.__launchMiniGame!=='function')return;
    if(root.__fullMiniRotationInstalled){clearInterval(wait);return;}

    root.__fullMiniRotationInstalled=true;
    const original=root.__launchMiniGame;
    let rotationIndex=0;

    function launchWhatCameFirstTwoRounds(){
      const plugin=window.TapWhatCameFirstPlugin;
      if(!plugin?.launch){
        console.error('What Came First plugin is not loaded.');
        original();
        return;
      }

      let round=1;
      const startRound=()=>{
        plugin.launch(root.__miniGameAPI);
        const wire=setInterval(()=>{
          const overlay=document.getElementById('tapWhatCameFirst');
          if(!overlay)return;
          const kicker=overlay.querySelector('.wcf-kicker');
          if(kicker && !kicker.dataset.twoRoundLabel){
            kicker.dataset.twoRoundLabel='1';
            kicker.textContent='Round '+round+' of 2 · '+kicker.textContent;
          }
          const back=overlay.querySelector('#wcfBack');
          if(back && !back.dataset.twoRoundWired){
            back.dataset.twoRoundWired='1';
            if(round===1){
              back.textContent='Start Round 2';
              back.addEventListener('click',()=>{
                round=2;
                setTimeout(startRound,60);
              });
            }else{
              back.textContent='Back to trivia';
            }
            clearInterval(wire);
          }
        },40);
      };
      startRound();
    }

    root.__launchMiniGame=()=>{
      const slot=rotationIndex++%4;

      if(slot===0){
        original();
        return;
      }

      if(slot===1){
        if(window.TapPriceGuessPlugin?.launch){
          window.TapPriceGuessPlugin.launch(root.__miniGameAPI);
        }else{
          console.error('Price Guess plugin is not loaded.');
          original();
        }
        return;
      }

      if(slot===2){
        launchWhatCameFirstTwoRounds();
        return;
      }

      if(window.TapRapidFirePlugin?.launch){
        window.TapRapidFirePlugin.launch(root.__miniGameAPI);
      }else{
        console.error('Rapid Fire plugin is not loaded.');
        original();
      }
    };

    clearInterval(wait);
  },50);
})();