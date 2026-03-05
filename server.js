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
    players: new Map(), // clientId -> { name, score, socketId, hasAnswered, lastAnswer }
    socketToClient: new Map(), // socketId -> clientId
    answers: {}, // socketId -> { answer, isCorrect, timestamp }
    questionStartTime: null,
    questionTimer: null,
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
    
    // Очищаем предыдущий таймер
    if (gameState.questionTimer) {
        clearTimeout(gameState.questionTimer);
    }
    
    // Запускаем таймер окончания вопроса
    gameState.questionTimer = setTimeout(() => {
        if (gameState.isActive && !gameState.isPaused) {
            console.log('Время вышло');
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
    }, gameState.timer * 1000);
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
    const totalPlayers = gameState.players.size;
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