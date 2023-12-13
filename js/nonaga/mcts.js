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
        console.log(score);
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
                    let newPositions = this.generateMovesforPawn(state, player, i, j);
                    for(var z=0; z<newPositions.length; z++){

                        pawnMove = [i,j,newPositions[z][0],newPositions[z][1]];
                        // moves.push({
                        //     pawn:pawnMove,
                        //     tile:[0,0,0,0]
                        // });
                        for(var i2=0; i2<15; i2++){
                            for(var j2=0; j2<15; j2++){
                                if( !(i2==newPositions[z][0] && j2==newPositions[z][1]) && 
                                playerBoard[i2][j2]==2 &&  //the tile can only be moved if it has less than 5 neighbours
                                (this.countNeighbours(i2,j2,playerBoard,2)+
                                    this.countNeighbours(i2,j2,playerBoard,3)+
                                    this.countNeighbours(i2,j2,playerBoard,4))<5){
                                    let newPositions = this.generateMovesforTile(state, player, i2, j2);
                                    for(var z2=0; z2<newPositions.length; z2++){
                                        moves.push({
                                            pawn:pawnMove,
                                            tile:[i2,j2,newPositions[z2][0],newPositions[z2][1]]
                                        });
                                    }
                                    
                                }
                            }
                        }
                    }
                    //Yes, this function has 6 levels of nested for loops... too bad.
                }
            }
        }
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
    /**
     * Funkcja generująca unikalny klucz dla wskazanego stanu.
     */
    generateUniqueKey: undefined,
};

const players = [
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (łatwy)", maxDepth: 1, printTree: true },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (trudny)", maxDepth: 2, printTree: false }
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
