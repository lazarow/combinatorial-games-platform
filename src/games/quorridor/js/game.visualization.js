const visualizationOfGame = {
    /**
     * Funkcja rysuje planszę do gry w wskazanym kontenerze (720 pikseli szerokości).
     * Po zakończeniu rysowania należy wykonać funkcję `cb`.
     */
    drawState(state, player, move, container, cb) {
        debug =1
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
        /*
        for (let x = 0; x < boardWidth-1; ++x) {
            if (x % 2 === 0) {
                board += '<td class="even"><label>' + String.fromCharCode(97 + x / 2) + '</label></td>';
            } else {
                board += '<td class="odd"></td>';
            }
        }
        */
        // Zamknięcie wiersza z oznaczeniami pól
        board += "</tr>";

        // Numerowanie wierszy z lewej strony
        for (let y = boardHeight - 1; y >= 0; --y) {
            
            // Oznaczenia tylko dla wierszy parzystych (kwadratów)
            if (y % 2 == 0) {
                board += '<tr class="even"><td><label>' + (y / 2 + 1) + '</label></td>';

                // Wiersze z polami pionków na przemiennie z płotkami wertykalnymi
                for (let x = 0; x < boardWidth - 1; ++x) {
                    
                    const isOccupied = state.occupied.some(([occupiedX, occupiedY]) => x === occupiedX && y === occupiedY);
                    if (x % 2 == 0) {
                        board += '<td class="even"> <div class= "square" data-x ="' + x + '" data-y="' + y +   '">';
                    } else {
                        if(!(y==0))
                            board += '<td class="odd"><div class="fence vertical '+(isOccupied ? "placed":"" )+'" data-x ="' + x + '" data-y="' + y  + '">';
                        else
                            board += '<td class="odd"><div>'
                    }
                    //dodanie pionków
                    if (state.player1[0] === x && state.player1[1] === y)
                        board += '<div id="whitepawn">';

                    if (state.player2[0] === x && state.player2[1] === y)
                        board += '<div id="blackpawn">';
                    
                    board += "</div></td>";
                }
                // Wstawienie płotków horyzontalnych pomiędzy wierszami
            } else if (!(y === boardHeight - 1)) {
                board += "<tr class = 'odd'<td></td>";
                for (x = 0; x <= boardHeight-1 ; x+=2) {
                    
                    const isOccupied = state.occupied.some(([occupiedX, occupiedY]) => x === occupiedX && y === occupiedY);
                    board += '<td class="odd"></td>';
                    board += '<td class="even"><div class="fence horizontal '+(isOccupied ? "placed":"" )+'" data-x="' + x + '" data-y="' + y  + '">';
                }
                board += "</tr>";
            }
        }

        // Zerowanie zmiennej pomocnicznej, dodanie pustego wiersza i oznaczeń dla pól (kolumn) na dole planszy
        board += "<tr><td></td>";

        // Numerowanie kolumn z dołu
        for (let x = 0; x < boardWidth; ++x) {
        // Ustawienie oznaczeń tylko dla pól parzystych (kwadratów)
            if (x % 2 === 0) {
                board += "<td><label>" + String.fromCharCode(97 + x/2) + "</label></td>";
            } else {
                board += "<td></td>";
            }
        }

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
        const pawn = $("#" + (player === "player1" ? "white" : "black") + "pawn");
        const pawnX = state[player][0];
        const pawnY = state[player][1];
        // Wygenerowanie możliwych ruchów
        const moves = logicOfGame.generateMoves(state, player);
        

        let fieldsList = "";
        let i=0;
        // Utworzenie listy pól, na które można przesunąć pionek
        //zakłada że ruchy pionków są pierwsze
        while((moves[i][0]%2===0&&moves[i][1]%2===0)) {
            const field = $(".square[data-x=" + moves[i][0] + "][data-y=" + moves[i][1] + "]");
            if (field.length > 0 && field.is(":empty")) {
                fieldsList +=
                    (fieldsList.length > 0 ? ", " : "") +
                    ".square[data-x=" + moves[i][0] +
                    "][data-y=" + moves[i][1] + "]";
            }
            i++;
            if(moves[i]===undefined)
                break;
        }
        // Utworzenie listy płotków, na które można postawić
        let fencelist = "";
        for (i; i<moves.length;i++){
            let type = ".fence".concat( moves[i][1]%2===0?".vertical":".horizontal");
            /*
            let type
            if(moves[i][1]%2===0){
                 type = ".fence"+ ".vertical";
            }else{
                 type = ".fence"+ ".horizontal";
            }*/
            const fence = $( type +"[data-x=" + moves[i][0] + "][data-y=" + moves[i][1] + "]")
            if (fence.length > 0)
                fencelist +=
                (fencelist.length > 0 ? ", " : "") +
                type+"[data-x=" + moves[i][0] +
                "][data-y=" + moves[i][1] + "]";
        }

        // Pobranie referencji do pól, na które można przesunąć pionek
        const fields = $(fieldsList);
        const blockades = $(fencelist);
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
            accept: "#whitepawn, #blackpawn",
            scope: "fields",
            drop(event, ui) {
                ui.draggable.appendTo(this);
                cb([parseInt(ui.draggable.parent().attr("data-x")), parseInt(ui.draggable.parent().attr("data-y"))]);
            },
            over() {
                $(this).addClass("highlighted2");
            },
            out() {
                $(this).removeClass("highlighted2");
            },
        });
        //dodanie interakcji do płotków
        blockades.on({
            mouseenter(){
                $(this).addClass("hover");
            },
            mouseleave(){
                $(this).removeClass("hover");
            },
            click(){
                $(this).addClass("placed");
                $(this).removeClass("hover");
                cb([parseInt($(this).attr("data-x")), parseInt($(this).attr("data-y"))]);

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

        if(move[0]%2===0&&move[1]%2===0)
            return (player === "player1" ? "B " : "C ") + "move: " +  String.fromCharCode(97 + move[0]/2) + ((move[1]/2)+1);
        else
            return (player === "player1" ? "B " : "C ") + "fence: "+ (move[1]%2 === 0 ? "V" : "H")+ String.fromCharCode(97 + Math.floor(move[0]/2 )) + (Math.ceil((move[1]/2)))
    },
    /**
     * Funkcja zwraca czytelny dla człowieka opis wygranego gracza.
     */
    getReadableWinnerName(state, player) {
        return player === "player2" ? "Biały" : "Czarny";
    },
};
