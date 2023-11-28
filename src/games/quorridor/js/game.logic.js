const boardWidth = 9*2;
const boardHeight = 9*2;

const logicOfGame = {
    /**
     * Generuje stan początkowy gry.
     */
    generateInitialState() { 
        return {
        player1: [8, 0],
        player2: [8, 16],
        removed: [],
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
        //podstawowe ruchy
        const offsets = [
            [ 0,  2],
            [ 0, -2],
            [ 2,  0],
            [-2,  0],
        ];
        const moves = [];
        const enemy = player==="player1"? "player2":"player1";

        for (let i = 0; i < offsets.length; ++i) {

            const x = state[player][0] + offsets[i][0];
            const y = state[player][1] + offsets[i][1];
            //dodanie tylko możliwych 
            if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight) {
                if (!(x===state[enemy][0]&&y===state[enemy][1])) {
                    moves.push([x, y]);

                }else{
                    //tworzenie przeskoku nad przeciwnikiem
                    for (let i = 0; i < offsets.length; ++i){

                        const x = state[enemy][0] + offsets[i][0];
                        const y = state[enemy][1] + offsets[i][1];
                        //dodanie tylko możliwych 
                        if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight) 
                            if (!(x===state[player][0]&&y===state[player][1])) 
                                moves.push([x, y]);          
        }   }   }   }
        
        return moves;
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
        //sprawdzenie czy pionek jest po drugiej stronie
        let end= player==="player1"? 16 : 0;
        return state[player][1]===end;
    },
    /**
     * Funkcja generująca unikalny klucz dla wskazanego stanu.
     */
    generateUniqueKey: undefined,
};

const players = [];
