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
                    if (state.player1.rings.some(pos => pos[0] === x && pos[1] === y))
                    {
                        board += "<td class='white-ring'></td>"
                    }
                    else if (state.player2.rings.some(pos => pos[0] === x && pos[1] === y))
                    {
                        board += "<td class='black-ring'></td>"
                    }
                    else
                    {
                        board += "<td class='dot' data-x=" + x + " data-y=" + y +"></td>"
                    }
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
        return (player === "player1" ? "B" : "C") +  "(" + move[0]+"," + move[1]+ ")";

    },
    /**
     * Funkcja zwraca czytelny dla człowieka opis wygranego gracza.
     */
    getReadableWinnerName(state, player) {
        if (player === "player1") return "Biały";
        if (player === "player2") return "Czarny";
    },
};
