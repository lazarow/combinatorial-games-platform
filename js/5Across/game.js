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
const gameId = "5Across";

const logicOfGame = {
    generateInitialState() {
        const numRows = 6; // Number of rows in the game grid
        const numCols = 7; // Number of columns in the game grid

        // Create an empty game grid
        const initialState = [];
        for (let row = 0; row < numRows; row++) {
            initialState.push(Array(numCols).fill(null));
        }

        return initialState;
    },

    evaluateState(state, player) {
        const checkWinner = (line) => {
            const playerCount = line.filter(cell => cell === player).length;
            const opponentCount = line.filter(cell => cell !== player && cell !== null).length;

            // If the line has five consecutive player pieces, return a positive score
            if (playerCount === 5) {
                return 100;
            }

            // If the line has five consecutive opponent pieces, return a negative score
            if (opponentCount === 5) {
                return -100;
            }

            return 0; // Neutral state
        };

        // Check rows
        for (let row = 0; row < state.length; row++) {
            for (let col = 0; col <= state[row].length - 5; col++) {
                const line = state[row].slice(col, col + 5);
                const score = checkWinner(line);
                if (score !== 0) {
                    return score;
                }
            }
        }

        // Check columns
        for (let col = 0; col < state[0].length; col++) {
            for (let row = 0; row <= state.length - 5; row++) {
                const line = [state[row][col], state[row + 1][col], state[row + 2][col], state[row + 3][col], state[row + 4][col]];
                const score = checkWinner(line);
                if (score !== 0) {
                    return score;
                }
            }
        }

        // Check diagonals (from top-left to bottom-right)
        for (let row = 0; row <= state.length - 5; row++) {
            for (let col = 0; col <= state[row].length - 5; col++) {
                const line = [state[row][col], state[row + 1][col + 1], state[row + 2][col + 2], state[row + 3][col + 3], state[row + 4][col + 4]];
                const score = checkWinner(line);
                if (score !== 0) {
                    return score;
                }
            }
        }

        // Check diagonals (from top-right to bottom-left)
        for (let row = 0; row <= state.length - 5; row++) {
            for (let col = 4; col < state[row].length; col++) {
                const line = [state[row][col], state[row + 1][col - 1], state[row + 2][col - 2], state[row + 3][col - 3], state[row + 4][col - 4]];
                const score = checkWinner(line);
                if (score !== 0) {
                    return score;
                }
            }
        }

        return 0; // No winner yet
    },

    generateMoves(state, player) {
        // Implement the logic to generate possible moves for the specified player
        // You might return an array of valid column indices where the player can make a move

        const validMoves = [];
        for (let col = 0; col < state[0].length; col++) {
            // Check if the column is not full
            if (state[0][col] === null) {
                validMoves.push(col);
            }
        }

        return validMoves;
    },

    generateStateAfterMove(previousState, player, move) {
        // Implement the logic to generate the state after a move is made
        // You need to find the lowest empty row in the selected column and place the player's piece there

        const newState = JSON.parse(JSON.stringify(previousState)); // Deep copy to avoid modifying the original state
        for (let row = newState.length - 1; row >= 0; row--) {
            if (newState[row][move] === null) {
                newState[row][move] = player;
                break;
            }
        }

        return newState;
    },

    isStateTerminal(state, player) {
        // Implement the logic to check if the game state is terminal (game over)
        // You might check for a winner or a full board

        const isBoardFull = state.every(row => row.every(cell => cell !== null));
        const winnerScore = this.evaluateState(state, player);

        return isBoardFull || Math.abs(winnerScore) === 100;
    },

    generateUniqueKey(state) {
        // Implement the logic to generate a unique key for the game state
        // You might serialize the state into a string for simplicity
        return JSON.stringify(state);
    },
};


const players = [];
const visualizationOfGame = {
    drawState(state, player, move, container, cb) {
        const gameBoard = document.createElement('div');
        gameBoard.id = 'game-board';

        for (let row = 0; row < state.length; row++) {
            for (let col = 0; col < state[row].length; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                const playerTile = state[row][col];
                if (playerTile !== null) {
                    cell.textContent = playerTile === 'player1' ? 'X' : 'O';
                    cell.style.backgroundColor = playerTile === 'player1' ? '#ffcccb' : '#add8e6';
                }

                cell.addEventListener('click', () => {
                    const clickedCell = event.target;
                    const row = parseInt(clickedCell.dataset.row, 10);
                    const col = parseInt(clickedCell.dataset.col, 10);
                    cb({ row, col });
                });

                gameBoard.appendChild(cell);
            }
        }

        container.innerHTML = '';
        container.appendChild(gameBoard);

        // Execute the callback function
        cb();
    },

    handleHumanTurn(state, player, cb) {
        const gameBoard = document.getElementById('game-board');

    // Create buttons for each column
    const buttonRow = document.createElement('div');
    buttonRow.className = 'column-buttons';

    for (let col = 0; col < state[0].length; col++) {
        const button = document.createElement('button');
        button.textContent = `${col + 1}`;
        button.addEventListener('click', () => {
            // Check if the selected column is not full
            if (state[0][col] === null) {
                cb(col);
            } else {
                alert('Column is full. Please choose another column.');
            }
        });

        buttonRow.appendChild(button);
    }

    // Append buttons below the game board
    gameBoard.insertAdjacentElement('afterend', buttonRow);
    },

    getTruePlayerName(player) {
        return player === 'player1' ? 'X' : 'O';
    },

    getReadableMoveDescription(state, player, move) {
        return `${this.getTruePlayerName(player)} dropped a piece in column ${move + 1}`;
    },

    getReadableWinnerName(state, player) {
        const winnerScore = logicOfGame.evaluateState(state, player);

        if (winnerScore === 100) {
            return `Player ${player === 'player1' ? 'X' : 'O'} wins!`;
        } else if (winnerScore === -100) {
            return `Player ${player === 'player1' ? 'O' : 'X'} wins!`;
        } else {
            return 'It\'s a draw!';
        }
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
