(() => {
  'use strict';

  const wait=setInterval(()=>{
    const root=document.getElementById('slap15');
    if(!root||typeof root.__launchMiniGame!=='function')return;
    if(root.__fullMiniRotationInstalled){clearInterval(wait);return;}

    root.__fullMiniRotationInstalled=true;
    const original=root.__launchMiniGame;
    let rotationIndex=0;

    root.__launchMiniGame=()=>{
      const slot=rotationIndex++%4;

      // The existing mini-games.js alternates its own two games.
      // Calling it in slots 0 and 2 preserves Closest Wins then Rapid Fire.
      if(slot===0 || slot===2){
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

      if(window.TapWhatCameFirstPlugin?.launch){
        window.TapWhatCameFirstPlugin.launch(root.__miniGameAPI);
      }else{
        console.error('What Came First plugin is not loaded.');
        original();
      }
    };

    clearInterval(wait);
  },50);
})();