  root.__miniQuestionsCompleted = 0;
  const miniAdvanceQuestion = advanceQuestion;
  advanceQuestion = function () {
    miniAdvanceQuestion();
    root.__miniQuestionsCompleted += 1;
    if (root.__miniQuestionsCompleted % 3 === 0 && !state.winner) {
      setTimeout(() => {
        if (typeof root.__launchMiniGame === "function") root.__launchMiniGame();
      }, 150);
    }
  };

  root.__miniGameAPI = {
    getPlayers: () => names.map((name, index) => ({
      index,
      name,
      avatar: avatars[index] || AVATARS[index % AVATARS.length],
      score: state.scores[index] || 0,
    })),
    addPoints: (index, points) => {
      if (index < 0 || index >= state.scores.length) return;
      snapshot();
      state.scores[index] = (state.scores[index] || 0) + points;
      if (state.scores[index] >= winTarget) {
        state.winner = { index };
        playWinSound();
        status.textContent = names[index] + " wins from the mini game!";
      }
      render();
    },
    setScore: (index, value) => {
      if (index < 0 || index >= state.scores.length) return;
      snapshot();
      state.scores[index] = value;
      if (state.scores[index] >= winTarget) {
        state.winner = { index };
        playWinSound();
        status.textContent = names[index] + " wins from the mini game!";
      }
      render();
    },
    getLeaderScore: () => state.scores.length ? Math.max(...state.scores) : 0,
    getLastPlaceIndexes: () => {
      if (!state.scores.length) return [];
      const low = Math.min(...state.scores);
      return state.scores
        .map((score, index) => score === low ? index : -1)
        .filter(index => index >= 0);
    },
  };

  const miniResetButton = root.querySelector("#reset");
  if (miniResetButton) {
    miniResetButton.addEventListener("click", () => {
      root.__miniQuestionsCompleted = 0;
    });
  }
