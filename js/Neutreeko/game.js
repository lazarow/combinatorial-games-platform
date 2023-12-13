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

const gameId = "Neutreeko";

let totalMoves = 0;

const logicOfGame = {
    generateInitialState() {
        totalMoves = 0;
        return {
            player1: [1, 0, 2, 3, 3, 0],
            player2: [1, 4, 2, 1, 3, 4],
            highlighted: [],
        };
    },

    evaluateState(state, player) {
        const opponent = player === "player1" ? "player2" : "player1";

        // Sprawdź, czy któryś z graczy wygrał
        if (this.isStateTerminal(state, player)) {
            return 100;
        } else if (this.isStateTerminal(state, opponent)) {
            return -100;
        }

        // Ocena stanu na podstawie liczby pionków na planszy
        /**
         * @author AN
         * Ta funkcja jest bez sensu. Przecież zawsze jest tyle samo pionów?
         */
        const playerPawns = state[player].length / 2;
        const opponentPawns = state[opponent].length / 2;

        return playerPawns - opponentPawns;
    },

    generateMoves(state, player) {
        const offsets = [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1],
        ];
        const pawns = [state[player].slice(0, 2), state[player].slice(2, 4), state[player].slice(4)];
        const opponent = player === "player1" ? "player2" : "player1";
        const opponentPawns = [state[opponent].slice(0, 2), state[opponent].slice(2, 4), state[opponent].slice(4)];
        let moves = [];

        for (let [pawn, position] of pawns.entries()) {
            for (let [offsetX, offsetY] of offsets) {
                let [x, y] = position;
                let [prevX, prevY] = [x, y];
                while (true) {
                    x += offsetX;
                    y += offsetY;
                    if (
                        x < 0 ||
                        y < 0 ||
                        x >= boardWidth ||
                        y >= boardHeight ||
                        pawns.some(([_x, _y]) => x === _x && y === _y) ||
                        opponentPawns.some(([_x, _y]) => x === _x && y === _y)
                    ) {
                        break;
                    }
                    prevX = x;
                    prevY = y;
                }
                if (prevX === position[0] && prevY === position[1]) continue;

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
        const availableMoves = this.generateMoves(state, player);
        availableMoves.forEach((move) => {});
        let zmienna = state.player1;

        //sprawdzanie poziomo

        for (let i = 0, j = 0; i < 5; i++, j++) {
            for (let z = 0; z < 3; z++) {
                if (
                    zmienna[0] === z &&
                    zmienna[1] === i &&
                    zmienna[2] === z + 1 &&
                    zmienna[3] === i &&
                    zmienna[4] === z + 2 &&
                    zmienna[5] === i
                )
                    return true;
                if (
                    zmienna[0] === z &&
                    zmienna[1] === i &&
                    zmienna[4] === z + 1 &&
                    zmienna[5] === i &&
                    zmienna[2] === z + 2 &&
                    zmienna[3] === i
                )
                    return true;
                if (
                    zmienna[2] === z &&
                    zmienna[3] === i &&
                    zmienna[0] === z + 1 &&
                    zmienna[1] === i &&
                    zmienna[4] === z + 2 &&
                    zmienna[5] === i
                )
                    return true;
                if (
                    zmienna[2] === z &&
                    zmienna[3] === i &&
                    zmienna[4] === z + 1 &&
                    zmienna[5] === i &&
                    zmienna[0] === z + 2 &&
                    zmienna[1] === i
                )
                    return true;
                if (
                    zmienna[4] === z &&
                    zmienna[5] === i &&
                    zmienna[0] === z + 1 &&
                    zmienna[1] === i &&
                    zmienna[2] === z + 2 &&
                    zmienna[3] === i
                )
                    return true;
                if (
                    zmienna[4] === z &&
                    zmienna[5] === i &&
                    zmienna[2] === z + 1 &&
                    zmienna[3] === i &&
                    zmienna[0] === z + 2 &&
                    zmienna[1] === i
                )
                    return true;
            }
            if (j == 4) {
                i = -1;
                zmienna = state.player2;
            }
        }
        // pionowo
        zmienna = state.player1;
        for (let i = 0, j = 0; i < 5; i++, j++) {
            for (let z = 0; z < 3; z++) {
                if (
                    zmienna[0] === i &&
                    zmienna[1] === z &&
                    zmienna[2] === i &&
                    zmienna[3] === z + 1 &&
                    zmienna[4] === i &&
                    zmienna[5] === z + 2
                )
                    return true;
                if (
                    zmienna[0] === i &&
                    zmienna[1] === z &&
                    zmienna[4] === i &&
                    zmienna[5] === z + 1 &&
                    zmienna[2] === i &&
                    zmienna[3] === z + 2
                )
                    return true;
                if (
                    zmienna[4] === i &&
                    zmienna[5] === z &&
                    zmienna[2] === i &&
                    zmienna[3] === z + 1 &&
                    zmienna[0] === i &&
                    zmienna[1] === z + 2
                )
                    return true;
                if (
                    zmienna[4] === i &&
                    zmienna[5] === z &&
                    zmienna[0] === i &&
                    zmienna[1] === z + 1 &&
                    zmienna[2] === i &&
                    zmienna[3] === z + 2
                )
                    return true;
                if (
                    zmienna[2] === i &&
                    zmienna[3] === z &&
                    zmienna[0] === i &&
                    zmienna[1] === z + 1 &&
                    zmienna[4] === i &&
                    zmienna[5] === z + 2
                )
                    return true;
                if (
                    zmienna[2] === i &&
                    zmienna[3] === z &&
                    zmienna[4] === i &&
                    zmienna[5] === z + 1 &&
                    zmienna[0] === i &&
                    zmienna[1] === z + 2
                )
                    return true;
            }

            if (j == 4) {
                i = -1;
                zmienna = state.player2;
            }
        }
        //ukos
        //ukos prawo srodek
        zmienna = state.player1;
        for (let i = 0, j = 0; i < 3; i++, j++) {
            if (
                zmienna[0] === i &&
                zmienna[1] === i &&
                zmienna[2] === i + 1 &&
                zmienna[3] === i + 1 &&
                zmienna[4] === i + 2 &&
                zmienna[5] === i + 2
            )
                return true;
            if (
                zmienna[0] === i &&
                zmienna[1] === i &&
                zmienna[4] === i + 1 &&
                zmienna[5] === i + 1 &&
                zmienna[2] === i + 2 &&
                zmienna[3] === i + 2
            )
                return true;
            if (
                zmienna[2] === i &&
                zmienna[3] === i &&
                zmienna[0] === i + 1 &&
                zmienna[1] === i + 1 &&
                zmienna[4] === i + 2 &&
                zmienna[5] === i + 2
            )
                return true;
            if (
                zmienna[2] === i &&
                zmienna[3] === i &&
                zmienna[4] === i + 1 &&
                zmienna[5] === i + 1 &&
                zmienna[0] === i + 2 &&
                zmienna[1] === i + 2
            )
                return true;
            if (
                zmienna[4] === i &&
                zmienna[5] === i &&
                zmienna[0] === i + 1 &&
                zmienna[1] === i + 1 &&
                zmienna[2] === i + 2 &&
                zmienna[3] === i + 2
            )
                return true;
            if (
                zmienna[4] === i &&
                zmienna[5] === i &&
                zmienna[2] === i + 1 &&
                zmienna[3] === i + 1 &&
                zmienna[0] === i + 2 &&
                zmienna[1] === i + 2
            )
                return true;
            if (j == 2) {
                i = -1;
                zmienna = state.player2;
            }
        }
        //ukos lewo srodek
        zmienna = state.player1;
        for (let i = 0, j = 0, z = 4; i < 3; i++, j++, z--) {
            if (
                zmienna[0] === i &&
                zmienna[1] === z &&
                zmienna[2] === i + 1 &&
                zmienna[3] === z - 1 &&
                zmienna[4] === i + 2 &&
                zmienna[5] === z - 2
            )
                return true;
            if (
                zmienna[0] === i &&
                zmienna[1] === z &&
                zmienna[4] === i + 1 &&
                zmienna[5] === z - 1 &&
                zmienna[2] === i + 2 &&
                zmienna[3] === z - 2
            )
                return true;
            if (
                zmienna[2] === i &&
                zmienna[3] === z &&
                zmienna[0] === i + 1 &&
                zmienna[1] === z - 1 &&
                zmienna[4] === i + 2 &&
                zmienna[5] === z - 2
            )
                return true;
            if (
                zmienna[2] === i &&
                zmienna[3] === z &&
                zmienna[4] === i + 1 &&
                zmienna[5] === z - 1 &&
                zmienna[0] === i + 2 &&
                zmienna[1] === z - 2
            )
                return true;
            if (
                zmienna[4] === i &&
                zmienna[5] === z &&
                zmienna[0] === i + 1 &&
                zmienna[1] === z - 1 &&
                zmienna[2] === i + 2 &&
                zmienna[3] === z - 2
            )
                return true;
            if (
                zmienna[4] === i &&
                zmienna[5] === z &&
                zmienna[2] === i + 1 &&
                zmienna[3] === z - 1 &&
                zmienna[0] === i + 2 &&
                zmienna[1] === z - 2
            )
                return true;
            if (j == 2) {
                i = -1;
                z = 5;
                zmienna = state.player2;
            }
        }
        //ukos ukos prawo lewo 4 miejsca gora
        zmienna = state.player1;
        for (let i = 0, j = 0; i < 2; i++, j++) {
            if (
                zmienna[0] === i &&
                zmienna[1] === i + 1 &&
                zmienna[2] === i + 1 &&
                zmienna[3] === i + 2 &&
                zmienna[4] === i + 2 &&
                zmienna[5] === i + 3
            )
                return true;
            if (
                zmienna[0] === i &&
                zmienna[1] === i + 1 &&
                zmienna[4] === i + 1 &&
                zmienna[5] === i + 2 &&
                zmienna[2] === i + 2 &&
                zmienna[3] === i + 3
            )
                return true;
            if (
                zmienna[2] === i &&
                zmienna[3] === i + 1 &&
                zmienna[0] === i + 1 &&
                zmienna[1] === i + 2 &&
                zmienna[4] === i + 2 &&
                zmienna[5] === i + 3
            )
                return true;
            if (
                zmienna[2] === i &&
                zmienna[3] === i + 1 &&
                zmienna[4] === i + 1 &&
                zmienna[5] === i + 2 &&
                zmienna[0] === i + 2 &&
                zmienna[1] === i + 3
            )
                return true;
            if (
                zmienna[4] === i &&
                zmienna[5] === i + 1 &&
                zmienna[0] === i + 1 &&
                zmienna[1] === i + 2 &&
                zmienna[2] === i + 2 &&
                zmienna[3] === i + 3
            )
                return true;
            if (
                zmienna[4] === i &&
                zmienna[5] === i + 1 &&
                zmienna[2] === i + 1 &&
                zmienna[3] === i + 2 &&
                zmienna[0] === i + 2 &&
                zmienna[1] === i + 3
            )
                return true;
            if (j == 1) {
                i = -1;

                zmienna = state.player2;
            }
        }
        //ukos ukos prawo lewo 4 miejsca dol
        zmienna = state.player1;
        for (let i = 0, j = 0; i < 2; i++, j++) {
            if (
                zmienna[0] === i + 1 &&
                zmienna[1] === i &&
                zmienna[2] === i + 2 &&
                zmienna[3] === i + 1 &&
                zmienna[4] === i + 3 &&
                zmienna[5] === i + 2
            )
                return true;
            if (
                zmienna[0] === i + 1 &&
                zmienna[1] === i &&
                zmienna[4] === i + 2 &&
                zmienna[5] === i + 1 &&
                zmienna[2] === i + 3 &&
                zmienna[3] === i + 2
            )
                return true;
            if (
                zmienna[2] === i + 1 &&
                zmienna[3] === i &&
                zmienna[0] === i + 2 &&
                zmienna[1] === i + 1 &&
                zmienna[4] === i + 3 &&
                zmienna[5] === i + 2
            )
                return true;
            if (
                zmienna[2] === i + 1 &&
                zmienna[3] === i &&
                zmienna[4] === i + 2 &&
                zmienna[5] === i + 1 &&
                zmienna[0] === i + 3 &&
                zmienna[1] === i + 2
            )
                return true;
            if (
                zmienna[4] === i + 1 &&
                zmienna[5] === i &&
                zmienna[0] === i + 2 &&
                zmienna[1] === i + 1 &&
                zmienna[2] === i + 3 &&
                zmienna[3] === i + 2
            )
                return true;
            if (
                zmienna[4] === i + 1 &&
                zmienna[5] === i &&
                zmienna[2] === i + 2 &&
                zmienna[3] === i + 1 &&
                zmienna[0] === i + 3 &&
                zmienna[1] === i + 2
            )
                return true;
            if (j == 1) {
                i = -1;

                zmienna = state.player2;
            }
        }
        //ukos ukos lewo prawo 4 miejsca dol
        zmienna = state.player1;
        for (let i = 0, j = 0, z = 3; i < 2; i++, j++, z--) {
            if (
                zmienna[0] === i &&
                zmienna[1] === z &&
                zmienna[2] === i + 1 &&
                zmienna[3] === z - 1 &&
                zmienna[4] === i + 2 &&
                zmienna[5] === z - 2
            )
                return true;
            if (
                zmienna[0] === i &&
                zmienna[1] === z &&
                zmienna[4] === i + 1 &&
                zmienna[5] === z - 1 &&
                zmienna[2] === i + 2 &&
                zmienna[3] === z - 2
            )
                return true;
            if (
                zmienna[2] === i &&
                zmienna[3] === z &&
                zmienna[0] === i + 1 &&
                zmienna[1] === z - 1 &&
                zmienna[4] === i + 2 &&
                zmienna[5] === z - 2
            )
                return true;
            if (
                zmienna[2] === i &&
                zmienna[3] === z &&
                zmienna[4] === i + 1 &&
                zmienna[5] === z - 1 &&
                zmienna[0] === i + 2 &&
                zmienna[1] === z - 2
            )
                return true;
            if (
                zmienna[4] === i &&
                zmienna[5] === z &&
                zmienna[0] === i + 1 &&
                zmienna[1] === z - 1 &&
                zmienna[2] === i + 2 &&
                zmienna[3] === z - 2
            )
                return true;
            if (
                zmienna[4] === i &&
                zmienna[5] === z &&
                zmienna[2] === i + 1 &&
                zmienna[3] === z - 1 &&
                zmienna[0] === i + 2 &&
                zmienna[1] === z - 2
            )
                return true;
            if (j == 1) {
                i = -1;
                z = 4;
                zmienna = state.player2;
            }
        }
        //ukos ukos lewo prawo 4 miejsca gora
        zmienna = state.player1;
        for (let i = 1, j = 0, z = 4; i < 3; i++, j++, z--) {
            if (
                zmienna[0] === i &&
                zmienna[1] === z &&
                zmienna[2] === i + 1 &&
                zmienna[3] === z - 1 &&
                zmienna[4] === i + 2 &&
                zmienna[5] === z - 2
            )
                return true;
            if (
                zmienna[0] === i &&
                zmienna[1] === z &&
                zmienna[4] === i + 1 &&
                zmienna[5] === z - 1 &&
                zmienna[2] === i + 2 &&
                zmienna[3] === z - 2
            )
                return true;
            if (
                zmienna[2] === i &&
                zmienna[3] === z &&
                zmienna[0] === i + 1 &&
                zmienna[1] === z - 1 &&
                zmienna[4] === i + 2 &&
                zmienna[5] === z - 2
            )
                return true;
            if (
                zmienna[2] === i &&
                zmienna[3] === z &&
                zmienna[4] === i + 1 &&
                zmienna[5] === z - 1 &&
                zmienna[0] === i + 2 &&
                zmienna[1] === z - 2
            )
                return true;
            if (
                zmienna[4] === i &&
                zmienna[5] === z &&
                zmienna[0] === i + 1 &&
                zmienna[1] === z - 1 &&
                zmienna[2] === i + 2 &&
                zmienna[3] === z - 2
            )
                return true;
            if (
                zmienna[4] === i &&
                zmienna[5] === z &&
                zmienna[2] === i + 1 &&
                zmienna[3] === z - 1 &&
                zmienna[0] === i + 2 &&
                zmienna[1] === z - 2
            )
                return true;
            if (j == 1) {
                i = 0;
                z = 5;
                zmienna = state.player2;
            }
        }
        //ukos ukos lewo prawo 3 miejsca
        zmienna = state.player1;
        for (let i = 0, j = 0, z = 2; i < 4; i = i + 2, j++, z = z + 2) {
            if (
                zmienna[0] === i &&
                zmienna[1] === z &&
                zmienna[2] === i + 1 &&
                zmienna[3] === z - 1 &&
                zmienna[4] === i + 2 &&
                zmienna[5] === z - 2
            )
                return true;
            if (
                zmienna[0] === i &&
                zmienna[1] === z &&
                zmienna[4] === i + 1 &&
                zmienna[5] === z - 1 &&
                zmienna[2] === i + 2 &&
                zmienna[3] === z - 2
            )
                return true;
            if (
                zmienna[2] === i &&
                zmienna[3] === z &&
                zmienna[0] === i + 1 &&
                zmienna[1] === z - 1 &&
                zmienna[4] === i + 2 &&
                zmienna[5] === z - 2
            )
                return true;
            if (
                zmienna[2] === i &&
                zmienna[3] === z &&
                zmienna[4] === i + 1 &&
                zmienna[5] === z - 1 &&
                zmienna[0] === i + 2 &&
                zmienna[1] === z - 2
            )
                return true;
            if (
                zmienna[4] === i &&
                zmienna[5] === z &&
                zmienna[0] === i + 1 &&
                zmienna[1] === z - 1 &&
                zmienna[2] === i + 2 &&
                zmienna[3] === z - 2
            )
                return true;
            if (
                zmienna[4] === i &&
                zmienna[5] === z &&
                zmienna[2] === i + 1 &&
                zmienna[3] === z - 1 &&
                zmienna[0] === i + 2 &&
                zmienna[1] === z - 2
            )
                return true;
            if (j == 1) {
                i = -2;
                z = 0;
                zmienna = state.player2;
            }
        }
        //ukos ukos  prawo lewo 3 miejsca
        zmienna = state.player1;
        for (let i = 0, j = 0, z = 2; i < 4; i = i + 2, j++, z = z - 2) {
            if (
                zmienna[0] === i &&
                zmienna[1] === z &&
                zmienna[2] === i + 1 &&
                zmienna[3] === z + 1 &&
                zmienna[4] === i + 2 &&
                zmienna[5] === z + 2
            )
                return true;
            if (
                zmienna[0] === i &&
                zmienna[1] === z &&
                zmienna[4] === i + 1 &&
                zmienna[5] === z + 1 &&
                zmienna[2] === i + 2 &&
                zmienna[3] === z + 2
            )
                return true;
            if (
                zmienna[2] === i &&
                zmienna[3] === z &&
                zmienna[0] === i + 1 &&
                zmienna[1] === z + 1 &&
                zmienna[4] === i + 2 &&
                zmienna[5] === z + 2
            )
                return true;
            if (
                zmienna[2] === i &&
                zmienna[3] === z &&
                zmienna[4] === i + 1 &&
                zmienna[5] === z + 1 &&
                zmienna[0] === i + 2 &&
                zmienna[1] === z + 2
            )
                return true;
            if (
                zmienna[4] === i &&
                zmienna[5] === z &&
                zmienna[0] === i + 1 &&
                zmienna[1] === z + 1 &&
                zmienna[2] === i + 2 &&
                zmienna[3] === z + 2
            )
                return true;
            if (
                zmienna[4] === i &&
                zmienna[5] === z &&
                zmienna[2] === i + 1 &&
                zmienna[3] === z + 1 &&
                zmienna[0] === i + 2 &&
                zmienna[1] === z + 2
            )
                return true;
            if (j == 1) {
                i = -2;
                z = 4;
                zmienna = state.player2;
            }
        }
    },
    generateUniqueKey: undefined,
};
const players = [
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (łatwy)", maxDepth: 3, printTree: true },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (średni)", maxDepth: 5, printTree: false },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (trudny)", maxDepth: 7, printTree: false },
];
var currentPiece, startPosition = { x: -1, y: -1 }, destinationPosition = { x: -1, y: -1 };
const visualizationOfGame = {
    drawState(state, player, move, container, cb) {
        let board = '<table class="board">';
        board += "<tr><td></td>";
        for (let x = 0; x < boardWidth; ++x) {
            board += "<td><label>" + String.fromCharCode(97 + x) + "</label></td>";
        }
        board += "</tr>";
        for (let y = boardHeight - 1; y >= 0; --y) {
            board += "<tr><td><label>" + (y + 1) + "</label></td>";
            for (let x = 0; x < boardWidth; ++x) {
                const isHighlighted = state.highlighted.some((coord, index) => {
                    return index % 2 === 0 && coord === x && state.highlighted[index + 1] === y;
                });
                board +=
                    '<td class="square' + (x === Math.floor(boardWidth / 2) && y === Math.floor(boardHeight / 2) ? ' center' : '') + '"><div class="square-placeholder" data-x="' +
                    x +
                    '" data-y="' +
                    y +
                    '" data-available="' +
                    (isHighlighted ? "false" : "true") +
                    '">';
                    if (state.player1[0] === x && state.player1[1] === y) board += '<div class="black-pawn" id="player1_0"></div>';
                    if (state.player1[2] === x && state.player1[3] === y) board += '<div class="black-pawn" id="player1_1"></div>';
                    if (state.player1[4] === x && state.player1[5] === y) board += '<div class="black-pawn" id="player1_2"></div>';
                    
                    
                    if (state.player2[0] === x && state.player2[1] === y) board += '<div class="white-pawn" id="player2_0"></div>';
                    if (state.player2[2] === x && state.player2[3] === y) board += '<div class="white-pawn" id="player2_1"></div>';
                    if (state.player2[4] === x && state.player2[5] === y) board += '<div class="white-pawn" id="player2_2"></div>';
                    
                board += "</div></td>";
            }
            board += "<td><label>" + (y + 1) + "</label></td>";
            board += "</tr>";
        }
        board += "<tr><td></td>";
        for (let x = 0; x < boardWidth; ++x) {
            board += "<td><label>" + String.fromCharCode(97 + x) + "</label></td>";
        }
        board += "</tr>";
        board += "</table>";
        container.innerHTML = board;
        cb();
    },
    handleHumanTurn(state, player, cb) {
        state.hightlighted = [];
        const moves = logicOfGame.generateMoves(state, player);
        const pawns = [
            $("#" + player + "_0"),
            $("#" + player + "_1"),
            $("#" + player + "_2")
        ];
        for (let [pawn, pawnEl] of pawns.entries()) {
            pawnEl.draggable({
                scope: "fields",
                revert: "invalid",
                revertDuration: 0,
                refreshPositions: true,
                start(event, ui) {
                    startPosition = {
                        x: parseInt(ui.helper.parent().attr("data-x")),
                        y: parseInt(ui.helper.parent().attr("data-y"))
                    };
                    let fields = moves.filter(move => move[0] === pawn).map(([, x, y]) => {
                        return $(".square-placeholder[data-x=" + x + "][data-y=" + y + "]")
                    })
                    fields.forEach(field => {
                        if (field.data('x') === 2
                            && field.data('y') === 2
                            && pawn === 2
                        ) {
                           
                        }
                        else field.addClass("highlighted")
                    });
                    fields.forEach(field => {
                        field.droppable({
                            accept: pawnEl,
                            scope: "fields",
                            drop(event, ui) {
                                destinationPosition = {
                                    x: parseInt($(this).attr("data-x")),
                                    y: parseInt($(this).attr("data-y"))
                                }
                                ui.draggable.appendTo(this);
                                ui.draggable.css("top", 0);
                                ui.draggable.css("left", 0);
                                fields.forEach(field => field.droppable("destroy"));
                                pawns.forEach(pawnEl => pawnEl.draggable("destroy"));
                                cb([pawn, parseInt(ui.draggable.parent().attr("data-x")), parseInt(ui.draggable.parent().attr("data-y"))]);
                            }
                        });
                    })
                },
                stop() {
                    let fields = moves.filter(move => move[0] === pawn).map(([, x, y]) => {
                        return $(".square-placeholder[data-x=" + x + "][data-y=" + y + "]")
                    })
                    const startingField = $(".square-placeholder[data-x=" + startPosition.x + "][data-y=" + startPosition.y + "]");
                    fields.forEach(field => {
                        field.removeClass("highlighted")
                    });
                }
            })
        }
    },
    getTruePlayerName(player) {
        if (player === "player1") return "Czarny";
        if (player === "player2") return "Biały";
    },
    getReadableMoveDescription(state, player, move) {
        return String.fromCharCode(97 + move[1]) + (move[2] + 1);
    },
    getReadableWinnerName(state, player) {
        return player === "player1" ? "Biały" : "Czarny";
    },
};/**
 * Domyślni gracze, którzy nie potrzebują dodatkowej konfiguracji.
 */
