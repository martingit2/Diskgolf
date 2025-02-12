/** 
 * Filnavn: server.js
 * Beskrivelse: Serverapplikasjon som bruker Express, WebSocket og Next.js for å sette opp et sanntidsspill.
 * Spillerhåndtering skjer via WebSocket, mens Next.js håndterer servering av webinnhold. 
 * Serveren tillater opp til 10 spillere å koble til og starte et spill.
 * 
 * Utvikler: Martin Pettersen
 */



import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import next from 'next';

// Konverter for ES-moduler
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Serve statiske filer fra public-mappen for spillet på /spill
app.use('/spill', express.static(path.join(__dirname, 'public')));

// Route for å serve index.html når noen går til "/spill"
app.get('/spill', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let waitingPlayers = [];
let games = [];

// WebSocket-håndtering
wss.on('connection', (ws) => {
    console.log('En spiller har koblet til');
    waitingPlayers.push(ws);

    if (waitingPlayers.length >= 1 && waitingPlayers.length <= 10) {
        const players = waitingPlayers.splice(0, 10);
        const game = {
            players: players,
            currentPlayerIndex: 0,
            scores: Array(players.length).fill(0),
            hole: 1,
            gameOver: false
        };

        games.push(game);

        game.players.forEach(player => player.send(JSON.stringify({
            type: 'start',
            players: game.players.map(p => ({ name: p.name })),
            currentPlayer: game.players[game.currentPlayerIndex]
        })));

        console.log('Spill startet med spillere:', players);
    }

    ws.on('close', () => {
        console.log('Spiller koblet fra');
        waitingPlayers = waitingPlayers.filter(player => player !== ws);
    });
});

// Håndter alle andre ruter med Next.js
nextApp.prepare().then(() => {
    app.all('*', (req, res) => nextHandler(req, res));

    const port = process.env.PORT || 5001;
    server.listen(port, () => {
        console.log(`Server kjører på port ${port}`);
    });
});
