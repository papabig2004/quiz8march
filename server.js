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
            "B) Месопотамия",
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
            "B) Швеция",
            "C) Индонезия",
            "D) Япония"
        ],
        correct: "B"
    },
    {
        id: 6,
        question: "В каком году была принята Конвенция о ликвидации всех форм дискриминации в отношении женщин?",
        options: [
            "A) 1979",
            "B) 1945",
            "C) 1966",
            "D) 1995"
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
        question: "Что такое \"парадокс Ферми\"?",
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
            "B) 4 (без умами, потому что это \"секретный ингредиент\")",
            "C) 6 (плюс острый, но это не вкус, а боль!)",
            "D) 7 (с \"вкусом приключений\" для гурманов)"
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
            "A) Расстояние между центрами колёс одной оси, влияющее на устойчивость автомобиля",
            "B) Минимальное расстояние от поверхности дороги до самой низкой неподрессоренной точки автомобиля (без учёта шин)",
            "C) Минимальное расстояние от поверхности дороги до самой низкой точки автомобиля в снаряжённом состоянии",
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
        question: "Какой орган человеческого тела способен к регенерации (восстанавливать утраченную часть)?",
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
        question: "Какая итальянская марка, основанная двумя братьями, прославилась благодаря своим туфлям-лодочкам с красной подошвой?",
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
            "D) Международная космическая станция"
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
            question: "Какой французский модельер ввел в женскую моду «маленькое черное платье» и сделал загар модным?",
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
            question: "Какой витамин чаще всего рекомендуют для поддержания здоровья кожи, волос и ногтей?",
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
                question: "Как зовут альтер эго Железного человека во вселенной Marvel?",
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
                question: "Какой аксессуар в XIX веке считался обязательным признаком женщины «с положением в обществе» и без него не выходили из дома?",
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
                question: "Какой вид спорта стал единственным на летних Олимпийских играх, куда долгое время (вплоть до 2012 года) не допускали женщин?",
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
                question: "Какой косметический продукт изначально создавался как средство для защиты от ветра и холода для рабочих на скотобойнях в Чикаго, а позже стал бестселлером среди женщин?",
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
                question: "Какое животное видит мир в черно-белых тонах и совершенно не различает красный и зеленый цвета?",
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
                    question: "Какую деталь мужского костюма изначально придумали не для красоты, а для практичности — чтобы пристегивать ее к камзолу и носить за ней пистолет?",
                    options: [
                    "A) Галстук",
                    "B) Запонки",
                    "C) Карманные часы на цепочке",
                    "D) Жилет"
                    ],
                    correct: "A"
                    },
                    {
                    id: 36,
                    question: "Как называется обязательная процедура оценки качества готовых блюд на предприятиях общественного питания, проводимая специальной комиссией до начала отпуска блюд потребителям?",
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
                    question: "Какой цвет является самым популярным и общепризнанным символом Дня святого Патрика?",
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
                    question: "Как в геометрии и теоретической физике называется четырехмерный гиперкуб?",
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
                        question: "Какой из приведенных ниже терминов соответствует правильному написанию шотландского виски в соответствии с международными стандартами и традициями?",
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
                        question: "Какой легендарный женский аромат, созданный в 1921 году Эрнестом Бо, стал первым в истории, в котором были использованы синтетические альдегиды, и до сих пор остается одним из самых узнаваемых в мире?",
                        options: [
                        "A) Shalimar (Guerlain)",
                        "B) Chanel №5",
                        "C) Joy (Jean Patou)",
                        "D) L'Air du Temps (Nina Ricci)"
                        ],
                        correct: "B"
                        }
    
];

// Состояние игры
let gameState = {
    currentQuestion: 0,
    isActive: false,
    isPaused: false,
    timer: 30,
    players: new Map(), // clientId -> { name, score, socketId, hasAnswered, lastAnswer }
    socketToClient: new Map(), // socketId -> clientId
    answers: {}, // socketId -> { answer, isCorrect, timestamp }
    questionStartTime: null,
    questionTimer: null,
    allAnsweredTimer: null,
    totalQuestions: questions.length
};