const allPlayers = [
    { type: PlayerTypes.RANDOM, label: "Losowy" },
    { type: PlayerTypes.HUMAN, label: "Człowiek" },
].concat(players);

/**
 * Utworzenie list wyboru z graczami.
 */
for (const [index, player] of Object.entries(allPlayers)) {
    const playerOption = document.createElement("option");
    playerOption.value = index;
    if (index === 0) {
        playerOption.selected = "selected";
    }
    playerOption.innerText = player.label;
    document.querySelector("#player1").appendChild(playerOption.cloneNode(true));
    document.querySelector("#player2").appendChild(playerOption.cloneNode(true));
}

/**
 * Ustalenie prawdziwych nazw dla graczy.
 */
document.querySelector("#player1TrueName").innerText = visualizationOfGame.getTruePlayerName("player1");
document.querySelector("#player2TrueName").innerText = visualizationOfGame.getTruePlayerName("player2");

/**
 * Podstawowe struktury wymagane do przeprowadzenia gry.
 */
const workers = {
    player1: null,
    player2: null,
};
let currentState = null;
let currentPlayer = null;
let currentMove = null;
let currentTurn = null;
let statesHistory = [];
let movesHistory = [];
const defaultAlphaBetaTextTree = "Uruchom agenta SI aby wygenerować kod drzewa.";
let alphaBetaTextTree = defaultAlphaBetaTextTree;

