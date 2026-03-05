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
    }
    // ... добавьте остальные вопросы
];

// Состояние игры
let gameState = {
    currentQuestion: 0,
    isActive: false,
    isPaused: false,
    timer: 30,
    players: {}, // id -> { name, score, hasAnswered, lastAnswer, answeredAt }
    answers: {}, // id -> { answer, isCorrect, timestamp }
    questionStartTime: null,
    questionTimer: null,
    totalQuestions: questions.length
};

// Сохраняем ответы игроков даже после перезагрузки
const playerAnswers = new Map(); // socketId -> { answer, questionIndex, timestamp }

io.on('connection', (socket) => {
    console.log('Новое подключение:', socket.id);

    // Отправляем текущее состояние
    socket.emit('game-state', {
        isActive: gameState.isActive,
        isPaused: gameState.isPaused,
        currentQuestion: gameState.currentQuestion,
        totalQuestions: gameState.totalQuestions,
        players: Object.values(gameState.players)
    });

    // Если игрок переподключается, проверяем его прошлый ответ
    const previousAnswer = playerAnswers.get(socket.id);
    if (previousAnswer && previousAnswer.questionIndex === gameState.currentQuestion) {
        socket.emit('restore-answer', {
            answer: previousAnswer.answer,
            isCorrect: previousAnswer.isCorrect
        });
    }

    socket.on('join', (role, name) => {
        socket.role = role;
        socket.join(role);
        
        if (role === 'player') {
            // Восстанавливаем игрока, если он уже был
            if (!gameState.players[socket.id]) {
                gameState.players[socket.id] = { 
                    name: name || 'Аноним', 
                    score: 0,
                    id: socket.id,
                    hasAnswered: false,
                    lastAnswer: null
                };
            }
            
            // Проверяем, отвечал ли этот игрок на текущий вопрос
            const previousAnswer = playerAnswers.get(socket.id);
            if (previousAnswer && previousAnswer.questionIndex === gameState.currentQuestion) {
                gameState.players[socket.id].hasAnswered = true;
                gameState.players[socket.id].lastAnswer = previousAnswer.answer;
                
                // Восстанавливаем ответ в answers
                if (!gameState.answers[socket.id]) {
                    gameState.answers[socket.id] = {
                        answer: previousAnswer.answer,
                        isCorrect: previousAnswer.isCorrect,
                        timestamp: previousAnswer.timestamp
                    };
                }
            }
            
            io.emit('players-update', Object.values(gameState.players));
        }
        
        socket.emit('init', { 
            role, 
            totalQuestions: gameState.totalQuestions,
            gameState: gameState.isActive,
            isPaused: gameState.isPaused
        });

        // Отправляем текущую статистику админу при подключении
        if (role === 'admin' && gameState.isActive) {
            sendStatsToAdmin();
        }
    });

    socket.on('start-game', () => {
        if (socket.role === 'admin') {
            gameState.currentQuestion = 0;
            gameState.isActive = true;
            gameState.isPaused = false;
            gameState.answers = {};
            playerAnswers.clear();
            
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
        
        // Проверяем, не отвечал ли уже игрок на этот вопрос
        const existingAnswer = playerAnswers.get(socket.id);
        if (existingAnswer && existingAnswer.questionIndex === gameState.currentQuestion) {
            // Игрок уже отвечал на этот вопрос
            socket.emit('answer-rejected', { reason: 'already-answered' });
            return;
        }
        
        if (player && !player.hasAnswered) {
            const question = questions[gameState.currentQuestion];
            const isCorrect = data.answer === question.correct;
            
            // Сохраняем ответ
            const answerData = {
                answer: data.answer,
                isCorrect: isCorrect,
                timestamp: Date.now(),
                questionIndex: gameState.currentQuestion
            };
            
            gameState.answers[socket.id] = answerData;
            playerAnswers.set(socket.id, answerData);
            
            player.hasAnswered = true;
            player.lastAnswer = data.answer;
            
            if (isCorrect) {
                player.score += 1;
            }
            
            // Рассчитываем и отправляем статистику
            updateAndSendStats();
            
            // Обновляем список игроков
            io.emit('players-update', Object.values(gameState.players));
            
            // Подтверждаем игроку, что ответ принят
            socket.emit('answer-accepted', {
                answer: data.answer,
                isCorrect: isCorrect
            });
        }
    });

    socket.on('disconnect', () => {
        // Не удаляем игрока из gameState.players, чтобы сохранить его очки
        // Просто отмечаем, что он отключился
        console.log('Игрок отключился:', socket.id);
    });
});

function startQuestion() {
    if (gameState.currentQuestion >= gameState.totalQuestions) {
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
        totalQuestions: gameState.totalQuestions
    });
    
    // Очищаем предыдущий таймер
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
    const playerAnswers_map = {};
    Object.keys(gameState.players).forEach(id => {
        if (gameState.players[id].lastAnswer) {
            playerAnswers_map[id] = gameState.players[id].lastAnswer;
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
        playerAnswers: playerAnswers_map,
        final: isFinal
    };
    
    // Отправляем всем игрокам
    io.emit('stats-update', stats);
    
    // Отправляем отдельно админу (для надежности)
    sendStatsToAdmin(stats);
}

function sendStatsToAdmin(existingStats = null) {
    const stats = existingStats || (() => {
        const totalAnswers = Object.keys(gameState.answers).length;
        const totalPlayers = Object.keys(gameState.players).length;
        const counts = { A: 0, B: 0, C: 0, D: 0 };
        
        Object.values(gameState.answers).forEach(a => counts[a.answer]++);
        
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
            correct: questions[gameState.currentQuestion]?.correct
        };
    })();
    
    io.to('admin').emit('admin-stats-update', stats);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});