const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Вопросы из вашего файла (первые 5 для примера, добавьте все 40)
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
    }
    // ... добавьте остальные вопросы
];

// Состояние игры
let gameState = {
    currentQuestion: 0,
    isActive: false,
    isPaused: false,
    timer: 30, // 30 секунд на ответ
    players: {},
    answers: {},
    questionStartTime: null,
    questionTimer: null
};

io.on('connection', (socket) => {
    console.log('Новое подключение:', socket.id);

    // Отправляем текущее состояние при подключении
    socket.emit('game-state', {
        isActive: gameState.isActive,
        isPaused: gameState.isPaused,
        currentQuestion: gameState.currentQuestion,
        totalQuestions: questions.length,
        players: Object.values(gameState.players)
    });

    // Если игра активна, отправляем текущий вопрос
    if (gameState.isActive && !gameState.isPaused && questions[gameState.currentQuestion]) {
        const question = questions[gameState.currentQuestion];
        const timeLeft = Math.max(0, Math.ceil((gameState.questionStartTime + gameState.timer * 1000 - Date.now()) / 1000));
        
        socket.emit('current-question', {
            ...question,
            timer: timeLeft,
            questionNumber: gameState.currentQuestion + 1,
            totalQuestions: questions.length
        });

        // Отправляем текущую статистику
        const totalAnswers = Object.keys(gameState.answers).length;
        const totalPlayers = Object.keys(gameState.players).length;
        const counts = { A: 0, B: 0, C: 0, D: 0 };
        Object.values(gameState.answers).forEach(a => counts[a.answer]++);
        
        socket.emit('stats-update', {
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
        });
    }

    socket.on('join', (role, name) => {
        socket.role = role;
        socket.join(role);
        
        if (role === 'player') {
            // Проверяем, не был ли игрок уже в игре
            if (!gameState.players[socket.id]) {
                gameState.players[socket.id] = { 
                    name: name || 'Аноним', 
                    score: 0,
                    id: socket.id,
                    hasAnswered: false,
                    lastAnswer: null
                };
            }
            io.emit('players-update', Object.values(gameState.players));
        }
        
        socket.emit('init', { 
            role, 
            totalQuestions: questions.length,
            gameState: gameState.isActive,
            isPaused: gameState.isPaused
        });
    });

    socket.on('start-game', () => {
        if (socket.role === 'admin') {
            gameState.currentQuestion = 0;
            gameState.isActive = true;
            gameState.isPaused = false;
            gameState.answers = {};
            
            // Сбрасываем состояние игроков
            Object.keys(gameState.players).forEach(id => {
                gameState.players[id].hasAnswered = false;
                gameState.players[id].lastAnswer = null;
            });
            
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
                gameState.players[id].lastAnswer = null;
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
            player.lastAnswer = data.answer;
            
            if (isCorrect) {
                player.score += 1;
            }
            
            // Рассчитываем статистику
            updateAndSendStats();
            
            // Обновляем список игроков
            io.emit('players-update', Object.values(gameState.players));
        }
    });

    socket.on('disconnect', () => {
        if (gameState.players[socket.id]) {
            delete gameState.players[socket.id];
            io.emit('players-update', Object.values(gameState.players));
        }
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
    gameState.questionStartTime = Date.now();
    
    const question = questions[gameState.currentQuestion];
    
    io.emit('new-question', {
        ...question,
        timer: gameState.timer,
        questionNumber: gameState.currentQuestion + 1,
        totalQuestions: questions.length
    });
    
    // Очищаем предыдущий таймер если был
    if (gameState.questionTimer) {
        clearTimeout(gameState.questionTimer);
    }
    
    // Запускаем таймер окончания вопроса
    gameState.questionTimer = setTimeout(() => {
        if (gameState.isActive && !gameState.isPaused) {
            gameState.isPaused = true;
            
            const question = questions[gameState.currentQuestion];
            
            // Финальная статистика
            updateAndSendStats(true);
            
            io.emit('question-end', {
                correct: question.correct,
                question: question.question,
                options: question.options
            });
        }
    }, gameState.timer * 1000);
}

function updateAndSendStats(isFinal = false) {
    const totalAnswers = Object.keys(gameState.answers).length;
    const totalPlayers = Object.keys(gameState.players).length;
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    
    Object.values(gameState.answers).forEach(a => counts[a.answer]++);
    
    // Собираем информацию об ответах каждого игрока
    const playerAnswers = {};
    Object.keys(gameState.players).forEach(id => {
        if (gameState.players[id].lastAnswer) {
            playerAnswers[id] = gameState.players[id].lastAnswer;
        }
    });
    
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
        correct: questions[gameState.currentQuestion]?.correct,
        playerAnswers: playerAnswers,
        final: isFinal
    };
    
    io.emit('stats-update', stats);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});