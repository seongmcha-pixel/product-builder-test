const numbersContainer = document.querySelector('.numbers');
const generateBtn = document.querySelector('#generate');

const generateNumbers = () => {
    numbersContainer.innerHTML = '';
    const numbers = new Set();
    while(numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }

    Array.from(numbers).forEach((number, index) => {
        const numberEl = document.createElement('div');
        numberEl.classList.add('number');
        numberEl.textContent = number;
        numberEl.style.animationDelay = `${index * 100}ms`;
        numbersContainer.appendChild(numberEl);
    });
};

generateBtn.addEventListener('click', generateNumbers);

generateNumbers();
