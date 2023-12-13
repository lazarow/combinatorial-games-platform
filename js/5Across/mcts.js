/**
 * Deklaracja identyfikatorów dla graczy.
 * Gdzie przez gracza rozumiany jest algorytm lub moduł interakcji z człowiekiem.
 */
const PlayerTypes = {
    HUMAN: "human",
    RANDOM: "random",
    SIMPLE_SCORE: "simple-score",
    ALPHABETA: "alphabeta",
    MCTS: "mcts",
};
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
            const playerCount = line.filter(cell => cell === player).length;
            const opponentCount = line.filter(cell => cell !== player && cell !== null).length;

            // If the line has five consecutive player pieces, return a positive score
            if (playerCount === 5) {
                return 100;
            }

            // If the line has five consecutive opponent pieces, return a negative score
            if (opponentCount === 5) {
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
                const line = [state[row][col], state[row + 1][col], state[row + 2][col], state[row + 3][col], state[row + 4][col]];
                const score = checkWinner(line);
                if (score !== 0) {
                    return score;
                }
            }
        }

        // Check diagonals (from top-left to bottom-right)
        for (let row = 0; row <= state.length - 5; row++) {
            for (let col = 0; col <= state[row].length - 5; col++) {
                const line = [state[row][col], state[row + 1][col + 1], state[row + 2][col + 2], state[row + 3][col + 3], state[row + 4][col + 4]];
                const score = checkWinner(line);
                if (score !== 0) {
                    return score;
                }
            }
        }

        // Check diagonals (from top-right to bottom-left)
        for (let row = 0; row <= state.length - 5; row++) {
            for (let col = 4; col < state[row].length; col++) {
                const line = [state[row][col], state[row + 1][col - 1], state[row + 2][col - 2], state[row + 3][col - 3], state[row + 4][col - 4]];
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

        const isBoardFull = state.every(row => row.every(cell => cell !== null));
        const winnerScore = this.evaluateState(state, player);

        return isBoardFull || Math.abs(winnerScore) === 100;
    },

    generateUniqueKey(state) {
        // Implement the logic to generate a unique key for the game state
        // You might serialize the state into a string for simplicity
        return JSON.stringify(state);
    },
};


const players = [];
class Node {
    constructor(state, player) {
        this.state = state;
        this.player = player;
        this.parent = null;
        this.move = null;
        this.visits = 0;
        this.reward = 0;
        this.isLeaf = logicOfGame.isStateTerminal(state, player);
        this.unexpandedMoves = this.isLeaf ? [] : logicOfGame.generateMoves(state, player);
        this.unexpandedMoves = this.unexpandedMoves.sort(() => 0.5 - Math.random());
        this.children = [];
    }
}

/**
 * @param {Node} node
 * @returns
 */
function select(node, C) {
    if (node.isLeaf) {
        return node;
    }
    if (node.unexpandedMoves.length > 0) {
        return expand(node);
    }
    let bestNode = node.children[0];
    let bestValue = logicOfGame.computeMCTSNodeValue(node.children[0]);
    for (let i = 1; i < node.children.length; ++i) {
        let childValue = logicOfGame.computeMCTSNodeValue(node.children[i]);
        if (childValue > bestValue) {
            bestNode = node.children[i];
            bestValue = childValue;
        }
    }
    return select(bestNode);
}

function expand(node) {
    const move = node.unexpandedMoves.pop();
    const child = new Node(
        logicOfGame.generateStateAfterMove(node.state, node.player, move),
        node.player === "player1" ? "player2" : "player1"
    );
    child.move = move;
    child.parent = node;
    node.children.push(child);
    return child;
}

function backPropagation(node, reward) {
    node.visits += 1;
    node.reward += reward;
    if (node.parent !== null) {
        backPropagation(node.parent, -reward);
    }
}

this.addEventListener(
    "message",
    function (e) {
        const root = new Node(e.data.state, e.data.player);
        let iterations = e.data.iterations;
        while (iterations > 0) {
            const node = select(root);
            const reward = logicOfGame.MCTSPlayOut(node);
            backPropagation(node, reward);
            iterations--;
        }
        let bestNode = logicOfGame.getBestMCTSNode(root);
        this.postMessage([bestNode.move]);
    },
    false
);
