const URL = "https://teachablemachine.withgoogle.com/models/6Pml5RmpC/";

let model, webcam, labelContainer, maxPredictions, countdownDisplay;
let userScore = 0;
let computerScore = 0;
const choices = ["Rock", "Paper", "Scissors"]; // Ensure these match your Teachable Machine labels

let canPlay = false; // Flag to control when a round can be played
let timerInterval;
let gameStarted = false; // Flag to indicate if the game has started

async function init() {
    if (gameStarted) return; // Prevent re-initialization if already started
    gameStarted = true;

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(200, 200, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").innerHTML = ""; // Clear existing content
    document.getElementById("webcam-container").appendChild(webcam.canvas);

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ""; // Clear existing content
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    countdownDisplay = document.getElementById("countdown");
    document.getElementById("game-message").innerText = "Get ready!";
    userScore = 0;
    computerScore = 0;
    updateScoreDisplay();
    document.getElementById("computer-choice").innerText = "";

    startCountdown(); // Start the first countdown
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    if (!gameStarted || !canPlay) { // Only predict if game started and a round is active
        return;
    }

    const prediction = await model.predict(webcam.canvas);
    let highestProbability = 0;
    let userChoice = "";

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;

        if (prediction[i].probability > highestProbability) {
            highestProbability = prediction[i].probability;
            userChoice = prediction[i].className;
        }
    }

    // Only process game logic if the prediction confidence is high enough (e.g., > 0.8)
    // and it's not the "Background" class
    if (highestProbability > 0.8 && userChoice !== "Background") {
        canPlay = false; // Prevent further predictions for this round
        playRound(userChoice);
        setTimeout(startCountdown, 2000); // Start new countdown after 2 seconds
    }
}

function startCountdown() {
    canPlay = false;
    let count = 3;
    countdownDisplay.innerText = "Get Ready!";
    document.getElementById("game-message").innerText = "Make your move!";
    document.getElementById("computer-choice").innerText = ""; // Clear computer's previous choice

    clearInterval(timerInterval); // Clear any existing interval

    timerInterval = setInterval(() => {
        countdownDisplay.innerText = count;
        if (count === 0) {
            clearInterval(timerInterval);
            countdownDisplay.innerText = "GO!";
            canPlay = true; // Allow predictions to be processed
            // A round will be played when a confident prediction is made in predict()
        }
        count--;
    }, 1000);
}

function playRound(userChoice) {
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    document.getElementById("computer-choice").innerText = computerChoice;

    let message = "";
    if (userChoice === computerChoice) {
        message = "It's a tie!";
    } else if (
        (userChoice === "Rock" && computerChoice === "Scissors") ||
        (userChoice === "Paper" && computerChoice === "Rock") ||
        (userChoice === "Scissors" && computerChoice === "Paper")
    ) {
        message = "You win!";
        userScore++;
    } else {
        message = "Computer wins!";
        computerScore++;
    }

    document.getElementById("game-message").innerText = message;
    updateScoreDisplay();
    // No need to call startCountdown here, it's called after playRound in predict()
}

function updateScoreDisplay() {
    document.getElementById("user-score").innerText = userScore;
    document.getElementById("computer-score").innerText = computerScore;
}
