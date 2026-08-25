(() => {
  'use strict';

  class BinaryScoringStrategy {
    score({ isCorrect }) { return isCorrect ? 1 : 0; }
  }

  class ReferenceNumberGenerator {
    constructor({ minimumOffsetRatio = 0.08, maximumOffsetRatio = 0.20, random = Math.random } = {}) {
      this.minimumOffsetRatio = minimumOffsetRatio;
      this.maximumOffsetRatio = maximumOffsetRatio;
      this.random = random;
    }
    sample() {
      const value = this.random();
      if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Invalid random value.');
      return value;
    }
    generate(trueAnswer) {
      if (!Number.isFinite(trueAnswer) || trueAnswer < 50) throw new Error('Invalid numeric answer.');
      const direction = this.sample() < 0.5 ? -1 : 1;
      const ratio = this.minimumOffsetRatio + this.sample() * (this.maximumOffsetRatio - this.minimumOffsetRatio);
      const integer = Number.isInteger(trueAnswer);
      const rawOffset = trueAnswer * ratio;
      const offset = integer ? Math.max(1, Math.round(rawOffset)) : rawOffset;
      let reference = trueAnswer + direction * offset;
      if (!Number.isFinite(reference) || reference <= 0) reference = trueAnswer - offset;
      if (integer) reference = Math.round(reference);
      if (reference === trueAnswer) reference = trueAnswer - (integer ? 1 : trueAnswer * 0.01);
      if (!Number.isFinite(reference) || reference <= 0 || reference === trueAnswer) throw new Error('Could not create reference number.');
      return reference;
    }
  }

  class HigherLowerEngine {
    constructor({ players, questions, random = Math.random, referenceNumberGenerator, scoringStrategy = new BinaryScoringStrategy() }) {
      if (!Array.isArray(players) || players.length < 1 || players.length > 6) throw new Error('Higher / Lower requires 1-6 players.');
      if (!Array.isArray(questions) || questions.length < players.length) throw new Error('Not enough Higher / Lower questions.');
      this.players = players.map((p, i) => ({ ...p, roundIndex: i, roundScore: 0 }));
      this.questions = questions;
      this.random = random;
      this.referenceNumberGenerator = referenceNumberGenerator || new ReferenceNumberGenerator({ random });
      this.scoringStrategy = scoringStrategy;
      this.usedIds = new Set();
      this.currentPlayerIndex = null;
      this.currentTurn = null;
      this.phase = 'ready';
    }
    createTurn() {
      const available = this.questions.filter(q => !this.usedIds.has(q.id));
      if (!available.length) throw new Error('No unused Higher / Lower questions remain.');
      const q = available[Math.floor(this.random() * available.length)];
      const referenceNumber = this.referenceNumberGenerator.generate(q.numericAnswer);
      this.usedIds.add(q.id);
      this.currentTurn = { question: q, referenceNumber, choice: null, correctChoice: null, isCorrect: null, pointsAwarded: 0 };
      this.phase = 'awaiting_answer';
    }
    startRound() {
      if (this.phase !== 'ready') throw new Error('Round already started.');
      this.currentPlayerIndex = 0;
      this.createTurn();
      return this.getState();
    }
    submitAnswer(choice) {
      if (this.phase !== 'awaiting_answer' || !['higher','lower'].includes(choice)) throw new Error('Choose Higher or Lower.');
      const answer = this.currentTurn.question.numericAnswer;
      const correctChoice = answer > this.currentTurn.referenceNumber ? 'higher' : 'lower';
      const isCorrect = choice === correctChoice;
      const pointsAwarded = this.scoringStrategy.score({ isCorrect, choice, correctChoice, playerIndex: this.currentPlayerIndex });
      this.players[this.currentPlayerIndex].roundScore += pointsAwarded;
      Object.assign(this.currentTurn, { choice, correctChoice, isCorrect, pointsAwarded });
      this.phase = 'answer_revealed';
      return this.getState();
    }
    advanceToNextPlayer() {
      if (this.phase !== 'answer_revealed') throw new Error('Answer the current question first.');
      if (this.currentPlayerIndex >= this.players.length - 1) {
        this.currentPlayerIndex = null;
        this.currentTurn = null;
        this.phase = 'round_complete';
      } else {
        this.currentPlayerIndex += 1;
        this.createTurn();
      }
      return this.getState();
    }
    getState() {
      const player = this.currentPlayerIndex == null ? null : this.players[this.currentPlayerIndex];
      const state = { phase: this.phase, players: this.players.map(p => ({ ...p })), currentPlayerIndex: this.currentPlayerIndex, currentPlayer: player ? { ...player } : null, turn: null };
      if (this.currentTurn) {
        state.turn = {
          questionText: this.currentTurn.question.text,
          referenceNumber: this.currentTurn.referenceNumber,
          actualAnswer: this.phase === 'answer_revealed' ? this.currentTurn.question.numericAnswer : null,
          choice: this.currentTurn.choice,
          correctChoice: this.currentTurn.correctChoice,
          isCorrect: this.currentTurn.isCorrect,
          pointsAwarded: this.currentTurn.pointsAwarded,
        };
      }
      return state;
    }
  }

  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = value => Number(value).toLocaleString(undefined, { maximumFractionDigits: 6 });

  function ensureStyles() {
    if (document.getElementById('tapHigherLowerStyles')) return;
    const style = document.createElement('style');
    style.id = 'tapHigherLowerStyles';
    style.textContent = `
      #tapHigherLower{position:fixed;inset:0;z-index:240;background:#111214;color:#fff;overflow:auto;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
      #tapHigherLower *{box-sizing:border-box}
      #tapHigherLower .hl-wrap{max-width:980px;margin:0 auto;padding:28px 20px 48px}
      #tapHigherLower .hl-kicker{text-transform:uppercase;letter-spacing:.15em;font-weight:900;opacity:.65}
      #tapHigherLower h1{font-size:clamp(46px,8vw,78px);line-height:.95;margin:8px 0 12px}
      #tapHigherLower .hl-sub{font-size:21px;font-weight:750;opacity:.78;margin-bottom:20px}
      #tapHigherLower .hl-scoreboard{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px;margin:18px 0 24px}
      #tapHigherLower .hl-player{background:#202226;border-radius:16px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;font-weight:900}
      #tapHigherLower .hl-player.current{outline:3px solid #fff}
      #tapHigherLower .hl-name{display:flex;align-items:center;gap:8px;min-width:0}.hl-name span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      #tapHigherLower .hl-score{font-size:24px}
      #tapHigherLower .hl-card{background:#202226;border-radius:24px;padding:24px;margin:16px 0}
      #tapHigherLower .hl-label{text-transform:uppercase;letter-spacing:.1em;font-size:14px;font-weight:900;opacity:.62}
      #tapHigherLower .hl-question{font-size:clamp(28px,5vw,46px);font-weight:900;line-height:1.1;margin:10px 0 16px}
      #tapHigherLower .hl-reference{font-size:clamp(54px,10vw,90px);font-weight:950;margin:8px 0}
      #tapHigherLower .hl-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:18px}
      #tapHigherLower button{border:0;border-radius:18px;min-height:82px;padding:14px 18px;font-size:28px;font-weight:950;cursor:pointer}
      #tapHigherLower .hl-choice,#tapHigherLower .hl-primary{background:#fff;color:#111}
      #tapHigherLower .hl-primary{width:100%;margin-top:18px;font-size:22px;min-height:68px}
      #tapHigherLower .hl-result{font-size:clamp(36px,7vw,64px);font-weight:950;margin:8px 0}
      #tapHigherLower .hl-comparison{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;text-align:center;margin-top:18px}
      #tapHigherLower .hl-comparison strong{display:block;font-size:clamp(34px,6vw,58px)}
      #tapHigherLower .hl-note{font-size:18px;opacity:.78}
      @media(max-width:620px){#tapHigherLower .hl-grid{grid-template-columns:1fr}#tapHigherLower .hl-comparison{grid-template-columns:1fr}.hl-arrow{transform:rotate(90deg)}}`;
    document.head.appendChild(style);
  }

  function createOverlay() {
    ensureStyles();
    let overlay = document.getElementById('tapHigherLower');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'tapHigherLower';
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  async function loadQuestions() {
    if (window.TAP_MINI_NUMERIC_CATALOG_READY) await window.TAP_MINI_NUMERIC_CATALOG_READY;
    const raw = Array.isArray(window.TAP_MINI_NUMERIC_CATALOG) ? window.TAP_MINI_NUMERIC_CATALOG : [];
    return raw
      .map(item => ({ id: String(item.id || ''), text: String(item.q || ''), numericAnswer: Number(item.v) }))
      .filter(q => q.id && q.text && Number.isFinite(q.numericAnswer) && q.numericAnswer >= 50);
  }

  function rotateFromStarter(players, starterIndex) {
    const pos = players.findIndex(p => p.index === starterIndex);
    if (pos < 0) return players.slice();
    return players.slice(pos).concat(players.slice(0, pos));
  }

  async function launch({ hostApi, onClose } = {}) {
    if (!hostApi || typeof hostApi.getPlayers !== 'function' || typeof hostApi.addPoints !== 'function') throw new Error('Higher / Lower host API is unavailable.');
    const livePlayers = hostApi.getPlayers();
    if (!livePlayers.length) return;
    const starter = typeof hostApi.getFirstPlaceStarterIndex === 'function' ? hostApi.getFirstPlaceStarterIndex() : livePlayers[0].index;
    const orderedPlayers = rotateFromStarter(livePlayers, starter);
    const questions = await loadQuestions();
    const engine = new HigherLowerEngine({ players: orderedPlayers, questions });
    const overlay = createOverlay();
    let state = engine.startRound();

    const close = () => { overlay.remove(); if (typeof onClose === 'function') onClose(); };
    const currentLiveScores = () => new Map(hostApi.getPlayers().map(p => [p.index, p]));

    function scoreboardMarkup(currentHostIndex) {
      const live = currentLiveScores();
      return `<div class="hl-scoreboard">${orderedPlayers.map(p => {
        const now = live.get(p.index) || p;
        return `<div class="hl-player${p.index === currentHostIndex ? ' current' : ''}"><div class="hl-name"><span>${esc(now.avatar || '')}</span><span>${esc(now.name)}</span></div><strong class="hl-score">${Number(now.score || 0)}</strong></div>`;
      }).join('')}</div>`;
    }

    function render() {
      if (state.phase === 'awaiting_answer') {
        const p = state.currentPlayer;
        overlay.innerHTML = `<div class="hl-wrap"><div class="hl-kicker">Mini game break</div><h1>Higher / Lower</h1><div class="hl-sub">${esc(p.name)}, this is your question.</div>${scoreboardMarkup(p.index)}<div class="hl-card"><div class="hl-label">Question</div><div class="hl-question">${esc(state.turn.questionText)}</div><div class="hl-label">Reference number</div><div class="hl-reference">${fmt(state.turn.referenceNumber)}</div><div class="hl-note">Is the real answer higher or lower than this number?</div><div class="hl-grid"><button type="button" class="hl-choice" data-choice="higher">Higher</button><button type="button" class="hl-choice" data-choice="lower">Lower</button></div></div></div>`;
        overlay.querySelectorAll('[data-choice]').forEach(btn => btn.onclick = () => {
          state = engine.submitAnswer(btn.dataset.choice);
          if (state.turn.isCorrect) hostApi.addPoints(p.index, state.turn.pointsAwarded);
          render();
        });
        return;
      }

      if (state.phase === 'answer_revealed') {
        const p = state.currentPlayer;
        const finalPlayer = state.currentPlayerIndex === state.players.length - 1;
        overlay.innerHTML = `<div class="hl-wrap"><div class="hl-kicker">Answer revealed</div><h1>${state.turn.isCorrect ? 'Correct!' : 'Not quite'}</h1>${scoreboardMarkup(p.index)}<div class="hl-card"><div class="hl-question">${esc(state.turn.questionText)}</div><div class="hl-comparison"><div><span class="hl-label">Reference</span><strong>${fmt(state.turn.referenceNumber)}</strong></div><div class="hl-arrow">→</div><div><span class="hl-label">Actual answer</span><strong>${fmt(state.turn.actualAnswer)}</strong></div></div><div class="hl-result">${state.turn.isCorrect ? '+1 point' : '+0 points'}</div><div class="hl-note">${esc(p.name)} chose ${esc(state.turn.choice)}. The correct choice was ${esc(state.turn.correctChoice)}.</div><button type="button" class="hl-primary" id="hlNext">${finalPlayer ? 'Finish round' : 'Next player'}</button></div></div>`;
        overlay.querySelector('#hlNext').onclick = () => { state = engine.advanceToNextPlayer(); render(); };
        return;
      }

      overlay.innerHTML = `<div class="hl-wrap"><div class="hl-kicker">Round complete</div><h1>Higher / Lower complete</h1>${scoreboardMarkup(null)}<div class="hl-card"><div class="hl-result">Everyone had one question.</div><div class="hl-note">Points earned in this mini game have already been added to the current game.</div><button type="button" class="hl-primary" id="hlBack">Back to trivia</button></div></div>`;
      overlay.querySelector('#hlBack').onclick = close;
    }

    render();
  }

  window.TapHigherLowerPlugin = Object.freeze({ launch });
})();