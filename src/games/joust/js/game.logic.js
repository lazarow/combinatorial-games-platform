const boardWidth = 8;
const boardHeight = 8;

const gameId = "joust";

const logicOfGame = {
    generateInitialState() {
        return {
            player1: [Math.floor(Math.random() * boardWidth), 0],
            player2: [Math.floor(Math.random() * boardWidth), boardHeight - 1],
            removed: [],
        };
    },
    evaluateState(state, player) {
        let totalMoves = {
            player1: 0,
            player2: 0
        };
        for (let playerX of ["player1", "player2"]) {
            const moves = this.generateMoves(state, playerX);
            for (let move of moves) {
                let afterState = this.generateStateAfterMove(state, playerX, move);
                const afterMoves = this.generateMoves(afterState, playerX);
                totalMoves[playerX] += 1 + afterMoves.length;
            }
        }
		const moves = {
			player1: this.generateMoves(state, "player1"),
			player2: this.generateMoves(state, "player2")
		};
		const opponent = player === "player1" ? "player2" : "player1";
		const score = totalMoves[player] - totalMoves[opponent];
        return score;
    },
    generateMoves(state, player) {
        const offsets = [
            [1, -2],
            [2, -1],
            [2, 1],
            [1, 2],
            [-1, 2],
            [-2, 1],
            [-2, -1],
            [-1, -2],
        ];
        const moves = [];
        for (let i = 0; i < offsets.length; ++i) {
            const x = state[player][0] + offsets[i][0];
            const y = state[player][1] + offsets[i][1];
            if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight) {
                const invalidPositions = [state.player1, state.player2, ...state.removed];
                if (invalidPositions.some(([invalidX, invalidY]) => x === invalidX && y === invalidY) === false) {
                    moves.push([x, y]);
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
        state.removed.push(state[player]);
        state[player] = move;
        return state;
    },
    isStateTerminal(state, player) {
        const availableMoves = this.generateMoves(state, player);
        return availableMoves.length === 0;
    },
    generateUniqueKey: undefined,
};

const players = [
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (łatwy)", maxDepth: 3 }
];
