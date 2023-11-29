const visualizationOfGame = {
    /**
     * Funkcja rysuje planszę do gry w wskazanym kontenerze (720 pikseli szerokości).
     * Po zakończeniu rysowania należy wykonać funkcję `cb`.
     */
    selectedRingId: -1,
    possibleMovesForRing: [],
    drawState(state, player, move, container, cb) {
        let board = "<table>"
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
            $("." + (player === "player1" ? "white" : "black") + "-ring").on("click", function () {
                const ringPos = [parseInt($(this).attr("data-x")), parseInt($(this).attr("data-y"))]
                state[player].rings.forEach((otherRingPos, ringIndex) => {
                    if (ringPos[0] === otherRingPos[0] && ringPos[1] === otherRingPos[1])
                    {
                        self.selectedRingId = ringIndex
                        self.possibleMovesForRing = []
                        self.possibleMovesForRing.push(...logicOfGame.getAllAlignedPositionsToPosition(ringPos, state))
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
