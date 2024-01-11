/**
 * Nazwa katalogu gry, potrzebne do wczytywanie skryptów.
 */
const gameId = "5Across";

const logicOfGame = {
    generateInitialState() {
        const numRows = 6; // Number of rows in the game grid
        const numCols = 7; // Number of columns in the game grid

        // Create an empty game grid
        const initialState = [];
        for (let row = 0; row < numRows; row++) {
            initialState.push(Array(numCols).fill(null));
        }

        return initialState;
    },

    evaluateState(state, player) {
        const checkWinner = (line) => {
            const playerCount = line.filter((cell) => cell === player).length;
            const opponentCount = line.filter((cell) => cell !== player && cell !== null).length;

            // If the line has five or more consecutive player pieces, return a positive score
            if (playerCount >= 5) {
                return 100;
            }

            // If the line has five or more consecutive opponent pieces, return a negative score
            if (opponentCount >= 5) {
                return -100;
            }

            return 0; // Neutral state
        };

        // Check rows
        for (let row = 0; row < state.length; row++) {
            for (let col = 0; col <= state[row].length - 5; col++) {
                const line = state[row].slice(col, col + 5);
                const score = checkWinner(line);
                if (score !== 0) {
                    return score;
                }
            }
        }

        // Check columns
        for (let col = 0; col < state[0].length; col++) {
            for (let row = 0; row <= state.length - 5; row++) {
                const line = [
                    state[row][col],
                    state[row + 1][col],
                    state[row + 2][col],
                    state[row + 3][col],
                    state[row + 4][col],
                ];
                const score = checkWinner(line);
                if (score !== 0) {
                    return score;
                }
            }
        }

        // Check diagonals (from top-left to bottom-right)
        for (let row = 0; row <= state.length - 5; row++) {
            for (let col = 0; col <= state[row].length - 5; col++) {
                const line = [
                    state[row][col],
                    state[row + 1][col + 1],
                    state[row + 2][col + 2],
                    state[row + 3][col + 3],
                    state[row + 4][col + 4],
                ];
                const score = checkWinner(line);
                if (score !== 0) {
                    return score;
                }
            }
        }

        // Check diagonals (from top-right to bottom-left)
        for (let row = 0; row <= state.length - 5; row++) {
            for (let col = 4; col < state[row].length; col++) {
                const line = [
                    state[row][col],
                    state[row + 1][col - 1],
                    state[row + 2][col - 2],
                    state[row + 3][col - 3],
                    state[row + 4][col - 4],
                ];
                const score = checkWinner(line);
                if (score !== 0) {
                    return score;
                }
            }
        }

        return 0; // No winner yet
    },

    generateMoves(state, player) {
        // Implement the logic to generate possible moves for the specified player
        // You might return an array of valid column indices where the player can make a move

        const validMoves = [];
        for (let col = 0; col < state[0].length; col++) {
            // Check if the column is not full
            if (state[0][col] === null) {
                validMoves.push(col);
            }
        }

        return validMoves;
    },

    generateStateAfterMove(previousState, player, move) {
        // Implement the logic to generate the state after a move is made
        // You need to find the lowest empty row in the selected column and place the player's piece there

        const newState = JSON.parse(JSON.stringify(previousState)); // Deep copy to avoid modifying the original state
        for (let row = newState.length - 1; row >= 0; row--) {
            if (newState[row][move] === null) {
                newState[row][move] = player;
                break;
            }
        }

        return newState;
    },

    isStateTerminal(state, player) {
        // Implement the logic to check if the game state is terminal (game over)
        // You might check for a winner or a full board

        const isBoardFull = state.every((row) => row.every((cell) => cell !== null));
        const winnerScore = this.evaluateState(state, player);

        return isBoardFull || Math.abs(winnerScore) === 100;
    },

    generateUniqueKey(state) {
        // Implement the logic to generate a unique key for the game state
        // You might serialize the state into a string for simplicity
        return JSON.stringify(state);
    },
    computeMCTSNodeValue(node) {
        const explorationParam = 0.8; // You can adjust this parameter
        return node.reward / node.visits + explorationParam * Math.sqrt(Math.log(node.parent.visits) / node.visits);
    },
    /**
     * Funkcja rozgrywa losową symulację startując od zadanego stanu i gracza (state i player) i zwraca 1 jeżeli
     * symulacja zostaje ostatecznie wygrana przez gracza, -1 jeżeli przez jego przeciwnika, 0 dla remisów.
     * Proszę zwrócić uwagę na kolejność węzłów!
     */
    MCTSPlayOut(node) {
        let state = node.state;
        let player = node.player;

        while (this.isStateTerminal(state, player) === false) {
            const moves = this.generateMoves(state, player);

            // Blocking strategy: Prioritize moves that block the opponent
            const blockingMoves = moves.filter((move) => {
                const nextState = this.generateStateAfterMove(
                    state,
                    player === "player1" ? "player2" : "player1",
                    move
                );
                return this.evaluateState(nextState, player === "player1" ? "player2" : "player1") === 100;
            });

            const move = blockingMoves.length > 0 ? blockingMoves[0] : moves[Math.floor(Math.random() * moves.length)];

            state = this.generateStateAfterMove(state, player, move);
            player = player === "player1" ? "player2" : "player1";
        }

        return player === node.player ? 1 : -1;
    },

    chooseMove(state, player, moves) {
        // Check for potential opponent wins and prioritize blocking
        for (const move of moves) {
            const nextState = this.generateStateAfterMove(state, player === "player1" ? "player2" : "player1", move);
            if (this.evaluateState(nextState, player === "player1" ? "player2" : "player1") === 100) {
                return move; // Block the opponent's potential win
            }
        }

        // If no potential wins to block, choose a random move
        return moves[Math.floor(Math.random() * moves.length)];
    },
    /**
     * Funkcja przyjmuje na wejście węzeł drzewa MCTS i wybiera najlepszy ruch (kolejny węzeł) wg obranej strategii (np. najwięcej wizyt).
     */
    getBestMCTSNode(node) {
        let bestNode = node.children[0];
        for (let i = 1; i < node.children.length; ++i) {
            if (node.children[i].visits > bestNode.visits) {
                bestNode = node.children[i];
            }
        }
        return bestNode;
    },
};

const players = [
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (łatwy)", maxDepth: 2, printTree: true },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (średni)", maxDepth: 4, printTree: false },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (trudny)", maxDepth: 7, printTree: false },
    { type: PlayerTypes.MCTS, label: "MCTS (łatwy)", iterations: 2000 },
    { type: PlayerTypes.MCTS, label: "MCTS (średni)", iterations: 5000 },
    { type: PlayerTypes.MCTS, label: "MCTS (trudny)", iterations: 10000 },
];
