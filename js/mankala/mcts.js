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
        let playerStore = state[player].store;
        let seedsInLeftPit = state[player].pits[0];
        let sumOfSeeds = 0;
        for(let i = 0; i < 6; i++)
        {
            sumOfSeeds += state[player].pits[i];
        }
        let enemyScore = 48 - (sumOfSeeds + playerStore);
        let proximityToWin = (sumOfSeeds + playerStore)/(enemyScore * 1.5)
        return ( seedsInLeftPit * 0.23 + sumOfSeeds * 0.27 + playerStore + enemyScore * (-0.5) + proximityToWin * 0.35 ) * 100;
        /*
        wygrana zalezy od nast. zmiennych:
        1. Trzymaj nasiona w 1 pit od lewej *SeedsInLeftPit*
        2. Trzymaj jak nakwiecej nasion po swojej stronie *sumOfSeeds*
        3. Miej jak najwiecej nasion w storze *player.store*
        4. Utrzymuj jak najmniejsza ilosc nasion przeciwnika *enemyScore*
        5. Badz jak najblizej wygranej
        Wagi tych rozwiazan to:
        1. 0.23
        2. 0.27
        3. 1
        4. 0.50
        5. 0.35
        */
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
        let currentPits = state[currentPlayer].pits;
        let currentStore = state[currentPlayer].store;
    
        // Identify the opponent
        const opponent = currentPlayer === "player1" ? "player2" : "player1";
        let opponentPits = state[opponent].pits;
    
        // Get the stones from the selected pit
        let stones = currentPits[move];
        currentPits[move] = 0;
    
        // Begin sowing the stones
        let i = move + 1;
    
        // Sow stones until none are left
        while (stones > 0) {
            if (i === 6) {
                if (currentPlayer === player) {
                    currentStore++;
                    stones--;
                }
                i = (i + 1) % 14;
            } else if (i === 13) {
                if (currentPlayer !== player) {
                    opponentPits[6]++;
                    stones--;
                }
                i = (i + 1) % 14;
            } else {
                if (i < 6) {
                    currentPits[i]++;
                } else {
                    opponentPits[i - 7]++;
                }
                stones--;
                i = (i + 1) % 14;
            }
        }
    
        // Update the state
        state[currentPlayer].pits = currentPits;
        state[currentPlayer].store = currentStore;
        state[opponent].pits = opponentPits;
    
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

        // If all of the current player's pits are empty, add all remaining stones to the opponent's store and end the game
        if (allPitsEmpty(state[player].pits)) {
            state[opponent].store += state[opponent].pits.reduce((a, b) => a + b);
            state[opponent].pits = state[opponent].pits.map(() => 0);
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

const players = [
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (łatwy)", maxDepth: 3, printTree: true },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (średni)", maxDepth: 5, printTree: false },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (trudny)", maxDepth: 7, printTree: false },
];
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
