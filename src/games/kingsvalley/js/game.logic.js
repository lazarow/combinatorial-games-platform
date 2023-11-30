const boardWidth = 5;
const boardHeight = 5;

const gameId = "kingsvalley";

let totalMoves = 0;

const logicOfGame = {
    generateInitialState() {
        return {
            player1: [0, 0, 1, 0, 2, 0, 3, 0, 4, 0],
            player2: [0, 4, 1, 4, 2, 4, 3, 4, 4, 4]
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
        totalMoves++;
        return moves;
    },
    generateStateAfterMove(previousState, player, move) {
        const state = {
            player1: [...previousState.player1],
            player2: [...previousState.player2]
        };
        if (move[0] === 0) {
            state[player][0] = move[1]
            state[player][1] = move[2]
        }
        if (move[0] === 1) {
            state[player][2] = move[1]
            state[player][3] = move[2]
        }
        if (move[0] === 2) {
            state[player][4] = move[1]
            state[player][5] = move[2]
        }
        if (move[0] === 3) {
            state[player][6] = move[1]
            state[player][7] = move[2]
        }
        if (move[0] === 4) {
            state[player][8] = move[1]
            state[player][9] = move[2]
        }
        return state;
    },
    isStateTerminal(state, player) {
        let kingMoves = 0;
        const availableMoves = this.generateMoves(state, player);
        availableMoves.forEach(move => {
            if (move[0] === 2) kingMoves++;
        })
        const isTerminal =
            (state.player1[4] === 2 && state.player1[5] === 2)
            || (state.player2[4] === 2 && state.player2[5] === 2)
            || (kingMoves === 0 && totalMoves > 1);
        if (isTerminal) totalMoves = 0;
        return isTerminal;
    },
    generateUniqueKey: undefined,
};
const players = [
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (łatwy)", maxDepth: 3 }
];