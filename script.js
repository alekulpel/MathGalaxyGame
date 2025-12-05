// Configurações do Jogo
const planets = [
    { name: "Lua", icon: "🌑", distance: 50 },
    { name: "Marte", icon: "🪐", distance: 100 },
    { name: "Júpiter", icon: "🌕", distance: 200 },
    { name: "Saturno", icon: "🪐", distance: 300 },
    { name: "Netuno", icon: "🌍", distance: 400 },
    { name: "Galáxia X", icon: "🌌", distance: 500 }
];

let currentPlanetIndex = 0;
let fuel = 10; 
let score = 0;
let distanceTraveled = 0;
let currentQuestion = {};

const elNum1 = document.getElementById('num1');
const elNum2 = document.getElementById('num2');
const elOperator = document.getElementById('operator');
const elInput = document.getElementById('user-answer');
const elMessage = document.getElementById('message-area');
const elFuelBar = document.getElementById('fuel-bar');
const elPlanetName = document.getElementById('planet-name');
const elPlanetIcon = document.getElementById('planet-icon');
const elScore = document.getElementById('score');
const elKmLeft = document.getElementById('km-left');

window.onload = function() {
    loadGame();
    generateQuestion();
    updateUI();
};

function generateQuestion() {
    // Decide aleatoriamente se é multiplicação (0) ou divisão (1)
    const type = Math.random() > 0.5 ? 'mult' : 'div';
    
    let a, b;

    if (type === 'mult') {
        // Multiplicação: Números de 2 a 9 
        a = Math.floor(Math.random() * 8) + 2; 
        b = Math.floor(Math.random() * 8) + 2;
        currentQuestion = {
            num1: a,
            num2: b,
            operator: 'x',
            answer: a * b
        };
    } else {
        let divisor = Math.floor(Math.random() * 8) + 2;
        let result = Math.floor(Math.random() * 9) + 2;
        let dividend = divisor * result; // Garante que dividend / divisor = inteiro

        currentQuestion = {
            num1: dividend,
            num2: divisor,
            operator: '÷',
            answer: result
        };
    }

    elNum1.innerText = currentQuestion.num1;
    elNum2.innerText = currentQuestion.num2;
    elOperator.innerText = currentQuestion.operator;
    elInput.value = '';
    elInput.focus();
}

function checkAnswer() {
    const userVal = parseInt(elInput.value);

    if (isNaN(userVal)) {
        elMessage.innerText = "Digite um número!";
        elMessage.style.color = "yellow";
        return;
    }

    if (userVal === currentQuestion.answer) {
        // Acertou
        elMessage.innerText = "Combustível abastecido! Nave avançando...";
        elMessage.style.color = "#00ff00";
        fuel = Math.min(fuel + 20, 100); 
        score += 10;
        travel();
        generateQuestion();
    } else {
        // Errou
        elMessage.innerText = "Cálculo incorreto. Motores falhando!";
        elMessage.style.color = "red";
        fuel = Math.max(fuel - 10, 0); 
    }
    updateUI();
    saveGame();
}

function travel() {
    // A cada acerto, viaja 10 anos-luz
    distanceTraveled += 10;
    
    // Verifica se chegou ao próximo planeta
    let target = planets[currentPlanetIndex].distance;
    if (distanceTraveled >= target) {
        if (currentPlanetIndex < planets.length - 1) {
            currentPlanetIndex++;
            alert(`Parabéns! Você chegou em ${planets[currentPlanetIndex-1].name}! Próxima parada: ${planets[currentPlanetIndex].name}`);
        } else {
            alert("VOCÊ CONQUISTOU A GALÁXIA! Jogo zerado!");
            distanceTraveled = 0;
            currentPlanetIndex = 0;
            score = 0;
        }
    }
}

function updateUI() {
    elFuelBar.style.width = fuel + '%';    
    if(fuel < 20) elFuelBar.style.background = "red";
    else elFuelBar.style.background = "linear-gradient(90deg, #ff4b1f, #ff9068)";

    elScore.innerText = score;
    
    let currentPlanet = planets[currentPlanetIndex];
    elPlanetName.innerText = currentPlanet.name;
    elPlanetIcon.innerText = currentPlanet.icon;
    
    let distLeft = currentPlanet.distance - distanceTraveled;
    elKmLeft.innerText = Math.max(distLeft, 0);
}
elInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        checkAnswer();
    }
});

function saveGame() {
    const gameState = {
        score: score,
        fuel: fuel,
        distance: distanceTraveled,
        planetIdx: currentPlanetIndex
    };
    localStorage.setItem('mathGalaxySave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('mathGalaxySave');
    if (saved) {
        const data = JSON.parse(saved);
        score = data.score;
        fuel = data.fuel;
        distanceTraveled = data.distance;
        currentPlanetIndex = data.planetIdx;
    }
}
