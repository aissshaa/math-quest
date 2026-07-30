var MathQuest = window.MathQuest || {};

MathQuest.Store = {
  data: null,
  _listeners: {},

  init: function() {
    try {
      var saved = localStorage.getItem('mathquest_data');
      if (saved) {
        this.data = JSON.parse(saved);
        this._fixData();
        return;
      }
    } catch (e) {}
    this.data = this._defaultData();
    this.save();
  },

  startHeartTimer: function() {
    this._startHeartRegen();
  },

  _fixData: function() {
    var d = this.data;
    if (!d.achievements) d.achievements = [];
    if (!d.purchased) d.purchased = [];
    if (!d.equipped) d.equipped = {};
    if (!d.cp) d.cp = {};
    if (!d.perfectTopics) d.perfectTopics = [];
    if (typeof d.bosses !== 'number') d.bosses = 0;
    if (!d.lastHeartTime) d.lastHeartTime = Date.now();
    if (!d.lastSave) d.lastSave = 0;
    this._regenHearts();
  },

  _defaultData: function() {
    return {
      name: 'Игрок',
      classId: 0,
      level: 1,
      xp: 0,
      coins: 50,
      hearts: 5,
      maxHearts: 5,
      streak: 0,
      lastPlayed: null,
      solved: 0,
      total: 0,
      correct: 0,
      achievements: [],
      purchased: [],
      equipped: {},
      cp: {},
      perfectTopics: [],
      bosses: 0,
      sound: true,
      avatar: '😊',
      lastHeartTime: Date.now(),
      lastSave: 0
    };
  },

  save: function() {
    localStorage.setItem('mathquest_data', JSON.stringify(this.data));
    if (MathQuest.Auth && MathQuest.Auth._user) {
      MathQuest.Auth.sync();
    }
  },

  reset: function() {
    localStorage.removeItem('mathquest_data');
    this.data = this._defaultData();
    this.save();
  },

  get: function(key) {
    return this.data[key];
  },

  set: function(key, value) {
    this.data[key] = value;
    this.save();
    this._emit('change', { key: key, value: value });
  },

  addXP: function(amount) {
    this.data.xp += amount;
    var needed = 100 + this.data.level * 20;
    var leveled = false;
    while (this.data.xp >= needed) {
      this.data.xp -= needed;
      this.data.level++;
      leveled = true;
      needed = 100 + this.data.level * 20;
    }
    this.save();
    if (leveled) {
      this._emit('levelUp', this.data.level);
    }
    return leveled;
  },

  addCoins: function(amount) {
    this.data.coins += amount;
    this.save();
    this._emit('coinsChange', this.data.coins);
  },

  spendCoins: function(amount) {
    if (this.data.coins < amount) return false;
    this.data.coins -= amount;
    this.save();
    this._emit('coinsChange', this.data.coins);
    return true;
  },

  _regenHearts: function() {
    if (this.data.hearts >= this.data.maxHearts) return;
    var elapsed = Date.now() - (this.data.lastHeartTime || Date.now());
    var regened = Math.floor(elapsed / 300000);
    if (regened > 0) {
      this.data.hearts = Math.min(this.data.maxHearts, this.data.hearts + regened);
      if (this.data.hearts < this.data.maxHearts) {
        this.data.lastHeartTime = Date.now() - (elapsed % 300000);
      } else {
        this.data.lastHeartTime = Date.now();
      }
      this.save();
      this._emit('heartsChange', this.data.hearts);
    }
  },

  _startHeartRegen: function() {
    var self = this;
    if (this._regenTimer) clearInterval(this._regenTimer);
    this._regenTimer = setInterval(function() {
      self._regenHearts();
    }, 30000);
  },

  useHeart: function() {
    if (this.data.hearts <= 0) return false;
    this.data.hearts--;
    this.data.lastHeartTime = Date.now();
    this.save();
    this._emit('heartsChange', this.data.hearts);
    return true;
  },

  fillHearts: function() {
    this.data.hearts = this.data.maxHearts;
    this.save();
    this._emit('heartsChange', this.data.hearts);
  },

  recordAnswer: function(correct) {
    this.data.total++;
    if (correct) this.data.correct++;
    this.save();
  },

  addStreak: function() {
    var today = new Date().toDateString();
    if (this.data.lastPlayed === today) return;
    var yesterday = new Date(Date.now() - 86400000).toDateString();
    if (this.data.lastPlayed === yesterday) {
      this.data.streak++;
    } else if (this.data.lastPlayed !== today) {
      this.data.streak = 1;
    }
    this.data.lastPlayed = today;
    this.save();
    this._emit('streakChange', this.data.streak);
  },

  getTopicProgress: function(classId, topicId) {
    if (!this.data.cp[classId]) this.data.cp[classId] = {};
    if (!this.data.cp[classId][topicId]) {
      this.data.cp[classId][topicId] = {
        completedLevels: [],
        currentLevel: 1,
        bossDefeated: false
      };
    }
    return this.data.cp[classId][topicId];
  },

  completeLevel: function(classId, topicId, levelNum, errors) {
    var tp = this.getTopicProgress(classId, topicId);
    if (tp.completedLevels.indexOf(levelNum) === -1) {
      tp.completedLevels.push(levelNum);
    }
    tp.currentLevel = levelNum + 1;
    if (errors === 0) {
      var key = classId + '_' + topicId + '_' + levelNum;
      if (this.data.perfectTopics.indexOf(key) === -1) {
        this.data.perfectTopics.push(key);
      }
    }
    this.save();
  },

  getAccuracy: function() {
    if (this.data.total === 0) return 0;
    return Math.round((this.data.correct / this.data.total) * 100);
  },

  checkAchievements: function() {
    var d = this.data;
    var all = MathQuest.ACHIEVEMENTS;
    var unlocked = d.achievements || [];
    var newOnes = [];

    for (var i = 0; i < all.length; i++) {
      var a = all[i];
      if (unlocked.indexOf(a.id) !== -1) continue;

      var done = false;
      var r = a.req;

      if (r.type === 'solved') {
        done = d.solved >= r.value;
      } else if (r.type === 'streak') {
        done = d.streak >= r.value;
      } else if (r.type === 'lvl') {
        done = d.level >= r.value;
      } else if (r.type === 'perf') {
        done = d.perfectTopics.length >= r.value;
      } else if (r.type === 'boss') {
        done = d.bosses >= r.value;
      } else if (r.type === 'coins') {
        done = d.coins >= r.value;
      } else if (r.type === 'class') {
        var classKeys = Object.keys(d.cp);
        for (var c = 0; c < classKeys.length; c++) {
          var classId = parseInt(classKeys[c]);
          var topics = MathQuest.TOPICS[classId];
          if (!topics) continue;
          var cp = d.cp[classId];
          var allDone = true;
          for (var t = 0; t < topics.length; t++) {
            var tp = cp[topics[t].id];
            if (!tp || tp.completedLevels.length < topics[t].levels) {
              allDone = false;
              break;
            }
          }
          if (allDone) {
            done = true;
            break;
          }
        }
      }

      if (done) {
        unlocked.push(a.id);
        this.addCoins(a.reward);
        newOnes.push(a);
      }
    }

    if (newOnes.length > 0) {
      d.achievements = unlocked;
      this.save();
      this._emit('achievements', newOnes);
    }
    return newOnes;
  },

  isOwned: function(id) {
    return this.data.purchased.indexOf(id) !== -1;
  },

  buyItem: function(item) {
    if (item.type === 'refill') {
      this.fillHearts();
      return this.spendCoins(item.price);
    }
    if (item.type === 'maxUp') {
      if (this.spendCoins(item.price)) {
        this.data.maxHearts = 10;
        this.data.hearts = 10;
        this.save();
        return true;
      }
      return false;
    }
    if (this.isOwned(item.id)) return false;
    if (!this.spendCoins(item.price)) return false;
    this.data.purchased.push(item.id);
    this.save();
    return true;
  },

  equipItem: function(category, id) {
    this.data.equipped[category] = id;
    if (category === 'avatars') {
      var items = MathQuest.SHOP.avatars;
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          this.data.avatar = items[i].icon;
          break;
        }
      }
    }
    this.save();
  },

  on: function(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  },

  _emit: function(event, data) {
    var list = this._listeners[event];
    if (list) {
      for (var i = 0; i < list.length; i++) {
        list[i](data);
      }
    }
  }
};
