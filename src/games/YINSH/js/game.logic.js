const logicOfGame = {
    /**
     * Generuje stan początkowy gry.
     */
    generateInitialState() {
        return {
            placement_done: false,
            player1: {
                rings: [],
                pawns: [],
                points: 0
            },
            player2: {
                rings: [],
                pawns: [],
                points: 0
            },
            positions: [
                [4, 0], [6, 0], [3, 1], [5, 1], [7, 1],
                [2, 2], [4, 2], [6, 2], [8, 2], [1, 3],
                [3, 3], [5, 3], [7, 3], [9, 3], [2, 4],
                [4, 4], [6, 4], [8, 4], [1, 5], [3, 5],
                [5, 5], [7, 5], [9, 5], [0, 6], [2, 6],
                [4, 6], [6, 6], [8, 6], [10, 6], [1, 7],
                [3, 7], [5, 7], [7, 7], [9, 7], [0, 8],
                [2, 8], [4, 8], [6, 8], [8, 8], [10, 8],
                [1, 9], [3, 9], [5, 9], [7, 9], [9, 9],
                [0, 10], [2, 10], [4, 10], [6, 10], [8, 10],
                [10, 10], [1, 11], [3, 11], [5, 11], [7, 11],
                [9, 11], [0, 12], [2, 12], [4, 12], [6, 12],
                [8, 12], [10, 12], [1, 13], [3, 13], [5, 13],
                [7, 13], [9, 13], [2, 14], [4, 14], [6, 14],
                [8, 14], [1, 15], [3, 15], [5, 15], [7, 15],
                [9, 15], [2, 16], [4, 16], [6, 16], [8, 16],
                [3, 17], [5, 17], [7, 17], [4, 18], [6, 18]
            ]
        }
    },
    /**
     * Funkcja oceny, która ocenia z punktu widzenia wskazanego gracza.
     */
    evaluateState(state, player) {
    },
    /**
     * Funkcja generująca możliwe ruchy z wskazanego stanu dla gracza.
     */
    generateMoves(state, player) {
        const moves = []

        if (state.placement_done)
        {

        }
        else
        {
            state.positions.forEach(pos => {
                const unavailable = [...state.player1.rings, ...state.player2.rings]
                if (unavailable.some(ring => ring[0] === pos[0] && ring[1] === pos[1]) === false)
                {
                    moves.push(pos)
                }
            })
        }

        return moves
    },
    /**
     * Funkcja generuje stan po wykonaniu wskazanego ruchu.
     */
    generateStateAfterMove(previousState, player, move) {
        const state = structuredClone(previousState)

        if (state.placement_done)
        {

        }
        else
        {
            if (move !== undefined)
            {
                state[player].rings.push(move)
            }

            if (state.player1.rings.length === 5 && state.player2.rings.length === 5)
            {
                state.placement_done = true
            }
        }

        return state
    },
    /**
     * Funkcja sprawdza czy stan jest terminalny, tzn. koniec gry.
     */
    isStateTerminal(state, player) {
        return state[player].points === 3 || state.placement_done;
    },
    /**
     * Funkcja generująca unikalny klucz dla wskazanego stanu.
     */
    generateUniqueKey: undefined,
};

const players = [];
