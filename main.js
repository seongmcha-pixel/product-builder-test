const URL = "https://teachablemachine.withgoogle.com/models/6Pml5RmpC/";

let model, webcam, labelContainer, maxPredictions, countdownDisplay;
let userScore = 0;
let computerScore = 0;
const choices = ["Rock", "Paper", "Scissors"]; // Ensure these match your Teachable Machine labels

let canPlay = false; // Flag to control when a round can be played
let timerInterval;
let animationFrameId; // To store the requestAnimationFrame ID
let gameStarted = false; // Flag to indicate if the game has started

async function init() {
    if (gameStarted) {
        // If the game was stopped and init is called again, we need to reset everything
        resetGame(false); // Reset without clearing webcam, it will be setup again
    }
    gameStarted = true;

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(200, 200, flip);
    await webcam.setup();
    await webcam.play();
    animationFrameId = window.requestAnimationFrame(loop); // Store the ID

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
    if (gameStarted && webcam) {
        webcam.update();
        await predict();
        animationFrameId = window.requestAnimationFrame(loop);
    }
}

async function predict() {
    if (!gameStarted || !canPlay) {
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

    if (highestProbability > 0.8 && userChoice !== "Background") {
        canPlay = false;
        playRound(userChoice);
        setTimeout(startCountdown, 2000);
    }
}

function startCountdown() {
    canPlay = false;
    let count = 3;
    countdownDisplay.innerText = "Get Ready!";
    document.getElementById("game-message").innerText = "Make your move!";
    document.getElementById("computer-choice").innerText = "";

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        if (!gameStarted) { // Stop countdown if game is stopped
            clearInterval(timerInterval);
            return;
        }
        countdownDisplay.innerText = count;
        if (count === 0) {
            clearInterval(timerInterval);
            countdownDisplay.innerText = "GO!";
            canPlay = true;
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
}

function updateScoreDisplay() {
    document.getElementById("user-score").innerText = userScore;
    document.getElementById("computer-score").innerText = computerScore;
}

function stopGame() {
    if (webcam) {
        webcam.stop();
        document.getElementById("webcam-container").innerHTML = "";
    }
    if (model) {
        model.dispose(); // Release model resources
    }
    clearInterval(timerInterval);
    window.cancelAnimationFrame(animationFrameId);

    canPlay = false;
    gameStarted = false;

    document.getElementById("game-message").innerText = "Game Stopped.";
    document.getElementById("countdown").innerText = "";
    document.getElementById("computer-choice").innerText = "";
    labelContainer.innerHTML = ""; // Clear prediction labels
}

function resetGame(clearWebcamContainer = true) {
    stopGame(); // Stop current game first

    userScore = 0;
    computerScore = 0;
    updateScoreDisplay();

    document.getElementById("game-message").innerText = "Press Start to Play!";
    document.getElementById("countdown").innerText = "";
    document.getElementById("computer-choice").innerText = "";
    labelContainer.innerHTML = ""; // Clear prediction labels

    // If init() is called right after resetGame(), webcam will be setup again
    // Otherwise, we might want to clear the webcam container
    if (clearWebcamContainer && document.getElementById("webcam-container")) {
        document.getElementById("webcam-container").innerHTML = "";
    }
}