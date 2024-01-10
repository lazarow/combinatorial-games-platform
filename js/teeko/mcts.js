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
            player1: {
                rings: []
            },
            player2: {
                rings: []
            },
            highlightedPositions: [],
            positions: [
                [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
                [0, 1], [1, 1], [2, 1], [3, 1], [4, 1],
                [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
                [0, 3], [1, 3], [2, 3], [3, 3], [4, 3],
                [0, 4], [1, 4], [2, 4], [3, 4], [4, 4]
                
            ]
        }
    },
    /**
     * Funkcja oceny, która ocenia z punktu widzenia wskazanego gracza.
     */
    evaluateState(state, player) {
        if (state.placement_done) {
            return 1 
        }
        else {
          return 2
        }
    },
    /**
     * Funkcja generująca możliwe ruchy z wskazanego stanu dla gracza.
     */
    generateMoves(state, player) {
        const moves = []
    
        if (state.placement_done)
        {
            state[player].rings.forEach((ring, ringIndex) => {
                const movesForRing = this.getAllSurroundingPositionsToPosition(ring, state)

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
            const moveStart = state[player].rings[move[0]]
            const moveEnd = move[1]
           
            const currentPos = [...moveStart]
          
            
            state[player].rings.splice(move[0], 1)
            state[player].rings.push(move[1])
        }
        else
        {
            if (move !== undefined)
            {
                state[player].rings.push(move)
            }
            /**
     zmienic na 4 edla 4 pionkuw
     */
            if (state.player1.rings.length === 4 && state.player2.rings.length === 4)
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

        let combinations = new Array(
            [0, 1, 2, 3], [0, 1, 3, 2], [0, 2, 1, 3], [0, 2, 3, 1], [0, 3, 1, 2], [0, 3, 2, 1],
            [1, 0, 2, 3], [1, 0, 3, 2], [1, 2, 0, 3], [1, 2, 3, 0], [1, 3, 0, 2], [1, 3, 2, 0],
            [2, 0, 1, 3], [2, 0, 3, 1], [2, 1, 0, 3], [2, 1, 3, 0], [2, 3, 0, 1], [2, 3, 1, 0],
            [3, 0, 1, 2], [3, 0, 2, 1], [3, 1, 0, 2], [3, 2, 0, 1], [3, 1, 2, 0], [3, 2, 1, 0]
            ) 
        if (state.placement_done) {

            for (let height = 0; height < 5; height++) { 
                for (let wight = 0; wight < 5; wight++) {
                    for (let y = 0; y < combinations.length; y++) {
                        let x = combinations[y][0]
                        let xx = combinations[y][1]
                        let xxx = combinations[y][2]
                        let xxxx = combinations[y][3]
                        //skos lewo do prawo 
                        if (state[player].rings[x][0] === height && state[player].rings[x][1] === wight && state[player].rings[xx][0] === height - 1 && state[player].rings[xx][1] === wight - 1 && state[player].rings[xxx][0] === height - 2 && state[player].rings[xxx][1] === wight - 2 && state[player].rings[xxxx][0] === height - 3 && state[player].rings[xxxx][1] === wight - 3) {
                            return true
                        }
                        //skos prawo do lewo 
                        if (state[player].rings[x][0] === height && state[player].rings[x][1] === wight && state[player].rings[xx][0] === height - 1 && state[player].rings[xx][1] === wight + 1 && state[player].rings[xxx][0] === height - 2 && state[player].rings[xxx][1] === wight + 2 && state[player].rings[xxxx][0] === height - 3 && state[player].rings[xxxx][1] === wight + 3) {
                            return true
                        }
                    
                        //pion
                        if (state[player].rings[x][0] === height && state[player].rings[x][1] === wight && state[player].rings[xx][0] === height + 1 && state[player].rings[xx][1] === wight && state[player].rings[xxx][0] === height + 2 && state[player].rings[xxx][1] === wight && state[player].rings[xxxx][0] === height + 3 && state[player].rings[xxxx][1] === wight) {
                            return true
                        }
                        //poziom
                        if (state[player].rings[x][0] === height && state[player].rings[x][1] === wight && state[player].rings[xx][0] === height && state[player].rings[xx][1] === wight + 1 && state[player].rings[xxx][0] === height && state[player].rings[xxx][1] === wight + 2 && state[player].rings[xxxx][0] === height && state[player].rings[xxxx][1] === wight + 3) {
                            return true
                        }
                        //kwadrat
                        for (rozmiar = 1; rozmiar < 5; rozmiar++) { 
                            if (state[player].rings[x][0] === height && state[player].rings[x][1] === wight && state[player].rings[xx][0] === height + rozmiar && state[player].rings[xx][1] === wight && state[player].rings[xxx][0] === height && state[player].rings[xxx][1] === wight + rozmiar && state[player].rings[xxxx][0] === height + rozmiar && state[player].rings[xxxx][1] === wight + rozmiar) {
                                return true
                            }
                        }
                    }
                }
            }
           
                return false;
            
          } else {
            return false;
        }
    },
    /**
     * Funkcja generująca unikalny klucz dla wskazanego stanu.
     */
    isVectorOnList(vector, list) {
        return list.some(otherVector => otherVector[0] === vector[0] && otherVector[1] === vector[1])
    },
    getAllSurroundingPositionsToPosition(position, state) {
        const boardStart = [0, 0]
        const boardEnd = [4, 4]
        let result = []
        const isPositionOnBoard = (pos) => { return pos[0] >= boardStart[0] && pos[1] >= boardStart[1] && pos[0] <= boardEnd[0] && pos[1] <= boardEnd[1] }

        if (!isPositionOnBoard(position)) {
            return []
        }

        [[0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1], [-1, 0], [1, 0]].forEach(direction => {
            const allRings = [...state.player1.rings, ...state.player2.rings]
            
            let pawnInLastField = false
            let pos = [...position]
            for (let lol = 0; lol < 1;lol++)
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

               
                    result.push([...pos])

                    if (pawnInLastField)
                    {
                        break
                    }
                
            }
        })

        return result
    },
    generateUniqueKey: undefined,
};

const players = [
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (łatwy)", maxDepth: 1, printTree: true },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (średni)", maxDepth: 2, printTree: false },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (trudny)", maxDepth: 3, printTree: false },
];
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
