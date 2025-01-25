/** 
 * Filnavn: script.js
 * Beskrivelse: Spillkontroller for et disk-golf-spill med både solo og flerspiller-modus. 
 * Denne koden håndterer brukergrensesnittet, WebSocket-tilkobling og spilltilstanden.
 * Funksjonalitet inkluderer spillstart, poengsummer, kast, mål, og spillets avslutning.
 * 
 * Utvikler: Martin Pettersen
 */



const soloGameBtn = document.getElementById('solo-game-btn');
const multiPlayerBtn = document.getElementById('multi-player-btn');
const playerNamesDiv = document.getElementById('player-names');
const playerNameInput = document.getElementById('player-name');
const addPlayerBtn = document.getElementById('add-player-btn');
const playersListDiv = document.getElementById('players-list');
const startGameBtn = document.getElementById('start-game-btn');
const gameBoardDiv = document.getElementById('game-board');
const throwButton = document.getElementById('throw-button');
const goalButton = document.getElementById('goal-button');
const restartButton = document.getElementById('restart-button');
const exitButton = document.getElementById('exit-button'); // Exit button
const turnMessage = document.getElementById('turn-message');
const castCountElement = document.getElementById('cast-count');
const scoreElement = document.getElementById('score');
const obCountElement = document.getElementById('ob-count');
const parCountElement = document.getElementById('par-count');
const completedHolesElement = document.getElementById('completed-holes'); // Fullførte hull
const gameOverMessage = document.getElementById('game-over-message'); // Melding ved spill slutt

let ws;
let players = [];
let currentPlayerIndex = 0;
// let gameStarted = false;
let castCount = 0;
let score = 0;
let obCount = 0;
let parCount = 0;
let completedHoles = 0; // Antall fullførte hull
let totalHoles = 10; // Maks 10 hull
let pointsPerHole = 2; // Poeng per hull
let gameStartTime = null; // Tid for å starte spillet

soloGameBtn.addEventListener('click', () => {
    players = [{ name: 'Spiller 1' }];
    startGame();
});

multiPlayerBtn.addEventListener('click', () => {
    playerNamesDiv.style.display = 'block';
    multiPlayerBtn.style.display = 'none';
});

addPlayerBtn.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        players.push({ name: playerName });
        updatePlayersList();
        playerNameInput.value = '';
    }
});

startGameBtn.addEventListener('click', () => {
    startGame();
});

throwButton.addEventListener('click', () => {
    if (ws) {
        ws.send(JSON.stringify({ type: 'throw', player: players[currentPlayerIndex].name }));
        castCount++;
        updateScoreBoard();
    }
});

goalButton.addEventListener('click', () => {
    if (ws) {
        ws.send(JSON.stringify({ type: 'goal', player: players[currentPlayerIndex].name }));
        score += pointsPerHole; // Legg til poeng for å treffe kurven
        completedHoles++; // Øk antall fullførte hull
        updateScoreBoard();
    }

    // Hvis 10 hull er fullført, stopper spillet
    if (completedHoles === totalHoles) {
        endGame();
    }
});

restartButton.addEventListener('click', () => {
    // Reset game and start new game
    startGame();
});

exitButton.addEventListener('click', () => {
    // Reset the game to the start screen
    gameBoardDiv.style.display = 'none';
    soloGameBtn.style.display = 'inline-block';
    multiPlayerBtn.style.display = 'inline-block';
    playerNamesDiv.style.display = 'none';
    playersListDiv.innerHTML = '';
    startGameBtn.style.display = 'none';
    exitButton.style.display = 'none';  // Hide exit button
    resetScoreBoard();
    gameOverMessage.style.display = 'none';  // Hide game over message
});

function updatePlayersList() {
    playersListDiv.innerHTML = '';
    players.forEach(player => {
        const playerElement = document.createElement('div');
        playerElement.textContent = player.name;
        playersListDiv.appendChild(playerElement);
    });
    startGameBtn.style.display = 'block';
}

function startGame() {
    gameStarted = true;
    gameStartTime = new Date(); // Start tracking time
    playerNamesDiv.style.display = 'none';
    gameBoardDiv.style.display = 'block';
    soloGameBtn.style.display = 'none';
    multiPlayerBtn.style.display = 'none';
    exitButton.style.display = 'inline-block';  // Show exit button

    // Reset all game states
    resetScoreBoard();
    gameOverMessage.style.display = 'none'; // Hide the game over message
    
    // Lukk eksisterende WebSocket-tilkobling før vi starter på nytt
    if (ws) {
        ws.close();
    }

    // Start WebSocket connection
    ws = new WebSocket('wss://diskgolf-g11-6bc74f8b60cb.herokuapp.com'); // Bruk din Heroku URL her
    ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'start', players }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'turn') {
            currentPlayerIndex = data.currentPlayerIndex;
            turnMessage.textContent = `${players[currentPlayerIndex].name}'s tur`;
        } else if (data.type === 'goal') {
            turnMessage.textContent = `${players[currentPlayerIndex].name} har truffet kurv!`;
        }
    };
}

function updateScoreBoard() {
    castCountElement.textContent = castCount;
    scoreElement.textContent = score;
    obCountElement.textContent = obCount;
    parCountElement.textContent = parCount;
    completedHolesElement.textContent = completedHoles; // Vis antall fullførte hull
}

function resetScoreBoard() {
    castCount = 0;
    score = 0;
    obCount = 0;
    parCount = 0;
    completedHoles = 0; // Reset completed holes
    updateScoreBoard();
}

function endGame() {
    // Calculate time taken for the game
    const gameEndTime = new Date();
    const timeTaken = Math.round((gameEndTime - gameStartTime) / 1000); // Time in seconds

    const averageScore = (score / completedHoles).toFixed(2);

    // Display final game message with "Nytt spill" and "Avslutt spill" buttons
    gameOverMessage.innerHTML = `
        <h2>Gratulerer!</h2>
        <p>Poengsum: ${score}</p>
        <p>Gjennomsnitt per hull: ${averageScore}</p>
        <p>Tid brukt: ${timeTaken} sekunder</p>
        <button id="restart-button" style="display:block;" onclick="startGame()">Nytt spill</button>
        <button id="exit-button" style="display:block;" onclick="exitGame()">Avslutt spill</button>
    `;

    gameBoardDiv.style.display = 'none';
    gameOverMessage.style.display = 'block';  // Show the game over message
}

// Knytt exitGame-funksjonen til knappen
exitButton.addEventListener('click', exitGame);

// Funksjonen for å håndtere utgang
function exitGame() {
  // Reset to the start page
  gameBoardDiv.style.display = 'none';
  soloGameBtn.style.display = 'inline-block';
  multiPlayerBtn.style.display = 'inline-block';
  playerNamesDiv.style.display = 'none';
  playersListDiv.innerHTML = '';
  startGameBtn.style.display = 'none';
  exitButton.style.display = 'none';
  gameOverMessage.style.display = 'none'; // Skjul spill slutt meldingen
}
