/**
 * Super Math Kids - Addition Game
 * Interactive math learning game for kids to practice adding 2, 3, 4, and 5-digit numbers.
 */

(() => {
  'use strict';

  // --- Cookie Storage Helper (1 Year Expiration = 31,536,000 Seconds) ---
  class CookieStorage {
    static ONE_YEAR_SECONDS = 365 * 24 * 60 * 60; // 31,536,000 seconds (1 year)

    /**
     * Set a cookie with 1-year expiration (max-age & expires date), path=/, SameSite=Lax
     */
    static set(name, value, seconds = CookieStorage.ONE_YEAR_SECONDS) {
      try {
        const expires = new Date(Date.now() + seconds * 1000).toUTCString();
        const strVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
        const encoded = encodeURIComponent(strVal);
        document.cookie = `${name}=${encoded}; max-age=${seconds}; expires=${expires}; path=/; SameSite=Lax`;
      } catch (err) {
        console.warn('CookieStorage.set warning:', err);
      }
    }

    /**
     * Retrieve and parse a cookie by name
     */
    static get(name) {
      try {
        if (!document.cookie) return null;
        const prefix = `${name}=`;
        const cookies = document.cookie.split(';');
        for (let c of cookies) {
          c = c.trim();
          if (c.indexOf(prefix) === 0) {
            const rawVal = decodeURIComponent(c.substring(prefix.length));
            try {
              return JSON.parse(rawVal);
            } catch {
              return rawVal;
            }
          }
        }
      } catch (err) {
        console.warn('CookieStorage.get warning:', err);
      }
      return null;
    }

    /**
     * Remove cookie immediately
     */
    static remove(name) {
      try {
        document.cookie = `${name}=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
      } catch (err) {
        console.warn('CookieStorage.remove warning:', err);
      }
    }
  }

  // --- Audio Synthesizer (Zero External Dependencies) ---
  class SoundEffects {
    constructor() {
      this.ctx = null;
      const cookieMuted = CookieStorage.get('mathKids_muted');
      if (cookieMuted !== null) {
        this.muted = cookieMuted === 'true' || cookieMuted === true;
      } else {
        this.muted = localStorage.getItem('mathKids_muted') === 'true';
      }
    }

    initContext() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      CookieStorage.set('mathKids_muted', this.muted);
      try {
        localStorage.setItem('mathKids_muted', this.muted);
      } catch (e) {}
      return !this.muted;
    }

    isMuted() {
      return this.muted;
    }

    playNote(freq, type, duration, delay = 0, gainLevel = 0.12) {
      if (this.muted) return;
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startTime = this.ctx.currentTime + delay;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(gainLevel, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    }

    playClick() {
      this.playNote(600, 'sine', 0.08, 0, 0.05);
    }

    playSuccess() {
      // Cheerful rising chord (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        this.playNote(freq, 'triangle', 0.22, idx * 0.09, 0.15);
      });
    }

    playFanfare() {
      // Big celebratory fanfare
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        this.playNote(freq, 'sine', 0.35, idx * 0.08, 0.2);
      });
    }

    playWrong() {
      // Soft gentle descending boing
      this.playNote(320, 'sawtooth', 0.15, 0, 0.08);
      this.playNote(220, 'sawtooth', 0.25, 0.12, 0.08);
    }
  }

  // --- Confetti Particle System ---
  class ConfettiEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.animationId = null;
      this.colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];
      
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    burst(x = window.innerWidth / 2, y = window.innerHeight * 0.45, count = 75) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 4;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 5,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          size: Math.random() * 8 + 6,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 12,
          shape: Math.random() > 0.4 ? 'rect' : 'circle',
          alpha: 1,
          gravity: 0.38,
          drag: 0.96
        });
      }

      if (!this.animationId) {
        this.animate();
      }
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.alpha -= 0.012;

        if (p.alpha <= 0 || p.y > this.canvas.height + 20) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        } else {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        }

        this.ctx.restore();
      }

      if (this.particles.length > 0) {
        this.animationId = requestAnimationFrame(() => this.animate());
      } else {
        this.animationId = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  }

  // --- Encouraging Mascot Quotes ---
  const MASCOT_CHEERS = [
    "You're a Math Superstar! ⭐",
    "Brilliant addition wizard! 🚀",
    "Boom! That was lightning fast! ⚡",
    "Way to go! You nailed it! 🎉",
    "Look at that math power! 💪",
    "Math genius in the house! 🧠✨",
    "Awesome job! Keep the streak going! 🔥"
  ];

  const MASCOT_HINTS = [
    "Start adding the column on the far right first (the ones place)!",
    "If the sum in a column is 10 or more, don't forget to carry over the 1!",
    "Take your time, buddy. Double check the top carry boxes!",
    "Add one column at a time from right to left! You've got this!"
  ];

  const THEMES = [
    { name: 'theme-sunny', label: 'Sunny Theme ☀️' },
    { name: 'theme-candy', label: 'Candy Theme 🍬' },
    { name: 'theme-cosmic', label: 'Cosmic Theme 🚀' }
  ];

  // --- Game State Controller ---
  class MathKidsGame {
    constructor() {
      this.sound = new SoundEffects();
      this.confetti = new ConfettiEngine('confettiCanvas');

      // State variables
      this.currentDigitsMode = 2; // default: 2 digits
      this.num1 = 0;
      this.num2 = 0;
      this.correctAnswer = 0;
      this.viewMode = 'vertical'; // 'vertical' or 'horizontal'
      this.showCarryHelper = true;
      this.currentThemeIndex = 0;
      this.isRoundAnswered = false;

      // Operations: Loaded from 1-year cookie (default: 'add')
      const savedOp = CookieStorage.get('mathKids_op') || localStorage.getItem('mathKids_op');
      this.currentOperation = (savedOp && ['add', 'subtract', 'multiply', 'divide', 'mix'].includes(savedOp)) ? savedOp : 'add';
      this.activeRoundOp = 'add';
      this.opSymbol = '+';

      // Stats counters: Loaded from 1-year cookie (with localStorage fallback)
      const cookieData = CookieStorage.get('mathKids_results');
      let fallbackHistory = [];
      try {
        fallbackHistory = JSON.parse(localStorage.getItem('mathKids_history') || '[]');
      } catch (e) {
        fallbackHistory = [];
      }

      // Prefer localStorage history as it holds all detailed long-term day-by-day logs
      const rawHistory = (fallbackHistory && fallbackHistory.length > 0)
        ? fallbackHistory
        : (cookieData?.history || []);

      this.stats = {
        stars: cookieData?.stars ?? parseInt(CookieStorage.get('mathKids_stars') || localStorage.getItem('mathKids_stars') || '0', 10),
        streak: cookieData?.streak ?? parseInt(CookieStorage.get('mathKids_streak') || localStorage.getItem('mathKids_streak') || '0', 10),
        correct: cookieData?.correct ?? parseInt(CookieStorage.get('mathKids_correct') || localStorage.getItem('mathKids_correct') || '0', 10),
        total: cookieData?.total ?? parseInt(CookieStorage.get('mathKids_total') || localStorage.getItem('mathKids_total') || '0', 10),
        history: rawHistory
      };

      // Restore saved theme from cookie if present
      const savedTheme = CookieStorage.get('mathKids_theme') ?? localStorage.getItem('mathKids_theme');
      if (savedTheme !== null && !isNaN(savedTheme)) {
        this.currentThemeIndex = parseInt(savedTheme, 10) % THEMES.length;
      }

      this.cacheDom();
      this.bindEvents();
      this.applyInitialTheme();
      this.restoreOperationUI();
      this.updateSoundButtonUI();
      this.updateStatsUI();
      this.renderHistory();
      this.generateNewProblem();
    }

    cacheDom() {
      // Top controls
      this.soundToggleBtn = document.getElementById('soundToggleBtn');
      this.themeBtn = document.getElementById('themeBtn');
      this.resetScoreBtn = document.getElementById('resetScoreBtn');

      // Stats Counters
      this.starCounter = document.getElementById('starCounter');
      this.streakCounter = document.getElementById('streakCounter');
      this.correctCounter = document.getElementById('correctCounter');
      this.totalCounter = document.getElementById('totalCounter');
      this.accuracyCounter = document.getElementById('accuracyCounter');

      // Operations Selector
      this.opButtons = document.querySelectorAll('.op-btn');
      this.opDesc = document.getElementById('opDesc');

      // Digit Selector
      this.digitButtons = document.querySelectorAll('.digit-btn');
      this.levelDesc = document.getElementById('levelDesc');

      // Arena & Toggles
      this.viewToggleBtn = document.getElementById('viewToggleBtn');
      this.viewIcon = document.getElementById('viewIcon');
      this.viewText = document.getElementById('viewText');
      this.carryHelperBtn = document.getElementById('carryHelperBtn');
      this.carryHelperText = document.getElementById('carryHelperText');
      this.hintBtn = document.getElementById('hintBtn');

      // Mascot
      this.mascotAvatar = document.getElementById('mascotAvatar');
      this.speechBubble = document.getElementById('speechBubble');

      // Math Board & Views
      this.mathBoard = document.getElementById('mathBoard');
      this.verticalMathView = document.getElementById('verticalMathView');
      this.horizontalMathView = document.getElementById('horizontalMathView');
      this.carriesRow = document.getElementById('carriesRow');
      this.verticalOperator = document.getElementById('verticalOperator');
      this.digitsNum1 = document.getElementById('digitsNum1');
      this.digitsNum2 = document.getElementById('digitsNum2');
      this.verticalAnswerInput = document.getElementById('verticalAnswerInput');

      this.hNum1 = document.getElementById('hNum1');
      this.hOperator = document.getElementById('hOperator');
      this.hNum2 = document.getElementById('hNum2');
      this.horizontalAnswerInput = document.getElementById('horizontalAnswerInput');

      // Results banner
      this.resultBanner = document.getElementById('resultBanner');
      this.resultIcon = document.getElementById('resultIcon');
      this.resultTitle = document.getElementById('resultTitle');
      this.resultDetail = document.getElementById('resultDetail');
      this.nextQuestionBtn = document.getElementById('nextQuestionBtn');

      // Hints
      this.hintCard = document.getElementById('hintCard');
      this.hintContent = document.getElementById('hintContent');
      this.closeHintBtn = document.getElementById('closeHintBtn');

      // Main action buttons
      this.checkAnswerBtn = document.getElementById('checkAnswerBtn');
      this.skipQuestionBtn = document.getElementById('skipQuestionBtn');

      // Numpad
      this.numpadKeys = document.querySelectorAll('.numpad-key');

      // Steps Modal
      this.stepsDialogBackdrop = document.getElementById('stepsDialogBackdrop');
      this.stepsContent = document.getElementById('stepsContent');
      this.closeStepsBtn = document.getElementById('closeStepsBtn');
      this.gotItBtn = document.getElementById('gotItBtn');

      // History & Day-by-Day Results
      this.historyDaysContainer = document.getElementById('historyDaysContainer');
      this.historyDateFilter = document.getElementById('historyDateFilter');
      this.historyStatusFilter = document.getElementById('historyStatusFilter');
      this.historyOpFilter = document.getElementById('historyOpFilter');
      this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    }

    bindEvents() {
      // Sound toggle
      this.soundToggleBtn.addEventListener('click', () => {
        const isSoundOn = this.sound.toggleMute();
        this.updateSoundButtonUI();
        if (isSoundOn) this.sound.playClick();
      });

      // Theme toggle
      this.themeBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.cycleTheme();
      });

      // Reset scores
      this.resetScoreBtn.addEventListener('click', () => {
        if (confirm('Reset your score and star counters?')) {
          this.sound.playClick();
          this.stats.stars = 0;
          this.stats.streak = 0;
          this.stats.correct = 0;
          this.stats.total = 0;
          this.stats.history = [];

          // Clear cookies
          CookieStorage.remove('mathKids_results');
          CookieStorage.remove('mathKids_stars');
          CookieStorage.remove('mathKids_streak');
          CookieStorage.remove('mathKids_correct');
          CookieStorage.remove('mathKids_total');

          this.saveStats();
          this.updateStatsUI();
          this.renderHistory();
          this.setMascotMessage('🦊', "Scores reset! Let's start fresh and climb to the top!");
        }
      });

      // Operation selector buttons (Add, Subtract, Multiply, Divide, Mix)
      this.opButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          this.sound.playClick();
          this.opButtons.forEach((b) => {
            b.classList.remove('active');
            b.setAttribute('aria-checked', 'false');
          });
          const targetBtn = e.currentTarget;
          targetBtn.classList.add('active');
          targetBtn.setAttribute('aria-checked', 'true');

          this.currentOperation = targetBtn.getAttribute('data-op');
          CookieStorage.set('mathKids_op', this.currentOperation, CookieStorage.ONE_YEAR_SECONDS);
          try {
            localStorage.setItem('mathKids_op', this.currentOperation);
          } catch (err) {}

          this.updateOperationDescription();
          this.generateNewProblem();
        });
      });

      // Digits selector buttons (1, 2, 3, 4, 5 digits, or mix)
      this.digitButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          this.sound.playClick();
          this.digitButtons.forEach((b) => {
            b.classList.remove('active');
            b.setAttribute('aria-checked', 'false');
          });
          const targetBtn = e.currentTarget;
          targetBtn.classList.add('active');
          targetBtn.setAttribute('aria-checked', 'true');

          const digitsVal = targetBtn.getAttribute('data-digits');
          this.currentDigitsMode = digitsVal === 'mix' ? 'mix' : parseInt(digitsVal, 10);
          this.updateLevelDescription();
          this.generateNewProblem();
        });
      });

      // View format toggle (vertical / horizontal)
      this.viewToggleBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.toggleViewFormat();
      });

      // Carry helper toggle
      this.carryHelperBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.showCarryHelper = !this.showCarryHelper;
        this.carriesRow.style.visibility = this.showCarryHelper ? 'visible' : 'hidden';
        this.carryHelperText.textContent = `Carry Helper: ${this.showCarryHelper ? 'ON' : 'OFF'}`;
      });

      // Hint button
      this.hintBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.showHint();
      });
      this.closeHintBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.hintCard.classList.add('hidden');
      });

      // Check Answer button
      this.checkAnswerBtn.addEventListener('click', () => {
        this.checkCurrentAnswer();
      });

      // Skip / New Numbers button
      this.skipQuestionBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.generateNewProblem();
      });

      // Next Question button from banner
      this.nextQuestionBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.generateNewProblem();
      });

      // Onscreen Numpad clicks
      this.numpadKeys.forEach((keyBtn) => {
        keyBtn.addEventListener('click', (e) => {
          this.sound.playClick();
          const key = e.currentTarget.getAttribute('data-key');
          this.handleNumpadInput(key);
        });
      });

      // Physical Keyboard input listeners
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' && e.target !== this.getActiveInput()) {
          // Allow typing in carry helper inputs directly
          return;
        }

        if (e.key >= '0' && e.key <= '9') {
          e.preventDefault();
          this.sound.playClick();
          this.handleNumpadInput(e.key);
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          this.sound.playClick();
          this.handleNumpadInput('backspace');
        } else if (e.key === 'Escape') {
          this.handleNumpadInput('clear');
          this.hintCard.classList.add('hidden');
          this.stepsDialogBackdrop.classList.add('hidden');
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (this.isRoundAnswered) {
            this.generateNewProblem();
          } else {
            this.checkCurrentAnswer();
          }
        }
      });

      // Steps dialog events
      this.closeStepsBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.stepsDialogBackdrop.classList.add('hidden');
      });
      this.gotItBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.stepsDialogBackdrop.classList.add('hidden');
        this.generateNewProblem();
      });

      // History filter dropdown listeners
      if (this.historyDateFilter) {
        this.historyDateFilter.addEventListener('change', () => this.renderHistory());
      }
      if (this.historyStatusFilter) {
        this.historyStatusFilter.addEventListener('change', () => this.renderHistory());
      }
      if (this.historyOpFilter) {
        this.historyOpFilter.addEventListener('change', () => this.renderHistory());
      }

      // Clear history
      this.clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your daily practice history?')) {
          this.sound.playClick();
          this.stats.history = [];
          this.saveStats();
          this.renderHistory();
        }
      });
    }

    applyInitialTheme() {
      document.body.className = '';
      document.body.classList.add(THEMES[this.currentThemeIndex].name);
      if (this.themeBtn) {
        this.themeBtn.querySelector('.btn-text').textContent = THEMES[this.currentThemeIndex].label;
      }
    }

    restoreOperationUI() {
      if (this.opButtons) {
        this.opButtons.forEach((btn) => {
          const op = btn.getAttribute('data-op');
          const isActive = op === this.currentOperation;
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });
      }
      this.updateOperationDescription();
    }

    updateOperationDescription() {
      const descriptions = {
        add: 'Addition Mode (+): Practice adding two numbers',
        subtract: 'Subtraction Mode (−): Practice taking the smaller number away',
        multiply: 'Multiplication Mode (×): Practice times tables & multiplying numbers',
        divide: 'Division Mode (÷): Practice clean division with exact whole numbers',
        mix: 'Mixed Operations Mode (🎲): Surprise challenge with +, −, ×, or ÷!'
      };
      if (this.opDesc) {
        this.opDesc.textContent = descriptions[this.currentOperation] || descriptions.add;
      }
    }

    cycleTheme() {
      document.body.classList.remove(THEMES[this.currentThemeIndex].name);
      this.currentThemeIndex = (this.currentThemeIndex + 1) % THEMES.length;
      const nextTheme = THEMES[this.currentThemeIndex];
      document.body.classList.add(nextTheme.name);
      this.themeBtn.querySelector('.btn-text').textContent = nextTheme.label;
      CookieStorage.set('mathKids_theme', this.currentThemeIndex, CookieStorage.ONE_YEAR_SECONDS);
      try {
        localStorage.setItem('mathKids_theme', this.currentThemeIndex);
      } catch (e) {}
    }

    updateSoundButtonUI() {
      const isMuted = this.sound.isMuted();
      const icon = this.soundToggleBtn.querySelector('.btn-icon');
      const text = this.soundToggleBtn.querySelector('.btn-text');
      if (isMuted) {
        icon.textContent = '🔇';
        text.textContent = 'Muted';
      } else {
        icon.textContent = '🔊';
        text.textContent = 'Sound ON';
      }
    }

    updateLevelDescription() {
      if (this.currentDigitsMode === 'mix') {
        this.levelDesc.textContent = 'Practicing Mixed Digits (Surprise challenge!)';
      } else if (this.currentDigitsMode === 1) {
        this.levelDesc.textContent = 'Practicing 1-digit numbers (1 to 9)';
      } else {
        const minVal = Math.pow(10, this.currentDigitsMode - 1);
        const maxVal = Math.pow(10, this.currentDigitsMode) - 1;
        this.levelDesc.textContent = `Practicing ${this.currentDigitsMode}-digit numbers (${minVal.toLocaleString()} to ${maxVal.toLocaleString()})`;
      }
    }

    toggleViewFormat() {
      if (this.viewMode === 'vertical') {
        this.viewMode = 'horizontal';
        this.verticalMathView.classList.add('hidden');
        this.horizontalMathView.classList.remove('hidden');
        this.viewIcon.textContent = '📜';
        this.viewText.textContent = 'Horizontal View';
        this.carryHelperBtn.style.display = 'none';
        this.syncInputs(this.verticalAnswerInput.value);
        this.horizontalAnswerInput.focus();
      } else {
        this.viewMode = 'vertical';
        this.horizontalMathView.classList.add('hidden');
        this.verticalMathView.classList.remove('hidden');
        this.viewIcon.textContent = '📐';
        this.viewText.textContent = 'Vertical View';
        this.carryHelperBtn.style.display = 'inline-flex';
        this.syncInputs(this.horizontalAnswerInput.value);
        this.verticalAnswerInput.focus();
      }
    }

    getActiveInput() {
      return this.viewMode === 'vertical' ? this.verticalAnswerInput : this.horizontalAnswerInput;
    }

    syncInputs(val) {
      this.verticalAnswerInput.value = val;
      this.horizontalAnswerInput.value = val;
    }

    handleNumpadInput(key) {
      if (this.isRoundAnswered) return;

      const activeInput = this.getActiveInput();
      let currentVal = activeInput.value.replace(/[^0-9]/g, '');

      if (key >= '0' && key <= '9') {
        if (currentVal.length < 7) {
          currentVal += key;
        }
      } else if (key === 'backspace') {
        currentVal = currentVal.slice(0, -1);
      } else if (key === 'clear') {
        currentVal = '';
      }

      this.syncInputs(currentVal);
    }

    setMascotMessage(avatar, text) {
      this.mascotAvatar.textContent = avatar;
      this.speechBubble.textContent = text;
    }

    getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateNewProblem() {
      this.isRoundAnswered = false;

      // Reset result UI
      this.resultBanner.classList.add('hidden');
      this.resultBanner.classList.remove('error-banner');
      this.mathBoard.classList.remove('celebrate-glow', 'shake-error');
      this.verticalAnswerInput.classList.remove('correct', 'wrong');
      this.horizontalAnswerInput.classList.remove('correct', 'wrong');
      this.syncInputs('');
      this.hintCard.classList.add('hidden');

      // 1. Determine active operation for this round
      if (this.currentOperation === 'mix') {
        const ops = ['add', 'subtract', 'multiply', 'divide'];
        this.activeRoundOp = ops[Math.floor(Math.random() * ops.length)];
      } else {
        this.activeRoundOp = this.currentOperation;
      }

      // Map operation to symbol
      const opSymbols = {
        add: '+',
        subtract: '−',
        multiply: '×',
        divide: '÷'
      };
      this.opSymbol = opSymbols[this.activeRoundOp] || '+';

      // 2. Determine digit count for this round
      let digits = this.currentDigitsMode;
      if (digits === 'mix') {
        digits = this.getRandomInt(2, 5);
      }

      // 3. Generate numbers and calculate correct answer
      if (this.activeRoundOp === 'add') {
        const min = digits === 1 ? 1 : Math.pow(10, digits - 1);
        const max = Math.pow(10, digits) - 1;
        this.num1 = this.getRandomInt(min, max);
        this.num2 = this.getRandomInt(min, max);
        this.correctAnswer = this.num1 + this.num2;
      } else if (this.activeRoundOp === 'subtract') {
        const min = digits === 1 ? 1 : Math.pow(10, digits - 1);
        const max = Math.pow(10, digits) - 1;
        const a = this.getRandomInt(min, max);
        const b = this.getRandomInt(min, max);
        this.num1 = Math.max(a, b);
        this.num2 = Math.min(a, b);
        this.correctAnswer = this.num1 - this.num2;
      } else if (this.activeRoundOp === 'multiply') {
        if (digits === 1) {
          this.num1 = this.getRandomInt(1, 9);
          this.num2 = this.getRandomInt(1, 9);
        } else if (digits === 2) {
          this.num1 = this.getRandomInt(10, 99);
          this.num2 = Math.random() > 0.4 ? this.getRandomInt(2, 12) : this.getRandomInt(10, 25);
        } else if (digits === 3) {
          this.num1 = this.getRandomInt(100, 999);
          this.num2 = this.getRandomInt(2, 9);
        } else if (digits === 4) {
          this.num1 = this.getRandomInt(1000, 9999);
          this.num2 = this.getRandomInt(2, 9);
        } else {
          this.num1 = this.getRandomInt(10000, 99999);
          this.num2 = this.getRandomInt(2, 9);
        }
        this.correctAnswer = this.num1 * this.num2;
      } else if (this.activeRoundOp === 'divide') {
        // Clean whole number division: dividend ÷ divisor = quotient
        let quotient, divisor;
        if (digits === 1) {
          quotient = this.getRandomInt(1, 9);
          divisor = this.getRandomInt(2, 9);
        } else if (digits === 2) {
          quotient = this.getRandomInt(10, 99);
          divisor = this.getRandomInt(2, 9);
        } else if (digits === 3) {
          quotient = this.getRandomInt(100, 999);
          divisor = this.getRandomInt(2, 9);
        } else if (digits === 4) {
          quotient = this.getRandomInt(1000, 9999);
          divisor = this.getRandomInt(2, 9);
        } else {
          quotient = this.getRandomInt(10000, 99999);
          divisor = this.getRandomInt(2, 9);
        }
        this.num1 = quotient * divisor;
        this.num2 = divisor;
        this.correctAnswer = quotient;
      }

      this.renderEquation(digits);

      // Mascot cheerful greeting matching operation
      const greetings = {
        add: [
          "Let's add these numbers together! What do you get? 🤔",
          "Addition power! You've got this, math star! ⭐",
          "Add them up! Start with the ones on the right! 💡"
        ],
        subtract: [
          "Subtraction time! Take the bottom number away from the top! ➖",
          "Can you subtract these numbers? You're a math champion! 🏆",
          "Subtract carefully! Check if you need to borrow! ✏️"
        ],
        multiply: [
          "Multiplication adventure! Multiply them up! ✖️",
          "Times tables wizardry! What is the product? ⚡",
          "Multiply step by step! You can do it! 🚀"
        ],
        divide: [
          "Division challenge! How many times does it fit? ➗",
          "Clean division! Think: what times the divisor equals the top? 🧠",
          "Divide and conquer! You're super smart! 🌟"
        ]
      };
      const opGreetings = greetings[this.activeRoundOp] || greetings.add;
      this.setMascotMessage('🦊', opGreetings[Math.floor(Math.random() * opGreetings.length)]);

      // Focus active input
      const activeInput = this.getActiveInput();
      activeInput.focus();
    }

    renderEquation(digits) {
      // Update operator symbols in both views
      if (this.verticalOperator) this.verticalOperator.textContent = this.opSymbol;
      if (this.hOperator) this.hOperator.textContent = this.opSymbol;

      // Update carry/borrow helper label
      if (this.activeRoundOp === 'subtract') {
        this.carryHelperText.textContent = `Borrow Helper: ${this.showCarryHelper ? 'ON' : 'OFF'}`;
      } else if (this.activeRoundOp === 'divide') {
        this.carryHelperText.textContent = `Helper: ${this.showCarryHelper ? 'ON' : 'OFF'}`;
      } else {
        this.carryHelperText.textContent = `Carry Helper: ${this.showCarryHelper ? 'ON' : 'OFF'}`;
      }

      // Horizontal display
      this.hNum1.textContent = this.num1.toLocaleString();
      this.hNum2.textContent = this.num2.toLocaleString();

      // Vertical display
      const str1 = this.num1.toString();
      const str2 = this.num2.toString();
      const maxLen = Math.max(str1.length, str2.length);

      // Pad with leading spaces so columns line up
      const padded1 = str1.padStart(maxLen, ' ');
      const padded2 = str2.padStart(maxLen, ' ');

      // Build helper row boxes (carry/borrow boxes)
      this.carriesRow.innerHTML = '';
      const totalColumns = maxLen + 1;
      const columnLabels = ['100k', '10k', 'Th', 'H', 'T', 'O'];

      for (let i = 0; i < totalColumns; i++) {
        const carryWrapper = document.createElement('div');
        carryWrapper.className = 'carry-box-wrapper';

        const carryInput = document.createElement('input');
        carryInput.type = 'text';
        carryInput.maxLength = 1;
        carryInput.className = 'carry-input';
        carryInput.placeholder = ' ';
        carryInput.setAttribute('aria-label', `Helper box for column ${i + 1}`);

        carryInput.addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/[^0-9]/g, '');
          if (e.target.value) {
            this.sound.playClick();
          }
        });

        const label = document.createElement('span');
        label.className = 'carry-label';
        const labelIdx = columnLabels.length - 1 - (totalColumns - 1 - i);
        label.textContent = columnLabels[labelIdx] || '';

        carryWrapper.appendChild(carryInput);
        carryWrapper.appendChild(label);
        this.carriesRow.appendChild(carryWrapper);
      }

      // In addition, hide the rightmost carry box since ones column doesn't receive a carry
      const allCarryWrappers = this.carriesRow.querySelectorAll('.carry-box-wrapper');
      if (allCarryWrappers.length > 0 && this.activeRoundOp === 'add') {
        const lastBox = allCarryWrappers[allCarryWrappers.length - 1].querySelector('.carry-input');
        if (lastBox) {
          lastBox.style.visibility = 'hidden';
        }
      }

      // Build Number 1 Digits
      this.digitsNum1.innerHTML = '';
      for (const ch of padded1) {
        const cell = document.createElement('span');
        cell.className = 'digit-cell';
        cell.textContent = ch === ' ' ? '\u00A0' : ch;
        this.digitsNum1.appendChild(cell);
      }

      // Build Number 2 Digits
      this.digitsNum2.innerHTML = '';
      for (const ch of padded2) {
        const cell = document.createElement('span');
        cell.className = 'digit-cell';
        cell.textContent = ch === ' ' ? '\u00A0' : ch;
        this.digitsNum2.appendChild(cell);
      }
    }

    checkCurrentAnswer() {
      if (this.isRoundAnswered) return;

      const activeInput = this.getActiveInput();
      const rawVal = activeInput.value.trim().replace(/,/g, '');

      if (!rawVal) {
        this.setMascotMessage('🦁', 'Please type in your answer first! Tap numbers below! 👇');
        activeInput.focus();
        return;
      }

      const userAns = parseInt(rawVal, 10);
      const isCorrect = userAns === this.correctAnswer;

      this.stats.total += 1;

      if (isCorrect) {
        this.isRoundAnswered = true;
        this.stats.correct += 1;
        this.stats.streak += 1;

        // Earn stars based on difficulty & operation
        let bonus = 0;
        if (this.activeRoundOp === 'multiply' || this.activeRoundOp === 'divide') bonus = 1;
        const starsEarned = (this.currentDigitsMode === 'mix' 
          ? 3 
          : Math.max(1, Math.min(3, parseInt(this.currentDigitsMode, 10) - 1))) + bonus;
        this.stats.stars += starsEarned;

        // UI celebration
        this.mathBoard.classList.add('celebrate-glow');
        this.verticalAnswerInput.classList.add('correct');
        this.horizontalAnswerInput.classList.add('correct');

        this.resultBanner.classList.remove('hidden', 'error-banner');
        this.resultIcon.textContent = '🎉';
        this.resultTitle.textContent = `Terrific! You got it right! (+${starsEarned} ⭐)`;
        this.resultDetail.textContent = `${this.num1.toLocaleString()} ${this.opSymbol} ${this.num2.toLocaleString()} = ${this.correctAnswer.toLocaleString()}`;

        // Cheerful sound & Confetti
        if (this.stats.streak % 3 === 0 && this.stats.streak > 0) {
          this.sound.playFanfare();
          this.setMascotMessage('🦄', `SUPER STREAK! ${this.stats.streak} in a row! You're unstoppable! 🔥`);
        } else {
          this.sound.playSuccess();
          const cheer = MASCOT_CHEERS[Math.floor(Math.random() * MASCOT_CHEERS.length)];
          this.setMascotMessage('🦊', cheer);
        }

        this.confetti.burst();
        this.addHistoryItem(this.num1, this.num2, userAns, true);
      } else {
        // Wrong answer
        this.stats.streak = 0;
        this.sound.playWrong();
        this.mathBoard.classList.add('shake-error');
        setTimeout(() => this.mathBoard.classList.remove('shake-error'), 500);

        this.verticalAnswerInput.classList.add('wrong');
        this.horizontalAnswerInput.classList.add('wrong');

        this.resultBanner.classList.remove('hidden');
        this.resultBanner.classList.add('error-banner');
        this.resultIcon.textContent = '💡';
        this.resultTitle.textContent = `Almost! Keep going!`;
        this.resultDetail.innerHTML = `You answered <strong>${userAns}</strong>. <button id="viewSolutionBtn" class="mini-text-btn" style="color:#b91c1c; font-weight:700;">Click to see how to solve it!</button>`;

        const viewSolutionBtn = document.getElementById('viewSolutionBtn');
        if (viewSolutionBtn) {
          viewSolutionBtn.addEventListener('click', () => {
            this.showStepByStepSolution();
          });
        }

        this.setMascotMessage('🐼', "Good try! Look at each number carefully. You can do it!");
        this.addHistoryItem(this.num1, this.num2, userAns, false);
      }

      this.saveStats();
      this.updateStatsUI();
    }

    showHint() {
      let hintText = '';
      if (this.activeRoundOp === 'add') {
        const ones1 = this.num1 % 10;
        const ones2 = this.num2 % 10;
        const sumOnes = ones1 + ones2;
        hintText = `Look at the ones place (right side): ${ones1} + ${ones2} = ${sumOnes}. `;
        if (sumOnes >= 10) {
          hintText += `Since ${sumOnes} is 10 or greater, write ${sumOnes % 10} in the ones spot and carry 1 to the next column! ✏️`;
        } else {
          hintText += `Write ${sumOnes} right down in the ones column!`;
        }
      } else if (this.activeRoundOp === 'subtract') {
        const ones1 = this.num1 % 10;
        const ones2 = this.num2 % 10;
        if (ones1 >= ones2) {
          hintText = `Look at the ones place: ${ones1} − ${ones2} = ${ones1 - ones2}. Write down ${ones1 - ones2}!`;
        } else {
          hintText = `Look at the ones place: ${ones1} is smaller than ${ones2}. Borrow 1 from the tens place to make it ${ones1 + 10}. Then ${ones1 + 10} − ${ones2} = ${ones1 + 10 - ones2}! ✏️`;
        }
      } else if (this.activeRoundOp === 'multiply') {
        hintText = `Think of your times tables! ${this.num1} × ${this.num2}: Start by multiplying the ones digit (${this.num1 % 10} × ${this.num2})!`;
      } else if (this.activeRoundOp === 'divide') {
        hintText = `Division tip: Think backwards! What number times ${this.num2} equals ${this.num1}? (? × ${this.num2} = ${this.num1})`;
      }

      this.hintContent.textContent = hintText;
      this.hintCard.classList.remove('hidden');
      this.setMascotMessage('🦉', "Here's a handy tip for this problem!");
    }

    showStepByStepSolution() {
      this.sound.playClick();
      this.stepsContent.innerHTML = '';

      if (this.activeRoundOp === 'add') {
        // Step-by-step addition with carries
        const s1 = this.num1.toString();
        const s2 = this.num2.toString();
        const maxLen = Math.max(s1.length, s2.length);
        const rev1 = s1.split('').reverse();
        const rev2 = s2.split('').reverse();
        const colNames = ['Ones', 'Tens', 'Hundreds', 'Thousands', 'Ten Thousands', 'Hundred Thousands'];
        let carry = 0;

        for (let i = 0; i < maxLen || carry > 0; i++) {
          const d1 = parseInt(rev1[i] || '0', 10);
          const d2 = parseInt(rev2[i] || '0', 10);
          const colTotal = d1 + d2 + carry;
          const colDigit = colTotal % 10;
          const nextCarry = Math.floor(colTotal / 10);

          const card = document.createElement('div');
          card.className = 'step-card-item';

          const title = document.createElement('div');
          title.className = 'step-card-title';
          title.textContent = `Step ${i + 1}: ${colNames[i] || `Column ${i + 1}`} Column`;

          const desc = document.createElement('div');
          desc.className = 'step-card-desc';

          let explanation = `Add ${d1} + ${d2}`;
          if (carry > 0) explanation += ` + carry ${carry}`;
          explanation += ` = <strong>${colTotal}</strong>.`;

          if (nextCarry > 0) {
            explanation += ` Write <strong>${colDigit}</strong> below, and carry <strong>${nextCarry}</strong> over to the next column!`;
          } else {
            explanation += ` Write <strong>${colDigit}</strong> below!`;
          }

          desc.innerHTML = explanation;
          card.appendChild(title);
          card.appendChild(desc);
          this.stepsContent.appendChild(card);
          carry = nextCarry;
        }
      } else if (this.activeRoundOp === 'subtract') {
        // Step-by-step subtraction with borrowing
        const s1 = this.num1.toString();
        const s2 = this.num2.toString();
        const maxLen = Math.max(s1.length, s2.length);
        const digits1 = s1.split('').map(Number);
        const digits2 = s2.padStart(maxLen, '0').split('').map(Number);
        const colNames = ['Ones', 'Tens', 'Hundreds', 'Thousands', 'Ten Thousands', 'Hundred Thousands'];

        let borrowedDigits = [...digits1];
        let stepNum = 1;

        for (let i = maxLen - 1; i >= 0; i--) {
          const colFromRight = maxLen - 1 - i;
          let topD = borrowedDigits[i];
          const botD = digits2[i];

          const card = document.createElement('div');
          card.className = 'step-card-item';
          const title = document.createElement('div');
          title.className = 'step-card-title';
          title.textContent = `Step ${stepNum++}: ${colNames[colFromRight] || `Column ${colFromRight + 1}`} Column`;

          const desc = document.createElement('div');
          desc.className = 'step-card-desc';

          if (topD < botD) {
            borrowedDigits[i - 1] -= 1;
            topD += 10;
            const diff = topD - botD;
            desc.innerHTML = `Top digit is smaller than ${botD}. Borrow 1 from next column to make it <strong>${topD}</strong>. Then <strong>${topD} − ${botD} = ${diff}</strong>!`;
          } else {
            const diff = topD - botD;
            desc.innerHTML = `Subtract: <strong>${topD} − ${botD} = ${diff}</strong>!`;
          }

          card.appendChild(title);
          card.appendChild(desc);
          this.stepsContent.appendChild(card);
        }
      } else if (this.activeRoundOp === 'multiply') {
        // Step-by-step multiplication
        const card1 = document.createElement('div');
        card1.className = 'step-card-item';
        card1.innerHTML = `
          <div class="step-card-title">Step 1: Multiplication Breakdown</div>
          <div class="step-card-desc">We need to multiply <strong>${this.num1.toLocaleString()}</strong> by <strong>${this.num2.toLocaleString()}</strong>.</div>
        `;
        this.stepsContent.appendChild(card1);

        const s1 = this.num1.toString();
        const len1 = s1.length;
        for (let i = 0; i < len1; i++) {
          const placeValue = Math.pow(10, len1 - 1 - i);
          const digitVal = parseInt(s1[i], 10) * placeValue;
          const partProduct = digitVal * this.num2;

          const card = document.createElement('div');
          card.className = 'step-card-item';
          card.innerHTML = `
            <div class="step-card-title">Step ${i + 2}: Place value ${digitVal.toLocaleString()} × ${this.num2}</div>
            <div class="step-card-desc">Multiply <strong>${digitVal.toLocaleString()} × ${this.num2} = ${partProduct.toLocaleString()}</strong></div>
          `;
          this.stepsContent.appendChild(card);
        }
      } else if (this.activeRoundOp === 'divide') {
        // Step-by-step division
        const card1 = document.createElement('div');
        card1.className = 'step-card-item';
        card1.innerHTML = `
          <div class="step-card-title">Step 1: Division Problem</div>
          <div class="step-card-desc">We are dividing <strong>${this.num1.toLocaleString()}</strong> by <strong>${this.num2.toLocaleString()}</strong>.</div>
        `;
        this.stepsContent.appendChild(card1);

        const card2 = document.createElement('div');
        card2.className = 'step-card-item';
        card2.innerHTML = `
          <div class="step-card-title">Step 2: Inverse Multiplication Check</div>
          <div class="step-card-desc">Notice that <strong>${this.num2.toLocaleString()} × ${this.correctAnswer.toLocaleString()} = ${this.num1.toLocaleString()}</strong>!</div>
        `;
        this.stepsContent.appendChild(card2);

        const card3 = document.createElement('div');
        card3.className = 'step-card-item';
        card3.innerHTML = `
          <div class="step-card-title">Step 3: Result</div>
          <div class="step-card-desc">Since it fits exactly <strong>${this.correctAnswer.toLocaleString()}</strong> times with 0 remainder, our answer is <strong>${this.correctAnswer.toLocaleString()}</strong>!</div>
        `;
        this.stepsContent.appendChild(card3);
      }

      // Final summary card
      const finalCard = document.createElement('div');
      finalCard.className = 'step-card-item';
      finalCard.style.borderColor = '#10b981';
      finalCard.style.background = '#f0fdf4';
      finalCard.innerHTML = `
        <div class="step-card-title" style="color:#047857;">🎯 Final Answer</div>
        <div class="step-card-desc" style="color:#065f46; font-size:1.05rem; font-weight:700;">
          ${this.num1.toLocaleString()} ${this.opSymbol} ${this.num2.toLocaleString()} = ${this.correctAnswer.toLocaleString()}
        </div>
      `;
      this.stepsContent.appendChild(finalCard);

      this.stepsDialogBackdrop.classList.remove('hidden');
    }

    formatDateKey(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    getDayDisplayInfo(dateKey, sampleTimestamp) {
      const now = new Date();
      const todayKey = this.formatDateKey(now);
      const yest = new Date(now);
      yest.setDate(now.getDate() - 1);
      const yesterdayKey = this.formatDateKey(yest);

      let d;
      if (sampleTimestamp) {
        d = new Date(sampleTimestamp);
      } else {
        const parts = dateKey.split('-');
        d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }

      let relativeLabel = '';
      if (dateKey === todayKey) {
        relativeLabel = 'Today';
      } else if (dateKey === yesterdayKey) {
        relativeLabel = 'Yesterday';
      } else {
        relativeLabel = d.toLocaleDateString(undefined, { weekday: 'long' });
      }

      const formatted = d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return { relativeLabel, formatted, isToday: dateKey === todayKey };
    }

    addHistoryItem(n1, n2, userAns, passed) {
      const now = new Date();
      const dateKey = this.formatDateKey(now);

      const item = {
        id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        timestamp: now.getTime(),
        dateKey: dateKey,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        n1,
        n2,
        opSymbol: this.opSymbol,
        operation: this.activeRoundOp,
        userAns,
        correctAns: this.correctAnswer,
        passed,
        digits: this.currentDigitsMode
      };

      this.stats.history.unshift(item);
      if (this.stats.history.length > 200) {
        this.stats.history.pop();
      }
      this.renderHistory();
    }

    renderHistory() {
      if (!this.historyDaysContainer) return;

      if (!this.stats.history || this.stats.history.length === 0) {
        this.historyDaysContainer.innerHTML = '<div class="empty-history">Start playing to see your math achievements organized by days and dates! 🎈</div>';
        if (this.historyDateFilter) {
          this.historyDateFilter.innerHTML = '<option value="all">All Dates</option>';
        }
        return;
      }

      // 1. Normalize items and collect unique dates (maintaining order)
      const todayKey = this.formatDateKey(new Date());
      const uniqueDateKeys = [];
      const dateKeySet = new Set();

      this.stats.history.forEach((h, idx) => {
        if (!h.dateKey) {
          h.dateKey = todayKey;
        }
        if (!h.timestamp) {
          h.timestamp = Date.now() - idx * 60000;
        }
        if (!dateKeySet.has(h.dateKey)) {
          dateKeySet.add(h.dateKey);
          uniqueDateKeys.push(h.dateKey);
        }
      });

      // 2. Update Date Filter dropdown
      if (this.historyDateFilter) {
        const currentSelected = this.historyDateFilter.value || 'all';
        let optionsHtml = `<option value="all" ${currentSelected === 'all' ? 'selected' : ''}>All Dates (${uniqueDateKeys.length} ${uniqueDateKeys.length === 1 ? 'day' : 'days'})</option>`;
        uniqueDateKeys.forEach((dKey) => {
          const sampleItem = this.stats.history.find(h => h.dateKey === dKey);
          const dayInfo = this.getDayDisplayInfo(dKey, sampleItem ? sampleItem.timestamp : null);
          const label = `${dayInfo.relativeLabel ? dayInfo.relativeLabel + ' • ' : ''}${dayInfo.formatted}`;
          optionsHtml += `<option value="${dKey}" ${currentSelected === dKey ? 'selected' : ''}>${label}</option>`;
        });
        this.historyDateFilter.innerHTML = optionsHtml;
      }

      // 3. Filter items according to active filters
      const selectedDate = this.historyDateFilter ? this.historyDateFilter.value : 'all';
      const selectedStatus = this.historyStatusFilter ? this.historyStatusFilter.value : 'all';
      const selectedOp = this.historyOpFilter ? this.historyOpFilter.value : 'all';

      const filtered = this.stats.history.filter((item) => {
        if (selectedDate !== 'all' && item.dateKey !== selectedDate) return false;
        if (selectedStatus === 'passed' && !item.passed) return false;
        if (selectedStatus === 'failed' && item.passed) return false;
        if (selectedOp !== 'all') {
          const sym = item.opSymbol || '+';
          if (sym !== selectedOp) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        this.historyDaysContainer.innerHTML = '<div class="empty-history">No records found matching your selected filters. 🔍</div>';
        return;
      }

      // 4. Group filtered items by dateKey
      const groupsByDate = {};
      const orderedDateKeys = [];

      filtered.forEach((item) => {
        const k = item.dateKey;
        if (!groupsByDate[k]) {
          groupsByDate[k] = [];
          orderedDateKeys.push(k);
        }
        groupsByDate[k].push(item);
      });

      // 5. Render Day Cards
      this.historyDaysContainer.innerHTML = '';

      orderedDateKeys.forEach((dateKey, index) => {
        const dayItems = groupsByDate[dateKey];
        const dayTotal = dayItems.length;
        const dayCorrect = dayItems.filter(i => i.passed).length;
        const dayAccuracy = Math.round((dayCorrect / dayTotal) * 100);
        const dayStars = dayCorrect * 2; // approximation for summary
        const dayInfo = this.getDayDisplayInfo(dateKey, dayItems[0].timestamp);

        const card = document.createElement('div');
        card.className = 'day-result-card';
        // Auto-expand first day (usually today/latest), collapse others if multiple
        if (index > 0 && orderedDateKeys.length > 1) {
          card.classList.add('collapsed');
        }

        const header = document.createElement('div');
        header.className = 'day-card-header';
        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        header.setAttribute('title', 'Click to expand or collapse this day');
        header.innerHTML = `
          <div class="day-title-info">
            <span class="day-calendar-icon">📅</span>
            <div>
              <div class="day-main-heading">
                <span class="day-tag">${dayInfo.relativeLabel}</span>
                <span class="day-formatted">${dayInfo.formatted}</span>
              </div>
              <span class="day-time-range">${dayItems[0].time ? 'Latest at ' + dayItems[0].time : ''}</span>
            </div>
          </div>
          <div class="day-stats-pills">
            <span class="day-pill pill-total">🎯 ${dayTotal} Solved</span>
            <span class="day-pill pill-correct">✅ ${dayCorrect}/${dayTotal} (${dayAccuracy}%)</span>
            <span class="day-pill pill-stars">⭐ +${dayStars} Stars</span>
            <span class="day-expand-icon">▼</span>
          </div>
        `;

        header.addEventListener('click', () => {
          this.sound.playClick();
          card.classList.toggle('collapsed');
        });

        // Content Table
        const contentWrap = document.createElement('div');
        contentWrap.className = 'day-card-content';

        let tableHtml = `
          <div class="day-problems-table-wrap">
            <table class="day-problems-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Operation</th>
                  <th>Math Problem</th>
                  <th>Your Answer</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
        `;

        const opLabels = {
          '+': { name: 'Addition', cls: 'op-add' },
          '−': { name: 'Subtraction', cls: 'op-subtract' },
          '×': { name: 'Multiplication', cls: 'op-multiply' },
          '÷': { name: 'Division', cls: 'op-divide' }
        };

        dayItems.forEach((item) => {
          const sym = item.opSymbol || '+';
          const opMeta = opLabels[sym] || { name: 'Addition', cls: 'op-add' };
          const rowClass = item.passed ? 'row-pass' : 'row-fail';

          tableHtml += `
            <tr class="${rowClass}">
              <td class="time-cell">${item.time || '—'}</td>
              <td><span class="op-mini-badge ${opMeta.cls}">${sym} ${opMeta.name}</span></td>
              <td class="equation-cell">${item.n1.toLocaleString()} ${sym} ${item.n2.toLocaleString()} = ${item.correctAns.toLocaleString()}</td>
              <td class="answer-cell">${item.userAns !== undefined ? item.userAns.toLocaleString() : '—'}</td>
              <td>
                <span class="status-tag ${item.passed ? 'status-pass' : 'status-fail'}">
                  ${item.passed ? '✅ Correct' : '❌ Missed'}
                </span>
              </td>
            </tr>
          `;
        });

        tableHtml += `
              </tbody>
            </table>
          </div>
        `;

        contentWrap.innerHTML = tableHtml;
        card.appendChild(header);
        card.appendChild(contentWrap);
        this.historyDaysContainer.appendChild(card);
      });
    }

    updateStatsUI() {
      this.starCounter.textContent = this.stats.stars;
      this.streakCounter.textContent = this.stats.streak;
      this.correctCounter.textContent = this.stats.correct;
      this.totalCounter.textContent = this.stats.total;

      const accuracy = this.stats.total > 0
        ? Math.round((this.stats.correct / this.stats.total) * 100)
        : 100;
      this.accuracyCounter.textContent = `${accuracy}%`;
    }

    saveStats() {
      // 1. Keep full long-term day records in localStorage
      try {
        localStorage.setItem('mathKids_stars', this.stats.stars);
        localStorage.setItem('mathKids_streak', this.stats.streak);
        localStorage.setItem('mathKids_correct', this.stats.correct);
        localStorage.setItem('mathKids_total', this.stats.total);
        localStorage.setItem('mathKids_history', JSON.stringify(this.stats.history));
      } catch (e) {
        // quota or file restrictions
      }

      // 2. Prepare compact recent history for 1-year cookie storage (under 3.5KB)
      const compactHistoryForCookie = (this.stats.history || []).slice(0, 30);

      const resultsPayload = {
        stars: this.stats.stars,
        streak: this.stats.streak,
        correct: this.stats.correct,
        total: this.stats.total,
        history: compactHistoryForCookie,
        savedAt: new Date().toISOString(),
        expiresIn: '1 year'
      };

      // 3. Save into 1-year cookies (31,536,000 seconds = 365 days)
      CookieStorage.set('mathKids_results', resultsPayload, CookieStorage.ONE_YEAR_SECONDS);
      CookieStorage.set('mathKids_stars', this.stats.stars, CookieStorage.ONE_YEAR_SECONDS);
      CookieStorage.set('mathKids_streak', this.stats.streak, CookieStorage.ONE_YEAR_SECONDS);
      CookieStorage.set('mathKids_correct', this.stats.correct, CookieStorage.ONE_YEAR_SECONDS);
      CookieStorage.set('mathKids_total', this.stats.total, CookieStorage.ONE_YEAR_SECONDS);
    }
  }

  // Initialize Game on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new MathKidsGame());
  } else {
    new MathKidsGame();
  }
})();
