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
        console.log('test');
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
/**
 * Domyślni gracze, którzy nie potrzebują dodatkowej konfiguracji.
 */
const allPlayers = [
    { type: PlayerTypes.RANDOM, label: "Losowy" },
    { type: PlayerTypes.HUMAN, label: "Człowiek" },
].concat(players);

/**
 * Utworzenie list wyboru z graczami.
 */
for (const [index, player] of Object.entries(allPlayers)) {
    const playerOption = document.createElement("option");
    playerOption.value = index;
    if (index === 0) {
        playerOption.selected = "selected";
    }
    playerOption.innerText = player.label;
    document.querySelector("#player1").appendChild(playerOption.cloneNode(true));
    document.querySelector("#player2").appendChild(playerOption.cloneNode(true));
}

/**
 * Ustalenie prawdziwych nazw dla graczy.
 */
document.querySelector("#player1TrueName").innerText = visualizationOfGame.getTruePlayerName("player1");
document.querySelector("#player2TrueName").innerText = visualizationOfGame.getTruePlayerName("player2");

/**
 * Podstawowe struktury wymagane do przeprowadzenia gry.
 */
const workers = {
    player1: null,
    player2: null,
};
let currentState = null;
let currentPlayer = null;
let currentMove = null;
let currentTurn = null;
let statesHistory = [];
let movesHistory = [];
const defaultAlphaBetaTextTree = "Uruchom agenta SI aby wygenerować kod drzewa.";
let alphaBetaTextTree = defaultAlphaBetaTextTree;

/**
 * Uchwyty do struktur HTML związanych z grą.
 */
const gameContainerEl = document.querySelector("#game");

/**
 * Obsługa przycisku start.
 */
document.querySelector("#startButton").onclick = function () {
    if (workers.player1) workers.player1.terminate();
    if (workers.player2) workers.player2.terminate();

    // Reset gry i interfejsu.
    reset(() => {
        hideUserInterface();
        updateUserInterface();
        startCurrentTurn();
    });
};

/**
 * Czyszczenie stanu planszy.
 */
function reset(cb) {
    currentState = logicOfGame.generateInitialState();
    currentPlayer = "player1";
    currentMove = null;
    currentTurn = -1;
    statesHistory = [];
    movesHistory = [];

    // Rysowanie planszy.
    visualizationOfGame.drawState(currentState, currentPlayer, currentMove, gameContainerEl, cb);
}

/**
 * Akceptacja ruchu oraz aktualizacja stanu gry.
 */
function makeMove(move) {
    currentState = logicOfGame.generateStateAfterMove(currentState, currentPlayer, move);
    currentPlayer = currentPlayer === "player1" ? "player2" : "player1";
    currentMove = move;
    currentTurn += 1;
    statesHistory.push(currentState);
    movesHistory.push(move);
    visualizationOfGame.drawState(currentState, currentPlayer, currentMove, gameContainerEl, () => {
        updateUserInterface();
        startCurrentTurn();
    });
}

/**
 * Procedura obsługi następnej tury gry poprzez wybór gracza na podstawie selektora.
 */
function startCurrentTurn() {
    // Sprawdzenie czy nie dotarliśmy do końca gry.
    if (logicOfGame.isStateTerminal(currentState, currentPlayer)) {
        updateUserInterfaceAfterGame(true, true);
        return;
    }

    // Pobranie identyfikatora algorytmu dla gracza.
    const playerIndex = document.querySelector("#" + currentPlayer).value;
    switch (allPlayers[playerIndex].type) {
        case PlayerTypes.HUMAN:
            visualizationOfGame.handleHumanTurn(currentState, currentPlayer, makeMove);
            break;
        case PlayerTypes.RANDOM:
            let randomMove = getRandomMove();
            setTimeout(() => makeMove(randomMove), 30);
            break;
        case PlayerTypes.SIMPLE_SCORE:
            let simplyBestMove = getSimplyBestMove();
            setTimeout(() => makeMove(simplyBestMove), 30);
            break;
        case PlayerTypes.ALPHABETA:
            workers[currentPlayer] = new Worker("js/" + gameId + "/alphabeta.js");
            workers[currentPlayer].addEventListener(
                "message",
                function (e) {
                    const [score, move, textTree] = e.data;
                    workers[currentPlayer].terminate();
                    console.timeEnd("ALPHABETA");
                    workers[currentPlayer] = null;
                    if (allPlayers[playerIndex].printTree) {
                        alphaBetaTextTree = textTree;
                    }
                    makeMove(move);
                },
                false
            );
            console.time("ALPHABETA");
            workers[currentPlayer].postMessage({
                state: currentState,
                player: currentPlayer,
                maxDepth: allPlayers[playerIndex].maxDepth,
            });
            break;
        case PlayerTypes.MCTS:
            workers[currentPlayer] = new Worker("js/" + gameId + "/mcts.js");
            workers[currentPlayer].addEventListener(
                "message",
                function (e) {
                    const [move] = e.data;
                    workers[currentPlayer].terminate();
                    console.timeEnd("MCTS");
                    workers[currentPlayer] = null;
                    makeMove(move);
                },
                false
            );
            console.time("MCTS");
            workers[currentPlayer].postMessage({
                state: currentState,
                player: currentPlayer,
                iterations: allPlayers[playerIndex].iterations,
            });
            break;
    }
}

