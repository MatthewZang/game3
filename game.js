const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

let score = 0;
let birdY = canvas.height / 2;
const birdX = 50;
let birdVelocity = 0;
const gravity = 0.2;
const jumpStrength = -5;

const pipeWidth = 60;
const pipeGap = 200;
let pipes = [];

let gameStarted = false;
let highScore = localStorage.getItem('highScore') || 0;
let gameOver = false;
let birdDead = false;
let gameOverTimeout;

function createPipe() {
    const minHeight = 80;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topPipeHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    const bottomPipeY = topPipeHeight + pipeGap;

    pipes.push({
        x: canvas.width,
        topPipeHeight: topPipeHeight,
        bottomPipeY: bottomPipeY,
        passed: false
    });
}

function updatePipes() {
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 250) {
        createPipe();
    }

    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= 2;

        // Check for collision with bird
        if (birdX + 20 > pipes[i].x && birdX < pipes[i].x + pipeWidth) {
            if (birdY < pipes[i].topPipeHeight || birdY + 20 > pipes[i].bottomPipeY) {
                birdDead = true;
                gameOverTimeout = setTimeout(() => {
                    gameOver = true;
                }, 3000);
                return;
            }
        }

        // Check if pipe has been passed
        if (pipes[i].x + pipeWidth < birdX && !pipes[i].passed) {
            score++;
            scoreDisplay.textContent = score;
            pipes[i].passed = true;
        }

        // Remove off-screen pipes
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
            i--;
        }
    }
}

function drawPipes() {
    for (const pipe of pipes) {
        // Top pipe
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.roundRect(pipe.x, 0, pipeWidth, pipe.topPipeHeight, [10, 10, 0, 0]);
        ctx.fill();

        ctx.fillStyle = '#228B22';
        ctx.fillRect(pipe.x + 5, 0, pipeWidth - 10, pipe.topPipeHeight);

        // Bottom pipe
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.roundRect(pipe.x, pipe.bottomPipeY, pipeWidth, canvas.height - pipe.bottomPipeY, [0, 0, 10, 10]);
        ctx.fill();

        ctx.fillStyle = '#228B22';
        ctx.fillRect(pipe.x + 5, pipe.bottomPipeY, pipeWidth - 10, canvas.height - pipe.bottomPipeY);
    }
}

function drawBird() {
    if (birdDead) {
        ctx.fillStyle = 'gray'; // Dead bird color
        ctx.beginPath();
        ctx.arc(birdX + 10, birdY + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(birdX + 20, birdY + 10);
        ctx.lineTo(birdX + 30, birdY + 5);
        ctx.lineTo(birdX + 30, birdY + 15);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(birdX + 15, birdY + 7, 2, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = 'orange';

        // Bird's body (circle)
        ctx.beginPath();
        ctx.arc(birdX + 10, birdY + 10, 10, 0, Math.PI * 2);
        ctx.fill();

        // Bird's beak (triangle)
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(birdX + 20, birdY + 10);
        ctx.lineTo(birdX + 30, birdY + 5);
        ctx.lineTo(birdX + 30, birdY + 15);
        ctx.closePath();
        ctx.fill();

        // Bird's eye (small circle)
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(birdX + 15, birdY + 7, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function updateBird() {
    if (gameOver || birdDead) return;

    birdVelocity += gravity;
    birdY += birdVelocity;

    // Keep bird within canvas bounds
    if (birdY < 0) {
        birdY = 0;
        birdVelocity = 0;
    }
    if (birdY + 20 > canvas.height) {
        birdY = canvas.height - 20;
        birdVelocity = 0;
        birdDead = true;
        gameOverTimeout = setTimeout(() => {
            gameOver = true;
        }, 3000);
    }
}

function resetGame() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    score = 0;
    scoreDisplay.textContent = score;
    birdY = canvas.height / 2;
    birdVelocity = 0;
    pipes = [];
    gameStarted = false;
    gameOver = false;
    birdDead = false;
    clearTimeout(gameOverTimeout);
}

function drawStartScreen() {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '30px sans-serif';
    ctx.fillStyle = 'orange';
    ctx.textAlign = 'center';
    ctx.fillText("FLIGHT TO GRUM'S LAIR", canvas.width / 2, canvas.height / 2 - 60);

    ctx.font = '20px sans-serif';
    ctx.fillStyle = 'orange';
    ctx.fillText("Highest Score: " + highScore, canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = '18px sans-serif';
    ctx.fillStyle = 'orange';
    ctx.fillText("How to Play:", canvas.width / 2, canvas.height / 2 + 20);

    ctx.font = '16px sans-serif';
    ctx.fillStyle = 'orange';
    ctx.fillText("Press Space to Jump", canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillText("Avoid the pipes", canvas.width / 2, canvas.height / 2 + 70);
    ctx.fillText("Reach Grum's Lair!", canvas.width / 2, canvas.height / 2 + 90);

    ctx.font = '16px sans-serif';
    ctx.fillStyle = 'orange';
    ctx.fillText("Press Space to Start", canvas.width / 2, canvas.height / 2 + 130);
}

function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '30px sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 30);

    ctx.font = '20px sans-serif';
    ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 20);

    ctx.font = '16px sans-serif';
    ctx.fillText("Press 'C' to Continue or 'L' to Leave", canvas.width / 2, canvas.height / 2 + 60);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        drawStartScreen();
    } else if (gameOver) {
        drawGameOverScreen();
    }
    else {
        updatePipes();
        drawPipes();
        updateBird();
        drawBird();
    }

    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (!gameStarted) {
            gameStarted = true;
        } else if (!gameOver && !birdDead) {
            birdVelocity = jumpStrength;
        }
    }
    if (gameOver) {
        if (event.code === 'KeyC') {
            resetGame();
            gameStarted = true;
            gameOver = false;
        } else if (event.code === 'KeyL') {
            resetGame();
            gameOver = false;
        }
    }
});

resetGame();
gameLoop(); 