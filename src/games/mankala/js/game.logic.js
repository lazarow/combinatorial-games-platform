/**
 * Nazwa katalogu gry, potrzebne do wczytywanie skryptów.
 */
const gameId = "mankala";

const logicOfGame = {
    /**
     * Generuje stan początkowy gry.
     */
    generateInitialState() {
        return {
            player1: { pits: [4, 4, 4, 4, 4, 4], store: 0 },
            player2: { pits: [4, 4, 4, 4, 4, 4], store: 0 },
        };
    },
    /**
     * Funkcja oceny, która ocenia z punktu widzenia wskazanego gracza.
     */
    evaluateState(state, player) {
        return state[player].store;
    },
    /**
     * Funkcja generująca możliwe ruchy z wskazanego stanu dla gracza.
     */
    generateMoves(state, player) {
        const playerBoard = state[player].pits;
        const moves = [];
        for (let i = 0; i < 6; i++) {
            if (playerBoard[i] > 0) {
                moves.push(i);
            }
        }
        return moves;
    },
    /**
     * Funkcja generuje stan po wykonaniu wskazanego ruchu.
     */
    generateStateAfterMove(previousState, player, move) {
        const state = JSON.parse(JSON.stringify(previousState));
        let currentPlayer = player;
        let currentBoard = state[currentPlayer].pits;
        let currentStore = state[currentPlayer].store;
        const opponent = currentPlayer === "player1" ? "player2" : "player1";
        const opponentBoard = state[opponent].pits;
        let stones = currentBoard[move];
        currentBoard[move] = 0;
        let i = move + 1;
        let lastPit = -1;
        while (stones > 0) {
            if (i % 7 !== 6 || stones === 1) { // Only increment the store when the last stone is being placed
                if (i % 7 === 6) {
                    currentStore++;
                } else {
                    currentBoard[i % 7]++;
                }
                stones--;
                lastPit = i % 7;
            }
            i++;
        }
        state[currentPlayer].pits = currentBoard;
        state[currentPlayer].store = currentStore;
        if (lastPit !== 6) { // If the last stone didn't land in the store, switch players
            currentPlayer = currentPlayer === "player1" ? "player2" : "player1";
        }
        state[opponent].pits = opponentBoard;
        return state;
    },
    /**
     * Funkcja sprawdza czy stan jest terminalny, tzn. koniec gry.
     */
    isStateTerminal(state, player) {
        const opponent = player === "player1" ? "player2" : "player1";
        const allPitsEmpty = (pits) => pits.every(pit => pit === 0);
        if (allPitsEmpty(state[player].pits)) {
            state[player].store += state[opponent].pits.reduce((a, b) => a + b);
            state[opponent].pits = state[opponent].pits.map(() => 0);
            return true;
        }
        if (state.turns >= 300) {
            console.log("Too many turns");
            return true;
        }
        return false;
    },
    /**
     * Funkcja generująca unikalny klucz dla wskazanego stanu.
     */
    generateUniqueKey: undefined,
};

const players = [];
