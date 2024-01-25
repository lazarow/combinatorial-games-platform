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
const boardWidth = 8;
const boardHeight = 6;

const logicOfGame = {
    generateInitialState() {
        return {
            player1: [0, 3],
            player2: [7, 2],
            removed: [],
        };
    },
    evaluateState(state, player) {
        //const playerMoves = this.generateMoves(state, player);
        //const opponentMoves = this.generateMoves(state, player==="player1" ? "player2" : "player1");

        //const weightMoves = 0.3;
        //const weightIsolation = 0.7;

        // Funkcja oceny uwzględniająca dostępne ruchy i izolację przeciwnika
       // const evaluation = weightMoves * playerMoves + weightIsolation * opponentMoves;

       // return evaluation;

    },
    generateMoves(state, player) {
        const offsets = [
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1],
            [-1, 1],
            [-1, -1],
            [-1, 0],
        ];
        const moves = [];
        for (let i = 0; i < offsets.length; ++i) {
            const x = state[player][0] + offsets[i][0];
            const y = state[player][1] + offsets[i][1];
            if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight) {
                const invalidPositions = [state.player1, state.player2, ...state.removed];
                if (invalidPositions.some(([invalidX, invalidY]) => x === invalidX && y === invalidY) === false) {
                    for (let rx = 0; rx < boardWidth; rx++) {
                        for (let ry = 0; ry < boardHeight; ry++) {
                            const unremovablePositions = [
                                state[player === "player1" ? "player2" : "player1"],
                                [x, y],
                                ...state.removed
                            ];
                            if (unremovablePositions.some(([invX, invY]) => invX === rx && invY === ry) === false) {
                                moves.push([x, y, rx, ry]);
                            }
                        }
                    }
                }
            }
        }
        return moves;
    },
    generateStateAfterMove(previousState, player, move) {
        const state = {
            player1: [...previousState.player1],
            player2: [...previousState.player2],
            removed: [...previousState.removed],
        };
        state.removed.push([move[2], move[3]]);

        state[player] = [move[0], move[1]];

        return state;
    },
    isStateTerminal(state, player) {
        const availableMoves = this.generateMoves(state, player);
        return availableMoves.length === 0;
    },
    generateUniqueKey: undefined,
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
    if (node.children.length === 0)
    {
        return node
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
