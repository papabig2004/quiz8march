const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Вопросы из вашего файла
const questions = [
    {
        id: 1,
        question: "Какой макияж визуально увеличивает глаза?",
        options: [
            "A) Тёмная подводка по слизистой нижнего века",
            "B) Светлый карандаш по слизистой и акцент на ресницы",
            "C) Чёткая тёмная линия по всему контуру",
            "D) Матовые тёмные тени без растушёвки"
        ],
        correct: "B"
    },
    {
        id: 2,
        question: "Какой крой юбки чаще всего считается самым универсальным для разных типов фигуры?",
        options: [
            "A) Мини-юбка прямого кроя",
            "B) Юбка-карандаш с заниженной талией",
            "C) Юбка А-силуэта",
            "D) Юбка с баской"
        ],
        correct: "C"
    },
    {
        id: 3,
        question: "В классическом деловом стиле какую длину должен иметь галстук?",
        options: [
            "A) До середины груди",
            "B) Чуть ниже ремня",
            "C) До пряжки ремня",
            "D) Ниже линии бёдер"
        ],
        correct: "C"
    },
    {
        id: 4,
        question: "Какое древнее государство первой создало письменность на глиняных табличках?",
        options: [
            "A) Древний Египет",
            "B) Месопотамия (Шумеры, около 3200 до н.э.)",
            "C) Китай",
            "D) Индия"
        ],
        correct: "B"
    },
    {
        id: 5,
        question: "Какая страна имеет наибольшее количество островов в мире?",
        options: [
            "A) Филиппины",
            "B) Швеция (около 267 570 островов!)",
            "C) Индонезия",
            "D) Япония"
        ],
        correct: "B"
    },
    {
        id: 6,
        question: "В каком году была принята Конвенция о ликвидации всех форм дискриминации в отношении женщин?",
        options: [
            "A) 1979 (ООН приняла CEDAW)",
            "B) 1945 (после Второй мировой)",
            "C) 1966 (в Пакте о гражданских правах)",
            "D) 1995 (на конференции в Пекине)"
        ],
        correct: "A"
    },
    {
        id: 7,
        question: "Кто из этих женщин получил больше всего премий «Грэмми» в истории?",
        options: [
            "A) Тейлор Свифт",
            "B) Адель",
            "C) Бейонсе",
            "D) Мадонна"
        ],
        correct: "C"
    },
    {
        id: 8,
        question: "Что такое 'парадокс Ферми'?",
        options: [
            "A) Вопрос о молчании внеземных цивилизаций",
            "B) Теория о параллельных вселенных",
            "C) Парадокс в квантовой механике",
            "D) Гипотеза о тёмной материи"
        ],
        correct: "A"
    },
    {
        id: 9,
        question: "Сколько вкусов различает человеческий язык?",
        options: [
            "A) 5 (сладкий, солёный, кислый, горький, умами)",
            "B) 4 (без умами)",
            "C) 6 (плюс острый)",
            "D) 7 (с 'вкусом приключений')"
        ],
        correct: "A"
    },
    {
        id: 10,
        question: "Кто является рекордсменом по количеству голов в истории чемпионатов мира по футболу?",
        options: [
            "A) Лионель Месси",
            "B) Пеле",
            "C) Мирослав Клозе",
            "D) Криштиану Роналду"
        ],
        correct: "C"
    },
    {
        id: 11,
        question: "Какая женщина получила две Нобелевские премии в разных научных областях?",
        options: [
            "A) Розалинд Франклин",
            "B) Мария Кюри",
            "C) Маргарет Мид",
            "D) Симона де Бовуар"
        ],
        correct: "B"
    },
    {
        id: 12,
        question: "Какой гормон чаще всего называют «гормоном стресса»?",
        options: [
            "A) Инсулин",
            "B) Адреналин",
            "C) Кортизол",
            "D) Серотонин"
        ],
        correct: "C"
    },
    {
        id: 13,
        question: "Кому принадлежит высказывание «Я знаю, что ничего не знаю»?",
        options: [
            "A) Платон",
            "B) Аристотель",
            "C) Сократ",
            "D) Сенека"
        ],
        correct: "C"
    },
    {
        id: 14,
        question: "Какова стандартная длина проволоки на бутылке шампанского?",
        options: [
            "A) 42 см",
            "B) 52 см",
            "C) 58 см",
            "D) 48 см"
        ],
        correct: "B"
    },
    {
        id: 15,
        question: "Что такое клиренс автомобиля?",
        options: [
            "A) Расстояние между центрами колёс одной оси",
            "B) Расстояние до самой низкой неподрессоренной точки",
            "C) Минимальное расстояние до самой низкой точки автомобиля в снаряжённом состоянии",
            "D) Разница между высотой кузова и диаметром колёс"
        ],
        correct: "C"
    },
    {
        id: 16,
        question: "Какой химический элемент назван в честь скандинавской богини красоты?",
        options: [
            "A) Торий",
            "B) Ванадий",
            "C) Кобальт",
            "D) Никель"
        ],
        correct: "B"
    },
    {
        id: 17,
        question: "Какой орган человеческого тела способен к регенерации?",
        options: [
            "A) Сердце",
            "B) Печень",
            "C) Легкие",
            "D) Селезенка"
        ],
        correct: "B"
    },
    {
        id: 18,
        question: "Какой ингредиент в тональном креме отвечает за матовый финиш?",
        options: [
            "A) Увлажняющие масла",
            "B) Отражающие пигменты",
            "C) Пудровые частицы",
            "D) Силиконовая основа"
        ],
        correct: "C"
    },
    {
        id: 19,
        question: "Как называлось движение за избирательные права женщин в начале XX века?",
        options: [
            "A) Аболиционизм",
            "B) Суфражизм",
            "C) Сепаратизм",
            "D) Эмансипация"
        ],
        correct: "B"
    },
    {
        id: 20,
        question: "Как называется устройство для принудительной подачи воздуха в цилиндры под давлением?",
        options: [
            "A) Коленвал",
            "B) Турбокомпрессор",
            "C) Интеркулер",
            "D) Воздушный фильтр"
        ],
        correct: "B"
    },
    {
        id: 21,
        question: "Какая итальянская марка прославилась благодаря туфлям-лодочкам с красной подошвой?",
        options: [
            "A) Gucci",
            "B) Prada",
            "C) Salvatore Ferragamo",
            "D) Christian Louboutin"
        ],
        correct: "D"
    },
    {
        id: 22,
        question: "Какое небесное тело официально считается самым ярким на ночном небе после Луны?",
        options: [
            "A) Марс",
            "B) Полярная звезда",
            "C) Венера",
            "D) МКС"
        ],
        correct: "C"
    },
    {
        id: 23,
        question: "Как в боксе называется удар снизу, наносимый согнутой рукой?",
        options: [
            "A) Джеб",
            "B) Хук",
            "C) Апперкот",
            "D) Свинг"
        ],
        correct: "C"
    },
    {
        id: 24,
        question: "Какой модельер ввел в моду «маленькое черное платье»?",
        options: [
            "A) Кристиан Диор",
            "B) Коко Шанель",
            "C) Ив Сен-Лоран",
            "D) Юбер Живанши"
        ],
        correct: "B"
    },
    {
        id: 25,
        question: "Как называется боязнь скопления людей или большого открытого пространства?",
        options: [
            "A) Клаустрофобия",
            "B) Социофобия",
            "C) Агорафобия",
            "D) Акрофобия"
        ],
        correct: "C"
    },
    {
        id: 26,
        question: "Какой витамин чаще всего рекомендуют для здоровья кожи, волос и ногтей?",
        options: [
            "A) Витамин C",
            "B) Витамин D",
            "C) Биотин (витамин B7)",
            "D) Витамин K"
        ],
        correct: "C"
    },
    {
        id: 27,
        question: "Кто стала первой женщиной-премьер-министром в Европе?",
        options: [
            "A) Ангела Меркель",
            "B) Маргарет Тэтчер",
            "C) Голда Меир",
            "D) Сиримаво Бандаранаике"
        ],
        correct: "B"
    },
    {
        id: 28,
        question: "Какой газ составляет наибольшую часть атмосферы Земли?",
        options: [
            "A) Кислород",
            "B) Углекислый газ",
            "C) Азот",
            "D) Аргон"
        ],
        correct: "C"
    },
    {
        id: 29,
        question: "Кто написал роман «1984»?",
        options: [
            "A) Олдос Хаксли",
            "B) Джордж Оруэлл",
            "C) Рэй Брэдбери",
            "D) Герберт Уэллс"
        ],
        correct: "B"
    },
    {
        id: 30,
        question: "Как зовут альтер эго Железного человека?",
        options: [
            "A) Брюс Бэннер",
            "B) Стив Роджерс",
            "C) Тони Старк",
            "D) Питер Паркер"
        ],
        correct: "C"
    },
    {
        id: 31,
        question: "Какой аксессуар в XIX веке считался обязательным признаком женщины «с положением в обществе»?",
        options: [
            "A) Веер",
            "B) Шляпка",
            "C) Перчатки",
            "D) Зонтик от солнца"
        ],
        correct: "B"
    },
    {
        id: 32,
        question: "Какой вид спорта до 2012 года не допускал женщин на Олимпиаде?",
        options: [
            "A) Бокс",
            "B) Тяжелая атлетика",
            "C) Бобслей",
            "D) Прыжки с шестом"
        ],
        correct: "A"
    },
    {
        id: 33,
        question: "Какой косметический продукт создавался для защиты рабочих на скотобойнях?",
        options: [
            "A) Губная помада",
            "B) Вазелин",
            "C) Тональный крем",
            "D) Глицериновое мыло"
        ],
        correct: "B"
    },
    {
        id: 34,
        question: "Какое животное не различает красный и зеленый цвета?",
        options: [
            "A) Бык",
            "B) Собака",
            "C) Кошка",
            "D) Лошадь"
        ],
        correct: "A"
    },
    {
        id: 35,
        question: "Какую деталь костюма придумали для ношения пистолета?",
        options: [
            "A) Галстук",
            "B) Запонки",
            "C) Карманные часы",
            "D) Жилет"
        ],
        correct: "A"
    },
    {
        id: 36,
        question: "Как называется процедура оценки качества блюд до подачи?",
        options: [
            "A) Дегустация",
            "B) Бракераж",
            "C) Ревизия",
            "D) Инвентаризация"
        ],
        correct: "B"
    },
    {
        id: 37,
        question: "Какой цвет является символом Дня святого Патрика?",
        options: [
            "A) Оранжевый",
            "B) Зеленый",
            "C) Красный",
            "D) Белый"
        ],
        correct: "B"
    },
    {
        id: 38,
        question: "Как называется четырехмерный гиперкуб?",
        options: [
            "A) Фрактал",
            "B) Тессеракт",
            "C) Лемниската",
            "D) Тороид"
        ],
        correct: "B"
    },
    {
        id: 39,
        question: "Как правильно пишется шотландский виски?",
        options: [
            "A) Whiskey",
            "B) Whisky",
            "C) Wiesky",
            "D) Wyski"
        ],
        correct: "B"
    },
    {
        id: 40,
        question: "Какой аромат первым использовал синтетические альдегиды?",
        options: [
            "A) Shalimar",
            "B) Chanel №5",
            "C) Joy",
            "D) L'Air du Temps"
        ],
        correct: "B"
    }
];

