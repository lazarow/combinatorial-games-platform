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
           gracz powinien móc poruszać się po polach parzystych, natomiast pola o kolumnach i wierszach nieparzystych oznaczają pola, gdzie może zostać postawiony płotek i
           gracz nie może się na takim polu znaleźć 
        */

        // Oznaczenia kolumn (górne)
        for (let x = 0; x < boardWidth; ++x) {
            if (x % 2 === 0) {
                board += "<td><label>" + String.fromCharCode(97 + x / 2) + "</label></td>";
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
                board += "<tr><td><label>" + (y / 2 + 1) + "</label></td>";

                // Wiersze z polami pionków na przemiennie z płotkami wertykalnymi
                for (let x = 0; x < boardWidth - 1; ++x) {
                    if (x % 2 == 0) {
                        const isRemoved = state.removed.some(([removedX, removedY]) => x === removedX && y === removedY);
                        board += '<td class="square"> <div class= "square" data-x ="' + x + '" data-y="' + y + '" data-available="' + (isRemoved ? "false" : "true") + '">';
                    } else {
                        // W wierszu poniżej dodałem "data-available = true", ponieważ w pewnym momenc
                        board += '<td class="fenceCol"><div class="fenceCol" data-x ="' + x + '" data-y="' + y + '">';
                    }
                    //dodanie pionków
                    if (state.player1[0] === x && state.player1[1] === y)
                        board += '<div id="white-pawn"></div>';

                    if (state.player2[0] === x && state.player2[1] === y)
                        board += '<div id="black-pawn"></div>';

                    board += "</div></td>";
                }
                // Wstawienie płotków horyzontalnych pomiędzy wierszami
            } else if (!(y === boardHeight - 1)) {
                board += "<tr class = 'fenceRow'<td></td>";
                for (x = 0; x <= boardHeight-1 ; x+=2) {
                    board += "<td></td>";
                    board += '<td class="fenceRow"><div class="fenceRow" data-x="' + x + '" data-y="' + y + '">';
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
        // Pobranie referencji do pionka gracza
        const pawn = $("#" + (player === "player1" ? "white" : "black") + "-pawn");
        const pawnX = state[player][0];
        const pawnY = state[player][1];
        // Wygenerowanie możliwych ruchów
        const temp = logicOfGame.generateMoves(state, player);
        
        const moves=temp[0];
        const fences=temp[1];

        console.log(fences)
        let fieldsList = "";
        // Utworzenie listy pól, na które można przesunąć pionek
        for (let i = 0; i < moves.length; ++i) {
            const field = $(".square[data-x=" + moves[i][0] + "][data-y=" + moves[i][1] + "]");
            if (field.length > 0 && field.attr("data-available") === "true" && field.is(":empty")) {
                fieldsList +=
                    (fieldsList.length > 0 ? ", " : "") +
                    ".square[data-x=" + moves[i][0] +
                    "][data-y=" + moves[i][1] + "]";
            }

        }

        let fencelist = "";
        for (let i=0; i<fences.length;i++){
            let type = fences[i][1]%2===0?".fenceCol":".fenceRow";
            
            const fence = $( type +"[data-x=" + fences[i][0] + "][data-y=" + fences[i][1] + "]")
            if (fence.length > 0)
                fencelist +=
                (fencelist.length > 0 ? ", " : "") +
                type+"[data-x=" + fences[i][0] +
                "][data-y=" + fences[i][1] + "]";
        }

        // Pobranie referencji do pól, na które można przesunąć pionek
        const fields = $(fieldsList);
        const blockades = $(fencelist);

        console.log(fields)
        console.log(blockades)
        // Ustawienie pionka jako przesuwalnego
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



        // Ustawienie pól jako miejsca, na które można przesunąć pionek
        fields.droppable({
            accept: "#white-pawn, #black-pawn",
            scope: "fields",
            drop(event, ui) {
                ui.draggable.appendTo(this);
                ui.draggable.css("left", 0);
                cb([parseInt(ui.draggable.parent().attr("data-x")), parseInt(ui.draggable.parent().attr("data-y"))]);
            },
            over() {
                $(this).addClass("highlighted2");
            },
            out() {
                $(this).removeClass("highlighted2");
            },
        });

        blockades.on({
            mouseenter(){
              $(this).addClass("hover");
              console.log("lol");
            },
            mouseleave(){
                $(this).removeClass("hover");
            },
            click(event, ui){
                $(this).addClass("placed");
                
                $(this).removeClass("hover");
                
                ui.on.appendTo(this);
                
                ui.on.css("left", 0);
                cb([parseInt(ui.on.parent().attr("data-x")), parseInt(ui.on.parent().attr("data-y"))]);
              console.log("lel");
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
        return player === "player1" ? "Biały" : "Czarny";
    },
};