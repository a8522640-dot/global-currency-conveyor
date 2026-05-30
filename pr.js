const currencyDetails = {
    USD: ["us", "USD - Доллар США"],
    RUB: ["ru", "RUB - Российский рубль"],
    KZT: ["kz", "KZT - Казахский тенге"],
    EUR: ["eu", "EUR - Евро"],
    UZS: ["uz", "UZS - Узбекский сум"],
    TJS: ["tj", "TJS - Таджикский сомони"],
    CNY: ["cn", "CNY - Китайский юань"],
    GBP: ["gb", "GBP - Британский фунт"],
    TRY: ["tr", "TRY - Турецкая лира"],
    AED: ["ae", "AED - Дирхам ОАЭ"],
    SAR: ["sa", "SAR - Саудовский риял"],
    JPY: ["jp", "JPY - Японская иена"],
    KRW: ["kr", "KRW - Южнокорейская вона"],
    INR: ["in", "INR - Индийская рупия"],
    CAD: ["ca", "CAD - Канадский доллар"],
    AUD: ["au", "AUD - Австралийский доллар"],
    CHF: ["ch", "CHF - Швейцарский франк"],
    BYN: ["by", "BYN - Белорусский рубль"],
    UAH: ["ua", "UAH - Украинская гривна"],
    AMD: ["am", "AMD - Армянский драм"],
    GEL: ["ge", "GEL - Грузинский лари"],
    AZN: ["az", "AZN - Азербайджанский манат"]
};

// Список валют, которые мы хотим видеть в самом верху списка
const favoriteCurrencies = ["USD", "RUB", "KZT", "EUR"];

let apiRates = {}; 
const kgsInput = document.getElementById('kgs-input');
const searchInput = document.getElementById('search-input');
const container = document.getElementById('currencies-container');
const clearBtn = document.getElementById('clear-btn');
const themeToggle = document.getElementById('theme-toggle');

// 1. Получение данных с API
async function loadExchangeRates() {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        
        if (data.result === "success") {
            apiRates = data.rates;
            renderCurrencies(); 
        } else {
            container.innerHTML = "<div class='loading'>Ошибка загрузки курсов.</div>";
        }
    } catch (error) {
        container.innerHTML = "<div class='loading'>Нет соединения с интернетом.</div>";
    }
}

// 2. Отрендерить карточки с сортировкой «Избранных»
function renderCurrencies() {
    const kgsAmount = parseFloat(kgsInput.value) || 0;
    const searchQuery = searchInput.value.toLowerCase();
    const usdInOneKgs = 1 / apiRates["KGS"]; 

    container.innerHTML = ''; 

    // Сортируем ключи API так, чтобы избранные валюты шли первыми
    const sortedCurrencyCodes = Object.keys(apiRates).sort((a, b) => {
        const aFav = favoriteCurrencies.includes(a);
        const bFav = favoriteCurrencies.includes(b);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return 0; // Остальные оставляем как есть
    });

    sortedCurrencyCodes.forEach(code => {
        if (code === "KGS") return; 

        const [flagCode, textName] = currencyDetails[code] || ["un", `${code} - Иностранная валюта`];

        if (!code.toLowerCase().includes(searchQuery) && !textName.toLowerCase().includes(searchQuery)) {
            return; 
        }

        const resultValue = (kgsAmount * usdInOneKgs) * apiRates[code];
        const flagUrl = `https://flagcdn.com/w40/${flagCode}.png`;

        const card = document.createElement('div');
        // Если валюта в списке избранных, добавляем ей специальный класс 'favorite'
        card.className = `currency-card ${favoriteCurrencies.includes(code) ? 'favorite' : ''}`;
        
        card.innerHTML = `
            <img src="${flagUrl}" alt="${code}" class="img-flag">
            <div class="card-info">
                <span class="currency-code">${textName} ${favoriteCurrencies.includes(code) ? '★' : ''}</span>
                <span class="converted-val">${resultValue.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}</span>
            </div>
        `;
        container.appendChild(card);
    });

    if (container.children.length === 0) {
        container.innerHTML = "<div class='loading'>Ничего не найдено...</div>";
    }
}

// 3. Логика кнопки очистки
clearBtn.addEventListener('click', () => {
    kgsInput.value = '';
    renderCurrencies();
    kgsInput.focus(); // Возвращаем фокус на поле ввода
});

// 4. Логика переключения темы
themeToggle.addEventListener('click', () => {
    const body = document.body;
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeToggle.textContent = "🌙 Темная тема";
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeToggle.textContent = "☀️ Светлая тема";
    }
});

// Слушатели ввода
kgsInput.addEventListener('input', renderCurrencies);
searchInput.addEventListener('input', renderCurrencies);

loadExchangeRates();