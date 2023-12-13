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

let totalMoves = 0;

const logicOfGame = {
    generateInitialState() {
        totalMoves = 0;
        return {
            player1: [0, 0, 1, 0, 2, 0, 3, 0, 4, 0],
            player2: [0, 4, 1, 4, 2, 4, 3, 4, 4, 4],
            highlighted: []
        };
    },
    evaluateState() {
        // TODO
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
                if (pawn === kingPawn && totalMoves < 2) continue;
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
        };
        state.highlighted = [];
        const index = move[0] * 2;
        state.highlighted.push(state[player][index], state[player][index + 1]);
        state[player][index] = move[1];
        state[player][index + 1] = move[2];
        state.highlighted.push(state[player][index], state[player][index + 1]);
        totalMoves++;
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
            || (kingMoves === 0 && totalMoves > 1);
    },
    generateUniqueKey: undefined,
};
const players = [
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (łatwy)", maxDepth: 3 }
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