/**
 * Uchwyty do struktur HTML związanych z grą.
 */
const gameContainerEl = document.querySelector("#game");

/**
 * Obsługa przycisku start.
 */
document.querySelector("#startButton").onclick = function () {
    if (workers.player1) workers.player1.terminate();
    if (workers.player2) workers.player2.terminate();

    // Reset gry i interfejsu.
    reset(() => {
        hideUserInterface();
        updateUserInterface();
        startCurrentTurn();
    });
};

/**
 * Czyszczenie stanu planszy.
 */
function reset(cb) {
    currentState = logicOfGame.generateInitialState();
    currentPlayer = "player1";
    currentMove = null;
    currentTurn = -1;
    statesHistory = [];
    movesHistory = [];

    // Rysowanie planszy.
    visualizationOfGame.drawState(currentState, currentPlayer, currentMove, gameContainerEl, cb);
}

/**
 * Akceptacja ruchu oraz aktualizacja stanu gry.
 */
function makeMove(move) {
    currentState = logicOfGame.generateStateAfterMove(currentState, currentPlayer, move);
    currentPlayer = currentPlayer === "player1" ? "player2" : "player1";
    currentMove = move;
    currentTurn += 1;
    statesHistory.push(currentState);
    movesHistory.push(move);
    visualizationOfGame.drawState(currentState, currentPlayer, currentMove, gameContainerEl, () => {
        updateUserInterface();
        startCurrentTurn();
    });
}

