var currentPiece, startPosition = { x: -1, y: -1 }, destinationPosition = { x: -1, y: -1 };
const visualizationOfGame = {
    drawState(state, player, move, container, cb) {
        let board = '<table class="board">';
        board += "<tr><td></td>";
        for (let x = 0; x < boardWidth; ++x) {
            board += "<td><label>" + String.fromCharCode(97 + x) + "</label></td>";
        }
        board += "</tr>";
        for (let y = boardHeight - 1; y >= 0; --y) {
            board += "<tr><td><label>" + (y + 1) + "</label></td>";
            for (let x = 0; x < boardWidth; ++x) {
                const isHighlighted = state.highlighted.some((coord, index) => {
                    return index % 2 === 0 && coord === x && state.highlighted[index + 1] === y;
                });
                board +=
                    '<td class="square' + (x === Math.floor(boardWidth / 2) && y === Math.floor(boardHeight / 2) ? ' center' : '') + '"><div class="square-placeholder" data-x="' +
                    x +
                    '" data-y="' +
                    y +
                    '" data-available="' +
                    (isHighlighted ? "false" : "true") +
                    '">';
                    if (state.player1[0] === x && state.player1[1] === y) board += '<div class="black-pawn" id="player1_0"></div>';
                    if (state.player1[2] === x && state.player1[3] === y) board += '<div class="black-pawn" id="player1_1"></div>';
                    if (state.player1[4] === x && state.player1[5] === y) board += '<div class="black-pawn" id="player1_2"></div>';
                    
                    
                    if (state.player2[0] === x && state.player2[1] === y) board += '<div class="white-pawn" id="player2_0"></div>';
                    if (state.player2[2] === x && state.player2[3] === y) board += '<div class="white-pawn" id="player2_1"></div>';
                    if (state.player2[4] === x && state.player2[5] === y) board += '<div class="white-pawn" id="player2_2"></div>';
                    
                board += "</div></td>";
            }
            board += "<td><label>" + (y + 1) + "</label></td>";
            board += "</tr>";
        }
        board += "<tr><td></td>";
        for (let x = 0; x < boardWidth; ++x) {
            board += "<td><label>" + String.fromCharCode(97 + x) + "</label></td>";
        }
        board += "</tr>";
        board += "</table>";
        container.innerHTML = board;
        cb();
    },
    handleHumanTurn(state, player, cb) {
        state.hightlighted = [];
        const moves = logicOfGame.generateMoves(state, player);
        const pawns = [
            $("#" + player + "_0"),
            $("#" + player + "_1"),
            $("#" + player + "_2")
        ];
        for (let [pawn, pawnEl] of pawns.entries()) {
            pawnEl.draggable({
                scope: "fields",
                revert: "invalid",
                revertDuration: 0,
                refreshPositions: true,
                start(event, ui) {
                    startPosition = {
                        x: parseInt(ui.helper.parent().attr("data-x")),
                        y: parseInt(ui.helper.parent().attr("data-y"))
                    };
                    let fields = moves.filter(move => move[0] === pawn).map(([, x, y]) => {
                        return $(".square-placeholder[data-x=" + x + "][data-y=" + y + "]")
                    })
                    fields.forEach(field => {
                        if (field.data('x') === 2
                            && field.data('y') === 2
                            && pawn === 2
                        ) {
                           
                        }
                        else field.addClass("highlighted")
                    });
                    fields.forEach(field => {
                        field.droppable({
                            accept: pawnEl,
                            scope: "fields",
                            drop(event, ui) {
                                destinationPosition = {
                                    x: parseInt($(this).attr("data-x")),
                                    y: parseInt($(this).attr("data-y"))
                                }
                                ui.draggable.appendTo(this);
                                ui.draggable.css("top", 0);
                                ui.draggable.css("left", 0);
                                fields.forEach(field => field.droppable("destroy"));
                                pawns.forEach(pawnEl => pawnEl.draggable("destroy"));
                                cb([pawn, parseInt(ui.draggable.parent().attr("data-x")), parseInt(ui.draggable.parent().attr("data-y"))]);
                            }
                        });
                    })
                },
                stop() {
                    let fields = moves.filter(move => move[0] === pawn).map(([, x, y]) => {
                        return $(".square-placeholder[data-x=" + x + "][data-y=" + y + "]")
                    })
                    const startingField = $(".square-placeholder[data-x=" + startPosition.x + "][data-y=" + startPosition.y + "]");
                    fields.forEach(field => {
                        field.removeClass("highlighted")
                    });
                }
            })
        }
    },
    getTruePlayerName(player) {
        if (player === "player1") return "Czarny";
        if (player === "player2") return "Biały";
    },
    getReadableMoveDescription(state, player, move) {
        return String.fromCharCode(97 + move[1]) + (move[2] + 1);
    },
    getReadableWinnerName(state, player) {
        return player === "player1" ? "Biały" : "Czarny";
    },
};