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
const boardWidth = 8;
const boardHeight = 6;

const logicOfGame = {
    generateInitialState() {
        return {
            player1: [0, 3],
            player2: [7, 2],
            removed: [],
        };
    },
    evaluateState(state, player) {
        //const playerMoves = this.generateMoves(state, player);
        //const opponentMoves = this.generateMoves(state, player==="player1" ? "player2" : "player1");

        //const weightMoves = 0.3;
        //const weightIsolation = 0.7;

        // Funkcja oceny uwzględniająca dostępne ruchy i izolację przeciwnika
       // const evaluation = weightMoves * playerMoves + weightIsolation * opponentMoves;

       // return evaluation;

    },
    generateMoves(state, player) {
        const offsets = [
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1],
            [-1, 1],
            [-1, -1],
            [-1, 0],
        ];
        const moves = [];
        for (let i = 0; i < offsets.length; ++i) {
            const x = state[player][0] + offsets[i][0];
            const y = state[player][1] + offsets[i][1];
            if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight) {
                const invalidPositions = [state.player1, state.player2, ...state.removed];
                if (invalidPositions.some(([invalidX, invalidY]) => x === invalidX && y === invalidY) === false) {
                    for (let rx = 0; rx < boardWidth; rx++) {
                        for (let ry = 0; ry < boardHeight; ry++) {
                            const unremovablePositions = [
                                state[player === "player1" ? "player2" : "player1"],
                                [x, y],
                                ...state.removed
                            ];
                            if (unremovablePositions.some(([invX, invY]) => invX === rx && invY === ry) === false) {
                                moves.push([x, y, rx, ry]);
                            }
                        }
                    }
                }
            }
        }
        return moves;
    },
    generateStateAfterMove(previousState, player, move) {
        const state = {
            player1: [...previousState.player1],
            player2: [...previousState.player2],
            removed: [...previousState.removed],
        };
        state.removed.push([move[2], move[3]]);

        state[player] = [move[0], move[1]];

        return state;
    },
    isStateTerminal(state, player) {
        const availableMoves = this.generateMoves(state, player);
        return availableMoves.length === 0;
    },
    generateUniqueKey: undefined,
};



const players = [];
const visualizationOfGame = {
    drawState(state, player, move, container, cb) {
        let board = '<table class="board">';
        board += "<tr><td></td>";
        for (let x = 0; x < boardWidth; ++x) {
            board += "<td><label>" + String.fromCharCode(97 + x);
            +"</label></td>";
        }
        board += "</tr>";
        for (let y = boardHeight - 1; y >= 0; --y) {
            board += "<tr><td><label>" + (y + 1) + "</label></td>";
            for (let x = 0; x < boardWidth; ++x) {
                const isRemoved = state.removed.some(([removedX, removedY]) => x === removedX && y === removedY);
                board +=
                    '<td class="square"><div class="square-placeholder" data-x="' +
                    x +
                    '" data-y="' +
                    y +
                    '" data-available="' +
                    (isRemoved ? "false" : "true") +
                    '">';
                if (state.player1[0] === x && state.player1[1] === y) {
                    board += '<div id="red-pawn"></div>';
                }
                if (state.player2[0] === x && state.player2[1] === y) {
                    board += '<div id="blue-pawn"></div>';
                }
                board += "</div></td>";
            }
            board += "<td><label>" + (y + 1) + "</label></td>";
            board += "</tr>";
        }
        board += "<tr><td></td>";
        for (let x = 0; x < boardWidth; ++x) {
            board += "<td><label>" + String.fromCharCode(97 + x);
            +"</label></td>";
        }
        board += "</tr>";
        board += "</table>";
        container.innerHTML = board;
        cb();
    },
    handleHumanTurn(state, player, cb, phase = "moving", moveX = -1, moveY = -1) {
        if (phase === "moving") {
            const pawn = $("#" + (player === "player1" ? "red" : "blue") + "-pawn");
            const moves = logicOfGame.generateMoves(state, player);
            let fieldsList = "";
            for (let i = 0; i < moves.length; ++i) {
                const field = $(".square-placeholder[data-x=" + moves[i][0] + "][data-y=" + moves[i][1] + "]");
                if (field.length > 0 && field.attr("data-available") === "true" && field.is(":empty")) {
                    fieldsList +=
                        (fieldsList.length > 0 ? ", " : "") +
                        ".square-placeholder[data-x=" +
                        moves[i][0] +
                        "][data-y=" +
                        moves[i][1] +
                        "]";
                }
            }
            const fields = $(fieldsList);
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
            fields.droppable({
                accept: "#red-pawn, #blue-pawn",
                scope: "fields",
                drop(event, ui) {
                    ui.draggable.draggable("destroy");
                    ui.draggable.appendTo(this);
                    ui.draggable.css("top", 0);
                    ui.draggable.css("left", 0);
                    fields.droppable("destroy");
                    moveX = parseInt(ui.draggable.parent().attr("data-x"));
                    moveY = parseInt(ui.draggable.parent().attr("data-y"));
                    console.log(moveX, moveY);
                    visualizationOfGame.handleHumanTurn(state, player, cb, "removing", moveX, moveY);
                },
                over() {
                    $(this).addClass("highlighted2");
                },
                out() {
                    $(this).removeClass("highlighted2");
                },
            });
        } else if (phase === "removing") {
            let fieldsListR = "";
            for (let x = 0; x >= 0 && x < 8; ++x) {
                for (let y = 0; y >= 0 && y < 6; ++y) {
                    const fieldR = $(".square-placeholder[data-x=" + x + "][data-y=" + y + "]");
                    if (fieldR.length > 0 && fieldR.attr("data-available") === "true" && fieldR.is(":empty")) {
                        fieldsListR +=
                            (fieldsListR.length > 0 ? ", " : "") +
                            ".square-placeholder[data-x=" +
                            x +
                            "][data-y=" +
                            y +
                            "]";
                    }
                }
            }
            const fieldsR = $(fieldsListR);
            $(fieldsR).on("click", function() {
                $(fieldsR).off("click");
                const clickedX = parseInt($(this).attr("data-x"));
                const clickedY = parseInt($(this).attr("data-y"));
                console.log(clickedX, clickedY);
                cb([moveX, moveY, clickedX, clickedY]);
            });
        }
        /*
        console.log("ad1");
        let moveX, moveY, clickedX, clickedY;
            
           console.log(moveX, moveY, "undefined");
           
          // return;
            //handleHumanTurn(state, player, cb, phase = "removing", moveX = -1, moveY = -1);
        
        

     */
    },
    getTruePlayerName(player) {
        if (player === "player1") return "Czerwony";
        if (player === "player2") return "Niebieski";
    },
    getReadableMoveDescription(state, player, move) {
        return (player === "player1" ? "C" : "N") + String.fromCharCode(97 + move[0]) + (move[1] + 1);
    },
    getReadableWinnerName(state, player) {
        return player === "player1" ? "Niebieski" : "Czerwony";
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
