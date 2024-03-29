/**
 * Nazwa katalogu gry, potrzebne do wczytywanie skryptów.
 */

const gameId = "mankala";

const logicOfGame = {
    /**
     * Generuje stan początkowy gry.
     */
    generateInitialState() {
        return {
            player1: { pits: [4, 4, 4, 4, 4, 4], store: 0 },
            player2: { pits: [4, 4, 4, 4, 4, 4], store: 0 },
        };
    },

    /**
     * Funkcja oceny, która ocenia z punktu widzenia wskazanego gracza.
     */
    evaluateState(state, player) {
        let playerStore = state[player].store;
        let seedsInLeftPit = state[player].pits[0];
        let sumOfSeeds = 0;
        for(let i = 0; i < 6; i++)
        {
            sumOfSeeds += state[player].pits[i];
        }
        let enemyScore = 48 - (sumOfSeeds + playerStore);
        let proximityToWin = (sumOfSeeds + playerStore)/(enemyScore * 1.5)
        return ( seedsInLeftPit * 0.23 + sumOfSeeds * 0.27 + playerStore + enemyScore * (-0.5) + proximityToWin * 0.35 ) * 100;
        /*
        wygrana zalezy od nast. zmiennych:
        1. Trzymaj nasiona w 1 pit od lewej *SeedsInLeftPit*
        2. Trzymaj jak nakwiecej nasion po swojej stronie *sumOfSeeds*
        3. Miej jak najwiecej nasion w storze *player.store*
        4. Utrzymuj jak najmniejsza ilosc nasion przeciwnika *enemyScore*
        5. Badz jak najblizej wygranej
        Wagi tych rozwiazan to:
        1. 0.23
        2. 0.27
        3. 1
        4. 0.50
        5. 0.35
        */
    },

    /**
     * Funkcja generująca możliwe ruchy z wskazanego stanu dla gracza.
     */
    generateMoves(state, player) {
        const playerBoard = state[player].pits;
        const moves = [];

        // Loop through all pits
        for (let i = 0; i < 6; i++) {
            // If the pit is not empty, it's a valid move
            if (playerBoard[i] > 0) {
                moves.push(i);
            }
        }

        // Return an array of all valid moves
        return moves;
    },

    /**
     * Funkcja generuje stan po wykonaniu wskazanego ruchu.
     */
    generateStateAfterMove(previousState, player, move) {
        // Copy the previous state
        const state = JSON.parse(JSON.stringify(previousState));
    
        // Set up initial variables
        let currentPlayer = player;
        let currentPits = state[currentPlayer].pits;
        let currentStore = state[currentPlayer].store;
    
        // Identify the opponent
        const opponent = currentPlayer === "player1" ? "player2" : "player1";
        let opponentPits = state[opponent].pits;
    
        // Get the stones from the selected pit
        let stones = currentPits[move];
        currentPits[move] = 0;
    
        // Begin sowing the stones
        let i = move + 1;
    
        // Sow stones until none are left
        while (stones > 0) {
            if (i === 6) {
                if (currentPlayer === player) {
                    currentStore++;
                    stones--;
                }
                i = (i + 1) % 14;
            } else if (i === 13) {
                if (currentPlayer !== player) {
                    opponentPits[6]++;
                    stones--;
                }
                i = (i + 1) % 14;
            } else {
                if (i < 6) {
                    currentPits[i]++;
                } else {
                    opponentPits[i - 7]++;
                }
                stones--;
                i = (i + 1) % 14;
            }
        }
    
        // Update the state
        state[currentPlayer].pits = currentPits;
        state[currentPlayer].store = currentStore;
        state[opponent].pits = opponentPits;
    
        return state;
    },

    /**
     * Funkcja sprawdza czy stan jest terminalny, tzn. koniec gry.
     */
    isStateTerminal(state, player) {
        // Identify opponent
        const opponent = player === "player1" ? "player2" : "player1";

        // Check if all pits are empty
        const allPitsEmpty = (pits) => pits.every(pit => pit === 0);

        // If all of the current player's pits are empty, add all remaining stones to the opponent's store and end the game
        if (allPitsEmpty(state[player].pits)) {
            state[opponent].store += state[opponent].pits.reduce((a, b) => a + b);
            state[opponent].pits = state[opponent].pits.map(() => 0);
            return true;
        }

        // If neither are met, the game is not in a terminal state
        return false;
    },

    /**
     * Funkcja generująca unikalny klucz dla wskazanego stanu.
     */
    generateUniqueKey: function (state, player) {
        return objectHash.sha1({
            state,
            player,
        });
    },
     /**
     * Funkcja oblicza wartość wskazanego węzła gry (np. UCB1). Na podstawie tej wartości MCTS dokona selekcji.
     */
     computeMCTSNodeValue(node) {return (node.reward * 2 + node.visits)/3;},
     /**
      * Funkcja rozgrywa losową symulację startując od zadanego stanu i gracza (state i player) i zwraca 1 jeżeli
      * symulacja zostaje ostatecznie wygrana przez gracza, -1 jeżeli przez jego przeciwnika, 0 dla remisów.
      * Proszę zwrócić uwagę na kolejność węzłów!
      */
     MCTSPlayOut(node) {
        var player = node.player;
        var state = node.state;
        while (this.isStateTerminal(state, player) == false) {
            var generatedMoves = this.generateMoves(state, player);
            var randomMove = generatedMoves[Math.floor(Math.random() * generatedMoves.length)];
            state = this.generateStateAfterMove(state, player, randomMove);
            if(player === "player1")
            {
                player = "player2";
            } else
            {
                player = "player1";
            }
        }
            if(player === node.player)
            {
                return 1;
            }
            return -1;
     },
     /**
      * Funkcja przyjmuje na wejście węzeł drzewa MCTS i wybiera najlepszy ruch (kolejny węzeł) wg obranej strategii (np. najwięcej wizyt).
      */
     getBestMCTSNode(node) {
       var nodeKids = node.children;
       var bestScore = this.computeMCTSNodeValue(nodeKids[0]);
       var winner = 0;
       for( var i = 0; i < nodeKids.length; i++)
       {
            if(bestScore <= this.computeMCTSNodeValue(nodeKids[i]))
            {
                bestScore = this.computeMCTSNodeValue(nodeKids[i]);
                winner = i;
            }
       } 
       return nodeKids[winner];
     },
};

const players = [
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (łatwy)", maxDepth: 3, printTree: true },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (średni)", maxDepth: 5, printTree: false },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (trudny)", maxDepth: 7, printTree: false },
    { type: PlayerTypes.MCTS, label: "MCTS (łatwy)", iterations: 1000 },
    { type: PlayerTypes.MCTS, label: "MCTS (średni)", iterations: 3000 },
    { type: PlayerTypes.MCTS, label: "MCTS (trudny)", iterations: 7000 },
];