function getRandomMove() {
    const moves = logicOfGame.generateMoves(currentState, currentPlayer);
    return moves[Math.floor(Math.random() * moves.length)];
}

function getSimplyBestMove() {
    const moves = logicOfGame.generateMoves(currentState, currentPlayer);
    let bestMove = moves[0];
    let bestScore = logicOfGame.evaluateState(
        logicOfGame.generateStateAfterMove(currentState, currentPlayer, bestMove),
        currentPlayer
    );
    for (let i = 1; i < moves.length; ++i) {
        let score = logicOfGame.evaluateState(
            logicOfGame.generateStateAfterMove(currentState, currentPlayer, moves[i]),
            currentPlayer
        );
        if (score > bestScore) {
            bestMove = moves[i];
            bestScore = score;
        }
    }
    return bestMove;
}

/**
 * Uchwyty do struktur HTML związanych z grą.
 */
const tabHistoryButtonEl = document.querySelector("#tabHistoryButton");
const currentPlayerNameEl = document.querySelector("#currentPlayerName");
const currentTurnEl = document.querySelector("#currentTurn");
const gameHistoryNavigationEl = document.querySelector("#gameHistoryNavigation");
const tabHistoryEl = document.querySelector("#tabHistory");
const gameOverNotificationEl = document.querySelector("#gameOverNotification");
const winnerNameEl = document.querySelector("#winnerName");
const alphaBetaTextTreeEl = document.querySelector("#alphaBetaTextTree");

/**
 * Aktualizacja interfejsu.
 */
function updateUserInterface() {
    currentPlayerNameEl.parentNode.classList.remove("d-none");
    currentPlayerNameEl.innerHTML = visualizationOfGame.getTruePlayerName(currentPlayer);
    currentTurnEl.innerText = statesHistory.length + 1;
    gameHistoryNavigationEl.classList.add("d-none");
    tabHistoryEl.innerHTML = "";
    alphaBetaTextTreeEl.innerText = alphaBetaTextTree;
}

/**
 * Ukrycie interfejsu (start i restart gry).
 */
function hideUserInterface() {
    currentPlayerNameEl.parentNode.classList.add("d-none");
    gameOverNotificationEl.classList.add("d-none");
    gameHistoryNavigationEl.classList.add("d-none");
    tabHistoryEl.innerHTML = "";
    alphaBetaTextTreeEl.innerText = defaultAlphaBetaTextTree;
}

/**
 * Aktualizacja interfejsu po zakończeniu gry.
 */
function updateUserInterfaceAfterGame(forceHistoryTab = false, forceWinnerUpdate = false) {
    if (forceHistoryTab) {
        bootstrap.Tab.getOrCreateInstance(tabHistoryButtonEl).show();
    }
    if (forceWinnerUpdate) {
        winnerNameEl.innerText = visualizationOfGame.getReadableWinnerName(currentState, currentPlayer);
    }

    // Wyświetlenie powiadomienia o zakończeniu gry.
    currentPlayerNameEl.parentNode.classList.add("d-none");
    gameOverNotificationEl.classList.remove("d-none");

    // Wyświetlenie kontrolek przebiegu gry.
    gameHistoryNavigationEl.classList.remove("d-none");

    // Wygenerowanie przebiegu gry w postaci serii odnośników.
    let historyLinks = "";
    for (let turn = 0; turn < statesHistory.length; ++turn) {
        const readableMoveDescription = visualizationOfGame.getReadableMoveDescription(
            statesHistory[turn],
            turn % 2 === 0 ? "player1" : "player2",
            movesHistory[turn]
        );
        if (currentTurn === turn) {
            historyLinks += `<a href="javascript:void(0);" onclick="restoreTurn(${turn})"><b>[${
                turn + 1
            }. ${readableMoveDescription}]</b></a> `;
        } else {
            historyLinks += `<a href="javascript:void(0);" onclick="restoreTurn(${turn})">${
                turn + 1
            }. ${readableMoveDescription}</a> `;
        }
    }
    tabHistoryEl.innerHTML = historyLinks;
}

function restoreTurn(turn) {
    currentState = statesHistory[turn];
    currentPlayer = turn % 2 === 0 ? "player1" : "player2";
    currentMove = movesHistory[turn];
    currentTurn = turn;
    visualizationOfGame.drawState(currentState, currentPlayer, currentMove, document.querySelector("#game"), () => {
        updateUserInterfaceAfterGame();
    });
}

function restoreFirstTurn() {
    restoreTurn(0);
}

function restoreLastTurn() {
    restoreTurn(statesHistory.length - 1);
}

function restorePreviousTurn() {
    if (currentTurn > 0) {
        restoreTurn(currentTurn - 1);
    }
}

function restoreNextTurn() {
    if (currentTurn < statesHistory.length - 1) {
        restoreTurn(currentTurn + 1);
    }
}

/**
 * Uruchomienie gry.
 */
reset(() => {
    hideUserInterface();
});
