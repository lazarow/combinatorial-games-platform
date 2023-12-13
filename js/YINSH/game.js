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
            choosing_ring_to_remove: "none",
            pawn_chain_to_remove: [],
            player1: {
                rings: [],
                pawns: [],
                points: 0
            },
            player2: {
                rings: [],
                pawns: [],
                points: 0
            },
            highlightedPositions: [],
            positions: [
                [4, 0], [6, 0], [3, 1], [5, 1], [7, 1],
                [2, 2], [4, 2], [6, 2], [8, 2], [1, 3],
                [3, 3], [5, 3], [7, 3], [9, 3], [2, 4],
                [4, 4], [6, 4], [8, 4], [1, 5], [3, 5],
                [5, 5], [7, 5], [9, 5], [0, 6], [2, 6],
                [4, 6], [6, 6], [8, 6], [10, 6], [1, 7],
                [3, 7], [5, 7], [7, 7], [9, 7], [0, 8],
                [2, 8], [4, 8], [6, 8], [8, 8], [10, 8],
                [1, 9], [3, 9], [5, 9], [7, 9], [9, 9],
                [0, 10], [2, 10], [4, 10], [6, 10], [8, 10],
                [10, 10], [1, 11], [3, 11], [5, 11], [7, 11],
                [9, 11], [0, 12], [2, 12], [4, 12], [6, 12],
                [8, 12], [10, 12], [1, 13], [3, 13], [5, 13],
                [7, 13], [9, 13], [2, 14], [4, 14], [6, 14],
                [8, 14], [1, 15], [3, 15], [5, 15], [7, 15],
                [9, 15], [2, 16], [4, 16], [6, 16], [8, 16],
                [3, 17], [5, 17], [7, 17], [4, 18], [6, 18]
            ]
        }
    },
    /**
     * Funkcja oceny, która ocenia z punktu widzenia wskazanego gracza.
     */
    evaluateState(state, player) {
    },
    /**
     * Funkcja generująca możliwe ruchy z wskazanego stanu dla gracza.
     */
    generateMoves(state, player) {
        const moves = []

        if (state.placement_done)
        {
            if (state.choosing_ring_to_remove !== "none")
            {
                if (state.choosing_ring_to_remove === player)
                {
                    moves.push(...state[player].rings)
                }
            }
            else
            {
                state[player].rings.forEach((ring, ringIndex) => {
                    const movesForRing = this.getAllAlignedPositionsToPosition(ring, state)

                    movesForRing.forEach(pos => {
                        moves.push([ringIndex, pos])
                    })
                })
            }
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
            if (state.choosing_ring_to_remove !== "none")
            {
                if (state.choosing_ring_to_remove === player)
                {
                    state[player].rings = state[player].rings.filter(ring => !(ring[0] === move[0] && ring[1] === move[1]))

                    let filteredPawn = []
                    state[player].pawns.forEach(pawn => {
                        let include = true
                        state.pawn_chain_to_remove.forEach(rem => {
                            if (rem[0] === pawn[0] && rem[1] === pawn[1])
                            {
                                include = false
                            }
                        })

                        if (include)
                        {
                            filteredPawn.push([...pawn])
                        }
                    })
                    state[player].pawns = filteredPawn

                    state.choosing_ring_to_remove = "none"
                    state.pawn_chain_to_remove = []
                    state[player].points += 1
                    console.log(player, " punkty: ", state[player].points)
                }
            }
            else
            {
                const moveStart = state[player].rings[move[0]]
                const moveEnd = move[1]
                const direction = [0, 0]

                if (moveStart[0] > moveEnd[0])
                {
                    direction[0] = -1
                }
                if (moveStart[0] < moveEnd[0])
                {
                    direction[0] = 1
                }

                if (moveStart[1] > moveEnd[1])
                {
                    direction[1] = -1
                }
                if (moveStart[1] < moveEnd[1])
                {
                    direction[1] = 1
                }

                const currentPos = [...moveStart]
                const reverseWhite = []
                const reverseBlack = []

                while (!(currentPos[0] === moveEnd[0] && currentPos[1] === moveEnd[1]))
                {
                    currentPos[0] += direction[0]
                    currentPos[1] += direction[1]

                    if (this.isVectorOnList(currentPos, state.positions))
                    {
                        if (this.isVectorOnList(currentPos, state.player1.pawns))
                        {
                            reverseWhite.push([...currentPos])
                        }

                        if (this.isVectorOnList(currentPos, state.player2.pawns))
                        {
                            reverseBlack.push([...currentPos])
                        }
                    }
                }

                state.player1.pawns = state.player1.pawns.filter(pos => !this.isVectorOnList(pos, reverseWhite))
                state.player2.pawns = state.player2.pawns.filter(pos => !this.isVectorOnList(pos, reverseBlack))

                state.player1.pawns.push(...reverseBlack)
                state.player2.pawns.push(...reverseWhite)

                state[player].pawns.push(state[player].rings[move[0]])
                state[player].rings.splice(move[0], 1)
                state[player].rings.push(move[1])

                let whiteAffected = [...reverseBlack]
                let blackAffected = [...reverseWhite]

                if (player === "player1")
                {
                    whiteAffected.push([...moveStart])
                }
                else
                {
                    blackAffected.push([...moveStart])
                }

                const checkPlayer = (checkTable, state, player) => {
                    let newState = null
                    checkTable.forEach(pawn => {
                        const longestChain = this.getPawnLongestChain(pawn, state, player)

                        if (longestChain.length === 5)
                        {
                            state.choosing_ring_to_remove = player
                            state.pawn_chain_to_remove = [...longestChain]
                            newState = state
                        }
                    })

                    return newState
                }

                let checkTable = player === "player1" ? whiteAffected : blackAffected
                let checkReturn = checkPlayer(checkTable, state, player)
                if (checkReturn !== null)
                {
                    return checkReturn
                }
                checkTable = player === "player1" ? blackAffected : whiteAffected
                checkReturn = checkPlayer(checkTable, state, player === "player1" ? "player2" : "player1")
                if (checkReturn !== null)
                {
                    return checkReturn
                }
            }
        }
        else
        {
            if (move !== undefined)
            {
                state[player].rings.push(move)
            }

            if (state.player1.rings.length === 5 && state.player2.rings.length === 5)
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
        return state[player].points === 3;
    },
    /**
     * Funkcja generująca unikalny klucz dla wskazanego stanu.
     */
    isVectorOnList(vector, list) {
        return list.some(otherVector => otherVector[0] === vector[0] && otherVector[1] === vector[1])
    },
    getAllAlignedPositionsToPosition(position, state) {
        const boardStart = [0, 0]
        const boardEnd = [10, 18]
        let result = []
        const isPositionOnBoard = (pos) => { return pos[0] >= boardStart[0] && pos[1] >= boardStart[1] && pos[0] <= boardEnd[0] && pos[1] <= boardEnd[1] }

        if (!isPositionOnBoard(position))
        {
            return []
        }

        [[0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(direction => {
            const allRings = [...state.player1.rings, ...state.player2.rings]
            const allPawns = [...state.player1.pawns, ...state.player2.pawns]
            let pawnInLastField = false
            let pos = [...position]
            while (true)
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

                if (this.isVectorOnList(pos, allPawns))
                {
                    pawnInLastField = true
                }
                else
                {
                    result.push([...pos])

                    if (pawnInLastField)
                    {
                        break
                    }
                }
            }
        })

        return result
    },
    getPawnLongestChain(pawn, state, player) {
        let chain = []
        const boardStart = [0, 0]
        const boardEnd = [10, 18]
        const isPositionOnBoard = (pos) => { return pos[0] >= boardStart[0] && pos[1] >= boardStart[1] && pos[0] <= boardEnd[0] && pos[1] <= boardEnd[1] }

        const dirChains = new Map()
        const directions = [[0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]
        directions.forEach(dir => {
            let i = 0

            dirChains.set(dir.toString(), [])
            let nextPawn = [...pawn]
            nextPawn[0] += dir[0]
            nextPawn[1] += dir[1]
            while (isPositionOnBoard(nextPawn))
            {
                if (this.isVectorOnList(nextPawn, state.positions))
                {
                    if (this.isVectorOnList(nextPawn, state[player].pawns))
                    {
                        dirChains.get(dir.toString()).push([...nextPawn])
                    }
                    else
                    {
                        break
                    }
                }
                i++
                nextPawn[0] += dir[0]
                nextPawn[1] += dir[1]
                if (i > 1000)
                {
                    console.log("infinite loop")
                    break
                }
            }
        })

        let verticalChain = [[...pawn]]
        let diagonalUpChain = [[...pawn]]
        let diagonalDownChain = [[...pawn]]

        verticalChain.push(...dirChains.get([0, 1].toString()))
        verticalChain.push(...dirChains.get([0, -1].toString()))

        diagonalUpChain.push(...dirChains.get([-1, -1].toString()))
        diagonalUpChain.push(...dirChains.get([1, 1].toString()))

        diagonalDownChain.push(...dirChains.get([1, -1].toString()))
        diagonalDownChain.push(...dirChains.get([-1, 1].toString()))

        if (verticalChain.length > diagonalUpChain.length && verticalChain.length > diagonalDownChain.length)
        {
            return verticalChain
        }
        else if (diagonalUpChain.length > diagonalDownChain.length)
        {
            return diagonalUpChain
        }
        else
        {
            return diagonalDownChain
        }
    },
    generateUniqueKey: undefined,
};

const players = [];
const visualizationOfGame = {
    /**
     * Funkcja rysuje planszę do gry w wskazanym kontenerze (720 pikseli szerokości).
     * Po zakończeniu rysowania należy wykonać funkcję `cb`.
     */
    selectedRingId: -1,
    possibleMovesForRing: [],
    drawState(state, player, move, container, cb) {
        let board = "Punkty dla gracza Białego: " + state.player1.points + "<table>"

        for (let y=0; y<19; y++)
        {
            board += "<tr>"
            for (let x=0; x<11; x++)
            {
                const currentPos = [x, y]
                if (logicOfGame.isVectorOnList(currentPos, state.positions))
                {
                    board += "<td class="
                    if (logicOfGame.isVectorOnList(currentPos, state.player1.rings))
                    {
                        board += "'white-ring'"
                    }
                    else if (logicOfGame.isVectorOnList(currentPos, state.player1.pawns))
                    {
                        board += "'white-pawn'"
                    }
                    else if (logicOfGame.isVectorOnList(currentPos, state.player2.rings))
                    {
                        board += "'black-ring'"
                    }
                    else if (logicOfGame.isVectorOnList(currentPos, state.player2.pawns))
                    {
                        board += "'black-pawn'"
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
        board += "</table> Punkty dla gracza Czarnego: " + state.player2.points;
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
            if (state.choosing_ring_to_remove !== "none")
            {
                if (state.choosing_ring_to_remove === player)
                {
                    $("." + (player === "player1" ? "white" : "black") + "-ring").on("click", function () {
                        const ringPos = [parseInt($(this).attr("data-x")), parseInt($(this).attr("data-y"))]
                        cb(ringPos)
                    })
                }
                else
                {
                    cb()
                }
            }
            else
            {
                self.selectedRingId = -1
                self.possibleMovesForRing = []

                $("." + (player === "player1" ? "white" : "black") + "-ring").on("click", function () {
                    const ringPos = [parseInt($(this).attr("data-x")), parseInt($(this).attr("data-y"))]
                    state[player].rings.forEach((otherRingPos, ringIndex) => {
                        if (ringPos[0] === otherRingPos[0] && ringPos[1] === otherRingPos[1])
                        {
                            self.selectedRingId = ringIndex
                            self.possibleMovesForRing = []


                            self.possibleMovesForRing.push(...logicOfGame.getAllAlignedPositionsToPosition(ringPos, state))
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
        if (player === "player1") return "Biały";
        if (player === "player2") return "Czarny";
    },
    /**
     * Funkcja zwraca czytelny dla człowieka opis ruchu.
     */
    getReadableMoveDescription(state, player, move) {
        if (state.placement_done)
        {
            if (state.choosing_ring_to_remove !== "none")
            {
                if (state.choosing_ring_to_remove === player)
                {
                    return (player === "player1" ? "B" : "C") + "r(" + move[0] + "," + move[1] + ")"
                }
                else
                {
                    return (player === "player1" ? "B" : "C") + "w"
                }
            }
            else
            {
                return (player === "player1" ? "B" : "C") + "(" + move[1][0] + "," + move[1][1] + ")"
            }
        }
        else
        {
            return (player === "player1" ? "B" : "C") + "(" + move[0] + "," + move[1] + ")"
        }
    },
    /**
     * Funkcja zwraca czytelny dla człowieka opis wygranego gracza.
     */
    getReadableWinnerName(state, player) {
        if (player === "player1") return "Biały";
        if (player === "player2") return "Czarny";
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
