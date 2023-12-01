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
            ],
            currPlayer: 'player1',
            currObjectToMove: 'pawn',
            moves: []
        };
    },
    /**
     * Funkcja oceny, która ocenia z punktu widzenia wskazanego gracza.                             ##TODO##
     */
    evaluateState(state, player) {
        return 1;
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
        const playerPawnNumber = player==='player1' ? 3 : 4;

        if(state.currPlayer==player){
            //check if currently moving pawns or tiles
            if(state.currObjectToMove==='pawn'){
                //runs through every board tile until it finds current player's pawn
                for(var i=0; i<15; i++){
                    for(var j=0; j<15; j++){
                        if(playerBoard[i][j]==playerPawnNumber){
                            let newPositions = this.generateMovesforPawn(state, player, i, j);
                            for(var z=0; z<newPositions.length; z++)
                                moves.push([i,j,newPositions[z][0],newPositions[z][1]]);
                            
                        }
                    }
                }
                state.currObjectToMove = 'tile';
                return moves;
            }
            else if(state.currObjectToMove==='tile'){   //moving tiles
                for(var i=0; i<15; i++){
                    for(var j=0; j<15; j++){
                        if(playerBoard[i][j]==2 &&  //the tile can only be moved if it has less than 5 neighbours
                        (this.countNeighbours(i,j,playerBoard,2)+
                         this.countNeighbours(i,j,playerBoard,3)+
                         this.countNeighbours(i,j,playerBoard,4))<5){
                            let newPositions = this.generateMovesforTile(state, player, i, j);
                            for(var z=0; z<newPositions.length; z++){
                                moves.push([i,j,newPositions[z][0],newPositions[z][1]]);
                            }
                            
                        }
                    }
                }
                state.currObjectToMove = 'pawn';
                state.currPlayer = player==='player1' ? 'player2' : 'player1';
                return moves;
            }
        }
        else{
            return [[0,0,0,0]];
        }
    },
    /**
     * Funkcja generuje stan po wykonaniu wskazanego ruchu.
     */
    generateStateAfterMove(previousState, player, move) {
        const state = JSON.parse(JSON.stringify(previousState));
        if(move===-[[0,0,0,0]])
            console.log("Whoah there!");
        else{       //swaps two items on the board
            let buffer = state.board[move[0]][move[1]];
            state.board[move[0]][move[1]] = state.board[move[2]][move[3]];
            state.board[move[2]][move[3]] = buffer;
        }
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

const players = [];
