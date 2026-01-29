require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    console.error('❌ ОШИБКА: Переменная TELEGRAM_BOT_TOKEN не установлена!');
    process.exit(1);
}

// Режим работы бота: в production (на Railway/Render) используем webhook (polling=false),
// в development/local — polling=true
const isProduction = process.env.ENVIRONMENT === 'production';
let bot;
if (isProduction) {
    bot = new TelegramBot(token, { polling: false });
} else {
    bot = new TelegramBot(token, { polling: true });
}

// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    const webappUrl = process.env.WEBAPP_URL || '';

    // Если указан HTTPS URL — отправляем web_app кнопку (работает как мини‑апп в Telegram)
    if (webappUrl.startsWith('https://')) {
        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🎮 Играть',
                            web_app: { url: webappUrl }
                        }
                    ]
                ]
            }
        };

        bot.sendMessage(chatId,
            '🎮 *Madness Game* 👹\n\n' +
            'Нажмите кнопку «Играть», чтобы открыть мини‑апп внутри Telegram (телефон и десктоп).',
            { ...keyboard, parse_mode: 'Markdown' }
        ).catch(err => console.error('❌ Ошибка отправки web_app:', err.message));
        return;
    }

    // Фолбек: если это локальная машина (HTTP) — отправляем текст с локальной ссылкой
    bot.sendMessage(chatId,
        '🎮 *Madness Game* 👹\n\n' +
        'Добро пожаловать в игру!\n\n' +
        'Для теста локально откройте в браузере:\n' +
        '🔗 http://localhost:3000',
        { parse_mode: 'Markdown' }
    ).catch(err => console.error('❌ Ошибка отправки:', err.message));
});

// Команда /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
        '📖 *Справка*\n\n' +
        '/start - Начать игру\n' +
        '/stats - Мои статистика\n' +
        '/help - Справка'
    , { parse_mode: 'Markdown' });
});

// Обработка ошибок
bot.on('error', (error) => {
    console.log('❌ Ошибка бота:', error.message);
});

bot.on('polling_error', (error) => {
    console.log('⚠️ Ошибка polling:', error.message);
});

// Экспортируем бот для server.js
module.exports = bot;

console.log('✅ Модуль бота инициализирован');
console.log('🤖 Бот слушает команды в режиме polling...');
