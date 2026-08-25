  root.__miniQuestionsCompleted = 0;
  root.__lastScorerIndex = null;
  root.__firstPlaceIncumbent = null;

  function updateFirstPlaceIncumbent() {
    if (!state.scores.length) {
      root.__firstPlaceIncumbent = null;
      return;
    }
    const high = Math.max(...state.scores);
    const leaders = state.scores
      .map((score, index) => score === high ? index : -1)
      .filter(index => index >= 0);
    if (leaders.length === 1) {
      root.__firstPlaceIncumbent = leaders[0];
      return;
    }
    // If first place becomes tied, the player who already held first keeps
    // priority for the Higher / Lower starting position.
    if (Number.isInteger(root.__firstPlaceIncumbent) && leaders.includes(root.__firstPlaceIncumbent)) return;
    // At the beginning, before anyone has established a lead, use the first
    // player in the tied group as the deterministic fallback.
    root.__firstPlaceIncumbent = leaders[0] ?? 0;
  }

  const miniOriginalCorrect = correct;
  correct = function (i) {
    const before = state.scores[i] || 0;
    miniOriginalCorrect(i);
    if ((state.scores[i] || 0) > before) {
      root.__lastScorerIndex = i;
      updateFirstPlaceIncumbent();
    }
  };

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
    getLastScorerIndex: () => Number.isInteger(root.__lastScorerIndex) ? root.__lastScorerIndex : 0,
    getFirstPlaceStarterIndex: () => {
      updateFirstPlaceIncumbent();
      return Number.isInteger(root.__firstPlaceIncumbent) ? root.__firstPlaceIncumbent : 0;
    },
    addPoints: (index, points) => {
      if (index < 0 || index >= state.scores.length) return;
      snapshot();
      state.scores[index] = (state.scores[index] || 0) + points;
      if (points > 0) root.__lastScorerIndex = index;
      updateFirstPlaceIncumbent();
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
      const old = state.scores[index] || 0;
      state.scores[index] = value;
      if (value > old) root.__lastScorerIndex = index;
      updateFirstPlaceIncumbent();
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
      root.__lastScorerIndex = null;
      root.__firstPlaceIncumbent = null;
    });
  }