/**
 * Procedura obsługi następnej tury gry poprzez wybór gracza na podstawie selektora.
 */
function startCurrentTurn() {
    // Sprawdzenie czy nie dotarliśmy do końca gry.
    if (logicOfGame.isStateTerminal(currentState, currentPlayer)) {
        updateUserInterfaceAfterGame(true, true);
        return;
    }

    // Pobranie identyfikatora algorytmu dla gracza.
    const playerIndex = document.querySelector("#" + currentPlayer).value;
    switch (allPlayers[playerIndex].type) {
        case PlayerTypes.HUMAN:
            visualizationOfGame.handleHumanTurn(currentState, currentPlayer, makeMove);
            break;
        case PlayerTypes.RANDOM:
            let randomMove = getRandomMove();
            setTimeout(() => makeMove(randomMove), 30);
            break;
        case PlayerTypes.SIMPLE_SCORE:
            let simplyBestMove = getSimplyBestMove();
            setTimeout(() => makeMove(simplyBestMove), 30);
            break;
        case PlayerTypes.ALPHABETA:
            workers[currentPlayer] = new Worker("js/" + gameId + "/alphabeta.js");
            workers[currentPlayer].addEventListener(
                "message",
                function (e) {
                    const [score, move, textTree] = e.data;
                    workers[currentPlayer].terminate();
                    console.timeEnd("ALPHABETA");
                    workers[currentPlayer] = null;
                    if (allPlayers[playerIndex].printTree) {
                        alphaBetaTextTree = textTree;
                    }
                    makeMove(move);
                },
                false
            );
            console.time("ALPHABETA");
            workers[currentPlayer].postMessage({
                state: currentState,
                player: currentPlayer,
                maxDepth: allPlayers[playerIndex].maxDepth,
            });
            break;
        case PlayerTypes.MCTS:
            workers[currentPlayer] = new Worker("js/" + gameId + "/mcts.js");
            workers[currentPlayer].addEventListener(
                "message",
                function (e) {
                    const [move] = e.data;
                    workers[currentPlayer].terminate();
                    console.timeEnd("MCTS");
                    workers[currentPlayer] = null;
                    makeMove(move);
                },
                false
            );
            console.time("MCTS");
            workers[currentPlayer].postMessage({
                state: currentState,
                player: currentPlayer,
                iterations: allPlayers[playerIndex].iterations,
            });
            break;
    }
}

