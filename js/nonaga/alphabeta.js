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
/**
 * Nazwa katalogu gry, potrzebne do wczytywanie skryptów.
 */
const gameId = "nonaga";

const logicOfGame = {
    /**
     * Generuje stan początkowy gry.
     */
    generateInitialState() {
        return{
            board: [    //initial board layout(15x15) | 1 = nothing | 2 = tile | 0 = border (out of bounds area) |
                        // | 3 = red pawn (on a tile) | 4 = black pawn (on a tile)
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
                [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
                [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
                [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
                [0,1,1,1,1,1,2,4,2,1,1,1,1,1,0],
                [0,1,1,1,1,3,2,2,2,3,1,1,1,1,0],
                [0,1,1,1,1,2,2,2,2,2,1,1,1,1,0],
                [0,1,1,1,1,4,2,2,2,4,1,1,1,1,0],
                [0,1,1,1,1,1,1,3,1,1,1,1,1,1,0],
                [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
                [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
                [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
                [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            ]
        };
    },
    /**
     * Funkcja oceny, która ocenia z punktu widzenia wskazanego gracza.
     */
    evaluateState(state, player) {
        const opponent = player === "player1" ? "player2" : "player1";
        if (this.isStateTerminal(state, player)) {
            return 999;
        } 
        else if (this.isStateTerminal(state, opponent)) {
            return -999;
        }
        let winProximity = {
            player1: 0,
            player2: 0,
        };
        for (let playerX of ["player1", "player2"]) {
            var playerNumber = playerX === 'player1' ? 3 : 4;
            for(var i=0; i<15; i++){
                for(var j=0; j<15; j++){
                    if(state.board[i][j]===playerNumber){
                        winProximity[playerX] += 2*this.countNeighbours(i,j,state.board,playerNumber);
                        let newMoves = this.generateMovesforPawn(state,playerX,i,j);
                        for (let move of newMoves) {
                            let afterState = this.generateStateAfterMove(state, playerX, {pawn:[i,j,move[0],move[1]], tile: [0,0,0,0]});
                            winProximity[playerX] += this.countNeighbours(i,j,afterState.board,playerNumber)
                        }
                    }
                }
            }
        }
        const score = winProximity[player] - winProximity[opponent];
        return score;
    },
     /**
     * Funkcja generująca możliwe ruchy z wskazanego pionka.
     */
    generateMovesforPawn(state, player, x,y){
        const playerBoard = state.board;
        var moves = [];

        //march towards a possible move in the up direction
        var stepx=1;
        while(stepx>0){
            if(playerBoard[x+stepx][y]!=2){
                stepx--;
                break;
            }
            else
                stepx++;
        }
        moves.push([x+stepx,y]);

        //march towards a possible move in the down direction
        stepx=-1;
        while(stepx<0){
            if(playerBoard[x+stepx][y]!=2){
                stepx++;
                break;
            }
            else
                stepx--;
        }
        moves.push([x+stepx,y]);

        //march towards a possible move in the direction of xy vectors
        var YXvectors = [1,1, -1,1, -1,-1, 1,-1];
        for(var z=0; z<YXvectors.length; z+=2){
            stepx=x;
            var stepy=y;
            var stopped=false;
            while(stopped==false){
                //due to the offset of the board - there are 6 possible directions around any given pawn - up and down are already calculated above
                //however diagonal moves require to move the pawn up/down only if it's placed on width with index odd/even (depending on up/down vector)
                var newPosX = stepx+( YXvectors[z]==1 ? ((stepy+1*YXvectors[z+1])%2)*YXvectors[z] : ((stepy+1*YXvectors[z+1])%2)==0 ? 1*YXvectors[z] : 0 );
                var newPosY = stepy+1*YXvectors[z+1]; 

                //check if new position is valid and if yes - march forward
                if(playerBoard[newPosX][newPosY]==2){
                    stepx = newPosX;
                    stepy = newPosY;
                }
                else{
                    stopped=true;
                }
                
            }
            moves.push([stepx,stepy]);
        }
        moves = moves.filter((move) => !(move[0]==x && move[1]==y)); 
        return moves.length===0 ? [[x,y],[x,y],[x,y]] : moves;
    },
    /**
     * Funkcja generująca możliwe ruchy danym pustym polem.
     */
    generateMovesforTile(state, player, x,y){
        const playerBoard = state.board;
        const moves = [];

        for(var i=0; i<15; i++){
            for(var j=0; j<15; j++){
                if(playerBoard[i][j]==1){

                    if((this.countNeighbours(i,j,playerBoard,2)+this.countNeighbours(i,j,playerBoard,3)+this.countNeighbours(i,j,playerBoard,4))>1)
                        moves.push([i,j]);
                    
                }
            }
        }
        return moves.length===0 ? [[x,y]] : moves;
    },
    /**
     * Funkcja generująca możliwe ruchy z wskazanego stanu dla gracza.
     */
    generateMoves(state, player) {
        const playerBoard = state.board;
        const moves = [];
        var pawnMove = []
        const playerPawnNumber = player==='player1' ? 3 : 4;
        //runs through every board tile until it finds current player's pawn
        for(var i=0; i<15; i++){
            for(var j=0; j<15; j++){
                if(playerBoard[i][j]==playerPawnNumber){
                    let newPositionsPawn = this.generateMovesforPawn(state, player, i, j);
                    for(var z=0; z<newPositionsPawn.length; z++){

                        pawnMove = [i,j,newPositionsPawn[z][0],newPositionsPawn[z][1]];
                        var tileMoves = [];

                        for(var i2=0; i2<15; i2++){
                            for(var j2=0; j2<15; j2++){
                                if( !(i2==newPositionsPawn[z][0] && j2==newPositionsPawn[z][1]) && 
                                playerBoard[i2][j2]==2 &&  //the tile can only be moved if it has less than 5 neighbours
                                (this.countNeighbours(i2,j2,playerBoard,2)+
                                    this.countNeighbours(i2,j2,playerBoard,3)+
                                    this.countNeighbours(i2,j2,playerBoard,4))<5){
                                    tileMoves.push([i2,j2]);
                                }
                            }
                        }
                        //To prevent huge amounts of calculations, generateMoves chooses only one randomly selected tile to move
                        var randomTileMove = Math.floor(Math.random() * tileMoves.length);
                        var newPositions = this.generateMovesforTile(state, player, tileMoves[randomTileMove][0], tileMoves[randomTileMove][1]);
                        for(var z2=0; z2<newPositions.length; z2++){
                            moves.push({
                                pawn:pawnMove,
                                tile:[tileMoves[randomTileMove][0],tileMoves[randomTileMove][1],newPositions[z2][0],newPositions[z2][1]]
                            });
                        }
                    }
                    //Yes, this function has 5 levels of nested for loops... too bad.
                }
            }
        }
        //console.log(moves.length);
        return moves;
    },
    /**
     * Funkcja generuje stan po wykonaniu wskazanego ruchu.
     */
    generateStateAfterMove(previousState, player, move) {
        const state = JSON.parse(JSON.stringify(previousState));   
        //swaps two items on the board
        let buffer = state.board[move.pawn[0]][move.pawn[1]];
        state.board[move.pawn[0]][move.pawn[1]] = state.board[move.pawn[2]][move.pawn[3]];
        state.board[move.pawn[2]][move.pawn[3]] = buffer;

        buffer = state.board[move.tile[0]][move.tile[1]];
        state.board[move.tile[0]][move.tile[1]] = state.board[move.tile[2]][move.tile[3]];
        state.board[move.tile[2]][move.tile[3]] = buffer;

        return state;
    },
    /**
     * Funkcja sprawdza czy stan jest terminalny, tzn. koniec gry.
     */
    isStateTerminal(state, player) {
        const playerBoard = state.board;
        for(var i=0; i<15; i++){
            for(var j=0; j<15; j++){
                var playerNumber = playerBoard[i][j];
                if(playerNumber==3 || playerNumber==4){

                    if(this.countNeighbours(i,j,playerBoard,playerNumber)>1)
                        return true;
                }
            }
        }
        return false;
    },
    /**
     * Funkcja liczy ilość danego typu sąsiadów wokół danych indeksów i oraz j planszy.
     */
    countNeighbours(i,j,board,type) {
        var count = 0;
        var oddPos = j%2==0 ? 1 : 0;
        var evenPos = j%2;
        
        board[i+1][j] == type ? count++ : 0;
        board[i-1][j] == type ? count++ : 0;
        board[i+oddPos][j+1] == type ? count++ : 0;
        board[i-evenPos][j+1] == type ? count++ : 0;
        board[i+oddPos][j-1] == type ? count++ : 0;
        board[i-evenPos][j-1] == type ? count++ : 0;

        return count;
    },
    computeMCTSNodeValue(node) {
        return node.reward / node.visits + 0.4 * Math.sqrt(Math.log(node.parent.visits) / node.visits);
    },
    MCTSPlayOut(node) {
        state = node.state;
        player = node.player;
        while (this.isStateTerminal(state, player) === false) {
            const moves = this.generateMoves(state, player);
            const move = moves[Math.floor(Math.random() * moves.length)];
            state = this.generateStateAfterMove(state, player, move);
            player = player === "player1" ? "player2" : "player1";
        }
        return player === node.player ? 1 : -1;
    },
    /**
     * Funkcja przyjmuje na wejście węzeł drzewa MCTS i wybiera najlepszy ruch wg obranej strategii (np. najwięcej wizyt).
     */
    getBestMCTSNode(node) {
        let bestNode = node.children[0];
        for (let i = 1; i < node.children.length; ++i) {
            if (node.children[i].visits > bestNode.visits) {
                bestNode = node.children[i];
            }
        }
        return bestNode;
    },
    /**
     * Funkcja generująca unikalny klucz dla wskazanego stanu.
     */
    generateUniqueKey: undefined,
};

const players = [
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (łatwy)", maxDepth: 1, printTree: true },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (średni)", maxDepth: 2, printTree: true },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (trudny)", maxDepth: 3, printTree: false },
    { type: PlayerTypes.MCTS, label: "MCTS (łatwy)", iterations: 50 },
    { type: PlayerTypes.MCTS, label: "MCTS (średni)", iterations: 200 },
    { type: PlayerTypes.MCTS, label: "MCTS (trudny)", iterations: 600 }
];
let textTreeData = [];

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
