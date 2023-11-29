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
            highlightedPositions: [],
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
            state[player].rings.forEach((ring, ringIndex) => {
                const movesForRing = this.getAllAlignedPositionsToPosition(ring, state)

                movesForRing.forEach(pos => {
                    moves.push([ringIndex, pos])
                })
            })
        }
        else
        {
            state.positions.forEach(pos => {
                const unavailable = [...state.player1.rings, ...state.player2.rings]
                if (!this.isVectorOnList(pos, unavailable))
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
            state[player].pawns.push(state[player].rings[move[0]])
            state[player].rings.splice(move[0], 1)
            state[player].rings.push(move[1])
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
        return state[player].points === 3;
    },
    /**
     * Funkcja generująca unikalny klucz dla wskazanego stanu.
     */
    isVectorOnList(vector, list) {
        return list.some(otherVector => otherVector[0] === vector[0] && otherVector[1] === vector[1])
    },
    getAllAlignedPositionsToPosition(position, state) {
        const boardStart = [0, 0]
        const boardEnd = [10, 18]
        let result = []

        if (position[0] < boardStart[0] || position[1] < boardStart[1] || position[0] > boardEnd[0] || position[1] > boardEnd[1])
        {
            return []
        }

        for (let i=0; i<boardEnd[1]; i++)
        {
            if (i === position[1])
            {
                continue
            }
            result.push([position[0], i])
        }

        let allowedPositions = [...state.positions]
        const badPositions = [...state.player1.rings, ...state.player1.pawns, ...state.player2.rings, ...state.player2.pawns]
        allowedPositions = allowedPositions.filter(pos => !this.isVectorOnList(pos, badPositions))

        result = result.filter(pos => this.isVectorOnList(pos, allowedPositions))

        return result
    },
    generateUniqueKey: undefined,
};

const players = [];
