(() => {
  'use strict';
  const PRICE_PLUGIN_URL='https://raw.githubusercontent.com/bezbeseen/weddingmarking/73c562df5ff6927e0ecd2e4848ff4ecfa8068bf6/tap-trivia/marc-copy/local/price-guess-plugin.js';
  const WHAT_CAME_FIRST_URL='https://raw.githubusercontent.com/bezbeseen/weddingmarking/03a5bb8afe4232b9144b9c7ac24743df496586be/tap-trivia/marc-copy/local/what-came-first-plugin.js';
  const loads={};

  function loadScript(key,url,globalName){
    if(window[globalName])return Promise.resolve(window[globalName]);
    if(loads[key])return loads[key];
    loads[key]=new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src=url;
      s.onload=()=>window[globalName]?resolve(window[globalName]):reject(new Error(key+' plugin did not initialize.'));
      s.onerror=()=>reject(new Error(key+' plugin failed to load.'));
      document.head.appendChild(s);
    });
    return loads[key];
  }

  const wait=setInterval(()=>{
    const root=document.getElementById('slap15');
    if(!root||typeof root.__launchMiniGame!=='function')return;
    if(root.__priceGuessRotationInstalled){clearInterval(wait);return;}
    root.__priceGuessRotationInstalled=true;
    const original=root.__launchMiniGame;
    let rotationIndex=0;

    root.__launchMiniGame=()=>{
      const slot=rotationIndex++%4;
      if(slot===1){
        loadScript('Price Guess',PRICE_PLUGIN_URL,'TapPriceGuessPlugin')
          .then(plugin=>plugin.launch(root.__miniGameAPI))
          .catch(err=>{console.error(err);original();});
        return;
      }
      if(slot===3){
        loadScript('What Came First',WHAT_CAME_FIRST_URL,'TapWhatCameFirstPlugin')
          .then(plugin=>plugin.launch(root.__miniGameAPI))
          .catch(err=>{console.error(err);original();});
        return;
      }
      original();
    };
    clearInterval(wait);
  },50);
})();