var MathQuest = window.MathQuest || {};

MathQuest.ACHIEVEMENTS = [
  { id: 'first', name: 'Первый шаг', desc: 'Решить первую задачу', icon: '🌟', req: { type: 'solved', value: 1 }, reward: 50 },
  { id: 's100', name: 'Решатель', desc: 'Решить 100 задач', icon: '💪', req: { type: 'solved', value: 100 }, reward: 200 },
  { id: 's500', name: 'Эксперт', desc: 'Решить 500 задач', icon: '🧠', req: { type: 'solved', value: 500 }, reward: 500 },
  { id: 's1k', name: 'Мастер математики', desc: 'Решить 1000 задач', icon: '👑', req: { type: 'solved', value: 1000 }, reward: 1000 },
  { id: 'st7', name: 'Неделя', desc: 'Серия 7 дней', icon: '🔥', req: { type: 'streak', value: 7 }, reward: 150 },
  { id: 'st30', name: 'Месяц', desc: 'Серия 30 дней', icon: '🔥', req: { type: 'streak', value: 30 }, reward: 500 },
  { id: 'st100', name: 'Марафон', desc: 'Серия 100 дней', icon: '💎', req: { type: 'streak', value: 100 }, reward: 2000 },
  { id: 'perf', name: 'Идеальная тема', desc: 'Пройди тему без ошибок', icon: '✨', req: { type: 'perf', value: 1 }, reward: 300 },
  { id: 'maxl', name: 'Высший уровень', desc: 'Достичь 50 уровня', icon: '🏅', req: { type: 'lvl', value: 50 }, reward: 1000 },
  { id: 'cls', name: 'Выпускник', desc: 'Пройди весь класс', icon: '🎓', req: { type: 'class', value: 1 }, reward: 500 },
  { id: 'boss', name: 'Охотник на боссов', desc: 'Победить 5 боссов', icon: '⚔️', req: { type: 'boss', value: 5 }, reward: 400 },
  { id: 'rich', name: 'Богач', desc: 'Накопить 1000 монет', icon: '💰', req: { type: 'coins', value: 1000 }, reward: 200 },
  { id: 'perf5', name: 'Перфекционист', desc: '100% ответов в 5 уровнях', icon: '🎯', req: { type: 'perf', value: 5 }, reward: 350 }
];

MathQuest.SHOP = {
  avatars: [
    { id: 'a1', name: 'Волшебник', icon: '🧙', price: 100 },
    { id: 'a2', name: 'Рыцарь', icon: '🦸', price: 150 },
    { id: 'a3', name: 'Космонавт', icon: '🧑‍🚀', price: 200 },
    { id: 'a4', name: 'Пират', icon: '🏴‍☠️', price: 250 },
    { id: 'a5', name: 'Робот', icon: '🤖', price: 300 },
    { id: 'a6', name: 'Принцесса', icon: '👸', price: 200 },
    { id: 'a7', name: 'Дракон', icon: '🐉', price: 500 },
    { id: 'a8', name: 'Маг', icon: '🧝', price: 350 }
  ],
  frames: [
    { id: 'f1', name: 'Золотая рамка', icon: '🟡', price: 200 },
    { id: 'f2', name: 'Серебряная', icon: '⚪', price: 100 },
    { id: 'f3', name: 'Радужная', icon: '🌈', price: 500 },
    { id: 'f4', name: 'Огненная', icon: '🔥', price: 300 }
  ],
  themes: [
    { id: 't1', name: 'Тёмная тема', icon: '🌙', price: 200 },
    { id: 't2', name: 'Космос', icon: '🌌', price: 400 },
    { id: 't3', name: 'Природа', icon: '🌿', price: 150 },
    { id: 't4', name: 'Закат', icon: '🌅', price: 250 }
  ],
  hearts: [
    { id: 'h1', name: '5 сердец', icon: '❤️', price: 100, type: 'refill' },
    { id: 'h2', name: 'Макс. 10 сердец', icon: '💖', price: 500, type: 'maxUp' }
  ]
};

