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
const logicOfGame = {
    /**
     * Generuje stan początkowy gry.
     */
    generateInitialState() {
        return {
            placement_done: false,
            choosing_ring_to_remove: "none",
            pawn_chain_to_remove: [],
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
            if (state.choosing_ring_to_remove !== "none")
            {
                if (state.choosing_ring_to_remove === player)
                {
                    moves.push(...state[player].rings)
                }
            }
            else
            {
                state[player].rings.forEach((ring, ringIndex) => {
                    const movesForRing = this.getAllAlignedPositionsToPosition(ring, state)

                    movesForRing.forEach(pos => {
                        moves.push([ringIndex, pos])
                    })
                })
            }
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
            if (state.choosing_ring_to_remove !== "none")
            {
                if (state.choosing_ring_to_remove === player)
                {
                    state[player].rings = state[player].rings.filter(ring => !(ring[0] === move[0] && ring[1] === move[1]))

                    let filteredPawn = []
                    state[player].pawns.forEach(pawn => {
                        let include = true
                        state.pawn_chain_to_remove.forEach(rem => {
                            if (rem[0] === pawn[0] && rem[1] === pawn[1])
                            {
                                include = false
                            }
                        })

                        if (include)
                        {
                            filteredPawn.push([...pawn])
                        }
                    })
                    state[player].pawns = filteredPawn

                    state.choosing_ring_to_remove = "none"
                    state.pawn_chain_to_remove = []
                    state[player].points += 1
                    console.log(player, " punkty: ", state[player].points)
                }
            }
            else
            {
                const moveStart = state[player].rings[move[0]]
                const moveEnd = move[1]
                const direction = [0, 0]

                if (moveStart[0] > moveEnd[0])
                {
                    direction[0] = -1
                }
                if (moveStart[0] < moveEnd[0])
                {
                    direction[0] = 1
                }

                if (moveStart[1] > moveEnd[1])
                {
                    direction[1] = -1
                }
                if (moveStart[1] < moveEnd[1])
                {
                    direction[1] = 1
                }

                const currentPos = [...moveStart]
                const reverseWhite = []
                const reverseBlack = []

                while (!(currentPos[0] === moveEnd[0] && currentPos[1] === moveEnd[1]))
                {
                    currentPos[0] += direction[0]
                    currentPos[1] += direction[1]

                    if (this.isVectorOnList(currentPos, state.positions))
                    {
                        if (this.isVectorOnList(currentPos, state.player1.pawns))
                        {
                            reverseWhite.push([...currentPos])
                        }

                        if (this.isVectorOnList(currentPos, state.player2.pawns))
                        {
                            reverseBlack.push([...currentPos])
                        }
                    }
                }

                state.player1.pawns = state.player1.pawns.filter(pos => !this.isVectorOnList(pos, reverseWhite))
                state.player2.pawns = state.player2.pawns.filter(pos => !this.isVectorOnList(pos, reverseBlack))

                state.player1.pawns.push(...reverseBlack)
                state.player2.pawns.push(...reverseWhite)

                state[player].pawns.push(state[player].rings[move[0]])
                state[player].rings.splice(move[0], 1)
                state[player].rings.push(move[1])

                let whiteAffected = [...reverseBlack]
                let blackAffected = [...reverseWhite]

                if (player === "player1")
                {
                    whiteAffected.push([...moveStart])
                }
                else
                {
                    blackAffected.push([...moveStart])
                }

                const checkPlayer = (checkTable, state, player) => {
                    let newState = null
                    checkTable.forEach(pawn => {
                        const longestChain = this.getPawnLongestChain(pawn, state, player)

                        if (longestChain.length === 5)
                        {
                            state.choosing_ring_to_remove = player
                            state.pawn_chain_to_remove = [...longestChain]
                            newState = state
                        }
                    })

                    return newState
                }

                let checkTable = player === "player1" ? whiteAffected : blackAffected
                let checkReturn = checkPlayer(checkTable, state, player)
                if (checkReturn !== null)
                {
                    return checkReturn
                }
                checkTable = player === "player1" ? blackAffected : whiteAffected
                checkReturn = checkPlayer(checkTable, state, player === "player1" ? "player2" : "player1")
                if (checkReturn !== null)
                {
                    return checkReturn
                }
            }
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
        const isPositionOnBoard = (pos) => { return pos[0] >= boardStart[0] && pos[1] >= boardStart[1] && pos[0] <= boardEnd[0] && pos[1] <= boardEnd[1] }

        if (!isPositionOnBoard(position))
        {
            return []
        }

        [[0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(direction => {
            const allRings = [...state.player1.rings, ...state.player2.rings]
            const allPawns = [...state.player1.pawns, ...state.player2.pawns]
            let pawnInLastField = false
            let pos = [...position]
            while (true)
            {
                pos[0] += direction[0]
                pos[1] += direction[1]

                if (!isPositionOnBoard(pos))
                {
                    break
                }

                if (!this.isVectorOnList(pos, state.positions))
                {
                    continue
                }

                if (this.isVectorOnList(pos, allRings))
                {
                    break
                }

                if (this.isVectorOnList(pos, allPawns))
                {
                    pawnInLastField = true
                }
                else
                {
                    result.push([...pos])

                    if (pawnInLastField)
                    {
                        break
                    }
                }
            }
        })

        return result
    },
    getPawnLongestChain(pawn, state, player) {
        let chain = []
        const boardStart = [0, 0]
        const boardEnd = [10, 18]
        const isPositionOnBoard = (pos) => { return pos[0] >= boardStart[0] && pos[1] >= boardStart[1] && pos[0] <= boardEnd[0] && pos[1] <= boardEnd[1] }

        const dirChains = new Map()
        const directions = [[0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]
        directions.forEach(dir => {
            let i = 0

            dirChains.set(dir.toString(), [])
            let nextPawn = [...pawn]
            nextPawn[0] += dir[0]
            nextPawn[1] += dir[1]
            while (isPositionOnBoard(nextPawn))
            {
                if (this.isVectorOnList(nextPawn, state.positions))
                {
                    if (this.isVectorOnList(nextPawn, state[player].pawns))
                    {
                        dirChains.get(dir.toString()).push([...nextPawn])
                    }
                    else
                    {
                        break
                    }
                }
                i++
                nextPawn[0] += dir[0]
                nextPawn[1] += dir[1]
                if (i > 1000)
                {
                    console.log("infinite loop")
                    break
                }
            }
        })

        let verticalChain = [[...pawn]]
        let diagonalUpChain = [[...pawn]]
        let diagonalDownChain = [[...pawn]]

        verticalChain.push(...dirChains.get([0, 1].toString()))
        verticalChain.push(...dirChains.get([0, -1].toString()))

        diagonalUpChain.push(...dirChains.get([-1, -1].toString()))
        diagonalUpChain.push(...dirChains.get([1, 1].toString()))

        diagonalDownChain.push(...dirChains.get([1, -1].toString()))
        diagonalDownChain.push(...dirChains.get([-1, 1].toString()))

        if (verticalChain.length > diagonalUpChain.length && verticalChain.length > diagonalDownChain.length)
        {
            return verticalChain
        }
        else if (diagonalUpChain.length > diagonalDownChain.length)
        {
            return diagonalUpChain
        }
        else
        {
            return diagonalDownChain
        }
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
