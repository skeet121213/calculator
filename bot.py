import logging
import json
from decimal import Decimal, getcontext
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# Настройка точности
getcontext().prec = 100

# Включаем логирование
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# URL вашего WebApp (нужно заменить на реальный после деплоя)
WEBAPP_URL = "https://your-domain.com"  # Замените на ваш URL

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Отправляет сообщение с кнопкой для открытия Mini App."""
    
    # Создаем клавиатуру с WebApp кнопкой
    keyboard = [
        [InlineKeyboardButton(
            "🧮 Открыть калькулятор", 
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    welcome_text = """
🔢 **Супер-калькулятор Mini App**

Привет! Я бот-калькулятор с поддержкой очень больших чисел.

✨ **Возможности:**
• Красивый интерфейс внутри Telegram
• Поддержка чисел до 10^100
• Научные функции (sin, cos, tan, log)
• Факториалы и возведение в степень
• Константы π и e

👇 **Нажми кнопку ниже, чтобы открыть калькулятор**
    """
    
    await update.message.reply_text(
        welcome_text,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обрабатывает данные, полученные из WebApp."""
    data = json.loads(update.effective_message.web_app_data.data)
    
    if data['type'] == 'calculation_result':
        result_text = f"""
📊 **Результат вычислений:**

Выражение: `{data['expression']}`
Результат: `{data['result']}`

✅ Данные получены из Mini App!
        """
        await update.message.reply_text(result_text, parse_mode='Markdown')
    
    elif data['type'] == 'empty':
        await update.message.reply_text(
            "👋 Калькулятор закрыт. Используйте /start чтобы открыть снова."
        )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показывает справку."""
    help_text = """
📚 **Справка по использованию:**

1. Нажми /start чтобы открыть калькулятор
2. Используй кнопки интерфейса для ввода
3. Нажми "=" для вычисления
4. Отправь результат в чат кнопкой "Отправить"

**Поддерживаемые операции:**
• +, -, *, / - основные операции
• ^ - возведение в степень
• √ - квадратный корень
• sin, cos, tan - тригонометрия
• log - десятичный логарифм
• π, e - математические константы
• ! - факториал (только целые числа)
    """
    await update.message.reply_text(help_text, parse_mode='Markdown')

def main():
    """Запуск бота."""
    # Вставьте ваш токен
    application = Application.builder().token('8336845039:AAHH0kYWuq88La9XbpTjwiHDJxT_dCQqqIs').build()
    
    # Добавляем обработчики
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, web_app_data))
    
    # Запуск бота
    print("🚀 Mini App бот запущен...")
    print(f"📱 WebApp URL: {WEBAPP_URL}")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()