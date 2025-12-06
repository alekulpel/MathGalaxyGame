// LISTA DE PLANETAS
const planets = [
    { name: "Terra", icon: "🌍" },
    { name: "Lua", icon: "🌑" },
    { name: "Marte", icon: "🔴" },
    { name: "Júpiter", icon: "🌕" },
    { name: "Saturno", icon: "🪐" },
    { name: "Urano", icon: "🌚" },
    { name: "Netuno", icon: "🔵" },
    { name: "Plutão", icon: "⚪" },
    { name: "Galáxia X", icon: "🌌" }
];

// VARIÁVEIS DE ESTADO
let score = 0;
let fuel = 0;
let currentPlanetIndex = 0; // Índice do planeta atual
let currentQuestion = {};

// Variáveis do Minigame
let isPlayingGame = false;
let gameTimer = 40;
let gameInterval, spawnInterval, animationFrameId;
let shipX = 50; 
const gameObjects = []; 

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
const elPlanetName = document.getElementById('current-planet-name');
const elPlanetIcon = document.getElementById('current-planet-icon');

// INICIALIZAÇÃO
window.onload = function() {
    loadGame();
    generateQuestion();
    updateUI();
    
    // Controles
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

    elMathScreen.classList.add('hidden');
    elSpaceScreen.classList.remove('hidden');
    elBtnExplore.classList.add('hidden');

    isPlayingGame = true;
    gameTimer = 40;
    fuel = 0; // Gasta combustível
    gameObjects.forEach(obj => obj.element.remove());
    gameObjects.length = 0;
    
    gameInterval = setInterval(updateTimer, 1000);
    spawnInterval = setInterval(spawnObject, 800);
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

    // MUDANÇA DE PLANETA
    currentPlanetIndex++;
    
    // Se chegou ao fim dos planetas, volta ao início (ou cria lógica de fim)
    if (currentPlanetIndex >= planets.length) {
        alert("PARABÉNS! Você conquistou toda a galáxia! Recomeçando a jornada...");
        currentPlanetIndex = 0;
        score += 1000; // Bônus
    } else {
        const nextPlanet = planets[currentPlanetIndex];
        alert(`Pouso bem-sucedido! Bem-vindo a: ${nextPlanet.name}`);
    }

    elSpaceScreen.classList.add('hidden');
    elMathScreen.classList.remove('hidden');
    updateUI();
    saveGame();
}

function spawnObject() {
    if (!isPlayingGame) return;

    const isStar = Math.random() > 0.7; 
    const obj = document.createElement('div');
    obj.classList.add('game-object');
    obj.innerText = isStar ? '⭐' : '🪨'; 
    
    const posX = Math.random() * 80 + 10;
    obj.style.left = posX + '%';
    
    elGameArea.appendChild(obj);

    gameObjects.push({
        element: obj,
        x: posX,
        y: -10,
        type: isStar ? 'star' : 'asteroid',
        speed: isStar ? 0.5 : 0.8
    });
}

function gameLoop() {
    if (!isPlayingGame) return;

    for (let i = gameObjects.length - 1; i >= 0; i--) {
        let obj = gameObjects[i];
        obj.y += obj.speed;
        obj.element.style.top = obj.y + '%';

        if (checkCollision(obj)) {
            if (obj.type === 'star') {
                score += 50;
                flashScreen('gold');
            } else {
                score = Math.max(0, score - 20);
                flashScreen('red');
            }
            obj.element.remove();
            gameObjects.splice(i, 1);
            updateUI();
            continue;
        }

        if (obj.y > 100) {
            obj.element.remove();
            gameObjects.splice(i, 1);
        }
    }
    animationFrameId = requestAnimationFrame(gameLoop);
}

function checkCollision(obj) {
    const hitY = obj.y > 80 && obj.y < 95;
    const hitX = Math.abs(obj.x - shipX) < 8;
    return hitY && hitX;
}

function flashScreen(color) {
    elSpaceScreen.style.borderColor = color;
    setTimeout(() => elSpaceScreen.style.borderColor = "#fff", 200);
}

function moveShip(e) {
    const rect = elGameArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    shipX = (x / rect.width) * 100;
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

    // Atualiza info do Planeta
    const currentPlanet = planets[currentPlanetIndex];
    elPlanetName.innerText = currentPlanet.name;
    elPlanetIcon.innerText = currentPlanet.icon;

    if (fuel >= 100) {
        elBtnExplore.classList.remove('hidden');
        elInput.disabled = true;
        elMessage.innerText = "PRONTO PARA DECOLAR!";
    } else {
        elBtnExplore.classList.add('hidden');
        elInput.disabled = false;
    }
}

elInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") checkAnswer();
});

function saveGame() {
    const gameState = {
        score: score,
        fuel: fuel,
        planetIdx: currentPlanetIndex
    };
    localStorage.setItem('mathGalaxySaveV3', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('mathGalaxySaveV3');
    if (saved) {
        const data = JSON.parse(saved);
        score = data.score || 0;
        fuel = data.fuel || 0;
        currentPlanetIndex = data.planetIdx || 0;
    }
}