MathQuest.TOPICS = {
  1: [
    { id: 'num1', name: 'Числа до 20', levels: 10 },
    { id: 'add1', name: 'Сложение', levels: 10 },
    { id: 'sub1', name: 'Вычитание', levels: 10 },
    { id: 'cmp1', name: 'Сравнение чисел', levels: 8 },
    { id: 'shp1', name: 'Фигуры', levels: 8 }
  ],
  2: [
    { id: 'add2', name: 'Сложение', levels: 10 },
    { id: 'sub2', name: 'Вычитание', levels: 10 },
    { id: 'mul2', name: 'Умножение', levels: 8 },
    { id: 'div2', name: 'Деление', levels: 8 },
    { id: 'cmp2', name: 'Сравнение', levels: 6 }
  ],
  3: [
    { id: 'mul3', name: 'Таблица умножения', levels: 12 },
    { id: 'div3', name: 'Деление', levels: 10 },
    { id: 'as3', name: 'Сложение и вычитание', levels: 10 },
    { id: 'fr3', name: 'Простые дроби', levels: 8 }
  ],
  4: [
    { id: 'num4', name: 'Многозначные числа', levels: 8 },
    { id: 'ar4', name: 'Арифметика', levels: 10 },
    { id: 'fr4', name: 'Дроби', levels: 10 },
    { id: 'ar4', name: 'Площадь и периметр', levels: 8 },
    { id: 'dc4', name: 'Десятичные дроби', levels: 8 }
  ],
  5: [
    { id: 'nat5', name: 'Натуральные числа', levels: 8 },
    { id: 'fr5', name: 'Дроби', levels: 10 },
    { id: 'dc5', name: 'Десятичные дроби', levels: 10 },
    { id: 'pc5', name: 'Проценты', levels: 8 },
    { id: 'ge5', name: 'Геометрия', levels: 8 }
  ],
  6: [
    { id: 'ra6', name: 'Пропорции', levels: 8 },
    { id: 'ng6', name: 'Отрицательные числа', levels: 8 },
    { id: 'cr6', name: 'Координаты', levels: 8 },
    { id: 'eq6', name: 'Уравнения', levels: 8 },
    { id: 'fr6', name: 'Дроби', levels: 10 }
  ],
  7: [
    { id: 'nat7', name: 'Натуральные числа', levels: 8 },
    { id: 'fr7', name: 'Дроби', levels: 10 },
    { id: 'pc7', name: 'Проценты', levels: 10 },
    { id: 'ra7', name: 'Пропорции', levels: 8 },
    { id: 'eq7', name: 'Линейные уравнения', levels: 10 },
    { id: 'pw7', name: 'Степени', levels: 6 },
    { id: 'ge7', name: 'Геометрия', levels: 8 },
    { id: 'cr7', name: 'Координатная плоскость', levels: 6 },
    { id: 'tr7', name: 'Треугольники', levels: 6 },
    { id: 'ci7', name: 'Окружность', levels: 6 }
  ],
  8: [
    { id: 'al8', name: 'Алгебраические выражения', levels: 8 },
    { id: 'eq8', name: 'Уравнения', levels: 10 },
    { id: 'fn8', name: 'Функции', levels: 8 },
    { id: 'ge8', name: 'Геометрия', levels: 8 },
    { id: 'st8', name: 'Статистика', levels: 6 },
    { id: 'ra8', name: 'Рациональные числа', levels: 8 }
  ],
  9: [
    { id: 'in9', name: 'Неравенства', levels: 8 },
    { id: 'sy9', name: 'Системы уравнений', levels: 10 },
    { id: 'po9', name: 'Многочлены', levels: 8 },
    { id: 'ge9', name: 'Геометрия', levels: 10 },
    { id: 'tr9', name: 'Тригонометрия', levels: 6 }
  ],
  10: [
    { id: 'fn10', name: 'Функции и графики', levels: 10 },
    { id: 'tr10', name: 'Тригонометрия', levels: 10 },
    { id: 'de10', name: 'Производные', levels: 8 },
    { id: 'ge10', name: 'Стереометрия', levels: 8 },
    { id: 'pr10', name: 'Вероятность', levels: 6 }
  ],
  11: [
    { id: 'de11', name: 'Производные', levels: 10 },
    { id: 'in11', name: 'Интегралы', levels: 8 },
    { id: 'eq11', name: 'Уравнения и неравенства', levels: 10 },
    { id: 'ge11', name: 'Геометрия', levels: 8 },
    { id: 'pr11', name: 'Теория вероятности', levels: 6 }
  ]
};

MathQuest.CLASS_NAMES = ['', '1 Класс', '2 Класс', '3 Класс', '4 Класс', '5 Класс', '6 Класс', '7 Класс', '8 Класс', '9 Класс', '10 Класс', '11 Класс'];

MathQuest.BOSS_ICONS = ['👾', '🐉', '👹', '🦖', '👺', '🤖', '👽', '🦑'];
MathQuest.BOSS_NAMES = ['Математический Монстр', 'Калькулятор Зла', 'Дробный Демон', 'Король Уравнений', 'Геометрический Гигант', 'Процентный Пожиратель', 'Логарифмический Левиафан', 'Интегральный Исполин'];
