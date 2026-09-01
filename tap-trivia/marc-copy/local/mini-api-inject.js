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
    if (Number.isInteger(root.__firstPlaceIncumbent) && leaders.includes(root.__firstPlaceIncumbent)) return;
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

  // Smarter "No One Knows" multiple-choice fallback. This runs in the same
  // scope as game.js, so it can safely replace the original buildChoices().
  buildChoices = function (question) {
    const clean = value => String(value == null ? "" : value).trim();
    const norm = value => clean(value).toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();
    const correct = clean(question.answer);
    const correctKey = norm(correct);
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

    let authored = [];
    if (Array.isArray(question.distractors)) authored.push(...question.distractors);
    if (Array.isArray(question.incorrect_answers)) authored.push(...question.incorrect_answers);
    if (Array.isArray(question.options)) authored.push(...question.options);
    authored.push(question.option_a, question.option_b, question.option_c, question.option_d);
    authored = unique(authored);
    if (authored.length >= 3) {
      return seededShuffle(
        [{ text: correct, correct: true }].concat(authored.slice(0, 3).map(text => ({ text, correct: false }))),
        hashSeed(question.question + correct + "authored-mc")
      );
    }

    const intent = text => {
      const t = norm(text);
      if (/\b(who wrote|which author|author of|written by|novelist|playwright)\b/.test(t)) return "author";
      if (/\b(who directed|director of|directed by)\b/.test(t)) return "director";
      if (/\b(who played|who portrayed|actor|actress|starred)\b/.test(t)) return "actor";
      if (/\b(what year|which year|in what year|when did|when was|when were)\b/.test(t)) return "year";
      if (/\b(capital of|capital city)\b/.test(t)) return "capital";
      if (/\b(which|what|in what) (u s )?state\b|\bstate is\b/.test(t)) return "state";
      if (/\b(which|what|in what) country\b|\bnationality\b/.test(t)) return "country";
      if (/\b(which|what|in what) city\b|\bcity is\b/.test(t)) return "city";
      if (/\bchemical symbol\b/.test(t)) return "chemical-symbol";
      if (/\bhow many\b|\bhow much\b|\bnumber of\b/.test(t)) return "number";
      if (/^who\b/.test(t)) return "person";
      return "general";
    };
    const shape = text => {
      const s = clean(text);
      if (/^-?\d{3,4}$/.test(s) && Number(s) >= 1000 && Number(s) <= 2100) return "year";
      if (/^-?\d+(?:[.,]\d+)?(?:\s?(?:%|percent|degrees?|miles?|feet|ft|inches?|lbs?|pounds?|kg|kilograms?))?$/i.test(s)) return "number";
      if (/^[A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+){1,5}$/.test(s)) return "proper-name";
      if (/^[A-Z][a-zA-Z.'-]+$/.test(s)) return "proper-word";
      return "text";
    };

    const wantedIntent = intent(question.question);
    const wantedShape = shape(correct);
    const wantedCategory = norm(question.category || question.assigned_category || "");
    const scored = [];
    const pool = seededShuffle(questionPool, hashSeed(question.question + (question.order || 0) + "smart-mc"));

    for (const item of pool) {
      const text = clean(item.answer);
      if (!text || norm(text) === correctKey) continue;
      const otherIntent = intent(item.question || "");
      const otherShape = shape(text);
      const otherCategory = norm(item.category || item.assigned_category || "");

      if (wantedIntent === "year" && otherShape !== "year") continue;
      if (wantedIntent === "number" && otherShape !== "number") continue;
      if (["author","director","actor","person"].includes(wantedIntent) && !["proper-name","proper-word"].includes(otherShape)) continue;
      if (["capital","state","country","city"].includes(wantedIntent) && !["proper-name","proper-word"].includes(otherShape)) continue;
      if (wantedIntent === "chemical-symbol" && !/^[A-Z][a-z]?$/.test(text)) continue;

      let score = 0;
      if (wantedIntent !== "general" && otherIntent === wantedIntent) score += 12;
      if (wantedCategory && otherCategory === wantedCategory) score += 5;
      if (otherShape === wantedShape) score += 4;
      scored.push({ text, score });
    }

    scored.sort((a,b) => b.score - a.score);
    let distractors = unique(authored.concat(scored.filter(x => x.score >= 8).map(x => x.text))).slice(0,3);
    if (distractors.length < 3) distractors = unique(distractors.concat(scored.filter(x => x.score >= 4).map(x => x.text))).slice(0,3);
    if (distractors.length < 3) distractors = unique(distractors.concat(scored.map(x => x.text))).slice(0,3);
    if (distractors.length < 3) {
      distractors = unique(distractors.concat(pool.map(x => clean(x.answer)).filter(x => x && shape(x) === wantedShape))).slice(0,3);
    }
    while (distractors.length < 3) distractors.push("None of these");

    return seededShuffle(
      [{ text: correct, correct: true }].concat(distractors.map(text => ({ text, correct: false }))),
      hashSeed(question.question + correct + "smart-mc-final")
    );
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
