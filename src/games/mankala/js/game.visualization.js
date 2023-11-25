const visualizationOfGame = {
    /**
     * Funkcja rysuje planszę do gry w wskazanym kontenerze (720 pikseli szerokości).
     * Po zakończeniu rysowania należy wykonać funkcję `cb`.
     */
    drawState(state, player, move, container, cb) {
        const player1Board = state["player1"].pits;
        const player2Board = state["player2"].pits;
        const player1Store = state["player1"].store;
        const player2Store = state["player2"].store;

        let board = '<div class="mancala-board">';
        board += `<div class="player2-store">${player2Store}</div>`;
        board += '<div class="pits-row">';
        for (let i = 0; i < 6; i++) {
            board += `<div class="pit player2-pit">${player2Board[5 - i]}</div>`;
        }
        board += '</div>';
        board += '<div class="pits-row">';
        for (let i = 0; i < 6; i++) {
            board += `<div class="pit player1-pit">${player1Board[i]}</div>`;
        }
        board += '</div>';
        board += `<div class="player1-store">${player1Store}</div>`;
        board += "</div>";

        container.innerHTML = board;
        cb();
    },
    /**
     * Funkcja włącza tryb interaktywny dla gracza. Po wykonaniu ruchu należy wykonać funkcję `cb` a na jej
     * wejście podać wybrany ruch.
    */

    handleHumanTurn(state, player, cb) {
        const playerPits = document.querySelectorAll(`.${player}-pit`);

        playerPits.forEach((pit, i) => {
            pit.addEventListener("click", () => {
                if (state[player].pits[i] !== 0) {
                    cb(i);
                }
            });
        });
    },
    /**
     * Funkcja zwraca nazwę gracza zgodną z zasadami.
     */
    getTruePlayerName(player) {
        return player === "player1" ? "Player 1" : "Player 2";
    },
    /**
     * Funkcja zwraca czytelny dla człowieka opis ruchu.
     */
    getReadableMoveDescription(state, player, move) {
        return `Player ${player === "player1" ? "1" : "2"} moves ${move + 1}`;
    },
    /**
     * Funkcja zwraca czytelny dla człowieka opis wygranego gracza.
     */
    getReadableWinnerName(state, player) {
        return `Player ${player === "player1" ? "1" : "2"}!`;
    },
};
