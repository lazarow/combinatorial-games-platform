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
            player2FirstTurn: true
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
        if ((state[player][4] === 2 && state[player][5] === 2) || (opponentKingMoves === 0)) {
            return 999;
        } else if ((state[opponent][4] === 2 && state[opponent][5] === 2) || (playerKingMoves === 0)) {
            return -999;
        }
        var score = 0;
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
                score += 20;
            }
            if ((state[opponent][4] == 3 && state[opponent][5] == 2) || state[opponent][4] == 4 && state[opponent][5] == 2) {
                score -= 20;
            }
            score++;
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
                score += 20;
            }
            if ((state[opponent][4] == 3 && state[opponent][5] == 1) || state[opponent][4] == 4 && state[opponent][5] == 0) {
                score -= 20;
            }
            score++;
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
                score += 20;
            }
            if ((state[opponent][4] == 2 && state[opponent][5] == 1) || state[opponent][4] == 2 && state[opponent][5] == 0) {
                score -= 20;
            }
            score++;
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
                score += 20;
            }
            if ((state[opponent][4] == 1 && state[opponent][5] == 1) || state[opponent][4] == 0 && state[opponent][5] == 0) {
                score -= 20;
            }
            score++;
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
                score += 20;
            }
            if ((state[opponent][4] == 1 && state[opponent][5] == 2) || state[opponent][4] == 0 && state[opponent][5] == 2) {
                score -= 20;
            }
            score++;
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
                score += 20;
            }
            if ((state[opponent][4] == 1 && state[opponent][5] == 3) || state[opponent][4] == 0 && state[opponent][5] == 4) {
                score -= 20;
            }
            score++;
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
                score += 20;
            }
            if ((state[opponent][4] == 2 && state[opponent][5] == 3) || state[opponent][4] == 2 && state[opponent][5] == 4) {
                score -= 20;
            }
            score++;
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
                score += 20;
            }
            if ((state[opponent][4] == 3 && state[opponent][5] == 3) || state[opponent][4] == 4 && state[opponent][5] == 4) {
                score -= 20;
            }
            score++;
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
                if (player === "player2") {
                    if (pawn === kingPawn && state.player2FirstTurn) continue;
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
            player2FirstTurn: previousState.player2FirstTurn
        };
        state.highlighted = [];
        const index = move[0] * 2;
        state.highlighted.push(state[player][index], state[player][index + 1]);
        state[player][index] = move[1];
        state[player][index + 1] = move[2];
        state.highlighted.push(state[player][index], state[player][index + 1]);
        if (player === "player1") {
            state.player1FirstTurn = false;
        } else if (player === "player2") {
            state.player2FirstTurn = false;
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
            || (player === "player2" && kingMoves === 0 && state.player2FirstTurn === false);
    },
    generateUniqueKey: undefined,
};
const players = [
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (łatwy)", maxDepth: 2, printTree: true },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (średni)", maxDepth: 3, printTree: true },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (trudny)", maxDepth: 4, printTree: true },
];let textTreeData = [];

const transpositionTable = {};

function alphaBetaNegamax(node, player, depth, alpha, beta, sign = 1, textTreePrefix = " ") {
    if (depth === 0 || logicOfGame.isStateTerminal(node.state, node.player)) {
        return [sign * logicOfGame.evaluateState(node.state, player)];
    }
    let bestMove = null;
    for (let move of logicOfGame.generateMoves(node.state, node.player)) {
        const stateAfterMove = logicOfGame.generateStateAfterMove(node.state, node.player, move);

        if (logicOfGame.generateUniqueKey !== undefined) {
            const uniqueKey = logicOfGame.generateUniqueKey(
                stateAfterMove,
                node.player === "player1" ? "player2" : "player1"
            );
            if (uniqueKey in transpositionTable) {
                continue;
            } else {
                transpositionTable[uniqueKey] = true;
            }
        }

        let [score] = alphaBetaNegamax(
            {
                state: stateAfterMove,
                player: node.player === "player1" ? "player2" : "player1",
                move,
            },
            player,
            depth - 1,
            -beta,
            -alpha,
            -sign,
            textTreePrefix + " "
        );
        score = -score;
        textTreeData.push(textTreePrefix + move.toString() + "/" + score);
        if (score > alpha) {
            bestMove = move;
            alpha = score;
        }
        if (alpha >= beta) {
            return [alpha, bestMove];
        }
    }
    return [alpha, bestMove];
}

this.addEventListener(
    "message",
    function (e) {
        const [score, bestMove] = alphaBetaNegamax(
            {
                state: e.data.state,
                player: e.data.player,
                move: null,
            },
            e.data.player,
            e.data.maxDepth,
            -Infinity,
            Infinity
        );
        textTreeData.push("-/" + score);
        this.postMessage([-score, bestMove, textTreeData.reverse().join("\n")]);
    },
    false
);
