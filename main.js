const numbersContainer = document.querySelector('.numbers');
const generateBtn = document.querySelector('#generate');
const themeToggle = document.getElementById('theme-toggle');

const generateNumbers = () => {
    numbersContainer.innerHTML = '';
    const numbers = new Set();
    while(numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
    sortedNumbers.forEach((number, index) => {
        const numberEl = document.createElement('div');
        numberEl.classList.add('number');
        numberEl.textContent = number;
        numberEl.style.animationDelay = `${index * 100}ms`;
        numbersContainer.appendChild(numberEl);
    });
};

const toggleTheme = () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark-mode');
        themeToggle.textContent = '☀️';
    } else {
        localStorage.removeItem('theme');
        themeToggle.textContent = '🌙';
    }
};

const applyTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark-mode') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }
};

generateBtn.addEventListener('click', generateNumbers);
themeToggle.addEventListener('click', toggleTheme);

generateNumbers();
applyTheme();
