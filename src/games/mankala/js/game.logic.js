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

        // Loop through all pits
        for (let i = 0; i < 6; i++) {
            // If the pit is not empty, it's a valid move
            if (playerBoard[i] > 0) {
                moves.push(i);
            }
        }

        // Return an array of all valid moves
        return moves;
    },

    /**
     * Funkcja generuje stan po wykonaniu wskazanego ruchu.
     */
    generateStateAfterMove(previousState, player, move) {
        // Copy the previous state
        const state = JSON.parse(JSON.stringify(previousState));

        // Set up initial variables
        let currentPlayer = player;
        let currentBoard = state[currentPlayer].pits;
        let currentStore = state[currentPlayer].store;

        // Identify the opponent
        const opponent = currentPlayer === "player1" ? "player2" : "player1";
        const opponentBoard = state[opponent].pits;

        // Get the stones from the selected pit
        let stones = currentBoard[move];
        currentBoard[move] = 0;

        // Begin sowing the stones
        let i = move + 1;

        // Sow stones until none are left
        while (stones > 0) {
            // If at the store, increment if it's the current player's turn
            if (i % 7 === 6 && currentPlayer === player) {
                currentStore++;
                stones--;
            } else if (i % 7 !== 6) { // If not at the store, sow a stone
                currentBoard[i % 7]++;
                stones--;
            }

            // Move to the next pit or switch to the opponent's board if at the end
            i++;
            if (i > 6) {
                i = 0;
                currentBoard = opponentBoard;
                currentPlayer = opponent;
            }
        }

        // After sowing, check for capture condition and perform capture if condition is met
        const lastPitIndex = (i - 1) % 7;
        const lastPit = currentBoard[lastPitIndex];
        const oppositePit = opponentBoard[5 - lastPitIndex];
        if (currentPlayer === player && lastPit === 1 && oppositePit > 0) {
            currentStore += 1 + oppositePit;
            currentBoard[lastPitIndex] = 0;
            opponentBoard[5 - lastPitIndex] = 0;
        }

        // Update the state
        state[player].pits = state[player].pits;
        state[player].store = currentStore;
        state[opponent].pits = opponentBoard;

        return state;
    },

    /**
     * Funkcja sprawdza czy stan jest terminalny, tzn. koniec gry.
     */
    isStateTerminal(state, player) {
        // Identify opponent
        const opponent = player === "player1" ? "player2" : "player1";

        // Check if all pits are empty
        const allPitsEmpty = (pits) => pits.every(pit => pit === 0);

        // If all of the current player's pits are empty, add all remaining stones to their store and end the game
        if (allPitsEmpty(state[player].pits)) {
            state[player].store += state[opponent].pits.reduce((a, b) => a + b);
            state[opponent].pits = state[opponent].pits.map(() => 0);
            return true;
        }

        // If the game has exceeded a maximum number of turns, end the game
        if (state.turns >= 500) {
            console.log("Too many turns");
            return true;
        }

        // If neither are met, the game is not in a terminal state
        return false;
    },
    
    /**
     * Funkcja generująca unikalny klucz dla wskazanego stanu.
     */
    generateUniqueKey: undefined,
};

const players = [];
