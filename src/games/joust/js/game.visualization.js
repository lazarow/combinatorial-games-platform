const visualizationOfGame = {
    drawState(state, player, move, container, cb) {
        let board = '<table class="board">';
        board += "<tr><td></td>";
        for (x = 0; x < boardWidth; ++x) {
            board += "<td><label>" + String.fromCharCode(97 + x);
            +"</label></td>";
        }
        board += "</tr>";
        for (y = boardHeight - 1; y >= 0; --y) {
            board += "<tr><td><label>" + (y + 1) + "</label></td>";
            for (x = 0; x < boardWidth; ++x) {
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
                    board += '<div id="white-pawn"></div>';
                }
                if (state.player2[0] === x && state.player2[1] === y) {
                    board += '<div id="black-pawn"></div>';
                }
                board += "</div></td>";
            }
            board += "<td><label>" + (y + 1) + "</label></td>";
            board += "</tr>";
        }
        board += "<tr><td></td>";
        for (x = 0; x < boardWidth; ++x) {
            board += "<td><label>" + String.fromCharCode(97 + x);
            +"</label></td>";
        }
        board += "</tr>";
        board += "</table>";
        container.innerHTML = board;
        cb();
    },
    handleHumanTurn(state, player, cb) {
        const pawn = $("#" + (player === "player1" ? "white" : "black") + "-pawn");
        const pawnX = state[player][0];
        const pawnY = state[player][1];
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
            accept: "#white-pawn, #black-pawn",
            scope: "fields",
            drop(event, ui) {
                ui.draggable.parent().attr("data-available", "false");
                ui.draggable.draggable("destroy");
                ui.draggable.appendTo(this);
                ui.draggable.css("top", 0);
                ui.draggable.css("left", 0);
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
    getTruePlayerName(player) {
        if (player === "player1") return "Biały";
        if (player === "player2") return "Czarny";
    },
    getReadableMoveDescription(state, player, move) {
        return (player === "player1" ? "B" : "C") + String.fromCharCode(97 + move[0]) + (move[1] + 1);
    },
    getReadableWinnerName(state, player) {
        return player === "player1" ? "Czarny" : "Biały";
    },
};
