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

const gameId = "quorridor";
//plansza
const boardWidth = 9 * 2;
const boardHeight = 9 * 2;
//flaga czy jest przeskok
var jumpoverAv=false;
//flaga czy jest to bezużyteczne postawienie płotka
var uselessfence=false;
const logicOfGame = {
    /**
     * Generuje stan początkowy gry.
     */
    generateInitialState() {
        let fencestmp = [];
        //stworzenie tablicy płotków

        for (let y = boardHeight - 2; y >= 1; y--) {
            if (y % 2 === 0) {
                //wiersz parzysty 
                for (let x = 1; x <= boardHeight - 3; x += 2) {
    
                    fencestmp.push([x, y]);
                }
            } else {
                //wiersz nieparzysty
                for (let x = 0; x <= boardHeight - 3; x += 2)
    
                fencestmp.push([x, y]);
            }
        }
        return {
            player1: [8, 0], // Pozycja startowa gracza x
            player2: [8, 16],
            player1fences: 10, // Ilość płotków jaką może postawić gracz x
            player2fences: 10, 
            player1WinRow:16, //cel gracza x
            player2WinRow:0,
            occupied: [], // Tablica na postawione już płotki
            fences: fencestmp //tablica możliwych płotków
        };
    },
    /**
     * Funkcja oceny, która ocenia z punktu widzenia wskazanego gracza.
     */
    evaluateState(state, player) {

        const enemy = (player === "player1" ? "player2" : "player1");
        //stan przegranej/wygranej
        if (this.isStateTerminal(state, player)) 
            return 999;
        else if (this.isStateTerminal(state, enemy)) 
            return -999;
        

        let score =this.getDistanceToEndGoal(enemy,state) -this.getDistanceToEndGoal(player,state);
        //potrojenie wagi dystansu
        score *=3
        //sprawdzenie czy przeskok jest wartościowy
        if(jumpoverAv){
            if(state[player+"WinRow"]===0){
                if(state[player][1]-state[enemy][1]>=0)
                    score+=2
            }else{
                if(state[player][1]-state[enemy][1]<=0)
                    score+=2
            }
        }
        score += state[enemy+"fences"]-state[player+"fences"];
        if(uselessfence)
            score-=20;
        //console.log(score)
        return score;
    },

    /**
     * Funkcja generująca możliwe ruchy z wskazanego stanu dla gracza.
     */
    generateMoves(state, player) {


        const placebleFences = []; //  stawialne na płotki
        
        const enemy = player === "player1" ? "player2" : "player1";
        
        //wiersze parzyste posiadają 8 płotków pionowych natomiast wiersze nie parzyste posiadają 9 płotków poziomych
        //sprawdzenie ilości płotków
        if (state[player + "fences"] > 0) {
            for (i = 0; i < state["fences"].length; i++){
                    //pominięcie sprawdzenia blokowania jeżelinie jest ich wystarczająco
                    if(state.occupied.length>2){
                        
                        //sprawdzenie czy płotek nie zablokuje kompletnie gracza
                        //symulacja postawienia
                        state.occupied.push(state["fences"][i]);
                        if(!(this.getDistanceToEndGoal(player,state)===-1))
                            if(!(this.getDistanceToEndGoal(enemy,state)===-1))
                                placebleFences.push(state["fences"][i]);
                        state.occupied.pop(state["fences"][i]);
                    }else{
                        placebleFences.push(state["fences"][i]);
                    }
                    
                }

        }

        //możliwe ruchy
        let moves =this.getPossibleMoves(state[player][0],state[player][1],player,state)
        //dodanie przeskoku nad przeciwnikiem
        if(this.doesItHasCoords(moves,[state[enemy][0],state[enemy][1]])){
            jumpoverAv = true;
            let tmp =this.getPossibleMoves(state[enemy][0],state[enemy][1],enemy,state)
            moves = moves.concat(tmp)
            moves = moves.filter(([x,y])=>!(
                (x===state[enemy][0]&&y===state[enemy][1])||
                (x===state[player][0]&&y===state[player][1])))
        }else
            jumpoverAv = false;
        
        //złączenie możliwych ruchów
        if (state[player + "fences"] > 0)
            return moves.concat(placebleFences);

        return moves;
    },
    /*
     * usuwająca niemożliwych do postawienia płotków
     */
    removeCollidingFences(state, x, y) {
        //odsunięcia płotków które mogą nachodzić
        const offsets= [
            [ 0,-2],
            [ 0, 2],
            [-1,-1],
            [ 0, 0]
        ];
        //usunięcie nachodzących
        if (y % 2 === 0) {
            for(let i=0;i<offsets.length;++i){
                state["fences"] = state["fences"].filter(([fx,fy])=>!(fx===x+offsets[i][0]&&fy===y+offsets[i][1]))
                }
        } else {
            for(let i=offsets.length-1;i>=0;--i){
                state["fences"] = state["fences"].filter(([fx,fy])=>!(fx===x-offsets[i][1]&&fy===y-offsets[i][0]))
            }
        };
    },    



    // Funkcja sprawdzająca czy na drodze danego pionka znajduje się płotek
    getPossibleMoves(x,y,player,state) {
        //odsunięcia rucu
        const Offsets = [
            [ 0, 2],
            [ 0,-2],
            [ 2, 0],
            [-2, 0],
        ];
 
        //odsunięcia drugiego płotka blokującego
        const fenceOffsets = [
            [-2,-1],
            [-2, 1],
            [-1, 2],
            [+1, 2],
        ];
        //pozycja przeciwnika
        const enemy = player === "player1" ? "player2" : "player1";

        let possible=[];
        let nextX,nextY;

        for(let i=0;i<Offsets.length;i++){
            nextX = x+Offsets[i][0];
            nextY = y+Offsets[i][1];
            if (nextX >= 0 && nextX  < boardWidth && nextY  >= 0 && nextY < boardHeight) 
                    if(
                    !(this.doesItHasCoords(state["occupied"],[nextX  -(Offsets[i][0]/2),nextY - (Offsets[i][1]/2)]) ||
                    this.doesItHasCoords(state["occupied"],[nextX  + fenceOffsets[i][0],nextY + fenceOffsets[i][1]])))
                        possible.push([nextX ,nextY]);
    
        } 
        
        return possible;


    },
    /**
     * Funkcja zwraca dystans od x,y do celowanego wiersza za pomocą algorytmu BFS 
     * zwraca -1 gdy nie może znaleźć drogi do celu
     */
    getDistanceToEndGoal(player,state){
        //console.count("lol")
        //odwiedzone już miejsca
        const explored=[];
        explored.push([state[player][0],state[player][1]]);
        let unexplored
        //kolejka ruchów
        let que= [];
        que.push([state[player][0],state[player][1],0]);
        let current
        //dopóki są 
        while(que.length!==0){

            current = que.shift();
            //sprawdzenie czy jest na miejscu jak tak to znaleziono najkrótszą
            if(current[1]===state[player+"WinRow"])
                return current[2];

            unexplored = this.getPossibleMoves(current[0],current[1],player,state)
      
            //dodanie do kolejki kojenych możliwych ruchów
            for(let i=0;i<unexplored.length;i++){
                if(!this.doesItHasCoords(explored,unexplored[i])){

                    explored.push([unexplored[i][0],unexplored[i][1]]);
                    que.push([unexplored[i][0],unexplored[i][1],current[2]+1]);
                    
                }
        
            }
        }
        
        //nie znaleziono miejsca
        return -1

    },
    
    /**
     * funkcja sprawdza czy tablica ma dane koordynaty (szybsza niż array.some)
     */
    doesItHasCoords(coordsArray,coords){
        for(let i=0;i<coordsArray.length;i++)
            if(coordsArray[i][0]===coords[0]&&coordsArray[i][1]===coords[1])
                return true;
        return false;
    },
    /**
     * Funkcja generuje stan po wykonaniu wskazanego ruchu.
     */
    
    generateStateAfterMove(previousState, player, move) {
        //nowy stan gry
        const state = {
            player1: [...previousState.player1],
            player2: [...previousState.player2],
            player1fences: previousState.player1fences,
            player2fences: previousState.player2fences,
            player1WinRow: previousState.player1WinRow,
            player2WinRow: previousState.player2WinRow,
            occupied: [...previousState.occupied],
            fences: [...previousState.fences]

        };
        //czy to jest położenie płotka
        if (move[0] % 2 === 1 || move[1] % 2 === 1) {
            
            const enemy = (player === "player1" ? "player2" : "player1");
            if(this.getDistanceToEndGoal(enemy,previousState)===this.getDistanceToEndGoal(enemy,state))
                uselessfence=true;
            else
                uselessfence=false;
            //dodanie zajętych płotków DO DOKOŃCZENIA
            state.occupied.push(move);
            state[player + "fences"]--
            this.removeCollidingFences(state,move[0],move[1])
        } else {
            //aktualizacja pozycji gracza
            state[player] = move;
        }
        //console.log(state)
        return state;
    },
    /**
     * Funkcja sprawdza czy stan jest terminalny, tzn. koniec gry.
     */
    isStateTerminal(state, player) {
        // Sprawdzenie czy pionek przeciwnika jest po drugiej stronie
        return state[player][1] === state[player +"WinRow"];
    },
    /**
     * Funkcja generująca unikalny klucz dla wskazanego stanu.
     */
    generateUniqueKey: undefined,
};

