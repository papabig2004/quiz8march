const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Вопросы из вашего файла (добавьте все 40 вопросов)
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
    }
    // ... добавьте остальные вопросы
];

// Состояние игры
let gameState = {
    currentQuestion: 0,
    isActive: false,
    isPaused: false,
    timer: 60, // 60 секунд на ответ
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
                id: socket.id,
                hasAnswered: false
            };
            io.emit('players-update', Object.values(gameState.players));
        }
        
        socket.emit('init', { 
            role, 
            totalQuestions: questions.length,
            gameState: gameState.isActive,
            currentQuestion: gameState.currentQuestion,
            isPaused: gameState.isPaused
        });
    });

    socket.on('start-game', () => {
        if (socket.role === 'admin') {
            gameState.currentQuestion = 0;
            gameState.isActive = true;
            gameState.isPaused = false;
            gameState.answers = {};
            gameState.results = {};
            startQuestion();
        }
    });

    socket.on('next-question', () => {
        if (socket.role === 'admin') {
            gameState.isPaused = false;
            gameState.currentQuestion++;
            gameState.answers = {};
            
            // Сбрасываем флаг ответа для всех игроков
            Object.keys(gameState.players).forEach(id => {
                gameState.players[id].hasAnswered = false;
            });
            
            startQuestion();
        }
    });

    socket.on('answer', (data) => {
        if (!gameState.isActive || gameState.isPaused) return;
        
        const player = gameState.players[socket.id];
        if (player && !player.hasAnswered) {
            const question = questions[gameState.currentQuestion];
            const isCorrect = data.answer === question.correct;
            
            gameState.answers[socket.id] = {
                answer: data.answer,
                isCorrect: isCorrect,
                timestamp: Date.now()
            };
            
            player.hasAnswered = true;
            
            if (isCorrect) {
                player.score += 1;
            }
            
            // Рассчитываем статистику
            const totalAnswers = Object.keys(gameState.answers).length;
            const totalPlayers = Object.keys(gameState.players).length;
            const counts = { A: 0, B: 0, C: 0, D: 0 };
            Object.values(gameState.answers).forEach(a => counts[a.answer]++);
            
            const stats = {
                total: totalAnswers,
                totalPlayers: totalPlayers,
                counts: counts,
                percentages: {
                    A: totalAnswers > 0 ? ((counts.A / totalAnswers) * 100).toFixed(1) : 0,
                    B: totalAnswers > 0 ? ((counts.B / totalAnswers) * 100).toFixed(1) : 0,
                    C: totalAnswers > 0 ? ((counts.C / totalAnswers) * 100).toFixed(1) : 0,
                    D: totalAnswers > 0 ? ((counts.D / totalAnswers) * 100).toFixed(1) : 0
                },
                correct: question.correct
            };
            
            // Отправляем статистику всем (и игрокам, и админу)
            io.emit('stats-update', stats);
            
            // Обновляем список игроков
            io.emit('players-update', Object.values(gameState.players));
        }
    });

    socket.on('disconnect', () => {
        delete gameState.players[socket.id];
        io.emit('players-update', Object.values(gameState.players));
    });
});

function startQuestion() {
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
        timer: gameState.timer,
        questionNumber: gameState.currentQuestion + 1,
        totalQuestions: questions.length
    });
    
    // Запускаем таймер
    setTimeout(() => {
        if (gameState.isActive && !gameState.isPaused) {
            gameState.isPaused = true;
            
            // Финальная статистика после окончания времени
            const totalAnswers = Object.keys(gameState.answers).length;
            const totalPlayers = Object.keys(gameState.players).length;
            const counts = { A: 0, B: 0, C: 0, D: 0 };
            Object.values(gameState.answers).forEach(a => counts[a.answer]++);
            
            const stats = {
                total: totalAnswers,
                totalPlayers: totalPlayers,
                counts: counts,
                percentages: {
                    A: totalAnswers > 0 ? ((counts.A / totalAnswers) * 100).toFixed(1) : 0,
                    B: totalAnswers > 0 ? ((counts.B / totalAnswers) * 100).toFixed(1) : 0,
                    C: totalAnswers > 0 ? ((counts.C / totalAnswers) * 100).toFixed(1) : 0,
                    D: totalAnswers > 0 ? ((counts.D / totalAnswers) * 100).toFixed(1) : 0
                },
                correct: question.correct,
                final: true
            };
            
            io.emit('question-end', {
                correct: question.correct,
                stats: stats
            });
        }
    }, gameState.timer * 1000);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});