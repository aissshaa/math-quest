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
        }
        if (self._onReady) {
          self._onReady(user);
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
        MathQuest.App.afterLogin();
      })
      .catch(function() {
        MathQuest.App.afterLogin();
      });
  },

  _migrateData: function() {
    if (!this._user) return;
    var data = JSON.parse(localStorage.getItem('mathquest_data')) || MathQuest.Store._defaultData();
    data.lastSave = Date.now();
    this._db.collection('users').doc(this._user.uid).set({
      gameData: data
    }).catch(function() {});
  },

  sync: function() {
    if (!this._user) return;
    var data = MathQuest.Store.data;
    data.lastSave = Date.now();
    this._db.collection('users').doc(this._user.uid).set({
      gameData: data
    }).catch(function() {});
  }
};
