const visualizationOfGame = {
    /**
     * Funkcja rysuje planszę do gry w wskazanym kontenerze (720 pikseli szerokości).
     * Po zakończeniu rysowania należy wykonać funkcję `cb`.
     */
    drawState(state, player, move, container, cb) {
        const playerBoard = state.board;
        var board = '<div id="board">';
        for (var i = 0; i < playerBoard.length; i++) {
            for (var j = 0; j < playerBoard[i].length; j++) {
                if(playerBoard[i][j]!=0){
                    if (playerBoard[i][j] == 1) 
                        board+=`<div data-col=${i} data-row=${j} id="${i},${j}" class="cell empty`;
                    else{
                        board+=`<div data-col=${i} data-row=${j} id="${i},${j}" class="cell dark`;
                    }

                    if ((i%2==0&& j%2==0) || (i%2==1 && j%2==0))
                        board+=' translation">';
                    else
                        board+='">';

                    if (playerBoard[i][j] === 3) {
                        board +=`<div data-col=${i} data-row=${j} class="piece player1-pawn"></div>`;
                    } else if (playerBoard[i][j] === 4) {
                        board +=`<div data-col=${i} data-row=${j} class="piece player2-pawn"></div>`;
                    }

                    board+="</div>";
                }
            }
        }
        
        board+="</div>";
        container.innerHTML = board;
        cb();
    },
    /**
     * Funkcja włącza tryb interaktywny dla gracza. Po wykonaniu ruchu należy wykonać funkcję `cb` a na jej
     * wejście podać wybrany ruch.
     */
    handleHumanTurn(state, player, cb) {
        if(state.currPlayer==player){
            //check if currently moving pawns or tiles
            if(state.currObjectToMove==='pawn'){
                state.currObjectToMove = 'tile';

                const playerPawns = document.querySelectorAll(`.${player}-pawn`);

                playerPawns.forEach((pawn, i)=> {
                    pawn.addEventListener("click", function clickedPawn() {
                        var pawnX = parseInt(pawn.getAttribute('data-col'));
                        var pawnY = parseInt(pawn.getAttribute('data-row'));
                        state.moves = logicOfGame.generateMovesforPawn(state, player, pawnX, pawnY);
                        state.moves.forEach((move)=>{
                            let highlightedTile = document.getElementById(`${move[0]},${move[1]}`);
                            highlightedTile.classList.add('highlight');
                            highlightedTile.addEventListener("click", function clickedHighlightedTile() {
                                return cb([pawnX, pawnY, move[0],move[1]]);
                            })
                        });
                    });
                });

            }
            else if (state.currObjectToMove==='tile'){
                state.currObjectToMove = 'pawn';
                state.currPlayer = player==='player1' ? 'player2' : 'player1';
                const placedTiles = document.querySelectorAll(".dark");
                const emptyTiles = document.querySelectorAll(".empty");
                placedTiles.forEach((tile, i)=> {
                    var tilex = parseInt(tile.getAttribute('data-col'));
                    var tiley = parseInt(tile.getAttribute('data-row'));

                    if(state.board[tilex][tiley]!=3 && state.board[tilex][tiley]!=4 && (logicOfGame.countNeighbours(tilex,tiley,state.board,2)+logicOfGame.countNeighbours(tilex,tiley,state.board,3)+logicOfGame.countNeighbours(tilex,tiley,state.board,4))<5){
                        tile.classList.add('tileHighlight');
                        tile.classList.add('pointer');
                        tile.addEventListener("click", function clickedTile() {
                            placedTiles.forEach((tile1)=>{tile1.classList.remove('tileHighlight'); tile1.classList.remove('moveTile');});
                            tile.classList.add('moveTile');
                            const tileMoves = logicOfGame.generateMovesforTile(state, player, tilex, tiley);
                            emptyTiles.forEach((tile2)=>{tile2.classList.remove('highlight-blue');});
                            tileMoves.forEach((tmove)=>{
                                let highlightedEmpty = document.getElementById(`${tmove[0]},${tmove[1]}`);
                                highlightedEmpty.classList.add('highlight-blue');
                                highlightedEmpty.addEventListener("click", function clickedEmpty() {
                                    return cb([tilex,tiley,tmove[0],tmove[1]]);
                                })
                            })
                        })
                    }
                })
            }
        }
        else{
            cb([0,0,0,0])
        }
    },
    /**
     * Funkcja zwraca nazwę gracza zgodną z zasadami.
     */
    getTruePlayerName(player) {
        if (player === "player1") return "Czerwony";
        if (player === "player2") return "Czarny";
    },
    /**
     * Funkcja zwraca czytelny dla człowieka opis ruchu.
     */
    getReadableMoveDescription(state, player, move) {
        return move[0]==0 ? 
          `${player === "player1" ? "Czerwony" : "Czarny"} czeka na swój ruch` 
        : `${player === "player1" ? "Czerwony" : "Czarny"} przeniósł [${move[0]},${move[1]}] na [${move[2]},${move[3]}]`;
    },
    /**
     * Funkcja zwraca czytelny dla człowieka opis wygranego gracza.
     */
    getReadableWinnerName(state, player) {
        return player === "player1" ? "Czarny" : "Czerwony";
    },
};
