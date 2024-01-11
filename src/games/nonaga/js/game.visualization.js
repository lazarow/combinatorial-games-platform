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
        if (typeof cb === 'function') {
            cb();
        }
    },
    /**
     * Funkcja włącza tryb interaktywny dla gracza. Po wykonaniu ruchu należy wykonać funkcję `cb` a na jej
     * wejście podać wybrany ruch.
     */
    handleHumanTurn(state, player, cb) {

        const playerPawns = document.querySelectorAll(`.${player}-pawn`);
        var isPawnMoved= false;
        var pawnMove;


        playerPawns.forEach((pawn, i)=> {
            pawn.addEventListener("click", function clickedPawn() {
                var pawnX = parseInt(pawn.getAttribute('data-col'));
                var pawnY = parseInt(pawn.getAttribute('data-row'));
                state.moves = logicOfGame.generateMovesforPawn(state, player, pawnX, pawnY);
                state.moves.forEach((move)=>{
                    let highlightedTile = document.getElementById(`${move[0]},${move[1]}`);
                    highlightedTile.classList.add('highlight');
                    highlightedTile.addEventListener("click", function clickedHighlightedTile() {
                        pawnMove = [pawnX, pawnY, move[0],move[1]];
                        let newState = logicOfGame.generateStateAfterMove(state,player,{pawn:pawnMove, tile:[0,0,0,0]});
                        visualizationOfGame.drawState(newState, player, {pawn:pawnMove, tile:[0,0,0,0]}, gameContainerEl, () => {
                            updateUserInterface();
                        });
                        visualizationOfGame.handleHumanTileTurn(newState, player, cb, pawnMove);
                    })
                });
            });
        });
    },
    handleHumanTileTurn(state,player,cb,pawnMove){
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
                            return cb({
                                pawn:pawnMove,
                                tile:[tilex,tiley,tmove[0],tmove[1]]
                            });
                        })
                    })
                })
            }
        })
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
        return `${player === "player1" ? "Czerwony" : "Czarny"} przeniósł pionka [${move.pawn[0]},${move.pawn[1]}] na [${move.pawn[2]},${move.pawn[3]}] oraz przeniósł pole [${move.tile[0]},${move.tile[1]}] na [${move.tile[2]},${move.tile[3]}]`;
    },
    /**
     * Funkcja zwraca czytelny dla człowieka opis wygranego gracza.
     */
    getReadableWinnerName(state, player) {
        return player === "player1" ? "Czarny" : "Czerwony";
    },
};
