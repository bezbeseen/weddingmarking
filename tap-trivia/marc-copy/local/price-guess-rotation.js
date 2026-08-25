(() => {
  'use strict';
  const PLUGIN_URL='https://raw.githubusercontent.com/bezbeseen/weddingmarking/73c562df5ff6927e0ecd2e4848ff4ecfa8068bf6/tap-trivia/marc-copy/local/price-guess-plugin.js';
  let pluginReady=null;
  function loadPlugin(){
    if(window.TapPriceGuessPlugin)return Promise.resolve(window.TapPriceGuessPlugin);
    if(pluginReady)return pluginReady;
    pluginReady=new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src=PLUGIN_URL;
      s.onload=()=>window.TapPriceGuessPlugin?resolve(window.TapPriceGuessPlugin):reject(new Error('Price Guess plugin did not initialize.'));
      s.onerror=()=>reject(new Error('Price Guess plugin failed to load.'));
      document.head.appendChild(s);
    });
    return pluginReady;
  }
  const wait=setInterval(()=>{
    const root=document.getElementById('slap15');
    if(!root||typeof root.__launchMiniGame!=='function')return;
    if(root.__priceGuessRotationInstalled){clearInterval(wait);return;}
    root.__priceGuessRotationInstalled=true;
    const original=root.__launchMiniGame;
    let rotationIndex=0;
    root.__launchMiniGame=()=>{
      const slot=rotationIndex++%3;
      if(slot===1){
        loadPlugin().then(plugin=>plugin.launch(root.__miniGameAPI)).catch(err=>{
          console.error(err);
          original();
        });
        return;
      }
      original();
    };
    clearInterval(wait);
  },50);
})();