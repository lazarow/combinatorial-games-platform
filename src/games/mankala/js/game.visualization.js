const visualizationOfGame = {
    /**
     * Funkcja rysuje planszę do gry w wskazanym kontenerze (720 pikseli szerokości).
     * Po zakończeniu rysowania należy wykonać funkcję `cb`.
     */

    drawState(state, player, move, container, cb) {
        /**
         * The board is layed out in this specific way to emulate the physical board as closely as possible,
         * with the store for player 2 on the left and the store for player 1 on the right, and all of the pits in between.
         */
        
        // Extract the board and store for each player from the state
        const player1Board = state["player1"].pits;
        const player2Board = state["player2"].pits;
        const player1Store = state["player1"].store;
        const player2Store = state["player2"].store;
    
        // Initialize the board HTML
        let board = '<div class="mancala-board">';
    
        // Add the store for player 2
        board += `<div class="player2-store">${player2Store}</div>`;
    
        // Add the pits for each player
        board += '<div class= "pit-container">'
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
        board += "</div>";
    
        // Add the store for player 1
        board += `<div class="player1-store">${player1Store}</div>`;
    
        board += "</div>";
    
        // Draw the board in the container
        container.innerHTML = board;
        cb();
    },

    /**
     * Funkcja włącza tryb interaktywny dla gracza. Po wykonaniu ruchu należy wykonać funkcję `cb` a na jej
     * wejście podać wybrany ruch.
    */

    handleHumanTurn(state, player, cb) {
        // Get all the pits for the current player
        const playerPits = document.querySelectorAll(`.${player}-pit`);
    
        // Add a click event listener to each pit
        playerPits.forEach((pit, i) => {
            pit.addEventListener("click", () => {
                // Calculate the index of the pit in the state (We need to reverse the index for player 2)
                const index = player === 'player2' ? 5 - i : i;
    
                // If the pit is not empty, execute the callback function with the index of the pit
                if (state[player].pits[index] !== 0) {
                    cb(index);
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
        if (state.player1.store > state.player2.store) {
            return "Player 1";
        } else if (state.player1.store < state.player2.store) {
            return "Player 2";
        } else {
            return "Nikt! Remis!";
        }        
    },
};
