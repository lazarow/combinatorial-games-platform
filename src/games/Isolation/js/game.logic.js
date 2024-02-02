const boardWidth = 8;
const boardHeight = 6;

const gameId = "isolation";

const logicOfGame = {
    generateInitialState() {
        return {
            player1: [0, 3],
            player2: [7, 2],
            removed: [],
        };
    },
    evaluateState(state, player) {     
        const opponent = player === "player1" ? "player2" : "player1";
        if (this.isStateTerminal(state, player)) {
            return -9999;
        } else if (this.isStateTerminal(state, opponent)) {
            return 9999;
        }
        let totalPlayerMoves = 0;
        let opIsolationPoints = 0;
        const playerMoves = this.generateMoves(state, player);
        const opponentMoves = this.generateMoves(state, opponent);
        for (let move of playerMoves) {
            for (let opmove of opponentMoves) {
                if (move[2]===opmove[0]&&move[3]===opmove[1])
                    opIsolationPoints -= 10;
            }
            let afterState = this.generateStateAfterMove(state, player, move);
            const afterMoves = this.generateMoves(afterState, player);
            totalPlayerMoves += 1 + afterMoves.length;
        }
        const score = totalPlayerMoves * 0.3 + opIsolationPoints * 0.7;
        return score;
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
    computeMCTSNodeValue(node) {
        return node.reward / node.visits + 0.4 * Math.sqrt(Math.log(node.parent.visits) / node.visits);
    },
    MCTSPlayOut(node) {
        state = node.state;
        player = node.player;
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
        for (let i = 1; i < node.children.length; ++i) {
            if (node.children[i].visits > bestNode.visits) {
                bestNode = node.children[i];
            }
        }
        return bestNode;
    },
};



const players = [
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (łatwy)", maxDepth: 1, printTree: true },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (średni)", maxDepth: 2, printTree: false },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (trudny)", maxDepth: 3, printTree: false },
    { type: PlayerTypes.MCTS, label: "MCTS (łatwy)", iterations: 1000 },
    { type: PlayerTypes.MCTS, label: "MCTS (średni)", iterations: 3000 },
    { type: PlayerTypes.MCTS, label: "MCTS (trudny)", iterations: 7000 },
];
