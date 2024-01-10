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
const visualizationOfGame = {
    /**
     * Funkcja rysuje planszę do gry w wskazanym kontenerze (720 pikseli szerokości).
     * Po zakończeniu rysowania należy wykonać funkcję `cb`.
     */
    selectedRingId: -1,
    possibleMovesForRing: [],
    drawState(state, player, move, container, cb) {
        let board = '<table class="board">'
        for (let y=0; y<5; y++)
        {
            board += "<tr>"
            for (let x=0; x<5; x++)
            {
                const currentPos = [x, y]
                if (logicOfGame.isVectorOnList(currentPos, state.positions))
                {
                    board += "<td class="
                    if (logicOfGame.isVectorOnList(currentPos, state.player1.rings))
                    {
                        board += "'blue'"
                    }
                    else if (logicOfGame.isVectorOnList(currentPos, state.player2.rings))
                    {
                        board += "'red'"
                    }
                    else
                    {
                        board += "'dot'"
                    }
                    board += " data-x=" + x + " data-y=" + y +"></td>"
                }
                else
                {
                    board += "<td></td>"
                }
            }
            board += "</tr>"
        }
        board += "</table>"
        container.innerHTML = board;
        cb();
    },
    /**
     * Funkcja włącza tryb interaktywny dla gracza. Po wykonaniu ruchu należy wykonać funkcję `cb` a na jej
     * wejście podać wybrany ruch.
     */
    handleHumanTurn(state, player, cb) {
        

        
        
        if (state.placement_done)
        {
            self.selectedRingId = -1
            self.possibleMovesForRing = []

            $("." + (player === "player1" ? "blue" : "red") ).on("click", function () {
                const ringPos = [parseInt($(this).attr("data-x")), parseInt($(this).attr("data-y"))]
                state[player].rings.forEach((otherRingPos, ringIndex) => {
                    if (ringPos[0] === otherRingPos[0] && ringPos[1] === otherRingPos[1])
                    {
                        self.selectedRingId = ringIndex
                        self.possibleMovesForRing = []
                        
                        
                        self.possibleMovesForRing.push(...logicOfGame.getAllSurroundingPositionsToPosition(ringPos, state))
                        $(".highlight").toggleClass("highlight dot")
                        $(".dot").each(function () {
                            var x = parseInt($(this).attr("data-x"));
                            var y = parseInt($(this).attr("data-y"));
                            if (logicOfGame.isVectorOnList([x, y], self.possibleMovesForRing)) {
                                $(this).toggleClass("dot highlight");
                            }
                            

                        });
                    }
                })
            })

            $(".dot").on("click", function() {
                if (self.selectedRingId !== -1)
                {
                    const currentPosition = [parseInt($(this).attr("data-x")), parseInt($(this).attr("data-y"))]
                    if (logicOfGame.isVectorOnList(currentPosition, self.possibleMovesForRing))
                    {
                        
                        cb([self.selectedRingId, currentPosition])
                        self.selectedRingId = -1
                    }
                }
            })
        }
        else
        {
            $(".dot").on("click", function() {
                cb([parseInt($(this).attr("data-x")), parseInt($(this).attr("data-y"))])
            })
        }
    },
    /**
     * Funkcja zwraca nazwę gracza zgodną z zasadami.
     */
    getTruePlayerName(player) {
        if (player === "player1") return "blue";
        if (player === "player2") return "red";
    },
    /**
     * Funkcja zwraca czytelny dla człowieka opis ruchu.
     */
    getReadableMoveDescription(state, player, move) {
       

    },
    /**
     * Funkcja zwraca czytelny dla człowieka opis wygranego gracza.
     */
    getReadableWinnerName(state, player) {
        if (player === "player1") return "blue";
        if (player === "player2") return "red";
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
