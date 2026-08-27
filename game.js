const startScreen = document.getElementById("start-screen");
const gameContainer = document.getElementById("game-container");
const basket = document.getElementById("basket");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const gameOverScreen = document.getElementById("game-over");
const finalScoreText = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");

let score = 0;
let lives = 3;
let basketLeft = 380;

const objectSize = 50;
const containerWidth = gameContainer.offsetWidth;
const containerHeight = gameContainer.offsetHeight;
const basketWidth = basket.offsetWidth;
const basketHeight = basket.offsetHeight;

let fallingObjects = [];

let spawnIntervalId = null;
let animationId = null;

let gameRunning = false;
let gameStarted = false;

let wormsUnlocked = false;
let wormActive = false;
let wormIntervalId = null;
let wormTimeoutId = null;

//mouse movement
gameContainer.addEventListener("mousemove", (mouseEvent) => {

    const rect = gameContainer.getBoundingClientRect();
    basketLeft = mouseEvent.clientX - rect.left - basketWidth / 2;
    basketLeft = Math.max(0, Math.min(basketLeft, containerWidth - basketWidth));
    basket.style.left = basketLeft + "px";
});

function gameLoop() {
    if (!gameRunning) return;
    updateFallingObjects();
    if (gameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function spawnObject() {

    if (fallingObjects.length >= 10) {
        return;
    }

    const obj = document.createElement("img");
    obj.classList.add("falling-object");

    let type;
    let points;
    if (wormsUnlocked && Math.random() < 0.2) {
        type = "worm";
        points = 0;
        obj.src = "./images/worm_cropped.png";
    }
    else {
        const isGreen = Math.random() < 0.3;
        if (isGreen) {
            type = "greenApple";
            points = 2;
            obj.src = "./images/greenApple_cropped.png";
        } 
        else {
            type = "redApple";
            points = 1;
            obj.src = "./images/redApple_cropped.png";
        }
    }

    const randomLeft =
        Math.random() * (containerWidth - objectSize);

    obj.style.left = randomLeft + "px";
    obj.style.top = "0px";

    gameContainer.appendChild(obj);

    fallingObjects.push({
        element: obj,
        type: type,
        top: 0,
        left: randomLeft,
        speed: 2 + Math.random() * 2,
        points: points
    });
}

function updateFallingObjects() {
    const basketRect = {
        left: basketLeft,
        right: basketLeft + basketWidth,
        top: containerHeight - basketHeight - 5 };

    for (let i = fallingObjects.length - 1; i >= 0; i--) {
        const item = fallingObjects[i];
        item.top += item.speed;
        item.element.style.top = item.top + "px";

        const objRight = item.left + objectSize;
        const objBottom = item.top + objectSize;

        const caught =
            objBottom >= basketRect.top &&
            item.left < basketRect.right &&
            objRight > basketRect.left;

        if (caught) {

            if (item.type === "worm") {
                startWormPenalty();
            } 
            else {
                score += item.points;
                scoreDisplay.textContent = "Score: " + score;
                if (score >= 20) { wormsUnlocked = true; }
            }
            item.element.remove();
            fallingObjects.splice(i, 1);
            continue;
        }

        if (item.top >= containerHeight) {
            if (item.type !== "worm") {
                lives--;
                livesDisplay.textContent = "Lives: " + lives;
                if (lives <= 0) {
                    endGame();
                }
            }
            item.element.remove();
            fallingObjects.splice(i, 1);
        }
    }
}

function startWormPenalty() {

    if (wormActive) { return;}
    wormActive = true;
    scoreDisplay.classList.add("worm-penalty");
    wormIntervalId = setInterval(() => {
        score = Math.max(0, score - 5);
        scoreDisplay.textContent = "Score: " + score;
        if (score === 0) {
            endGame();
        }
    }, 1000);

    wormTimeoutId = setTimeout(() => {
        clearInterval(wormIntervalId);
        wormIntervalId = null;
        wormActive = false;
        scoreDisplay.classList.remove("worm-penalty");
    }, 5000);
}

function endGame() {

    if (!gameRunning) return;
    gameRunning = false;

    clearInterval(spawnIntervalId);
    spawnIntervalId = null;

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    if (wormIntervalId) {
        clearInterval(wormIntervalId);
        wormIntervalId = null;
    }
    if (wormTimeoutId) {
        clearTimeout(wormTimeoutId);
        wormTimeoutId = null;
    }

    wormActive = false;
    scoreDisplay.classList.remove("worm-penalty");
    finalScoreText.textContent = "Final Score: " + score;
    gameOverScreen.classList.remove("hidden");
}

function startGame() {
    clearInterval(spawnIntervalId);

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    gameRunning = true;
    score = 0;
    lives = 3;
    wormsUnlocked = false;
    wormActive = false;

    if (wormIntervalId) {
        clearInterval(wormIntervalId);
        wormIntervalId = null;
    }

    if (wormTimeoutId) {
        clearTimeout(wormTimeoutId);
        wormTimeoutId = null;
    }

    scoreDisplay.classList.remove("worm-penalty");

    scoreDisplay.textContent = "Score: 0";
    livesDisplay.textContent = "Lives: 3";
    gameOverScreen.classList.add("hidden");

    fallingObjects.forEach(item => item.element.remove());
    fallingObjects = [];

    basketLeft = 380;
    basket.style.left = basketLeft + "px";

    spawnIntervalId = setInterval(spawnObject, 1000);
    animationId = requestAnimationFrame(gameLoop);
}

restartBtn.addEventListener("click", startGame);

gameContainer.addEventListener("mousemove", startGameWithMouse);
function startGameWithMouse() {
    if (gameStarted) return;
    gameStarted = true;
    startScreen.classList.add("hidden");
    startGame();
    gameContainer.removeEventListener("mousemove", startGameWithMouse);
}