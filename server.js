require('dotenv').config();
const express = require('express');
const path = require('path');
const bot = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-secret-key';

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Маршрут для главной страницы (Mini App)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Webhook для Telegram
app.post(`/webhook/${WEBHOOK_SECRET}`, (req, res) => {
    try {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error('❌ Ошибка обработки webhook:', error);
        res.sendStatus(500);
    }
});

// API для игры
app.post('/api/game/damage', express.json(), (req, res) => {
    const { userId, damage } = req.body;
    // Здесь можно сохранять данные в БД
    res.json({ success: true, damage });
});

app.get('/api/game/stats/:userId', (req, res) => {
    const { userId } = req.params;
    // Здесь получать данные из БД
    res.json({ userId, damage: 0, level: 1 });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('❌ Ошибка:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log('✅ СЕРВЕР ЗАПУЩЕН');
    console.log(`🌐 Адрес: http://localhost:${PORT}`);
    console.log(`🔗 Webhook: /webhook/${WEBHOOK_SECRET}`);
    
    // Настройка webhook в Telegram
    if (process.env.ENVIRONMENT === 'production') {
        const webhookUrl = `${process.env.WEBHOOK_URL}/webhook/${WEBHOOK_SECRET}`;
        bot.setWebHook(webhookUrl).then(() => {
            console.log(`✅ Webhook установлен: ${webhookUrl}`);
        }).catch(err => {
            console.error('❌ Ошибка установки webhook:', err);
        });
    }
});