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
