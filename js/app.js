var MathQuest = window.MathQuest || {};

MathQuest.Sound = {
  _ctx: null,

  play: function(type) {
    if (!MathQuest.Store.get('sound')) return;
    var ctx = this._getContext();
    if (!ctx) return;

    if (type === 'correct') {
      this._tone(ctx, 523, 0.1, 0.15);
      this._tone(ctx, 659, 0.1, 0.25);
    } else if (type === 'wrong') {
      this._noise(ctx, 0.2, 0.3);
    } else if (type === 'reward') {
      this._tone(ctx, 523, 0.1, 0.1);
      this._tone(ctx, 659, 0.1, 0.2);
      this._tone(ctx, 784, 0.15, 0.3);
    } else if (type === 'levelup') {
      this._tone(ctx, 392, 0.1, 0.05);
      this._tone(ctx, 523, 0.1, 0.15);
      this._tone(ctx, 659, 0.1, 0.25);
      this._tone(ctx, 784, 0.2, 0.35);
    } else if (type === 'click') {
      this._tone(ctx, 800, 0.03, 0.01);
    } else if (type === 'open') {
      this._tone(ctx, 600, 0.05, 0.05);
      this._tone(ctx, 800, 0.05, 0.12);
    } else if (type === 'coin') {
      this._tone(ctx, 1200, 0.05, 0.05);
      this._tone(ctx, 1500, 0.05, 0.1);
    } else if (type === 'streak') {
      this._tone(ctx, 400, 0.08, 0.05);
      this._tone(ctx, 500, 0.08, 0.15);
      this._tone(ctx, 600, 0.1, 0.25);
    } else if (type === 'boss_hit') {
      this._tone(ctx, 200, 0.15, 0.05);
      this._tone(ctx, 150, 0.1, 0.15);
    } else if (type === 'boss_roar') {
      this._tone(ctx, 100, 0.2, 0.1);
      this._tone(ctx, 80, 0.2, 0.3);
    } else if (type === 'boss_defeat') {
      this._tone(ctx, 400, 0.1, 0.05);
      this._tone(ctx, 500, 0.1, 0.15);
      this._tone(ctx, 600, 0.1, 0.25);
      this._tone(ctx, 800, 0.3, 0.35);
    }
  },

  _getContext: function() {
    if (!this._ctx) {
      try {
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
    return this._ctx;
  },

  _tone: function(ctx, freq, duration, startOffset) {
    try {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.15;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startOffset);
      osc.stop(ctx.currentTime + startOffset + duration + 0.05);
    } catch (e) {}
  },

  _noise: function(ctx, duration, startOffset) {
    try {
      var bufferSize = Math.floor(ctx.sampleRate * duration);
      var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }
      var source = ctx.createBufferSource();
      source.buffer = buffer;
      var gain = ctx.createGain();
      gain.gain.value = 0.1;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(ctx.currentTime + startOffset);
      source.stop(ctx.currentTime + startOffset + duration + 0.05);
    } catch (e) {}
  }
};