function getRandomMove() {
    const moves = logicOfGame.generateMoves(currentState, currentPlayer);
    return moves[Math.floor(Math.random() * moves.length)];
}

function getSimplyBestMove() {
    const moves = logicOfGame.generateMoves(currentState, currentPlayer);
    let bestMove = moves[0];
    let bestScore = logicOfGame.evaluateState(
        logicOfGame.generateStateAfterMove(currentState, currentPlayer, bestMove),
        currentPlayer
    );
    for (let i = 1; i < moves.length; ++i) {
        let score = logicOfGame.evaluateState(
            logicOfGame.generateStateAfterMove(currentState, currentPlayer, moves[i]),
            currentPlayer
        );
        if (score > bestScore) {
            bestMove = moves[i];
            bestScore = score;
        }
    }
    return bestMove;
}

/**
 * Uchwyty do struktur HTML związanych z grą.
 */
const tabHistoryButtonEl = document.querySelector("#tabHistoryButton");
const currentPlayerNameEl = document.querySelector("#currentPlayerName");
const currentTurnEl = document.querySelector("#currentTurn");
const gameHistoryNavigationEl = document.querySelector("#gameHistoryNavigation");
const tabHistoryEl = document.querySelector("#tabHistory");
const gameOverNotificationEl = document.querySelector("#gameOverNotification");
const winnerNameEl = document.querySelector("#winnerName");
const alphaBetaTextTreeEl = document.querySelector("#alphaBetaTextTree");

