var MathQuest = window.MathQuest || {};

MathQuest.Generator = {
  rand: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  pick: function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  shuffle: function(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = a[i];
      a[i] = a[j];
      a[j] = temp;
    }
    return a;
  },

  generate: function(classId, topicId, levelNum, difficulty) {
    var r = Math.random();
    var opsFromTopic = [];
    if (topicId.indexOf('add') !== -1) opsFromTopic = ['+'];
    else if (topicId.indexOf('sub') !== -1) opsFromTopic = ['-'];
    else if (topicId.indexOf('mul') !== -1) opsFromTopic = ['*'];
    else if (topicId.indexOf('div') !== -1) opsFromTopic = ['/'];
    else opsFromTopic = ['+', '-'];

    var minA = 1, maxA = 20 + levelNum * 5, minB, maxB;
    if (topicId.indexOf('mul') !== -1 || topicId.indexOf('div') !== -1) {
      minA = 2; maxA = 9; minB = 2; maxB = 9;
    } else {
      minB = 1; maxB = 10 + levelNum * 2;
    }

    if (r < 0.10 && levelNum > 1 && topicId.indexOf('cmp') === -1)
      return this._genFindWrong(minA, maxA, opsFromTopic, minB, maxB);
    if (r < 0.18 && levelNum > 2 && (topicId.indexOf('num') !== -1 || topicId.indexOf('add') !== -1 || topicId.indexOf('cmp') !== -1))
      return this._genOrder(1, 10 + levelNum * 5, 4);
    if (r < 0.26 && levelNum > 1 && topicId.indexOf('cmp') === -1)
      return this._genTrueFalse(minA, maxA, ['+', '-'], 1, 10 + levelNum * 2);
    if (r < 0.33 && levelNum > 1 && topicId.indexOf('cmp') === -1 && topicId.indexOf('div') === -1)
      return this._genFill(20 + levelNum * 15);
    if (r < 0.40 && (topicId.indexOf('cmp') !== -1 || topicId.indexOf('num') !== -1 || topicId.indexOf('add') !== -1))
      return this._genSign(1, 10 + levelNum * 3, ['+', '-'], 1, 10 + levelNum * 2);
    if (r < 0.46 && levelNum > 2 && topicId.indexOf('cmp') === -1 && topicId.indexOf('div') === -1)
      return this._genReverse(minA, maxA, ['+', '-'], 1, 10 + levelNum * 2);
    if (r < 0.51 && levelNum > 1)
      return this._genClosest(50 + levelNum * 30);
    var gen = this._getGenerator(topicId);
    if (!gen) {
      gen = function() { return { text: '2 + 2', answer: 4 }; };
    }
    var q = gen.call(this);
    return this._wrapQuestion(q, difficulty);
  },

  _getGenerator: function(topicId) {
    var gens = {
      num1: this._genAddSub1to20,
      add1: this._genAdd1to20,
      sub1: this._genSub1to20,
      cmp1: this._genCompare1to20,
      shp1: this._genShapes,
      add2: this._genAdd1to100,
      sub2: this._genSub1to100,
      mul2: this._genMul2to9,
      div2: this._genDiv2to81,
      cmp2: this._genCompare1to100,
      mul3: this._genMul2to9,
      div3: this._genDiv2to81,
      as3: this._genAddSub1to500,
      fr3: this._genSimpleFraction,
      num4: this._genAddSub10to9999,
      ar4: this._genMulDiv2to12,
      ap4: this._genArea,
      fr4: this._genFractionCompare,
      dc4: this._genDecimalAddSub,
      nat5: this._genNat5,
      fr5: this._genFractionArith,
      dc5: this._genDecimalAddSub,
      pc5: this._genPercent,
      ge5: this._genArea,
      ra6: this._genRatio,
      ng6: this._genNegatives,
      cr6: this._genCoords,
      eq6: this._genSimpleEquation,
      fr6: this._genFractionArith,
      nat7: this._genNat7,
      fr7: this._genFractionArith,
      pc7: this._genPercent,
      ra7: this._genRatio,
      eq7: this._genLinearEquation,
      pw7: this._genPower,
      ge7: this._genTriangleArea,
      cr7: this._genCoords,
      tr7: this._genTriangleAngle,
      ci7: this._genCircle,
      al8: this._genSimplify,
      eq8: this._genLinearEquation,
      fn8: this._genFunction,
      ge8: this._genVolume,
      st8: this._genStats,
      ra8: this._genFractionArith,
      in9: this._genInequality,
      sy9: this._genSystem,
      po9: this._genPolynomial,
      ge9: this._genVolume,
      tr9: this._genTrig,
      fn10: this._genFunction,
      tr10: this._genTrig,
      de10: this._genDerivative,
      ge10: this._genVolume,
      pr10: this._genProbability,
      de11: this._genDerivative,
      in11: this._genIntegral,
      eq11: this._genLinearEquation,
      ge11: this._genVolume,
      pr11: this._genProbability
    };
    return gens[topicId] || null;
  },

  _wrapQuestion: function(q, difficulty) {
    if (!q) q = { text: '2 + 2', answer: 4 };
    q.hint = this._genHint(q);

    if (q.type === 'find_wrong' || q.type === 'order' || q.type === 'fill') {
      return q;
    }

    var types = ['choice', 'input'];
    var type = q.type || this.pick(types);

    if (type === 'choice') {
      var correct = q.answer;
      var opts = [correct];
      var attempts = 0;
      while (opts.length < 4 && attempts < 50) {
        var offset = this.rand(1, Math.max(Math.abs(correct) + 5, 10));
        var variant = this.pick([
          correct + offset,
          correct - offset,
          correct + 1,
          correct - 1,
          correct * 2,
          Math.round(correct / 2)
        ]);
        if (typeof correct === 'number' && variant > -9999 && variant < 9999) {
          if (opts.indexOf(variant) === -1) {
            opts.push(variant);
          }
        }
        attempts++;
      }
      q.options = this.shuffle(opts);
      q.type = 'choice';
    } else if (type === 'truefalse') {
      var isTrue = Math.random() > 0.4;
      if (isTrue) {
        q.text = q.text + ' = ' + q.answer;
        q.answer = true;
      } else {
        var delta = Math.max(Math.abs(q.answer) / 2 + 1, 3);
        var wrong = q.answer + this.rand(1, Math.floor(delta)) * (Math.random() > 0.5 ? 1 : -1);
        q.text = q.text + ' = ' + wrong;
        q.answer = false;
      }
      q.type = 'truefalse';
    } else {
      q.type = 'input';
    }
    return q;
  },

  _genHint: function(q) {
    if (q.hint) return q.hint;
    if (q.type === 'find_wrong') return 'Один пример решён неверно — найди его';
    if (q.type === 'order') return 'Расставь числа от самого маленького до самого большого';
    if (q.type === 'fill') return 'Найди закономерность и вставь пропущенное число';
    if (q.type === 'truefalse') return 'Проверь, правильный ли ответ';
    if (q.type === 'sign') return 'Какой знак сравнения между выражениями?';
    if (q.type === 'reverse') return 'Вычисли каждый пример и сравни с ответом';
    if (q.type === 'closest') return 'Какое число самое близкое к указанному?';
    var text = q.text || '';
    if (text.indexOf('+') !== -1) return 'Сложи два числа';
    if (text.indexOf('−') !== -1) return 'Вычти второе число из первого';
    if (text.indexOf('×') !== -1) return 'Умножь числа';
    if (text.indexOf('÷') !== -1) return 'Раздели первое число на второе';
    if (text.indexOf('__') !== -1) return 'Какой знак между числами?';
    if (text.indexOf('%') !== -1) return 'Процент от числа — раздели на 100 и умножь';
    if (text.indexOf('∫') !== -1) return 'Найди первообразную и подставь границы';
    if (text.indexOf('^') !== -1) return 'Возведи число в степень';
    if (text.indexOf('x') !== -1) return 'Реши уравнение, найди x';
    if (text.indexOf('Площадь') !== -1) return 'Умножь длину на ширину';
    if (text.indexOf('Объём') !== -1) return 'Возведи сторону в куб';
    if (text.indexOf('sin') !== -1 || text.indexOf('cos') !== -1 || text.indexOf('tg') !== -1) return 'Вспомни таблицу тригонометрии';
    if (text.indexOf('/') !== -1) return 'Приведи дроби к общему знаменателю';
    if (text.indexOf(':') !== -1) return 'Используй свойство пропорции';
    if (text.indexOf('Среднее') !== -1) return 'Сложи все числа и раздели на их количество';
    if (text.indexOf('Вероятность') !== -1) return 'Раздели благоприятные исходы на все';
    if (text.indexOf('Четверть') !== -1) return 'Определи знаки координат';
    if (text.indexOf('Сколько') !== -1) return 'Посчитай количество';
    if (text.indexOf('Упрости') !== -1) return 'Сложи коэффициенты';
    return 'Подумай внимательно';
  },

  _genBasic: function(minA, maxA, ops, minB, maxB) {
    var a = this.rand(minA, maxA);
    var op = this.pick(ops);
    var b, answer;

    if (op === '+') {
      b = this.rand(minA, maxA);
      answer = a + b;
    } else if (op === '-') {
      b = this.rand(minA, a);
      answer = a - b;
    } else if (op === '*') {
      b = this.rand(minB || 2, maxB || 9);
      answer = a * b;
    } else if (op === '/') {
      b = this.rand(minB || 2, maxB || 9);
      var dividend = a * b;
      answer = a;
      a = dividend;
    }

    var sym = { '+': '+', '-': '−', '*': '×', '/': '÷' }[op] || op;
    return { text: a + ' ' + sym + ' ' + b, answer: answer };
  },

  _genAddSub1to20: function() { return this._genBasic(1, 20, ['+', '-']); },
  _genAdd1to20: function() { return this._genBasic(1, 20, ['+']); },
  _genSub1to20: function() { return this._genBasic(1, 20, ['-']); },
  _genCompare1to20: function() { return this._genCompare(1, 20); },
  _genAdd1to100: function() { return this._genBasic(1, 100, ['+']); },
  _genSub1to100: function() { return this._genBasic(1, 100, ['-']); },
  _genMul2to9: function() { return this._genBasic(2, 9, ['*'], 2, 9); },
  _genDiv2to81: function() { return this._genBasic(2, 9, ['/'], 2, 9); },
  _genCompare1to100: function() { return this._genCompare(1, 100); },
  _genAddSub1to500: function() { return this._genBasic(1, 500, ['+', '-']); },

  _genFindWrong: function(minA, maxA, ops, minB, maxB) {
    var corrects = [];
    for (var i = 0; i < 3; i++) {
      corrects.push(this._genBasic(minA, maxA, ops, minB, maxB));
    }
    var wrong = this._genBasic(minA, maxA, ops, minB, maxB);
    var offset = this.rand(2, Math.max(5, Math.abs(wrong.answer / 2) + 1));
    var wrongAns = wrong.answer + (Math.random() > 0.5 ? offset : -offset);
    if (wrongAns === wrong.answer) wrongAns = wrong.answer + 1;

    var sym = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    var opSym = sym[ops[0]] || ops[0];
    var opts = [];
    for (var i = 0; i < 3; i++) {
      opts.push(corrects[i].text + ' = ' + corrects[i].answer);
    }
    var wrongExpr = wrong.text + ' = ' + wrongAns;
    var wrongIdx = this.rand(0, 3);
    opts.splice(wrongIdx, 0, wrongExpr);

    return {
      type: 'find_wrong',
      text: 'Найди неверный ответ:',
      options: this.shuffle(opts),
      answer: opts.indexOf(wrongExpr)
    };
  },

  _genOrder: function(minVal, maxVal, count) {
    count = count || this.rand(4, 5);
    var items = [];
    for (var i = 0; i < count; i++) {
      items.push(this.rand(minVal, maxVal));
    }
    var sorted = items.slice().sort(function(a, b) { return a - b; });
    return {
      type: 'order',
      text: 'Расставь по порядку (от меньшего к большему):',
      items: sorted,
      answer: sorted.slice()
    };
  },

  _genFill: function(maxVal) {
    var step = this.rand(2, maxVal > 50 ? 10 : 5);
    var start = this.rand(1, maxVal > 50 ? 20 : 10);
    var vals = [];
    for (var i = 0; i < 4; i++) {
      vals.push(start + i * step);
    }
    var missingIdx = this.rand(0, 3);
    var answer = vals[missingIdx];
    var text = vals.map(function(v, idx) { return idx === missingIdx ? '___' : v; }).join(', ');
    var opts = [answer];
    while (opts.length < 4) {
      var d = this.rand(1, Math.max(step, 3)) * (Math.random() > 0.5 ? 1 : -1);
      var alt = answer + d;
      if (alt > 0 && opts.indexOf(alt) === -1) opts.push(alt);
    }
    return {
      type: 'fill',
      text: 'Заполни пропуск: ' + text,
      answer: answer,
      options: this.shuffle(opts)
    };
  },

  _genTrueFalse: function(minA, maxA, ops, minB, maxB) {
    var q = this._genBasic(minA, maxA, ops, minB, maxB);
    var isCorrect = Math.random() > 0.4;
    var displayAnswer;
    if (isCorrect) {
      displayAnswer = q.answer;
    } else {
      var delta = Math.max(Math.abs(q.answer) / 3 + 1, 2);
      displayAnswer = q.answer + this.rand(1, Math.floor(delta)) * (Math.random() > 0.5 ? 1 : -1);
    }
    var sym = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    var opSym = sym[ops[0]] || ops[0];
    return {
      type: 'truefalse',
      text: q.text + ' = ' + displayAnswer,
      answer: isCorrect,
      options: [true, false]
    };
  },

  _genSign: function(minA, maxA, ops, minB, maxB) {
    var q1 = this._genBasic(minA, maxA, ops, minB, maxB);
    var q2 = this._genBasic(minA, maxA, ops, minB, maxB);
    var correct;
    if (q1.answer > q2.answer) correct = '>';
    else if (q1.answer < q2.answer) correct = '<';
    else correct = '=';
    return {
      type: 'sign',
      text: q1.text + ' __ ' + q2.text,
      answer: correct,
      options: ['>', '<', '=']
    };
  },

  _genReverse: function(minA, maxA, ops, minB, maxB) {
    var correct = this._genBasic(minA, maxA, ops, minB, maxB);
    var opts = [correct.text];
    while (opts.length < 4) {
      var decoy = this._genBasic(minA, maxA, ops, minB, maxB);
      if (opts.indexOf(decoy.text) === -1) opts.push(decoy.text);
    }
    return {
      type: 'reverse',
      text: 'Какой пример даёт ответ ' + correct.answer + '?',
      options: this.shuffle(opts),
      answer: correct.text
    };
  },

  _genClosest: function(maxVal) {
    var target = this.rand(10, maxVal);
    var offsets = [0];
    while (offsets.length < 4) {
      var d = this.rand(1, Math.max(5, maxVal / 5)) * (Math.random() > 0.5 ? 1 : -1);
      var alt = target + d;
      if (alt > 0 && offsets.indexOf(d) === -1) offsets.push(d);
    }
    var opts = offsets.map(function(o) { return target + o; });
    return {
      type: 'closest',
      text: 'Какое число ближе всего к ' + target + '?',
      options: this.shuffle(opts),
      answer: target
    };
  },
  _genAddSub10to9999: function() { return this._genBasic(10, 9999, ['+', '-']); },
  _genMulDiv2to12: function() { return this._genBasic(2, 12, ['*', '/'], 2, 12); },
  _genNat5: function() { return this._genBasic(10, 1000, ['+', '-', '*'], 2, 20); },
  _genNat7: function() { return this._genBasic(10, 1000, ['+', '-', '*'], 2, 30); },

  _genCompare: function(min, max) {
    var a = this.rand(min, max);
    var b = this.rand(min, max);
    var correct;
    if (a > b) correct = '>';
    else if (a < b) correct = '<';
    else correct = '=';
    return {
      text: a + ' __ ' + b,
      answer: correct,
      type: 'choice',
      options: ['>', '<', '=']
    };
  },

  _genShapes: function() {
    var shapes = [
      { name: 'квадратов', emoji: '⬜', count: this.rand(2, 8) },
      { name: 'кругов', emoji: '⭕', count: this.rand(2, 8) },
      { name: 'треугольников', emoji: '🔺', count: this.rand(2, 8) }
    ];
    var s = this.pick(shapes);
    return { text: 'Сколько ' + s.name + '? ' + s.emoji.repeat(s.count), answer: s.count };
  },

  _genSimpleFraction: function() {
    var a = this.rand(1, 4);
    var b = this.rand(2, 8);
    var c = this.rand(1, 4);
    var d = this.rand(2, 8);
    var val1 = a / b;
    var val2 = c / d;
    var correct = val1 > val2 ? '>' : '<';
    return {
      text: a + '/' + b + ' __ ' + c + '/' + d,
      answer: correct,
      type: 'choice',
      options: ['>', '<', '=']
    };
  },

  _genFractionCompare: function() {
    return this._genSimpleFraction();
  },

  _genDecimalAddSub: function() {
    var a = this.rand(1, 99) / 10;
    var b = this.rand(1, 99) / 10;
    var op = this.pick(['+', '-']);
    var answer;
    if (op === '+') answer = +(a + b).toFixed(1);
    else answer = +(a - b).toFixed(1);
    return { text: a + ' ' + op + ' ' + b, answer: answer };
  },

  _genFractionArith: function() {
    var a = this.rand(1, 8);
    var b = this.rand(2, 9);
    var c = this.rand(1, 8);
    var d = this.rand(2, 9);
    var op = this.pick(['+', '-']);
    var numA = a * d;
    var numB = c * b;
    var den = b * d;
    var resNum;
    if (op === '+') resNum = numA + numB;
    else resNum = numA - numB;

    var gcd = function(x, y) {
      if (y === 0) return x;
      return gcd(y, x % y);
    };
    var g = gcd(Math.abs(resNum), den);
    var simpNum = resNum / g;
    var simpDen = den / g;
    var answer;
    if (simpDen === 1) answer = simpNum;
    else answer = +(simpNum / simpDen).toFixed(2);

    var sym = op === '+' ? '+' : '−';
    return {
      text: a + '/' + b + ' ' + sym + ' ' + c + '/' + d,
      answer: answer,
      full: simpDen === 1 ? '' + simpNum : simpNum + '/' + simpDen
    };
  },

  _genPercent: function() {
    var type = this.rand(0, 2);
    if (type === 0) {
      var p = this.rand(5, 75);
      var n = this.rand(10, 50) * 10;
      return { text: 'Найди ' + p + '% от ' + n, answer: Math.round((p / 100) * n) };
    } else if (type === 1) {
      var n = this.rand(1, 20) * 5;
      var p = this.rand(5, 95);
      var part = Math.round((p / 100) * n);
      return { text: 'Сколько % составляет ' + part + ' от ' + n + '?', answer: p };
    } else {
      var part = this.rand(1, 50) * 2;
      var p = this.rand(10, 50) * 2;
      var whole = Math.round((part * 100) / p);
      return { text: 'Найди число, если ' + p + '% его = ' + part, answer: whole };
    }
  },

  _genArea: function() {
    var a = this.rand(2, 15);
    var b = this.rand(2, 15);
    if (Math.random() > 0.5) {
      return { text: 'Площадь квадрата со стороной ' + a, answer: a * a };
    } else {
      return { text: 'Площадь прямоугольника ' + a + '×' + b, answer: a * b };
    }
  },

  _genRatio: function() {
    var a = this.rand(1, 8);
    var b = this.rand(2, 8);
    var k = this.rand(2, 6);
    return { text: a + ':' + b + ' = ' + (b * k) + ':x. Найди x', answer: b * k };
  },

  _genNegatives: function() {
    var a = this.rand(-15, -1);
    var b = this.rand(1, 15);
    var op = this.pick(['+', '-']);
    var answer;
    if (op === '+') answer = a + b;
    else answer = a - b;
    return { text: a + ' ' + op + ' ' + b, answer: answer };
  },

  _genCoords: function() {
    var x = this.rand(-5, 5);
    var y = this.rand(-5, 5);
    var answer;
    if (x > 0 && y > 0) answer = 'I';
    else if (x < 0 && y > 0) answer = 'II';
    else if (x < 0 && y < 0) answer = 'III';
    else answer = 'IV';
    return {
      text: 'Точка A(' + x + ';' + y + '). Четверть?',
      answer: answer,
      type: 'choice',
      options: ['I', 'II', 'III', 'IV']
    };
  },

  _genSimpleEquation: function() {
    var x = this.rand(1, 20);
    var a = this.rand(2, 10);
    var op = this.pick(['+', '-', '*']);
    if (op === '+') return { text: 'x + ' + a + ' = ' + (x + a), answer: x };
    else if (op === '-') return { text: 'x − ' + a + ' = ' + (x - a), answer: x };
    else return { text: a + 'x = ' + (a * x), answer: x };
  },

  _genLinearEquation: function() {
    var x = this.rand(1, 15);
    var a = this.rand(1, 8);
    var b = this.rand(-10, 10);
    var c = a * x + b;
    var sign = b >= 0 ? '+' : '−';
    return { text: a + 'x ' + sign + ' ' + Math.abs(b) + ' = ' + c, answer: x };
  },

  _genPower: function() {
    var base = this.rand(2, 9);
    var exp = this.rand(2, 4);
    return { text: base + '<sup>' + exp + '</sup> = ?', answer: Math.pow(base, exp) };
  },

  _genTriangleArea: function() {
    var a = this.rand(3, 12);
    var h = this.rand(3, 12);
    return { text: 'Площадь треугольника с основанием ' + a + ' и высотой ' + h, answer: (a * h) / 2 };
  },

  _genTriangleAngle: function() {
    var a = this.rand(30, 80);
    var maxB = a > 50 ? 60 : 80;
    var b = this.rand(30, maxB);
    var c = 180 - a - b;
    if (c <= 0) return this._genTriangleAngle();
    return { text: 'Два угла: ' + a + '° и ' + b + '°. Найди третий', answer: c };
  },

  _genCircle: function() {
    var r = this.rand(2, 10);
    return { text: 'Длина окружности r=' + r + ' (π≈3.14)', answer: Math.round(2 * 3.14 * r) };
  },

  _genSimplify: function() {
    var a = this.rand(2, 8);
    var b = this.rand(2, 8);
    var x = this.rand(1, 5);
    return { text: 'Упрости: ' + a + 'x + ' + b + 'x = ?', answer: a * x + b * x };
  },

  _genFunction: function() {
    var x = this.rand(1, 5);
    var k = this.rand(2, 5);
    var b = this.rand(-5, 5);
    var sign = b >= 0 ? '+' : '';
    return { text: 'y = ' + k + 'x' + sign + b + '. Найди y при x=' + x, answer: k * x + b };
  },

  _genVolume: function() {
    var a = this.rand(2, 8);
    return { text: 'Объём куба со стороной ' + a, answer: a * a * a };
  },

  _genStats: function() {
    var vals = [
      this.rand(1, 10),
      this.rand(1, 10),
      this.rand(1, 10),
      this.rand(1, 10),
      this.rand(1, 10)
    ];
    var sum = 0;
    for (var i = 0; i < vals.length; i++) sum += vals[i];
    var avg = sum / vals.length;
    return {
      text: 'Среднее: ' + vals.join(', '),
      answer: Number.isInteger(avg) ? avg : +avg.toFixed(1)
    };
  },

  _genInequality: function() {
    var x = this.rand(1, 10);
    var a = this.rand(2, 10);
    return { text: a + 'x > ' + (a * x - 1) + '. Наименьшее целое x?', answer: x };
  },

  _genSystem: function() {
    var x = this.rand(1, 5);
    var y = this.rand(1, 5);
    var a = this.rand(2, 5);
    var b = this.rand(2, 5);
    var c = this.rand(2, 5);
    var d = this.rand(2, 5);
    var e1 = a * x + b * y;
    var e2 = c * x - d * y;
    return {
      text: a + 'x+' + b + 'y=' + e1 + ', ' + c + 'x−' + d + 'y=' + e2 + '. x=?',
      answer: x
    };
  },

  _genPolynomial: function() {
    var a = this.rand(1, 5);
    var b = this.rand(1, 5);
    var x = this.rand(1, 3);
    return { text: 'Найди ' + a + 'x+' + b + ' при x=' + x, answer: a * x + b };
  },

  _genTrig: function() {
    var angles = [
      { deg: 0, sin: 0, cos: 1, tg: 0 },
      { deg: 30, sin: 0.5, cos: 0.87, tg: 0.58 },
      { deg: 45, sin: 0.71, cos: 0.71, tg: 1 },
      { deg: 60, sin: 0.87, cos: 0.5, tg: 1.73 }
    ];
    var a = this.pick(angles);
    var func = this.pick(['sin', 'cos', 'tg']);
    var answer;
    if (func === 'sin') answer = a.sin;
    else if (func === 'cos') answer = a.cos;
    else answer = a.tg;
    return { text: func + '(' + a.deg + '°)', answer: +answer.toFixed(2) };
  },

  _genDerivative: function() {
    var a = this.rand(2, 5);
    var n = this.rand(2, 4);
    var x = this.rand(1, 3);
    return { text: 'f(x)=' + a + 'x^' + n + ' в x=' + x, answer: a * n * Math.pow(x, n - 1) };
  },

  _genIntegral: function() {
    var a = this.rand(1, 3);
    var n = this.rand(1, 3);
    var lo = this.rand(0, 1);
    var hi = this.rand(2, 4);
    var F = function(x) { return a * Math.pow(x, n + 1) / (n + 1); };
    var val = Math.round((F(hi) - F(lo)) * 100) / 100;
    return { text: '∫' + a + 'x^' + n + ' от ' + lo + ' до ' + hi, answer: val };
  },

  _genProbability: function() {
    var total = this.rand(4, 10);
    var favorable = this.rand(1, total - 1);
    var answer = +(favorable / total).toFixed(2);
    return {
      text: total + ' шаров, ' + favorable + ' красных. Вероятность красного?',
      answer: answer
    };
  },

  genBossQuestion: function(difficulty) {
    var generators = [
      function() {
        var a = this.rand(10, 50) * (this.pick([1, -1]));
        var b = this.rand(10, 50) * (this.pick([1, -1]));
        var x = this.rand(2, 10);
        var sign = b >= 0 ? '+' : '−';
        return { text: a + 'x ' + sign + ' ' + Math.abs(b) + ' = ' + (a * x + b), answer: x };
      },
      function() {
        var p = this.rand(10, 80);
        var n = this.rand(20, 100) * 5;
        return { text: 'Найди ' + p + '% от ' + n, answer: Math.round((p / 100) * n) };
      },
      function() {
        var a = this.rand(2, 7);
        var b = this.rand(3, 8);
        var k = this.rand(2, 4);
        return { text: 'Сократи ' + (a * b) + '/' + (b * k) + ' (числитель)', answer: a };
      },
      function() {
        var a = this.rand(3, 12);
        var h = this.rand(4, 15);
        return { text: 'Площадь треугольника ' + a + '×' + h, answer: 0.5 * a * h };
      },
      function() {
        var b = this.rand(3, 7);
        var e = this.rand(3, 4);
        return { text: b + '^' + e, answer: Math.pow(b, e) };
      }
    ];

    var gen = this.pick(generators);
    var q = gen.call(this);
    var d = difficulty > 3 ? 4 : difficulty;
    return this._wrapQuestion(q, d);
  }
};