const players = [
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (łatwy)" , maxDepth: 1, printTree: true },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (średni)", maxDepth: 2, printTree: false },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (trudny)", maxDepth: 3, printTree: false },
];const visualizationOfGame = {
    /**
     * Funkcja rysuje planszę do gry w wskazanym kontenerze (720 pikseli szerokości).
     * Po zakończeniu rysowania należy wykonać funkcję `cb`.
     */
    drawState(state, player, move, container, cb) {
        debug = 1
        // Utworzenie planszy
        let board = '<table class="board">';

        // Utworzenie liczników o ilości możliwych do postawienia płotków
        board += "<div class = 'fenceCounterA'>";
        board += "<a class = 'textA'>Płotki<a class = 'space'></a>";
        board += "<div class = 'pawnWhite'></div></a>";
        board += "<a class = 'countTextA'>x" + state.player1fences + "</a>";

        board += "<div class = 'fenceCounterB'>";
        board += "<a class = 'textB'>Płotki<a class = 'space'></a>";
        board += "<div class = 'pawnBlack'></div></a>";
        board += "<a class = 'countTextB'>x" + state.player2fences + "</a></div></div>";

        // Dodanie pustej komórki na górze planszy (aby wyrównać oznaczenia pól na planszy)
        board += "<tr><td></td>";

        /* NOTATKA O NUMEROWANIU KOLUMN
           Nieparzyste numery kolumn są numerowane od początku alfabetu (począwszy od 'a' i idące wzwyż np. a b c d ...), 
           natomiast parzyste od końca (począwszy od 'z' i idące wstecz np. z y x w v ...),
           gracz powinien móc poruszać się po polach parzystych, natomiast pola o kolumnach i wierszach nieparzystych oznaczają pola, gdzie może zostać postawiony płotek i
           gracz nie może się na takim polu znaleźć 
        */

        // Oznaczenia kolumn (górne)
        /*
        for (let x = 0; x < boardWidth-1; ++x) {
            if (x % 2 === 0) {
                board += '<td class="even"><label>' + String.fromCharCode(97 + x / 2) + '</label></td>';
            } else {
                board += '<td class="odd"></td>';
            }
        }
        */
        // Zamknięcie wiersza z oznaczeniami pól
        board += "</tr>";

        // Zmienna pomocnicza do oznaczania wierszy i kolumn płotków
        let temp = true;

        // Numerowanie wierszy z lewej strony
        for (let y = boardHeight - 1; y >= 0; --y) {

            // Oznaczenia tylko dla wierszy parzystych (kwadratów)
            if (y % 2 === 0) {
                board += '<tr class="even"><td>';
                if ((((y / 2) + 1) % 2 != 0)) {
                    board += '<label class = "labelEven">' + (y / 2 + 1) + '</label></td>';
                } else {
                    board += '<label class = "labelOdd">' + (y / 2 + 1) + '</label></td>';
                }

                // Wiersze z polami pionków na przemiennie z płotkami wertykalnymi
                for (let x = 0; x < boardWidth - 1; ++x) {
                    const isOccupied = state.occupied.some(([occupiedX, occupiedY]) => x === occupiedX && y === occupiedY);
                    if (x % 2 == 0) {
                        board += '<td class="even"> <div class= "square" data-x ="' + x + '" data-y="' + y + '">';
                    } else {
                        if (!(y == 0))
                            board += '<td class="odd"><div class="fence vertical ' + (isOccupied ? "placed" : "") + '" data-x ="' + x + '" data-y="' + y + '">';
                        else
                            board += '<td class="odd"><div>'
                    }
                    //dodanie pionków
                    if (state.player1[0] === x && state.player1[1] === y)
                        board += '<div id="whitepawn">';

                    if (state.player2[0] === x && state.player2[1] === y)
                        board += '<div id="blackpawn">';

                    board += "</div></td>";
                }
                // Wstawienie płotków horyzontalnych pomiędzy wierszami
            } else if (!(y === boardHeight - 1)) {
                board += '<tr class = "odd"<td></td>';
                for (x = 0; x <= boardHeight - 1; x += 2) {
                    const isOccupied = state.occupied.some(([occupiedX, occupiedY]) => x === occupiedX && y === occupiedY);
                    if (x === 0) {
                        if (temp) {
                            board += '<td class="firstEven"></td>';
                            temp = false;
                        } else {
                            board += '<td class="firstOdd"></td>';
                            temp = true;
                        }
                    } else {
                        board += '<td></td>';
                    }
                    board += '<td class="even"><div class="fence horizontal ' + (isOccupied ? "placed" : "") + '" data-x="' + x + '" data-y="' + y + '">';
                }
                board += "</tr>";
            }
        }

        // Zerowanie zmiennej pomocnicznej, dodanie pustego wiersza i oznaczeń dla pól (kolumn) na dole planszy
        board += '<tr><td></td>';

        // Numerowanie kolumn z dołu
        for (let x = 0; x < boardWidth; ++x) {
            // Ustawienie oznaczeń tylko dla pól parzystych (kwadratów)
            if (x % 2 === 0) {
                board += '<td>';
                if ((97 + x / 2) % 2 === 0) {
                    board += '<label class = "labelOdd">' + String.fromCharCode(97 + x / 2) + '</label></td>';
                } else {
                    board += '<label class = "labelEven">' + String.fromCharCode(97 + x / 2) + '</label></td>';
                }
            } else {
                if (x == boardWidth - 1) {
                    board += '<td></td>';
                } else {
                    if (temp) {
                        board += '<td class = "firstOdd"></td>';
                        temp = false;
                    } else {
                        board += '<td class = "firstEven"></td>';
                        temp = true;
                    }
                }
            }
        }

        // Zamknięcie tabeli
        board += '</tr>';
        board += '</table>';
        // Ustawienie HTML planszy w kontenerze
        container.innerHTML = board;

        // Wywołanie funkcji zwrotnej (callback)
        cb();
    },
    /**
     * Funkcja włącza tryb interaktywny dla gracza. Po wykonaniu ruchu należy wykonać funkcję `cb` a na jej
     * wejście podać wybrany ruch.
     */
    handleHumanTurn(state, player, cb) {
        // Pobranie referencji do pionka gracza
        const pawn = $("#" + (player === "player1" ? "white" : "black") + "pawn");
        const pawnX = state[player][0];
        const pawnY = state[player][1];
        // Wygenerowanie możliwych ruchów
        const moves = logicOfGame.generateMoves(state, player);


        let fieldsList = "";
        let i = 0;
        // Utworzenie listy pól, na które można przesunąć pionek
        //zakłada że ruchy pionków są pierwsze
        while ((moves[i][0] % 2 === 0 && moves[i][1] % 2 === 0)) {
            const field = $(".square[data-x=" + moves[i][0] + "][data-y=" + moves[i][1] + "]");
            if (field.length > 0 && field.is(":empty")) {
                fieldsList +=
                    (fieldsList.length > 0 ? ", " : "") +
                    ".square[data-x=" + moves[i][0] +
                    "][data-y=" + moves[i][1] + "]";
            }
            i++;
            if (moves[i] === undefined)
                break;
        }
        // Utworzenie listy płotków, na które można postawić
        let fencelist = "";
        for (i; i < moves.length; i++) {
            let type = ".fence".concat(moves[i][1] % 2 === 0 ? ".vertical" : ".horizontal");
            /*
            let type
            if(moves[i][1]%2===0){
                 type = ".fence"+ ".vertical";
            }else{
                 type = ".fence"+ ".horizontal";
            }*/
            const fence = $(type + "[data-x=" + moves[i][0] + "][data-y=" + moves[i][1] + "]")
            if (fence.length > 0)
                fencelist +=
                    (fencelist.length > 0 ? ", " : "") +
                    type + "[data-x=" + moves[i][0] +
                    "][data-y=" + moves[i][1] + "]";
        }

        // Pobranie referencji do pól, na które można przesunąć pionek
        const fields = $(fieldsList);
        const blockades = $(fencelist);
        // Ustawienie pionka jako przesuwalnego
        pawn.draggable({
            scope: "fields",
            revert: "invalid",
            refreshPositions: true,
            start() {
                fields.addClass("highlighted");
            },
            stop() {
                fields.removeClass("highlighted");
                fields.removeClass("highlighted2");
            },
        });



        // Ustawienie pól jako miejsca, na które można przesunąć pionek
        fields.droppable({
            accept: "#whitepawn, #blackpawn",
            scope: "fields",
            drop(event, ui) {
                ui.draggable.appendTo(this);
                cb([parseInt(ui.draggable.parent().attr("data-x")), parseInt(ui.draggable.parent().attr("data-y"))]);
            },
            over() {
                $(this).addClass("highlighted2");
            },
            out() {
                $(this).removeClass("highlighted2");
            },
        });
        //dodanie interakcji do płotków
        blockades.on({
            mouseenter() {
                $(this).addClass("hover");
            },
            mouseleave() {
                $(this).removeClass("hover");
            },
            click() {
                $(this).addClass("placed");
                $(this).removeClass("hover");
                cb([parseInt($(this).attr("data-x")), parseInt($(this).attr("data-y"))]);

            },
        });
    },
    /**
     * Funkcja zwraca nazwę gracza zgodną z zasadami.
     */
    getTruePlayerName(player) {
        if (player === "player1") return "Biały";
        if (player === "player2") return "Czarny";
    },
    /**
     * Funkcja zwraca czytelny dla człowieka opis ruchu.
     */
    getReadableMoveDescription(state, player, move) {

        if (move[0] % 2 === 0 && move[1] % 2 === 0)
            return (player === "player1" ? "B " : "C ") + "R: " + String.fromCharCode(97 + move[0] / 2) + ((move[1] / 2) + 1);
        else
            return (player === "player1" ? "B " : "C ") + "P: " + (move[1] % 2 === 0 ? "W" : "H") + String.fromCharCode(97 + Math.floor(move[0] / 2)) + (Math.ceil((move[1] / 2)))
    },
    /**
     * Funkcja zwraca czytelny dla człowieka opis wygranego gracza.
     */
    getReadableWinnerName(state, player) {
        return player === "player2" ? "Czarny" : "Biały";
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
