const visualizationOfGame = {
    /**
     * Funkcja rysuje planszę do gry w wskazanym kontenerze (720 pikseli szerokości).
     * Po zakończeniu rysowania należy wykonać funkcję `cb`.
     */
    drawState(state, player, move, container, cb) {

        // Utworzenie planszy
        let board = '<table class="board">';

        // Dodanie pustej komórki na górze planszy (aby wyrównać oznaczenia pól na planszy)
        board += "<tr><td></td>";

        /* NOTATKA O NUMEROWANIU KOLUMN
           Nieparzyste numery kolumn są numerowane od początku alfabetu (począwszy od 'a' i idące wzwyż np. a b c d ...), 
           natomiast parzyste od końca (począwszy od 'z' i idące wstecz np. z y x w v ...),
           gracz powinien móc poruszać się po polach parzystych, natomiast pola o kolumnach nieparzystych oznaczają pola, gdzie może zostać postawiony płotek i
           gracz nie może się na takim polu znaleźć 
        */


        // Oznaczenia kolumn (górne)
        for (let x = 0; x < boardWidth; ++x) {
            if (x % 2 === 0) {
                board += "<td><label>" + String.fromCharCode(97 + x/2) + "</label></td>";
            } else {
                board += "<td></td>";
            }
        }

        // Zamknięcie wiersza z oznaczeniami pól
        board += "</tr>";

        
        // Numerowanie wierszy z lewej strony
        for (let y = boardHeight - 1; y >= 0; --y) {
            // Oznaczenia tylko dla wierszy parzystych (kwadratów)
            if (y % 2 == 0) {
                board += "<tr><td><label>" + (y/2) + "</label></td>";
                
            

            for (let x = 0; x < boardWidth-1; ++x) {
                if (x % 2 == 0) {
                    board +=  '<td class="square"> <div class= "square" data-x ="' + x +'" data-y="' + y + '">';
                } else {
                    board += '<td class="fenceCol"><div class="fenceCol" data-x ="' + x +'" data-y="' + y +  '">';
                }

                //Dodanie pionów graczy - póki co zakomentowane, żeby nie przeszkadzało.
                 if (state.player1[0] === x && state.player1[1] === y) {
                     board += '<div id="white-pawn"></div>';
                 }
                 if (state.player2[0] === x && state.player2[1] === y) {
                     board += '<div id="black-pawn"></div>';
                 }

                board += "</div></td>";
            }
            } else if(!(y === boardHeight - 1)){
                board += "<tr class = 'fenceRow'<td></td>";
                for (x = 0; x <= boardHeight/2-1; ++x) {
                    board += "<td></td>";
                    board += '<td class="fenceRow"><div class="fenceRow" data-x ="' + x +'" data-y="' + y +  '">';
                }
                board += "</tr>";
            }
        }

        // Zerowanie zmiennej pomocnicznej, dodanie pustego wiersza i oznaczeń dla pól (kolumn) na dole planszy
        board += "<tr><td></td>";

        // Numerowanie kolumn z dołu
        //for (let x = 0; x < boardWidth; ++x) {
            // Ustawienie oznaczeń tylko dla pól parzystych (kwadratów)
        //    if (x % 2 === 0) {
        //        board += "<td><label>" + String.fromCharCode(97 + x/2) + "</label></td>";
        //    } else {
        //        board += "<td></td>";
        //    }
        //}

        // Zamknięcie tabeli
        board += "</tr>";
        board += "</table>";

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
        const pawn = $("#" + (player === "player1" ? "white" : "black") + "-pawn");
        const pawnX = state[player][0];
        const pawnY = state[player][1];
        const moves = logicOfGame.generateMoves(state, player);
        let fieldsList = "";
        console.log(moves)
        for (let i = 0; i < moves.length; ++i) {
            const field = $(".square-placeholder[data-x=" + moves[i][0] + "][data-y=" + moves[i][1] + "]");
            console.log(field)
            if (field.length > 0 ) {
                fieldsList += (fieldsList.length > 0 ? ", " : "") + ".square-placeholder[data-x=" + moves[i][0] + "][data-y=" + moves[i][1] + "]";
            console.log(fieldsList)
            }
        }
        const fields = $(fieldsList);
        console.log(fields)
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
            accept: "#white-pawn, #black-pawn",
            scope: "fields",
            drop(event, ui) {
                ui.draggable.draggable("destroy");
                ui.draggable.appendTo(this);
                fields.droppable("destroy");
                cb([parseInt(ui.draggable.parent().attr("data-x")), parseInt(ui.draggable.parent().attr("data-y"))]);
            },
            over() {
                $(this).addClass("highlighted2");
            },
            out() {
                $(this).removeClass("highlighted2");
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
        return (player === "player1" ? "B" : "C") + String.fromCharCode(97 + move[0]) + (move[1] + 1);
    },
    /**
     * Funkcja zwraca czytelny dla człowieka opis wygranego gracza.
     */
    getReadableWinnerName(state, player) {
        return player === "player1" ? "Czarny" : "Biały";
    },
};