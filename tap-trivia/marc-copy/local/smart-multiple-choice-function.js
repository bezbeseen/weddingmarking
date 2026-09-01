  function buildChoices(question) {
    const clean = (value) => String(value == null ? "" : value).trim();
    const norm = (value) => clean(value).toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();
    const correct = clean(question.answer);
    const correctNorm = norm(correct);

    const unique = (items) => {
      const seen = new Set([correctNorm]);
      const out = [];
      for (const item of items) {
        const text = clean(item);
        const key = norm(text);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(text);
      }
      return out;
    };

    // If the source question already has authored multiple-choice answers, use them first.
    let authored = [];
    if (Array.isArray(question.distractors)) authored.push(...question.distractors);
    if (Array.isArray(question.incorrect_answers)) authored.push(...question.incorrect_answers);
    if (Array.isArray(question.options)) authored.push(...question.options);
    authored.push(question.option_a, question.option_b, question.option_c, question.option_d);
    authored = unique(authored);
    if (authored.length >= 3) {
      return seededShuffle(
        [{ text: correct, correct: true }].concat(authored.slice(0, 3).map((text) => ({ text, correct: false }))),
        hashSeed(question.question + correct + "authored-mc")
      );
    }

    const intent = (text) => {
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

    const shape = (answerText) => {
      const s = clean(answerText);
      if (/^-?\d{3,4}$/.test(s) && Number(s) >= 1000 && Number(s) <= 2100) return "year";
      if (/^-?\d+(?:[.,]\d+)?(?:\s?(?:%|percent|degrees?|miles?|feet|ft|inches?|lbs?|pounds?|kg|kilograms?))?$/i.test(s)) return "number";
      if (/^[A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+){1,5}$/.test(s)) return "proper-name";
      if (/^[A-Z][a-zA-Z.'-]+$/.test(s)) return "proper-word";
      return "text";
    };

    const wantedIntent = intent(question.question);
    const wantedShape = shape(correct);
    const wantedCategory = norm(question.category || question.assigned_category || "");
    const candidates = [];

    for (const item of seededShuffle(questionPool, hashSeed(question.question + (question.order || 0) + "relevant-mc"))) {
      const text = clean(item.answer);
      if (!text || norm(text) === correctNorm) continue;

      const itemIntent = intent(item.question || "");
      const itemShape = shape(text);
      const itemCategory = norm(item.category || item.assigned_category || "");

      // Hard type guards: these prevent absurd choices such as a state or number for an author question.
      if (wantedIntent === "year" && itemShape !== "year") continue;
      if (wantedIntent === "number" && itemShape !== "number") continue;
      if (["author", "director", "actor", "person"].includes(wantedIntent) && !["proper-name", "proper-word"].includes(itemShape)) continue;
      if (["capital", "state", "country", "city"].includes(wantedIntent) && !["proper-name", "proper-word"].includes(itemShape)) continue;
      if (wantedIntent === "chemical-symbol" && !/^[A-Z][a-z]?$/.test(text)) continue;

      let score = 0;
      if (wantedIntent !== "general" && itemIntent === wantedIntent) score += 12;
      if (wantedCategory && itemCategory === wantedCategory) score += 5;
      if (itemShape === wantedShape) score += 4;
      if (wantedIntent === "general" && itemIntent === "general") score += 2;
      candidates.push({ text, score });
    }

    candidates.sort((a, b) => b.score - a.score);
    let distractors = unique(authored.concat(candidates.filter((x) => x.score >= 8).map((x) => x.text))).slice(0, 3);
    if (distractors.length < 3) {
      distractors = unique(distractors.concat(candidates.filter((x) => x.score >= 4).map((x) => x.text))).slice(0, 3);
    }
    if (distractors.length < 3) {
      distractors = unique(distractors.concat(candidates.map((x) => x.text))).slice(0, 3);
    }

    // Last fallback stays within the same answer shape instead of inventing unrelated answers.
    if (distractors.length < 3) {
      const sameShape = questionPool
        .map((item) => clean(item.answer))
        .filter((text) => text && shape(text) === wantedShape);
      distractors = unique(distractors.concat(sameShape)).slice(0, 3);
    }

    while (distractors.length < 3) distractors.push("None of these");
    return seededShuffle(
      [{ text: correct, correct: true }].concat(distractors.map((text) => ({ text, correct: false }))),
      hashSeed(question.question + correct + "smart-mc")
    );
  }