MathQuest.Animations = {
  _particles: [],
  _frame: null,

  confetti: function(count) {
    var canvas = document.getElementById('confetti');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var colors = ['#6c63ff', '#ff6584', '#ffd600', '#00c853', '#00b0ff', '#ff6d00', '#e040fb'];
    var startTime = Date.now();
    var duration = (count || 80) > 80 ? 4000 : 3000;

    for (var i = 0; i < (count || 80); i++) {
      this._particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 3,
        rot: Math.random() * 360,
        rs: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    if (this._frame) cancelAnimationFrame(this._frame);
    this._renderConfetti(ctx, canvas, startTime, duration);
  },

  _renderConfetti: function(ctx, canvas, startTime, duration) {
    var elapsed = Date.now() - startTime;
    if (elapsed > duration + 500) {
      this._particles = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this._particles = this._particles.filter(function(p) { return p.opacity > 0.01; });

    for (var i = 0; i < this._particles.length; i++) {
      var p = this._particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.rot += p.rs;
      if (elapsed > duration) p.opacity -= 0.02;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    var self = this;
    this._frame = requestAnimationFrame(function() {
      self._renderConfetti(ctx, canvas, startTime, duration);
    });
  },

  showLevelUp: function(level) {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,#6c63ff,#ff6584);z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;max-width:480px;margin:0 auto';
    overlay.innerHTML = '<div style="font-size:100px;margin-bottom:20px;animation:bounce 0.6s infinite">🎉</div><h1 style="font-size:72px;font-weight:900;color:white">' + level + '</h1><div style="font-size:24px;color:rgba(255,255,255,0.9);font-weight:700;margin-top:8px">Новый уровень!</div>';
    document.getElementById('app').appendChild(overlay);
    MathQuest.Sound.play('levelup');

    setTimeout(function() {
      overlay.style.transition = 'opacity 0.5s ease';
      overlay.style.opacity = '0';
      setTimeout(function() { overlay.remove(); }, 500);
    }, 2000);
  },

  showReward: function(title, icon, xp, coins) {
    var overlay = document.createElement('div');
    overlay.className = 'modal';
    overlay.style.display = 'flex';
    var html = '<div class="mc" onclick="event.stopPropagation()"><div class="mi" style="font-size:80px">' + icon + '</div><h2>' + title + '</h2>';
    if (xp) html += '<p style="color:#6c63ff;font-size:20px;font-weight:800">+' + xp + ' XP</p>';
    if (coins) html += '<p style="color:#ffd600;font-size:18px;font-weight:800">+' + coins + ' 🪙</p>';
    html += '</div>';
    overlay.innerHTML = html;
    document.getElementById('app').appendChild(overlay);
    MathQuest.Sound.play('reward');
    this.confetti(50);

    setTimeout(function() {
      overlay.style.transition = 'opacity 0.4s ease';
      overlay.style.opacity = '0';
      setTimeout(function() { overlay.remove(); }, 400);
    }, 2000);
  }
};

MathQuest.App = {
  _history: [],
  _curClass: 0,
  _curTopic: null,
  _curLevel: 1,
  _qIndex: 0,
  _questions: [],
  _errors: 0,
  _combo: 0,
  _bossHP: 100,
  _bossMax: 100,
  _hintPrice: 15,

  init: function() {
    MathQuest.Store.init();
    MathQuest.Store.startHeartTimer();
    this._setupListeners();

    MathQuest.Auth.init();

    var self = this;
    var fallback = setTimeout(function() {
      var splash = document.getElementById('splash');
      if (splash && splash.style.display !== 'none') {
        splash.style.transition = 'opacity 0.5s ease';
        splash.style.opacity = '0';
        setTimeout(function() {
          splash.style.display = 'none';
          self._navigate('home');
        }, 500);
      }
    }, 5000);

    MathQuest.Auth.onReady(function(user) {
      clearTimeout(fallback);
      setTimeout(function() {
        var splash = document.getElementById('splash');
        splash.style.transition = 'opacity 0.5s ease';
        splash.style.opacity = '0';
        setTimeout(function() {
          splash.style.display = 'none';
          if (user) {
            self.afterLogin();
          } else {
            self._navigate('login');
          }
        }, 500);
      }, 1500);
    });
  },

  afterLogin: function() {
    MathQuest.Store.addStreak();
    this._navigate('home');
  },

  _setupListeners: function() {
    var self = this;

    MathQuest.Store.on('heartsChange', function() {
      self._updateHearts();
    });

    MathQuest.Store.on('coinsChange', function() {
      var el = document.getElementById('h-coins');
      if (el) el.textContent = MathQuest.Store.get('coins');
      var el2 = document.getElementById('s-coins');
      if (el2) el2.textContent = MathQuest.Store.get('coins');
    });

    MathQuest.Store.on('streakChange', function(s) {
      var el = document.getElementById('h-streak');
      if (el) el.textContent = s;
      if (s > 0 && s % 7 === 0) {
        MathQuest.Sound.play('streak');
        MathQuest.Animations.showReward('🔥 ' + s + ' дней!', '🔥', 50, s * 5);
      }
    });

    MathQuest.Store.on('levelUp', function(level) {
      self._updateUI();
      MathQuest.Animations.showLevelUp(level);
    });
  },

  _showPage: function(page) {
    var screens = ['home', 'map', 'game', 'boss', 'prof', 'shop', 'ach', 'set', 'login', 'friends'];
    for (var i = 0; i < screens.length; i++) {
      var el = document.getElementById(screens[i] + '-scr');
      if (el) el.classList.remove('active');
    }
    var target = document.getElementById(page + '-scr');
    if (target) target.classList.add('active');

    if (page === 'home') this._renderHome();
    else if (page === 'prof') this._renderProfile();
    else if (page === 'shop') this._renderShop();
    else if (page === 'ach') this._renderAchievements();
    else if (page === 'set') this._renderSettings();
    else if (page === 'friends') this._renderFriends();
  },

  _navigate: function(page) {
    this._showPage(page);
    this._history.push(page);
  },

  back: function() {
    MathQuest.Sound.play('click');

    var gameVisible = document.getElementById('game-scr').classList.contains('active');
    var bossVisible = document.getElementById('boss-scr').classList.contains('active');

    if (gameVisible || bossVisible) {
      var prev = 'map';
      if (this._history.length > 0) {
        prev = this._history[this._history.length - 1];
      }
      this._showPage(prev);
      return;
    }

    this._history.pop();
    var prev = this._history[this._history.length - 1] || 'home';
    this._showPage(prev);
  },

  _updateUI: function() {
    var st = MathQuest.Store;
    var el = document.getElementById('h-streak');
    if (el) el.textContent = st.get('streak');
    var el2 = document.getElementById('h-lvl');
    if (el2) el2.textContent = st.get('level');
    var el3 = document.getElementById('h-coins');
    if (el3) el3.textContent = st.get('coins');
    this._updateHearts();
  },

  _updateHearts: function() {
    var st = MathQuest.Store;
    var count = st.get('hearts');
    var max = st.get('maxHearts');
    var ids = ['h-hearts', 'g-hearts', 'b-hearts'];

    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (!el) continue;
      var html = '';
      for (var j = 0; j < max; j++) {
        var cls = j >= count ? 'heart lost' : 'heart';
        var icon = j >= count ? '🖤' : '❤️';
        html += '<span class="' + cls + '">' + icon + '</span>';
      }
      el.innerHTML = html;
    }
  },

  _renderHome: function() {
    var st = MathQuest.Store;

    document.getElementById('h-streak').textContent = st.get('streak');
    document.getElementById('h-lvl').textContent = st.get('level');
    document.getElementById('h-coins').textContent = st.get('coins');
    this._updateHearts();

    document.getElementById('h-ava').textContent = st.get('avatar');
    var name = st.get('name');
    document.getElementById('h-greet').textContent = name ? 'Привет, ' + name + '!' : 'Добро пожаловать!';
    document.getElementById('h-lvl-lbl').textContent = st.get('level');
    document.getElementById('h-xp').textContent = st.get('xp');
    var need = 100 + st.get('level') * 20;
    document.getElementById('h-xpn').textContent = need;
    var pct = Math.min(100, (st.get('xp') / need) * 100);
    document.getElementById('h-xpbar').style.width = pct + '%';

    var grid = document.getElementById('h-grid');
    grid.innerHTML = '';
    var curClass = st.get('classId');

    for (var i = 1; i <= 11; i++) {
      var card = document.createElement('div');
      card.className = 'cclass';
      if (i === curClass) card.classList.add('sel');
      card.innerHTML = '<span>' + i + '</span><span class="cl">Класс</span>';
      card.onclick = (function(n) {
        return function() {
          MathQuest.Sound.play('click');
          MathQuest.Store.set('classId', n);
          MathQuest.App._curClass = n;
          MathQuest.App._openMap(n);
        };
      })(i);
      grid.appendChild(card);
    }

    var hint = document.getElementById('h-hint');
    if (curClass) {
      hint.textContent = 'Текущий: ' + MathQuest.CLASS_NAMES[curClass] + '. Выбери класс для продолжения.';
    } else {
      hint.textContent = 'Выбери свой класс';
    }
  },

  _openMap: function(classId) {
    this._curClass = classId;
    var data = MathQuest.TOPICS[classId] || [];

    document.getElementById('m-title').textContent = MathQuest.CLASS_NAMES[classId] || classId + ' Класс';

    var topicsWrap = document.getElementById('m-topics');
    topicsWrap.innerHTML = '';

    for (var i = 0; i < data.length; i++) {
      var t = data[i];
      var tp = MathQuest.Store.getTopicProgress(classId, t.id);
      var isComplete = tp.completedLevels.length >= t.levels;

      var chip = document.createElement('button');
      chip.className = 'tchip';
      if (i === 0 && !this._curTopic) chip.classList.add('act');
      if (isComplete) chip.classList.add('done');
      chip.textContent = (isComplete ? '✅ ' : '') + t.name;
      (function(chipEl, topic) {
        chipEl.onclick = function() {
          var chips = topicsWrap.querySelectorAll('.tchip');
          for (var c = 0; c < chips.length; c++) chips[c].classList.remove('act');
          chipEl.classList.add('act');
          MathQuest.App._curTopic = topic;
          MathQuest.App._renderMapLevels(classId, topic);
        };
      })(chip, t);
      topicsWrap.appendChild(chip);
    }

    if (!this._curTopic || !data.some(function(t) { return t.id === MathQuest.App._curTopic.id; })) {
      this._curTopic = data[0];
    }

    var actChip = topicsWrap.querySelector('.act');
    if (!actChip && topicsWrap.firstChild) topicsWrap.firstChild.classList.add('act');
    this._renderMapLevels(classId, this._curTopic);
    this._navigate('map');
  },

  _renderMapLevels: function(classId, topic) {
    var body = document.getElementById('m-body');
    if (!topic) {
      body.innerHTML = '<p style="color:#a0a0b8;text-align:center">Нет тем</p>';
      return;
    }

    var tp = MathQuest.Store.getTopicProgress(classId, topic.id);
    var total = topic.levels;
    var html = '<div class="mpath">';

    for (var i = 1; i <= total; i++) {
      var isCompleted = tp.completedLevels.indexOf(i) !== -1;
      var isCurrent = i === tp.currentLevel && !isCompleted;
      var isLocked = i > tp.currentLevel;
      var isBoss = i % 10 === 0;

      if (i > 1) {
        var prevDone = tp.completedLevels.indexOf(i - 1) !== -1 || i - 1 < tp.currentLevel;
        html += '<div class="conn' + (prevDone ? ' ok' : '') + '"></div>';
      }

      html += '<div class="mlvl">';

      if (isBoss) {
        var bd = tp.bossDefeated || isCompleted;
        html += '<div class="lnode boss' + (bd ? ' ok' : isCurrent ? ' cur' : ' lock') + '" onclick="';
        if (!isLocked || bd) {
          html += 'MathQuest.App._startBossLevel(' + classId + ',\'' + topic.id + '\',' + i + ')';
        }
        html += '">' + (bd ? '✅' : '👾') + '</div>';
        html += '<div class="lbl">Босс</div>';
      } else {
        html += '<div class="lnode' + (isCompleted ? ' ok' : isCurrent ? ' cur' : isLocked ? ' lock' : '') + '" onclick="';
        if (!isLocked) {
          html += 'MathQuest.App._startLevel(' + classId + ',\'' + topic.id + '\',' + i + ')';
        }
        html += '">' + (isCompleted ? '✅' : isLocked ? '🔒' : i) + '</div>';
        html += '<div class="lbl">Уровень ' + i + '</div>';
      }

      html += '</div>';
    }

    html += '</div>';
    body.innerHTML = html;
  },

  _startLevel: function(classId, topicId, levelNum) {
    if (MathQuest.Store.get('hearts') <= 0) {
      this._toast('Нет сердец! Купи в магазине.', 'err');
      return;
    }

    var topics = MathQuest.TOPICS[classId] || [];
    this._curTopic = null;
    for (var i = 0; i < topics.length; i++) {
      if (topics[i].id === topicId) {
        this._curTopic = topics[i];
        break;
      }
    }

    this._curLevel = levelNum;
    this._qIndex = 0;
    this._errors = 0;
    this._combo = 0;

    var num = 5;
    var diff = Math.min(5, Math.ceil(levelNum / 2));
    this._questions = [];
    for (var j = 0; j < num; j++) {
      this._questions.push(MathQuest.Generator.generate(classId, topicId, levelNum, diff));
    }

    MathQuest.Sound.play('open');
    this._restoreGameDOM();
    this._showPage('game');
    this._renderQuestion();
  },

  _restoreGameDOM: function() {
    var rwd = document.getElementById('g-rwd');
    if (rwd) rwd.remove();
    var body = document.getElementById('g-body');
    var gameEls = body.querySelectorAll('.gtag, .gq, .gans, .ginp, .gfb, .hint-area');
    for (var i = 0; i < gameEls.length; i++) gameEls[i].style.display = '';
    document.getElementById('g-ft').innerHTML = '';
  },

  _restoreBossDOM: function() {
    var rwd = document.getElementById('b-rwd');
    if (rwd) rwd.remove();
    var body = document.getElementById('b-body');
    var bossEls = body.querySelectorAll('.boss-title, .boss-ch, .boss-name, .boss-hp, .boss-ht, .gq, .gans, .ginp, .gfb, .hint-area');
    for (var i = 0; i < bossEls.length; i++) bossEls[i].style.display = '';
    document.getElementById('b-ft').innerHTML = '';
  },

  _startBossLevel: function(classId, topicId, levelNum) {
    if (MathQuest.Store.get('hearts') <= 0) {
      this._toast('Нет сердец! Купи в магазине.', 'err');
      return;
    }

    var topics = MathQuest.TOPICS[classId] || [];
    this._curTopic = null;
    for (var i = 0; i < topics.length; i++) {
      if (topics[i].id === topicId) {
        this._curTopic = topics[i];
        break;
      }
    }

    this._curLevel = levelNum;
    this._qIndex = 0;
    this._errors = 0;
    this._combo = 0;
    this._bossHP = 100;
    this._bossMax = 100;

    var num = 5 + Math.min(5, Math.floor(levelNum / 5));
    this._questions = [];
    for (var j = 0; j < num; j++) {
      this._questions.push(MathQuest.Generator.genBossQuestion(Math.min(5, Math.ceil(levelNum / 2))));
    }

    var bi = MathQuest.Store.get('bosses') % 8;
    document.getElementById('b-ch').textContent = MathQuest.BOSS_ICONS[bi];
    document.getElementById('b-name').textContent = MathQuest.BOSS_NAMES[bi];
    this._updateBossHP();

    MathQuest.Sound.play('boss_roar');
    this._restoreBossDOM();
    this._showPage('boss');
    this._renderBossQuestion();
  },

  _updateCombo: function() {
    var el = document.getElementById('g-combo');
    if (!el) return;
    if (this._combo > 1) {
      el.textContent = '🔥 x' + this._combo;
      el.style.color = '#ff6d00';
      el.style.transform = 'scale(1.3)';
      var self = this;
      setTimeout(function() {
        if (el) el.style.transform = 'scale(1)';
      }, 200);
    } else {
      el.textContent = '';
    }
  },

  _showHint: function() {
    var st = MathQuest.Store;
    if (st.get('coins') < this._hintPrice) {
      this._toast('Не хватает монет! Нужно ' + this._hintPrice + ' 🪙', 'err');
      return;
    }
    var q = this._questions[this._qIndex];
    if (!q || !q.hint) return;
    st.spendCoins(this._hintPrice);
    var area = document.getElementById('g-hint-area');
    area.innerHTML = '<div class="hint-text">💡 ' + q.hint + '</div>';
    MathQuest.Sound.play('coin');
  },

  _showBossHint: function() {
    var st = MathQuest.Store;
    if (st.get('coins') < this._hintPrice) {
      this._toast('Не хватает монет! Нужно ' + this._hintPrice + ' 🪙', 'err');
      return;
    }
    var q = this._questions[this._qIndex];
    if (!q || !q.hint) return;
    st.spendCoins(this._hintPrice);
    var area = document.getElementById('b-hint-area');
    area.innerHTML = '<div class="hint-text">💡 ' + q.hint + '</div>';
    MathQuest.Sound.play('coin');
  },

  _renderQuestion: function() {
    if (this._qIndex >= this._questions.length) {
      this._completeLevel();
      return;
    }

    var q = this._questions[this._qIndex];
    var fb = document.getElementById('g-fb');
    fb.style.display = 'none';
    document.getElementById('g-ft').innerHTML = '';

    document.getElementById('g-pt').textContent = (this._qIndex + 1) + '/' + this._questions.length;
    document.getElementById('g-pb').style.width = (this._qIndex / this._questions.length * 100) + '%';

    var comboEl = document.getElementById('g-combo');
    if (comboEl && this._combo > 1) {
      comboEl.textContent = '🔥 x' + this._combo;
    }

    document.getElementById('g-tag').textContent = this._curTopic ? this._curTopic.name : '';
    document.getElementById('g-q').innerHTML = q.text;

    var hintArea = document.getElementById('g-hint-area');
    hintArea.innerHTML = '<button class="hint-btn" onclick="MathQuest.App._showHint()">💡 Подсказка (' + this._hintPrice + '🪙)</button>';

    var ans = document.getElementById('g-ans');
    var inp = document.getElementById('g-inp');
    ans.innerHTML = '';
    inp.style.display = 'none';
    ans.className = 'gans';

    if (q.type === 'choice') {
      for (var i = 0; i < q.options.length; i++) {
        var btn = document.createElement('button');
        btn.className = 'ans fw';
        var opt = q.options[i];
        btn.textContent = typeof opt === 'boolean' ? (opt ? 'Правда' : 'Ложь') : opt;
        btn.onclick = (function(option, question) {
          return function() { MathQuest.App._checkAnswer(option, question); };
        })(opt, q);
        ans.appendChild(btn);
      }
    } else {
      inp.style.display = 'flex';
      var input = document.getElementById('g-input');
      input.value = '';
      input.className = '';
      input.focus();
      document.getElementById('g-sub').onclick = function() {
        var val = input.value.trim();
        if (!val) return;
        MathQuest.App._checkAnswer(parseFloat(val.replace(',', '.')), q);
      };
      input.onkeydown = function(e) {
        if (e.key === 'Enter') document.getElementById('g-sub').click();
      };
    }
  },

  _checkAnswer: function(userAnswer, q) {
    var isCorrect = false;

    if (q.type === 'truefalse') {
      isCorrect = userAnswer === q.answer;
    } else if (q.type === 'choice') {
      isCorrect = userAnswer === q.answer;
    } else {
      var expected = typeof q.answer === 'number' ? q.answer : parseFloat(q.answer);
      isCorrect = Math.abs(userAnswer - expected) < 0.01;
    }

    MathQuest.Store.recordAnswer(isCorrect);

    try { navigator.vibrate(isCorrect ? 50 : 200); } catch(e) {}

    if (isCorrect) {
      MathQuest.Store.addStreak();
      MathQuest.Sound.play('correct');
      this._combo++;
      this._updateCombo();
      var xp = 10 + (this._combo > 1 ? 5 * (this._combo - 1) : 0);
      var leveled = MathQuest.Store.addXP(xp);
      MathQuest.Store.data.solved++;
      MathQuest.Store.save();
      this._showFeedback(true, q, xp);

      if (leveled) {
        var self = this;
        setTimeout(function() {
          MathQuest.Animations.showLevelUp(MathQuest.Store.get('level'));
        }, 800);
      }

      var app = this;
      setTimeout(function() {
        app._qIndex++;
        app._renderQuestion();
      }, 1200);

    } else {
      MathQuest.Sound.play('wrong');
      this._combo = 0;
      this._updateCombo();
      this._errors++;
      MathQuest.Store.useHeart();
      this._updateHearts();

      if (MathQuest.Store.get('hearts') <= 0) {
        this._showFeedback(false, q);
        var app2 = this;
        setTimeout(function() {
          app2._toast('Сердца кончились!', 'err');
          app2.back();
        }, 1500);
        return;
      }

      this._showFeedback(false, q);

      var app3 = this;
      setTimeout(function() {
        app3._qIndex++;
        app3._renderQuestion();
      }, 2000);
    }
  },

  _showFeedback: function(isCorrect, q, xp) {
    var el = document.getElementById('g-fb');
    el.style.display = 'block';
    el.className = 'gfb ' + (isCorrect ? 'ok' : 'no');

    if (isCorrect) {
      var comboText = this._combo > 1 ? ' 🔥 x' + this._combo : '';
      el.innerHTML = '<span class="fi">✅</span><div class="ft">Верно!' + comboText + '</div>';
      if (xp) el.innerHTML += '<div class="fd">+' + xp + ' XP</div>';
    } else {
      var answerText = q.full !== undefined ? q.full : q.answer;
      el.innerHTML = '<span class="fi">❌</span><div class="ft">Неверно</div><div class="fd">Ответ: ' + answerText + '</div>';
    }
  },

  _completeLevel: function() {
    var classId = this._curClass;
    var topicId = this._curTopic ? this._curTopic.id : '';
    var levelNum = this._curLevel;

    MathQuest.Store.completeLevel(classId, topicId, levelNum, this._errors);
    var coins = 15 + (this._errors === 0 ? 10 : 0);
    MathQuest.Store.addCoins(coins);
    var xp = 20 + (this._errors === 0 ? 15 : 0);
    MathQuest.Store.addXP(xp);

    MathQuest.Sound.play('reward');
    MathQuest.Animations.confetti(60);

    var perfectText = '';
    if (this._errors === 0) perfectText = '<div style="color:#00c853;font-weight:800;margin-top:8px">Без ошибок! ✨</div>';

    var existing = document.getElementById('g-rwd');
    if (existing) existing.remove();
    var rwd = document.createElement('div');
    rwd.className = 'rwd';
    rwd.id = 'g-rwd';
    rwd.innerHTML = '<div class="ri">' + (this._errors === 0 ? '🏆' : '⭐') + '</div><div class="rt">Уровень пройден!</div><div class="rx">+' + xp + ' XP</div><div class="rc">+' + coins + ' 🪙</div>' + perfectText + '<p style="color:#6e6e8a;margin-top:12px">Ошибок: ' + this._errors + '</p>';

    var body = document.getElementById('g-body');
    var gameEls = body.querySelectorAll('.gtag, .gq, .gans, .ginp, .gfb, .hint-area');
    for (var i = 0; i < gameEls.length; i++) gameEls[i].style.display = 'none';
    body.appendChild(rwd);

    document.getElementById('g-ft').innerHTML = '<button class="btn btn-p btn-b" onclick="MathQuest.App._continueAfterLevel()">Продолжить</button>';

    var newAch = MathQuest.Store.checkAchievements();
    if (newAch.length > 0) {
      var app = this;
      setTimeout(function() { app._showAchievementPopup(newAch); }, 1000);
    }
  },

  _continueAfterLevel: function() {
    if (this._curLevel % 10 === 0) {
      this._startBossLevel(this._curClass, this._curTopic ? this._curTopic.id : '', this._curLevel);
    } else {
      this._openMap(this._curClass);
    }
  },

  _renderBossQuestion: function() {
    if (this._qIndex >= this._questions.length || this._bossHP <= 0) {
      this._defeatBoss();
      return;
    }

    var q = this._questions[this._qIndex];
    document.getElementById('b-fb').style.display = 'none';

    document.getElementById('b-q').innerHTML = q.text;
    document.getElementById('b-hint-area').innerHTML = '<button class="hint-btn" onclick="MathQuest.App._showBossHint()">💡 Подсказка (' + this._hintPrice + '🪙)</button>';

    var ans = document.getElementById('b-ans');
    var inp = document.getElementById('b-inp');
    ans.innerHTML = '';
    inp.style.display = 'none';
    ans.className = 'gans';

    if (q.type === 'choice') {
      for (var i = 0; i < q.options.length; i++) {
        var btn = document.createElement('button');
        btn.className = 'ans fw';
        var opt = q.options[i];
        btn.textContent = typeof opt === 'boolean' ? (opt ? 'Правда' : 'Ложь') : opt;
        btn.onclick = (function(option, question) {
          return function() { MathQuest.App._checkBossAnswer(option, question); };
        })(opt, q);
        ans.appendChild(btn);
      }
    } else {
      inp.style.display = 'flex';
      var input = document.getElementById('b-input');
      input.value = '';
      input.focus();
      document.getElementById('b-sub').onclick = function() {
        var val = input.value.trim();
        if (!val) return;
        MathQuest.App._checkBossAnswer(parseFloat(val.replace(',', '.')), q);
      };
      input.onkeydown = function(e) {
        if (e.key === 'Enter') document.getElementById('b-sub').click();
      };
    }
  },

  _checkBossAnswer: function(userAnswer, q) {
    var isCorrect = false;
    if (q.type === 'truefalse') isCorrect = userAnswer === q.answer;
    else if (q.type === 'choice') isCorrect = userAnswer === q.answer;
    else isCorrect = Math.abs(userAnswer - q.answer) < 0.01;

    MathQuest.Store.recordAnswer(isCorrect);

    if (isCorrect) {
      var damage = 20 + Math.floor(this._bossMax / this._questions.length);
      this._bossHP = Math.max(0, this._bossHP - damage);
      this._updateBossHP();
      MathQuest.Sound.play('boss_hit');
      this._showBossFeedback(true, q);

      if (this._bossHP <= 0) {
        var app = this;
        setTimeout(function() { app._defeatBoss(); }, 1000);
      } else {
        var app2 = this;
        setTimeout(function() {
          app2._qIndex++;
          app2._renderBossQuestion();
        }, 1200);
      }

    } else {
      MathQuest.Sound.play('wrong');
      this._errors++;
      MathQuest.Store.useHeart();
      this._updateHearts();
      this._showBossFeedback(false, q);

      if (MathQuest.Store.get('hearts') <= 0) {
        var app3 = this;
        setTimeout(function() {
          app3._toast('Босс победил тебя!', 'err');
          app3.back();
        }, 1500);
        return;
      }

      var app4 = this;
      setTimeout(function() {
        app4._qIndex++;
        app4._renderBossQuestion();
      }, 2000);
    }
  },

  _updateBossHP: function() {
    var pct = Math.max(0, (this._bossHP / this._bossMax) * 100);
    document.getElementById('b-hp').style.width = pct + '%';
    document.getElementById('b-ht').textContent = '❤️ ' + Math.max(0, this._bossHP) + '/100';
  },

  _showBossFeedback: function(isCorrect, q) {
    var el = document.getElementById('b-fb');
    el.style.display = 'block';
    el.className = 'gfb ' + (isCorrect ? 'ok' : 'no');
    if (isCorrect) {
      el.innerHTML = '<span class="fi">⚔️</span><div class="ft">Попадание!</div>';
    } else {
      el.innerHTML = '<span class="fi">💥</span><div class="ft">Босс атакует!</div><div class="fd">Ответ: ' + q.answer + '</div>';
    }
  },

  _defeatBoss: function() {
    var classId = this._curClass;
    var topicId = this._curTopic ? this._curTopic.id : '';

    var tp = MathQuest.Store.getTopicProgress(classId, topicId);
    tp.bossDefeated = true;
    MathQuest.Store.data.bosses++;
    MathQuest.Store.save();

    var coins = 50 + (this._errors === 0 ? 30 : 0);
    MathQuest.Store.addCoins(coins);
    MathQuest.Store.addXP(100);

    MathQuest.Sound.play('boss_defeat');
    MathQuest.Animations.confetti(120);

    var perfectText = '';
    if (this._errors === 0) perfectText = '<div style="color:#00c853;font-weight:800;margin-top:8px">Идеальная битва! ⚡</div>';

    var existing = document.getElementById('b-rwd');
    if (existing) existing.remove();
    var rwd = document.createElement('div');
    rwd.className = 'rwd';
    rwd.id = 'b-rwd';
    rwd.innerHTML = '<div class="ri">👑</div><div class="rt">Босс побеждён!</div><div class="rx">+100 XP</div><div class="rc">+' + coins + ' 🪙</div>' + perfectText;

    var bBody = document.getElementById('b-body');
    var bossEls = bBody.querySelectorAll('.boss-title, .boss-ch, .boss-name, .boss-hp, .boss-ht, .gq, .gans, .ginp, .gfb, .hint-area');
    for (var i = 0; i < bossEls.length; i++) bossEls[i].style.display = 'none';
    bBody.appendChild(rwd);

    document.getElementById('b-ft').innerHTML = '<button class="btn btn-p btn-b" onclick="MathQuest.App._openMap(' + classId + ')">Вернуться к карте</button>';

    var newAch = MathQuest.Store.checkAchievements();
    if (newAch.length > 0) {
      var app = this;
      setTimeout(function() { app._showAchievementPopup(newAch); }, 1000);
    }
  },

  _showFinalScreen: function() {
    MathQuest.Sound.play('levelup');
    MathQuest.Animations.confetti(200);

    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,#6c63ff,#ff6584);z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;max-width:480px;margin:0 auto;animation:fadeIn 0.5s ease';
    var st = MathQuest.Store;
    overlay.innerHTML =
      '<div style="font-size:100px;margin-bottom:16px">🏆</div>' +
      '<h1 style="font-size:36px;font-weight:900;color:white;text-align:center">Абсолютный чемпион!</h1>' +
      '<p style="color:rgba(255,255,255,0.9);font-size:18px;font-weight:600;margin-top:8px;text-align:center">Пройдены все 11 классов!</p>' +
      '<div style="background:rgba(255,255,255,0.2);border-radius:20px;padding:20px;margin-top:20px;width:280px;text-align:center">' +
      '<div style="color:white;font-size:14px;font-weight:700">Решено задач: ' + st.get('solved') + '</div>' +
      '<div style="color:white;font-size:14px;font-weight:700;margin-top:4px">Точность: ' + st.getAccuracy() + '%</div>' +
      '<div style="color:white;font-size:14px;font-weight:700;margin-top:4px">Уровень: ' + st.get('level') + '</div>' +
      '<div style="color:#ffd600;font-size:16px;font-weight:800;margin-top:8px">+5000 🪙</div></div>' +
      '<button class="btn btn-b" style="background:white;color:#6c63ff;margin-top:24px;width:200px" onclick="this.parentElement.remove()">🎉 Ура!</button>';
    document.getElementById('app').appendChild(overlay);
  },
    for (var i = 0; i < achievements.length; i++) {
      var a = achievements[i];
      MathQuest.Animations.showReward('🎉 ' + a.name, a.icon, 0, a.reward);
    }
  },

  _renderProfile: function() {
    var st = MathQuest.Store;
    var body = document.getElementById('p-body');
    var level = st.get('level');
    var xp = st.get('xp');
    var need = 100 + level * 20;

    body.innerHTML =
      '<div class="pcard"><div class="pa">' + st.get('avatar') + '</div>' +
      '<div class="pn">' + st.get('name') + '</div>' +
      '<div style="color:#6e6e8a;font-weight:600">Уровень ' + level + '</div>' +
      '<div class="xp-bar" style="margin-top:12px"><div class="xp-fill" style="width:' + Math.min(100, (xp / need) * 100) + '%"></div></div>' +
      '<div style="font-size:13px;color:#6e6e8a;margin-top:6px;font-weight:600">' + xp + ' / ' + need + ' XP</div></div>' +
      '<div class="pstats">' +
      '<div class="ps"><div class="pv">' + st.get('solved') + '</div><div class="pl">Решено</div></div>' +
      '<div class="ps"><div class="pv">' + st.getAccuracy() + '%</div><div class="pl">Точность</div></div>' +
      '<div class="ps"><div class="pv">🪙 ' + st.get('coins') + '</div><div class="pl">Монеты</div></div>' +
      '<div class="ps"><div class="pv">🔥 ' + st.get('streak') + '</div><div class="pl">Серия</div></div></div>';
  },

  _renderShop: function() {
    var st = MathQuest.Store;
    document.getElementById('s-coins').textContent = st.get('coins');

    var tabs = document.getElementById('s-tabs').querySelectorAll('.stab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].onclick = (function(tab) {
        return function() {
          for (var t = 0; t < tabs.length; t++) tabs[t].classList.remove('act');
          tab.classList.add('act');
          MathQuest.App._renderShopTab(tab.dataset.tab);
        };
      })(tabs[i]);
    }

    this._renderShopTab('avatars');
  },

  _renderShopTab: function(category) {
    var body = document.getElementById('s-body');
    var items = MathQuest.SHOP[category] || [];

    if (items.length === 0) {
      body.innerHTML = '<p style="color:#a0a0b8;text-align:center">Нет товаров</p>';
      return;
    }

    var html = '<div class="sgrid">';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var owned = MathQuest.Store.isOwned(it.id);
      var equipped = MathQuest.Store.get('equipped')[category] === it.id;

      html += '<div class="sitem' + (owned ? ' own' : '') + '">';
      html += '<div class="si">' + it.icon + '</div>';
      html += '<div class="sn">' + it.name + '</div>';
      html += '<div class="sp">' + (owned ? '' : it.price + ' 🪙') + '</div>';

      if (owned) {
        html += '<span class="sb' + (equipped ? ' eq' : ' own') + '" onclick="MathQuest.App._equipItem(\'' + category + '\',\'' + it.id + '\')">';
        html += (equipped ? '✅ Экипировано' : '✅ Владею') + '</span>';
      } else {
        html += '<button class="btn btn-p" style="font-size:12px;padding:6px 16px" onclick="MathQuest.App._buyItem(\'' + category + '\',\'' + it.id + '\')">Купить</button>';
      }

      html += '</div>';
    }
    html += '</div>';
    body.innerHTML = html;
  },

  _buyItem: function(category, itemId) {
    var items = MathQuest.SHOP[category] || [];
    var item = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === itemId) { item = items[i]; break; }
    }
    if (!item) return;

    if (MathQuest.Store.buyItem(item)) {
      MathQuest.Sound.play('coin');
      document.getElementById('s-coins').textContent = MathQuest.Store.get('coins');
      this._renderShopTab(category);
      this._toast('Куплено!', 'ok');
    } else {
      this._toast('Не хватает монет!', 'err');
    }
  },

  _equipItem: function(category, itemId) {
    MathQuest.Store.equipItem(category, itemId);
    this._renderShopTab(category);
    MathQuest.Sound.play('click');
    this._toast('Экипировано!', 'ok');
  },

  _renderAchievements: function() {
    var st = MathQuest.Store;
    var body = document.getElementById('a-body');
    var unlocked = st.get('achievements') || [];
    var all = MathQuest.ACHIEVEMENTS;

    document.getElementById('a-cnt').textContent = unlocked.length + '/' + all.length;
    body.innerHTML = '';

    for (var i = 0; i < all.length; i++) {
      var a = all[i];
      var isUnlocked = unlocked.indexOf(a.id) !== -1;
      var card = document.createElement('div');
      card.className = 'ach' + (isUnlocked ? ' unlock' : '');

      var progressHtml = '';
      if (!isUnlocked) {
        var current = 0;
        if (a.req.type === 'solved') current = st.get('solved');
        else if (a.req.type === 'streak') current = st.get('streak');
        else if (a.req.type === 'lvl') current = st.get('level');
        else if (a.req.type === 'perf') current = st.get('perfectTopics').length;
        else if (a.req.type === 'boss') current = st.get('bosses');
        else if (a.req.type === 'coins') current = st.get('coins');
        progressHtml = '<div style="font-size:12px;font-weight:700;color:#6c63ff;margin-top:2px">' + current + '/' + a.req.value + '</div>';
      }

      card.innerHTML =
        '<div class="ai">' + a.icon + '</div>' +
        '<div class="aii"><div class="an">' + a.name + '</div><div class="ad">' + a.desc + '</div>' + progressHtml + '</div>' +
        '<div class="as">' + (isUnlocked ? '✅' : '🔒') + '</div>';

      body.appendChild(card);
    }
  },

  _renderSettings: function() {
    var st = MathQuest.Store;
    var body = document.getElementById('s-body2');

    body.innerHTML =
      '<div class="sec"><h3>🔊 Звук</h3>' +
      '<div class="srow"><span class="sl">🔔 Эффекты</span>' +
      '<button class="tog' + (st.get('sound') ? ' on' : '') + '" id="tog-snd"></button></div></div>' +
      '<div class="sec"><h3>👤 Профиль</h3>' +
      '<div class="srow"><span class="sl">Имя</span>' +
      '<input type="text" id="nm-inp" value="' + st.get('name') + '" style="padding:8px 12px;border:2px solid #e8e8f0;border-radius:10px;font-family:inherit;font-weight:700;font-size:14px;text-align:right;width:120px"></div>' +
      '<button class="btn btn-p" style="margin-top:8px;width:100%" onclick="MathQuest.App._saveName()">Сохранить</button></div>' +
      '<div class="sec"><h3>💾 Данные</h3>' +
      '<button class="btn btn-g" style="width:100%;margin-bottom:8px" onclick="MathQuest.App._exportData()">📤 Экспорт</button>' +
      '<button class="btn btn-d" style="width:100%;margin-bottom:8px" onclick="MathQuest.App._resetData()">🗑️ Сброс</button>' +
      (MathQuest.Auth && MathQuest.Auth._user ? '<button class="btn btn-d" style="width:100%" onclick="MathQuest.Auth.logout()">🚪 Выйти из аккаунта</button>' : '') + '</div>';

    document.getElementById('tog-snd').onclick = function() {
      var enabled = !MathQuest.Store.get('sound');
      MathQuest.Store.set('sound', enabled);
      this.classList.toggle('on');
      if (enabled) MathQuest.Sound.play('click');
    };
  },

  _saveName: function() {
    var name = document.getElementById('nm-inp').value.trim() || 'Игрок';
    MathQuest.Store.set('name', name);
    this._toast('Сохранено!', 'ok');
    MathQuest.Sound.play('click');
  },

  _exportData: function() {
    var data = localStorage.getItem('mathquest_data');
    var blob = new Blob([data], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mathquest.json';
    a.click();
    URL.revokeObjectURL(a.href);
  },

  _resetData: function() {
    var mc = document.getElementById('mc');
    mc.innerHTML =
      '<div class="mi">⚠️</div><h2>Сбросить прогресс?</h2><p>Все данные будут потеряны</p>' +
      '<button class="btn btn-d btn-b" onclick="MathQuest.App._confirmReset()">Сбросить</button>' +
      '<button class="btn btn-b" style="background:#f0f2ff;color:#2d2d3d;border:1px solid #e8e8f0;margin-top:4px" onclick="MathQuest.App._closeModal()">Отмена</button>';
    document.getElementById('modal').style.display = 'flex';
  },

  _confirmReset: function() {
    localStorage.removeItem('mathquest_data');
    MathQuest.Store.data = MathQuest.Store._defaultData();
    MathQuest.Store.save();
    this._closeModal();
    this._navigate('home');
    this._toast('Прогресс сброшен', 'ok');
  },

  _closeModal: function() {
    document.getElementById('modal').style.display = 'none';
  },

  _renderFriends: function() {
    var body = document.getElementById('f-body');
    body.innerHTML = '<div style="text-align:center;padding:40px;color:#a0a0b8;font-weight:700">Загрузка...</div>';

    MathQuest.Auth.getFriendsData().then(function(data) {
      var html = '<div class="pcard" style="margin-bottom:12px">';
      html += '<input type="email" id="fr-email" class="login-inp" placeholder="Email друга" style="margin-bottom:8px">';
      html += '<button class="btn btn-p" style="width:100%" onclick="MathQuest.Auth.sendFriendRequest(document.getElementById(\'fr-email\').value.trim())">➕ Добавить друга</button>';
      html += '<p id="fr-err" class="login-err"></p></div>';

      if (data.requests && data.requests.length > 0) {
        html += '<div class="sec"><h3>📩 Заявки (' + data.requests.length + ')</h3>';
        for (var i = 0; i < data.requests.length; i++) {
          var r = data.requests[i];
          html += '<div class="srow" style="border:none;padding:8px 0"><span class="sl">' + r.name + '</span>';
          html += '<button class="btn btn-p" style="font-size:12px;padding:6px 14px;margin-right:6px" onclick="MathQuest.Auth.acceptFriendRequest(\'' + r.from + '\')">✅</button>';
          html += '<button class="btn btn-d" style="font-size:12px;padding:6px 14px" onclick="MathQuest.Auth.rejectFriendRequest(\'' + r.from + '\')">❌</button></div>';
        }
        html += '</div>';
      }

      if (data.friends && data.friends.length > 0) {
        var all = data.friends.slice();
        all.push({ uid: 'me', profile: data.ownProfile });
        all.sort(function(a, b) { return (b.profile.xp || 0) - (a.profile.xp || 0); });

        html += '<div class="sec"><h3>🏆 Таблица лидеров</h3>';
        for (var i = 0; i < all.length; i++) {
          var f = all[i];
          var isMe = f.uid === 'me';
          var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
          html += '<div class="srow" style="border:none;padding:10px 0">';
          html += '<span style="font-weight:800;width:24px">' + medal + '</span>';
          html += '<span class="sl">' + (isMe ? '⭐ ' : '') + (f.profile.avatar || '😊') + ' ' + (f.profile.name || 'Игрок') + '</span>';
          html += '<span style="font-weight:800;color:#6c63ff">Ур. ' + (f.profile.level || 1) + '</span>';
          html += '<span style="font-weight:700;color:#6e6e8a;margin-left:8px">' + (f.profile.xp || 0) + ' XP</span>';
          if (!isMe) {
            html += '<button class="bck" style="margin-left:8px;font-size:11px;padding:4px 8px" onclick="MathQuest.Auth.removeFriend(\'' + f.uid + '\')">❌</button>';
          }
          html += '</div>';
        }
        html += '</div>';
      } else {
        html += '<div class="sec" style="text-align:center;color:#a0a0b8;font-weight:600"><h3>👥 Друзья</h3><p style="margin-top:8px">Пока нет друзей. Добавь первого!</p></div>';
      }

      body.innerHTML = html;
    }).catch(function() {
      body.innerHTML = '<div class="sec" style="text-align:center;color:#a0a0b8;font-weight:600;padding:40px"><p>Ошибка загрузки. Попробуй позже.</p></div>';
    });
  },

  _toast: function(message, type) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText =
      'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);' +
      'background:' + (type === 'err' ? '#ff1744' : '#00c853') + ';' +
      'color:white;padding:12px 24px;border-radius:16px;font-weight:700;' +
      'font-family:inherit;z-index:300;animation:slideUp 0.3s ease;' +
      'max-width:320px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.2)';
    toast.textContent = message;
    document.getElementById('app').appendChild(toast);

    setTimeout(function() {
      toast.style.transition = 'opacity 0.3s ease';
      toast.style.opacity = '0';
      setTimeout(function() { toast.remove(); }, 300);
    }, 2000);
  }
};

document.addEventListener('DOMContentLoaded', function() {
  MathQuest.App.init();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function() {});
  }
});