let gameState = {
    currentQuestion: 0,
    isActive: false,
    timer: 20,
    players: {},
    answers: {},
    results: {}
};

io.on('connection', (socket) => {
    console.log('Новое подключение:', socket.id);

    socket.on('join', (role, name) => {
        socket.role = role;
        socket.join(role);
        
        if (role === 'player') {
            gameState.players[socket.id] = { 
                name: name || 'Аноним', 
                score: 0,
                id: socket.id
            };
            io.emit('players-update', Object.values(gameState.players));
        }
        
        socket.emit('init', { 
            role, 
            totalQuestions: questions.length,
            gameState: gameState.isActive 
        });
    });

    socket.on('start-game', () => {
        if (socket.role === 'admin') {
            gameState.currentQuestion = 0;
            gameState.isActive = true;
            gameState.answers = {};
            gameState.results = {};
            nextQuestion();
        }
    });

    socket.on('answer', (data) => {
        if (!gameState.isActive) return;
        
        const player = gameState.players[socket.id];
        if (player && !gameState.answers[socket.id]) {
            const question = questions[gameState.currentQuestion];
            const isCorrect = data.answer === question.correct;
            
            gameState.answers[socket.id] = {
                answer: data.answer,
                isCorrect: isCorrect,
                timestamp: Date.now()
            };
            
            if (isCorrect) {
                player.score += 1;
            }
            
            // Обновляем статистику для админа
            const totalAnswers = Object.keys(gameState.answers).length;
            const counts = { A: 0, B: 0, C: 0, D: 0 };
            Object.values(gameState.answers).forEach(a => counts[a.answer]++);
            
            io.to('admin').emit('stats-update', {
                total: totalAnswers,
                counts: counts,
                percentages: {
                    A: totalAnswers > 0 ? ((counts.A / totalAnswers) * 100).toFixed(1) : 0,
                    B: totalAnswers > 0 ? ((counts.B / totalAnswers) * 100).toFixed(1) : 0,
                    C: totalAnswers > 0 ? ((counts.C / totalAnswers) * 100).toFixed(1) : 0,
                    D: totalAnswers > 0 ? ((counts.D / totalAnswers) * 100).toFixed(1) : 0
                }
            });
            
            // Обновляем список игроков для всех
            io.emit('players-update', Object.values(gameState.players));
        }
    });

    socket.on('disconnect', () => {
        delete gameState.players[socket.id];
        io.emit('players-update', Object.values(gameState.players));
    });
});

function nextQuestion() {
    if (gameState.currentQuestion >= questions.length) {
        const winners = Object.values(gameState.players).sort((a, b) => b.score - a.score);
        io.emit('game-end', winners);
        gameState.isActive = false;
        return;
    }
    
    gameState.answers = {};
    const question = questions[gameState.currentQuestion];
    
    io.emit('new-question', {
        ...question,
        timer: 20,
        questionNumber: gameState.currentQuestion + 1,
        totalQuestions: questions.length
    });
    
    setTimeout(() => {
        gameState.currentQuestion++;
        nextQuestion();
    }, 20000);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});