// VARIÁVEIS DE ESTADO
let score = 0;
let fuel = 0;
let currentQuestion = {};

// Variáveis do Minigame
let isPlayingGame = false;
let gameTimer = 40;
let gameInterval;
let spawnInterval;
let animationFrameId;
let shipX = 50; // Posição horizontal em % (0 a 100)
const gameObjects = []; // Lista de asteroides e estrelas

// ELEMENTOS DOM
const elFuelBar = document.getElementById('fuel-bar');
const elScore = document.getElementById('score');
const elMathScreen = document.getElementById('math-screen');
const elSpaceScreen = document.getElementById('space-screen');
const elBtnExplore = document.getElementById('btn-explore');
const elInput = document.getElementById('user-answer');
const elMessage = document.getElementById('message-area');
const elNum1 = document.getElementById('num1');
const elNum2 = document.getElementById('num2');
const elOperator = document.getElementById('operator');
const elPlayerShip = document.getElementById('player-ship');
const elGameArea = document.getElementById('game-area');
const elTimer = document.getElementById('timer');

// INICIALIZAÇÃO
window.onload = function() {
    loadGame();
    generateQuestion();
    updateUI();
    
    // Controle da Nave (Mouse/Touch)
    elSpaceScreen.addEventListener('mousemove', moveShip);
    elSpaceScreen.addEventListener('touchmove', moveShipTouch, {passive: false});
};

// --- LÓGICA DO MATH QUIZ ---

function generateQuestion() {
    const type = Math.random() > 0.5 ? 'mult' : 'div';
    let a, b;

    if (type === 'mult') {
        a = Math.floor(Math.random() * 9) + 2; 
        b = Math.floor(Math.random() * 9) + 2;
        currentQuestion = { num1: a, num2: b, operator: 'x', answer: a * b };
    } else {
        let divisor = Math.floor(Math.random() * 9) + 2;
        let result = Math.floor(Math.random() * 9) + 2;
        let dividend = divisor * result;
        currentQuestion = { num1: dividend, num2: divisor, operator: '÷', answer: result };
    }

    elNum1.innerText = currentQuestion.num1;
    elNum2.innerText = currentQuestion.num2;
    elOperator.innerText = currentQuestion.operator;
    elInput.value = '';
    elInput.focus();
}

function checkAnswer() {
    const userVal = parseInt(elInput.value);
    if (isNaN(userVal)) return;

    if (userVal === currentQuestion.answer) {
        elMessage.innerText = "Correto! Combustível subindo.";
        elMessage.style.color = "#00ff00";
        fuel = Math.min(fuel + 20, 100); 
        score += 10;
        generateQuestion();
    } else {
        elMessage.innerText = "Ops! Tente novamente.";
        elMessage.style.color = "red";
    }
    updateUI();
    saveGame();
}

// --- LÓGICA DO MINIGAME ESPACIAL ---

function startExploration() {
    if (fuel < 100) return;

    // Troca de telas
    elMathScreen.classList.add('hidden');
    elSpaceScreen.classList.remove('hidden');
    elBtnExplore.classList.add('hidden'); // Esconde o botão até encher de novo

    // Reset do Minigame
    isPlayingGame = true;
    gameTimer = 40;
    fuel = 0; // Gasta o combustível para iniciar a viagem
    gameObjects.forEach(obj => obj.element.remove());
    gameObjects.length = 0; // Limpa array
    
    // Inicia Loops
    gameInterval = setInterval(updateTimer, 1000);
    spawnInterval = setInterval(spawnObject, 800); // Cria algo a cada 0.8s
    gameLoop();
}

function updateTimer() {
    gameTimer--;
    elTimer.innerText = gameTimer;
    if (gameTimer <= 0) endExploration();
}

function endExploration() {
    isPlayingGame = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    cancelAnimationFrame(animationFrameId);

    alert(`Fim da Exploração! Você coletou muitos pontos. Volte a calcular para abastecer.`);

    // Volta para o Math
    elSpaceScreen.classList.add('hidden');
    elMathScreen.classList.remove('hidden');
    updateUI();
    saveGame();
}

function spawnObject() {
    if (!isPlayingGame) return;

    const isStar = Math.random() > 0.7; // 30% chance de ser estrela
    const obj = document.createElement('div');
    obj.classList.add('game-object');
    obj.innerText = isStar ? '⭐' : '🪨'; 
    
    // Posição aleatória horizontal (10% a 90%)
    const posX = Math.random() * 80 + 10;
    obj.style.left = posX + '%';
    
    elGameArea.appendChild(obj);

    gameObjects.push({
        element: obj,
        x: posX,
        y: -10, // Começa acima da tela
        type: isStar ? 'star' : 'asteroid',
        speed: isStar ? 0.5 : 0.8 // Asteroides são mais rápidos
    });
}

function gameLoop() {
    if (!isPlayingGame) return;

    // Move objetos
    for (let i = gameObjects.length - 1; i >= 0; i--) {
        let obj = gameObjects[i];
        obj.y += obj.speed;
        obj.element.style.top = obj.y + '%';

        // Detecta Colisão
        if (checkCollision(obj)) {
            if (obj.type === 'star') {
                score += 50; // Pega estrela
                flashScreen('gold');
            } else {
                score = Math.max(0, score - 20); // Bate na pedra
                flashScreen('red');
            }
            // Remove objeto após colisão
            obj.element.remove();
            gameObjects.splice(i, 1);
            updateUI(); // Atualiza pontuação em tempo real
            continue;
        }

        // Remove se saiu da tela
        if (obj.y > 100) {
            obj.element.remove();
            gameObjects.splice(i, 1);
        }
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

// Detecção simples de colisão (aproximada pela % da tela)
function checkCollision(obj) {
    // Nave está fixa em Y (bottom 20px) ~ aprox 90% da altura
    // Nave X é shipX (%). Objeto X é obj.x (%).
    // Objeto Y é obj.y (%).
    
    const hitY = obj.y > 80 && obj.y < 95; // Zona de altura da nave
    const hitX = Math.abs(obj.x - shipX) < 8; // Zona de largura da nave (aprox)

    return hitY && hitX;
}

function flashScreen(color) {
    elSpaceScreen.style.borderColor = color;
    setTimeout(() => elSpaceScreen.style.borderColor = "#fff", 200);
}

// Movimento da Nave
function moveShip(e) {
    const rect = elGameArea.getBoundingClientRect();
    const x = e.clientX - rect.left; // X dentro da div
    shipX = (x / rect.width) * 100; // Converte para %
    elPlayerShip.style.left = shipX + '%';
}

function moveShipTouch(e) {
    e.preventDefault();
    const rect = elGameArea.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    shipX = (x / rect.width) * 100;
    elPlayerShip.style.left = shipX + '%';
}

// --- UTILITÁRIOS ---

function updateUI() {
    elFuelBar.style.width = fuel + '%';
    elScore.innerText = score;

    // Lógica do botão Explorar
    if (fuel >= 100) {
        elBtnExplore.classList.remove('hidden');
        elInput.disabled = true; // Trava input
        elMessage.innerText = "TANQUE CHEIO! Inicie a exploração.";
    } else {
        elBtnExplore.classList.add('hidden');
        elInput.disabled = false;
    }
}

elInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") checkAnswer();
});

function saveGame() {
    localStorage.setItem('mathGalaxySaveV2', JSON.stringify({ score, fuel }));
}

function loadGame() {
    const saved = localStorage.getItem('mathGalaxySaveV2');
    if (saved) {
        const data = JSON.parse(saved);
        score = data.score || 0;
        fuel = data.fuel || 0;
    }
}