io.on('connection', (socket) => {
    console.log('Новое подключение:', socket.id);

    socket.on('join', (data) => {
        const { role, name, clientId } = data;
        console.log('Join:', { role, name, clientId, socketId: socket.id });
        
        socket.role = role;
        socket.join(role);
        
        if (role === 'player') {
            // Проверяем, есть ли уже игрок с таким clientId
            let player = null;
            for (let [cid, p] of gameState.players.entries()) {
                if (cid === clientId) {
                    player = p;
                    break;
                }
            }
            
            if (player) {
                // Обновляем socketId для существующего игрока
                const oldSocketId = player.socketId;
                gameState.socketToClient.delete(oldSocketId);
                
                player.socketId = socket.id;
                gameState.socketToClient.set(socket.id, clientId);
                
                console.log('Игрок переподключен:', clientId, name);
            } else {
                // Создаем нового игрока
                const newPlayer = {
                    clientId: clientId,
                    name: name || 'Аноним',
                    score: 0,
                    socketId: socket.id,
                    hasAnswered: false,
                    lastAnswer: null
                };
                
                gameState.players.set(clientId, newPlayer);
                gameState.socketToClient.set(socket.id, clientId);
                
                console.log('Новый игрок:', clientId, name);
            }
            
            // Отправляем обновленный список игроков
            sendPlayersUpdate();
        }
        
        // Отправляем текущее состояние
        socket.emit('init', { 
            role, 
            totalQuestions: gameState.totalQuestions,
            gameState: gameState.isActive,
            isPaused: gameState.isPaused
        });

        // Если игра активна, отправляем текущий вопрос
        if (gameState.isActive && !gameState.isPaused && questions[gameState.currentQuestion]) {
            const question = questions[gameState.currentQuestion];
            const timeLeft = Math.max(0, Math.ceil((gameState.questionStartTime + gameState.timer * 1000 - Date.now()) / 1000));
            
            socket.emit('current-question', {
                ...question,
                timer: timeLeft,
                questionNumber: gameState.currentQuestion + 1,
                totalQuestions: gameState.totalQuestions
            });

            // Отправляем текущую статистику
            sendStatsToAll();
        }

        // Если админ, отправляем ему статистику сразу
        if (role === 'admin') {
            sendStatsToAdmin();
        }
    });

    socket.on('start-game', () => {
        if (socket.role === 'admin') {
            console.log('Игра начата админом');
            
            gameState.currentQuestion = 0;
            gameState.isActive = true;
            gameState.isPaused = false;
            gameState.answers = {};
            
            // Сбрасываем состояние игроков
            for (let [clientId, player] of gameState.players.entries()) {
                player.hasAnswered = false;
                player.lastAnswer = null;
            }
            
            startQuestion();
        }
    });

    socket.on('next-question', () => {
        if (socket.role === 'admin') {
            console.log('Следующий вопрос');
            
            gameState.isPaused = false;
            gameState.currentQuestion++;
            gameState.answers = {};
            
            // Сбрасываем флаг ответа для всех игроков
            for (let [clientId, player] of gameState.players.entries()) {
                player.hasAnswered = false;
                player.lastAnswer = null;
            }
            
            startQuestion();
        }
    });

    socket.on('show-correct-answer', () => {
        if (socket.role === 'admin' && gameState.isPaused) {
            const question = questions[gameState.currentQuestion];
            io.emit('show-correct-answer', {
                correct: question.correct,
                options: question.options
            });
        }
    });

    socket.on('answer', (data) => {
        if (!gameState.isActive || gameState.isPaused) return;
        
        const clientId = gameState.socketToClient.get(socket.id);
        if (!clientId) return;
        
        const player = gameState.players.get(clientId);
        
        if (player && !player.hasAnswered) {
            const question = questions[gameState.currentQuestion];
            const isCorrect = data.answer === question.correct;
            
            player.hasAnswered = true;
            player.lastAnswer = data.answer;
            
            if (isCorrect) {
                player.score += 1;
            }
            
            // Сохраняем ответ
            gameState.answers[socket.id] = {
                answer: data.answer,
                isCorrect: isCorrect,
                timestamp: Date.now(),
                clientId: clientId
            };
            
            console.log(`Ответ от ${player.name}: ${data.answer} (${isCorrect ? '✅' : '❌'})`);
            
            // Рассчитываем и отправляем статистику
            sendStatsToAll();
            
            // Подтверждаем игроку, что ответ принят
            socket.emit('answer-accepted', {
                answer: data.answer,
                isCorrect: isCorrect
            });
            
            // Проверяем, все ли игроки ответили
            checkAllPlayersAnswered();
        } else {
            socket.emit('answer-rejected', { reason: 'already-answered' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Отключение:', socket.id);
        
        const clientId = gameState.socketToClient.get(socket.id);
        if (clientId) {
            const player = gameState.players.get(clientId);
            if (player) {
                player.socketId = null; // Отмечаем, что игрок офлайн
                console.log('Игрок отключился:', player.name);
            }
            gameState.socketToClient.delete(socket.id);
        }
        
        // Отправляем обновленный список игроков
        sendPlayersUpdate();
    });
});

function startQuestion() {
    if (gameState.currentQuestion >= gameState.totalQuestions) {
        const winners = Array.from(gameState.players.values())
            .sort((a, b) => b.score - a.score);
        io.emit('game-end', winners);
        gameState.isActive = false;
        return;
    }
    
    gameState.answers = {};
    gameState.questionStartTime = Date.now();
    
    const question = questions[gameState.currentQuestion];
    
    console.log(`Вопрос ${gameState.currentQuestion + 1}: ${question.question}`);
    
    io.emit('new-question', {
        ...question,
        timer: gameState.timer,
        questionNumber: gameState.currentQuestion + 1,
        totalQuestions: gameState.totalQuestions
    });
    
    // Очищаем предыдущие таймеры
    if (gameState.questionTimer) {
        clearTimeout(gameState.questionTimer);
    }
    if (gameState.allAnsweredTimer) {
        clearTimeout(gameState.allAnsweredTimer);
    }
    
    // Запускаем таймер окончания вопроса
    gameState.questionTimer = setTimeout(() => {
        if (gameState.isActive && !gameState.isPaused) {
            console.log('Время вышло');
            endQuestion();
        }
    }, gameState.timer * 1000);
}

function checkAllPlayersAnswered() {
    if (!gameState.isActive || gameState.isPaused) return;
    
    // Считаем только онлайн игроков
    const onlinePlayers = Array.from(gameState.players.values())
        .filter(p => p.socketId !== null);
    
    const answeredCount = Object.keys(gameState.answers).length;
    
    console.log(`Ответили: ${answeredCount} из ${onlinePlayers.length} игроков`);
    
    // Если все онлайн игроки ответили
    if (onlinePlayers.length > 0 && answeredCount >= onlinePlayers.length) {
        console.log('Все игроки ответили! Завершаем вопрос досрочно');
        
        // Отменяем основной таймер
        if (gameState.questionTimer) {
            clearTimeout(gameState.questionTimer);
        }
        
        // Показываем сообщение о том, что все ответили
        io.emit('all-players-answered');
        
        // Даем небольшую паузу, чтобы увидеть сообщение, потом завершаем вопрос
        if (gameState.allAnsweredTimer) {
            clearTimeout(gameState.allAnsweredTimer);
        }
        
        gameState.allAnsweredTimer = setTimeout(() => {
            endQuestion();
        }, 1500); // 1.5 секунды паузы после того, как все ответили
    }
}

function endQuestion() {
    if (gameState.isActive && !gameState.isPaused) {
        console.log('Завершение вопроса');
        gameState.isPaused = true;
        
        const question = questions[gameState.currentQuestion];
        
        // Финальная статистика
        sendStatsToAll(true);
        
        io.emit('question-end', {
            correct: question.correct,
            question: question.question,
            options: question.options
        });
    }
}

function sendStatsToAll(isFinal = false) {
    const stats = calculateStats();
    stats.final = isFinal;
    
    // Всем игрокам
    io.emit('stats-update', stats);
    
    // Отдельно админу
    sendStatsToAdmin(stats);
}

function sendStatsToAdmin(existingStats = null) {
    const stats = existingStats || calculateStats();
    io.to('admin').emit('admin-stats-update', stats);
}

function sendPlayersUpdate() {
    const playersList = Array.from(gameState.players.values())
        .map(p => ({
            name: p.name,
            score: p.score,
            online: p.socketId !== null
        }))
        .sort((a, b) => b.score - a.score);
    
    io.emit('players-update', playersList);
}

function calculateStats() {
    const totalAnswers = Object.keys(gameState.answers).length;
    const totalPlayers = Array.from(gameState.players.values())
        .filter(p => p.socketId !== null).length; // Считаем только онлайн
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    
    Object.values(gameState.answers).forEach(a => counts[a.answer]++);
    
    // Собираем информацию об ответах каждого игрока
    const playerAnswers = {};
    for (let [clientId, player] of gameState.players.entries()) {
        if (player.lastAnswer) {
            playerAnswers[clientId] = player.lastAnswer;
        }
    }
    
    return {
        total: totalAnswers,
        totalPlayers: totalPlayers,
        counts: counts,
        percentages: {
            A: totalAnswers > 0 ? ((counts.A / totalAnswers) * 100).toFixed(1) : 0,
            B: totalAnswers > 0 ? ((counts.B / totalAnswers) * 100).toFixed(1) : 0,
            C: totalAnswers > 0 ? ((counts.C / totalAnswers) * 100).toFixed(1) : 0,
            D: totalAnswers > 0 ? ((counts.D / totalAnswers) * 100).toFixed(1) : 0
        },
        correct: questions[gameState.currentQuestion]?.correct,
        playerAnswers: playerAnswers
    };
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});