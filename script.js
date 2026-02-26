let display = document.getElementById('display');
let history = document.getElementById('history');
let currentExpression = '';

// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand(); // expand, не extend!
tg.enableClosingConfirmation();

// Применяем цвета темы Telegram
document.body.style.backgroundColor = tg.backgroundColor;
document.body.style.color = tg.textColor;

// Устанавливаем CSS переменные для кнопок
document.body.style.setProperty('--tg-button-color', tg.buttonColor);
document.body.style.setProperty('--tg-button-text-color', tg.buttonTextColor);
document.body.style.setProperty('--tg-hint-color', tg.hintColor);

// Следим за изменением темы
tg.onEvent('themeChanged', function() {
    document.body.style.backgroundColor = tg.backgroundColor;
    document.body.style.color = tg.textColor;
    document.body.style.setProperty('--tg-button-color', tg.buttonColor);
    document.body.style.setProperty('--tg-button-text-color', tg.buttonTextColor);
    document.body.style.setProperty('--tg-hint-color', tg.hintColor);
});

// Показываем главную кнопку
tg.MainButton.setText('Отправить результат');
tg.MainButton.show();
tg.MainButton.onClick(sendToBot);

function appendNumber(num) {
    currentExpression += num;
    updateDisplay();
}

function appendOperator(op) {
    if (currentExpression.length > 0) {
        const lastChar = currentExpression[currentExpression.length - 1];
        if (!['+', '-', '*', '/', '^', '('].includes(lastChar)) {
            currentExpression += op;
            updateDisplay();
        }
    } else {
        // Если выражение пустое, но оператор - это может быть унарный минус
        if (op === '-') {
            currentExpression += op;
            updateDisplay();
        }
    }
}

function appendFunction(func) {
    currentExpression += func;
    updateDisplay();
}

function appendConstant(constant) {
    currentExpression += constant;
    updateDisplay();
}

function appendDot() {
    const lastNumber = currentExpression.split(/[\+\-\*\/\^\(\)]/).pop();
    if (!lastNumber.includes('.')) {
        currentExpression += '.';
        updateDisplay();
    }
}

function backspace() {
    currentExpression = currentExpression.slice(0, -1);
    updateDisplay();
}

function clearAll() {
    currentExpression = '';
    history.textContent = '';
    updateDisplay();
}

function updateDisplay() {
    display.value = currentExpression || '0';
}

function calculate() {
    if (!currentExpression) return;
    
    try {
        // Подготавливаем выражение для JavaScript
        let expr = currentExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/\^/g, '**')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/log\(/g, 'Math.log10(');
        
        // Безопасное вычисление
        const result = Function('"use strict";return (' + expr + ')')();
        
        // Форматируем результат
        let formattedResult;
        if (Math.abs(result) > 1e15 || (Math.abs(result) < 1e-10 && result !== 0)) {
            formattedResult = result.toExponential(10);
        } else if (Number.isInteger(result)) {
            formattedResult = result.toString();
        } else {
            formattedResult = result.toFixed(10).replace(/\.?0+$/, '');
        }
        
        // Добавляем в историю
        history.textContent = currentExpression + ' =';
        currentExpression = formattedResult;
        updateDisplay();
        
    } catch (error) {
        history.textContent = 'Ошибка: ' + error.message;
        console.error(error);
    }
}

function sendToBot() {
    if (currentExpression && history.textContent) {
        // Отправляем результат обратно боту
        tg.sendData(JSON.stringify({
            type: 'calculation_result',
            expression: history.textContent.replace('=', '').trim(),
            result: currentExpression
        }));
    } else {
        tg.sendData(JSON.stringify({
            type: 'empty',
            message: 'Пользователь закрыл калькулятор'
        }));
    }
}

function closeApp() {
    tg.close();
}

// Обработка данных от бота (если бот отправит данные в WebApp)
tg.onEvent('mainButtonClicked', function() {
    sendToBot();
});