var MathQuest = window.MathQuest || {};

MathQuest.Auth = {
  _db: null,
  _user: null,
  _ready: false,
  _pending: [],

  init: function() {
    try {
      firebase.initializeApp({
        apiKey: "AIzaSyA6Rd_Ixe5IWTrOl1jZiAZ63gClyO6lulY",
        authDomain: "math-quest-1f8a2.firebaseapp.com",
        projectId: "math-quest-1f8a2",
        storageBucket: "math-quest-1f8a2.firebasestorage.app",
        messagingSenderId: "266447112146",
        appId: "1:266447112146:web:21deaf29fd6bbbf210ea0b",
        measurementId: "G-8VJ30ND0BN"
      });
      this._db = firebase.firestore();

      var self = this;
      firebase.auth().onAuthStateChanged(function(user) {
        self._user = user;
        self._ready = true;
        if (user) {
          self._loadData();
        } else {
          if (self._onReady) self._onReady(null);
        }
      });
    } catch (e) {
      this._ready = true;
      if (this._onReady) this._onReady(null);
    }
  },

  onReady: function(fn) {
    if (this._ready) {
      fn(this._user);
    } else {
      this._onReady = fn;
    }
  },

  login: function() {
    var email = document.getElementById('login-email').value.trim();
    var pass = document.getElementById('login-pass').value;
    var err = document.getElementById('login-err');

    if (!email || !pass) {
      err.textContent = 'Заполни email и пароль';
      return;
    }

    err.textContent = '';
    var self = this;
    firebase.auth().signInWithEmailAndPassword(email, pass)
      .then(function() { err.textContent = ''; })
      .catch(function(e) {
        err.textContent = e.code === 'auth/user-not-found' ? 'Пользователь не найден' :
                          e.code === 'auth/wrong-password' ? 'Неверный пароль' :
                          e.code === 'auth/invalid-credential' ? 'Неверный email или пароль' :
                          'Ошибка входа: ' + e.message;
      });
  },

  register: function() {
    var email = document.getElementById('reg-email').value.trim();
    var pass = document.getElementById('reg-pass').value;
    var pass2 = document.getElementById('reg-pass2').value;
    var err = document.getElementById('login-err');

    if (!email || !pass) {
      err.textContent = 'Заполни email и пароль';
      return;
    }
    if (pass.length < 6) {
      err.textContent = 'Пароль минимум 6 символов';
      return;
    }
    if (pass !== pass2) {
      err.textContent = 'Пароли не совпадают';
      return;
    }

    err.textContent = '';
    var self = this;
    firebase.auth().createUserWithEmailAndPassword(email, pass)
      .then(function() {
        err.textContent = '';
        self._migrateData();
      })
      .catch(function(e) {
        err.textContent = e.code === 'auth/email-already-in-use' ? 'Email уже используется' :
                          'Ошибка: ' + e.message;
      });
  },

  logout: function() {
    var self = this;
    firebase.auth().signOut().then(function() {
      MathQuest.Store.reset();
      MathQuest.App._navigate('home');
    });
  },

  showRegister: function() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('login-err').textContent = '';
  },

  showLogin: function() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('login-err').textContent = '';
  },

  _loadData: function() {
    if (!this._user) return;
    var self = this;
    this._db.collection('users').doc(this._user.uid).get()
      .then(function(doc) {
        if (doc.exists) {
          var cloudData = doc.data().gameData;
          if (cloudData) {
            var localData = localStorage.getItem('mathquest_data');
            if (cloudData.lastSave > (localData ? JSON.parse(localData).lastSave || 0 : 0)) {
              localStorage.setItem('mathquest_data', JSON.stringify(cloudData));
              MathQuest.Store.data = JSON.parse(JSON.stringify(cloudData));
              MathQuest.Store.save();
            }
          }
        }
        if (self._onReady) self._onReady(self._user);
      })
      .catch(function() {
        if (self._onReady) self._onReady(self._user);
      });
  },

  _migrateData: function() {
    if (!this._user) return;
    var data = JSON.parse(localStorage.getItem('mathquest_data')) || MathQuest.Store._defaultData();
    data.lastSave = Date.now();
    this._db.collection('users').doc(this._user.uid).set({
      gameData: data,
      profile: {
        name: data.name,
        avatar: data.avatar,
        level: data.level,
        xp: data.xp,
        coins: data.coins,
        email: this._user.email
      },
      friends: [],
      friendRequests: [],
      sentRequests: []
    }).catch(function() {});
  },

  sync: function() {
    if (!this._user) return;
    var data = MathQuest.Store.data;
    data.lastSave = Date.now();
    this._db.collection('users').doc(this._user.uid).set({
      gameData: data,
      profile: {
        name: data.name,
        avatar: data.avatar,
        level: data.level,
        xp: data.xp,
        coins: data.coins,
        email: this._user.email
      }
    }).catch(function() {});
  },

  searchUser: function(email) {
    var self = this;
    return this._db.collection('users').where('profile.email', '==', email).get()
      .then(function(snap) {
        if (snap.empty) return null;
        var doc = snap.docs[0];
        if (doc.id === self._user.uid) return { own: true };
        return { uid: doc.id, profile: doc.data().profile };
      });
  },

  sendFriendRequest: function(email) {
    var errEl = document.getElementById('fr-err');
    errEl.textContent = '';
    var self = this;
    this.searchUser(email).then(function(result) {
      if (!result) {
        errEl.textContent = 'Пользователь не найден';
        return;
      }
      if (result.own) {
        errEl.textContent = 'Это ты';
        return;
      }
      var uid = result.uid;
      self._db.collection('users').doc(self._user.uid).get().then(function(doc) {
        var data = doc.data();
        if (data.friends && data.friends.indexOf(uid) !== -1) {
          errEl.textContent = 'Уже в друзьях';
          return;
        }
        if (data.sentRequests && data.sentRequests.some(function(r) { return r.to === uid; })) {
          errEl.textContent = 'Запрос уже отправлен';
          return;
        }
        self._db.collection('users').doc(uid).update({
          friendRequests: firebase.firestore.FieldValue.arrayUnion({
            from: self._user.uid,
            name: result.profile ? result.profile.name : 'Игрок',
            email: email,
            timestamp: Date.now()
          })
        }).then(function() {
          self._db.collection('users').doc(self._user.uid).update({
            sentRequests: firebase.firestore.FieldValue.arrayUnion({
              to: uid,
              name: result.profile.name,
              email: email,
              timestamp: Date.now()
            })
          }).then(function() {
            errEl.textContent = 'Запрос отправлен!';
            errEl.style.color = '#00c853';
          });
        }).catch(function() {
          errEl.textContent = 'Ошибка при отправке';
        });
      });
    });
  },

  acceptFriendRequest: function(fromUid) {
    var self = this;
    this._db.collection('users').doc(this._user.uid).get().then(function(doc) {
      var requests = doc.data().friendRequests || [];
      var req = requests.filter(function(r) { return r.from === fromUid; })[0];
      if (!req) return;

      self._db.collection('users').doc(self._user.uid).update({
        friends: firebase.firestore.FieldValue.arrayUnion(fromUid),
        friendRequests: requests.filter(function(r) { return r.from !== fromUid; })
      }).then(function() {
        self._db.collection('users').doc(fromUid).get().then(function(d) {
          var sents = (d.data().sentRequests || []).filter(function(s) { return s.to !== self._user.uid; });
          self._db.collection('users').doc(fromUid).update({
            friends: firebase.firestore.FieldValue.arrayUnion(self._user.uid),
            sentRequests: sents
          }).then(function() {
            MathQuest.App._renderFriends();
          });
        });
      });
    });
  },

  rejectFriendRequest: function(fromUid) {
    var self = this;
    this._db.collection('users').doc(this._user.uid).get().then(function(doc) {
      var requests = doc.data().friendRequests || [];
      self._db.collection('users').doc(self._user.uid).update({
        friendRequests: requests.filter(function(r) { return r.from !== fromUid; })
      }).then(function() {
        MathQuest.App._renderFriends();
      });
    });
  },

  removeFriend: function(friendUid) {
    var self = this;
    this._db.collection('users').doc(this._user.uid).update({
      friends: firebase.firestore.FieldValue.arrayRemove(friendUid)
    }).then(function() {
      self._db.collection('users').doc(friendUid).update({
        friends: firebase.firestore.FieldValue.arrayRemove(self._user.uid)
      }).then(function() {
        MathQuest.App._renderFriends();
      });
    });
  },

  getFriendsData: function() {
    if (!this._user) return Promise.resolve([]);
    var self = this;
    return this._db.collection('users').doc(this._user.uid).get()
      .then(function(doc) {
        var data = doc.data();
        var friends = data.friends || [];
        var requests = data.friendRequests || [];
        if (friends.length === 0) return { friends: [], requests: requests, ownProfile: data.profile };

        var promises = friends.map(function(uid) {
          return self._db.collection('users').doc(uid).get().then(function(d) {
            if (d.exists) return { uid: uid, profile: d.data().profile };
            return null;
          });
        });
        return Promise.all(promises).then(function(results) {
          return {
            friends: results.filter(function(r) { return r && r.profile; }),
            requests: requests,
            ownProfile: data.profile
          };
        });
      });
  }
};
