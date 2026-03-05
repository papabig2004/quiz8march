const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Загрузка вопросов из файла (упрощенный парсинг)
const questions = [];
try {
    const fileContent = fs.readFileSync(path.join(__dirname, 'Вопросы для викторины.pdf'), 'utf8');
    // Регулярное выражение для поиска вопросов и правильных ответов
    const questionRegex = /(\d+)\.\s*(.*?)\s*A\)\s*(.*?)\s*B\)\s*(.*?)\s*C\)\s*(.*?)\s*D\)\s*(.*?)\s*Правильный ответ:\s*([A-D])/gs;
    let match;
    while ((match = questionRegex.exec(fileContent)) !== null) {
        questions.push({
            id: match[1],
            question: match[2].trim(),
            options: [
                `A) ${match[3].trim()}`,
                `B) ${match[4].trim()}`,
                `C) ${match[5].trim()}`,
                `D) ${match[6].trim()}`
            ],
            correct: match[7].trim()
        });
    }
} catch (e) {
    console.log('Не удалось загрузить вопросы, используются тестовые данные');
    // Тестовые данные на случай отсутствия файла
    questions.push({
        id: '1',
        question: 'Какой макияж визуально увеличивает глаза?',
        options: ['A) Тёмная подводка по слизистой', 'B) Светлый карандаш по слизистой', 'C) Чёткая тёмная линия', 'D) Матовые тёмные тени'],
        correct: 'B'
    });
}

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
        if (role === 'player') {
            gameState.players[socket.id] = { name: name || 'Аноним', score: 0 };
            io.emit('players-update', Object.values(gameState.players));
        }
        socket.emit('init', { role, questions: questions.length, gameState: gameState.isActive });
    });

    socket.on('start-game', () => {
        if (socket.role === 'admin') {
            gameState.currentQuestion = 0;
            gameState.isActive = true;
            gameState.answers = {};
            nextQuestion();
        }
    });

    socket.on('answer', (data) => {
        if (!gameState.isActive) return;
        const player = gameState.players[socket.id];
        if (player && !gameState.answers[socket.id]) {
            const question = questions[gameState.currentQuestion];
            const isCorrect = data.answer === question.correct;
            gameState.answers[socket.id] = data.answer;
            
            if (isCorrect) {
                player.score += 1;
            }
            
            // Отправка процентов админу
            if (socket.role === 'admin') return;
            const totalAnswers = Object.keys(gameState.answers).length;
            const counts = { A: 0, B: 0, C: 0, D: 0 };
            Object.values(gameState.answers).forEach(ans => counts[ans]++);
            
            io.to('admin').emit('stats-update', {
                total: totalAnswers,
                counts: counts,
                percentages: {
                    A: (counts.A / totalAnswers * 100).toFixed(1),
                    B: (counts.B / totalAnswers * 100).toFixed(1),
                    C: (counts.C / totalAnswers * 100).toFixed(1),
                    D: (counts.D / totalAnswers * 100).toFixed(1)
                }
            });
        }
    });

    socket.on('disconnect', () => {
        delete gameState.players[socket.id];
        io.emit('players-update', Object.values(gameState.players));
    });
});

function nextQuestion() {
    if (gameState.currentQuestion >= questions.length) {
        io.emit('game-end', Object.values(gameState.players));
        gameState.isActive = false;
        return;
    }
    
    gameState.answers = {};
    io.emit('new-question', {
        ...questions[gameState.currentQuestion],
        timer: 20
    });
    
    setTimeout(() => {
        gameState.currentQuestion++;
        nextQuestion();
    }, 20000);
}

server.listen(process.env.PORT || 3000, () => {
    console.log('Сервер запущен на порту', process.env.PORT || 3000);
});