const boardWidth = 9 * 2;
const boardHeight = 9 * 2;

const logicOfGame = {
    /**
     * Generuje stan początkowy gry.
     */
    generateInitialState() {
        return {
            player1: [8, 0], // Pozycja startowa gracza 1
            player2: [8, 16], // Pozycja startowa gracza 2
            player1fences: 10, // Ilość płotków jaką może postawić gracz 1
            player2fences: 10, // Ilość płotków jaką może postawić gracz 2
            removed: [], // Tablica na postawione już płotki - trzeba zmienić nazwę
            fenceOne: [9, 8], // Pozycja jednego pojedyńczego płotka
        };
    },
    /**
     * Funkcja oceny, która ocenia z punktu widzenia wskazanego gracza.
     */
    evaluateState(state, player) {
        return 1;
    },

    /**
     * Funkcja generująca możliwe ruchy z wskazanego stanu dla gracza.
     */
    generateMoves(state, player) {

        // Podstawowe ruchy
        const offsets = [
            [0, 2],
            [0, -2],
            [2, 0],
            [-2, 0],
        ];

        const fences = []; // Tablica na płotki
        const moves = []; // Tablica na ruchy graczy

        // BoardHeight i BoardWidth są równe 18, płotki są aktualnie zrobione tak, że "data-x" i "data-y" nie przekraczają wartości 16 (sprawdziłem używając opcji "zbadaj element" w przeglądarce)
        // dlatego też w pętlach dałem do tych zmiennych -2
        for (let x = 0; x <= boardHeight - 2; ++x) {
            for (let y = boardWidth - 2; y >= 0; --y) {
                if ((x % 2 != 0) || (y % 2 != 0)) {
                    fences.push([x, y]);
                }
            }
        }

        const enemy = player === "player1" ? "player2" : "player1";
        const fence1 = state.fenceOne;

        for (let i = 0; i < offsets.length; ++i) {
            const x = state[player][0] + offsets[i][0];
            const y = state[player][1] + offsets[i][1];

            // Dodanie tylko możliwych 
            if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight) {
                if (!(x === state[enemy][0] && y === state[enemy][1])) {

                    moves.push([x, y]);

                    //Usunięcie ruchu z tablicy jeśli pomiędzy aktualną pozycją pionka, a kolejnym ruchem znajduje się płotek
                    if (state[player][0] == x && state[player][1] + 2 == y) {
                        if (x / 2 == fence1[0] && y - 1 == fence1[1]) {
                            moves.pop([x, y]);
                        }
                    }

                    if (state[player][0] == x && state[player][1] - 2 == y) {
                        if (x / 2 == fence1[0] && y + 1 == fence1[1]) {
                            moves.pop([x, y]);
                        }
                    }

                    if (state[player][0] + 2 == x && state[player][1] == y) {
                        if (x - 1 == fence1[0] && y == fence1[1]) {
                            moves.pop([x, y]);
                        }
                    }

                    if (state[player][0] - 2 == x && state[player][1] == y) {
                        if (x + 1 == fence1[0] && y == fence1[1]) {
                            moves.pop([x, y]);
                        }
                    }

                } else {
                    // Tworzenie przeskoku nad przeciwnikiem
                    for (let i = 0; i < offsets.length; ++i) {
                        const x = state[enemy][0] + offsets[i][0];
                        const y = state[enemy][1] + offsets[i][1];
                        // Dodanie tylko możliwych 
                        if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight) {
                            if (!(x === state[player][0] && y === state[player][1])) {
                                moves.push([x, y]);
                                
                                //Usunięcie ruchu z tablicy jeśli pomiędzy aktualną pozycją pionka, a kolejnym ruchem znajduje się płotek
                                if (state[enemy][0] == x && state[enemy][1] + 2 == y) {
                                    if (x / 2 == fence1[0] && y - 1 == fence1[1]) {
                                        moves.pop([x, y]);
                                    }
                                }

                                if (state[enemy][0] == x && state[enemy][1] - 2 == y) {
                                    if (x / 2 == fence1[0] && y + 1 == fence1[1]) {
                                        moves.pop([x, y]);
                                    }
                                }

                                if (state[enemy][0] + 2 == x && state[enemy][1] == y) {
                                    if (x - 1 == fence1[0] && y == fence1[1]) {
                                        moves.pop([x, y]);
                                    }
                                }

                                if (state[enemy][0] - 2 == x && state[enemy][1] == y) {
                                    if (x + 1 == fence1[0] && y == fence1[1]) {
                                        moves.pop([x, y]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return moves;
    },
    /**
     * Funkcja generuje stan po wykonaniu wskazanego ruchu.
     */
    generateStateAfterMove(previousState, player, move) {
        const state = {
            player1: [...previousState.player1],
            player2: [...previousState.player2],
            fenceOne: [...previousState.fenceOne],
            removed: [...previousState.removed],
        };
        //state.removed.push(state[player]);
        state[player] = move;
        return state;
    },
    /**
     * Funkcja sprawdza czy stan jest terminalny, tzn. koniec gry.
     */
    isStateTerminal(state, player) {
        // Sprawdzenie czy pionek jest po drugiej stronie
        let end = player === "player1" ? 16 : 0;
        return state[player][1] === end;
    },
    /**
     * Funkcja generująca unikalny klucz dla wskazanego stanu.
     */
    generateUniqueKey: undefined,
};

const players = [];
