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
            removed: [], // Tablica na postawione już płotki
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

        //wiersze parzyste posiadają 8 płotków pionowych natomiast wiersze nie parzyste posiadają 9 płotków poziomych
        for (let y = 0; y <= boardHeight-2; y++) {
            if(y%2===0){
                //wiersz parzysty 
                for (let x =1; x <= boardHeight-3; x+=2) 
                    fences.push([x,y]);
            }else{
                //wiersz nieparzysty
                for (let x =0; x <= boardHeight-2; x+=2) 
                    fences.push([x,y]);
            }
        }
        console.log(fences);
        const enemy = player === "player1" ? "player2" : "player1";

        for (let i = 0; i < offsets.length; ++i) {
            const x = state[player][0] + offsets[i][0];
            const y = state[player][1] + offsets[i][1];
            // Dodanie tylko możliwych 
            if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight) {
                if (!(x === state[enemy][0] && y === state[enemy][1])) {
                    moves.push([x, y]);
                } else {
                    // Tworzenie przeskoku nad przeciwnikiem
                    for (let i = 0; i < offsets.length; ++i) {
                        const x = state[enemy][0] + offsets[i][0];
                        const y = state[enemy][1] + offsets[i][1];
                        // Dodanie tylko możliwych 
                        if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight)
                            if (!(x === state[player][0] && y === state[player][1]))
                                moves.push([x, y]);
                    }
                }
            }
        }
        return [moves,fences];
    },
    /**
     * Funkcja generuje stan po wykonaniu wskazanego ruchu.
     */
    generateStateAfterMove(previousState, player, move) {
        const state = {
            player1: [...previousState.player1],
            player2: [...previousState.player2],
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
