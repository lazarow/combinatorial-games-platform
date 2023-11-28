const visualizationOfGame = {
    /**
     * Funkcja rysuje planszę do gry w wskazanym kontenerze (720 pikseli szerokości).
     * Po zakończeniu rysowania należy wykonać funkcję `cb`.
     */
    drawState(state, player, move, container, cb) {
        let board = "<table>"
        for (let y=0; y<19; y++)
        {
            board += "<tr>"
            for (let x=0; x<11; x++)
            {
                if (state.positions.some(pos => pos[0] === x && pos[1] === y))
                {
                    board += "<td class='dot'></td>"
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

    },
    /**
     * Funkcja zwraca nazwę gracza zgodną z zasadami.
     */
    getTruePlayerName(player) {},
    /**
     * Funkcja zwraca czytelny dla człowieka opis ruchu.
     */
    getReadableMoveDescription(state, player, move) {},
    /**
     * Funkcja zwraca czytelny dla człowieka opis wygranego gracza.
     */
    getReadableWinnerName(state, player) {},
};