/**
 * Aktualizacja interfejsu.
 */
function updateUserInterface() {
    currentPlayerNameEl.parentNode.classList.remove("d-none");
    currentPlayerNameEl.innerHTML = visualizationOfGame.getTruePlayerName(currentPlayer);
    currentTurnEl.innerText = statesHistory.length + 1;
    gameHistoryNavigationEl.classList.add("d-none");
    tabHistoryEl.innerHTML = "";
    alphaBetaTextTreeEl.innerText = alphaBetaTextTree;
}

/**
 * Ukrycie interfejsu (start i restart gry).
 */
function hideUserInterface() {
    currentPlayerNameEl.parentNode.classList.add("d-none");
    gameOverNotificationEl.classList.add("d-none");
    gameHistoryNavigationEl.classList.add("d-none");
    tabHistoryEl.innerHTML = "";
    alphaBetaTextTreeEl.innerText = defaultAlphaBetaTextTree;
}

/**
 * Aktualizacja interfejsu po zakończeniu gry.
 */
function updateUserInterfaceAfterGame(forceHistoryTab = false, forceWinnerUpdate = false) {
    if (forceHistoryTab) {
        bootstrap.Tab.getOrCreateInstance(tabHistoryButtonEl).show();
    }
    if (forceWinnerUpdate) {
        winnerNameEl.innerText = visualizationOfGame.getReadableWinnerName(currentState, currentPlayer);
    }

    // Wyświetlenie powiadomienia o zakończeniu gry.
    currentPlayerNameEl.parentNode.classList.add("d-none");
    gameOverNotificationEl.classList.remove("d-none");

    // Wyświetlenie kontrolek przebiegu gry.
    gameHistoryNavigationEl.classList.remove("d-none");

    // Wygenerowanie przebiegu gry w postaci serii odnośników.
    let historyLinks = "";
    for (let turn = 0; turn < statesHistory.length; ++turn) {
        const readableMoveDescription = visualizationOfGame.getReadableMoveDescription(
            statesHistory[turn],
            turn % 2 === 0 ? "player1" : "player2",
            movesHistory[turn]
        );
        if (currentTurn === turn) {
            historyLinks += `<a href="javascript:void(0);" onclick="restoreTurn(${turn})"><b>[${
                turn + 1
            }. ${readableMoveDescription}]</b></a> `;
        } else {
            historyLinks += `<a href="javascript:void(0);" onclick="restoreTurn(${turn})">${
                turn + 1
            }. ${readableMoveDescription}</a> `;
        }
    }
    tabHistoryEl.innerHTML = historyLinks;
}

function restoreTurn(turn) {
    currentState = statesHistory[turn];
    currentPlayer = turn % 2 === 0 ? "player1" : "player2";
    currentMove = movesHistory[turn];
    currentTurn = turn;
    visualizationOfGame.drawState(currentState, currentPlayer, currentMove, document.querySelector("#game"), () => {
        updateUserInterfaceAfterGame();
    });
}

function restoreFirstTurn() {
    restoreTurn(0);
}

function restoreLastTurn() {
    restoreTurn(statesHistory.length - 1);
}

function restorePreviousTurn() {
    if (currentTurn > 0) {
        restoreTurn(currentTurn - 1);
    }
}

function restoreNextTurn() {
    if (currentTurn < statesHistory.length - 1) {
        restoreTurn(currentTurn + 1);
    }
}

/**
 * Uruchomienie gry.
 */
reset(() => {
    hideUserInterface();
});
