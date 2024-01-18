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
const boardWidth = 5;
const boardHeight = 5;

const gameId = "kingsvalley";
const logicOfGame = {
    generateInitialState() {
        return {
            player1: [0, 0, 1, 0, 2, 0, 3, 0, 4, 0],
            player2: [0, 4, 1, 4, 2, 4, 3, 4, 4, 4],
            highlighted: [],
            player1FirstTurn: true,
        };
    },
    evaluateState(state, player) {
        const opponent = player === "player1" ? "player2" : "player1";
        let playerKingMoves = 0, opponentKingMoves = 0;
        const availablePlayerMoves = this.generateMoves(state, player);
        const availableOpponentMoves = this.generateMoves(state, opponent);
        availablePlayerMoves.forEach(move => {
            if (move[0] === 2) playerKingMoves++;
        })
        availableOpponentMoves.forEach(move => {
            if (move[0] === 2) opponentKingMoves++;
        })
        var score = 0;
        if ((state[player][4] === 2 && state[player][5] === 2) || (opponentKingMoves === 0)) {
            score += 999;
        } else if ((state[opponent][4] === 2 && state[opponent][5] === 2) || (playerKingMoves === 0)) {
            score -= 999;
        }
        if (state[player][0] == 1 && state[player][1] == 2 ||
            state[player][2] == 1 && state[player][3] == 2 ||
            state[player][4] == 1 && state[player][5] == 2 ||
            state[player][6] == 1 && state[player][7] == 2 ||
            state[player][8] == 1 && state[player][9] == 2 ||
            state[opponent][0] == 1 && state[opponent][1] == 2 ||
            state[opponent][2] == 1 && state[opponent][3] == 2 ||
            state[opponent][4] == 1 && state[opponent][5] == 2 ||
            state[opponent][6] == 1 && state[opponent][7] == 2 ||
            state[opponent][8] == 1 && state[opponent][9] == 2
        ) {
            if ((state[player][4] == 3 && state[player][5] == 2) || state[player][4] == 4 && state[player][5] == 2) {
                score -= 20;
            }
            if ((state[opponent][4] == 3 && state[opponent][5] == 2) || state[opponent][4] == 4 && state[opponent][5] == 2) {
                score += 20;
            }
            score--;
        }
        if (state[player][0] == 1 && state[player][1] == 3 ||
            state[player][2] == 1 && state[player][3] == 3 ||
            state[player][4] == 1 && state[player][5] == 3 ||
            state[player][6] == 1 && state[player][7] == 3 ||
            state[player][8] == 1 && state[player][9] == 3 ||
            state[opponent][0] == 1 && state[opponent][1] == 3 ||
            state[opponent][2] == 1 && state[opponent][3] == 3 ||
            state[opponent][4] == 1 && state[opponent][5] == 3 ||
            state[opponent][6] == 1 && state[opponent][7] == 3 ||
            state[opponent][8] == 1 && state[opponent][9] == 3
        ) {
            if ((state[player][4] == 3 && state[player][5] == 1) || state[player][4] == 4 && state[player][5] == 0) {
                score -= 20;
            }
            if ((state[opponent][4] == 3 && state[opponent][5] == 1) || state[opponent][4] == 4 && state[opponent][5] == 0) {
                score += 20;
            }
            score--;
        }
        if (state[player][0] == 2 && state[player][1] == 3 ||
            state[player][2] == 2 && state[player][3] == 3 ||
            state[player][4] == 2 && state[player][5] == 3 ||
            state[player][6] == 2 && state[player][7] == 3 ||
            state[player][8] == 2 && state[player][9] == 3 ||
            state[opponent][0] == 2 && state[opponent][1] == 3 ||
            state[opponent][2] == 2 && state[opponent][3] == 3 ||
            state[opponent][4] == 2 && state[opponent][5] == 3 ||
            state[opponent][6] == 2 && state[opponent][7] == 3 ||
            state[opponent][8] == 2 && state[opponent][9] == 3
        ) {
            if ((state[player][4] == 2 && state[player][5] == 1) || state[player][4] == 2 && state[player][5] == 0) {
                score -= 20;
            }
            if ((state[opponent][4] == 2 && state[opponent][5] == 1) || state[opponent][4] == 2 && state[opponent][5] == 0) {
                score += 20;
            }
            score--;
        }
        if (state[player][0] == 3 && state[player][1] == 3 ||
            state[player][2] == 3 && state[player][3] == 3 ||
            state[player][4] == 3 && state[player][5] == 3 ||
            state[player][6] == 3 && state[player][7] == 3 ||
            state[player][8] == 3 && state[player][9] == 3 ||
            state[opponent][0] == 3 && state[opponent][1] == 3 ||
            state[opponent][2] == 3 && state[opponent][3] == 3 ||
            state[opponent][4] == 3 && state[opponent][5] == 3 ||
            state[opponent][6] == 3 && state[opponent][7] == 3 ||
            state[opponent][8] == 3 && state[opponent][9] == 3
        ) {
            if ((state[player][4] == 1 && state[player][5] == 1) || state[player][4] == 0 && state[player][5] == 0) {
                score -= 20;
            }
            if ((state[opponent][4] == 1 && state[opponent][5] == 1) || state[opponent][4] == 0 && state[opponent][5] == 0) {
                score += 20;
            }
            score--;
        }
        if (state[player][0] == 3 && state[player][1] == 2 ||
            state[player][2] == 3 && state[player][3] == 2 ||
            state[player][4] == 3 && state[player][5] == 2 ||
            state[player][6] == 3 && state[player][7] == 2 ||
            state[player][8] == 3 && state[player][9] == 2 ||
            state[opponent][0] == 3 && state[opponent][1] == 2 ||
            state[opponent][2] == 3 && state[opponent][3] == 2 ||
            state[opponent][4] == 3 && state[opponent][5] == 2 ||
            state[opponent][6] == 3 && state[opponent][7] == 2 ||
            state[opponent][8] == 3 && state[opponent][9] == 2
        ) {
            if ((state[player][4] == 1 && state[player][5] == 2) || state[player][4] == 0 && state[player][5] == 2) {
                score -= 20;
            }
            if ((state[opponent][4] == 1 && state[opponent][5] == 2) || state[opponent][4] == 0 && state[opponent][5] == 2) {
                score += 20;
            }
            score--;
        }
        if (state[player][0] == 3 && state[player][1] == 1 ||
            state[player][2] == 3 && state[player][3] == 1 ||
            state[player][4] == 3 && state[player][5] == 1 ||
            state[player][6] == 3 && state[player][7] == 1 ||
            state[player][8] == 3 && state[player][9] == 1 ||
            state[opponent][0] == 3 && state[opponent][1] == 1 ||
            state[opponent][2] == 3 && state[opponent][3] == 1 ||
            state[opponent][4] == 3 && state[opponent][5] == 1 ||
            state[opponent][6] == 3 && state[opponent][7] == 1 ||
            state[opponent][8] == 3 && state[opponent][9] == 1
        ) {
            if ((state[player][4] == 1 && state[player][5] == 3) || state[player][4] == 0 && state[player][5] == 4) {
                score -= 20;
            }
            if ((state[opponent][4] == 1 && state[opponent][5] == 3) || state[opponent][4] == 0 && state[opponent][5] == 4) {
                score += 20;
            }
            score--;
        }
        if (state[player][0] == 2 && state[player][1] == 1 ||
            state[player][2] == 2 && state[player][3] == 1 ||
            state[player][4] == 2 && state[player][5] == 1 ||
            state[player][6] == 2 && state[player][7] == 1 ||
            state[player][8] == 2 && state[player][9] == 1 ||
            state[opponent][0] == 2 && state[opponent][1] == 1 ||
            state[opponent][2] == 2 && state[opponent][3] == 1 ||
            state[opponent][4] == 2 && state[opponent][5] == 1 ||
            state[opponent][6] == 2 && state[opponent][7] == 1 ||
            state[opponent][8] == 2 && state[opponent][9] == 1
        ) {
            if ((state[player][4] == 2 && state[player][5] == 3) || state[player][4] == 2 && state[player][5] == 4) {
                score -= 20;
            }
            if ((state[opponent][4] == 2 && state[opponent][5] == 3) || state[opponent][4] == 2 && state[opponent][5] == 4) {
                score += 20;
            }
            score--;
        }
        if (state[player][0] == 1 && state[player][1] == 1 ||
            state[player][2] == 1 && state[player][3] == 1 ||
            state[player][4] == 1 && state[player][5] == 1 ||
            state[player][6] == 1 && state[player][7] == 1 ||
            state[player][8] == 1 && state[player][9] == 1 ||
            state[opponent][0] == 1 && state[opponent][1] == 1 ||
            state[opponent][2] == 1 && state[opponent][3] == 1 ||
            state[opponent][4] == 1 && state[opponent][5] == 1 ||
            state[opponent][6] == 1 && state[opponent][7] == 1 ||
            state[opponent][8] == 1 && state[opponent][9] == 1
        ) {
            if ((state[player][4] == 3 && state[player][5] == 3) || state[player][4] == 4 && state[player][5] == 4) {
                score -= 20;
            }
            if ((state[opponent][4] == 3 && state[opponent][5] == 3) || state[opponent][4] == 4 && state[opponent][5] == 4) {
                score += 20;
            }
            score--;
        }
        return score;
    },
    generateMoves(state, player) {
        const offsets = [
            [0, 1], [0, -1], [1, 0], [-1, 0],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];
        const pawns = [
            state[player].slice(0, 2),
            state[player].slice(2, 4),
            state[player].slice(4, 6),
            state[player].slice(6, 8),
            state[player].slice(8),
        ]
        const opponent = player === "player1" ? "player2" : "player1";
        const opponentPawns = [
            state[opponent].slice(0, 2),
            state[opponent].slice(2, 4),
            state[opponent].slice(4, 6),
            state[opponent].slice(6, 8),
            state[opponent].slice(8)
        ];
        let moves = [];
        const kingPawn = 2;
        for (let [pawn, position] of pawns.entries()) {
            for (let [offsetX, offsetY] of offsets) {
                let [x, y] = position;
                let [prevX, prevY] = [x, y];
                while (true) {
                    x += offsetX;
                    y += offsetY;
                    if (
                        x < 0 || y < 0 || x >= boardWidth || y >= boardHeight
                        || pawns.some(([_x, _y]) => x === _x && y === _y)
                        || opponentPawns.some(([_x, _y]) => x === _x && y === _y)
                    ) {
                        break;
                    }
                    prevX = x;
                    prevY = y;
                }
                if (prevX === position[0] && prevY === position[1]) continue;
                if (pawn !== kingPawn && prevX === 2 && prevY === 2) continue;
                if (player === "player1") {
                    if (pawn === kingPawn && state.player1FirstTurn) continue;
                }
                moves.push([pawn, prevX, prevY]);
            }
        }
        return moves;
    },
    generateStateAfterMove(previousState, player, move) {
        const state = {
            player1: [...previousState.player1],
            player2: [...previousState.player2],
            highlighted: [...previousState.highlighted],
            player1FirstTurn: previousState.player1FirstTurn,
        };
        state.highlighted = [];
        const index = move[0] * 2;
        state.highlighted.push(state[player][index], state[player][index + 1]);
        state[player][index] = move[1];
        state[player][index + 1] = move[2];
        state.highlighted.push(state[player][index], state[player][index + 1]);
        if (player === "player1") {
            state.player1FirstTurn = false;
        }
        return state;
    },
    isStateTerminal(state, player) {
        let kingMoves = 0;
        const availableMoves = this.generateMoves(state, player);
        availableMoves.forEach(move => {
            if (move[0] === 2) kingMoves++;
        })
        return (state.player1[4] === 2 && state.player1[5] === 2)
            || (state.player2[4] === 2 && state.player2[5] === 2)
            || (player === "player1" && kingMoves === 0 && state.player1FirstTurn === false)
            || (player === "player2" && kingMoves === 0);
    },
    computeMCTSNodeValue(node) {
        const explorationConstant = 0.1;
        const exploitationTerm = node.reward / node.visits;
        const explorationTerm = explorationConstant * Math.sqrt(Math.log(node.parent.visits) / node.visits);

        return exploitationTerm + explorationTerm;
    },
    MCTSPlayOut(node) {
        let state = node.state;
        let player = node.player;
        while (this.isStateTerminal(state, player) === false) {
            const moves = this.generateMoves(state, player);
            const move = moves[Math.floor(Math.random() * moves.length)];
            state = this.generateStateAfterMove(state, player, move);
            player = player === "player1" ? "player2" : "player1";
        }
        return player === node.player ? 1 : -1;
    },
    getBestMCTSNode(node) {
        let bestNode = node.children[0];
        let bestValue = this.computeMCTSNodeValue(bestNode);

        for (let i = 1; i < node.children.length; ++i) {
            let currentValue = this.computeMCTSNodeValue(node.children[i]);
            if (currentValue >= bestValue && node.children[i].visits >= bestNode.visits) {
                bestNode = node.children[i];
                bestValue = currentValue;
            }
        }
        return bestNode;
    }
};
const players = [
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (łatwy)", maxDepth: 3, printTree: true },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (średni)", maxDepth: 5, printTree: true },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (trudny)", maxDepth: 6, printTree: true },
    { type: PlayerTypes.MCTS, label: "MCTS (łatwy)", iterations: 1000 },
    { type: PlayerTypes.MCTS, label: "MCTS (średni)", iterations: 3000 },
    { type: PlayerTypes.MCTS, label: "MCTS (trudny)", iterations: 5000 },
];class Node {
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
