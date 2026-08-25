(() => {
  'use strict';

  const wait = setInterval(() => {
    const root = document.getElementById('slap15');
    if (!root || typeof root.__launchMiniGame !== 'function' || !root.__miniGameAPI || !window.TapHigherLowerPlugin) return;

    clearInterval(wait);
    const originalLauncher = root.__launchMiniGame;
    const hostApi = root.__miniGameAPI;
    let rotationIndex = 0;

    function silentlyAdvanceOriginalHigherLower() {
      const originalGetPlayers = hostApi.getPlayers;
      try {
        // The legacy launcher owns the mini-game rotation counter. Let its
        // Higher/Lower slot advance without rendering the old implementation.
        hostApi.getPlayers = () => [];
        originalLauncher();
      } finally {
        hostApi.getPlayers = originalGetPlayers;
      }
    }

    root.__launchMiniGame = () => {
      const slot = rotationIndex++ % 3;

      if (slot === 0) {
        silentlyAdvanceOriginalHigherLower();
        Promise.resolve(window.TapHigherLowerPlugin.launch({ hostApi }))
          .catch(error => {
            console.error('Higher / Lower mini game failed to launch.', error);
            alert('Higher / Lower could not start. Returning to trivia.');
          });
        return;
      }

      // Slot 1 remains Closest Wins and slot 2 remains Rapid Fire from the
      // existing mini-game module.
      originalLauncher();
    };
  }, 50);
})();